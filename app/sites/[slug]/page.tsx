import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getWebsiteBySlug, getAllSlugs, getRelatedWebsites, getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES, getCategoryColor } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedExhibits from '@/components/RelatedExhibits';
import NewsletterPostcard from '@/components/NewsletterPostcard';
import { generateBreadcrumbListSchema } from '@/lib/schema';
import CollageSitePage from '@/components/CollageSitePage';
import SingleSiteHero from '@/components/SingleSiteHero';
import MetricGrid from '@/components/MetricGrid';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all websites
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);

  if (!website) {
    return {
      title: 'Website Not Found',
    };
  }

  return {
    title: `${website.name} - AllWebsites.Design`,
    description: website.description,
    openGraph: {
      title: website.name,
      description: website.description,
      images: [website.screenshotUrl],
      type: 'website',
      url: `https://allwebsites.design/sites/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: website.name,
      description: website.description,
      images: [website.screenshotUrl],
    },
    alternates: {
      canonical: `/sites/${slug}`,
    },
  };
}

export default async function WebsiteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);

  if (!website) {
    notFound();
  }

  const relatedWebsites = await getRelatedWebsites(website, 6);
  const displayCategory = website.displayCategory || website.category;

  // Get totals for metrics section
  const allWebsites = await getWebsites();
  const totalWebsites = allWebsites.length;
  const totalCategories = MACRO_CATEGORIES.length - 1; // Exclude "Browse All"

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { label: 'Home', href: '/' },
    { label: displayCategory, href: `/?category=${encodeURIComponent(displayCategory)}` },
    { label: website.name },
  ]);

  // Generate color palette from category color
  const accentColor = getCategoryColor(displayCategory);
  const colors = generateColorPalette(accentColor);

  // Infer font name (default to common web fonts)
  const fontName = inferFontName(website.name);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />

      {/* Hero Section with Spotlight Effect */}
      <SingleSiteHero
        siteName={website.name}
        siteDescription={website.description}
        category={displayCategory}
        accentColor={accentColor}
        spotlightSize={300}
        image={website.screenshotUrl}
      />

      {/* Metrics Section */}
      <MetricGrid
        totalWebsites={totalWebsites}
        totalCategories={totalCategories}
      />

      {/* Detailed Collage Section */}
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
      />

      {/* Related Exhibits Section */}
      {relatedWebsites.length > 0 && (
        <RelatedExhibits
          sectionTitle="Similar Aesthetics"
          websites={relatedWebsites}
          buttonText="Browse Collections"
          buttonLink="/"
        />
      )}

      {/* Newsletter Postcard Section */}
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

// Generate a color palette from the accent color
function generateColorPalette(accentColor: string): string[] {
  // Default palette if color is invalid
  if (!accentColor || !accentColor.startsWith('#')) {
    return ['#F5F5F7', '#1D1D1F', '#0071E3', '#111111'];
  }

  try {
    // Convert hex to RGB
    const hex = accentColor.replace('#', '');
    if (hex.length !== 6) {
      return ['#F5F5F7', accentColor, '#1D1D1F', '#111111'];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Generate variations
    const lighten = (r: number, g: number, b: number, factor: number) => {
      const newR = Math.round(Math.min(255, r + (255 - r) * factor));
      const newG = Math.round(Math.min(255, g + (255 - g) * factor));
      const newB = Math.round(Math.min(255, b + (255 - b) * factor));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    const darken = (r: number, g: number, b: number, factor: number) => {
      const newR = Math.round(r * (1 - factor));
      const newG = Math.round(g * (1 - factor));
      const newB = Math.round(b * (1 - factor));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    return [
      lighten(r, g, b, 0.8), // Very light
      accentColor, // Original
      darken(r, g, b, 0.3), // Darker
      '#111111', // Black
    ];
  } catch (error) {
    // Fallback palette
    return ['#F5F5F7', accentColor, '#1D1D1F', '#111111'];
  }
}

// Infer font name from website name or use defaults
function inferFontName(name: string): string {
  // Simple heuristic: if name contains certain keywords, suggest fonts
  const lower = name.toLowerCase();
  if (lower.includes('apple') || lower.includes('airpod')) return 'San Francisco';
  if (lower.includes('google')) return 'Google Sans';
  if (lower.includes('microsoft')) return 'Segoe UI';
  
  // Default to common modern web fonts
  const fonts = ['Inter', 'SF Pro', 'Helvetica Neue', 'Roboto', 'System UI'];
  return fonts[Math.floor(Math.random() * fonts.length)];
}
