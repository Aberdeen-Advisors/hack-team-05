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
