/**
 * Bulk-import a CSV / list of URLs from the command line (no server needed).
 *
 * Each site runs in a child process so a hung classifier can be killed
 * (in-process timeouts cannot fire while taxonomy is CPU-bound).
 *
 *   node scripts/import.js sites.csv
 *   node scripts/import.js sites.csv --no-shot
 *   node scripts/import.js sites.csv --concurrency=4
 *   node scripts/import.js sites.csv --timeout=90000
 *   node scripts/import.js sites.csv --reanalyze
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
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

if (!file) {
  console.error("usage: node scripts/import.js <file.csv> [--no-shot] [--concurrency=N] [--timeout=MS] [--reanalyze]");
  process.exit(1);
}

const root = join(__dirname, "..");
const db = openDb(join(root, "data", "allwebsites.db"));
const worker = join(__dirname, "import-one.js");

const raw = readFileSync(file, "utf8");
const urls = parseUrlsFromCsv(raw).map(normalizeUrl).filter(Boolean);

const seen = new Set();
const queue = [];
let skipped = 0;
for (const u of urls) {
  const dom = safeDomain(u);
  if (seen.has(dom)) continue;
  seen.add(dom);
  if (!reanalyze && getSite(db, dom)) {
    skipped++;
    continue;
  }
  queue.push({ url: u, domain: dom });
}

console.log(
  `Loaded ${urls.length} urls -> ${queue.length} to analyze (${skipped} already stored, ${urls.length - queue.length - skipped} duplicates). Concurrency ${concurrency}, screenshots ${noShot ? "OFF" : "ON"}, timeout ${siteTimeoutMs}ms.`
);

let done = 0;
let failed = 0;
let idx = 0;
const t0 = Date.now();

function runOne(item) {
  return new Promise((resolve, reject) => {
    const childArgs = [worker, item.url, item.domain];
    if (noShot) childArgs.push("--no-shot");
    const child = spawn(process.execPath, childArgs, {
      cwd: root,
      env: {
        ...process.env,
        EXISTING_DATE_ADDED: getExistingDateAdded(db, item.domain) || ""
      },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let out = "";
    let err = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (c) => {
      out += c;
    });
    child.stderr.on("data", (c) => {
      err += c;
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, siteTimeoutMs);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (signal === "SIGKILL" || code === null) {
        reject(new Error(`site timeout after ${siteTimeoutMs}ms`));
        return;
      }
      if (code !== 0) {
        reject(new Error((err || `exit ${code}`).trim().split("\n").pop() || `exit ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(out));
      } catch {
        reject(new Error("invalid worker output"));
      }
    });
  });
}

async function work() {
  while (idx < queue.length) {
    const item = queue[idx++];
    const n = idx;
    try {
      const fields = await runOne(item);
      const saved = upsertSite(db, fields);
      done++;
      console.log(
        `  [${n}/${queue.length}] ${item.domain} -> ${saved.category || "uncategorized"}${saved.subcategory ? " / " + saved.subcategory : ""}`
      );
    } catch (e) {
      failed++;
      console.log(`  [${n}/${queue.length}] ${item.domain} -> FAILED: ${e.message}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, work));

const secs = Math.round((Date.now() - t0) / 1000);
console.log(`\nDone. ${done} analyzed, ${failed} failed, ${skipped} skipped, in ${secs}s.`);

function safeDomain(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "site";
  }
}
