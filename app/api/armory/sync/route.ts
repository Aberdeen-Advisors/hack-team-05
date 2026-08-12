import { NextResponse } from "next/server";
import { syncArmory } from "@/lib/armory/sync";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * POST /api/armory/sync
 * Runs a full SharePoint → Upstash Vector sync. Intended for manual invocation
 * and (stretch) a Vercel Cron trigger.
 */
export async function POST() {
  try {
    const result = await syncArmory({ kind: "sharepoint" });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[armory/sync] failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Allow GET for easy cron / browser trigger.
  return POST();
}
