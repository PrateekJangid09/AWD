// Typed loader for real canonical website records.
//
// To add a website: drop its canonical.json at  content/sites/<slug>.json
// and its screenshots at  public/sites/<slug>/  (desktop.png, about.png, …).
// No code changes needed — every record here is auto-discovered at build time.
//
// (Server-only module — uses fs. Only import it from Server Components.)
import fs from "node:fs";
import path from "node:path";

export type PaletteEntry = { hex: string; role: string; coverage: number };
export type FontEntry = {
  name: string;
  role: string;
  weights: number[];
  sizes: number[];
};

export type CanonicalSite = {
  schema_version: string;
  site_id: string;
  extractor_version: string;
  identity: {
    name: string;
    domain: string;
    url: string;
    slug: string;
    favicon: string | null;
  };
  classification: {
    category: string | null;
    subcategory: string | null;
    website_type: string | null;
    audience: string[];
    confidence: number | null;
    field_confidence: {
      category?: number;
      subcategory?: number;
      website_type?: number;
      audience?: number;
    };
  };
  design: {
    primary_color: string | null;
    secondary_color: string | null;
    accent_colors: string[];
    background_colors: string[];
    text_color: string | null;
    palette: PaletteEntry[];
    fonts: FontEntry[];
    style_tags: string[];
  };
  technology: {
    summary: string | null;
    builder_cms: string[];
    framework: string[];
    language: string | null;
    hosting: string[];
    cdn: string[];
    storage: string[];
    frontend: string[];
    ecommerce: string[];
    web_server: string[];
  };
  contact: {
    email: string | null;
    on_official_domain: boolean | null;
    other_emails: string[];
    address: string | null;
  };
  social: { linkedin: string | null; x: string | null };
  seo: { title: string | null; description: string | null };
  pages: Record<string, string | null>;
  screenshots: {
    desktop: string | null;
    pages: { label: string; file: string }[];
  };
  assets: { favicon: string | null };
  extraction: {
    status: string;
    extracted_at: string | null;
    completeness: number | null;
    extractor_version: string;
    module_status?: Record<string, boolean>;
  };
};

function loadAll(): CanonicalSite[] {
  const dir = path.join(process.cwd(), "content", "sites");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as CanonicalSite;
      } catch {
        return null;
      }
    })
    .filter((s): s is CanonicalSite => Boolean(s && s.identity?.slug))
    .sort((a, b) => a.identity.name.localeCompare(b.identity.name));
}

export const CANONICAL: CanonicalSite[] = loadAll();

export function getCanonical(slug: string) {
  return CANONICAL.find((s) => s.identity.slug === slug);
}

export function listCanonical() {
  return CANONICAL;
}

// Public asset base for a record's screenshots/favicon.
export function assetBase(site: CanonicalSite) {
  return `/sites/${site.identity.slug}`;
}

/* ── Dataset provenance ──────────────────────────────────────────
   Dates are declared in content/dataset.json and only move when the
   records actually change, so datePublished/dateModified never drift
   with an unrelated deploy. */

type DatasetMeta = {
  name: string;
  description: string;
  method: string;
  publishedAt: string;
  updatedAt: string;
};

function loadDataset(): DatasetMeta {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "content", "dataset.json"),
      "utf8",
    );
    return JSON.parse(raw) as DatasetMeta;
  } catch {
    const today = new Date().toISOString().slice(0, 10);
    return {
      name: "AllWebsites.Design website design archive",
      description: "Constructed, source-verified records of real websites.",
      method: "unknown",
      publishedAt: today,
      updatedAt: today,
    };
  }
}

export const DATASET: DatasetMeta = loadDataset();

function isoDay(value: string | null | undefined) {
  if (!value) return null;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value.trim());
  return match ? match[0] : null;
}

/** When this record's data was published and last revised (ISO yyyy-mm-dd). */
export function recordDates(site: CanonicalSite) {
  const extracted = isoDay(site.extraction.extracted_at);
  return {
    published: extracted ?? DATASET.publishedAt,
    modified: extracted ?? DATASET.updatedAt,
  };
}

/* ── Screenshot dimensions ───────────────────────────────────────
   Read straight from the file header so <Image> can reserve the right
   box and emit a resized srcset instead of shipping the full capture. */

function pngSize(buf: Buffer) {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function webpSize(buf: Buffer) {
  if (buf.length < 30) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8X") {
    const read24 = (offset: number) =>
      buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16);
    return { width: read24(24) + 1, height: read24(27) + 1 };
  }
  return null;
}

const sizeCache = new Map<string, { width: number; height: number } | null>();

/** Intrinsic size of a file under /public, or null when it cannot be read. */
export function imageSize(publicPath: string) {
  const cached = sizeCache.get(publicPath);
  if (cached !== undefined) return cached;

  let size: { width: number; height: number } | null = null;
  try {
    const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    const handle = fs.openSync(file, "r");
    try {
      const buf = Buffer.alloc(40);
      fs.readSync(handle, buf, 0, 40, 0);
      size = webpSize(buf) ?? pngSize(buf);
    } finally {
      fs.closeSync(handle);
    }
  } catch {
    size = null;
  }

  if (size && (size.width <= 0 || size.height <= 0)) size = null;
  sizeCache.set(publicPath, size);
  return size;
}

import { CATEGORIES, categoryColor, type CardSite, type Category } from "./data";

// Map a canonical record into the lightweight archive-card shape,
// with a real screenshot thumbnail.
export function canonicalToCard(s: CanonicalSite): CardSite {
  return {
    slug: s.identity.slug,
    name: s.identity.name,
    domain: s.identity.domain,
    categoryName: s.classification.category ?? "Uncategorised",
    style: s.design.style_tags[0] ?? "Site",
    summary: s.seo.description ?? "",
    palette: s.design.palette.map((p) => ({ role: p.role, hex: p.hex })),
    thumb: s.screenshots.desktop
      ? `${assetBase(s)}/${s.screenshots.desktop}`
      : undefined,
  };
}

export function canonicalCards(): CardSite[] {
  return CANONICAL.map(canonicalToCard);
}

export function categorySlug(name: string | null | undefined) {
  return (
    (name ?? "other")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "other"
  );
}

export function canonicalCardsInCategory(slug: string) {
  return CANONICAL.filter((s) => categorySlug(s.classification.category) === slug).map(
    canonicalToCard,
  );
}

export function canonicalCategoryStats() {
  const map = new Map<string, { name: string; count: number }>();
  for (const s of CANONICAL) {
    const name = s.classification.category ?? "Other";
    const slug = categorySlug(name);
    const cur = map.get(slug) ?? { name, count: 0 };
    cur.count += 1;
    map.set(slug, cur);
  }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count);
}

export function resolveCategory(slug: string): Category | undefined {
  const live = canonicalCategoryStats().find((c) => c.slug === slug);
  const known = CATEGORIES.find((c) => c.slug === slug);
  const total = Math.max(CANONICAL.length, 1);
  const count = live?.count ?? 0;
  const share = `${((count / total) * 100).toFixed(1)}%`;
  if (known) {
    return { ...known, count, share };
  }
  if (live) {
    return {
      slug,
      name: live.name,
      count,
      share,
      blurb: `Website design references classified as ${live.name}.`,
      descriptors: [],
      accent: categoryColor(live.name),
    };
  }
  return undefined;
}

export function liveCategories(): Category[] {
  const live = canonicalCategoryStats();
  const seen = new Set<string>();
  const out: Category[] = [];
  for (const row of live) {
    const cat = resolveCategory(row.slug);
    if (cat) {
      out.push(cat);
      seen.add(row.slug);
    }
  }
  for (const c of CATEGORIES) {
    if (!seen.has(c.slug)) out.push({ ...c, count: 0, share: "0%" });
  }
  return out;
}
