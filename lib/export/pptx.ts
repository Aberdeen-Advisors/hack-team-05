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
const JADE = brand.colors.jade.replace("#", "");

const FONT = "Poppins";

/**
 * Build the executive deck.
 * Design principles: one idea per slide, big typography, section dividers,
 * visual layouts (columns / tiles / timeline) instead of paragraphs.
 * Inspired by Aberdeen's own "Case for Digital Transformation" deck.
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

  // ── Slide master (used for all content slides) ─────────────────────
  pptx.defineSlideMaster({
    title: "ABERDEEN",
    background: { color: WHITE },
    objects: [
      { rect: { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: TEAL } } },
      { rect: { x: 0, y: 7.15, w: 13.333, h: 0.35, fill: { color: BLUE } } },
      {
        text: {
          text: `${brand.companyName}  ·  ${brand.productName}`,
          options: {
            x: 0.5,
            y: 7.2,
            w: 8,
            h: 0.3,
            fontFace: FONT,
            fontSize: 10,
            color: WHITE,
          },
        },
      },
    ],
  });

  // ── Cover ──────────────────────────────────────────────────────────
  cover(pptx, opportunityName, results.understand?.clientDescriptor);

  let section = 1;
  const withSection = (label: string, run: () => void) => {
    sectionDivider(pptx, section, label);
    section += 1;
    run();
  };

  // ── Our Understanding ─────────────────────────────────────────────
  if (results.understand) {
    withSection("Our Understanding", () => {
      understandingSlide(pptx, results.understand!);
    });
  }

  // ── Win Themes ────────────────────────────────────────────────────
  if (results.strategize?.winThemes?.length) {
    withSection("Win Themes", () => {
      results.strategize!.winThemes!.forEach((t, i) => winThemeSlide(pptx, t, i));
    });
  }

  // ── Relevant Experience ───────────────────────────────────────────
  if (results.match?.matches?.length) {
    withSection("Relevant Experience", () => {
      results.match!.matches!.slice(0, 3).forEach((m, i) =>
        matchSlide(pptx, m, i),
      );
    });
  }

  // ── Proposed Approach ─────────────────────────────────────────────
  if (results.design?.workstreams?.length) {
    withSection("Proposed Approach", () => {
      approachSlide(pptx, results.design!);
    });
  }

  // ── The Human Element ─────────────────────────────────────────────
  withSection("The Human Element", () => {
    humanElementSlide(pptx, results.create?.whyAberdeen);
  });

  // ── Closer ────────────────────────────────────────────────────────
  closer(pptx);

  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}

// ═══════════════════════════════════════════════════════════════════
// Slide builders
// ═══════════════════════════════════════════════════════════════════

function cover(
  pptx: PptxGenJS,
  title: string | undefined,
  descriptor: string | undefined,
) {
  const s = pptx.addSlide();
  s.background = { color: BLUE };

  // Right-side teal wash
  s.addShape("rect", {
    x: 8,
    y: 0,
    w: 5.333,
    h: 7.5,
    fill: { color: TEAL, transparency: 60 },
  });
  // Teal accent triangle (echoes the logo mark)
  s.addShape("triangle", {
    x: 9.5,
    y: 1.2,
    w: 2.5,
    h: 2.8,
    fill: { color: TEAL, transparency: 40 },
    line: { color: TEAL, width: 0 },
  });

  s.addText(brand.productName.toUpperCase(), {
    x: 0.7,
    y: 2.5,
    w: 8,
    h: 0.4,
    fontFace: FONT,
    fontSize: 12,
    color: TEAL,
    charSpacing: 8,
    bold: true,
  });
  s.addText(title ?? "Pursuit Deck", {
    x: 0.7,
    y: 2.95,
    w: 8,
    h: 2.2,
    fontFace: FONT,
    fontSize: 42,
    color: WHITE,
  });
  if (descriptor) {
    s.addText(descriptor, {
      x: 0.7,
      y: 5.0,
      w: 8,
      h: 0.6,
      fontFace: FONT,
      fontSize: 16,
      color: TEAL,
      italic: true,
    });
  }
  s.addText(brand.companyName.toUpperCase(), {
    x: 0.7,
    y: 6.7,
    w: 6,
    h: 0.4,
    fontFace: FONT,
    fontSize: 11,
    color: WHITE,
    charSpacing: 8,
  });
}

function sectionDivider(pptx: PptxGenJS, n: number, label: string) {
  const s = pptx.addSlide();
  s.background = { color: BLUE };

  // Huge translucent section number
  s.addText(String(n).padStart(2, "0"), {
    x: 0.5,
    y: 0.8,
    w: 8,
    h: 5.5,
    fontFace: FONT,
    fontSize: 380,
    color: TEAL,
    transparency: 70,
    bold: false,
  });

  s.addText("SECTION", {
    x: 6,
    y: 3.1,
    w: 7,
    h: 0.4,
    fontFace: FONT,
    fontSize: 12,
    color: TEAL,
    charSpacing: 8,
    bold: true,
  });
  s.addText(label, {
    x: 6,
    y: 3.6,
    w: 7,
    h: 1.4,
    fontFace: FONT,
    fontSize: 44,
    color: WHITE,
  });

  // Bottom teal underline
  s.addShape("line", {
    x: 6,
    y: 5.2,
    w: 3,
    h: 0,
    line: { color: TEAL, width: 2 },
  });
}

function contentTitle(
  s: PptxGenJS.Slide,
  eyebrow: string,
  title: string,
  subtitle?: string,
) {
  s.addText(eyebrow.toUpperCase(), {
    x: 0.6,
    y: 0.35,
    w: 12,
    h: 0.3,
    fontFace: FONT,
    fontSize: 10,
    color: TEAL,
    charSpacing: 6,
    bold: true,
  });
  s.addText(title, {
    x: 0.6,
    y: 0.65,
    w: 12,
    h: 0.85,
    fontFace: FONT,
    fontSize: 28,
    color: BLUE,
    bold: true,
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.6,
      y: 1.5,
      w: 12,
      h: 0.5,
      fontFace: FONT,
      fontSize: 13,
      color: ONYX,
      italic: false,
    });
  }
  s.addShape("line", {
    x: 0.6,
    y: subtitle ? 2.0 : 1.55,
    w: 1.2,
    h: 0,
    line: { color: TEAL, width: 3 },
  });
}

/**
 * Colored header bar at the top of a column tile. Mimics the "Improved Clinical
 * Care" / "Enhanced Staff Satisfaction" style bars from the Aberdeen decks.
 */
function columnHeader(
  s: PptxGenJS.Slide,
  x: number,
  y: number,
  w: number,
  label: string,
  color: string,
) {
  s.addShape("rect", {
    x,
    y,
    w,
    h: 0.45,
    fill: { color },
    line: { color, width: 0 },
  });
  s.addText(label.toUpperCase(), {
    x: x + 0.15,
    y,
    w: w - 0.3,
    h: 0.45,
    fontFace: FONT,
    fontSize: 12,
    color: WHITE,
    bold: true,
    charSpacing: 6,
    valign: "middle",
  });
}

/**
 * Teal chevron banner across the bottom of the slide with a key message.
 * Modeled on the "Enable clinicians to spend more time on patients" pattern.
 */
function bottomBanner(s: PptxGenJS.Slide, text: string) {
  s.addShape("chevron", {
    x: -0.3,
    y: 6.55,
    w: 13.7,
    h: 0.6,
    fill: { color: TEAL },
    line: { color: TEAL, width: 0 },
  });
  s.addText(text, {
    x: 0.5,
    y: 6.55,
    w: 12,
    h: 0.6,
    fontFace: FONT,
    fontSize: 14,
    color: WHITE,
    bold: true,
    valign: "middle",
  });
}

function understandingSlide(pptx: PptxGenJS, u: OpportunityBrief) {
  const s = pptx.addSlide({ masterName: "ABERDEEN" });
  contentTitle(
    s,
    "Understand",
    "What this program actually needs",
    u.clientDescriptor
      ? `For ${u.clientDescriptor.toLowerCase().replace(/\.$/, "")}.`
      : undefined,
  );

  const objs = (u.objectives ?? []).slice(0, 4);
  const pains = (u.painPoints ?? []).slice(0, 4);
  const risks = (u.risksAndConstraints ?? []).slice(0, 4);

  const y0 = 2.3;
  const colW = 4.05;
  const gap = 0.2;
  const startX = 0.6;
  const cols: [string, string, string[]][] = [
    ["Objectives", BLUE, objs],
    ["Pain points", TEAL, pains],
    ["Risks & constraints", "DB504A", risks],
  ];

  cols.forEach(([label, color, items], idx) => {
    const x = startX + idx * (colW + gap);
    columnHeader(s, x, y0, colW, label, color);
    const bulletItems = items.map((t) => ({
      text: t,
      options: {
        bullet: { code: "25A0" },
        color: ONYX,
      },
    }));
    s.addText(bulletItems, {
      x,
      y: y0 + 0.6,
      w: colW,
      h: 3.5,
      fontFace: FONT,
      fontSize: 13,
      color: ONYX,
      paraSpaceAfter: 8,
      valign: "top",
    });
  });

  bottomBanner(
    s,
    u.scope
      ? shorten(u.scope, 160)
      : "One RFP. One team. Aberdeen leads with the human element.",
  );
}

function shorten(s: string, max: number) {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…";
}

function winThemeSlide(
  pptx: PptxGenJS,
  theme: WinStrategy["winThemes"][number],
  index: number,
) {
  const s = pptx.addSlide({ masterName: "ABERDEEN" });
  const n = String(index + 1).padStart(2, "0");
  contentTitle(s, `Win Theme ${n}`, theme.title ?? "");

  const columnY = 2.2;
  const columnH = 4.15;
  const colW = 6.1;

  // Left column — Human (Aberdeen leads with culture)
  columnHeader(s, 0.6, columnY, colW, "The human element", TEAL);
  angleColumnBody(s, {
    x: 0.6,
    y: columnY + 0.55,
    w: colW,
    h: columnH - 0.55,
    accentColor: TEAL,
    summary: theme.humanAngle?.summary,
    bullets: theme.humanAngle?.bullets,
  });

  // Right column — Technical
  columnHeader(s, 6.9, columnY, colW, "The technical approach", BLUE);
  angleColumnBody(s, {
    x: 6.9,
    y: columnY + 0.55,
    w: colW,
    h: columnH - 0.55,
    accentColor: BLUE,
    summary: theme.technicalAngle?.summary,
    bullets: theme.technicalAngle?.bullets,
  });

  // Chevron banner with the theme title as the key takeaway
  bottomBanner(s, `Win theme ${n} — ${theme.title ?? ""}`);
}

function angleColumnBody(
  s: PptxGenJS.Slide,
  args: {
    x: number;
    y: number;
    w: number;
    h: number;
    accentColor: string;
    summary?: string;
    bullets?: Array<{ headline?: string; body?: string } | undefined>;
  },
) {
  const { x, y, w, accentColor, summary, bullets } = args;

  // Summary sentence in bold blue
  if (summary) {
    s.addText(summary, {
      x,
      y,
      w,
      h: 0.85,
      fontFace: FONT,
      fontSize: 14,
      color: BLUE,
      bold: true,
    });
  }

  // Bulleted headline: body rows
  const start = y + 0.95;
  const rowH = 0.78;
  (bullets ?? []).slice(0, 4).forEach((b, i) => {
    const rowY = start + i * rowH;
    // teal/blue square bullet
    s.addShape("rect", {
      x: x + 0.05,
      y: rowY + 0.15,
      w: 0.1,
      h: 0.1,
      fill: { color: accentColor },
      line: { color: accentColor, width: 0 },
    });
    s.addText(
      [
        {
          text: b?.headline ? `${b.headline}: ` : "",
          options: {
            fontFace: FONT,
            fontSize: 11,
            color: BLUE,
            bold: true,
          },
        },
        {
          text: b?.body ?? "",
          options: {
            fontFace: FONT,
            fontSize: 11,
            color: ONYX,
            bold: false,
          },
        },
      ],
      {
        x: x + 0.28,
        y: rowY,
        w: w - 0.3,
        h: rowH,
        valign: "top",
        paraSpaceAfter: 4,
      },
    );
  });
}

function matchSlide(
  pptx: PptxGenJS,
  m: EvidenceMap["matches"][number],
  index: number,
) {
  const s = pptx.addSlide({ masterName: "ABERDEEN" });
  const n = String(index + 1).padStart(2, "0");

  contentTitle(
    s,
    `Relevant Experience ${n}`,
    m.clientDescriptor ?? "Prior engagement",
    "Why this Aberdeen engagement supports the requirements in this RFP.",
  );

  // "Why relevant" column
  columnHeader(s, 0.6, 2.6, 7.5, "Why this is relevant", BLUE);
  s.addText(m.whyRelevant ?? "", {
    x: 0.6,
    y: 3.2,
    w: 7.5,
    h: 3.2,
    fontFace: FONT,
    fontSize: 13,
    color: ONYX,
    paraSpaceAfter: 6,
    valign: "top",
  });

  // Right column — outcome callout + requirements addressed
  columnHeader(s, 8.3, 2.6, 4.4, "Outcome", JADE);

  if (m.outcome) {
    s.addText(m.outcome, {
      x: 8.3,
      y: 3.2,
      w: 4.4,
      h: 2.1,
      fontFace: FONT,
      fontSize: 13,
      color: BLUE,
      bold: true,
      valign: "top",
    });
  }
  const reqs = (m.rfpRequirementsAddressed ?? []).slice(0, 6);
  if (reqs.length) {
    s.addText("REQUIREMENTS ADDRESSED", {
      x: 8.3,
      y: 5.3,
      w: 4.4,
      h: 0.3,
      fontFace: FONT,
      fontSize: 9,
      color: TEAL,
      charSpacing: 5,
      bold: true,
    });
    s.addText(reqs.join("  ·  "), {
      x: 8.3,
      y: 5.6,
      w: 4.4,
      h: 0.8,
      fontFace: FONT,
      fontSize: 11,
      color: ONYX,
      valign: "top",
    });
  }

  bottomBanner(
    s,
    `Match ${n} — ${shorten(m.clientDescriptor ?? "prior engagement", 100)}`,
  );
}

function approachSlide(pptx: PptxGenJS, d: SolutionBlueprint) {
  const s = pptx.addSlide({ masterName: "ABERDEEN" });
  contentTitle(
    s,
    "Design",
    "How we deliver",
    "Aberdeen structures delivery through parallel workstreams — each with clear ownership.",
  );

  const workstreams = (d.workstreams ?? []).slice(0, 3);
  const colW = 4.05;
  const gap = 0.2;
  const startX = 0.6;
  const y0 = 2.6;
  const headerColors = [BLUE, TEAL, JADE];

  workstreams.forEach((w, i) => {
    const x = startX + i * (colW + gap);
    columnHeader(s, x, y0, colW, w.name ?? `Workstream ${i + 1}`, headerColors[i] ?? BLUE);
    // Objective
    s.addText(w.objective ?? "", {
      x,
      y: y0 + 0.55,
      w: colW,
      h: 1.0,
      fontFace: FONT,
      fontSize: 12,
      color: BLUE,
      bold: true,
      valign: "top",
    });
    // Activities as square bullets
    const acts = (w.keyActivities ?? []).slice(0, 5);
    s.addText(
      acts.map((a) => ({
        text: a,
        options: { bullet: { code: "25A0" }, color: ONYX },
      })),
      {
        x,
        y: y0 + 1.6,
        w: colW,
        h: 2.5,
        fontFace: FONT,
        fontSize: 11,
        color: ONYX,
        paraSpaceAfter: 4,
        valign: "top",
      },
    );
  });

  bottomBanner(
    s,
    "Multidisciplinary pods · Referral-based workforce · Delivery, not just direction.",
  );
}

function humanElementSlide(pptx: PptxGenJS, whyAberdeen: string | undefined) {
  const s = pptx.addSlide();
  s.background = { color: BLUE };

  // Faded teal accent
  s.addShape("triangle", {
    x: 10.5,
    y: 4.5,
    w: 3,
    h: 3,
    fill: { color: TEAL, transparency: 70 },
    line: { color: TEAL, width: 0 },
  });

  s.addText("THE HUMAN ELEMENT", {
    x: 0.7,
    y: 1.2,
    w: 12,
    h: 0.4,
    fontFace: FONT,
    fontSize: 12,
    color: TEAL,
    bold: true,
    charSpacing: 8,
  });

  const pull = (whyAberdeen ?? "").split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  s.addText(pull || "Low ego. High ownership. Accountable through delivery.", {
    x: 0.7,
    y: 1.9,
    w: 11.5,
    h: 4.5,
    fontFace: FONT,
    fontSize: 32,
    color: WHITE,
    paraSpaceAfter: 12,
    valign: "top",
  });

  s.addText(`— ${brand.companyName}`, {
    x: 0.7,
    y: 6.4,
    w: 6,
    h: 0.4,
    fontFace: FONT,
    fontSize: 12,
    color: TEAL,
    italic: true,
  });
}

function closer(pptx: PptxGenJS) {
  const s = pptx.addSlide();
  s.background = { color: BLUE };

  // Teal radial glow bottom-left (simulated with two triangles)
  s.addShape("triangle", {
    x: -1,
    y: 4,
    w: 5,
    h: 4,
    fill: { color: TEAL, transparency: 75 },
    line: { color: TEAL, width: 0 },
  });

  s.addText("Low ego.  High ownership.", {
    x: 0.7,
    y: 2.7,
    w: 12,
    h: 1.0,
    fontFace: FONT,
    fontSize: 44,
    color: WHITE,
  });
  s.addText("Let's build the response.", {
    x: 0.7,
    y: 3.9,
    w: 12,
    h: 0.7,
    fontFace: FONT,
    fontSize: 22,
    color: TEAL,
  });
}
