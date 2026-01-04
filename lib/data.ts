import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Website } from './types';
import { mapToMacroCategory } from './categories';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getWebsites(): Promise<Website[]> {
  const csvPath = path.join(process.cwd(), 'data', 'websites.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  const { data } = Papa.parse<string[]>(fileContent, {
    header: false,
    skipEmptyLines: true,
  });

  const websites: Website[] = data.slice(1).map((row, index) => {
    const name = row[0]?.trim() || 'Unnamed';
    const url = row[1]?.trim() || '';
    const category = row[2]?.trim() || 'Uncategorized';
    const description = row[3]?.trim() || 'No description available';
    const featured = row[4]?.trim().toLowerCase() === 'true';
    const hidden = row[5]?.trim().toLowerCase() === 'true';
    const slug = createSlug(name);
    const displayCategory = mapToMacroCategory(category);

    const heroPath = path.join(process.cwd(), 'public', 'screenshots', `${slug}.webp`);
    const fallbackPath = path.join(process.cwd(), 'public', 'screenshots', 'fallbacks', `${slug}.webp`);
    let screenshotUrl = `/screenshots/${slug}.webp`;
    try {
      if (fs.existsSync(heroPath)) {
        const stat = fs.statSync(heroPath);
        if (stat.size < 20000 && fs.existsSync(fallbackPath)) {
          screenshotUrl = `/screenshots/fallbacks/${slug}.webp`;
        }
      } else if (fs.existsSync(fallbackPath)) {
        screenshotUrl = `/screenshots/fallbacks/${slug}.webp`;
      }
    } catch {}

    return {
      id: `${index + 1}`,
      name,
      url,
      category,
      description,
      screenshotUrl,
      slug,
      displayCategory,
      fullScreenshotUrl: `/fullshots/${slug}.webp`,
      featured,
      hidden,
    };
  });

  // Filter out hidden websites
  const visibleWebsites = websites.filter(website => !website.hidden);

  return sortWebsitesByQuality(visibleWebsites);
}

function sortWebsitesByQuality(websites: Website[]): Website[] {
  return websites.sort((a, b) => {
    // First, prioritize featured websites
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // If both are featured or both are not featured, sort alphabetically
    if (a.featured === b.featured) {
      return a.name.localeCompare(b.name);
    }
    
    // Fallback to quality score
    const scoreA = calculateQualityScore(a);
    const scoreB = calculateQualityScore(b);
    return scoreB - scoreA;
  });
}

function calculateQualityScore(website: Website): number {
  let score = 0;

  const fullPagePath = path.join(process.cwd(), 'public', 'fullshots', `${website.slug}.webp`);
  if (fs.existsSync(fullPagePath)) score += 50;

  if (website.url && website.url.startsWith('http')) score += 15;

  const heroPath = path.join(process.cwd(), 'public', 'screenshots', `${website.slug}.webp`);
  const fallbackPath = path.join(process.cwd(), 'public', 'screenshots', 'fallbacks', `${website.slug}.webp`);
  if (fs.existsSync(heroPath)) score += 20; else if (fs.existsSync(fallbackPath)) score += 5;

  if (website.description && website.description.length > 20) score += 5;
  if (website.name && website.name.length > 2) score += 5;

  return score;
}

export async function getCategories(): Promise<string[]> {
  const websites = await getWebsites();
  const categorySet = new Set<string>();
  websites.forEach(site => {
    const primaryCategory = site.category.split('/')[0].trim();
    categorySet.add(primaryCategory);
  });
  return Array.from(categorySet).sort();
}

export async function getWebsitesByCategory(category: string): Promise<Website[]> {
  const websites = await getWebsites();
  if (category === 'All') return websites;
  return websites.filter(site => site.category.startsWith(category));
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'SaaS': '#3B82F6',
    'Design Studio': '#8B5CF6',
    'Fintech': '#10B981',
    'E-commerce': '#F59E0B',
    'Portfolio': '#EC4899',
    'AI Tool': '#6366F1',
    'Creative Studio': '#A855F7',
    'Media': '#14B8A6',
    'Template': '#84CC16',
    'Education': '#F97316',
    'Health': '#EF4444',
    'Crypto': '#06B6D4',
    'DevTool': '#8B5CF6',
    'Cloud': '#3B82F6',
    'Marketing': '#F59E0B',
  };
  const primaryCategory = category.split('/')[0].trim();
  return colors[primaryCategory] || '#6B7280';
}

export async function getWebsiteBySlug(slug: string): Promise<Website | null> {
  const websites = await getWebsites();
  return websites.find(site => site.slug === slug) || null;
}

export async function getAllSlugs(): Promise<string[]> {
  const websites = await getWebsites();
  return websites.map(site => site.slug);
}

export async function getRelatedWebsites(website: Website, limit: number = 6): Promise<Website[]> {
  const websites = await getWebsites();
  const related = websites.filter(site => site.displayCategory === website.displayCategory && site.id !== website.id);
  return related.sort(() => Math.random() - 0.5).slice(0, limit);
}
