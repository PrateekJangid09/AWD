import type { Metadata } from "next";
import type { CanonicalSite } from "./canonical";
import { recordDates } from "./canonical";

export const SITE_URL = "https://allwebsites.design";
export const SITE_NAME = "AllWebsites.Design";
export const CONTACT_EMAIL = "prateekjangid10@gmail.com";
export const SUPPORT_URL = "https://buymeacoffee.com/prateekjangid";
export const DEFAULT_TITLE =
  "Website Design Examples & Inspiration — AllWebsites.Design";
export const DEFAULT_DESCRIPTION =
  "Browse real website design examples by industry, style, colour, typography and technology. Every reference is studied in depth, with the palette, type and stack listed.";
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
  /** false marks a genuine placeholder. Links are always followed. */
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
    // Never emit nofollow on our own pages: a placeholder still has to pass
    // link value to whatever it points at.
    robots: { index, follow: true },
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

/** Longest brand name a title can carry before the page title runs long. */
const NAME_MAX = 30;

/**
 * The brand behind a record.
 *
 * Some records store the studied page's full <title> in the name field, so a
 * raw name can be a whole tagline. Split on the separators that conventionally
 * divide a brand from its strapline, then fall back to a word-boundary trim.
 */
export function shortName(raw: string) {
  const name = raw.trim();

  // "Brand | Tagline" and "Tagline | Brand" both occur, and the brand is
  // reliably the shorter half, so pick that. Other separators put the brand first.
  const piped = name.split(/\s*\|\s*/).filter(Boolean);
  let candidate =
    piped.length === 2
      ? piped.reduce((a, b) => (a.length <= b.length ? a : b))
      : name;

  candidate = candidate.split(/\s+[–—⋅›•·]\s+|\s+-\s+|:\s+/)[0].trim() || name;
  if (candidate.length <= NAME_MAX) return candidate;

  // "Richard Bruskowski, Freelance Designer" style: the brand precedes the comma.
  const beforeComma = candidate.split(",")[0].trim();
  if (beforeComma.length >= 3 && beforeComma.length <= NAME_MAX) return beforeComma;
  if (beforeComma.length >= 3) candidate = beforeComma;

  // "Greenlight makes it easy to..." style: a sentence, not a name. The brand is
  // the leading run of capitalised words, before the prose starts.
  const words = candidate.split(/\s+/);
  const lead: string[] = [];
  for (const word of words) {
    if (lead.length > 0 && /^[a-z]/.test(word)) break;
    lead.push(word);
  }
  const leading = lead.join(" ");
  if (leading.length >= 3 && leading.length <= NAME_MAX) return leading;

  const clipped = candidate.slice(0, NAME_MAX);
  const atWord = clipped.slice(0, clipped.lastIndexOf(" "));
  return (atWord.length >= 12 ? atWord : clipped).replace(/[\s,;:•·-]+$/, "");
}

export function studyTitle(name: string) {
  return `${shortName(name)} website design study`;
}

/**
 * Descriptions are filled toward this band with factual clauses, never padding.
 * The core is capped below DESC_MIN so there is always room for a closing
 * clause to carry a short record up into the band.
 */
const DESC_MIN = 150;
const DESC_MAX = 165;
const CORE_MAX = 145;

export function studyDescription(site: CanonicalSite) {
  const name = shortName(site.identity.name);
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

  // Drop trailing clauses rather than let the sentence overrun.
  let core = `${name} website design study: palette, typography and detected technology.`;
  for (let take = bits.length; take > 0; take -= 1) {
    const candidate = `${name} website design study: ${bits.slice(0, take).join(", ")}.`;
    if (candidate.length <= CORE_MAX) {
      core = candidate;
      break;
    }
    if (take === 1) {
      // One clause and still too long: clamp on a word boundary.
      const clipped = candidate.slice(0, CORE_MAX - 1);
      core = `${clipped.slice(0, clipped.lastIndexOf(" ")).replace(/[\s,;:]+$/, "")}.`;
    }
  }

  const category = site.classification.category?.toLowerCase();
  return fitDescription(core, [
    category ? ` A ${category} reference, recorded from the live site.` : "",
    category ? ` A ${category} reference in the archive.` : "",
    " See every hex value, typeface and detected technology.",
    " Palette, typefaces and stack from the live site.",
    " Screenshots and provenance included.",
    " With screenshots and provenance.",
    " Recorded from the live site.",
    " Full palette and typefaces.",
    " Screenshots included.",
    " With screenshots.",
  ]);
}

/**
 * Bring a description into the 150 to 165 band.
 *
 * Overlong text is clamped on a word boundary. Short text is completed by
 * taking the longest supplied clause that still fits, repeatedly. Clauses must
 * be factual: this fills a description, it does not pad one.
 */
export function fitDescription(core: string, tails: (string | false | null | undefined)[] = []) {
  let out = core.trim();

  if (out.length > DESC_MAX) {
    const clipped = out.slice(0, DESC_MAX - 1);
    const atWord = clipped.slice(0, clipped.lastIndexOf(" "));
    return `${(atWord.length >= 80 ? atWord : clipped).replace(/[\s,;:.]+$/, "")}.`;
  }

  const pool = tails.filter((tail): tail is string => Boolean(tail));
  const used = new Set<string>();
  while (out.length < DESC_MIN) {
    const fit = pool
      .filter((tail) => !used.has(tail) && out.length + tail.length <= DESC_MAX)
      .sort((a, b) => b.length - a.length)[0];
    if (!fit) break;
    used.add(fit);
    out += fit;
  }
  return out;
}

/**
 * A self-contained factual paragraph for the top of a record page: what the
 * site is, its palette, its type and its detected stack. Written so it can be
 * quoted on its own without the surrounding page.
 */
export function studyAnswer(site: CanonicalSite) {
  const { identity, classification, design, technology } = site;
  const kind = [classification.category, classification.website_type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const sentences: string[] = [];

  sentences.push(
    kind
      ? `${identity.name} (${identity.domain}) is a ${kind} studied in the AllWebsites.Design archive.`
      : `${identity.name} (${identity.domain}) is a website studied in the AllWebsites.Design archive.`,
  );

  const styles = design.style_tags.slice(0, 2);
  const lead = design.palette[0]?.hex ? hexValue(design.palette[0].hex) : null;
  const paletteBits: string[] = [];
  if (design.palette.length) {
    paletteBits.push(
      lead
        ? `a ${design.palette.length}-colour palette led by ${lead}`
        : `a ${design.palette.length}-colour palette`,
    );
  }
  const fonts = uniqueStrings(design.fonts.map((font) => font.name)).slice(0, 2);
  if (fonts.length) paletteBits.push(`${joinList(fonts)} for type`);
  if (paletteBits.length) {
    sentences.push(
      styles.length
        ? `The design reads ${joinList(styles).toLowerCase()}, with ${joinList(paletteBits)}.`
        : `The design uses ${joinList(paletteBits)}.`,
    );
  }

  const stack = uniqueStrings([
    ...technology.builder_cms,
    ...technology.framework,
    ...technology.hosting,
    technology.language,
  ]).slice(0, 3);
  if (technology.summary?.trim()) {
    sentences.push(`Detected technology: ${technology.summary.trim()}.`);
  } else if (stack.length) {
    sentences.push(`Detected technology: ${joinList(stack)}.`);
  } else {
    sentences.push("No build technology could be detected from public signals.");
  }

  const confidence = classification.confidence;
  if (confidence != null) {
    sentences.push(
      `Classification confidence is ${Math.round(confidence * 100)}%.`,
    );
  }

  return sentences.join(" ");
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

/** Organization + WebSite. Emitted sitewide; the SearchAction lives on the home page only. */
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
      email: CONTACT_EMAIL,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "editorial",
        email: CONTACT_EMAIL,
        url: absUrl("/contact"),
        availableLanguage: "English",
      },
      sameAs: [SUPPORT_URL],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": ORG_ID },
    },
  ]);
}

export function homePageGraph({
  recordCount,
  categoryCount,
  updated,
}: {
  recordCount: number;
  categoryCount: number;
  updated: string;
}) {
  return pageGraph([
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/archive?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "Website design examples, studied in depth",
      description: DEFAULT_DESCRIPTION,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      primaryImageOfPage: ogImageNode(),
      inLanguage: "en-US",
      dateModified: updated,
      mainEntity: {
        "@type": "ItemList",
        name: "Website design categories",
        numberOfItems: categoryCount,
      },
      significantLink: [
        absUrl("/archive"),
        absUrl("/c"),
        absUrl("/tools"),
        absUrl("/research/website-design-index-2026"),
      ],
      // Mirrors the count shown on the page; never a literal.
      abstract: `${recordCount} website design examples with palette, typography and detected technology.`,
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
  type:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "Blog"
    | "Report"
    | "CollectionPage";
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
  const studiedId = `${site.identity.url.replace(/\/+$/, "")}/#studiedsite`;
  const analysisId = `${url}/#article`;
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

  const { published, modified } = recordDates(site);
  const audience = site.classification.audience.filter(Boolean);

  // The studied brand as an entity in its own right, anchored on its own
  // domain so engines can reconcile it with the real-world organisation.
  const brandRoot = site.identity.url.replace(/\/+$/, "");
  const studiedOrgId = `${brandRoot}/#organization`;
  const brandProfiles = [site.social.linkedin, site.social.x].filter(
    (value): value is string => Boolean(value),
  );
  const brandEmail =
    site.contact.email && site.contact.email.includes("@")
      ? site.contact.email
      : null;

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
      primaryImageOfPage: { "@id": screenshotId },
      mainEntity: { "@id": analysisId },
      inLanguage: "en-US",
      dateModified: modified,
    },
    {
      "@type": "ImageObject",
      "@id": screenshotId,
      url: absUrl(`/sites/${slug}/${screenshotFile}`),
      contentUrl: absUrl(`/sites/${slug}/${screenshotFile}`),
      caption: `${site.identity.name} homepage, full-page screenshot`,
      representativeOfPage: true,
    },
    {
      "@type": "Article",
      "@id": analysisId,
      headline: studyTitle(site.identity.name),
      description,
      about: [{ "@id": studiedOrgId }, { "@id": studiedId }],
      mainEntityOfPage: url,
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: { "@id": screenshotId },
      inLanguage: "en-US",
      datePublished: published,
      dateModified: modified,
      ...(keywords.length ? { keywords } : {}),
    },
    {
      // Anchored on the studied brand's own domain so engines can link the
      // analysis to the real entity it is about.
      "@type": "WebSite",
      "@id": studiedId,
      name: site.identity.name,
      url: site.identity.url,
      ...(site.seo.description ? { description: site.seo.description } : {}),
      image: { "@id": screenshotId },
      publisher: { "@id": studiedOrgId },
      ...(site.design.style_tags.length ? { genre: site.design.style_tags } : {}),
      ...(category ? { about: category } : {}),
      ...(audience.length
        ? {
            audience: audience.map((audienceType) => ({
              "@type": "Audience",
              audienceType,
            })),
          }
        : {}),
      ...(additionalProperty.length ? { additionalProperty } : {}),
    },
    {
      "@type": "Organization",
      "@id": studiedOrgId,
      name: site.identity.name,
      url: site.identity.url,
      ...(site.seo.description ? { description: site.seo.description } : {}),
      ...(site.identity.favicon
        ? {
            logo: {
              "@type": "ImageObject",
              url: absUrl(`/sites/${slug}/${site.identity.favicon}`),
            },
          }
        : {}),
      ...(brandEmail ? { email: brandEmail } : {}),
      ...(site.contact.address ? { address: site.contact.address } : {}),
      ...(brandProfiles.length ? { sameAs: brandProfiles } : {}),
      subjectOf: { "@id": analysisId },
    },
  ]);
}

/** Research report: an Article that presents a Dataset, both dated from the record set. */
export function researchGraph({
  path,
  headline,
  description,
  datasetName,
  datasetDescription,
  recordCount,
  categoryCount,
  method,
  published,
  modified,
  crumbs,
}: {
  path: string;
  headline: string;
  description: string;
  datasetName: string;
  datasetDescription: string;
  recordCount: number;
  categoryCount: number;
  method: string;
  published: string;
  modified: string;
  crumbs: Crumb[];
}) {
  const url = absUrl(path);
  const datasetId = `${url}/#dataset`;
  return pageGraph([
    breadcrumbNode(path, crumbs),
    {
      "@type": "Article",
      "@id": `${url}/#article`,
      headline,
      description,
      mainEntityOfPage: url,
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: ogImageNode(),
      inLanguage: "en-US",
      datePublished: published,
      dateModified: modified,
      about: { "@id": datasetId },
      breadcrumb: { "@id": crumbId(path) },
    },
    {
      "@type": "Dataset",
      "@id": datasetId,
      name: datasetName,
      description: datasetDescription,
      url,
      creator: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      isAccessibleForFree: true,
      license: absUrl("/terms"),
      inLanguage: "en-US",
      datePublished: published,
      dateModified: modified,
      measurementTechnique: method,
      variableMeasured: [
        "Category",
        "Website type",
        "Colour palette",
        "Typography",
        "Detected technology",
      ],
      additionalProperty: [
        property("Records", String(recordCount)),
        property("Populated categories", String(categoryCount)),
      ],
    },
  ]);
}

/**
 * A journal article: BlogPosting inside the Blog, plus an optional FAQPage
 * built from the questions the page actually answers on screen.
 */
export function articleGraph({
  path,
  headline,
  description,
  published,
  modified,
  crumbs,
  faqs = [],
  about = [],
  wordCount,
}: {
  path: string;
  headline: string;
  description: string;
  published: string;
  modified: string;
  crumbs: Crumb[];
  faqs?: { question: string; answer: string }[];
  about?: string[];
  wordCount?: number;
}) {
  const url = absUrl(path);
  const articleId = `${url}/#article`;
  const nodes: JsonLdNode[] = [
    breadcrumbNode(path, crumbs),
    {
      "@type": "BlogPosting",
      "@id": articleId,
      headline,
      description,
      mainEntityOfPage: url,
      url,
      isPartOf: { "@id": `${absUrl("/blogs")}/#blog` },
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: ogImageNode(),
      inLanguage: "en-US",
      datePublished: published,
      dateModified: modified,
      breadcrumb: { "@id": crumbId(path) },
      isAccessibleForFree: true,
      ...(about.length ? { about: about.map((name) => ({ "@type": "Thing", name })) } : {}),
      ...(wordCount ? { wordCount } : {}),
    },
  ];

  // Only emitted when the questions are genuinely on the page.
  if (faqs.length) {
    nodes.push({
      "@type": "FAQPage",
      "@id": `${url}/#faq`,
      isPartOf: { "@id": articleId },
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return pageGraph(nodes);
}

/** The journal hub: a Blog whose blogPost list mirrors the published cards. */
export function blogGraph({
  posts,
  modified,
}: {
  posts: { path: string; headline: string; description: string; published: string; modified: string }[];
  modified: string;
}) {
  const path = "/blogs";
  const url = absUrl(path);
  return pageGraph([
    breadcrumbNode(path, [{ name: "Home", path: "/" }, { name: "Resources" }]),
    {
      "@type": "Blog",
      "@id": `${url}/#blog`,
      url,
      name: "AllWebsites.Design Journal",
      description:
        "Data-backed notes on colour, typography and technology, drawn from the website design archive.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": crumbId(path) },
      publisher: { "@id": ORG_ID },
      inLanguage: "en-US",
      dateModified: modified,
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        "@id": `${absUrl(post.path)}/#article`,
        url: absUrl(post.path),
        headline: post.headline,
        description: post.description,
        datePublished: post.published,
        dateModified: post.modified,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
      })),
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
