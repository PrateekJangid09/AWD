import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LuminousGateway from '@/components/LuminousGateway';
import SpectrumGrid from '@/components/SpectrumGrid';
import VelocityVaultObsidian from '@/components/VelocityVaultObsidian';
import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';

/** Revalidate at most every 5 minutes (ISR). */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Website Design Categories and Collections',
  description: 'Explore governed website design collections across SaaS, AI, portfolios, agencies, commerce, media, architecture, hospitality, and more.',
  robots: { index: true },
  alternates: { canonical: '/c' },
};

export default async function AllCategoriesPage() {
  const websites = await getWebsites();

  const availableWebsites = websites.filter(w => w.featured).length >= 8 
    ? websites.filter(w => w.featured)
    : websites;
  const selectedWebsites = availableWebsites.slice(0, 8);
  
  const vaultProps: Record<string, string> = {
    title: "Velocity Deck",
  };
  
  selectedWebsites.forEach((site, index) => {
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
          title="CATEGORIES"
          subtitle="Governed collections of website design examples, organized for useful comparison."
          placeholder="Search the website archive"
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
