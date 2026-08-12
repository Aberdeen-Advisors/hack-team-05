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
      id: newPursuitId(),
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
