import { NextResponse } from "next/server";
import {
  loadCachedResults,
  loadPursuit,
  saveEngineResult,
} from "@/lib/pursuit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/pursuit/[id]/results
 * Body: { engine: 'understand' | ... , result: <full engine result object> }
 * Persists a user-edited engine result over the cached copy. Called by the
 * workspace's inline editor after debounced blur.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const pursuit = await loadPursuit(id);
  if (!pursuit) {
    return NextResponse.json({ error: "pursuit not found" }, { status: 404 });
  }

  let body: { engine?: string; result?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { engine, result } = body;
  const validEngines = [
    "understand",
    "strategize",
    "match",
    "design",
    "create",
  ];
  if (!engine || !validEngines.includes(engine)) {
    return NextResponse.json(
      { error: `engine must be one of ${validEngines.join(", ")}` },
      { status: 400 },
    );
  }
  if (result === undefined || result === null) {
    return NextResponse.json({ error: "result is required" }, { status: 400 });
  }

  try {
    await saveEngineResult(id, engine, result);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[pursuit.results.PATCH] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/**
 * GET /api/pursuit/[id]/results
 * Utility read endpoint (mostly for debugging / external tools). The SSE
 * stream is the primary path for the workspace itself.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pursuit = await loadPursuit(id);
  if (!pursuit) {
    return NextResponse.json({ error: "pursuit not found" }, { status: 404 });
  }
  const results = await loadCachedResults(id);
  return NextResponse.json({ ok: true, id, results });
}
