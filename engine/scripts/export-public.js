/**
 * Export allowlisted public site records for page-template generation.
 *
 * Usage:
 *   node scripts/export-public.js
 *   node scripts/export-public.js --out=../../data/engine-sites.json
 *   node scripts/export-public.js --copy-shots
 *
 * Writes ONLY public fields (via toPublicSite). Never dumps profile/evidence.
 * Private SQLite DB stays local and should not be committed.
 */
import { mkdirSync, writeFileSync, existsSync, cpSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.js";
import { toPublicSite } from "../src/publicSite.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const repoRoot = join(root, "..");

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith("--out="));
const outPath = resolve(outArg ? outArg.slice(6) : join(repoRoot, "data", "engine-sites.json"));
const copyShots = args.includes("--copy-shots");

const db = openDb(join(root, "data", "allwebsites.db"));
const rows = db.prepare("SELECT * FROM sites ORDER BY date_added DESC").all();

function hydrate(r) {
  const parse = (s, fb) => {
    try {
      return JSON.parse(s);
    } catch {
      return fb;
    }
  };
  return {
    ...r,
    audience: parse(r.audience, []),
    style: parse(r.style, []),
    palette: parse(r.palette, []),
    fonts: parse(r.fonts, []),
    profile: parse(r.profile, {})
  };
}

const sites = rows.map((r) => toPublicSite(hydrate(r)));

mkdirSync(dirname(outPath), { recursive: true });
const payload = {
  exported_at: new Date().toISOString(),
  count: sites.length,
  sites: sites.map((s) => ({
    ...s,
    slug: s.domain,
    screenshot: rewriteShot(s.screenshot),
    favicon: rewriteShot(s.favicon),
    page_shots: (s.page_shots || []).map((ps) => ({
      ...ps,
      path: rewriteShot(ps.path)
    }))
  }))
};

function rewriteShot(p) {
  if (!p) return p;
  if (p.startsWith("/engine-shots/") || p.startsWith("/screenshots/") || p.startsWith("/fullshots/")) return p;
  const file = String(p).replace(/^\/shots\//, "").replace(/^shots\//, "");
  return file ? `/engine-shots/${file}` : p;
}
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`Exported ${sites.length} public site(s) → ${outPath}`);

if (copyShots) {
  const srcShots = join(root, "public", "shots");
  const destShots = join(repoRoot, "public", "engine-shots");
  if (existsSync(srcShots)) {
    mkdirSync(destShots, { recursive: true });
    for (const name of readdirSync(srcShots)) {
      if (name.startsWith(".")) continue;
      cpSync(join(srcShots, name), join(destShots, name), { recursive: true });
    }
    console.log(`Copied shots → ${destShots}`);
  } else {
    console.log("No shots directory to copy.");
  }
}
