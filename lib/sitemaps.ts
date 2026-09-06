import { CANONICAL, DATASET, liveCategories, recordDates } from "@/lib/canonical";
import { TOOLS } from "@/lib/data";
import { publishedPosts } from "@/lib/journal";
import { NAMED_COLORS, namedColorPath } from "@/lib/named-colors";
import { PALETTE_CATEGORIES, WEBSITE_PALETTES, paletteCategoryPath, palettePath } from "@/lib/mockupalettes";
import { SITE_URL } from "@/lib/seo";

export const SITEMAP_KINDS = ["static", "archive", "colors", "palettes"] as const;
export type SitemapKind = (typeof SITEMAP_KINDS)[number];

export type SitemapEntry = {
  path: string;
  lastModified: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

const CONTENT_UPDATED = new Date(`${DATASET.updatedAt}T00:00:00Z`);

function entry(
  path: string,
  lastModified: Date,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number,
): SitemapEntry {
  return { path, lastModified, changeFrequency, priority };
}

export function staticSitemapEntries(): SitemapEntry[] {
  const routes: [string, SitemapEntry["changeFrequency"], number][] = [
    ["", "daily", 1],
    ["/archive", "daily", 0.9],
    ["/c", "weekly", 0.8],
    ["/tools", "weekly", 0.8],
    ["/research/website-design-index-2026", "monthly", 0.7],
    ["/blogs", "weekly", 0.6],
    ["/about", "monthly", 0.6],
    ["/site-map", "weekly", 0.5],
    ["/manifesto", "yearly", 0.4],
    ["/editorial-guidelines", "yearly", 0.4],
    ["/submit", "monthly", 0.5],
    ["/contact", "yearly", 0.4],
    ["/privacy-policy", "yearly", 0.2],
    ["/terms", "yearly", 0.2],
    ["/cookie-preference", "yearly", 0.2],
  ];

  return [
    ...routes.map(([path, changeFrequency, priority]) =>
      entry(path, CONTENT_UPDATED, changeFrequency, priority),
    ),
    ...TOOLS.map((tool) =>
      entry(`/tools/${tool.slug}`, CONTENT_UPDATED, "monthly", 0.65),
    ),
    ...publishedPosts().map((post) =>
      entry(
        `/blogs/${post.slug}`,
        new Date(`${post.modified}T00:00:00Z`),
        "monthly",
        0.75,
      ),
    ),
  ];
}

export function archiveSitemapEntries(): SitemapEntry[] {
  return [
    ...liveCategories()
      .filter((category) => category.count > 0)
      .map((category) =>
        entry(`/c/${category.slug}`, CONTENT_UPDATED, "weekly", 0.7),
      ),
    ...CANONICAL.map((site) =>
      entry(
        `/archive/${site.identity.slug}`,
        new Date(`${recordDates(site).modified}T00:00:00Z`),
        "monthly",
        0.6,
      ),
    ),
  ];
}

export function colorSitemapEntries(): SitemapEntry[] {
  return NAMED_COLORS.map((color) =>
    entry(namedColorPath(color.slug), CONTENT_UPDATED, "monthly", 0.5),
  );
}

export function paletteSitemapEntries(): SitemapEntry[] {
  return [
    ...PALETTE_CATEGORIES.map((category) =>
      entry(paletteCategoryPath(category.slug), CONTENT_UPDATED, "monthly", 0.55),
    ),
    ...WEBSITE_PALETTES.map((palette) =>
      entry(palettePath(palette), CONTENT_UPDATED, "monthly", 0.5),
    ),
  ];
}

export function sitemapEntries(kind: SitemapKind): SitemapEntry[] {
  if (kind === "static") return staticSitemapEntries();
  if (kind === "archive") return archiveSitemapEntries();
  if (kind === "colors") return colorSitemapEntries();
  return paletteSitemapEntries();
}

export function sitemapIndexLocs() {
  return SITEMAP_KINDS.map((kind) => `${SITE_URL}/sitemaps/${kind}.xml`);
}

export function sitemapUrlsetXml(entries: SitemapEntry[]) {
  const urls = entries
    .map((item) => {
      const loc = item.path ? `${SITE_URL}${item.path}` : SITE_URL;
      return `<url><loc>${loc}</loc><lastmod>${item.lastModified.toISOString()}</lastmod><changefreq>${item.changeFrequency}</changefreq><priority>${item.priority.toFixed(1)}</priority></url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function sitemapIndexXml() {
  const body = sitemapIndexLocs()
    .map((loc) => `<sitemap><loc>${loc}</loc><lastmod>${CONTENT_UPDATED.toISOString()}</lastmod></sitemap>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}
