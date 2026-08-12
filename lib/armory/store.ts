import { Index } from "@upstash/vector";
import type { ArmoryChunk, RetrieveHit } from "./types";

let _index: Index | null = null;

function getIndex(): Index {
  if (_index) return _index;
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN not set. Provision Upstash Vector via the Vercel Marketplace and run `vercel env pull`.",
    );
  }
  _index = new Index({ url, token });
  return _index;
}

type UpsertVector = {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
};

export async function upsertChunks(
  chunks: ArmoryChunk[],
  vectors: number[][],
): Promise<void> {
  if (chunks.length !== vectors.length) {
    throw new Error(
      `chunk count (${chunks.length}) != vector count (${vectors.length})`,
    );
  }
  const index = getIndex();
  const payload: UpsertVector[] = chunks.map((c, i) => ({
    id: c.id,
    vector: vectors[i],
    metadata: {
      driveItemId: c.driveItemId,
      docName: c.docName,
      docType: c.docType,
      webUrl: c.webUrl,
      sectionPath: c.sectionPath,
      chunkIndex: c.chunkIndex,
      tokenCount: c.tokenCount,
      text: c.text,
    },
  }));
  // Upstash handles batching internally, but we still split to be gentle.
  const BATCH = 100;
  for (let i = 0; i < payload.length; i += BATCH) {
    await index.upsert(payload.slice(i, i + BATCH));
  }
}

export async function queryVector(
  vector: number[],
  opts: { topK?: number; filter?: string } = {},
): Promise<RetrieveHit[]> {
  const index = getIndex();
  const results = await index.query({
    vector,
    topK: opts.topK ?? 6,
    includeMetadata: true,
    filter: opts.filter,
  });
  return results.map((r) => {
    const m = r.metadata as Record<string, unknown>;
    return {
      score: r.score,
      chunk: {
        id: String(r.id),
        driveItemId: String(m.driveItemId ?? ""),
        docName: String(m.docName ?? ""),
        docType: (m.docType ?? "unknown") as ArmoryChunk["docType"],
        webUrl: String(m.webUrl ?? ""),
        sectionPath: String(m.sectionPath ?? ""),
        chunkIndex: Number(m.chunkIndex ?? 0),
        text: String(m.text ?? ""),
        tokenCount: Number(m.tokenCount ?? 0),
      },
    };
  });
}

/** Simple manifest so re-syncs skip unchanged files. Stored as a single metadata blob. */
const MANIFEST_ID = "__armory_manifest__";
export type Manifest = Record<string, { eTag: string; chunkCount: number }>;

export async function readManifest(): Promise<Manifest> {
  try {
    const index = getIndex();
    const rec = await index.fetch([MANIFEST_ID], { includeMetadata: true });
    const first = rec?.[0];
    if (!first?.metadata) return {};
    const raw = (first.metadata as Record<string, unknown>).manifest;
    if (typeof raw !== "string") return {};
    return JSON.parse(raw) as Manifest;
  } catch {
    return {};
  }
}

export async function writeManifest(manifest: Manifest): Promise<void> {
  const index = getIndex();
  // Manifest lives at a fixed ID with a zero vector — never returned by queries because
  // the zero vector has effectively no cosine similarity to normalized real vectors.
  const dim = 3072;
  const zeros = new Array(dim).fill(0);
  await index.upsert([
    {
      id: MANIFEST_ID,
      vector: zeros,
      metadata: { manifest: JSON.stringify(manifest) },
    },
  ]);
}

export async function deleteByDriveItemId(driveItemId: string): Promise<void> {
  const index = getIndex();
  // We don't know how many chunks; delete a generous range by ID prefix pattern.
  // Upstash Vector doesn't support prefix delete, so caller must know the count.
  // For simplicity, delete first 200 possible chunk IDs.
  const ids = Array.from({ length: 200 }, (_, i) => `${driveItemId}#${i}`);
  await index.delete(ids);
}
