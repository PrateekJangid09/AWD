import { Website } from './types';
import { slugifyCategory } from './categories';
import { SITE_NAME, SITE_URL, absoluteUrl } from './site';

export function generateOrganizationSchema() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: absoluteUrl('/Vector.png') };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL,
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/archive?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  };
}

export function generateCollectionPageSchema(totalWebsites: number) {
  return {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `${totalWebsites.toLocaleString()} curated website design examples`,
    description: 'A cleaned and deduplicated archive of website design references.', url: SITE_URL,
    mainEntity: { '@type': 'ItemList', numberOfItems: totalWebsites },
  };
}

export function generateItemListSchema(category: string, websites: Website[], pageUrl: string, total = websites.length, startPosition = 1) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: `${category} website design examples`, description: `Browse curated ${category} website design references.`,
    url: absoluteUrl(pageUrl), numberOfItems: total,
    itemListElement: websites.map((website, index) => ({
      '@type': 'ListItem', position: startPosition + index,
      item: { '@type': 'WebSite', '@id': absoluteUrl(`/sites/${website.slug}`), name: website.name, url: absoluteUrl(`/sites/${website.slug}`), image: absoluteUrl(website.screenshotUrl) },
    })),
  };
}

export function generateBreadcrumbListSchema(items: Array<{ label: string; href: string }>) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, item: absoluteUrl(item.href) })),
  };
}

export function generateWebsiteDesignSchema(website: Website) {
  const category = website.displayCategory || website.category;
  return {
    '@context': 'https://schema.org', '@type': 'WebPage', name: `${website.name} website design inspiration`,
    description: website.description, url: absoluteUrl(`/sites/${website.slug}`), primaryImageOfPage: absoluteUrl(website.screenshotUrl),
    about: { '@type': 'Thing', name: `${category} website design` },
    isPartOf: { '@type': 'CollectionPage', name: `${category} website design inspiration`, url: absoluteUrl(`/c/${slugifyCategory(category)}`) },
  };
}
