import { embedText } from "./embed";
import { queryVector } from "./store";
import type { DocType, RetrieveHit } from "./types";

export type RetrieveOpts = {
  k?: number;
  docType?: DocType | DocType[];
};

export async function retrieve(
  query: string,
  opts: RetrieveOpts = {},
): Promise<RetrieveHit[]> {
  const vector = await embedText(query);
  let filter: string | undefined;
  if (opts.docType) {
    const types = Array.isArray(opts.docType) ? opts.docType : [opts.docType];
    if (types.length === 1) {
      filter = `docType = '${types[0]}'`;
    } else {
      filter = types.map((t) => `docType = '${t}'`).join(" OR ");
    }
  }
  return queryVector(vector, { topK: opts.k ?? 6, filter });
}

/**
 * Format retrieved chunks as a system-prompt-friendly context block with citation ids
 * the model can reference by [C#] token. Returns both the text block and the chunk lookup
 * so downstream code can resolve citations back to webUrl/docName.
 */
export function formatContext(hits: RetrieveHit[]): {
  contextText: string;
  citations: { tag: string; chunkId: string; docName: string; webUrl: string }[];
} {
  const citations = hits.map((h, i) => ({
    tag: `C${i + 1}`,
    chunkId: h.chunk.id,
    docName: h.chunk.docName,
    webUrl: h.chunk.webUrl,
  }));

  const contextText = hits
    .map((h, i) => {
      return [
        `[C${i + 1}] ${h.chunk.docName} — ${h.chunk.sectionPath} (${h.chunk.docType})`,
        h.chunk.text.trim(),
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return { contextText, citations };
}
