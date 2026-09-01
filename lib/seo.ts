import type { Metadata } from "next";
import type { CanonicalSite } from "./canonical";

export const SITE_URL = "https://allwebsites.design";
export const SITE_NAME = "AllWebsites.Design";
export const DEFAULT_TITLE =
  "AllWebsites.Design — The Website Design Research Archive";
export const DEFAULT_DESCRIPTION =
  "Explore real websites by industry, style, colour, typography and technology. A curated design-research archive for designers, developers and founders.";
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "AllWebsites.Design — The website design research archive",
};

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_ID = `${SITE_URL}/#logo`;

export type JsonLdNode = Record<string, unknown>;
export type Crumb = { name: string; path?: string };
export type ListItem = { name: string; url: string };

export function absUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function pageMeta({
  title,
  description,
  path,
  index = true,
  type = "website",
  image,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "article";
  image?: OgImage;
}): Metadata {
  const url = absUrl(path);
  const ogImage = image
    ? {
        url: image.url,
        width: image.width ?? 1200,
        height: image.height ?? 630,
        alt: image.alt ?? title,
      }
    : OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

function uniqueStrings(values: (string | null | undefined)[]) {
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

function joinList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function hexChroma(hex: string) {
  const raw = hex.replace("#", "").trim();
  if (raw.length < 6) return 1;
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function paletteLooksMonochrome(palette: { hex: string }[]) {
  if (palette.length < 3) return false;
  return palette.every((swatch) => hexChroma(swatch.hex) < 0.12);
}

export function studyTitle(name: string) {
  return `${name}, design study (palette, type, tech)`;
}

export function studyDescription(site: CanonicalSite) {
  const styles = site.design.style_tags.slice(0, 3);
  const paletteCount = site.design.palette.length;
  const fonts = uniqueStrings(site.design.fonts.map((font) => font.name)).slice(0, 2);
  const bits: string[] = [];
  if (styles.length) bits.push(`${joinList(styles)} styling`);
  if (paletteCount) {
    const tone = paletteLooksMonochrome(site.design.palette)
      ? " near-monochrome"
      : "";
    bits.push(`a ${paletteCount}-colour${tone} palette`);
  }
  if (fonts.length) bits.push(`${joinList(fonts)} type`);
  if (site.technology.summary?.trim()) {
    const summary = site.technology.summary.trim();
    bits.push(`built as ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`);
  } else {
    const stack = uniqueStrings([
      ...site.technology.builder_cms,
      ...site.technology.framework,
      site.technology.language,
      ...site.technology.hosting,
    ]).slice(0, 3);
    if (stack.length) bits.push(`built with ${joinList(stack)}`);
  }
  if (bits.length === 0) {
    return `A design study of ${site.identity.name}: palette, typography, style and detected technology.`;
  }
  return `A design study of ${site.identity.name}: ${bits.join(", ")}.`;
}

export function pageGraph(nodes: JsonLdNode[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function crumbId(path: string) {
  return `${absUrl(path)}/#breadcrumb`;
}

export function webpageId(path: string) {
  return `${absUrl(path)}/#webpage`;
}

function categoryPathSlug(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "other"
  );
}

function ogImageNode() {
  return {
    "@type": "ImageObject",
    url: absUrl("/og.jpg"),
    width: 1200,
    height: 630,
  };
}

export function breadcrumbNode(path: string, items: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": crumbId(path),
    itemListElement: items.map((item, i) => {
      const last = i === items.length - 1;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(!last && item.path != null ? { item: absUrl(item.path) } : {}),
      };
    }),
  };
}

export function globalGraph() {
  return pageGraph([
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "A curated design-research archive and a connected set of free colour tools, for people who study how the web is designed.",
      logo: {
        "@type": "ImageObject",
        "@id": LOGO_ID,
        url: absUrl("/logo.png"),
        width: 800,
        height: 800,
        caption: SITE_NAME,
      },
      image: { "@id": LOGO_ID },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": ORG_ID },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/archive?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]);
}

export function homePageGraph() {
  return pageGraph([
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "AllWebsites.Design: The Website Design Research Archive",
      description: DEFAULT_DESCRIPTION,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      primaryImageOfPage: ogImageNode(),
      inLanguage: "en-US",
    },
  ]);
}

export function collectionPageGraph({
  path,
  name,
  description,
  crumbs,
  listName,
  items,
}: {
  path: string;
  name: string;
  description: string;
  crumbs?: Crumb[];
  listName: string;
  items: ListItem[];
}) {
  const url = absUrl(path);
  const listId = `${url}/#itemlist`;
  const nodes: JsonLdNode[] = [];
  if (crumbs?.length) nodes.push(breadcrumbNode(path, crumbs));
  nodes.push(
    {
      "@type": "CollectionPage",
      "@id": `${url}/#webpage`,
      url,
      name,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      ...(crumbs?.length ? { breadcrumb: { "@id": crumbId(path) } } : {}),
      inLanguage: "en-US",
      mainEntity: { "@id": listId },
    },
    {
      "@type": "ItemList",
      "@id": listId,
      name: listName,
      numberOfItems: items.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url,
        name: item.name,
      })),
    },
  );
  return pageGraph(nodes);
}

export function typedPageGraph({
  type,
  path,
  name,
  description,
  crumbs,
  idSuffix = "webpage",
  extra = {},
}: {
  type: "WebPage" | "AboutPage" | "ContactPage" | "Blog" | "Report";
  path: string;
  name: string;
  description?: string;
  crumbs?: Crumb[];
  idSuffix?: string;
  extra?: JsonLdNode;
}) {
  const url = absUrl(path);
  const nodes: JsonLdNode[] = [];
  if (crumbs?.length) nodes.push(breadcrumbNode(path, crumbs));
  nodes.push({
    "@type": type,
    "@id": `${url}/#${idSuffix}`,
    url,
    name,
    ...(description ? { description } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    ...(crumbs?.length ? { breadcrumb: { "@id": crumbId(path) } } : {}),
    inLanguage: "en-US",
    ...extra,
  });
  return pageGraph(nodes);
}

function hexValue(hex: string) {
  const trimmed = hex.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
}

function typefaceValue(name: string, sizes: number[]) {
  if (sizes.length === 0) return name;
  const lo = sizes[0];
  const hi = sizes[sizes.length - 1];
  return lo === hi ? `${name}, ${lo}px` : `${name}, ${lo} to ${hi}px`;
}

function property(name: string, value: string) {
  return { "@type": "PropertyValue", name, value };
}

export function archiveRecordGraph(site: CanonicalSite) {
  const slug = site.identity.slug;
  const path = `/archive/${slug}`;
  const url = absUrl(path);
  const category = site.classification.category;
  const websiteType = site.classification.website_type;
  const description = studyDescription(site);
  const screenshotFile = site.screenshots.desktop ?? "desktop.webp";
  const screenshotId = `${url}/#screenshot`;
  const studiedId = `${url}/#studied-site`;
  const analysisId = `${url}/#analysis`;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Archive", path: "/archive" },
    ...(category
      ? [{ name: category, path: `/c/${categoryPathSlug(category)}` }]
      : []),
    { name: site.identity.name },
  ];

  const keywords = [
    category,
    websiteType,
    ...site.design.style_tags,
    ...site.classification.audience,
  ].filter((value): value is string => Boolean(value));

  const additionalProperty: JsonLdNode[] = [];
  for (const tag of site.design.style_tags) {
    additionalProperty.push(property("Design style", tag));
  }
  for (const swatch of site.design.palette) {
    if (!swatch.hex) continue;
    additionalProperty.push(
      property(`Palette: ${swatch.role}`, hexValue(swatch.hex)),
    );
  }
  for (const font of site.design.fonts) {
    additionalProperty.push(
      property(
        font.role ? `Typeface (${font.role})` : "Typeface",
        typefaceValue(font.name, font.sizes),
      ),
    );
  }

  const techPairs: [string, string][] = [
    ["Builder", site.technology.builder_cms.join(", ")],
    ["Framework", site.technology.framework.join(", ")],
    ["Hosting", site.technology.hosting.join(", ")],
    ["CDN", site.technology.cdn.join(", ")],
    ["Language", site.technology.language ?? ""],
    ["Web server", site.technology.web_server.join(", ")],
    ["E-commerce", site.technology.ecommerce.join(", ")],
  ];
  for (const [name, value] of techPairs) {
    if (value) additionalProperty.push(property(name, value));
  }

  const extracted = site.extraction.extracted_at;
  const checkedDate =
    extracted && /^\d{4}-\d{2}-\d{2}/.test(extracted)
      ? extracted.slice(0, 10)
      : undefined;

  return pageGraph([
    breadcrumbNode(path, crumbs),
    {
      "@type": "ItemPage",
      "@id": `${url}/#webpage`,
      url,
      name: studyTitle(site.identity.name),
      description,
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": crumbId(path) },
      primaryImageOfPage: {
        "@type": "ImageObject",
        "@id": screenshotId,
        url: absUrl(`/sites/${slug}/${screenshotFile}`),
        caption: `${site.identity.name} full-page screenshot`,
      },
      mainEntity: { "@id": studiedId },
      inLanguage: "en-US",
    },
    {
      "@type": "WebSite",
      "@id": studiedId,
      name: site.identity.name,
      url: site.identity.url,
      description,
      image: { "@id": screenshotId },
      ...(category ? { genre: category } : {}),
      ...(keywords.length ? { keywords } : {}),
      ...(additionalProperty.length ? { additionalProperty } : {}),
    },
    {
      "@type": "Article",
      "@id": analysisId,
      headline: `Design study: ${site.identity.name}`,
      about: { "@id": studiedId },
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: { "@id": screenshotId },
      inLanguage: "en-US",
      ...(checkedDate
        ? { datePublished: checkedDate, dateModified: checkedDate }
        : {}),
    },
  ]);
}

export function archiveSampleGraph({
  slug,
  name,
  description,
  officialUrl,
  categoryName,
  categorySlug,
}: {
  slug: string;
  name: string;
  description: string;
  officialUrl: string;
  categoryName: string;
  categorySlug: string;
}) {
  const path = `/archive/${slug}`;
  const url = absUrl(path);
  const studiedId = `${url}/#studied-site`;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Archive", path: "/archive" },
    { name: categoryName, path: `/c/${categorySlug}` },
    { name },
  ];
  return pageGraph([
    breadcrumbNode(path, crumbs),
    {
      "@type": "ItemPage",
      "@id": `${url}/#webpage`,
      url,
      name: `${name}: ${categoryName}`,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": crumbId(path) },
      mainEntity: { "@id": studiedId },
      inLanguage: "en-US",
    },
    {
      "@type": "WebSite",
      "@id": studiedId,
      name,
      url: officialUrl,
      description,
      genre: categoryName,
    },
  ]);
}
