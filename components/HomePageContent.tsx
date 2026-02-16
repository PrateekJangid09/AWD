'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import QuantumDirectoryHero from '@/components/QuantumDirectoryHero';
import type { CategoryPill } from '@/components/QuantumDirectoryHero';
import { Website } from '@/lib/types';

const LumosGalleryGrid = dynamic(() => import('@/components/LumosGalleryGrid'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-200" />,
});

const PrecisionFilter = dynamic(() => import('@/components/PrecisionFilter'), {
  loading: () => <div className="h-20 animate-pulse bg-neutral-200" />,
});

const PrismBrowserGrid = dynamic(() => import('@/components/PrismBrowserGrid'), {
  loading: () => <div className="h-screen animate-pulse bg-neutral-900" />,
});

interface HomePageContentProps {
  categories: string[];
  categoryPills: CategoryPill[];
  featuredWebsites: Website[];
  /** Optional: when omitted, PrismBrowserGrid fetches from /api/websites on the client */
  websites?: Website[];
}

export default function HomePageContent({
  categories,
  categoryPills,
  featuredWebsites,
  websites = [],
}: HomePageContentProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPageTypes, setSelectedPageTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      <QuantumDirectoryHero
        headline="The Encyclopedia of Digital Design."
        subheadline="Curated inspiration for designers, developers, and founders. Browse by category to find exactly what you need."
        categories={categoryPills}
        browseButtonText="Browse All Templates"
        browseButtonLink="#browse"
        textColor="#050505"
        accentColor="#3B82F6"
        bgColor="#FFFFFF"
      />

      {/* Featured Section (Hall of Fame) */}
      <LumosGalleryGrid
        headline="Fresh from the Community"
        subheadline="Hand-picked websites showcasing the best in digital product design."
        items={featuredWebsites.map((w) => ({
          title: w.name,
          author: w.name,
          tag: w.displayCategory || w.category,
          image: w.screenshotUrl,
          slug: w.slug,
        }))}
        textColor="#050505"
        bgColor="#FFFFFF"
      />

      {/* Filter Section */}
      <PrecisionFilter
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        selectedPageTypes={selectedPageTypes}
        onPageTypeChange={setSelectedPageTypes}
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        textColor="#050505"
        bgColor="rgba(255, 255, 255, 0.95)"
        borderColor="rgba(0, 0, 0, 0.08)"
      />

      {/* Main Content Section - websites empty: grid fetches from /api/websites on mount */}
      <PrismBrowserGrid
        title="Selected Projects"
        subtitle="A showcase of high-fidelity digital products."
        websites={websites}
        initialSearchQuery={searchQuery}
        selectedCategories={selectedCategories}
        selectedPageTypes={selectedPageTypes}
      />
    </>
  );
}

