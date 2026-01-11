import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/HeaderFramer';
import Footer from '@/components/Footer';
import CategoryHero from '@/components/CategoryHero';
import PrismBrowserGrid from '@/components/PrismBrowserGrid';
import SectorFanHero from '@/components/SectorFanHero';
import ChameleonHUD from '@/components/ChameleonHUD';
import { MACRO_CATEGORIES, categoryFromSlug, slugifyCategory, getCategoryColor } from '@/lib/categories';
import { getWebsites } from '@/lib/data';
import {
  generateItemListSchema,
  generateBreadcrumbListSchema,
} from '@/lib/schema';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Exclude 'Browse All'
  const slugs = MACRO_CATEGORIES.filter(c => c !== 'Browse All').map(c => ({ slug: slugifyCategory(c) }));
  return slugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category} Websites – AllWebsites.Design`,
    description: `Explore curated ${category} landing pages and hero sections.`,
    robots: { index: true },
    alternates: { canonical: `/c/${slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return notFound();

  const websites = await getWebsites();
  const categories = MACRO_CATEGORIES;

  // Calculate category-specific stats
  const categoryWebsites = websites.filter(
    (site) => (site.displayCategory || site.category) === category
  );
  const categoryCount = categoryWebsites.length;
  const featuredCount = categoryWebsites.filter((w) => w.featured).length;
  const avgQuality = categoryWebsites.length > 0
    ? categoryWebsites.reduce((acc, w) => acc + (w.qualityScore || 50), 0) / categoryWebsites.length
    : 0;
  const totalCategories = MACRO_CATEGORIES.filter(c => c !== 'Browse All').length;

  // Get category color and create a color palette
  const categoryColor = getCategoryColor(category);
  // Use category color as primary, then use other category colors for variety
  const colorPalette = [
    categoryColor,
    getCategoryColor('AI') !== categoryColor ? getCategoryColor('AI') : getCategoryColor('Fintech'),
    getCategoryColor('Agency/Studio') !== categoryColor ? getCategoryColor('Agency/Studio') : getCategoryColor('Developer'),
    getCategoryColor('E-commerce') !== categoryColor ? getCategoryColor('E-commerce') : getCategoryColor('Portfolio'),
  ];

  // Generate schema markup
  const itemListSchema = generateItemListSchema(category, websites, `/c/${slug}`);
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { label: 'Home', href: '/' },
    { label: category },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        <CategoryHero 
          category={category} 
          websites={websites}
          description={`Explore curated ${category} landing pages and hero sections.`}
        />
        <ChameleonHUD
          stat1_val={`${categoryCount}`}
          stat1_lbl="Archive"
          stat1_color={colorPalette[0]}
          stat2_val={`${featuredCount}`}
          stat2_lbl="Featured"
          stat2_color={colorPalette[1]}
          stat3_val={`${(avgQuality / 10).toFixed(1)}`}
          stat3_lbl="Quality"
          stat3_color={colorPalette[2]}
          stat4_val={`${totalCategories}`}
          stat4_lbl="Categories"
          stat4_color={colorPalette[3]}
        />
        <PrismBrowserGrid
          title={`${category} Projects`}
          subtitle={`A showcase of high-fidelity ${category.toLowerCase()} digital products.`}
          websites={websites}
          initialCategory={category}
        />
        <SectorFanHero 
          currentCategory={category}
          websites={websites}
          title="THE SECTORS"
        />
      </main>
      <Footer variant="inverted" />
    </>
  );
}


