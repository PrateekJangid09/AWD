// AllWebsites.Design — content model
// Public, curated records. Counts mirror the 2026 Design Index (5,896 total).

export type Category = {
  slug: string;
  name: string;
  count: number;
  share: string;
  blurb: string;
  descriptors: string[];
  accent: string; // swatch used for category color-coding
};

export type PaletteRole = { role: string; hex: string; coverage?: string };

export type SiteRecord = {
  slug: string;
  name: string;
  domain: string;
  officialUrl: string;
  category: string; // category slug
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
  similar: string[]; // slugs
};

export const STATS = {
  total: 5896,
  categories: 22,
  perPage: 30,
  pages: 197,
  library: "Library v4.0",
  method: "awd-2026.08.13-a",
};

export const CATEGORIES: Category[] = [
  { slug: "portfolio", name: "Portfolio", count: 1990, share: "33.8%", blurb: "Personal sites, folios and CVs where the work is the interface.", descriptors: ["Personal", "Photography", "CV"], accent: "#FF6112" },
  { slug: "agency-studio", name: "Agency / Studio", count: 975, share: "16.5%", blurb: "Creative shops, design studios and production houses selling taste.", descriptors: ["Creative", "Design", "Video"], accent: "#2536FF" },
  { slug: "saas", name: "SaaS", count: 943, share: "16.0%", blurb: "Dashboards, CRMs and B2B products explaining themselves fast.", descriptors: ["Dashboards", "CRM", "B2B"], accent: "#0A0A0A" },
  { slug: "other", name: "Other", count: 462, share: "7.8%", blurb: "References still awaiting a governed home in the taxonomy.", descriptors: ["Mixed", "Unsorted", "Emerging"], accent: "#7A7A7A" },
  { slug: "media-entertainment", name: "Media / Entertainment", count: 198, share: "3.4%", blurb: "Streaming, publishing and culture brands built for attention.", descriptors: ["Streaming", "Publishing", "Culture"], accent: "#E4005B" },
  { slug: "ecommerce", name: "E-commerce", count: 187, share: "3.2%", blurb: "Storefronts and DTC brands optimised for the add-to-cart.", descriptors: ["Shopify", "DTC", "Fashion"], accent: "#0F9D58" },
  { slug: "architecture-real-estate", name: "Architecture / Real Estate", count: 168, share: "2.8%", blurb: "Studios and property brands where space becomes typography.", descriptors: ["Studios", "Property", "Interior"], accent: "#8B5E34" },
  { slug: "ai", name: "AI", count: 163, share: "2.8%", blurb: "LLMs, chat and model products racing to explain the new.", descriptors: ["LLMs", "Agents", "Chat"], accent: "#6E56CF" },
  { slug: "food-beverage", name: "Food & Beverage", count: 157, share: "2.7%", blurb: "Restaurants, brands and makers plating design on the web.", descriptors: ["Restaurants", "Brands", "Makers"], accent: "#E8590C" },
  { slug: "fintech", name: "Fintech", count: 125, share: "2.1%", blurb: "Banking, wallets and crypto rails built to earn trust.", descriptors: ["Banking", "Crypto", "Wallets"], accent: "#00A389" },
  { slug: "developer", name: "Developer", count: 90, share: "1.5%", blurb: "Dev tools, docs and APIs designed for people who read source.", descriptors: ["Docs", "APIs", "Open Source"], accent: "#111827" },
  { slug: "ai-agent", name: "AI Agent", count: 79, share: "1.3%", blurb: "Autonomous agents and automation tools staking early ground.", descriptors: ["Agents", "Automation", "Tools"], accent: "#7C3AED" },
  { slug: "health", name: "Health", count: 69, share: "1.2%", blurb: "Wellness, clinics and care apps balancing calm and clarity.", descriptors: ["Wellness", "Clinics", "Apps"], accent: "#0EA5E9" },
  { slug: "typography", name: "Typography", count: 67, share: "1.1%", blurb: "Type foundries and lettering sites where the font is the pitch.", descriptors: ["Foundries", "Lettering", "Specimens"], accent: "#0A0A0A" },
  { slug: "music-audio", name: "Music / Audio", count: 47, share: "0.8%", blurb: "Artists, labels and audio tools tuned for rhythm and motion.", descriptors: ["Artists", "Labels", "Tools"], accent: "#DB2777" },
  { slug: "education", name: "Education", count: 45, share: "0.8%", blurb: "Courses, learning platforms and schools structuring knowledge.", descriptors: ["Courses", "Learning", "Platforms"], accent: "#2563EB" },
  { slug: "template", name: "Template", count: 32, share: "0.5%", blurb: "Actual downloadable design kits, themes and resources.", descriptors: ["Designs", "Resources", "Kits"], accent: "#FF6112" },
  { slug: "travel-hospitality", name: "Travel / Hospitality", count: 31, share: "0.5%", blurb: "Hotels, tourism and experiences selling a place to be.", descriptors: ["Hotels", "Tourism", "Stays"], accent: "#0891B2" },
  { slug: "photography", name: "Photography", count: 30, share: "0.5%", blurb: "Photographers and galleries where the grid carries the mood.", descriptors: ["Galleries", "Studios", "Prints"], accent: "#0A0A0A" },
  { slug: "nonprofit", name: "Nonprofit", count: 16, share: "0.3%", blurb: "Causes and foundations turning mission into momentum.", descriptors: ["Causes", "Foundations", "NGOs"], accent: "#16A34A" },
  { slug: "crypto-web3", name: "Crypto / Web3", count: 15, share: "0.3%", blurb: "DeFi, NFT and DAO projects designing for the on-chain.", descriptors: ["DeFi", "NFT", "DAO"], accent: "#F59E0B" },
  { slug: "fashion-retail", name: "Fashion / Retail", count: 7, share: "0.1%", blurb: "Labels and boutiques treating the site like a lookbook.", descriptors: ["Labels", "Boutiques", "Lookbooks"], accent: "#0A0A0A" },
];

export const TRENDING = ["saas", "ai-agent", "portfolio"];

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

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  swatches: string[];
  status: "live" | "soon";
};

export const TOOLS: Tool[] = [
  {
    slug: "colorhyme",
    name: "Colorhyme",
    tagline: "Precision color transformer",
    desc: "Start with one color. Shift its hue by exact degrees, tune saturation and lightness, and copy repeatable color recipes.",
    tags: ["Hue shift", "HSL", "Recipes"],
    swatches: ["#3389F9", "#F933A3", "#6A788A", "#1F5FAE"],
    status: "live",
  },
  {
    slug: "mockupalettes",
    name: "Mockupalettes",
    tagline: "Website palette preview",
    desc: "See any 4-colour palette on a full website mockup. Map primary, secondary, accent and dark roles, then compare directions in context.",
    tags: ["Palette", "Roles", "Compare"],
    swatches: ["#3978F6", "#3DD6D0", "#8658E8", "#111827"],
    status: "live",
  },
  {
    slug: "chromary",
    name: "Chromary",
    tagline: "Color dictionary",
    desc: "Search named colors by name or HEX, find perceptually nearby matches, and compare how different sources define the same name.",
    tags: ["Names", "HEX", "Sources"],
    swatches: ["#87AE73", "#BCB88A", "#D2AE69", "#681F2A"],
    status: "live",
  },
  {
    slug: "truegradient",
    name: "TrueGradient",
    tagline: "OKLCH gradient tool",
    desc: "Compare the same gradient stops in sRGB and native OKLCH, inspect the hue route, and copy production-ready CSS.",
    tags: ["OKLCH", "Gradients", "CSS"],
    swatches: ["#3389F9", "#7BE0B0", "#FFD76B", "#FF6112"],
    status: "live",
  },
  {
    slug: "webpalette",
    name: "WebPalette Studio",
    tagline: "Website color-system builder",
    desc: "Keep your brand colors and complete the full website palette around them — semantic roles, contrast checks and CSS export.",
    tags: ["Roles", "Contrast", "Export"],
    swatches: ["#E6E7EA", "#25282D", "#FF6112", "#7AB8FF"],
    status: "live",
  },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSite(slug: string) {
  return SITES.find((s) => s.slug === slug);
}

export function sitesInCategory(slug: string) {
  return SITES.filter((s) => s.category === slug);
}
