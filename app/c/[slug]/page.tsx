import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryHero from '@/components/CategoryHero';
import PrismBrowserGrid from '@/components/PrismBrowserGrid';
import Pagination from '@/components/Pagination';
import { MACRO_CATEGORIES, categoryFromSlug, slugifyCategory } from '@/lib/categories';
import { getWebsites } from '@/lib/data';
import { getCategoryContent } from '@/lib/category-content';
import { generateBreadcrumbListSchema, generateItemListSchema } from '@/lib/schema';
import { PAGE_SIZE, SITE_URL, pageCount, validPage } from '@/lib/site';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export const revalidate = 300;
export async function generateStaticParams() { return MACRO_CATEGORIES.filter((category) => category !== 'Browse All').map((category) => ({ slug: slugifyCategory(category) })); }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: 'Category Not Found' };
  const content = getCategoryContent(category);
  const websites = (await getWebsites()).filter((website) => (website.displayCategory || website.category) === category);
  const pages = pageCount(websites.length);
  const page = validPage((await searchParams).page, pages);
  const canonical = `/c/${slug}${page > 1 ? `?page=${page}` : ''}`;
  const title = `${content.title}: ${websites.length.toLocaleString()} Examples${page > 1 ? ` — Page ${page}` : ''}`;
  return { title, description: content.description, alternates: { canonical }, robots: category === 'Other' || websites.length < 30 ? { index: false, follow: true } : { index: true, follow: true }, openGraph: { title, description: content.description, url: `${SITE_URL}${canonical}`, type: 'website' }, twitter: { card: 'summary_large_image', title, description: content.description } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();
  const content = getCategoryContent(category);
  const all = await getWebsites();
  const categoryWebsites = all.filter((website) => (website.displayCategory || website.category) === category);
  const pages = pageCount(categoryWebsites.length);
  const page = validPage((await searchParams).page, pages);
  const items = categoryWebsites.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const route = `/c/${slug}${page > 1 ? `?page=${page}` : ''}`;
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateItemListSchema(category, items, route, categoryWebsites.length, (page - 1) * PAGE_SIZE + 1)) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbListSchema([{ label: 'Home', href: '/' }, { label: 'Categories', href: '/c' }, { label: category, href: `/c/${slug}` }])) }} /><Header /><main className="min-h-screen bg-background"><nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pb-2 pt-28 text-sm"><Link href="/">Home</Link> / <Link href="/c">Categories</Link> / {category}</nav><CategoryHero category={category} websites={all} description={content.description} /><section className="mx-auto max-w-5xl px-5 py-12"><h2 className="text-3xl font-bold">About this collection</h2><p className="mt-4 text-lg leading-8">{content.intro}</p><p className="mt-3 text-neutral-600">{content.secondary}</p><ul className="mt-5 flex flex-wrap gap-2">{content.focusTags.map((tag) => <li key={tag} className="rounded-full border px-3 py-1 text-sm">{tag}</li>)}</ul></section><PrismBrowserGrid title={`${categoryWebsites.length.toLocaleString()} ${category} Website Examples`} subtitle={`Page ${page} of ${pages}`} websites={items} /><Pagination page={page} totalPages={pages} pathname={`/c/${slug}`} /></main><Footer variant="inverted" /></>
  );
}
