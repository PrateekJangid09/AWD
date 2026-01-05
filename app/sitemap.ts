import { MetadataRoute } from 'next';
import { getWebsites, getAllSlugs } from '@/lib/data';
import { MACRO_CATEGORIES, slugifyCategory } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.allwebsites.design';

  // Get all websites for individual site pages
  const slugs = await getAllSlugs();

  // Generate sitemap entries
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Category pages (exclude "Browse All")
  const categoryPages = MACRO_CATEGORIES.filter((c) => c !== 'Browse All');
  for (const category of categoryPages) {
    const slug = slugifyCategory(category);
    entries.push({
      url: `${baseUrl}/c/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Template page
  entries.push({
    url: `${baseUrl}/website-templates-for-framer`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  });

  // Individual site pages
  for (const slug of slugs) {
    entries.push({
      url: `${baseUrl}/sites/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // Legal pages
  entries.push({
    url: `${baseUrl}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  entries.push({
    url: `${baseUrl}/privacy`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  entries.push({
    url: `${baseUrl}/terms`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  return entries;
}
