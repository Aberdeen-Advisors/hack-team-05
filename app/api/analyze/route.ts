import { NextResponse } from "next/server";
import { parseRfp } from "@/lib/rfp/parse";
import {
  newPursuitId,
  savePursuit,
  type PursuitRecord,
} from "@/lib/pursuit/store";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze
 * Accepts multipart form: file (RFP), opportunityName?, clientName?
 * Parses the RFP, persists a pursuit record to /tmp, returns { pursuitId }.
 * The workspace page then opens an SSE stream at /api/analyze/[id]/stream to run the 5 engines.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "missing file field" },
        { status: 400 },
      );
    }
    const opportunityName = (form.get("opportunityName") as string) || undefined;
    const clientName = (form.get("clientName") as string) || undefined;

    const buffer = Buffer.from(await file.arrayBuffer());
    const rfp = await parseRfp(buffer, file.name);

    const record: PursuitRecord = {
      id: newPursuitId(opportunityName),
      createdAt: new Date().toISOString(),
      opportunityName,
      clientName,
      rfp,
    };
    await savePursuit(record);

    return NextResponse.json({
      pursuitId: record.id,
      charCount: rfp.charCount,
      jurisdiction: rfp.jurisdiction,
    });
  } catch (err) {
    console.error("[analyze] failed", err);
    const raw = err instanceof Error ? err.message : String(err);
    // Surface a user-actionable message for known transient backend failures.
    const isUpstashOutage =
      /unavailable|vector store backend/i.test(raw) ||
      /ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(raw);
    const message = isUpstashOutage
      ? "Our vector store (Upstash) is temporarily unavailable. Please try uploading again in a minute."
      : raw;
    return NextResponse.json(
      { error: message, transient: isUpstashOutage },
      { status: isUpstashOutage ? 503 : 500 },
    );
  }
}
