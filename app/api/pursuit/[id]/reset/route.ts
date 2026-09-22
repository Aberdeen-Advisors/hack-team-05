import { NextResponse } from "next/server";
import { Index } from "@upstash/vector";
import { loadPursuit } from "@/lib/pursuit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/pursuit/[id]/reset
 * Body: { engines?: string[] }  — engines to clear; omit for full reset.
 *
 * Clears cached engine results (and the runDone flag) so the next SSE
 * stream connection re-orchestrates from scratch. Preserves the pursuit
 * record itself (RFP text, opportunity name, client name).
 *
 * Useful when an engine result was clobbered by a previous race condition
 * or when you want to re-run against updated prompts / models.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pursuit = await loadPursuit(id);
  if (!pursuit) {
    return NextResponse.json({ error: "pursuit not found" }, { status: 404 });
  }

  let body: { engines?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body = full reset.
  }

  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    return NextResponse.json(
      { error: "UPSTASH_VECTOR_REST_* not configured" },
      { status: 500 },
    );
  }
  const index = new Index({ url, token });

  try {
    // Delete both the results record AND every per-engine retrieval record.
    const idsToDelete = [
      `pursuit-results:${id}`,
      `pursuit-retrieval:${id}:understand`,
      `pursuit-retrieval:${id}:strategize`,
      `pursuit-retrieval:${id}:match`,
      `pursuit-retrieval:${id}:design`,
      `pursuit-retrieval:${id}:create`,
    ];
    await index.delete(idsToDelete);
    return NextResponse.json({
      ok: true,
      cleared: idsToDelete,
      engines: body.engines ?? "all",
    });
  } catch (err) {
    console.error("[pursuit.reset] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
