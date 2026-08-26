/**
 * Storage for the directory. Uses the built-in node:sqlite (same choice as the
 * DTC tool). Each analyzed site is one row: the full envelope bundle is kept as
 * JSON in `profile`, and the handful of fields the gallery filters/sorts on are
 * mirrored into real columns for fast queries.
 */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDb(path = "data/allwebsites.db") {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      domain        TEXT UNIQUE NOT NULL,
      url           TEXT NOT NULL,
      name          TEXT,
      description   TEXT,
      category      TEXT,
      subcategory   TEXT,
      website_type  TEXT,
      audience      TEXT,
      style         TEXT,
      palette       TEXT,   -- JSON array of hex
      fonts         TEXT,   -- JSON array
      linkedin      TEXT,
      x             TEXT,
      contact_email TEXT,
      contact_address TEXT,
      tech_summary  TEXT,
      favicon       TEXT,
      screenshot    TEXT,   -- relative path under /shots
      profile       TEXT NOT NULL, -- full envelope bundle as JSON
      date_added    TEXT NOT NULL,
      last_checked  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sites_category ON sites(category);
    CREATE INDEX IF NOT EXISTS idx_sites_style ON sites(style);
    CREATE INDEX IF NOT EXISTS idx_sites_added ON sites(date_added);
  `);
  return db;
}

const val = (env) => (env && env.value !== undefined ? env.value : null);

/** Flatten an envelope bundle into a storable row and upsert by domain. */
export function upsertSite(db, fields) {
  const link = val(fields.dp_official_link) || {};
  const domain = link.registrable_domain || safeDomain(link.url);
  const internal = fields._internal || {};
  const pal = val(fields.dp_palette);
  const social = val(fields.dp_social) || {};

  const row = {
    domain,
    url: link.url || "",
    name: val(fields.dp_name),
    description: val(fields.dp_description),
    category: val(fields.dp_category),
    subcategory: val(fields.dp_subcategory),
    website_type: val(fields.dp_website_type),
    audience: JSON.stringify(val(fields.dp_audience) || []),
    style: JSON.stringify(val(fields.dp_style) || []),
    palette: JSON.stringify(Array.isArray(pal) ? pal.map((p) => p.hex || p) : []),
    fonts: JSON.stringify(val(fields.dp_fonts) || []),
    linkedin: social.linkedin || null,
    x: social.x || null,
    contact_email: (val(fields.dp_contact) || {}).email || null,
    contact_address: (val(fields.dp_contact) || {}).address || null,
    tech_summary: (val(fields.dp_tech_stack) || {}).summary || null,
    favicon: (val(fields.dp_favicon) || {}).path || (val(fields.dp_favicon) || {}).url || null,
    screenshot: (val(fields.dp_screenshot) || {}).path || null,
    profile: JSON.stringify(fields),
    date_added: internal.date_added || new Date().toISOString(),
    last_checked: internal.last_checked || new Date().toISOString()
  };

  const stmt = db.prepare(`
    INSERT INTO sites (domain,url,name,description,category,subcategory,website_type,audience,style,palette,fonts,linkedin,x,contact_email,contact_address,tech_summary,favicon,screenshot,profile,date_added,last_checked)
    VALUES (:domain,:url,:name,:description,:category,:subcategory,:website_type,:audience,:style,:palette,:fonts,:linkedin,:x,:contact_email,:contact_address,:tech_summary,:favicon,:screenshot,:profile,:date_added,:last_checked)
    ON CONFLICT(domain) DO UPDATE SET
      url=:url, name=:name, description=:description, category=:category, subcategory=:subcategory,
      website_type=:website_type, audience=:audience, style=:style, palette=:palette, fonts=:fonts,
      linkedin=:linkedin, x=:x, contact_email=:contact_email, contact_address=:contact_address, tech_summary=:tech_summary, favicon=:favicon, screenshot=:screenshot, profile=:profile, last_checked=:last_checked
  `);
  stmt.run(row);
  return getSite(db, domain);
}

export function getExistingDateAdded(db, domain) {
  const r = db.prepare("SELECT date_added FROM sites WHERE domain = ?").get(domain);
  return r ? r.date_added : null;
}

export function getSite(db, domain) {
  const r = db.prepare("SELECT * FROM sites WHERE domain = ?").get(domain);
  return r ? hydrate(r) : null;
}

export function listSites(db, { category, style, q, sort = "recent", limit = 60, offset = 0 } = {}) {
  const where = [];
  const args = {};
  if (category) { where.push("category = :category"); args.category = category; }
  if (style) { where.push("style LIKE :style"); args.style = `%"${style}"%`; }
  if (q) { where.push("(name LIKE :q OR description LIKE :q OR domain LIKE :q)"); args.q = `%${q}%`; }
  const order = sort === "az" ? "name COLLATE NOCASE ASC" : sort === "category" ? "category ASC, name ASC" : "date_added DESC";
  const sql = `SELECT * FROM sites ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order} LIMIT :limit OFFSET :offset`;
  args.limit = limit; args.offset = offset;
  return db.prepare(sql).all(args).map(hydrate);
}

export function facets(db) {
  const cats = db.prepare("SELECT category AS name, COUNT(*) AS n FROM sites WHERE category IS NOT NULL GROUP BY category ORDER BY n DESC").all();
  const total = db.prepare("SELECT COUNT(*) AS n FROM sites").get().n;
  return { categories: cats, total };
}

function hydrate(r) {
  return {
    ...r,
    audience: safeParse(r.audience, []),
    style: safeParse(r.style, []),
    palette: safeParse(r.palette, []),
    fonts: safeParse(r.fonts, []),
    profile: safeParse(r.profile, {})
  };
}
function safeParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }
function safeDomain(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }
