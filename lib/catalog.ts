// Client-safe catalogue data. Keep sample site records in data.ts so Nav
// and other client components do not pull unused site rows into the bundle.

export type Category = {
  slug: string;
  name: string;
  count: number;
  share: string;
  blurb: string;
  descriptors: string[];
  accent: string;
};

export type PaletteRole = { role: string; hex: string; coverage?: string };

export type CardSite = {
  slug: string;
  name: string;
  domain: string;
  categoryName: string;
  style: string;
  summary: string;
  palette: PaletteRole[];
  thumb?: string;
};

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  swatches: string[];
  status: "live" | "soon";
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

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

export function categoryColor(name: string): string {
  const c = CATEGORIES.find((c) => c.name === name);
  if (c) return c.accent;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 68% 52%)`;
}
