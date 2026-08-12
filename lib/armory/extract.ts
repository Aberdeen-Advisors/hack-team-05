import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { parseOffice } from "officeparser";
import type { DocType } from "./types";

/** Route a buffer through the right text extractor based on file extension. */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  switch (ext) {
    case "pdf": {
      const uint8 = new Uint8Array(buffer);
      const pdf = await getDocumentProxy(uint8);
      const { text } = await extractText(pdf, { mergePages: true });
      return Array.isArray(text) ? text.join("\n\n") : (text as string);
    }
    case "docx":
    case "doc": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "pptx":
    case "xlsx": {
      const ast = await parseOffice(buffer);
      const text = await ast.to("text");
      return text.value ?? "";
    }
    case "txt":
    case "md":
    case "markdown":
      return buffer.toString("utf8");
    default: {
      // Best-effort: try utf8. If it looks binary, return empty.
      const utf = buffer.toString("utf8");
      if (utf.length === 0) return "";
      if (utf.replace(/\p{L}|\p{N}|\s|\p{P}/gu, "").length / utf.length > 0.3) {
        return "";
      }
      return utf;
    }
  }
}

/**
 * Explicit filename → doctype overrides for the known Aberdeen Armory files.
 * Checked first; falls through to the folder/heuristic logic below.
 * Match is case-insensitive substring on basename.
 */
const KNOWN_FILES: { match: string; type: DocType }[] = [
  { match: "aberdeen culture charter", type: "culture" },
  { match: "aberdeen advisors overview", type: "credentials" },
  { match: "top clients + types of work", type: "credentials" },
  { match: "aberdeen_response_hanger_ai_rfp", type: "proposal" },
  { match: "case for digital transformation", type: "services" },
  { match: "vmo swot tools", type: "services" },
  { match: "data archiving_option comparison", type: "case-study" },
  { match: "san mateo cio", type: "case-study" },
  { match: "hanger_ai_rfp_final", type: "market-research" }, // prior RFP, not Aberdeen IP
];

/**
 * Cheap heuristic to bucket a doc by name/path. Used for metadata-filtered retrieval.
 * The team can override by prefixing folders in SharePoint (e.g., "Case Studies/…").
 */
export function inferDocType(pathOrName: string): DocType {
  const p = pathOrName.toLowerCase();
  for (const { match, type } of KNOWN_FILES) {
    if (p.includes(match)) return type;
  }
  if (p.includes("case stud") || p.includes("case-study")) return "case-study";
  if (p.includes("proposal") || p.includes("rfp response")) return "proposal";
  if (p.includes("credential") || p.includes("team") || p.includes("bio"))
    return "credentials";
  if (p.includes("culture") || p.includes("charter")) return "culture";
  if (p.includes("service") || p.includes("offering")) return "services";
  if (
    p.includes("boilerplate") ||
    p.includes("standard") ||
    p.includes("faq") ||
    p.includes("office") ||
    p.includes("insurance")
  )
    return "boilerplate";
  if (p.includes("market") || p.includes("research") || p.includes("industry"))
    return "market-research";
  return "unknown";
}
