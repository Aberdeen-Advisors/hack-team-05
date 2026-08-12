import { NextResponse } from "next/server";
import { retrieve } from "@/lib/armory/retrieve";
import type { DocType } from "@/lib/armory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/armory/search?q=…&k=6&docType=case-study */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const k = Number(searchParams.get("k") ?? 6);
  const docType = searchParams.get("docType") as DocType | null;
  if (!q) {
    return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });
  }
  try {
    const hits = await retrieve(q, { k, docType: docType ?? undefined });
    return NextResponse.json({ ok: true, hits });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
