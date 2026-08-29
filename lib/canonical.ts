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

import type { CardSite } from "./data";

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
    thumb: `${assetBase(s)}/${s.screenshots.desktop ?? "desktop.png"}`,
  };
}

export function canonicalCards(): CardSite[] {
  return CANONICAL.map(canonicalToCard);
}
