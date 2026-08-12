import { NextResponse } from "next/server";
import { loadPursuit } from "@/lib/pursuit/store";
import { orchestrate, type EngineEvent } from "@/lib/engines/orchestrate";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * GET /api/analyze/[id]/stream
 * Server-sent events stream: emits engine start / delta / done / error events.
 * The workspace page consumes this with EventSource.
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

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: EngineEvent | { type: "run.error"; error: string }) => {
        const chunk = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      };

      // Heartbeat every 20s so proxies don't close the stream idle.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          // stream closed; timer will be cleared below
        }
      }, 20000);

      try {
        await orchestrate(pursuit, send);
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
