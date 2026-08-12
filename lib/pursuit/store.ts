import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ParsedRfp } from "@/lib/rfp/parse";

const DIR = path.join(os.tmpdir(), "aberdeen-pursuits");

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

export type PursuitRecord = {
  id: string;
  createdAt: string;
  opportunityName?: string;
  clientName?: string;
  rfp: ParsedRfp;
};

export async function savePursuit(record: PursuitRecord): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DIR, `${record.id}.json`), JSON.stringify(record), "utf8");
}

export async function loadPursuit(id: string): Promise<PursuitRecord | null> {
  try {
    const raw = await fs.readFile(path.join(DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as PursuitRecord;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export function newPursuitId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Cached engine results ──────────────────────────────────────────
// So the workspace loads instantly on refresh (and headless screenshotting
// works) without re-running 5–6 minutes of LLM calls each time.

export type CachedResults = Partial<{
  understand: unknown;
  strategize: unknown;
  match: unknown;
  design: unknown;
  create: unknown;
  runDone: boolean;
}>;

function resultsPath(id: string): string {
  return path.join(DIR, `${id}.results.json`);
}

export async function saveEngineResult(
  id: string,
  engine: string,
  result: unknown,
): Promise<void> {
  await ensureDir();
  const p = resultsPath(id);
  const existing = await loadCachedResults(id);
  const next: CachedResults = { ...existing, [engine]: result };
  await fs.writeFile(p, JSON.stringify(next), "utf8");
}

export async function markRunDone(id: string): Promise<void> {
  await ensureDir();
  const existing = await loadCachedResults(id);
  const next: CachedResults = { ...existing, runDone: true };
  await fs.writeFile(resultsPath(id), JSON.stringify(next), "utf8");
}

export async function loadCachedResults(id: string): Promise<CachedResults> {
  try {
    const raw = await fs.readFile(resultsPath(id), "utf8");
    return JSON.parse(raw) as CachedResults;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
}

