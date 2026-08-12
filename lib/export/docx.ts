import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { brand } from "@/lib/branding";
import type {
  OpportunityBrief,
  ProposalDraft,
  WinStrategy,
  EvidenceMap,
  SolutionBlueprint,
} from "@/lib/engines/schemas";

type Results = {
  understand?: OpportunityBrief;
  strategize?: WinStrategy;
  match?: EvidenceMap;
  design?: SolutionBlueprint;
  create?: ProposalDraft;
};

const BLUE = brand.colors.aberdeenBlue.replace("#", "");
const TEAL = brand.colors.verdigris.replace("#", "");
const ONYX = brand.colors.onyx.replace("#", "");

const H1 = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: BLUE,
        font: "Poppins",
        size: 32,
      }),
    ],
  });

const H2 = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [
      new TextRun({
        text,
        color: TEAL,
        font: "Poppins",
        size: 22,
      }),
    ],
  });

const P = (text: string) =>
  new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({
        text,
        font: "Poppins",
        color: ONYX,
        size: 22,
      }),
    ],
  });

const Bullet = (text: string) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        font: "Poppins",
        color: ONYX,
        size: 22,
      }),
    ],
  });

/**
 * Build the proposal starter as a real .docx.
 * Sections: Cover / Executive Summary / Our Understanding / Proposed Approach /
 * Relevant Experience / 7-Day Pursuit Plan / Why Aberdeen / Requirements Matrix appendix.
 */
export async function buildProposal(args: {
  opportunityName?: string;
  results: Results;
}): Promise<Buffer> {
  const { opportunityName, results } = args;

  const children: Paragraph[] | (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: brand.productName.toUpperCase(),
          color: TEAL,
          font: "Poppins",
          size: 28,
          bold: true,
          characterSpacing: 40,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: opportunityName ?? "Proposal Starter",
          color: BLUE,
          font: "Poppins",
          size: 56,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text: `Prepared by ${brand.companyName}`,
          color: ONYX,
          font: "Poppins",
          size: 20,
          italics: true,
        }),
      ],
    }),
  ];

  const push = (...items: (Paragraph | Table)[]) =>
    children.push(...(items as never[]));

  // Executive Summary
  push(H1("Executive Summary"));
  if (results.create?.draftSections?.executiveSummary) {
    for (const para of splitParagraphs(
      results.create.draftSections.executiveSummary,
    )) {
      push(P(para));
    }
  }

  // Our Understanding
  push(H1("Our Understanding of the Challenge"));
  if (results.create?.draftSections?.ourUnderstanding) {
    for (const para of splitParagraphs(
      results.create.draftSections.ourUnderstanding,
    )) {
      push(P(para));
    }
  }
  if (results.understand) {
    push(H2("Client objectives"));
    for (const o of results.understand.objectives ?? []) push(Bullet(o));
    push(H2("Key pain points"));
    for (const p of results.understand.painPoints ?? []) push(Bullet(p));
  }

  // Proposed Approach
  push(H1("Proposed Approach"));
  if (results.create?.draftSections?.proposedApproach) {
    for (const para of splitParagraphs(
      results.create.draftSections.proposedApproach,
    )) {
      push(P(para));
    }
  }
  if (results.design?.workstreams) {
    push(H2("Workstreams"));
    for (const w of results.design.workstreams) {
      push(H2(w.name));
      push(P(w.objective));
      for (const a of w.keyActivities ?? []) push(Bullet(a));
    }
  }

  // Relevant Experience
  if (results.match?.matches?.length) {
    push(H1("Relevant Experience"));
    for (const m of results.match.matches) {
      push(H2(`${m.docName} — ${m.clientDescriptor}`));
      push(P(m.whyRelevant));
      if (m.outcome) push(P(`Outcome: ${m.outcome}`));
    }
  }

  // Team / staffing model
  if (results.design?.staffingModel?.length) {
    push(H1("Team"));
    for (const s of results.design.staffingModel) {
      push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${s.role} — ${s.allocationPct}% · `,
              bold: true,
              color: BLUE,
              font: "Poppins",
              size: 22,
            }),
            new TextRun({
              text: s.responsibility,
              color: ONYX,
              font: "Poppins",
              size: 22,
            }),
          ],
        }),
      );
    }
  }

  // Why Aberdeen
  if (results.create?.whyAberdeen) {
    push(H1("Why Aberdeen"));
    for (const para of splitParagraphs(results.create.whyAberdeen)) {
      push(P(para));
    }
  }

  // Requirements matrix appendix
  if (results.understand?.requirements?.length) {
    push(H1("Appendix A — Requirements Matrix"));
    const headers = [
      "ID",
      "Requirement",
      "Category",
      "Mandatory",
      "Response Action",
    ];
    const colWidths = [8, 44, 12, 12, 24]; // percentages summing to 100
    const rows: TableRow[] = [
      new TableRow({
        children: headers.map(
          (h, idx) =>
            new TableCell({
              width: { size: colWidths[idx], type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      color: "FFFFFF",
                      font: "Poppins",
                      size: 20,
                    }),
                  ],
                }),
              ],
              shading: { fill: BLUE },
            }),
        ),
      }),
      ...results.understand.requirements.map(
        (r) =>
          new TableRow({
            children: [
              r.id,
              r.requirement,
              r.category,
              r.mandatory ? "Yes" : "No",
              r.responseAction ?? "—",
            ].map(
              (v, idx) =>
                new TableCell({
                  width: { size: colWidths[idx], type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: v,
                          font: "Poppins",
                          size: 20,
                          color: ONYX,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    ];
    push(
      new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
    );

    // Legend
    push(H2("Response Action — legend"));
    const legend: [string, string][] = [
      [
        "Address",
        "Explain how Aberdeen would meet this requirement; no artifact needed yet.",
      ],
      [
        "Provide Information",
        "Supply the specific requested information in the proposal response.",
      ],
      [
        "Provide Attachment",
        "A specific form, document, or pricing file must accompany the proposal.",
      ],
      [
        "Acknowledge / Confirm",
        "Explicitly confirm Aberdeen can comply with the condition.",
      ],
      [
        "Deliverable if Awarded",
        "Something Aberdeen would actually produce during the engagement.",
      ],
    ];
    for (const [action, meaning] of legend) {
      push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${action}: `,
              bold: true,
              color: BLUE,
              font: "Poppins",
              size: 22,
            }),
            new TextRun({
              text: meaning,
              color: ONYX,
              font: "Poppins",
              size: 22,
            }),
          ],
        }),
      );
    }
  }

  const doc = new Document({
    creator: brand.companyName,
    title: `${brand.companyName} — ${opportunityName ?? "Proposal Starter"}`,
    styles: {
      default: {
        document: {
          run: { font: "Poppins", size: 22, color: ONYX },
        },
      },
    },
    sections: [{ children: children as (Paragraph | Table)[] }],
  });

  return await Packer.toBuffer(doc);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
