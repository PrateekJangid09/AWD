import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/data";
import { CANONICAL, DATASET, liveCategories, recordDates } from "@/lib/canonical";
import { publishedPosts } from "@/lib/journal";
import { SITE_URL } from "@/lib/seo";

// lastModified tracks the record set, not the build, so a deploy that changes
// no content does not tell crawlers every URL is new.
const CONTENT_UPDATED = new Date(`${DATASET.updatedAt}T00:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
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
    { path: "/site-map", changeFrequency: "weekly", priority: 0.5 },
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
      lastModified: CONTENT_UPDATED,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...liveCategories()
      .filter((c) => c.count > 0)
      .map((c) => ({
        url: `${SITE_URL}/c/${c.slug}`,
        lastModified: CONTENT_UPDATED,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...CANONICAL.map((s) => ({
      url: `${SITE_URL}/archive/${s.identity.slug}`,
      lastModified: new Date(`${recordDates(s).modified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}/tools/${t.slug}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    // Drafts carry noindex, so they are deliberately absent here.
    ...publishedPosts().map((post) => ({
      url: `${SITE_URL}/blogs/${post.slug}`,
      lastModified: new Date(`${post.modified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
