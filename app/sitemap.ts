import type { MetadataRoute } from "next";
import { CATEGORIES, SITES, TOOLS } from "@/lib/data";

const base = "https://www.allwebsites.design";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
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
  ];

  return [
    ...staticRoutes.map((r) => ({ url: `${base}${r}`, lastModified: now })),
    ...CATEGORIES.map((c) => ({ url: `${base}/c/${c.slug}`, lastModified: now })),
    ...SITES.map((s) => ({ url: `${base}/archive/${s.slug}`, lastModified: now })),
    ...TOOLS.map((t) => ({ url: `${base}/tools/${t.slug}`, lastModified: now })),
  ];
}
