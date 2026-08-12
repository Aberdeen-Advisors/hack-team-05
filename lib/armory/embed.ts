import { embedMany } from "ai";
import { gateway } from "@ai-sdk/gateway";

// text-embedding-3-small is 1536-dim (matches Upstash Vector's default index size).
// Plenty of retrieval quality for a hackathon-sized Armory.
const EMBED_MODEL = "openai/text-embedding-3-small";
const BATCH_SIZE = 64;

/**
 * Batch-embed strings via the Vercel AI Gateway.
 * The Gateway routes to the underlying provider; you only need AI_GATEWAY_API_KEY set.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: gateway.embeddingModel(EMBED_MODEL),
      values: batch,
    });
    out.push(...embeddings);
  }
  return out;
}

export async function embedText(text: string): Promise<number[]> {
  const [v] = await embedTexts([text]);
  return v;
}
