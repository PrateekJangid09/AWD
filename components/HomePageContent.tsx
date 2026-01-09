'use client';

import { useState } from 'react';
import AtmosphericGallery from '@/components/AtmosphericGallery';
import MetricGrid from '@/components/MetricGrid';
import RelicGrid from '@/components/RelicGrid';
import PrismBrowserGrid from '@/components/PrismBrowserGrid';
import { Website } from '@/lib/types';
import AutoScrollTicker from '@/components/AutoScrollTicker';

interface HomePageContentProps {
  websites: Website[];
  categories: string[];
  totalWebsites: number;
  totalCategories: number;
  featuredWebsites: Website[];
}

export default function HomePageContent({
  websites,
  categories,
  totalWebsites,
  totalCategories,
  featuredWebsites,
}: HomePageContentProps) {
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const handleHeroSearch = (query: string) => {
    setHeroSearchQuery(query);
    // Scroll to browse section
    setTimeout(() => {
      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      {/* Hero Section */}
      <AtmosphericGallery
        title="DESIGN INTELLIGENCE"
        subtitle="Curating the finest digital experiences."
        placeholder="Search the archive..."
        featuredWebsites={featuredWebsites}
        onSearch={handleHeroSearch}
      />

      {/* Metric strip section */}
      <MetricGrid
        totalWebsites={totalWebsites}
        totalCategories={totalCategories}
      />

      {/* Featured Section */}
      <RelicGrid
        title="The Pantheon"
        subtitle="A collection of digital masterpieces that have achieved legendary status."
        websites={featuredWebsites}
      />

      {/* Main Content Section */}
      <PrismBrowserGrid
        title="Selected Projects"
        subtitle="A showcase of high-fidelity digital products."
        websites={websites}
        initialSearchQuery={heroSearchQuery}
      />
    </>
  );
}

