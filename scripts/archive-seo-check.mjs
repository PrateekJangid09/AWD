#!/usr/bin/env node
// Archive SEO gate.
//
// Catches the Ubersuggest class of regressions without a running server:
// colliding study titles, slug/file mismatches, checkout leaking into the
// sitemap, and category/hub copy that fell back to a generic blurb.
//
//   npm run seo:archive

import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const TITLE_MAX = 60;
const NAME_MAX = 30;
const failures = [];

function fail(rule, detail) {
  failures.push({ rule, detail });
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function shortName(raw) {
  const name = String(raw ?? "").trim();
  const piped = name.split(/\s*\|\s*/).filter(Boolean);
  let candidate =
    piped.length === 2
      ? piped.reduce((a, b) => (a.length <= b.length ? a : b))
      : name;
  candidate = candidate.split(/\s+[–—⋅›•·]\s+|\s+-\s+|:\s+/)[0].trim() || name;
  if (candidate.length <= NAME_MAX) return candidate;
  const beforeComma = candidate.split(",")[0].trim();
  if (beforeComma.length >= 3 && beforeComma.length <= NAME_MAX) return beforeComma;
  if (beforeComma.length >= 3) candidate = beforeComma;
  const words = candidate.split(/\s+/);
  const lead = [];
  for (const word of words) {
    if (lead.length > 0 && /^[a-z]/.test(word)) break;
    lead.push(word);
  }
  const leading = lead.join(" ");
  if (leading.length >= 3 && leading.length <= NAME_MAX) return leading;
  const clipped = candidate.slice(0, NAME_MAX);
  const atWord = clipped.slice(0, clipped.lastIndexOf(" "));
  return (atWord.length >= 12 ? atWord : clipped).replace(/[\s,;:•·-]+$/, "");
}

function hostLabel(domain) {
  return String(domain ?? "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

function displayName(site, brands) {
  const brand = shortName(site.identity.name);
  const clash = brands.get(brand) > 1;
  if (!clash) return brand;
  return `${brand} (${hostLabel(site.identity.domain)})`;
}

function studyTitle(site, brands) {
  const brand = displayName(site, brands);
  const preferred = `${brand} Website Design`;
  if (preferred.length <= TITLE_MAX) return preferred;
  const compact = `${brand} Design`;
  if (compact.length <= TITLE_MAX) return compact;
  return brand.slice(0, TITLE_MAX);
}

const dir = join(root, "content", "sites");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const records = files.map((file) => {
  const site = JSON.parse(readFileSync(join(dir, file), "utf8"));
  return { file, site };
});

const slugs = new Map();
const brands = new Map();
for (const { file, site } of records) {
  const slug = site?.identity?.slug;
  if (!slug) {
    fail("slug", `${file}: missing identity.slug`);
    continue;
  }
  if (basename(file, ".json") !== slug) {
    fail("slug", `${file}: filename does not match identity.slug "${slug}"`);
  }
  if (slugs.has(slug)) fail("slug", `duplicate slug "${slug}" (${slugs.get(slug)} and ${file})`);
  slugs.set(slug, file);
  const brand = shortName(site.identity.name);
  brands.set(brand, (brands.get(brand) ?? 0) + 1);
}

const titles = new Map();
for (const { file, site } of records) {
  if (!site?.identity?.slug) continue;
  const title = studyTitle(site, brands);
  const h1 = displayName(site, brands);
  if (!title) fail("title", `${file}: empty study title`);
  if (title.length > TITLE_MAX) fail("title", `${file}: ${title.length} chars > ${TITLE_MAX}: ${title}`);
  if (titles.has(title)) {
    fail(
      "title",
      `duplicate title "${title}" (${titles.get(title)} and ${file})`,
    );
  }
  titles.set(title, file);
  if (!h1) fail("h1", `${file}: empty display name`);
  if (!title.startsWith(h1)) {
    fail("h1", `${file}: title "${title}" does not start with H1 "${h1}"`);
  }
}

const seo = read("lib/seo.ts");
if (!seo.includes("export function displayName")) {
  fail("source", "lib/seo.ts must export displayName for colliding brands");
}
if (!/studyTitle\(site: CanonicalSite \| string\)/.test(seo) && !seo.includes("displayName(site)")) {
  fail("source", "studyTitle must use displayName for canonical records");
}

const recordPage = read("app/archive/[slug]/page.tsx");
if (!recordPage.includes("studyTitle(rec)")) {
  fail("source", "archive record metadata must call studyTitle(rec)");
}

const siteRecord = read("components/SiteRecord.tsx");
if (!siteRecord.includes("displayName(site)")) {
  fail("source", "SiteRecord H1 must render displayName(site)");
}

const sitemap = read("app/sitemap.ts");
if (/path:\s*"\/checkout"/.test(sitemap)) {
  fail("sitemap", "checkout must not be listed in sitemap.ts");
}
if (!sitemap.includes("CANONICAL.map") || !sitemap.includes("/archive/${s.identity.slug}")) {
  fail("sitemap", "sitemap must list every canonical archive slug");
}

const checkout = read("app/checkout/page.tsx");
if (!/index:\s*false/.test(checkout)) {
  fail("robots", "checkout page must set index: false");
}

const archiveHub = read("app/archive/page.tsx");
if (!archiveHub.includes('href={`/c/${category.slug}`}')) {
  fail("hubs", "/archive must emit crawlable /c/{slug} links");
}

const categoryPage = read("app/c/[category]/page.tsx");
if (!categoryPage.includes("categoryIntro") || !categoryPage.includes("categoryPatterns")) {
  fail("category", "category pages must use unique intro and patterns copy");
}
if (!categoryPage.includes("{cat.name} Website Design Inspiration")) {
  fail("category", "category H1 must be unique per industry name");
}

const categoryHub = read("app/c/page.tsx");
if (!categoryHub.includes("categoryLine")) {
  fail("hubs", "/c cards must use categoryLine from archive stats");
}

const toolsHub = read("app/tools/page.tsx");
if (!toolsHub.includes('href={`/tools/${tool.slug}`}')) {
  fail("hubs", "/tools must emit a crawlable journey of tool links");
}

const chromary = read("public/tools/chromary.html");
const chromaryTitle = chromary.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
if (chromaryTitle !== "HEX Color Name Finder — Chromary") {
  fail("chromary", `expected HEX Color Name Finder — Chromary, got "${chromaryTitle}"`);
}

console.log(`Checked ${records.length} archive records`);
if (failures.length) {
  console.log(`\nFailures (${failures.length}):`);
  for (const f of failures) console.log(`  [${f.rule}]  ${f.detail}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("All archive SEO checks passed.");
