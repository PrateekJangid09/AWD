import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/data";
import { CANONICAL, liveCategories } from "@/lib/canonical";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/archive", changeFrequency: "daily", priority: 0.9 },
    { path: "/c", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools", changeFrequency: "weekly", priority: 0.8 },
    { path: "/research/website-design-index-2026", changeFrequency: "monthly", priority: 0.7 },
    { path: "/blogs", changeFrequency: "weekly", priority: 0.6 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/manifesto", changeFrequency: "yearly", priority: 0.4 },
    { path: "/editorial-guidelines", changeFrequency: "yearly", priority: 0.4 },
    { path: "/submit", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/cookie-preference", changeFrequency: "yearly", priority: 0.2 },
    { path: "/llms.txt", changeFrequency: "monthly", priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...liveCategories()
      .filter((c) => c.count > 0)
      .map((c) => ({
        url: `${SITE_URL}/c/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...CANONICAL.map((s) => ({
      url: `${SITE_URL}/archive/${s.identity.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
