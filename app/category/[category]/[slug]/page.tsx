import { notFound } from 'next/navigation';
import { getWebsiteByCategoryAndSlug, getAllCategorySiteParams, getRelatedWebsites } from '@/lib/data';
import { getCategoryColor, categoryFromSlug } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedExhibits from '@/components/RelatedExhibits';
import NewsletterPostcard from '@/components/NewsletterPostcard';
import { generateBreadcrumbListSchema } from '@/lib/schema';
import CollageSitePage from '@/components/CollageSitePage';
import SingleSiteHero from '@/components/SingleSiteHero';
import EngineDatapoints from '@/components/EngineDatapoints';
import { siteHref } from '@/lib/paths';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllCategorySiteParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const website = await getWebsiteByCategoryAndSlug(category, slug);
  if (!website) return { title: 'Website Not Found' };

  const href = siteHref(website);
  return {
    title: `${website.name} — ${website.displayCategory || website.category} | AllWebsites.Design`,
    description: website.description,
    openGraph: {
      title: website.name,
      description: website.description,
      images: website.screenshotUrl ? [website.screenshotUrl] : undefined,
      type: 'website',
      url: `https://allwebsites.design${href}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: website.name,
      description: website.description,
      images: website.screenshotUrl ? [website.screenshotUrl] : undefined,
    },
    alternates: {
      canonical: href,
    },
  };
}

export default async function CategorySitePage({ params }: PageProps) {
  const { category, slug } = await params;
  const website = await getWebsiteByCategoryAndSlug(category, slug);
  if (!website) notFound();

  const relatedWebsites = await getRelatedWebsites(website, 6);
  const displayCategory = website.displayCategory || website.category;
  const categoryLabel = categoryFromSlug(category) || displayCategory;

  const breadcrumbSchema = generateBreadcrumbListSchema([
    { label: 'Home', href: '/' },
    { label: categoryLabel, href: `/c/${category}` },
    { label: website.name },
  ]);

  const paletteHexes = (website.palette || []).map((p) => p.hex).filter(Boolean);
  const accentColor = paletteHexes[0] || getCategoryColor(displayCategory);
  const colors = paletteHexes.length ? paletteHexes : [accentColor, '#111111', '#F5F5F7'];
  const fontName =
    website.fonts && website.fonts.length
      ? website.fonts.map((f) => f.name).filter(Boolean).join(' / ')
      : 'Inter';
  const hasScreenshot = website.fromEngine ? Boolean(website.fullScreenshotUrl) : true;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />

      <SingleSiteHero
        siteName={website.name}
        siteDescription={website.description}
        category={displayCategory}
        accentColor={accentColor}
        spotlightSize={300}
        image={hasScreenshot ? website.screenshotUrl : undefined}
      />

      <CollageSitePage
        title={website.name}
        category={displayCategory}
        description={website.description}
        siteUrl={website.url}
        image={website.screenshotUrl}
        fullImage={website.fullScreenshotUrl}
        fontName={fontName}
        colors={colors}
        accentColor={accentColor}
        websiteType={website.websiteType}
        techSummary={website.techSummary}
        hasScreenshot={hasScreenshot}
      />

      <EngineDatapoints website={website} />

      {relatedWebsites.length > 0 && (
        <RelatedExhibits
          sectionTitle="Similar Aesthetics"
          websites={relatedWebsites}
          buttonText="Browse Collections"
          buttonLink={`/c/${category}`}
        />
      )}

      <NewsletterPostcard
        title="The Monday Dispatch"
        subtitle="A weekly collection of the finest pixels on the internet. No spam, just raw design inspiration."
        placeholder="your@email.com"
        buttonText="Subscribe"
        accentColor={accentColor}
      />

      <Footer />
    </>
  );
}
