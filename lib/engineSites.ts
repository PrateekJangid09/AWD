import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { mapToMacroCategory } from './categories';
import { brandSlugFromDomain } from './paths';
import type { EnginePublicSite, Website } from './types';

function publicShotPath(p: string | null | undefined): string | undefined {
  if (!p) return undefined;
  const file = p.replace(/^\/shots\//, '').replace(/^shots\//, '');
  if (!file) return undefined;
  if (p.startsWith('/engine-shots/') || p.startsWith('/screenshots/') || p.startsWith('/fullshots/')) {
    return p;
  }
  return `/engine-shots/${file}`;
}

export function engineSiteToWebsite(site: EnginePublicSite): Website | null {
  const domain = (site.domain || '').trim();
  if (!domain) return null;
  const name = (site.name || domain).trim();
  const url = (site.url || `https://${domain}`).trim();
  const category = (site.category || 'Uncategorized').trim();
  const slug = brandSlugFromDomain(domain);
  const shot = publicShotPath(site.screenshot);
  const displayCategory = mapToMacroCategory(category) || category;

  return {
    id: `engine-${domain}`,
    name,
    url,
    category,
    description: (site.description || '').trim() || 'No description available',
    screenshotUrl: shot || `/engine-shots/${domain}.png`,
    slug,
    displayCategory,
    fullScreenshotUrl: shot,
    featured: false,
    hidden: false,
    fromEngine: true,
    domain,
    subcategory: site.subcategory || undefined,
    websiteType: site.website_type || undefined,
    audience: site.audience || [],
    style: site.style || [],
    palette: site.palette || [],
    fonts: site.fonts || [],
    techSummary: site.tech_summary || site.tech?.summary || undefined,
    tech: site.tech || null,
    keyPages: site.key_pages || {},
    contactEmail: site.contact_email || undefined,
    linkedin: site.linkedin || undefined,
    x: site.x || undefined,
    faviconUrl: publicShotPath(site.favicon),
  };
}

function readEngineExport(): EnginePublicSite[] {
  const jsonPath = path.join(process.cwd(), 'data', 'engine-sites.json');
  if (!fs.existsSync(jsonPath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const sites = Array.isArray(raw) ? raw : raw.sites;
    if (!Array.isArray(sites)) return [];
    return sites.filter((s: EnginePublicSite) => s && s.domain);
  } catch (err) {
    console.error('Failed to read data/engine-sites.json', err);
    return [];
  }
}

export const getEngineWebsites = cache(async (): Promise<Website[]> => {
  const mapped = readEngineExport()
    .map(engineSiteToWebsite)
    .filter((w): w is Website => w !== null);

  const used = new Map<string, number>();
  return mapped.map((site) => {
    const key = site.slug;
    const n = used.get(key) || 0;
    used.set(key, n + 1);
    if (n === 0) return site;
    const tld = (site.domain || '').split('.').pop() || String(n + 1);
    return { ...site, slug: `${site.slug}-${tld}` };
  });
});

export async function getEngineWebsiteBySlug(slug: string): Promise<Website | null> {
  const sites = await getEngineWebsites();
  const needle = decodeURIComponent(slug).toLowerCase();
  return sites.find((s) => s.slug.toLowerCase() === needle || s.id === `engine-${needle}`) || null;
}
