import type { MetadataRoute } from "next";
import { CATEGORIES, SITES, TOOLS } from "@/lib/data";
import { CANONICAL } from "@/lib/canonical";
import { getAllSlugs } from "@/lib/websites";

const base = "https://www.allwebsites.design";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await getAllSlugs();
  const staticRoutes = [
    "",
    "/archive",
    "/c",
    "/tools",
    "/research/website-design-index-2026",
    "/blogs",
    "/about",
    "/manifesto",
    "/editorial-guidelines",
    "/submit",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cookie-preference",
    "/website-templates-for-framer",
  ];

  const siteSlugs = new Set([
    ...CANONICAL.map((s) => s.identity.slug),
    ...SITES.map((s) => s.slug),
    ...slugs,
  ]);

  return [
    ...staticRoutes.map((r) => ({
      url: `${base}${r}`,
      lastModified: now,
      changeFrequency: r === "" || r === "/archive" ? "daily" as const : "weekly" as const,
      priority: r === "" ? 1 : 0.7,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${base}/c/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...[...siteSlugs].map((slug) => ({
      url: `${base}/archive/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...TOOLS.map((t) => ({
      url: `${base}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
