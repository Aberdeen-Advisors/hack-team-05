import "dotenv/config";
import { syncArmory, type SyncMode } from "../lib/armory/sync";

async function main() {
  const args = process.argv.slice(2);
  const fromDirIdx = args.indexOf("--from-dir");
  const mode: SyncMode =
    fromDirIdx >= 0
      ? { kind: "fromDir", dir: args[fromDirIdx + 1] ?? "./tmp/armory-dump" }
      : { kind: "sharepoint" };

  console.log(
    `[armory-sync] mode = ${mode.kind}${
      mode.kind === "fromDir" ? ` (${mode.dir})` : ""
    }`,
  );

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
