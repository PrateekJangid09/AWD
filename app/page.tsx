import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePageContent from '@/components/HomePageContent';
import {
  generateCollectionPageSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/schema';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '1,700+ Best Website Design Examples | SaaS, AI, Agency Inspiration 2026 - AllWebsites.Design',
  description: 'Discover 1,700+ curated website designs from top companies. Browse SaaS, AI, Agency, Fintech landing pages. Free design inspiration for designers & developers.',
  openGraph: {
    title: '1,700+ Best Website Design Examples | SaaS, AI, Agency Inspiration 2026 - AllWebsites.Design',
    description: 'Discover 1,700+ curated website designs from top companies. Browse SaaS, AI, Agency, Fintech landing pages. Free design inspiration for designers & developers.',
    type: 'website',
    url: 'https://www.allwebsites.design',
    siteName: 'AllWebsites.Design',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1,700+ Best Website Design Examples | SaaS, AI, Agency Inspiration 2026',
    description: 'Discover 1,700+ curated website designs from top companies. Browse SaaS, AI, Agency, Fintech landing pages.',
  },
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const websites = await getWebsites();
  const categories = MACRO_CATEGORIES;

  // Get featured websites
  const featuredWebsites = websites.filter(w => w.featured).slice(0, 20);

  // Category pills with counts for hero (exclude "Browse All")
  const categoryPills = MACRO_CATEGORIES.filter((c) => c !== 'Browse All').map((title) => ({
    title,
    count: String(websites.filter((w) => (w.displayCategory || w.category) === title).length),
  }));

  // Generate schema markup
  const collectionPageSchema = generateCollectionPageSchema(websites.length);
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <Header />
      
      <main className="min-h-screen">
        <HomePageContent
          categories={categories}
          categoryPills={categoryPills}
          featuredWebsites={featuredWebsites}
        />
        
      </main>

      <Footer />
    </>
  );
}