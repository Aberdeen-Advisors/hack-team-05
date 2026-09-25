import { NextResponse } from "next/server";
import {
  loadPursuit,
  loadCachedResults,
  saveEngineResult,
  saveEngineSources,
  saveLease,
  markRunDone,
  type CachedResults,
} from "@/lib/pursuit/store";
import { orchestrate, type EngineEvent } from "@/lib/engines/orchestrate";
import type { EngineName, EngineSource } from "@/lib/engines/run";

export const runtime = "nodejs";
// Hobby-plan cap. A full run may exceed one invocation; that is fine - the
// lease + resume design lets the reconnecting client take over from the last
// completed engine instead of restarting. (On Pro, raise toward 800.)
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** How long one invocation owns the run before a reconnect may take over. */
// 290s: sized to fit inside Vercel Hobby's 300s function cap so the lease
// expires when (or slightly before) the invocation is killed. A larger value
// leaves the lease "active" on Upstash after the function dies, blocking the
// next reconnect from resuming work.
const LEASE_MS = 290_000;
const POLL_INTERVAL_MS = 3_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Bound an async operation so it can never hang the caller past `ms`.
 * On timeout the returned promise rejects and the underlying operation is
 * abandoned (best-effort; there's no cancellation for the fetch inside
 * Upstash's SDK). Used for cache writes so a transient Upstash outage
 * doesn't stall the SSE stream past Vercel's function timeout.
 */
function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race<T>([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

/**
 * GET /api/analyze/[id]/stream
 * SSE stream — replays cached engine results if present, then orchestrates
 * any missing engines. Full cache hits complete in milliseconds so the
 * workspace refreshes / bookmarks / screenshots don't re-burn LLM tokens.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pursuit = await loadPursuit(id);
  if (!pursuit) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const cached = await loadCachedResults(id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: EngineEvent | { type: "run.error"; error: string }) => {
        const chunk = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      };

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          // stream closed
        }
      }, 20000);

      try {
        // Replay any cached engines instantly. This handles page refreshes,
        // multi-tab, and screenshotting without re-running the LLM.
        const engines: EngineName[] = [
          "understand",
          "strategize",
          "match",
          "design",
          "create",
        ];
        const missing: EngineName[] = [];
        for (const engine of engines) {
          const r = (cached as Record<string, unknown>)[engine];
          if (r) {
            send({ type: "engine.start", engine });
            send({ type: "engine.done", engine, result: r });
            const src = cached.sources?.[engine];
            if (src) {
              send({
                type: "engine.sources",
                engine,
                sources: src as EngineSource[],
              });
            }
          } else {
            missing.push(engine);
          }
        }

        if (missing.length === 0 && cached.runDone) {
          send({ type: "run.done" });
        } else if (missing.length > 0 && cached.runDone) {
          // Inconsistent cache: runDone was set but an engine is missing —
          // race-condition damage from an earlier build. Ignore runDone and
          // resume the missing engine(s) so the pursuit self-heals.
          console.warn(
            `[stream] inconsistent cache for ${id} — runDone but missing:`,
            missing,
            "— resuming missing engines",
          );
          await runWithLease(id, pursuit, cached, send);
        } else if ((cached.leaseUntil ?? 0) > Date.now()) {
          // Another invocation owns the run (this is a reconnect / second
          // tab). Do NOT start a duplicate orchestration - poll the cache
          // and stream results as the owner writes them. If the owner's
          // lease expires with work still missing, take over.
          const seen = new Set<EngineName>(
            engines.filter((e) => (cached as Record<string, unknown>)[e]),
          );
          let latest: CachedResults = cached;
          const deadline = Date.now() + LEASE_MS;
          let finished = false;
          while (Date.now() < deadline) {
            await sleep(POLL_INTERVAL_MS);
            latest = await loadCachedResults(id);
            for (const engine of engines) {
              const r = (latest as Record<string, unknown>)[engine];
              if (r && !seen.has(engine)) {
                seen.add(engine);
                send({ type: "engine.start", engine });
                send({ type: "engine.done", engine, result: r });
                const src = latest.sources?.[engine];
                if (src) {
                  send({
                    type: "engine.sources",
                    engine,
                    sources: src as EngineSource[],
                  });
                }
              }
            }
            if (latest.runDone) {
              send({ type: "run.done" });
              finished = true;
              break;
            }
            if ((latest.leaseUntil ?? 0) <= Date.now()) break; // owner died
          }
          if (!finished && !latest.runDone) {
            // Take over: the owning invocation crashed. Resume from cache.
            await runWithLease(id, pursuit, latest, send);
          }
        } else {
          await runWithLease(id, pursuit, cached, send);
        }
      } catch (err) {
        send({
          type: "run.error",
          error: err instanceof Error ? err.message : String(err),
        });
        // This invocation is done with the run. Release the lease so the
        // next connection resumes from cache immediately instead of polling
        // for up to LEASE_MS waiting for a dead owner.
        try {
          await saveLease(id, 0);
        } catch (leaseErr) {
          console.error("[stream] lease release failed", leaseErr);
        }
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * Acquire the run lease, then orchestrate ONLY the engines missing from the
 * cache (completed ones are passed as `resume` so their cached results feed
 * downstream engines without re-running). Persists results/sources as they
 * complete and releases the lease at run.done.
 */
async function runWithLease(
  id: string,
  pursuit: NonNullable<Awaited<ReturnType<typeof loadPursuit>>>,
  cached: CachedResults,
  send: (event: EngineEvent | { type: "run.error"; error: string }) => void,
) {
  await withTimeout(saveLease(id, Date.now() + LEASE_MS), 8_000, "saveLease");

  /**
   * Cap every cache-write await at a few seconds. Upstash SDK retries
   * internally on transient failures (up to ~90s per call), and if a save
   * hangs while an engine is done, it can stall the whole SSE stream past
   * Vercel's 300s function cap. Losing a cache write is recoverable — the
   * next reconnect will re-run the missing engine — but blowing the function
   * timeout leaves everything half-done.
   */
  const CACHE_WRITE_TIMEOUT_MS = 6_000;

  const persistingSend = async (
    event: EngineEvent | { type: "run.error"; error: string },
  ) => {
    if (event.type === "engine.done") {
      withTimeout(
        saveEngineResult(id, event.engine, event.result),
        CACHE_WRITE_TIMEOUT_MS,
        `saveEngineResult:${event.engine}`,
      ).catch((err) => console.error("[stream] cache write failed", err));
    }
    if (event.type === "engine.sources") {
      withTimeout(
        saveEngineSources(id, event.engine, event.sources),
        CACHE_WRITE_TIMEOUT_MS,
        `saveEngineSources:${event.engine}`,
      ).catch((err) =>
        console.error("[stream] sources cache write failed", err),
      );
    }
    if (event.type === "run.done") {
      // Await run.done writes (short) so the flag is committed before the
      // client disconnects — but still bounded so a hung write doesn't
      // leave the stream open past the function cap.
      try {
        await withTimeout(markRunDone(id), CACHE_WRITE_TIMEOUT_MS, "markRunDone");
        await withTimeout(saveLease(id, 0), CACHE_WRITE_TIMEOUT_MS, "clearLease");
      } catch (err) {
        console.error("[stream] cache mark run.done failed", err);
      }
    }
    send(event);
  };

  const resume = {
    understand: cached.understand,
    strategize: cached.strategize,
    match: cached.match,
    design: cached.design,
    create: cached.create,
  } as Parameters<typeof orchestrate>[2];

  await orchestrate(pursuit, persistingSend, resume);
}
