import { extractTextFromBuffer } from "@/lib/armory/extract";

/**
 * Parsed RFP with a rough section index so downstream engines can quote
 * requirements, evaluation criteria, timeline, and T&Cs without paying long
 * context on every call.
 */
export type ParsedRfp = {
  fileName: string;
  fullText: string;
  charCount: number;
  sections: {
    requirements: string;
    evaluationCriteria: string;
    timeline: string;
    termsAndConditions: string;
  };
  /** Best guess: does the RFP look federal, state/local, or private-sector. */
  jurisdiction: "federal" | "state-local" | "private" | "unknown";
};

const HEADING_PATTERNS = {
  requirements: [
    /scope of (work|services)/i,
    /statement of work/i,
    /required services/i,
    /requirements/i,
    /technical requirements/i,
    /functional requirements/i,
    /minimum qualifications/i,
    /mandatory requirements/i,
  ],
  evaluationCriteria: [
    /evaluation criteria/i,
    /selection criteria/i,
    /scoring/i,
    /basis of award/i,
    /evaluation factors/i,
    /how proposals will be evaluated/i,
  ],
  timeline: [
    /timeline/i,
    /schedule/i,
    /key dates/i,
    /procurement schedule/i,
    /due date/i,
    /submission deadline/i,
    /rfp calendar/i,
  ],
  termsAndConditions: [
    /terms and conditions/i,
    /general conditions/i,
    /contract terms/i,
    /insurance requirements/i,
    /compliance/i,
    /instructions to (bidders|offerors|proposers)/i,
  ],
};

/**
 * Very lightweight section extractor: find the first heading match for each
 * bucket, then grab the next ~4000 chars of body text. The engines can still
 * see the full text — this is just a hint to prioritize.
 */
function sliceSection(text: string, patterns: RegExp[]): string {
  for (const p of patterns) {
    const m = text.search(p);
    if (m >= 0) {
      return text.slice(m, m + 4000);
    }
  }
  return "";
}

function guessJurisdiction(text: string): ParsedRfp["jurisdiction"] {
  const t = text.slice(0, 20000);
  const federal =
    /\b(FAR|DFARS|federal acquisition regulation|contracting officer|GSA|SAM\.gov)\b/i.test(
      t,
    );
  const stateLocal =
    /\b(state of |county of |city of |municipality|department of transportation|public procurement)\b/i.test(
      t,
    );
  if (federal && !stateLocal) return "federal";
  if (stateLocal) return "state-local";
  if (
    /\b(commercial|private|LLC|Inc\.|Corp\.|company confidential)\b/i.test(t)
  ) {
    return "private";
  }
  return "unknown";
}

export async function parseRfp(
  buffer: Buffer,
  fileName: string,
): Promise<ParsedRfp> {
  const fullText = (await extractTextFromBuffer(buffer, fileName))
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return {
    fileName,
    fullText,
    charCount: fullText.length,
    sections: {
      requirements: sliceSection(fullText, HEADING_PATTERNS.requirements),
      evaluationCriteria: sliceSection(
        fullText,
        HEADING_PATTERNS.evaluationCriteria,
      ),
      timeline: sliceSection(fullText, HEADING_PATTERNS.timeline),
      termsAndConditions: sliceSection(
        fullText,
        HEADING_PATTERNS.termsAndConditions,
      ),
    },
    jurisdiction: guessJurisdiction(fullText),
  };
}

/** Truncate the full RFP text to a max character budget for the LLM context window. */
export function truncateForContext(rfp: ParsedRfp, maxChars = 80_000): string {
  if (rfp.fullText.length <= maxChars) return rfp.fullText;
  // Keep the executive-summary-ish head and the requirements section.
  const head = rfp.fullText.slice(0, Math.floor(maxChars * 0.6));
  const tail = rfp.fullText.slice(-Math.floor(maxChars * 0.2));
  const requirements = rfp.sections.requirements.slice(
    0,
    Math.floor(maxChars * 0.2),
  );
  return `${head}\n\n[…truncated…]\n\n${requirements}\n\n[…truncated…]\n\n${tail}`;
}
