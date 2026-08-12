import type { Metadata } from 'next';
import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePageContent from '@/components/HomePageContent';
import { generateCollectionPageSchema, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/schema';
import { SITE_URL } from '@/lib/site';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const count = (await getWebsites()).length;
  const title = `${count.toLocaleString()} Curated Website Design Examples | AllWebsites.Design`;
  const description = `Browse ${count.toLocaleString()} cleaned and categorized website design references across SaaS, AI, portfolios, agencies, commerce, and more.`;
  return { title, description, alternates: { canonical: '/' }, openGraph: { title, description, type: 'website', url: SITE_URL, siteName: 'AllWebsites.Design' }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function HomePage() {
  const websites = await getWebsites();
  const featuredWebsites = websites.filter((website) => website.featured).slice(0, 20);
  const categoryPills = MACRO_CATEGORIES.filter((category) => category !== 'Browse All').map((title) => ({ title, count: String(websites.filter((website) => (website.displayCategory || website.category) === title).length) }));
  return (
    <>
      {[generateCollectionPageSchema(websites.length), generateOrganizationSchema(), generateWebSiteSchema()].map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <Header />
      <main className="min-h-screen"><HomePageContent categories={[...MACRO_CATEGORIES]} categoryPills={categoryPills} featuredWebsites={featuredWebsites} websites={websites.slice(0, 30)} archiveCount={websites.length} /></main>
      <Footer />
    </>
  );
}
