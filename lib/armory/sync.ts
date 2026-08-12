import { promises as fs } from "node:fs";
import path from "node:path";
import { extractTextFromBuffer, inferDocType } from "./extract";
import { chunkDoc } from "./chunk";
import { embedTexts } from "./embed";
import {
  readManifest,
  upsertChunks,
  writeManifest,
  deleteByDriveItemId,
  type Manifest,
} from "./store";
import type { ArmoryDoc } from "./types";
import { downloadDriveItem, walkArmory } from "./graph";

export type SyncMode =
  | { kind: "sharepoint" }
  | { kind: "fromDir"; dir: string };

export type SyncProgress = (msg: string) => void;

export type SyncResult = {
  totalDocs: number;
  totalChunks: number;
  skipped: number;
  updated: number;
  removed: number;
};

/**
 * Ingest the Armory into Upstash Vector. Idempotent + incremental.
 * Skips files whose eTag matches the last stored eTag.
 */
export async function syncArmory(
  mode: SyncMode,
  onProgress: SyncProgress = () => undefined,
): Promise<SyncResult> {
  const manifest = await readManifest();
  const seenIds = new Set<string>();
  let updated = 0;
  let skipped = 0;
  let totalChunks = 0;
  let totalDocs = 0;

  const process = async (doc: ArmoryDoc) => {
    totalDocs++;
    seenIds.add(doc.driveItemId);
    const prev = manifest[doc.driveItemId];
    if (prev && prev.eTag === doc.eTag) {
      skipped++;
      onProgress(`skip (unchanged): ${doc.docName}`);
      return;
    }
    if (prev) {
      // Doc changed: clear previous chunks first.
      await deleteByDriveItemId(doc.driveItemId);
    }
    const chunks = chunkDoc(doc);
    if (chunks.length === 0) {
      onProgress(`skip (no text): ${doc.docName}`);
      return;
    }
    const vectors = await embedTexts(chunks.map((c) => c.text));
    await upsertChunks(chunks, vectors);
    manifest[doc.driveItemId] = { eTag: doc.eTag, chunkCount: chunks.length };
    updated++;
    totalChunks += chunks.length;
    onProgress(`upsert: ${doc.docName} (${chunks.length} chunks)`);
  };

  if (mode.kind === "sharepoint") {
    for await (const item of walkArmory()) {
      const buffer = await downloadDriveItem(item.id);
      const text = await extractTextFromBuffer(buffer, item.name);
      const doc: ArmoryDoc = {
        driveItemId: item.id,
        docName: item.name,
        docType: inferDocType(
          `${item.parentReference?.path ?? ""}/${item.name}`,
        ),
        webUrl: item.webUrl,
        lastModified: item.lastModifiedDateTime,
        eTag: item.eTag,
        mimeType: item.file?.mimeType,
        size: item.size,
        text,
      };
      await process(doc);
    }
  } else {
    const dir = path.resolve(mode.dir);
    const entries = await walkDir(dir);
    for (const filePath of entries) {
      const relPath = path.relative(dir, filePath);
      const buffer = await fs.readFile(filePath);
      const stat = await fs.stat(filePath);
      const eTag = `${stat.size}-${stat.mtimeMs}`;
      const text = await extractTextFromBuffer(buffer, filePath);
      const driveItemId = `local:${relPath}`;
      const doc: ArmoryDoc = {
        driveItemId,
        docName: path.basename(filePath),
        docType: inferDocType(relPath),
        webUrl: `file://${filePath}`,
        lastModified: stat.mtime.toISOString(),
        eTag,
        size: stat.size,
        text,
      };
      await process(doc);
    }
  }

  // Remove chunks for docs that no longer exist in the source.
  let removed = 0;
  for (const id of Object.keys(manifest)) {
    if (!seenIds.has(id)) {
      await deleteByDriveItemId(id);
      delete manifest[id];
      removed++;
    }
  }

  await writeManifest(manifest);

  return { totalDocs, totalChunks, skipped, updated, removed };
}

async function walkDir(root: string): Promise<string[]> {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop()!;
    const entries = await fs.readdir(cur, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile()) out.push(full);
    }
  }
  return out;
}

export function ensureManifestReset(manifest: Manifest) {
  for (const k of Object.keys(manifest)) delete manifest[k];
}
