import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrismBrowserGrid from '@/components/PrismBrowserGrid';
import Pagination from '@/components/Pagination';
import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';
import { generateBreadcrumbListSchema, generateItemListSchema } from '@/lib/schema';
import { PAGE_SIZE, pageCount, validPage } from '@/lib/site';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Boolean(params.q || params.category);
  return { title: 'Complete Website Design Archive', description: 'Search and browse the complete cleaned AllWebsites.Design catalogue with crawlable pagination.', alternates: { canonical: '/archive' }, robots: filtered ? { index: false, follow: true } : { index: true, follow: true } };
}

export default async function ArchivePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = String(params.q || '').trim();
  const category = String(params.category || '');
  const all = await getWebsites();
  const filtered = all.filter((site) => (!category || (site.displayCategory || site.category) === category) && (!q || `${site.name} ${site.description} ${site.category}`.toLowerCase().includes(q.toLowerCase())));
  const pages = pageCount(filtered.length);
  const page = validPage(params.page, pages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateItemListSchema('Website Design Archive', items, `/archive${page > 1 ? `?page=${page}` : ''}`, filtered.length, (page - 1) * PAGE_SIZE + 1)) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbListSchema([{ label: 'Home', href: '/' }, { label: 'Archive', href: '/archive' }])) }} /><Header />
      <main className="min-h-screen bg-white px-5 pb-20 pt-32 text-black md:px-10"><div className="mx-auto max-w-7xl"><nav aria-label="Breadcrumb" className="text-sm text-neutral-600"><Link href="/">Home</Link> / Archive</nav><h1 className="mt-8 text-5xl font-black tracking-tight md:text-8xl">Complete Website Design Archive</h1><p className="mt-5 max-w-3xl text-lg text-neutral-600">Browse {all.length.toLocaleString()} cleaned and deduplicated references. Results are server-rendered in pages of {PAGE_SIZE}.</p>
      <form className="mt-10 grid gap-3 md:grid-cols-[1fr_260px_auto]" method="get"><input className="rounded-xl border border-black/20 px-4 py-3" name="q" defaultValue={q} placeholder="Search websites" /><select className="rounded-xl border border-black/20 px-4 py-3" name="category" defaultValue={category}><option value="">All categories</option>{MACRO_CATEGORIES.filter((item) => item !== 'Browse All').map((item) => <option key={item}>{item}</option>)}</select><button className="rounded-xl bg-black px-6 py-3 text-white">Search</button></form>
      <PrismBrowserGrid title={`${filtered.length.toLocaleString()} references`} subtitle={`Page ${page} of ${pages}`} websites={items} /><Pagination page={page} totalPages={pages} pathname="/archive" query={{ q: q || undefined, category: category || undefined }} /></div></main><Footer /></>
  );
}
