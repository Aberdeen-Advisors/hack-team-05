import { encodingForModel, getEncoding } from "js-tiktoken";
import type { ArmoryChunk, ArmoryDoc } from "./types";

const CHUNK_TOKENS = 800;
const OVERLAP_TOKENS = 100;

function getEncoder() {
  try {
    return encodingForModel("text-embedding-3-large");
  } catch {
    return getEncoding("cl100k_base");
  }
}

/**
 * Split doc text into ~800-token chunks with ~100 overlap.
 * Respect paragraph boundaries when possible so retrieval hits meaningful units.
 */
export function chunkDoc(doc: ArmoryDoc): ArmoryChunk[] {
  const enc = getEncoder();
  const paragraphs = doc.text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: ArmoryChunk[] = [];
  let current: string[] = [];
  let currentTokens = 0;
  let currentSection = "";

  const flush = () => {
    if (current.length === 0) return;
    const text = current.join("\n\n");
    const tokens = enc.encode(text).length;
    chunks.push({
      id: `${doc.driveItemId}#${chunks.length}`,
      driveItemId: doc.driveItemId,
      docName: doc.docName,
      docType: doc.docType,
      webUrl: doc.webUrl,
      sectionPath: currentSection || doc.docName,
      chunkIndex: chunks.length,
      text,
      tokenCount: tokens,
    });
  };

  for (const p of paragraphs) {
    // Detect obvious section headings (short, no terminal period, mostly title case).
    const looksLikeHeading =
      p.length < 100 &&
      !p.endsWith(".") &&
      p.split(/\s+/).length <= 12 &&
      /^[A-Z0-9]/.test(p);
    if (looksLikeHeading) {
      currentSection = p;
    }

    const pTokens = enc.encode(p).length;

    if (currentTokens + pTokens > CHUNK_TOKENS && current.length > 0) {
      flush();
      // Overlap: keep the tail of the previous chunk (last few paragraphs).
      const overlap: string[] = [];
      let overlapTokens = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const t = enc.encode(current[i]).length;
        if (overlapTokens + t > OVERLAP_TOKENS) break;
        overlap.unshift(current[i]);
        overlapTokens += t;
      }
      current = overlap;
      currentTokens = overlapTokens;
    }

    // Handle giant paragraphs (>CHUNK_TOKENS) by hard-splitting on tokens.
    if (pTokens > CHUNK_TOKENS) {
      if (current.length > 0) flush();
      current = [];
      currentTokens = 0;
      const encoded = enc.encode(p);
      for (let i = 0; i < encoded.length; i += CHUNK_TOKENS - OVERLAP_TOKENS) {
        const slice = encoded.slice(i, i + CHUNK_TOKENS);
        const sliceText = enc.decode(slice);
        chunks.push({
          id: `${doc.driveItemId}#${chunks.length}`,
          driveItemId: doc.driveItemId,
          docName: doc.docName,
          docType: doc.docType,
          webUrl: doc.webUrl,
          sectionPath: currentSection || doc.docName,
          chunkIndex: chunks.length,
          text: sliceText,
          tokenCount: slice.length,
        });
      }
      continue;
    }

    current.push(p);
    currentTokens += pTokens;
  }

  flush();
  return chunks;
}
