/**
 * Bulk-import a CSV / list of URLs from the command line (no server needed).
 *
 *   node scripts/import.js sites.csv
 *   node scripts/import.js sites.csv --no-shot          # skip screenshots (fast)
 *   node scripts/import.js sites.csv --concurrency=4
 *   node scripts/import.js sites.csv --reanalyze        # re-do already-stored sites
 *
 * The CSV can have a header (a column named url/website/link/domain) or be a
 * plain list, one URL per line. Progress prints as it goes; date_added is
 * preserved for sites already in the directory.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { runPipeline } from "../src/pipeline/index.js";
import { openDb, upsertSite, getExistingDateAdded, getSite } from "../src/db.js";
import { parseUrlsFromCsv, normalizeUrl } from "../src/queue.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const noShot = args.includes("--no-shot");
const reanalyze = args.includes("--reanalyze");
const concArg = args.find((a) => a.startsWith("--concurrency="));
const timeoutArg = args.find((a) => a.startsWith("--timeout="));
const siteTimeoutMs = Math.max(15000, parseInt(timeoutArg ? timeoutArg.split("=")[1] : "90000", 10) || 90000);
const concurrency = Math.max(1, Math.min(8, concArg ? parseInt(concArg.split("=")[1]) : 3));

if (!file) { console.error("usage: node scripts/import.js <file.csv> [--no-shot] [--concurrency=N] [--reanalyze]"); process.exit(1); }

const root = join(__dirname, "..");
const db = openDb(join(root, "data", "allwebsites.db"));
const shotsDir = join(root, "public", "shots");

const raw = readFileSync(file, "utf8");
let urls = parseUrlsFromCsv(raw).map(normalizeUrl).filter(Boolean);

// dedupe by domain + optionally skip already-stored
const seen = new Set();
const queue = [];
let skipped = 0;
for (const u of urls) {
  const dom = safeDomain(u);
  if (seen.has(dom)) continue;
  seen.add(dom);
  if (!reanalyze && getSite(db, dom)) { skipped++; continue; }
  queue.push({ url: u, domain: dom });
}

console.log(`Loaded ${urls.length} urls -> ${queue.length} to analyze (${skipped} already stored, ${urls.length - queue.length - skipped} duplicates). Concurrency ${concurrency}, screenshots ${noShot ? "OFF" : "ON"}.`);

let done = 0, failed = 0, idx = 0;
const t0 = Date.now();

async function work() {
  while (idx < queue.length) {
    const item = queue[idx++];
    const n = idx;
    const fields = {};
    const ctx = {
      wantScreenshot: !noShot,
      screenshotPath: join(shotsDir, `${item.domain}.png`),
      existingDateAdded: getExistingDateAdded(db, item.domain),
      fields, stages: {},
      setField: (k, v) => { fields[k] = v; },
      setStage: () => {}
    };
    try {
      await Promise.race([
        runPipeline(item.url, ctx),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`site timeout after ${siteTimeoutMs}ms`)), siteTimeoutMs);
        })
      ]);
      const saved = upsertSite(db, fields);
      done++;
      console.log(`  [${n}/${queue.length}] ${item.domain} -> ${saved.category || "uncategorized"}${saved.subcategory ? " / " + saved.subcategory : ""}`);
    } catch (e) {
      failed++;
      console.log(`  [${n}/${queue.length}] ${item.domain} -> FAILED: ${e.message}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, work));

const secs = Math.round((Date.now() - t0) / 1000);
console.log(`\nDone. ${done} analyzed, ${failed} failed, ${skipped} skipped, in ${secs}s.`);

function safeDomain(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "site"; } }
