import { NextResponse } from "next/server";
import { buildDeck } from "@/lib/export/pptx";
import { anonymizeResults } from "@/lib/anonymize";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const results = anonymizeResults(body.results, {
      clientName: body.clientName,
    });
    const buffer = await buildDeck({
      opportunityName: body.opportunityName,
      results,
    });
    const filename = `${(body.opportunityName ?? "pursuit").replace(/\s+/g, "-")}-deck.pptx`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[export/pptx] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
