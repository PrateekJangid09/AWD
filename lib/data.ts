import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { cache } from 'react';
import { Website } from './types';
import { mapToMacroCategory } from './categories';
import { AUDIT_REVIEW_DATE } from './site';

const PLACEHOLDER_DOMAINS = new Set([
  'e-commerce.com', 'music-related.com', 'non-profit.com', 'r-sum.com',
  'portfolio-website.com', 'personal-portfolio.com',
]);

const CATEGORY_OVERRIDES: Record<string, string> = {
  'bassettespresso.com': 'Food & Beverage',
  'coastalconservationleague.org': 'Nonprofit',
  'a24films.com': 'Media/Entertainment',
  '5pointfilm.org': 'Media/Entertainment',
  'adamunderwear.com': 'Fashion/Retail',
  'aghoststore.com': 'E-commerce',
};

const UNSAFE_DESCRIPTIONS = [
  /ai-powered platform leveraging machine learning/i,
  /innovative digital platform providing modern solutions/i,
  /professional portfolio website showcasing creative work/i,
  /leading ecommerce platform offering seamless online shopping/i,
];

function createSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeText(value: string) {
  return value.normalize('NFC').replace(/AÃRK/gi, 'AARK').replace(/â€™/g, '’')
    .replace(/â€“/g, '–').replace(/â€”/g, '—').replace(/Â/g, '').replace(/\s+/g, ' ').trim();
}

function domainFor(value: string) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

function canonicalUrlKey(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '') || '/'}`;
  } catch { return null; }
}

function isPlaceholderRecord(name: string, url: string) {
  return PLACEHOLDER_DOMAINS.has(domainFor(url)) || /^(e-?commerce|music related|non ?profit|résumé|resume|portfolio website|personal portfolio)$/i.test(name.trim());
}

function sanitizeDescription(name: string, value: string, category: string) {
  if (!UNSAFE_DESCRIPTIONS.some((pattern) => pattern.test(value))) return { description: value, sanitized: false };
  return {
    description: `${name} is included as a ${category.toLowerCase()} website design reference. Review the captured page, visual system, and official source before using it as factual company information.`,
    sanitized: true,
  };
}

function hasSpecificCategory(category: string) {
  const value = category?.trim().toLowerCase();
  return Boolean(value && value !== 'uncategorized' && value !== 'other');
}

function isValidOfficialUrl(url: string, name: string) {
  try {
    if (!url || !name || !/^https?:\/\//i.test(url)) return false;
    const lower = url.toLowerCase();
    if (['land-book.com', 'saaslandingpage.com', 'onepagelove.com', 'webflow.com/made-in-webflow', 'webflow.com/@', 'a1.gallery'].some((item) => lower.includes(item))) return false;
    const domain = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
    if (domain.length > 30) return false;
    const hyphens = (domain.match(/-/g) || []).length;
    return !(domain.length > 25 && hyphens > 3);
  } catch { return false; }
}

function score(website: Website) {
  return (website.featured ? 100 : 0) + website.description.length;
}

async function fetchWebsites(): Promise<Website[]> {
  const csvPath = path.join(process.cwd(), 'data', 'websites.csv');
  if (!fs.existsSync(csvPath)) return [];
  const parsed = Papa.parse<string[]>(fs.readFileSync(csvPath, 'utf8'), { header: false, skipEmptyLines: true });
  const websites = parsed.data.slice(1).map((row, index) => {
    const name = normalizeText(String(row[0]?.trim() || 'Unnamed'));
    const url = String(row[1]?.trim() || '');
    const category = normalizeText(String(row[2]?.trim() || 'Uncategorized'));
    const rawDescription = normalizeText(String(row[3]?.trim() || 'No description available'));
    const slug = createSlug(name);
    const displayCategory = CATEGORY_OVERRIDES[domainFor(url)] || mapToMacroCategory(category);
    const clean = sanitizeDescription(name, rawDescription, displayCategory);
    return {
      id: String(index + 1), name, url, category, description: clean.description, slug, displayCategory,
      screenshotUrl: `/screenshots/${slug}.webp`, fullScreenshotUrl: `/fullshots/${slug}.webp`,
      featured: row[4]?.trim().toLowerCase() === 'true', hidden: row[5]?.trim().toLowerCase() === 'true',
      tags: category.split('/').map(normalizeText).filter(Boolean), verificationStatus: 'automated' as const,
      lastReviewedAt: AUDIT_REVIEW_DATE, descriptionSanitized: clean.sanitized,
    } satisfies Website;
  }).filter((website) => !website.hidden && website.name !== 'Unnamed' && hasSpecificCategory(website.category)
    && isValidOfficialUrl(website.url, website.name) && !isPlaceholderRecord(website.name, website.url));

  const byDestination = new Map<string, Website>();
  for (const website of websites) {
    const key = canonicalUrlKey(website.url) || `slug:${website.slug}`;
    const current = byDestination.get(key);
    if (!current || score(website) > score(current)) byDestination.set(key, website);
  }
  const bySlug = new Map<string, Website>();
  for (const website of byDestination.values()) {
    const current = bySlug.get(website.slug);
    if (!current || score(website) > score(current)) bySlug.set(website.slug, website);
  }
  return [...bySlug.values()].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
}

export const getWebsites = cache(fetchWebsites);
export async function getWebsiteBySlug(slug: string) { return (await getWebsites()).find((site) => site.slug === slug) || null; }
export async function getAllSlugs() { return (await getWebsites()).map((site) => site.slug); }

export async function getRelatedWebsites(website: Website, limit = 6) {
  const sourceTokens = new Set([...(website.tags || []), ...website.description.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 4)]);
  return (await getWebsites()).filter((site) => site.id !== website.id).map((site) => {
    const tokens = new Set([...(site.tags || []), ...site.description.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 4)]);
    const overlap = [...sourceTokens].filter((token) => tokens.has(token)).length;
    return { site, score: (site.displayCategory === website.displayCategory ? 20 : 0) + overlap + (site.featured ? 2 : 0) };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.site.name.localeCompare(b.site.name)).slice(0, limit).map(({ site }) => site);
}
