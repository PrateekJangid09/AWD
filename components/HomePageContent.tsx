'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AtmosphericGallery from '@/components/AtmosphericGallery';
import MetricGrid from '@/components/MetricGrid';
import { Website } from '@/lib/types';

// Dynamic imports for below-the-fold components to reduce initial bundle size
const RelicGrid = dynamic(() => import('@/components/RelicGrid'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-900" />,
});

const NebulaFilter = dynamic(() => import('@/components/NebulaFilter'), {
  loading: () => <div className="h-48 animate-pulse bg-neutral-900" />,
});

const PrismBrowserGrid = dynamic(() => import('@/components/PrismBrowserGrid'), {
  loading: () => <div className="h-screen animate-pulse bg-neutral-900" />,
});

interface HomePageContentProps {
  categories: string[];
  totalWebsites: number;
  totalCategories: number;
  featuredWebsites: Website[];
  /** Optional: when omitted, PrismBrowserGrid fetches from /api/websites on the client */
  websites?: Website[];
}

export default function HomePageContent({
  categories,
  totalWebsites,
  totalCategories,
  featuredWebsites,
  websites = [],
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

      {/* Main Content Section - websites empty: grid fetches from /api/websites on mount */}
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

