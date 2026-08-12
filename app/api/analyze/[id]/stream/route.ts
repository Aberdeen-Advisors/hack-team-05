import { NextResponse } from "next/server";
import {
  loadPursuit,
  loadCachedResults,
  saveEngineResult,
  markRunDone,
} from "@/lib/pursuit/store";
import { orchestrate, type EngineEvent } from "@/lib/engines/orchestrate";
import type { EngineName } from "@/lib/engines/run";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

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
          } else {
            missing.push(engine);
          }
        }

        if (missing.length === 0 && cached.runDone) {
          send({ type: "run.done" });
        } else {
          // Persist each engine result as it completes so subsequent loads
          // are cache hits.
          const persistingSend = async (
            event:
              | EngineEvent
              | { type: "run.error"; error: string },
          ) => {
            if (event.type === "engine.done") {
              try {
                await saveEngineResult(id, event.engine, event.result);
              } catch (err) {
                console.error("[stream] cache write failed", err);
              }
            }
            if (event.type === "run.done") {
              try {
                await markRunDone(id);
              } catch (err) {
                console.error("[stream] cache mark run.done failed", err);
              }
            }
            send(event);
          };

          await orchestrate(pursuit, persistingSend);
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
