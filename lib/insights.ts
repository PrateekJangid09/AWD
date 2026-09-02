// Build-time statistics over the canonical record set.
//
// Every number quoted in the journal comes from here rather than from prose, so
// a figure can never drift away from the archive it claims to describe. Each
// result carries its own sample size for the same reason: a statistic without
// an n is not a finding.
//
// (Server-only — reads the canonical loader, which uses fs.)
import { CANONICAL, categorySlug, type CanonicalSite } from "./canonical";

/** A swatch counts as an accent above this chroma. Documented so it is reproducible. */
const ACCENT_CHROMA = 0.25;

/** Categories below this many records are too small to quote a median from. */
const MIN_SAMPLE = 10;

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function chroma(hex: string) {
  const raw = hex.replace("#", "").trim();
  if (raw.length < 6) return null;
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  if ([r, g, b].some(Number.isNaN)) return null;
  return Math.max(r, g, b) - Math.min(r, g, b);
}

/** Largest type size recorded on a site, in px, or null when no sizes were captured. */
function largestType(site: CanonicalSite) {
  const sizes = site.design.fonts
    .filter((font) => font.sizes.length > 0)
    .map((font) => Math.max(...font.sizes));
  return sizes.length ? Math.max(...sizes) : null;
}

function accentCount(site: CanonicalSite) {
  return site.design.palette.filter((swatch) => {
    const c = chroma(swatch.hex);
    return c != null && c >= ACCENT_CHROMA;
  }).length;
}

export function share(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/* ── Platform buckets ─────────────────────────────────────────────
   A site is attributed to exactly one platform, checked in this order,
   because a managed host is a stronger signal than a detected framework. */

export type PlatformName = "Next.js" | "Webflow" | "Framer" | "Astro";

function platformOf(site: CanonicalSite): PlatformName | null {
  const hosting = site.technology.hosting;
  const framework = site.technology.framework;
  if (hosting.includes("Webflow (managed)")) return "Webflow";
  if (hosting.includes("Framer (managed)")) return "Framer";
  if (framework.includes("Next.js")) return "Next.js";
  if (framework.includes("Astro")) return "Astro";
  return null;
}

export type PlatformStat = {
  name: PlatformName;
  /** How the platform is detected, quoted verbatim in the methodology note. */
  signal: string;
  count: number;
  shareOfAttributed: number;
  medianPalette: number;
  medianFonts: number;
  medianLargestType: number;
  typeSample: number;
  topStyle: { tag: string; count: number; share: number } | null;
  /** Share of this bucket tagged Motion-Driven, the clearest platform split. */
  motionShare: number;
  topCategory: { name: string; slug: string; count: number } | null;
};

const PLATFORM_SIGNAL: Record<PlatformName, string> = {
  "Next.js": "Next.js detected in the framework signals",
  Webflow: "served from Webflow managed hosting",
  Framer: "served from Framer managed hosting",
  Astro: "Astro detected in the framework signals",
};

export function platformStats(): {
  platforms: PlatformStat[];
  attributed: number;
  unattributed: number;
} {
  const buckets = new Map<PlatformName, CanonicalSite[]>();
  for (const site of CANONICAL) {
    const name = platformOf(site);
    if (!name) continue;
    const bucket = buckets.get(name) ?? [];
    bucket.push(site);
    buckets.set(name, bucket);
  }

  const attributed = [...buckets.values()].reduce((n, b) => n + b.length, 0);

  const platforms = [...buckets.entries()]
    .map(([name, sites]) => {
      const styles = new Map<string, number>();
      for (const site of sites) {
        for (const tag of site.design.style_tags) {
          styles.set(tag, (styles.get(tag) ?? 0) + 1);
        }
      }
      const ranked = [...styles.entries()].sort((a, b) => b[1] - a[1]);
      const types = sites
        .map(largestType)
        .filter((value): value is number => value != null);

      const categories = new Map<string, number>();
      for (const site of sites) {
        const category = site.classification.category;
        if (!category) continue;
        categories.set(category, (categories.get(category) ?? 0) + 1);
      }
      const topCategoryEntry = [...categories.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0];

      return {
        name,
        signal: PLATFORM_SIGNAL[name],
        count: sites.length,
        shareOfAttributed: share(sites.length, attributed),
        medianPalette: median(
          sites.map((s) => s.design.palette.length).filter((n) => n > 0),
        ),
        medianFonts: median(
          sites.map((s) => s.design.fonts.length).filter((n) => n > 0),
        ),
        medianLargestType: median(types),
        typeSample: types.length,
        topStyle: ranked[0]
          ? {
              tag: ranked[0][0],
              count: ranked[0][1],
              share: share(ranked[0][1], sites.length),
            }
          : null,
        motionShare: share(
          sites.filter((s) => s.design.style_tags.includes("Motion-Driven"))
            .length,
          sites.length,
        ),
        topCategory: topCategoryEntry
          ? {
              name: topCategoryEntry[0],
              slug: categorySlug(topCategoryEntry[0]),
              count: topCategoryEntry[1],
            }
          : null,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    platforms,
    attributed,
    unattributed: CANONICAL.length - attributed,
  };
}

/* ── Typography ──────────────────────────────────────────────────── */

export type TypeByCategory = {
  name: string;
  slug: string;
  medianLargestType: number;
  count: number;
};

export function typographyStats() {
  const perSite = CANONICAL.map((site) => ({
    site,
    largest: largestType(site),
  })).filter(
    (row): row is { site: CanonicalSite; largest: number } =>
      row.largest != null,
  );

  const byCategory = new Map<string, number[]>();
  for (const { site, largest } of perSite) {
    const category = site.classification.category;
    if (!category) continue;
    const list = byCategory.get(category) ?? [];
    list.push(largest);
    byCategory.set(category, list);
  }

  const categories: TypeByCategory[] = [...byCategory.entries()]
    .filter(([, sizes]) => sizes.length >= MIN_SAMPLE)
    .map(([name, sizes]) => ({
      name,
      slug: categorySlug(name),
      medianLargestType: median(sizes),
      count: sizes.length,
    }))
    .sort((a, b) => b.medianLargestType - a.medianLargestType);

  const faces = new Map<string, number>();
  for (const site of CANONICAL) {
    // A record can list the same family twice under different roles.
    const seen = new Set<string>();
    for (const font of site.design.fonts) {
      const name = font.name.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      faces.set(name, (faces.get(name) ?? 0) + 1);
    }
  }

  const topFaces = [...faces.entries()]
    .map(([name, count]) => ({
      name,
      count,
      share: share(count, CANONICAL.length),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const fontCounts = CANONICAL.map((s) => s.design.fonts.length).filter(
    (n) => n > 0,
  );

  return {
    sample: perSite.length,
    archiveMedian: median(perSite.map((r) => r.largest)),
    categories,
    loudest: categories[0] ?? null,
    quietest: categories[categories.length - 1] ?? null,
    topFaces,
    medianFontsPerSite: median(fontCounts),
    distinctFaces: faces.size,
  };
}

/* ── Colour ──────────────────────────────────────────────────────── */

export function colourStats() {
  const withPalette = CANONICAL.filter((s) => s.design.palette.length > 0);
  const counts = withPalette.map(accentCount);

  const none = counts.filter((n) => n === 0).length;
  const one = counts.filter((n) => n === 1).length;
  const many = counts.filter((n) => n >= 3).length;

  const distribution = [0, 1, 2, 3].map((n) => {
    const matching =
      n === 3
        ? counts.filter((value) => value >= 3).length
        : counts.filter((value) => value === n).length;
    return {
      accents: n,
      label: n === 3 ? "3 or more" : String(n),
      count: matching,
      share: share(matching, withPalette.length),
    };
  });

  return {
    sample: withPalette.length,
    accentChromaThreshold: ACCENT_CHROMA,
    none,
    noneShare: share(none, withPalette.length),
    one,
    oneShare: share(one, withPalette.length),
    restrained: none + one,
    restrainedShare: share(none + one, withPalette.length),
    many,
    manyShare: share(many, withPalette.length),
    medianPalette: median(withPalette.map((s) => s.design.palette.length)),
    distribution,
  };
}

/* ── Archive shape ───────────────────────────────────────────────── */

export function archiveStats() {
  const categories = new Map<string, number>();
  for (const site of CANONICAL) {
    const name = site.classification.category;
    if (!name) continue;
    categories.set(name, (categories.get(name) ?? 0) + 1);
  }
  return {
    records: CANONICAL.length,
    categories: categories.size,
    classified: [...categories.values()].reduce((n, v) => n + v, 0),
  };
}
