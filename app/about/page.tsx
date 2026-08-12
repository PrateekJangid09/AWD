import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/about/HeroSection';
import AllWebsitesAbout from '@/components/about/AboutMissionGrid';
import CategoryIndex from '@/components/about/CategoryIndex';
import Manifesto from '@/components/about/Manifesto';
import FaqSection from '@/components/about/FaqSection';
import ActionGrid from '@/components/about/ActionGrid';
import { getWebsites } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> { const count = (await getWebsites()).length; return { title: 'About AllWebsites.Design', description: `Learn how AllWebsites.Design maintains a cleaned archive of ${count.toLocaleString()} website design references.`, alternates: { canonical: '/about' } }; }

export default async function AboutPage() {
  // Fetch websites to populate the marquee
  const websites = await getWebsites();
  
  // Filter out hidden websites
  const visibleWebsites = websites.filter(w => !w.hidden);
  
  // Get more websites to avoid repetition (80 total = 40 per column)
  const firstWebsites = visibleWebsites.slice(0, 80);
  
  // Split into two columns for the marquee - each column gets 40 unique images
  const imagesCol1 = firstWebsites.slice(0, 40).map(w => ({ src: w.screenshotUrl, alt: `${w.name} ${w.displayCategory || w.category} website design screenshot` }));
  const imagesCol2 = firstWebsites.slice(40, 80).map(w => ({ src: w.screenshotUrl, alt: `${w.name} ${w.displayCategory || w.category} website design screenshot` }));
  
  // Get total count
  const totalCount = visibleWebsites.length;

  // Count distinct macro categories (using displayCategory when available)
  const categorySet = new Set(
    visibleWebsites.map((w) => (w.displayCategory || w.category || '').trim()).filter(Boolean),
  );
  const categoryCount = categorySet.size;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection
          title="We curate the internet's finest digital experiences."
          description="AllWebsites.Design is a curated directory of website designs from top companies. Our mission is to provide designers with a comprehensive resource for inspiration."
            statsText={`${totalCount.toLocaleString()} Active Sites Tracked`}
          imagesCol1={imagesCol1}
          imagesCol2={imagesCol2}
        />

        {/* Mission / Stats Bento Section */}
        <section className="border-t border-foreground/20">
          <AllWebsitesAbout
            stat1Value={totalCount.toLocaleString()}
            stat1Label="Curated Designs"
            stat2Value={`${categoryCount}+`}
            stat2Label="Categories"
          />
        </section>

        {/* Colored Archive Index by Category */}
        <section className="border-t border-foreground/20">
          <CategoryIndex />
        </section>

        {/* Manifesto / Why Section */}
        <section className="border-t border-foreground/20">
          <Manifesto />
        </section>

        {/* FAQs Section */}
        <section className="border-t border-foreground/20">
          <FaqSection />
        </section>

        {/* Community Action Grid */}
        <section className="border-t border-foreground/20">
          <ActionGrid />
        </section>
      </main>
      <Footer variant="inverted" />
    </>
  );
}
