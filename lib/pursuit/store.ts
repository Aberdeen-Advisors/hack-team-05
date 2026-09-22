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

export function newPursuitId(opportunityName?: string): string {
  // Readable, shareable workspace URLs: slug of the opportunity name plus a
  // short random suffix for uniqueness, e.g. "hanger-ai-readiness-k4qz".
  const slug = (opportunityName ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return slug ? `${slug}-${suffix}` : `pursuit-${suffix}`;
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
  /** Per-engine retrieved-source lists (docName/webUrl/docType), keyed by engine name. */
  sources: Record<string, unknown>;
  runDone: boolean;
  /**
   * Run lease: epoch-ms until which one server invocation owns orchestration.
   * A reconnecting client must poll the cache instead of starting a duplicate
   * run. Stale lease (crashed function) => the next connection takes over.
   */
  leaseUntil: number;
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

/**
 * Per-pursuit write mutex. Upstash Vector has no atomic read-modify-write, and
 * we do that pattern (loadCachedResults -> merge -> writeCachedResults) for
 * every save. Concurrent invocations on the same pursuit would race and one
 * would clobber the other — losing an engine result. This chain guarantees
 * all reads-then-writes on the same pursuit id serialize within a Node
 * process. Vercel Fluid Compute keeps warm instances so this is meaningful.
 */
const writeChains: Map<string, Promise<unknown>> = new Map();
function serializeWrite<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const prev = writeChains.get(id) ?? Promise.resolve();
  const next = prev.catch(() => undefined).then(fn);
  writeChains.set(
    id,
    next.finally(() => {
      // Clean up so the map doesn't grow forever. Only drop if we're still
      // the head of the chain (a later write may have already extended it).
      if (writeChains.get(id) === next) writeChains.delete(id);
    }),
  );
  return next;
}

export function saveEngineResult(
  id: string,
  engine: string,
  result: unknown,
): Promise<void> {
  return serializeWrite(id, async () => {
    const existing = await loadCachedResults(id);
    await writeCachedResults(id, { ...existing, [engine]: result });
  });
}

export function saveLease(id: string, leaseUntil: number): Promise<void> {
  return serializeWrite(id, async () => {
    const existing = await loadCachedResults(id);
    await writeCachedResults(id, { ...existing, leaseUntil });
  });
}

export function saveEngineSources(
  id: string,
  engine: string,
  sources: unknown,
): Promise<void> {
  return serializeWrite(id, async () => {
    const existing = await loadCachedResults(id);
    await writeCachedResults(id, {
      ...existing,
      sources: { ...(existing.sources ?? {}), [engine]: sources },
    });
  });
}

/**
 * Retrieval cache — stored in a SEPARATE Upstash record per engine so we
 * stay well under the 48KB metadata-per-record limit. Retrieval hits carry
 * full chunk text and 10 chunks of ~800 tokens each is ~12-16KB per engine;
 * five engines' hits would overflow a single combined record.
 */
const RETRIEVAL_SENTINEL = 3;
const retrievalRecordId = (id: string, engine: string) =>
  `pursuit-retrieval:${id}:${engine}`;

export async function saveEngineRetrieval(
  id: string,
  engine: string,
  hits: unknown,
): Promise<void> {
  try {
    const index = getIndex();
    await index.upsert([
      {
        id: retrievalRecordId(id, engine),
        vector: sentinel(RETRIEVAL_SENTINEL),
        metadata: { hits: JSON.stringify(hits) },
      },
    ]);
  } catch (err) {
    // Cache-write failures are non-fatal — the engine already has its
    // retrieval results; caching just wouldn't survive a resume.
    console.error("[retrieval.save] failed", err);
  }
}

export async function loadEngineRetrieval<T>(
  id: string,
  engine: string,
): Promise<T | undefined> {
  try {
    const index = getIndex();
    const recs = await index.fetch([retrievalRecordId(id, engine)], {
      includeMetadata: true,
    });
    const first = recs?.[0];
    if (!first?.metadata) return undefined;
    const raw = (first.metadata as Record<string, unknown>).hits;
    if (typeof raw !== "string") return undefined;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[retrieval.load] failed", err);
    return undefined;
  }
}

export function markRunDone(id: string): Promise<void> {
  return serializeWrite(id, async () => {
    const existing = await loadCachedResults(id);
    // Belt-and-suspenders: only mark runDone if all five engines are actually
    // populated. Prevents a partial run from being cached as "complete" and
    // short-circuiting future refreshes. If an engine got clobbered by a race,
    // the next refresh will resume-and-run the missing engine instead of
    // reporting run.done immediately.
    const engines = ["understand", "strategize", "match", "design", "create"];
    const allPresent = engines.every(
      (e) => (existing as Record<string, unknown>)[e] != null,
    );
    if (!allPresent) {
      console.warn(
        `[markRunDone] refusing to mark ${id} done — missing engines:`,
        engines.filter((e) => (existing as Record<string, unknown>)[e] == null),
      );
      return;
    }
    await writeCachedResults(id, { ...existing, runDone: true });
  });
}
