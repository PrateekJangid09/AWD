import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { allSitemapEntries } from "@/lib/sitemaps";

export default function sitemap(): MetadataRoute.Sitemap {
  return allSitemapEntries().map((item) => ({
    url: item.path ? `${SITE_URL}${item.path}` : SITE_URL,
    lastModified: item.lastModified,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
