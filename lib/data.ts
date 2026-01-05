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

// Check if category is specific (not "Other" or empty)
function hasSpecificCategory(category: string): boolean {
  const cat = category?.trim() || '';
  return cat !== '' && 
         cat !== 'Uncategorized' && 
         cat !== 'Other' &&
         cat.toLowerCase() !== 'other';
}

// Check if URL is a valid official website (not platform link, not inferred)
function isValidOfficialUrl(url: string, name: string): boolean {
  try {
    if (!url || typeof url !== 'string' || !url.trim()) return false;
    if (!name || typeof name !== 'string') return false;
    
    const urlLower = url.toLowerCase().trim();
    
    // Must start with http:// or https://
    if (!urlLower.startsWith('http://') && !urlLower.startsWith('https://')) {
      return false;
    }
    
    // Exclude platform links
    const platformDomains = [
      'land-book.com',
      'saaslandingpage.com',
      'onepagelove.com',
      'webflow.com/made-in-webflow',
      'webflow.com/@',
      'a1.gallery',
    ];
    
    for (const platform of platformDomains) {
      if (urlLower.includes(platform)) {
        return false;
      }
    }
    
    // Extract domain from URL
    const urlObj = new URL(url);
    let domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    const domainParts = domain.split('.');
    if (domainParts.length === 0) return false;
    
    const domainWithoutTld = domainParts[0];
    
    // Check if domain is too long (likely inferred)
    // If domain is longer than 30 chars, it's likely inferred
    if (domainWithoutTld.length > 30) {
      return false;
    }
    
    // Check if domain matches slugified name pattern (likely inferred)
    const nameSlug = createSlug(name);
    if (nameSlug && nameSlug.length > 15 && domainWithoutTld.length > 20) {
      // If domain contains a significant portion of the slugified name and is very long
      const nameSlugStart = nameSlug.substring(0, Math.min(20, nameSlug.length));
      if (domainWithoutTld.includes(nameSlugStart) && domainWithoutTld.length > 25) {
        return false;
      }
    }
    
    // Check for obvious inferred patterns: very long domains with multiple hyphens
    const hyphenCount = (domainWithoutTld.match(/-/g) || []).length;
    if (domainWithoutTld.length > 25 && hyphenCount > 3) {
      return false;
    }
    
    return true;
  } catch (e) {
    // Invalid URL format or any error
    return false;
  }
}

export async function getWebsites(): Promise<Website[]> {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'websites.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      return [];
    }
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    if (!fileContent || fileContent.trim() === '') {
      console.error('CSV file is empty');
      return [];
    }

    const { data } = Papa.parse<string[]>(fileContent, {
      header: false,
      skipEmptyLines: true,
    });

    if (!data || data.length === 0) {
      console.error('No data parsed from CSV');
      return [];
    }

    const websites: Website[] = data.slice(1)
      .map((row, index) => {
        try {
          const name = (row[0]?.trim() || 'Unnamed').toString();
          const url = (row[1]?.trim() || '').toString();
          const category = (row[2]?.trim() || 'Uncategorized').toString();
          const description = (row[3]?.trim() || 'No description available').toString();
          const featured = (row[4]?.trim().toLowerCase() === 'true');
          const hidden = (row[5]?.trim().toLowerCase() === 'true');
          const slug = createSlug(name);
          const displayCategory = mapToMacroCategory(category);

          // Return URLs directly - let the client handle 404s for missing images
          // This prevents Vercel from bundling screenshot files into the serverless function
          const screenshotUrl = `/screenshots/${slug}.webp`;

          return {
            id: `${index + 1}`,
            name,
            url,
            category,
            description,
            screenshotUrl,
            slug,
            displayCategory: displayCategory || category,
            fullScreenshotUrl: `/fullshots/${slug}.webp`,
            featured,
            hidden,
          } as Website;
        } catch (rowError) {
          console.error(`Error processing row ${index + 1}:`, rowError);
          return null;
        }
      })
      .filter((website): website is Website => website !== null && website !== undefined);

    // Filter out hidden websites
    let visibleWebsites = websites.filter(website => !website.hidden);
    
    // Filter to only include valid websites:
    // 1. Must have specific category (not "Other" or empty)
    // 2. Must have valid official URL (not platform link, not inferred)
    // 3. Must have a name
    visibleWebsites = visibleWebsites.filter(website => {
      try {
        // Check name
        if (!website.name || typeof website.name !== 'string' || website.name.trim() === '' || website.name === 'Unnamed') {
          return false;
        }
        
        // Check category
        if (!website.category || !hasSpecificCategory(website.category)) {
          return false;
        }
        
        // Check URL
        if (!website.url || !isValidOfficialUrl(website.url, website.name)) {
          return false;
        }
        
        return true;
      } catch (e) {
        // If any error occurs during filtering, exclude the website
        return false;
      }
    });

    return sortWebsitesByQuality(visibleWebsites);
  } catch (error) {
    console.error('Error in getWebsites:', error);
    return [];
  }
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

  // Removed file system checks to reduce serverless function size
  // Files in public/ are served statically, so we can assume they exist
  // Featured websites get bonus points
  if (website.featured) score += 50;

  if (website.url && website.url.startsWith('http')) score += 15;

  // Assume screenshots exist (they're in public/)
  score += 20;

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
