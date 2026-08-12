import PptxGenJS from "pptxgenjs";
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
const WHITE = "FFFFFF";

/**
 * Build the executive deck as a real .pptx.
 * Uses Aberdeen brand tokens for colors + Poppins as the primary font
 * (falls back to Arial at render time on machines without Poppins).
 */
export async function buildDeck(args: {
  opportunityName?: string;
  results: Results;
}): Promise<Buffer> {
  const { opportunityName, results } = args;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = `${brand.companyName} — ${opportunityName ?? "Pursuit Deck"}`;
  pptx.author = brand.companyName;
  pptx.company = brand.companyName;

  // ---- Slide master ----
  pptx.defineSlideMaster({
    title: "ABERDEEN",
    background: { color: WHITE },
    objects: [
      // Left teal accent strip
      {
        rect: {
          x: 0,
          y: 0,
          w: 0.25,
          h: 7.5,
          fill: { color: TEAL },
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: 7.15,
          w: 13.333,
          h: 0.35,
          fill: { color: BLUE },
        },
      },
      {
        text: {
          text: `${brand.companyName}  ·  ${brand.productName}`,
          options: {
            x: 0.5,
            y: 7.2,
            w: 8,
            h: 0.3,
            fontFace: "Poppins",
            fontSize: 10,
            color: WHITE,
          },
        },
      },
    ],
  });

  // ---- Title slide ----
  {
    const s = pptx.addSlide({ masterName: "ABERDEEN" });
    s.background = { color: BLUE };
    s.addText(brand.productName.toUpperCase(), {
      x: 0.6,
      y: 2.4,
      w: 12,
      h: 0.5,
      fontFace: "Poppins",
      fontSize: 14,
      color: TEAL,
      charSpacing: 6,
    });
    s.addText(opportunityName ?? "Pursuit Deck", {
      x: 0.6,
      y: 2.9,
      w: 12,
      h: 2,
      fontFace: "Poppins",
      fontSize: 44,
      bold: false,
      color: WHITE,
    });
    s.addText(
      results.understand?.clientDescriptor ?? "Executive briefing",
      {
        x: 0.6,
        y: 4.8,
        w: 12,
        h: 0.6,
        fontFace: "Poppins",
        fontSize: 18,
        color: TEAL,
      },
    );
  }

  const contentSlide = (title: string) => {
    const s = pptx.addSlide({ masterName: "ABERDEEN" });
    s.addText(title, {
      x: 0.6,
      y: 0.35,
      w: 12,
      h: 0.7,
      fontFace: "Poppins",
      fontSize: 28,
      color: BLUE,
    });
    // Teal underline
    s.addShape("line", {
      x: 0.6,
      y: 1.05,
      w: 1.5,
      h: 0,
      line: { color: TEAL, width: 3 },
    });
    return s;
  };

  const bulletList = (items: string[], y: number, h: number) => ({
    x: 0.7,
    y,
    w: 12,
    h,
    fontFace: "Poppins",
    fontSize: 16,
    color: ONYX,
    paraSpaceAfter: 8,
    bullet: { code: "25A0" },
    valign: "top" as const,
  });

  // ---- Our Understanding ----
  if (results.understand) {
    const s = contentSlide("Our Understanding");
    const points = [
      ...(results.understand.objectives ?? []).slice(0, 3).map((o) => `Objective: ${o}`),
      ...(results.understand.painPoints ?? []).slice(0, 3).map((p) => `Pain point: ${p}`),
    ];
    s.addText(
      points.map((t) => ({ text: t, options: { bullet: { code: "25A0" } } })),
      bulletList(points, 1.4, 5.5),
    );
  }

  // ---- Win Themes ----
  if (results.strategize) {
    const s = contentSlide("Win Themes");
    const themes = (results.strategize.winThemes ?? []).slice(0, 4);
    const items = themes.flatMap((t, i) => [
      { text: `${i + 1}. ${t.title}`, options: { bold: true, color: BLUE } },
      { text: `   Technical: ${t.technicalAngle}`, options: { color: ONYX } },
      { text: `   Human: ${t.humanAngle}`, options: { color: TEAL } },
    ]);
    s.addText(items, {
      x: 0.7,
      y: 1.4,
      w: 12,
      h: 5.5,
      fontFace: "Poppins",
      fontSize: 14,
      paraSpaceAfter: 6,
    });
  }

  // ---- Proposed Approach ----
  if (results.design) {
    const s = contentSlide("Proposed Approach");
    const workstreams = (results.design.workstreams ?? []).slice(0, 3);
    if (workstreams.length > 0) {
      const colW = 4.1;
      workstreams.forEach((w, i) => {
        s.addShape("roundRect", {
          x: 0.6 + i * (colW + 0.2),
          y: 1.4,
          w: colW,
          h: 5.4,
          fill: { color: "F1F5F9" },
          line: { color: TEAL, width: 1 },
          rectRadius: 0.08,
        });
        s.addText(w.name, {
          x: 0.8 + i * (colW + 0.2),
          y: 1.6,
          w: colW - 0.4,
          h: 0.5,
          fontFace: "Poppins",
          fontSize: 16,
          bold: true,
          color: BLUE,
        });
        s.addText(w.objective, {
          x: 0.8 + i * (colW + 0.2),
          y: 2.1,
          w: colW - 0.4,
          h: 1.2,
          fontFace: "Poppins",
          fontSize: 11,
          italic: true,
          color: TEAL,
        });
        s.addText(
          (w.keyActivities ?? []).slice(0, 5).join("\n"),
          {
            x: 0.8 + i * (colW + 0.2),
            y: 3.3,
            w: colW - 0.4,
            h: 3.3,
            fontFace: "Poppins",
            fontSize: 12,
            color: ONYX,
            bullet: { code: "25CF" },
            paraSpaceAfter: 4,
          },
        );
      });
    } else {
      s.addText(results.design.approach ?? "", {
        x: 0.7,
        y: 1.4,
        w: 12,
        h: 5.5,
        fontFace: "Poppins",
        fontSize: 14,
        color: ONYX,
      });
    }
  }

  // ---- Relevant Experience ----
  if (results.match) {
    const s = contentSlide("Relevant Experience");
    const matches = (results.match.matches ?? []).slice(0, 3);
    const items = matches.flatMap((m, i) => [
      {
        text: `#${m.rank ?? i + 1}. ${m.clientDescriptor}`,
        options: { bold: true, color: BLUE },
      },
      { text: `   ${m.whyRelevant}`, options: { color: ONYX } },
      ...(m.outcome
        ? [{ text: `   Outcome: ${m.outcome}`, options: { color: "00A676" } }]
        : []),
    ]);
    s.addText(items, {
      x: 0.7,
      y: 1.4,
      w: 12,
      h: 5.5,
      fontFace: "Poppins",
      fontSize: 14,
      paraSpaceAfter: 6,
    });
  }

  // ---- Human Element ----
  {
    const s = contentSlide("The Human Element");
    s.addText(
      results.create?.whyAberdeen ??
        "Aberdeen Advisors partners with executives to turn strategy into measurable outcomes.",
      {
        x: 0.7,
        y: 1.4,
        w: 12,
        h: 5.5,
        fontFace: "Poppins",
        fontSize: 16,
        color: ONYX,
        paraSpaceAfter: 8,
      },
    );
  }

  // ---- 7-Day Plan ----
  if (results.design?.sevenDayPursuitPlan?.length) {
    const s = contentSlide("7-Day Pursuit Plan");
    const rows = results.design.sevenDayPursuitPlan.map((d) => [
      { text: `Day ${d.day}` },
      { text: d.engine },
      { text: (d.deliverables ?? []).join(", ") },
      { text: d.reviewer },
    ]);
    s.addTable(
      [
        [
          { text: "Day", options: { bold: true, color: WHITE, fill: { color: BLUE } } },
          { text: "Engine", options: { bold: true, color: WHITE, fill: { color: BLUE } } },
          { text: "Deliverables", options: { bold: true, color: WHITE, fill: { color: BLUE } } },
          { text: "Reviewer", options: { bold: true, color: WHITE, fill: { color: BLUE } } },
        ],
        ...rows,
      ],
      {
        x: 0.6,
        y: 1.4,
        w: 12.1,
        fontFace: "Poppins",
        fontSize: 11,
        color: ONYX,
        border: { pt: 1, color: "E2E8F0" },
        colW: [1, 1.5, 7.1, 2.5],
      },
    );
  }

  // ---- Closer ----
  {
    const s = pptx.addSlide({ masterName: "ABERDEEN" });
    s.background = { color: BLUE };
    s.addText("Low ego. High ownership.", {
      x: 0.6,
      y: 2.8,
      w: 12,
      h: 0.9,
      fontFace: "Poppins",
      fontSize: 40,
      color: WHITE,
    });
    s.addText("Let's build the response.", {
      x: 0.6,
      y: 3.9,
      w: 12,
      h: 0.6,
      fontFace: "Poppins",
      fontSize: 20,
      color: TEAL,
    });
  }

  // Return as Buffer
  const out = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return out;
}
