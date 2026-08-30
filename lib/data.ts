// Sample site rows only. Shared catalogue types live in catalog.ts so
// client components can import categories/tools without this module.
export * from "./catalog";
import type { PaletteRole } from "./catalog";

export type SiteRecord = {
  slug: string;
  name: string;
  domain: string;
  officialUrl: string;
  category: string;
  categoryName: string;
  summary: string;
  tags: string[];
  style: string;
  websiteType: string;
  audience: string;
  palette: PaletteRole[];
  typography: { display: string; body: string; mono?: string; weights: string };
  technology: { cms?: string; framework?: string; hosting?: string; cdn?: string };
  reviewedAt: string;
  lastChecked: string;
  verification: string;
  similar: string[];
};

export const SITES: SiteRecord[] = [
  {
    slug: "aboard",
    name: "Aboard",
    domain: "aboard.com",
    officialUrl: "https://aboard.com",
    category: "saas",
    categoryName: "SaaS",
    summary: "Lightweight HR platform for time off, onboarding, contracts, and culture.",
    tags: ["SaaS", "HR", "B2B"],
    style: "Minimal",
    websiteType: "Product Website",
    audience: "B2B",
    palette: [
      { role: "Surface", hex: "#DCDAFA", coverage: "58%" },
      { role: "Primary", hex: "#4F46E5", coverage: "22%" },
      { role: "Deep", hex: "#3731A0", coverage: "9%" },
      { role: "Ink", hex: "#111111", coverage: "11%" },
    ],
    typography: { display: "Inter", body: "Inter", weights: "400 – 700" },
    technology: { framework: "Next.js", hosting: "Vercel", cdn: "Vercel Edge" },
    reviewedAt: "11 Aug 2026",
    lastChecked: "24 Aug 2026",
    verification: "Automated integrity check",
    similar: ["algolia", "arthur", "deel-clone", "later-clone"],
  },
  {
    slug: "algolia",
    name: "Algolia",
    domain: "algolia.com",
    officialUrl: "https://algolia.com",
    category: "developer",
    categoryName: "Developer",
    summary: "Hosted search and discovery API with docs-first developer onboarding.",
    tags: ["SaaS", "Developer Tool", "Search"],
    style: "Bold",
    websiteType: "Developer Platform",
    audience: "Developer",
    palette: [
      { role: "Surface", hex: "#E8DEFD", coverage: "54%" },
      { role: "Primary", hex: "#8B5CF6", coverage: "24%" },
      { role: "Deep", hex: "#6140AC", coverage: "10%" },
      { role: "Ink", hex: "#111111", coverage: "12%" },
    ],
    typography: { display: "System UI", body: "System UI", mono: "JetBrains Mono", weights: "400 – 800" },
    technology: { framework: "Next.js", hosting: "Netlify", cdn: "Fastly" },
    reviewedAt: "11 Aug 2026",
    lastChecked: "22 Aug 2026",
    verification: "Automated integrity check",
    similar: ["aboard", "arthur", "readme-clone", "stripe-clone"],
  },
  {
    slug: "arthur",
    name: "Arthur",
    domain: "arthur.ai",
    officialUrl: "https://arthur.ai",
    category: "ai",
    categoryName: "AI",
    summary: "Monitoring and observability platform for production machine-learning models.",
    tags: ["AI Platform", "ML Ops"],
    style: "Motion-Driven",
    websiteType: "Product Website",
    audience: "B2B",
    palette: [
      { role: "Surface", hex: "#CDF0F6", coverage: "50%" },
      { role: "Primary", hex: "#06B6D4", coverage: "26%" },
      { role: "Deep", hex: "#047F94", coverage: "12%" },
      { role: "Ink", hex: "#111111", coverage: "12%" },
    ],
    typography: { display: "Inter", body: "Inter", weights: "400 – 700" },
    technology: { framework: "Nuxt", hosting: "Vercel", cdn: "Cloudflare" },
    reviewedAt: "11 Aug 2026",
    lastChecked: "20 Aug 2026",
    verification: "Automated integrity check",
    similar: ["aboard", "algolia", "levels-clone"],
  },
  {
    slug: "meridian-studio",
    name: "Meridian Studio",
    domain: "meridian.studio",
    officialUrl: "https://meridian.studio",
    category: "agency-studio",
    categoryName: "Agency / Studio",
    summary: "Independent brand and motion studio with a case-study-led portfolio.",
    tags: ["Agency", "Branding", "Motion"],
    style: "Editorial",
    websiteType: "Studio Portfolio",
    audience: "B2B",
    palette: [
      { role: "Surface", hex: "#F4F1E9", coverage: "60%" },
      { role: "Ink", hex: "#0A0A0A", coverage: "26%" },
      { role: "Accent", hex: "#FF6112", coverage: "8%" },
      { role: "Muted", hex: "#7A7A7A", coverage: "6%" },
    ],
    typography: { display: "Archivo", body: "Inter", weights: "400 – 900" },
    technology: { cms: "Webflow", hosting: "Webflow", cdn: "AWS CloudFront" },
    reviewedAt: "18 Aug 2026",
    lastChecked: "25 Aug 2026",
    verification: "Automated integrity check",
    similar: ["osli-folio", "north-atlas", "aboard"],
  },
  {
    slug: "osli-folio",
    name: "Osli",
    domain: "osli.design",
    officialUrl: "https://osli.design",
    category: "portfolio",
    categoryName: "Portfolio",
    summary: "Product designer portfolio with a restrained grid and long-form case studies.",
    tags: ["Portfolio", "Personal", "Product Design"],
    style: "Minimal",
    websiteType: "Personal Portfolio",
    audience: "Consumer",
    palette: [
      { role: "Surface", hex: "#FBFAF6", coverage: "66%" },
      { role: "Ink", hex: "#111111", coverage: "24%" },
      { role: "Accent", hex: "#2536FF", coverage: "6%" },
      { role: "Muted", hex: "#9A9A9A", coverage: "4%" },
    ],
    typography: { display: "Archivo", body: "Inter", weights: "400 – 800" },
    technology: { framework: "Astro", hosting: "Vercel", cdn: "Vercel Edge" },
    reviewedAt: "16 Aug 2026",
    lastChecked: "25 Aug 2026",
    verification: "Automated integrity check",
    similar: ["meridian-studio", "north-atlas", "arthur"],
  },
  {
    slug: "north-atlas",
    name: "North Atlas",
    domain: "northatlas.co",
    officialUrl: "https://northatlas.co",
    category: "fintech",
    categoryName: "Fintech",
    summary: "Business banking and treasury product with a security-forward marketing site.",
    tags: ["Fintech", "Banking", "B2B"],
    style: "Corporate",
    websiteType: "Product Website",
    audience: "B2B",
    palette: [
      { role: "Surface", hex: "#0B1220", coverage: "56%" },
      { role: "Primary", hex: "#00A389", coverage: "20%" },
      { role: "Ink", hex: "#F5F5F5", coverage: "16%" },
      { role: "Accent", hex: "#FF6112", coverage: "8%" },
    ],
    typography: { display: "Archivo", body: "Inter", mono: "IBM Plex Mono", weights: "400 – 800" },
    technology: { framework: "Next.js", hosting: "AWS", cdn: "CloudFront" },
    reviewedAt: "14 Aug 2026",
    lastChecked: "23 Aug 2026",
    verification: "Automated integrity check",
    similar: ["aboard", "meridian-studio", "algolia"],
  },
];

// Fresh-from-community discovery strip
export const FRESH = [
  "Aboard",
  "airdev.co",
  "AirPods Pro 3",
  "algolia.com",
  "Andersen",
  "Arthur",
  "Meridian Studio",
  "North Atlas",
  "Osli",
];

export function getSite(slug: string) {
  return SITES.find((s) => s.slug === slug);
}

export function sitesInCategory(slug: string) {
  return SITES.filter((s) => s.category === slug);
}
