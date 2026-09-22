import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Proposal spine loader.
 *
 * Parses `method/aberdeen-pursuit/references/proposal-spine.md` at export
 * time and returns the 12-section spine with per-section guidance. The DOCX
 * exporter walks these sections in order, so editing the .md file (adding
 * sections, renaming them, changing the guidance) updates the exported
 * proposal without a code change.
 *
 * Section headings in the source file look like:
 *   ## 1. Letter of transmittal
 *   ## 2. Executive summary
 *   ## Front matter: table of contents      (skipped — non-numbered)
 *
 * If the file can't be found or parsed, the exporter falls back to a
 * hard-coded default spine.
 */

export type SpineSection = {
  /** 1-based section number as it appears in the spine. */
  number: number;
  /** Section title from the markdown, e.g. "Letter of transmittal". */
  title: string;
  /** The paragraph text under the heading (before the next H2), for guidance/placeholders. */
  guidance: string;
  /** Internal key for the exporter to switch on — slug of the title. */
  key: string;
};

const SPINE_FILE_CANDIDATES = [
  "method/aberdeen-pursuit/references/proposal-spine.md",
  "sample-armory/proposals/aberdeen-proposal-spine.md",
];

const DEFAULT_SPINE: SpineSection[] = [
  {
    number: 1,
    title: "Letter of transmittal",
    guidance:
      "One page, signed by the relationship owner. Frames the opportunity and names our differentiator. Human, not a product pitch.",
    key: "letter-of-transmittal",
  },
  {
    number: 2,
    title: "Executive summary",
    guidance:
      "The whole story in a page: their problem, our approach, why us, the outcome. Written last, read first.",
    key: "executive-summary",
  },
  {
    number: 3,
    title: "Firm qualifications & experience",
    guidance: "Relevant, recent, and specific. Industry, references, credentials. Proof over adjectives.",
    key: "firm-qualifications",
  },
  {
    number: 4,
    title: "Approach & methodology",
    guidance:
      "Aberdeen's frameworks mapped to this client's scope and evaluation criteria. Use figures. Structure by the client's workstreams, not by Aberdeen's internal model.",
    key: "approach-methodology",
  },
  {
    number: 5,
    title: "Deliverables",
    guidance:
      "Exactly what they receive, tied to workstreams and decision gates. Give each a number (D1, D2...) and reuse those numbers in the timeline and workplan.",
    key: "deliverables",
  },
  {
    number: 6,
    title: "Team",
    guidance:
      "Named senior people, roles, and time commitment. Keep validation independent of delivery. Real bios with real credentials, or [NEEDS INPUT] — never a placeholder persona.",
    key: "team",
  },
  {
    number: 7,
    title: "References",
    guidance:
      "Recent, relevant, contactable. Lead with the closest analog to this client. Never generate a reference.",
    key: "references",
  },
  {
    number: 8,
    title: "Timeline",
    guidance:
      "Phased, gate-based, aligned to their start date. Show their time commitment, not only ours. Prefer a week-by-week grid over a phase diagram.",
    key: "timeline",
  },
  {
    number: 9,
    title: "Cost / investment",
    guidance:
      "Transparent, by deliverable. Present value alongside price. Pricing must come from the corpus or be [NEEDS INPUT].",
    key: "cost",
  },
  {
    number: 10,
    title: "Why us",
    guidance:
      "The differentiators, plus an evaluation-criteria crosswalk that scores itself: a table mapping each client-stated evaluation criterion to where the response addresses it and what the proof is.",
    key: "why-us",
  },
  {
    number: 11,
    title: "Assumptions, dependencies & terms",
    guidance:
      "Protective framing — the guardrails that keep scope and margin intact. Framed as how we work, not as contract language.",
    key: "assumptions",
  },
  {
    number: 12,
    title: "Appendix",
    guidance:
      'Resumes, detail, figures, the requirements matrix, and the "Ask Aberdeen" AI companion / QR where it fits.',
    key: "appendix",
  },
];

/** Compute the internal key for a spine section from its title. */
function slugKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parse a spine markdown file. Recognizes headings of the form:
 *   ## 1. <title>
 *   ## 12. <title>
 * Non-numbered headings (e.g., "Front matter: table of contents") are skipped
 * so the spine matches the numbered list in the file exactly.
 */
export function parseSpineMarkdown(source: string): SpineSection[] {
  const sections: SpineSection[] = [];
  const lines = source.split(/\r?\n/);
  const headingRe = /^##\s+(\d+)\.\s+(.+?)\s*$/;

  let current: { number: number; title: string; body: string[] } | null = null;
  for (const line of lines) {
    const m = line.match(headingRe);
    if (m) {
      if (current) {
        sections.push({
          number: current.number,
          title: current.title,
          guidance: current.body.join("\n").trim(),
          key: slugKey(current.title),
        });
      }
      current = { number: parseInt(m[1], 10), title: m[2], body: [] };
      continue;
    }
    // Stop the current section at the next unrelated H2 (non-numbered) or ---
    if (/^##\s+/.test(line) || /^---\s*$/.test(line)) {
      if (current) {
        sections.push({
          number: current.number,
          title: current.title,
          guidance: current.body.join("\n").trim(),
          key: slugKey(current.title),
        });
        current = null;
      }
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) {
    sections.push({
      number: current.number,
      title: current.title,
      guidance: current.body.join("\n").trim(),
      key: slugKey(current.title),
    });
  }
  return sections;
}

/**
 * Load the spine at export time. Tries the method reference first (Team 3's
 * detailed 12-section spine), then the sample-armory version, then the hard-
 * coded default. Caches the result for the process lifetime.
 */
let _cache: SpineSection[] | null = null;
export async function loadSpine(): Promise<SpineSection[]> {
  if (_cache) return _cache;
  for (const relative of SPINE_FILE_CANDIDATES) {
    try {
      const full = path.join(process.cwd(), relative);
      const source = await fs.readFile(full, "utf8");
      const parsed = parseSpineMarkdown(source);
      if (parsed.length >= 6) {
        _cache = parsed;
        return parsed;
      }
    } catch {
      // try next candidate
    }
  }
  _cache = DEFAULT_SPINE;
  return DEFAULT_SPINE;
}

/**
 * Standard placeholder text for spine sections we cannot populate from
 * engine results. Follows the [NEEDS INPUT: <what> — <who>] convention used
 * across the method prompts and win-theme drafts.
 */
export function needsInput(what: string, owner: string): string {
  return `[NEEDS INPUT: ${what} — ${owner}]`;
}
