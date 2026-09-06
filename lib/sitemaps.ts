import { CANONICAL, DATASET, liveCategories, recordDates } from "@/lib/canonical";
import { TOOLS } from "@/lib/data";
import { publishedPosts } from "@/lib/journal";
import { NAMED_COLORS, namedColorPath } from "@/lib/named-colors";
import { PALETTE_CATEGORIES, WEBSITE_PALETTES, paletteCategoryPath, palettePath } from "@/lib/mockupalettes";

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

function staticSitemapEntries(): SitemapEntry[] {
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

function archiveSitemapEntries(): SitemapEntry[] {
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

function colorSitemapEntries(): SitemapEntry[] {
  return NAMED_COLORS.map((color) =>
    entry(namedColorPath(color.slug), CONTENT_UPDATED, "monthly", 0.5),
  );
}

function paletteSitemapEntries(): SitemapEntry[] {
  return [
    ...PALETTE_CATEGORIES.map((category) =>
      entry(paletteCategoryPath(category.slug), CONTENT_UPDATED, "monthly", 0.55),
    ),
    ...WEBSITE_PALETTES.map((palette) =>
      entry(palettePath(palette), CONTENT_UPDATED, "monthly", 0.5),
    ),
  ];
}

export function allSitemapEntries(): SitemapEntry[] {
  return [
    ...staticSitemapEntries(),
    ...archiveSitemapEntries(),
    ...colorSitemapEntries(),
    ...paletteSitemapEntries(),
  ];
}
