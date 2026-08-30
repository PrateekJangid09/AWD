import type { Metadata } from "next";

export const SITE_URL = "https://www.allwebsites.design";
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

export function absUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMeta({
  title,
  description,
  path,
  index = true,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absUrl(path);
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
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absUrl(path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function pageJsonLd({
  name,
  description,
  path,
  crumbs,
  extra = [],
}: {
  name: string;
  description: string;
  path: string;
  crumbs: { name: string; path: string }[];
  extra?: Record<string, unknown>[];
}) {
  return [
    websiteJsonLd(),
    organizationJsonLd(),
    breadcrumbJsonLd(crumbs),
    webPageJsonLd({ name, description, path }),
    ...extra,
  ];
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/logo.png"),
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/archive?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function collectionJsonLd({
  name,
  description,
  path,
  count,
}: {
  name: string;
  description: string;
  path: string;
  count?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absUrl(path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    ...(count != null ? { numberOfItems: count } : {}),
  };
}

export function siteRecordJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  url: string;
  domain: string;
  image?: string;
  category?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: opts.name,
    description: opts.description,
    url: absUrl(opts.path),
    about: {
      "@type": "WebSite",
      name: opts.name,
      url: opts.url,
      identifier: opts.domain,
    },
    genre: opts.category ?? "Website design",
    ...(opts.image ? { image: absUrl(opts.image) } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}
