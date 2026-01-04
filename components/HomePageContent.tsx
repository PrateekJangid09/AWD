'use client';

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import WebsiteGrid from '@/components/WebsiteGrid';
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
      <HeroSection
        totalWebsites={totalWebsites}
        totalCategories={totalCategories}
        featuredWebsites={featuredWebsites}
        onSearch={handleHeroSearch}
      />

      {/* Auto-scrolling ticker - REMOVED */}

      {/* Main Content Section */}
      <section id="browse" className="py-12 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <WebsiteGrid 
            websites={websites} 
            categories={categories}
            initialSearchQuery={heroSearchQuery}
          />
        </div>
      </section>
    </>
  );
}

