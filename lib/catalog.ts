// Client-safe catalogue data. Keep sample site records in data.ts so Nav
// and other client components do not pull unused site rows into the bundle.

/**
 * The taxonomy seed: editorial config that does not depend on the record set.
 * It deliberately carries no counts, so a stale number cannot reach the page.
 */
export type CategorySeed = {
  slug: string;
  name: string;
  blurb: string;
  descriptors: string[];
  accent: string;
};

/** A seed resolved against the live records. Only this shape has counts. */
export type Category = CategorySeed & {
  count: number;
  share: string;
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

// Taxonomy seed. Counts live only on the resolved Category that
// resolveCategory() builds from the record set, never here.
export const CATEGORIES: CategorySeed[] = [
  { slug: "portfolio", name: "Portfolio", blurb: "Personal sites, folios and CVs where the work is the interface.", descriptors: ["Personal", "Photography", "CV"], accent: "#FF6112" },
  { slug: "agency-studio", name: "Agency / Studio", blurb: "Creative shops, design studios and production houses selling taste.", descriptors: ["Creative", "Design", "Video"], accent: "#2536FF" },
  { slug: "saas", name: "SaaS", blurb: "Dashboards, CRMs and B2B products explaining themselves fast.", descriptors: ["Dashboards", "CRM", "B2B"], accent: "#0A0A0A" },
  { slug: "other", name: "Other", blurb: "References still awaiting a governed home in the taxonomy.", descriptors: ["Mixed", "Unsorted", "Emerging"], accent: "#7A7A7A" },
  { slug: "media-entertainment", name: "Media / Entertainment", blurb: "Streaming, publishing and culture brands built for attention.", descriptors: ["Streaming", "Publishing", "Culture"], accent: "#E4005B" },
  { slug: "ecommerce", name: "E-commerce", blurb: "Storefronts and DTC brands optimised for the add-to-cart.", descriptors: ["Shopify", "DTC", "Fashion"], accent: "#0F9D58" },
  { slug: "architecture-real-estate", name: "Architecture / Real Estate", blurb: "Studios and property brands where space becomes typography.", descriptors: ["Studios", "Property", "Interior"], accent: "#8B5E34" },
  { slug: "ai", name: "AI", blurb: "LLMs, chat and model products racing to explain the new.", descriptors: ["LLMs", "Agents", "Chat"], accent: "#6E56CF" },
  { slug: "food-beverage", name: "Food & Beverage", blurb: "Restaurants, brands and makers plating design on the web.", descriptors: ["Restaurants", "Brands", "Makers"], accent: "#E8590C" },
  { slug: "fintech", name: "Fintech", blurb: "Banking, wallets and crypto rails built to earn trust.", descriptors: ["Banking", "Crypto", "Wallets"], accent: "#00A389" },
  { slug: "developer", name: "Developer", blurb: "Dev tools, docs and APIs designed for people who read source.", descriptors: ["Docs", "APIs", "Open Source"], accent: "#111827" },
  { slug: "ai-agent", name: "AI Agent", blurb: "Autonomous agents and automation tools staking early ground.", descriptors: ["Agents", "Automation", "Tools"], accent: "#7C3AED" },
  { slug: "health", name: "Health", blurb: "Wellness, clinics and care apps balancing calm and clarity.", descriptors: ["Wellness", "Clinics", "Apps"], accent: "#0EA5E9" },
  { slug: "typography", name: "Typography", blurb: "Type foundries and lettering sites where the font is the pitch.", descriptors: ["Foundries", "Lettering", "Specimens"], accent: "#0A0A0A" },
  { slug: "music-audio", name: "Music / Audio", blurb: "Artists, labels and audio tools tuned for rhythm and motion.", descriptors: ["Artists", "Labels", "Tools"], accent: "#DB2777" },
  { slug: "education", name: "Education", blurb: "Courses, learning platforms and schools structuring knowledge.", descriptors: ["Courses", "Learning", "Platforms"], accent: "#2563EB" },
  { slug: "template", name: "Template", blurb: "Actual downloadable design kits, themes and resources.", descriptors: ["Designs", "Resources", "Kits"], accent: "#FF6112" },
  { slug: "travel-hospitality", name: "Travel / Hospitality", blurb: "Hotels, tourism and experiences selling a place to be.", descriptors: ["Hotels", "Tourism", "Stays"], accent: "#0891B2" },
  { slug: "photography", name: "Photography", blurb: "Photographers and galleries where the grid carries the mood.", descriptors: ["Galleries", "Studios", "Prints"], accent: "#0A0A0A" },
  { slug: "nonprofit", name: "Nonprofit", blurb: "Causes and foundations turning mission into momentum.", descriptors: ["Causes", "Foundations", "NGOs"], accent: "#16A34A" },
  { slug: "crypto-web3", name: "Crypto / Web3", blurb: "DeFi, NFT and DAO projects designing for the on-chain.", descriptors: ["DeFi", "NFT", "DAO"], accent: "#F59E0B" },
  { slug: "fashion-retail", name: "Fashion / Retail", blurb: "Labels and boutiques treating the site like a lookbook.", descriptors: ["Labels", "Boutiques", "Lookbooks"], accent: "#0A0A0A" },
];

export const TRENDING = ["saas", "ai-agent", "portfolio"];

export const TOOLS: Tool[] = [
  {
    slug: "colorhyme",
    name: "Colorhyme",
    tagline: "Color harmony generator",
    desc: "Start with one HEX. Build related accents and tonal variants with exact hue, saturation and lightness controls.",
    tags: ["Harmony", "HSL", "Recipes"],
    swatches: ["#3389F9", "#F933A3", "#6A788A", "#1F5FAE"],
    status: "live",
  },
  {
    slug: "mockupalettes",
    name: "Mockupalettes",
    tagline: "Website color palette visualizer",
    desc: "Preview any four-colour palette on a full website mockup. Map primary, secondary, accent and dark roles, then compare directions.",
    tags: ["Palette", "Roles", "Compare"],
    swatches: ["#3978F6", "#3DD6D0", "#8658E8", "#111827"],
    status: "live",
  },
  {
    slug: "chromary",
    name: "Chromary",
    tagline: "Color name finder",
    desc: "Find colour names from HEX or typed names. Compare CSS, survey and curated references, and see the closest matches.",
    tags: ["Names", "HEX", "Sources"],
    swatches: ["#87AE73", "#BCB88A", "#D2AE69", "#681F2A"],
    status: "live",
  },
  {
    slug: "truegradient",
    name: "TrueGradient",
    tagline: "OKLCH gradient generator",
    desc: "OKLCH gradient generator for HEX stops. Compare the same path in sRGB, inspect hue routes, and copy production CSS.",
    tags: ["OKLCH", "Gradients", "CSS"],
    swatches: ["#3389F9", "#7BE0B0", "#FFD76B", "#FF6112"],
    status: "live",
  },
  {
    slug: "webpalette",
    name: "WebPalette",
    tagline: "Website color palette generator",
    desc: "Keep your brand colours and complete a full website palette around them: roles, contrast checks and CSS export.",
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
