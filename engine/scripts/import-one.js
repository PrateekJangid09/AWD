/**
 * Analyze one URL and print the envelope bundle as JSON (stdout).
 * Used by import.js so a hung site can be SIGKILL'd without blocking the batch.
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { runPipeline } from "../src/pipeline/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const url = process.argv[2];
const domain = process.argv[3] || "site";
const noShot = process.argv.includes("--no-shot");
const dateAdded = process.env.EXISTING_DATE_ADDED || "";

if (!url) {
  console.error("usage: node scripts/import-one.js <url> <domain> [--no-shot]");
  process.exit(2);
}

const shotsDir = join(root, "public", "shots");
const fields = {};
const ctx = {
  wantScreenshot: !noShot,
  screenshotPath: join(shotsDir, `${domain}.png`),
  existingDateAdded: dateAdded || null,
  fields,
  stages: {},
  setField: (k, v) => {
    fields[k] = v;
  },
  setStage: () => {}
};

try {
  await runPipeline(url, ctx);
  process.stdout.write(JSON.stringify(fields));
} catch (err) {
  console.error(err && err.message ? err.message : String(err));
  process.exit(1);
}
