import { Website } from './types';
import { MACRO_CATEGORIES, slugifyCategory } from './categories';

const SITE_URL = 'https://www.allwebsites.design';

export interface SchemaOrganization {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

export interface SchemaWebSite {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface SchemaCollectionPage {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': string;
    numberOfItems: number;
  };
}

export interface SchemaItemList {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  itemListElement: Array<{
    '@type': string;
    position: number;
    item: {
      '@type': string;
      '@id': string;
      name: string;
      url: string;
      image?: string;
    };
  }>;
}

export interface SchemaBreadcrumbList {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateOrganizationSchema(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AllWebsites.Design',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  };
}

export function generateWebSiteSchema(): SchemaWebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AllWebsites.Design',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCollectionPageSchema(totalWebsites: number): SchemaCollectionPage {
  const countText = totalWebsites >= 1000 
    ? `${Math.floor(totalWebsites / 100) * 100}+`
    : `${totalWebsites}+`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${countText} Best Website Design Examples | SaaS, AI, Agency Inspiration 2026`,
    description: `Discover ${countText} curated website designs from top companies. Browse SaaS, AI, Agency, Fintech landing pages. Free design inspiration for designers & developers.`,
    url: SITE_URL,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalWebsites,
    },
  };
}

export function generateItemListSchema(
  category: string,
  websites: Website[],
  pageUrl: string
): SchemaItemList {
  const categorySlug = slugifyCategory(category);
  const categoryWebsites = websites.filter(
    (w) => (w.displayCategory || w.category) === category
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category} Websites - AllWebsites.Design`,
    description: `Explore curated ${category} landing pages and hero sections.`,
    url: `${SITE_URL}${pageUrl}`,
    numberOfItems: categoryWebsites.length,
    itemListElement: categoryWebsites.slice(0, 20).map((website, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/sites/${website.slug}`,
        name: website.name,
        url: `${SITE_URL}/sites/${website.slug}`,
        image: `${SITE_URL}${website.screenshotUrl}`,
      },
    })),
  };
}

export function generateBreadcrumbListSchema(
  items: Array<{ label: string; href?: string }>
): SchemaBreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : `${SITE_URL}${items.slice(0, index + 1).map((i) => i.href || '').join('')}`,
    })),
  };
}
