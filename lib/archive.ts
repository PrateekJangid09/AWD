import type { Website } from "./types";
import type { CardSite, PaletteRole, SiteRecord } from "./data";
import { CATEGORIES, SITES, getCategory } from "./data";
import { canonicalCards, getCanonical } from "./canonical";
import { getWebsiteBySlug, getWebsites, getRelatedWebsites } from "./websites";
import { getCategoryColor } from "./categories";

const DISPLAY_TO_SLUG: Record<string, string> = {
  SaaS: "saas",
  "Agency/Studio": "agency-studio",
  Portfolio: "portfolio",
  Fintech: "fintech",
  "E-commerce": "ecommerce",
  Developer: "developer",
  AI: "ai",
  "AI Agent": "ai-agent",
  "Crypto/Web3": "crypto-web3",
  Health: "health",
  Education: "education",
  Template: "template",
  Other: "other",
};

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

function paletteFromCategory(categoryName: string): PaletteRole[] {
  const hex = getCategoryColor(categoryName) || "#FF6112";
  return [
    { role: "Surface", hex: "#F4F2EC" },
    { role: "Primary", hex },
    { role: "Deep", hex: "#141414" },
    { role: "Ink", hex: "#111111" },
  ];
}

export function categorySlugFromWebsite(website: Website): string {
  const name = website.displayCategory || website.category;
  return DISPLAY_TO_SLUG[name] || "other";
}

export function websiteToCard(website: Website): CardSite {
  const slug = categorySlugFromWebsite(website);
  const cat = getCategory(slug);
  return {
    slug: website.slug,
    name: website.name,
    domain: domainFromUrl(website.url),
    categoryName: cat?.name || website.displayCategory || website.category,
    style: website.featured ? "Featured" : "Site",
    summary: website.description,
    palette: paletteFromCategory(website.displayCategory || website.category),
    thumb: website.screenshotUrl,
  };
}

export function websiteToRecord(website: Website): SiteRecord {
  const slug = categorySlugFromWebsite(website);
  const cat = getCategory(slug);
  const relatedHint = website.displayCategory || website.category;
  return {
    slug: website.slug,
    name: website.name,
    domain: domainFromUrl(website.url),
    officialUrl: website.url,
    category: slug,
    categoryName: cat?.name || relatedHint,
    summary: website.description,
    tags: [relatedHint, website.featured ? "Featured" : "Archive"].filter(Boolean),
    style: website.featured ? "Featured" : "Site",
    websiteType: "Website",
    audience: "General",
    palette: paletteFromCategory(relatedHint),
    typography: { display: "Inter", body: "Inter", weights: "400 – 700" },
    technology: {},
    reviewedAt: "Catalogue import",
    lastChecked: "Live dataset",
    verification: "Source-verified catalogue record",
    similar: [],
  };
}

function uniqueBySlug(items: CardSite[]): CardSite[] {
  const seen = new Set<string>();
  const out: CardSite[] = [];
  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

export async function liveCardSites(): Promise<CardSite[]> {
  const websites = await getWebsites();
  return websites.map(websiteToCard);
}

export async function allArchiveCards(): Promise<CardSite[]> {
  const live = await liveCardSites();
  return uniqueBySlug([...canonicalCards(), ...live, ...SITES]);
}

export async function archiveCardsInCategory(categorySlug: string): Promise<CardSite[]> {
  const cards = await allArchiveCards();
  const cat = getCategory(categorySlug);
  if (!cat) return [];
  return cards.filter((c) => c.categoryName === cat.name);
}

export async function getCatalogWebsite(slug: string): Promise<Website | null> {
  return getWebsiteBySlug(slug);
}

export async function relatedCardsForWebsite(website: Website, limit = 3): Promise<CardSite[]> {
  const related = await getRelatedWebsites(website, limit);
  return related.map(websiteToCard);
}

export { getCanonical, CATEGORIES };
