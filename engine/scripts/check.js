/**
 * Re-check stored sites: re-runs the pipeline and updates each row. date_added
 * is preserved (upsert keeps the original); last_checked advances. Run on a
 * schedule to keep the directory fresh.
 *
 *   node scripts/check.js            # re-check all
 *   node scripts/check.js linear.app # re-check one domain
 */
import { openDb, upsertSite, getExistingDateAdded, listSites } from "../src/db.js";
import { runPipeline } from "../src/pipeline/index.js";

const only = process.argv[2];
const db = openDb("data/allwebsites.db");
const rows = listSites(db, { limit: 500 }).filter((r) => !only || r.domain === only);

if (!rows.length) { console.log("Nothing to check."); process.exit(0); }
console.log(`Re-checking ${rows.length} site(s)…`);

for (const r of rows) {
  process.stdout.write(`  ${r.domain} … `);
  const fields = {};
  const ctx = {
    wantScreenshot: true,
    screenshotPath: `public/shots/${r.domain}.png`,
    existingDateAdded: getExistingDateAdded(db, r.domain),
    fields, stages: {},
    setField: (k, v) => { fields[k] = v; },
    setStage: () => {}
  };
  try {
    await runPipeline(r.url, ctx);    upsertSite(db, fields);
    console.log("updated");
  } catch (e) { console.log("failed:", e.message); }
}
console.log("Done.");
