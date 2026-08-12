import { config as loadEnv } from "dotenv";
import { syncArmory, type SyncMode } from "../lib/armory/sync";
import { writeManifest } from "../lib/armory/store";

// Match Next.js precedence: .env.local overrides .env, both feed process.env.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

async function main() {
  const args = process.argv.slice(2);
  const fromDirIdx = args.indexOf("--from-dir");
  const force = args.includes("--force");
  const mode: SyncMode =
    fromDirIdx >= 0
      ? { kind: "fromDir", dir: args[fromDirIdx + 1] ?? "./tmp/armory-dump" }
      : { kind: "sharepoint" };

  console.log(
    `[armory-sync] mode = ${mode.kind}${
      mode.kind === "fromDir" ? ` (${mode.dir})` : ""
    }${force ? " · force" : ""}`,
  );

  if (force) {
    // Clear the eTag manifest so every doc is re-processed instead of skipped.
    await writeManifest({});
    console.log("  · manifest reset");
  }

  const result = await syncArmory(mode, (m) => console.log(`  · ${m}`));

  console.log("");
  console.log("[armory-sync] done:");
  console.log(`  total docs seen : ${result.totalDocs}`);
  console.log(`  updated         : ${result.updated}`);
  console.log(`  skipped         : ${result.skipped}`);
  console.log(`  removed         : ${result.removed}`);
  console.log(`  chunks upserted : ${result.totalChunks}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
