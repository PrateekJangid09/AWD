import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LuminousGateway from '@/components/LuminousGateway';
import SpectrumGrid from '@/components/SpectrumGrid';
import VelocityVaultObsidian from '@/components/VelocityVaultObsidian';
import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'All Categories – AllWebsites.Design',
  description: 'Explore all website categories in our comprehensive archive.',
  robots: { index: true },
  alternates: { canonical: '/c' },
};

export default async function AllCategoriesPage() {
  const websites = await getWebsites();

  // Extract and randomize websites for VelocityVaultObsidian
  // Use featured websites if available, otherwise use all websites
  const availableWebsites = websites.filter(w => w.featured).length >= 8 
    ? websites.filter(w => w.featured)
    : websites;
  
  // Shuffle array using Fisher-Yates algorithm
  const shuffled = [...availableWebsites];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Take first 8 random websites
  const randomWebsites = shuffled.slice(0, 8);
  
  const vaultProps: Record<string, string> = {
    title: "Velocity Deck",
  };
  
  randomWebsites.forEach((site, index) => {
    const i = index + 1;
    vaultProps[`t${i}`] = site.name;
    vaultProps[`tag${i}`] = site.displayCategory || site.category || 'Featured';
    vaultProps[`img${i}`] = site.screenshotUrl || '';
    vaultProps[`slug${i}`] = site.slug || '';
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <LuminousGateway 
          title="THE ARCHIVE"
          subtitle="A curated collection of digital design systems and templates."
          placeholder="What are you building today?"
        />
        <SpectrumGrid 
          title="BROWSE SECTORS"
          websites={websites}
        />
        <VelocityVaultObsidian {...vaultProps} />
      </main>
      <Footer variant="inverted" />
    </>
  );
}