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

/**
 * Defensive scrub of real client names before exports.
 * The system prompt already tells the model to anonymize, but we belt-and-suspender
 * it here so a demo never surfaces a real name from the RFP.
 */
export function anonymizeResults(
  results: Results,
  opts: { clientName?: string; replacement?: string } = {},
): Results {
  const raw = opts.clientName?.trim();
  const replacement = opts.replacement ?? "the client";

  const patterns: RegExp[] = [];
  if (raw) {
    // Include the raw name plus a bare-form (strip common suffixes like Inc, LLC).
    const variants = new Set<string>([raw]);
    variants.add(
      raw
        .replace(
          /\b(inc\.?|llc|ltd\.?|corp\.?|corporation|company|co\.?|plc|gmbh|s\.a\.?|sa|nv)\b/gi,
          "",
        )
        .replace(/\s+/g, " ")
        .trim(),
    );
    patterns.push(
      ...Array.from(variants)
        .filter((v) => v.length >= 3)
        .map((v) => new RegExp(escapeRegex(v), "gi")),
    );
  }

  // Always strip internal [C#] citation tokens from displayed text — they carry
  // no meaning to a reader and clutter the prose.
  const stripCitations = (s: string) =>
    s.replace(/\s*\[C\d+(?:\s*,\s*C\d+)*\]\s*/gi, " ").replace(/\s{2,}/g, " ");

  const scrub = (input: unknown): unknown => {
    if (typeof input === "string") {
      let out = input;
      for (const p of patterns) out = out.replace(p, replacement);
      out = stripCitations(out);
      return out;
    }
    if (Array.isArray(input)) return input.map(scrub);
    if (input && typeof input === "object") {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
        // Drop the evidence arrays entirely — the [C#] tags they carry aren't
        // rendered anywhere useful in exports.
        if (k === "evidence") continue;
        o[k] = scrub(v);
      }
      return o;
    }
    return input;
  };

  return scrub(results) as Results;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
