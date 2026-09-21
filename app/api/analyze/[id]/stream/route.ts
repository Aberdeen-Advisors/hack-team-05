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
export const maxDuration = 800;
export const dynamic = "force-dynamic";

/** How long one invocation owns the run before a reconnect may take over. */
const LEASE_MS = 810_000;
const POLL_INTERVAL_MS = 3_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  await saveLease(id, Date.now() + LEASE_MS);

  const persistingSend = async (
    event: EngineEvent | { type: "run.error"; error: string },
  ) => {
    if (event.type === "engine.done") {
      try {
        await saveEngineResult(id, event.engine, event.result);
      } catch (err) {
        console.error("[stream] cache write failed", err);
      }
    }
    if (event.type === "engine.sources") {
      try {
        await saveEngineSources(id, event.engine, event.sources);
      } catch (err) {
        console.error("[stream] sources cache write failed", err);
      }
    }
    if (event.type === "run.done") {
      try {
        await markRunDone(id);
        await saveLease(id, 0);
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
