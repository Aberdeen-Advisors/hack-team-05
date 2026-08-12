import { Index } from "@upstash/vector";
import type { ParsedRfp } from "@/lib/rfp/parse";

/**
 * Persistence for pursuit records and cached engine results.
 * Uses the existing Upstash Vector index (same store as the Armory) with
 * synthetic sentinel vectors that never surface in similarity search — so
 * we don't need a separate KV / Blob integration for persistence and the
 * whole app runs on a single external data store.
 */

let _index: Index | null = null;

function getIndex(): Index {
  if (_index) return _index;
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN not set.",
    );
  }
  _index = new Index({ url, token });
  return _index;
}

/**
 * Distinct sentinel vectors for pursuit records + cached results — different
 * "1-hot" positions so they never collide with each other or with real text
 * embeddings. Dimension matches text-embedding-3-small = 1536.
 */
const DIM = 1536;
function sentinel(hotIndex: number): number[] {
  const v = new Array(DIM).fill(0);
  v[hotIndex] = 1;
  return v;
}
const PURSUIT_SENTINEL = 1;
const RESULTS_SENTINEL = 2;

export type PursuitRecord = {
  id: string;
  createdAt: string;
  opportunityName?: string;
  clientName?: string;
  rfp: ParsedRfp;
};

const pursuitId = (id: string) => `pursuit:${id}`;
const resultsId = (id: string) => `pursuit-results:${id}`;

// ── Pursuit records ────────────────────────────────────────────────

export async function savePursuit(record: PursuitRecord): Promise<void> {
  const index = getIndex();
  await index.upsert([
    {
      id: pursuitId(record.id),
      vector: sentinel(PURSUIT_SENTINEL),
      metadata: { pursuit: JSON.stringify(record) },
    },
  ]);
}

export async function loadPursuit(id: string): Promise<PursuitRecord | null> {
  try {
    const index = getIndex();
    const recs = await index.fetch([pursuitId(id)], { includeMetadata: true });
    const first = recs?.[0];
    if (!first?.metadata) return null;
    const raw = (first.metadata as Record<string, unknown>).pursuit;
    if (typeof raw !== "string") return null;
    return JSON.parse(raw) as PursuitRecord;
  } catch (err) {
    console.error("[pursuit.load] failed", err);
    return null;
  }
}

export function newPursuitId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Cached engine results ──────────────────────────────────────────
// So the workspace loads instantly on refresh and screenshots don't
// re-burn 5–6 minutes of LLM calls each time.

export type CachedResults = Partial<{
  understand: unknown;
  strategize: unknown;
  match: unknown;
  design: unknown;
  create: unknown;
  runDone: boolean;
}>;

export async function loadCachedResults(id: string): Promise<CachedResults> {
  try {
    const index = getIndex();
    const recs = await index.fetch([resultsId(id)], { includeMetadata: true });
    const first = recs?.[0];
    if (!first?.metadata) return {};
    const raw = (first.metadata as Record<string, unknown>).results;
    if (typeof raw !== "string") return {};
    return JSON.parse(raw) as CachedResults;
  } catch (err) {
    console.error("[results.load] failed", err);
    return {};
  }
}

async function writeCachedResults(
  id: string,
  results: CachedResults,
): Promise<void> {
  const index = getIndex();
  await index.upsert([
    {
      id: resultsId(id),
      vector: sentinel(RESULTS_SENTINEL),
      metadata: { results: JSON.stringify(results) },
    },
  ]);
}

export async function saveEngineResult(
  id: string,
  engine: string,
  result: unknown,
): Promise<void> {
  const existing = await loadCachedResults(id);
  await writeCachedResults(id, { ...existing, [engine]: result });
}

export async function markRunDone(id: string): Promise<void> {
  const existing = await loadCachedResults(id);
  await writeCachedResults(id, { ...existing, runDone: true });
}
