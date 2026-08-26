import { slugifyCategory } from './categories';
import type { Website } from './types';

/** rankbeaver.com → rankbeaver ; shop.example.co.uk → shop-example */
export function brandSlugFromDomain(domain: string): string {
  const host = String(domain || '')
    .replace(/^www\./i, '')
    .toLowerCase()
    .trim();
  if (!host) return '';
  const labels = host.split('.').filter(Boolean);
  const twoLevel = new Set(['co', 'com', 'org', 'net', 'ac', 'gov']);
  let base: string;
  if (labels.length >= 3 && twoLevel.has(labels[labels.length - 2])) {
    base = labels.slice(0, -2).join('-');
  } else if (labels.length >= 2) {
    base = labels.slice(0, -1).join('-');
  } else {
    base = host;
  }
  return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || host.replace(/[^a-z0-9]+/g, '-');
}

export function categorySlugForWebsite(website: Pick<Website, 'displayCategory' | 'category'>): string {
  return slugifyCategory(website.displayCategory || website.category || 'Other');
}

/** Public dedicated page: /category/saas/rankbeaver */
export function siteHref(website: Pick<Website, 'slug' | 'displayCategory' | 'category'>): string {
  return `/category/${categorySlugForWebsite(website)}/${website.slug}`;
}
