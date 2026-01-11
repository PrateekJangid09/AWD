'use client';

import { useState } from 'react';
import AtmosphericGallery from '@/components/AtmosphericGallery';
import MetricGrid from '@/components/MetricGrid';
import RelicGrid from '@/components/RelicGrid';
import VelocityVault from '@/components/VelocityVault';
import PrismBrowserGrid from '@/components/PrismBrowserGrid';
import NebulaFilter from '@/components/NebulaFilter';
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleHeroSearch = (query: string) => {
    setHeroSearchQuery(query);
    // Scroll to browse section
    setTimeout(() => {
      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCategoryChange = (selected: string[]) => {
    setSelectedCategories(selected);
    // Scroll to website list when filter is applied
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
        title="HALL OF LEGENDS"
        subtitle="Digital Masterpieces That Define Excellence"
        websites={featuredWebsites}
      />

      {/* Velocity Vault Section - Hidden */}
      {/* <VelocityVault
        title="Velocity Deck"
        websites={websites}
      /> */}

      {/* Filter Section */}
      <NebulaFilter
        title="Browse by Sector"
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content Section */}
      <PrismBrowserGrid
        title="Selected Projects"
        subtitle="A showcase of high-fidelity digital products."
        websites={websites}
        initialSearchQuery={heroSearchQuery}
        selectedCategories={selectedCategories}
      />
    </>
  );
}

