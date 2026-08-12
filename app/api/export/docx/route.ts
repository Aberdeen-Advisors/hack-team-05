import { NextResponse } from "next/server";
import { buildProposal } from "@/lib/export/docx";
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
    const buffer = await buildProposal({
      opportunityName: body.opportunityName,
      results,
    });
    const filename = `${(body.opportunityName ?? "pursuit").replace(/\s+/g, "-")}-proposal.docx`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[export/docx] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
