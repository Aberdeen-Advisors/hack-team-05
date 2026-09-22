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
  ShadingType,
} from "docx";
import { brand } from "@/lib/branding";
import type {
  OpportunityBrief,
  ProposalDraft,
  WinStrategy,
  EvidenceMap,
  SolutionBlueprint,
} from "@/lib/engines/schemas";
import { loadSpine, needsInput, type SpineSection } from "./spine";

type Results = {
  understand?: OpportunityBrief;
  strategize?: WinStrategy;
  match?: EvidenceMap;
  design?: SolutionBlueprint;
  create?: ProposalDraft;
};

type Block = Paragraph | Table;

const BLUE = brand.colors.aberdeenBlue.replace("#", "");
const TEAL = brand.colors.verdigris.replace("#", "");
const ONYX = brand.colors.onyx.replace("#", "");
const JADE = brand.colors.jade.replace("#", "");

// ── Style primitives ────────────────────────────────────────────────

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

/** Italic muted line — used for section guidance from the spine markdown. */
const Guidance = (text: string) =>
  new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({
        text,
        italics: true,
        color: ONYX,
        font: "Poppins",
        size: 20,
      }),
    ],
  });

/**
 * [NEEDS INPUT] callout — a visually loud line so the reviewer catches every
 * gap. The bracket convention matches how the method prompts flag human-only
 * decisions elsewhere in the app.
 */
const NeedsInput = (what: string, owner: string) =>
  new Paragraph({
    spacing: { before: 100, after: 200 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "FEF3C7" },
    children: [
      new TextRun({
        text: "[NEEDS INPUT] ",
        bold: true,
        color: "92400E",
        font: "Poppins",
        size: 22,
      }),
      new TextRun({
        text: `${what} — `,
        color: ONYX,
        font: "Poppins",
        size: 22,
      }),
      new TextRun({
        text: owner,
        color: BLUE,
        italics: true,
        font: "Poppins",
        size: 22,
      }),
    ],
  });

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ── Cover page ─────────────────────────────────────────────────────

function coverBlocks(opportunityName: string | undefined): Block[] {
  return [
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
}

// ── Section builders — one per spine key ───────────────────────────
//
// Each returns the Block[] to emit under that spine section's H1 heading.
// A section may return an empty array; callers still emit the guidance
// line and a [NEEDS INPUT] placeholder if nothing populated.

type SectionBuilder = (
  results: Results,
  opportunityName: string | undefined,
) => Block[];

const BUILDERS: Record<string, SectionBuilder> = {
  // Keys match slugs from parseSpineMarkdown for the exact section titles.
  // Aliases like "firm-qualifications" are handled by pickBuilderKey fallback.
  "letter-of-transmittal": (r, opp) => {
    const client = r.understand?.clientDescriptor ?? "the client";
    const scope = r.understand?.scope;
    const blocks: Block[] = [];
    blocks.push(
      P(
        `Thank you for the opportunity to respond${
          opp ? ` on ${opp}` : ""
        }. This letter accompanies Aberdeen's response and confirms that we have addressed every required section of the solicitation.`,
      ),
    );
    if (scope) {
      blocks.push(
        P(
          `Our understanding is that ${client}'s real opportunity is what sits beneath the scope you described. This response is organized around what will decide the outcome, not only what you asked us to list.`,
        ),
      );
    }
    blocks.push(
      NeedsInput(
        "signed transmittal letter with proposal validity period, key personnel availability, and MSA / NDA readiness",
        "relationship owner",
      ),
    );
    return blocks;
  },

  "executive-summary": (r) => {
    const blocks: Block[] = [];
    const summary = r.create?.draftSections?.executiveSummary;
    if (summary) {
      for (const para of splitParagraphs(summary)) blocks.push(P(para));
    } else {
      blocks.push(
        NeedsInput(
          "executive summary — the whole story in a page",
          "engagement lead",
        ),
      );
    }
    return blocks;
  },

  "firm-qualifications": (r) => {
    const blocks: Block[] = [];
    const matches = r.match?.matches ?? [];
    if (matches.length === 0) {
      blocks.push(
        NeedsInput(
          "three closest analog engagements with measurable outcomes",
          "practice lead",
        ),
      );
      return blocks;
    }
    for (const m of matches) {
      blocks.push(H2(m.clientDescriptor ?? "Prior engagement"));
      blocks.push(P(m.whyRelevant ?? ""));
      if (m.outcome) {
        blocks.push(
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: "Outcome: ",
                bold: true,
                color: JADE,
                font: "Poppins",
                size: 22,
              }),
              new TextRun({
                text: m.outcome,
                color: ONYX,
                font: "Poppins",
                size: 22,
              }),
            ],
          }),
        );
      }
    }
    return blocks;
  },

  "approach-methodology": (r) => {
    const blocks: Block[] = [];
    const draft = r.create?.draftSections?.proposedApproach;
    if (draft) {
      for (const para of splitParagraphs(draft)) blocks.push(P(para));
    }
    const workstreams = r.design?.workstreams ?? [];
    if (workstreams.length) {
      blocks.push(H2("Workstreams"));
      for (const w of workstreams) {
        blocks.push(H2(w.name));
        blocks.push(P(w.objective));
        for (const a of w.keyActivities ?? []) blocks.push(Bullet(a));
      }
    }
    if (!draft && workstreams.length === 0) {
      blocks.push(
        NeedsInput(
          "approach and methodology — Aberdeen's frameworks mapped to the client's scope",
          "engagement lead",
        ),
      );
    }
    return blocks;
  },

  deliverables: (r) => {
    const blocks: Block[] = [];
    // Pull "Deliverable if Awarded" requirements from the compliance matrix.
    const deliverables = (r.understand?.requirements ?? []).filter(
      (req) => req?.responseAction === "Deliverable if Awarded",
    );
    if (deliverables.length === 0) {
      blocks.push(
        NeedsInput(
          "named deliverables D1..Dn tied to workstreams and decision gates",
          "engagement lead",
        ),
      );
      return blocks;
    }
    const rows: TableRow[] = [
      new TableRow({
        children: ["#", "Deliverable"].map(
          (h, idx) =>
            new TableCell({
              width: {
                size: idx === 0 ? 8 : 92,
                type: WidthType.PERCENTAGE,
              },
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
              shading: { fill: BLUE, type: ShadingType.CLEAR, color: "auto" },
            }),
        ),
      }),
      ...deliverables.map(
        (d, i) =>
          new TableRow({
            children: [`D${i + 1}`, d.requirement].map(
              (v, idx) =>
                new TableCell({
                  width: {
                    size: idx === 0 ? 8 : 92,
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: v,
                          font: "Poppins",
                          color: ONYX,
                          size: 22,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    ];
    blocks.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    return blocks;
  },

  team: (r) => {
    const blocks: Block[] = [];
    const staffing = r.design?.staffingModel ?? [];
    if (staffing.length === 0) {
      blocks.push(
        NeedsInput(
          "named senior team with roles, time commitment, and skills evidenced from the roster",
          "practice lead",
        ),
      );
      return blocks;
    }
    const rows: TableRow[] = [
      new TableRow({
        children: ["Role", "Responsibility", "Allocation"].map(
          (h, idx) =>
            new TableCell({
              width: {
                size: idx === 1 ? 60 : 20,
                type: WidthType.PERCENTAGE,
              },
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
              shading: { fill: BLUE, type: ShadingType.CLEAR, color: "auto" },
            }),
        ),
      }),
      ...staffing.map(
        (s) =>
          new TableRow({
            children: [s.role, s.responsibility, `${s.allocationPct}%`].map(
              (v, idx) =>
                new TableCell({
                  width: {
                    size: idx === 1 ? 60 : 20,
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: v,
                          font: "Poppins",
                          color: ONYX,
                          size: 22,
                          bold: idx === 0,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    ];
    blocks.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    blocks.push(
      NeedsInput(
        "confirm named individuals, real bios, credentials, and availability against proposed start",
        "practice lead",
      ),
    );
    return blocks;
  },

  references: () => [
    NeedsInput(
      "three contactable client references — most recent, most analogous, most senior",
      "relationship owner",
    ),
  ],

  timeline: (r) => {
    const blocks: Block[] = [];
    const milestones = r.design?.deliveryTimeline ?? [];
    if (milestones.length === 0) {
      blocks.push(
        NeedsInput(
          "post-award delivery milestones sized to the client's stated engagement length",
          "engagement lead",
        ),
      );
      return blocks;
    }
    const rows: TableRow[] = [
      new TableRow({
        children: ["Week", "Milestone"].map(
          (h, idx) =>
            new TableCell({
              width: {
                size: idx === 0 ? 18 : 82,
                type: WidthType.PERCENTAGE,
              },
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
              shading: { fill: BLUE, type: ShadingType.CLEAR, color: "auto" },
            }),
        ),
      }),
      ...milestones.map(
        (m) =>
          new TableRow({
            children: [m.weekOffset, m.milestone].map(
              (v, idx) =>
                new TableCell({
                  width: {
                    size: idx === 0 ? 18 : 82,
                    type: WidthType.PERCENTAGE,
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: v,
                          font: "Poppins",
                          color: ONYX,
                          size: 22,
                          bold: idx === 0,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    ];
    blocks.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    return blocks;
  },

  cost: () => [
    NeedsInput(
      "cost proposal by deliverable — fixed-fee or T&M, pulled from the rate card, or a range with the caveats spelled out",
      "commercial lead",
    ),
    P(
      "Aberdeen will not commit to a benefits number without an agreed baseline. Baselining is called out in the assumptions section.",
    ),
  ],

  "why-us": (r) => {
    const blocks: Block[] = [];
    const why = r.create?.whyAberdeen;
    if (why) {
      for (const para of splitParagraphs(why)) blocks.push(P(para));
    }
    // Evaluation-criteria crosswalk — the highest-leverage page.
    const criteria = r.understand?.evaluationCriteria ?? [];
    if (criteria.length) {
      blocks.push(H2("Evaluation-criteria crosswalk"));
      const rows: TableRow[] = [
        new TableRow({
          children: ["Client-stated criterion", "Where addressed", "Proof point"].map(
            (h) =>
              new TableCell({
                width: { size: 33, type: WidthType.PERCENTAGE },
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
                shading: { fill: BLUE, type: ShadingType.CLEAR, color: "auto" },
              }),
          ),
        }),
        ...criteria.map(
          (c) =>
            new TableRow({
              children: [
                c,
                needsInput("map to section", "engagement lead"),
                needsInput("cite the evidence", "engagement lead"),
              ].map(
                (v, idx) =>
                  new TableCell({
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: v,
                            font: "Poppins",
                            color: idx === 0 ? BLUE : ONYX,
                            bold: idx === 0,
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
              ),
            }),
        ),
      ];
      blocks.push(
        new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      );
    } else if (!why) {
      blocks.push(
        NeedsInput(
          "'Why Aberdeen' passage with an evaluation-criteria crosswalk",
          "engagement lead",
        ),
      );
    }
    return blocks;
  },

  assumptions: () => [
    P("The commitments in this proposal are conditional on the following."),
    Bullet(
      "The client provides a single decision-making sponsor and access to named stakeholders on the cadence proposed.",
    ),
    Bullet(
      "Data and system access are granted within one week of engagement start.",
    ),
    Bullet(
      "Scope changes flow through a change control process; new scope is priced separately, not absorbed.",
    ),
    Bullet(
      "Any benefits or savings numbers are validated against an agreed baseline before Aberdeen commits to them.",
    ),
    Bullet(
      "Acceptance criteria for each deliverable are agreed in writing at the start of the corresponding workstream.",
    ),
    NeedsInput(
      "engagement-specific assumptions and dependencies unique to this pursuit",
      "engagement lead",
    ),
  ],

  appendix: (r) => {
    const blocks: Block[] = [];
    if (!r.understand?.requirements?.length) {
      blocks.push(P("No requirements matrix available."));
      return blocks;
    }
    blocks.push(H2("Appendix A — Requirements matrix"));
    const headers = ["ID", "Requirement", "Category", "Mandatory", "Response Action"];
    const colWidths = [8, 44, 12, 12, 24];
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
              shading: { fill: BLUE, type: ShadingType.CLEAR, color: "auto" },
            }),
        ),
      }),
      ...r.understand.requirements.map(
        (req) =>
          new TableRow({
            children: [
              req.id,
              req.requirement,
              req.category,
              req.mandatory ? "Yes" : "No",
              req.responseAction ?? "—",
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
                          color: ONYX,
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    ];
    blocks.push(
      new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
    );
    blocks.push(H2("Response Action — legend"));
    const legend: [string, string][] = [
      ["Address", "Explain how Aberdeen would meet this requirement; no artifact needed yet."],
      ["Provide Information", "Supply the specific requested information in the proposal response."],
      ["Provide Attachment", "A specific form, document, or pricing file must accompany the proposal."],
      ["Acknowledge / Confirm", "Explicitly confirm Aberdeen can comply with the condition."],
      ["Deliverable if Awarded", "Something Aberdeen would actually produce during the engagement."],
    ];
    for (const [action, meaning] of legend) {
      blocks.push(
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
    return blocks;
  },
};

// ── Main entry point ───────────────────────────────────────────────

/**
 * Build the proposal starter as a real .docx.
 * Walks the spine loaded from method/aberdeen-pursuit/references/proposal-spine.md
 * (or a hard-coded fallback if that file is missing), emitting each section
 * with content from the pursuit results or a [NEEDS INPUT] placeholder.
 */
export async function buildProposal(args: {
  opportunityName?: string;
  results: Results;
}): Promise<Buffer> {
  const { opportunityName, results } = args;
  const spine = await loadSpine();

  const children: Block[] = [
    ...coverBlocks(opportunityName),
  ];

  for (const section of spine) {
    children.push(H1(`${section.number}. ${section.title}`));
    const builderKey = pickBuilderKey(section);
    const blocks = builderKey
      ? BUILDERS[builderKey](results, opportunityName)
      : [];
    if (blocks.length === 0) {
      // No content and no builder — leave the spine's guidance and a placeholder.
      if (section.guidance) {
        // Trim to first sentence-ish so we don't dump long markdown into the doc.
        const trimmed = firstParagraph(section.guidance);
        if (trimmed) children.push(Guidance(trimmed));
      }
      children.push(
        NeedsInput(
          `${section.title.toLowerCase()} — populated content`,
          "engagement lead",
        ),
      );
    } else {
      children.push(...blocks);
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
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Match a spine section to one of the builders. Uses section.key first, then
 * falls back to a keyword-based match so a renamed section (e.g., "Firm
 * Qualifications" vs "Firm qualifications & experience") still routes.
 */
function pickBuilderKey(section: SpineSection): string | null {
  if (BUILDERS[section.key]) return section.key;
  const t = section.title.toLowerCase();
  if (t.includes("transmittal")) return "letter-of-transmittal";
  if (t.includes("executive summary")) return "executive-summary";
  if (t.includes("qualification") || t.includes("experience"))
    return "firm-qualifications";
  if (t.includes("approach") || t.includes("methodology"))
    return "approach-methodology";
  if (t.includes("deliverable")) return "deliverables";
  if (t.startsWith("team") || t.includes("staffing")) return "team";
  if (t.includes("reference")) return "references";
  if (t.includes("timeline") || t.includes("schedule")) return "timeline";
  if (t.includes("cost") || t.includes("investment") || t.includes("price"))
    return "cost";
  if (t.includes("why") || t.includes("differentiator")) return "why-us";
  if (
    t.includes("assumption") ||
    t.includes("dependenc") ||
    t.includes("terms")
  )
    return "assumptions";
  if (t.includes("appendix")) return "appendix";
  return null;
}

function firstParagraph(s: string): string {
  return s.split(/\n{2,}/)[0]?.replace(/\s+/g, " ").trim() ?? "";
}
