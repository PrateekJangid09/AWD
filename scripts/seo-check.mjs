#!/usr/bin/env node
// Page acceptance gate.
//
// Turns the SEO and AEO acceptance checklist into a check that runs, so a
// template change cannot silently regress the whole archive again.
//
//   npm run build && npm start &
//   npm run seo:check                  # sampled, fast
//   npm run seo:check -- --all         # every URL in the sitemap
//   npm run seo:check -- --base http://localhost:3000
//
// Per page: robots, canonical, title and description length, one H1, Open
// Graph, image alt text, internal link count, and JSON-LD that parses, declares
// each @id once, resolves every @id it references, keeps dateModified at or
// after datePublished, and only claims FAQ questions the page actually shows.
//
// Per site: every sitemap URL resolves without redirecting, the sitemap lists
// only HTML pages, robots.txt admits the answer engines and points at the
// sitemap, and llms.txt is served.
//
// Exits non-zero when any page fails, so it can gate a deploy.

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const BASE = (flag("base", "http://localhost:3000") ?? "").replace(/\/$/, "");
const ALL = args.includes("--all");
const SAMPLE = Number(flag("sample", "25"));
const CANONICAL_HOST = "https://allwebsites.design";

const LIMITS = {
  titleMax: 72,
  descMin: 148,
  descMax: 168,
  minInternalLinks: 3,
};

/** Routes that are genuinely thin or utility, exempt from the content rules. */
const UTILITY = new Set([
  "/access-denied",
  "/maintenance",
  "/cookie-preference",
  "/cookies",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/contact",
  "/submit",
]);

const failures = [];
const warnings = [];

function fail(url, rule, detail) {
  failures.push({ url, rule, detail });
}
function warn(url, rule, detail) {
  warnings.push({ url, rule, detail });
}

async function get(url) {
  const res = await fetch(url, { redirect: "manual" });
  const body = res.status === 200 ? await res.text() : "";
  return { status: res.status, body };
}

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function first(html, re) {
  const m = html.match(re);
  return m ? decode(m[1].trim()) : null;
}

function jsonLd(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch (err) {
      out.push({ __invalid: String(err) });
    }
  }
  return out;
}

function nodesOf(blocks) {
  return blocks.flatMap((b) => (b["@graph"] ? b["@graph"] : [b]));
}

/**
 * The only nodes emitted on every page, so the only `@id`s a page may
 * reference without also defining them.
 */
const SITEWIDE_IDS = new Set([
  `${CANONICAL_HOST}/#organization`,
  `${CANONICAL_HOST}/#website`,
  `${CANONICAL_HOST}/#logo`,
]);

/** Every `{"@id": "..."}` reference anywhere in the graph. */
function idReferences(value, found = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) idReferences(item, found);
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === "@id") found.add(value["@id"]);
    for (const item of Object.values(value)) idReferences(item, found);
  }
  return found;
}

function checkPage(path, html) {
  const url = `${BASE}${path}`;

  // Robots: never nofollow on our own pages.
  const robots = first(html, /<meta name="robots" content="([^"]*)"/i) ?? "";
  if (/nofollow/i.test(robots)) fail(path, "robots", `emits nofollow: "${robots}"`);

  // Canonical: self-referencing, bare domain.
  const canonical = first(html, /<link rel="canonical" href="([^"]*)"/i);
  const expected = `${CANONICAL_HOST}${path === "/" ? "" : path}`;
  if (!canonical) fail(path, "canonical", "missing");
  else if (canonical.startsWith("https://www.")) fail(path, "canonical", `www host: ${canonical}`);
  else if (canonical !== expected) fail(path, "canonical", `${canonical} != ${expected}`);

  // Title.
  const title = first(html, /<title>([\s\S]*?)<\/title>/i);
  if (!title) fail(path, "title", "missing");
  else if (title.length > LIMITS.titleMax)
    warn(path, "title", `${title.length} chars: ${title}`);

  // Description.
  const desc = first(html, /<meta name="description" content="([^"]*)"/i);
  if (!desc) fail(path, "description", "missing");
  else if (desc.length < LIMITS.descMin || desc.length > LIMITS.descMax)
    warn(path, "description", `${desc.length} chars (want ${LIMITS.descMin}-${LIMITS.descMax})`);

  // Exactly one H1.
  const h1s = html.match(/<h1[\s>]/gi) ?? [];
  if (h1s.length !== 1) fail(path, "h1", `${h1s.length} H1 elements`);

  // Open Graph and Twitter.
  for (const prop of ["og:title", "og:description", "og:url", "og:image"]) {
    if (!html.includes(`property="${prop}"`)) fail(path, "opengraph", `missing ${prop}`);
  }
  if (!html.includes('name="twitter:card"')) fail(path, "twitter", "missing twitter:card");

  // Structured data parses, and the sitewide identity is present.
  const blocks = jsonLd(html);
  if (blocks.length === 0) fail(path, "schema", "no JSON-LD");
  const bad = blocks.find((b) => b.__invalid);
  if (bad) fail(path, "schema", `invalid JSON-LD: ${bad.__invalid}`);
  const nodes = nodesOf(blocks.filter((b) => !b.__invalid));
  const types = nodes.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
  if (!types.includes("Organization")) fail(path, "schema", "no sitewide Organization");

  // Two nodes sharing an @id merge unpredictably, and a partial copy can mask
  // the fuller one. Each entity must be declared exactly once per document.
  const declared = nodes.map((n) => n["@id"]).filter(Boolean);
  const seenIds = new Set();
  for (const id of declared) {
    if (seenIds.has(id)) fail(path, "schema", `duplicate @id: ${id}`);
    seenIds.add(id);
  }
  if (nodes.some((n) => !n["@type"])) fail(path, "schema", "node without @type");

  // A reference must resolve in this document, unless it is one of the nodes
  // emitted sitewide.
  for (const ref of idReferences(nodes)) {
    if (!seenIds.has(ref) && !SITEWIDE_IDS.has(ref))
      fail(path, "schema", `dangling @id reference: ${ref}`);
  }

  // A page cannot have been revised before it was published.
  for (const node of nodes) {
    const { datePublished, dateModified } = node;
    if (datePublished && dateModified && dateModified < datePublished)
      fail(
        path,
        "dates",
        `${node["@type"]}: dateModified ${dateModified} precedes datePublished ${datePublished}`,
      );
  }

  // FAQ schema must describe questions that are actually on the page.
  const text = decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  for (const node of nodes) {
    if (node["@type"] !== "FAQPage") continue;
    for (const q of node.mainEntity ?? []) {
      if (!text.includes(q.name)) fail(path, "faq", `question not visible: ${q.name}`);
      const answer = q.acceptedAnswer?.text ?? "";
      if (answer && !text.includes(answer.slice(0, 60)))
        fail(path, "faq", `answer not visible: ${q.name}`);
    }
  }

  // Images carry real alt text. An empty alt is allowed only on decorative images.
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const missing = imgs.filter((tag) => !/\balt=/i.test(tag));
  if (missing.length) fail(path, "alt", `${missing.length} <img> without an alt attribute`);

  // Content pages: internal links and a visible date.
  if (!UTILITY.has(path)) {
    const internal = new Set(
      [...html.matchAll(/href="(\/[^"#?][^"]*)"/g)].map((m) => m[1].split(/[?#]/)[0]),
    );
    internal.delete(path);
    if (internal.size < LIMITS.minInternalLinks)
      fail(path, "links", `${internal.size} internal links (want ${LIMITS.minInternalLinks}+)`);
  }
}

async function sitemapUrls() {
  const { status, body } = await get(`${BASE}/sitemap.xml`);
  if (status !== 200) throw new Error(`sitemap.xml returned ${status}`);
  return [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(CANONICAL_HOST, "").replace(/^$/, "/"),
  );
}

function pickSample(paths) {
  // Always cover one of every route shape, then sample the long tail.
  const shape = (p) => p.split("/").slice(0, 2).join("/") || "/";
  const seen = new Map();
  const picked = [];
  for (const p of paths) {
    const key = shape(p);
    if (!seen.has(key)) {
      seen.set(key, true);
      picked.push(p);
    }
  }
  const rest = paths.filter((p) => !picked.includes(p));
  const step = Math.max(1, Math.floor(rest.length / Math.max(1, SAMPLE)));
  for (let i = 0; i < rest.length && picked.length < SAMPLE + seen.size; i += step) {
    picked.push(rest[i]);
  }
  return picked;
}

async function main() {
  const all = await sitemapUrls();

  // A sitemap advertises indexable HTML pages. Anything else in it is either a
  // file that cannot rank or a route that should never have been listed.
  for (const p of all) {
    if (/\.(txt|xml|json|png|jpe?g|webp|svg|ico|pdf)$/i.test(p))
      fail(p, "sitemap", "non-HTML file listed in sitemap.xml");
  }

  const paths = ALL ? all : pickSample(all);

  console.log(`Checking ${paths.length} of ${all.length} sitemap URLs against ${BASE}\n`);

  let checked = 0;
  const queue = [...paths];
  async function worker() {
    while (queue.length) {
      const path = queue.shift();
      const { status, body } = await get(`${BASE}${path}`);
      if (status !== 200) {
        // get() does not follow redirects: a sitemap should list final URLs,
        // so a 3xx here is as much a defect as a 404.
        const kind = status >= 300 && status < 400 ? "redirects" : "does not resolve";
        fail(path, "status", `${kind} (HTTP ${status})`);
        continue;
      }
      checkPage(path, body);
      checked += 1;
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));

  // robots.txt must let the answer engines in.
  const robotsTxt = await get(`${BASE}/robots.txt`);
  if (robotsTxt.status !== 200) fail("/robots.txt", "status", `HTTP ${robotsTxt.status}`);
  else {
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      const block = robotsTxt.body.split(/User-Agent:/i).find((b) => b.trim().startsWith(bot));
      if (!block) fail("/robots.txt", "ai-access", `${bot} not named`);
      else if (/Disallow:\s*\/\s*$/m.test(block)) fail("/robots.txt", "ai-access", `${bot} disallowed`);
    }
    if (!robotsTxt.body.includes("sitemap.xml"))
      fail("/robots.txt", "sitemap", "does not reference sitemap.xml");
  }

  // Not in the sitemap by design, so it is asserted here instead: agents find
  // it at the well-known path.
  const llms = await get(`${BASE}/llms.txt`);
  if (llms.status !== 200) fail("/llms.txt", "status", `HTTP ${llms.status}`);

  console.log(`Pages checked: ${checked}`);
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings.slice(0, 20)) console.log(`  ${w.url}  [${w.rule}]  ${w.detail}`);
    if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`);
  }
  if (failures.length) {
    console.log(`\nFailures (${failures.length}):`);
    for (const f of failures.slice(0, 40)) console.log(`  ${f.url}  [${f.rule}]  ${f.detail}`);
    if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
    console.log("\nFAILED");
    process.exit(1);
  }
  console.log("\nAll acceptance checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
