#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function slugify(name) {
  return (
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function extractArray(html, name) {
  const marker = `const ${name}=`;
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`missing ${name}`);
  const from = start + marker.length;
  const end = html.indexOf("];", from);
  return JSON.parse(html.slice(from, end + 1));
}

function tsString(value) {
  return JSON.stringify(value);
}

const rawColors = extractArray(
  fs.readFileSync(path.join(root, "public/tools/chromary.html"), "utf8"),
  "RAW_COLORS",
);

const byHex = new Map();
for (const color of rawColors) {
  const hex = color.hex.toUpperCase();
  if (!byHex.has(hex)) {
    byHex.set(hex, {
      hex,
      name: color.name,
      group: color.group,
      aliases: [],
    });
  } else {
    const page = byHex.get(hex);
    if (color.name !== page.name) {
      page.aliases.push({ name: color.name, group: color.group });
    }
  }
}

const usedSlugs = new Set();
const namedColors = [];
for (const page of byHex.values()) {
  let slug = slugify(page.name);
  if (usedSlugs.has(slug)) slug = `${slug}-${page.hex.slice(1).toLowerCase()}`;
  usedSlugs.add(slug);
  namedColors.push({ ...page, slug });
}

const palettesRaw = extractArray(
  fs.readFileSync(path.join(root, "public/tools/mockupalettes.html"), "utf8"),
  "PALETTES",
);

const palettes = palettesRaw.map((palette) => ({
  slug: slugify(palette.name),
  name: palette.name,
  category: palette.category,
  categorySlug: slugify(palette.category),
  colors: palette.colors.map((hex) => hex.toUpperCase()),
  description: palette.description,
}));

const namedTs = `// Generated from public/tools/chromary.html RAW_COLORS.
// One indexable page per unique HEX. Extra names for the same HEX are aliases.

export type ColorAlias = {
  name: string;
  group: string;
};

export type NamedColor = {
  slug: string;
  hex: string;
  name: string;
  group: string;
  aliases: ColorAlias[];
};

export const NAMED_COLORS: NamedColor[] = ${JSON.stringify(namedColors, null, 2)};

const bySlug = new Map(NAMED_COLORS.map((color) => [color.slug, color]));
const byHex = new Map(NAMED_COLORS.map((color) => [color.hex, color]));

export function getNamedColor(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function getNamedColorByHex(hex: string) {
  const key = hex.startsWith("#") ? hex.toUpperCase() : \`#\${hex.toUpperCase()}\`;
  return byHex.get(key) ?? null;
}

export function namedColorPath(slug: string) {
  return \`/tools/chromary/\${slug}\`;
}

export function namedColorTitle(color: NamedColor) {
  const named = \`\${color.name} Color Name and HEX\`;
  if (named.length <= 60) return named;
  return \`#\${color.hex.slice(1)} Color Name and Similar\`;
}

export function namedColorH1(color: NamedColor) {
  return \`What color is \${color.hex}?\`;
}

function srgbToLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function hexToOklab(hex: string) {
  const raw = hex.replace("#", "");
  const r = srgbToLinear(parseInt(raw.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(raw.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(raw.slice(4, 6), 16));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function deltaEok(a: ReturnType<typeof hexToOklab>, b: ReturnType<typeof hexToOklab>) {
  return Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
}

export function similarNamedColors(color: NamedColor, count = 6) {
  const origin = hexToOklab(color.hex);
  return NAMED_COLORS.filter((candidate) => candidate.hex !== color.hex)
    .map((candidate) => ({
      color: candidate,
      distance: deltaEok(origin, hexToOklab(candidate.hex)),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map((entry) => entry.color);
}

export const NAMED_COLOR_SLUGS: Record<string, string> = Object.fromEntries(
  NAMED_COLORS.map((color) => [color.hex.slice(1), color.slug]),
);
`;

const paletteTs = `// Generated from public/tools/mockupalettes.html PALETTES.

export type PaletteSwatches = [string, string, string, string];

export type WebsitePalette = {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  colors: PaletteSwatches;
  description: string;
};

export const WEBSITE_PALETTES: WebsitePalette[] = ${JSON.stringify(palettes, null, 2)};

export const PALETTE_CATEGORIES = [...new Set(WEBSITE_PALETTES.map((p) => p.category))].map(
  (name) => ({
    name,
    slug: WEBSITE_PALETTES.find((p) => p.category === name)!.categorySlug,
  }),
);

const byCategory = new Map(PALETTE_CATEGORIES.map((c) => [c.slug, c]));
const byKey = new Map(
  WEBSITE_PALETTES.map((p) => [\`\${p.categorySlug}/\${p.slug}\`, p]),
);

export function getPaletteCategory(slug: string) {
  return byCategory.get(slug) ?? null;
}

export function getWebsitePalette(categorySlug: string, paletteSlug: string) {
  return byKey.get(\`\${categorySlug}/\${paletteSlug}\`) ?? null;
}

export function palettesInCategory(categorySlug: string) {
  return WEBSITE_PALETTES.filter((p) => p.categorySlug === categorySlug);
}

export function paletteCategoryPath(slug: string) {
  return \`/tools/mockupalettes/\${slug}\`;
}

export function palettePath(palette: WebsitePalette) {
  return \`/tools/mockupalettes/\${palette.categorySlug}/\${palette.slug}\`;
}

export function paletteCategoryTitle(name: string) {
  return \`\${name} Website Color Palettes\`;
}

export function paletteTitle(name: string) {
  return \`\${name} Website Palette\`;
}

function hexChannel(hex: string, index: number) {
  return parseInt(hex.replace("#", "").slice(index, index + 2), 16);
}

function luminance(hex: string) {
  const r = hexChannel(hex, 0) / 255;
  const g = hexChannel(hex, 2) / 255;
  const b = hexChannel(hex, 4) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function saturation(hex: string) {
  const r = hexChannel(hex, 0) / 255;
  const g = hexChannel(hex, 2) / 255;
  const b = hexChannel(hex, 4) / 255;
  return Math.max(r, g, b) - Math.min(r, g, b);
}

export function mapPaletteRoles(colors: string[]) {
  const sorted = [...colors].sort((a, b) => luminance(a) - luminance(b));
  const dark = sorted[0];
  const rest = colors
    .filter((c) => c !== dark)
    .sort((a, b) => saturation(b) - saturation(a));
  return {
    primary: rest[0] ?? colors[0],
    secondary: rest[1] ?? colors[1],
    accent: rest[2] ?? colors[2],
    dark,
  };
}
`;

fs.writeFileSync(path.join(root, "lib/named-colors.ts"), namedTs);
fs.writeFileSync(path.join(root, "lib/mockupalettes.ts"), paletteTs);

const slugMap = Object.fromEntries(
  namedColors.map((color) => [color.hex.slice(1), color.slug]),
);
fs.writeFileSync(
  path.join(root, "public/tools/named-color-slugs.js"),
  `window.AW_COLOR_PAGES=${JSON.stringify(slugMap)};\n`,
);

console.log(
  `wrote ${namedColors.length} unique hex pages from ${rawColors.length} names`,
);
console.log(`wrote ${palettes.length} palettes in ${new Set(palettes.map((p) => p.category)).size} categories`);
console.log(
  "longest color title",
  Math.max(...namedColors.map((c) => `${c.name} Color Name and HEX`.length)),
);
console.log(
  "longest palette title",
  Math.max(...palettes.map((p) => `${p.name} Website Palette`.length)),
);
console.log(
  "longest category title",
  Math.max(...palettes.map((p) => `${p.category} Website Color Palettes`.length)),
);
console.log("sample colors", namedColors.slice(0, 3).map((c) => `${c.slug} ${c.hex}`).join(", "));
console.log("sample palettes", palettes.slice(0, 3).map((p) => `${p.categorySlug}/${p.slug}`).join(", "));
