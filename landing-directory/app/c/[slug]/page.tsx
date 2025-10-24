import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WebsiteGrid from '@/components/WebsiteGrid';
import { MACRO_CATEGORIES, categoryFromSlug, slugifyCategory } from '@/lib/categories';
import { getWebsites } from '@/lib/data';

type PageProps = { params: { slug: string } };

export async function generateStaticParams() {
  // Exclude 'Browse All'
  const slugs = MACRO_CATEGORIES.filter(c => c !== 'Browse All').map(c => ({ slug: slugifyCategory(c) }));
  return slugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = categoryFromSlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category} Websites – FigFiles`,
    description: `Explore curated ${category} landing pages and hero sections.`,
    robots: { index: true },
    alternates: { canonical: `/c/${params.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const category = categoryFromSlug(params.slug);
  if (!category) return notFound();

  const websites = await getWebsites();
  const categories = MACRO_CATEGORIES;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {category}
            </h1>
            <div className="hidden sm:block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #4735DD, #FF3E6C)' }}>
              Category
            </div>
          </div>
          <WebsiteGrid websites={websites} categories={categories} initialCategory={category} />
        </div>
      </main>
      <Footer />
    </>
  );
}


