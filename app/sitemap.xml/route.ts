import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES, slugifyCategory } from '@/lib/categories';
import { AUDIT_REVIEW_DATE, PAGE_SIZE, SITE_URL } from '@/lib/site';

export const revalidate = 3600;
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character] || character));
function entry(url: string, priority: string, frequency: string, image?: string, title?: string) { return `<url><loc>${escapeXml(url)}</loc><lastmod>${AUDIT_REVIEW_DATE}</lastmod><changefreq>${frequency}</changefreq><priority>${priority}</priority>${image ? `<image:image><image:loc>${escapeXml(image)}</image:loc><image:title>${escapeXml(title || 'Website design screenshot')}</image:title></image:image>` : ''}</url>`; }

export async function GET() {
  const websites = await getWebsites();
  const entries = [entry(SITE_URL, '1.0', 'daily'), entry(`${SITE_URL}/archive`, '0.9', 'daily'), entry(`${SITE_URL}/c`, '0.8', 'weekly'), ...['about', 'manifesto', 'editorial-guidelines', 'submit', 'contact', 'privacy', 'terms', 'research/website-design-index-2026'].map((path) => entry(`${SITE_URL}/${path}`, '0.5', 'monthly'))];
  for (let page = 2; page <= Math.ceil(websites.length / PAGE_SIZE); page++) entries.push(entry(`${SITE_URL}/archive?page=${page}`, '0.7', 'weekly'));
  for (const category of MACRO_CATEGORIES.filter((item) => item !== 'Browse All' && item !== 'Other')) {
    const count = websites.filter((website) => (website.displayCategory || website.category) === category).length;
    if (count < 30) continue;
    for (let page = 1; page <= Math.ceil(count / PAGE_SIZE); page++) entries.push(entry(`${SITE_URL}/c/${slugifyCategory(category)}${page > 1 ? `?page=${page}` : ''}`, page === 1 ? '0.8' : '0.6', 'weekly'));
  }
  for (const website of websites) entries.push(entry(`${SITE_URL}/sites/${website.slug}`, '0.6', 'monthly', `${SITE_URL}${website.screenshotUrl}`, `${website.name} ${website.displayCategory || website.category} website design screenshot`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' } });
}
