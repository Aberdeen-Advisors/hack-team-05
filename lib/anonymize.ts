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
  if (!raw) return results;

  const replacement = opts.replacement ?? "the client";

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

  const patterns = Array.from(variants)
    .filter((v) => v.length >= 3)
    .map((v) => new RegExp(escapeRegex(v), "gi"));

  const scrub = (input: unknown): unknown => {
    if (typeof input === "string") {
      let out = input;
      for (const p of patterns) out = out.replace(p, replacement);
      return out;
    }
    if (Array.isArray(input)) return input.map(scrub);
    if (input && typeof input === "object") {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
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
