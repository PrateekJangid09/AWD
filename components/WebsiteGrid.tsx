'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import WebsiteCardSkeleton from '@/components/WebsiteCardSkeleton';
import EmptyState from '@/components/EmptyState';
import MagneticGallery from '@/components/MagneticGallery';
import PrismCategoryNav from '@/components/PrismCategoryNav';
import { Website } from '@/lib/types';

interface FilterState {
  sortBy: string;
  showFeatured: boolean;
  showRecent: boolean;
  colorScheme: string;
  showPopular: boolean;
}

interface WebsiteGridProps {
  websites: Website[];
  categories: string[];
  initialSearchQuery?: string;
  initialCategory?: string;
  categoryHeading?: string;
}

export default function WebsiteGrid({ 
  websites, 
  categories, 
  initialSearchQuery = '', 
  initialCategory = 'Browse All',
  categoryHeading
}: WebsiteGridProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const [autoLoadCount, setAutoLoadCount] = useState(0);
  const [tab, setTab] = useState<'new' | 'trending'>('trending');
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'name',
    showFeatured: false,
    showRecent: false,
    colorScheme: 'all',
    showPopular: false,
  });

  // Update search query when hero search changes
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery, searchQuery]);

  // Reset pagination and auto-load when filters/search/category change
  useEffect(() => {
    setVisibleCount(30);
    setAutoLoadCount(0);
  }, [
    activeCategory,
    searchQuery,
    filters.sortBy,
    filters.showFeatured,
    filters.showRecent,
    filters.colorScheme,
    filters.showPopular,
    tab,
  ]);

  // Setup Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(websites, {
      keys: ['name', 'description', 'displayCategory', 'category'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [websites]);

  // Filter and search websites
  const filteredWebsites = useMemo(() => {
    let results = websites;
    
    // Check if we're in default/homepage view (no filters applied)
    const isDefaultView = activeCategory === 'Browse All' && !searchQuery.trim();

    // Apply category filter
    if (activeCategory !== 'Browse All') {
      results = results.filter(site => 
        (site.displayCategory || site.category) === activeCategory
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const searchedIds = new Set(searchResults.map(r => r.item.id));
      results = results.filter(site => searchedIds.has(site.id));
    }

    // Advanced filters
    if (filters.showFeatured) {
      results = results.filter(website => website.qualityScore && website.qualityScore >= 4);
    }

    // Tab filters
    if (tab === 'new') {
      results = results.filter(website => {
        return website.name.toLowerCase().includes('new') || 
               website.description.toLowerCase().includes('2024') ||
               website.description.toLowerCase().includes('2025') ||
               website.description.toLowerCase().includes('latest');
      });
    } else if (tab === 'trending') {
      results = results.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    }

    if (filters.showRecent) {
      // Filter for recent websites based on name/description keywords
      results = results.filter(website => {
        return website.name.toLowerCase().includes('new') || 
               website.description.toLowerCase().includes('2024') ||
               website.description.toLowerCase().includes('latest');
      });
    }

    if (filters.showPopular) {
      // Sort by quality score for popularity
      results = results.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    }

    // Color scheme filter
    if (filters.colorScheme !== 'all') {
      results = results.filter(website => {
        switch (filters.colorScheme) {
          case 'dark':
            return website.description.toLowerCase().includes('dark') ||
                   website.name.toLowerCase().includes('dark');
          case 'light':
            return website.description.toLowerCase().includes('light') ||
                   website.description.toLowerCase().includes('minimal');
          case 'colorful':
            return website.description.toLowerCase().includes('colorful') ||
                   website.description.toLowerCase().includes('vibrant');
          default:
            return true;
        }
      });
    }

    // Sort results - preserve featured order on homepage, otherwise apply sort
    if (isDefaultView && filters.sortBy === 'name') {
      // Keep the default order from data.ts (featured first, then alphabetical)
      // No additional sorting needed
    } else {
      // Apply user-selected sorting
      switch (filters.sortBy) {
        case 'name':
          results = results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          results = results.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'recent':
          results = results.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
          break;
        case 'popular':
          results = results.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
          break;
        default:
          results = results.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    return results;
  }, [websites, activeCategory, searchQuery, fuse, filters, tab]);

  // Calculate website counts per category
  const websiteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(category => {
      if (category === 'Browse All') {
        counts[category] = websites.length;
      } else {
        counts[category] = websites.filter(site =>
          (site.displayCategory || site.category) === category
        ).length;
      }
    });
    return counts;
  }, [websites, categories]);

  const hasMore = visibleCount < filteredWebsites.length;

  // Auto-load more when user scrolls to bottom (up to 3 times)
  const autoLoadLock = useRef(false);
  useEffect(() => {
    if (!hasMore || autoLoadCount >= 3) return;

    const handleScroll = () => {
      if (!hasMore || autoLoadCount >= 3 || autoLoadLock.current) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        autoLoadLock.current = true;
        setAutoLoadCount((count) => count + 1);
        setVisibleCount((count) => count + 30);
        setTimeout(() => {
          autoLoadLock.current = false;
        }, 600);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, autoLoadCount]);

  const showManualLoadButton = hasMore && autoLoadCount >= 3;

  // Handler functions
  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <>
      {/* Category Heading and New Release / Trending Toggle */}
      {categoryHeading && (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {categoryHeading}
          </h1>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setTab('new')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all ${
                tab === 'new'
                  ? 'bg-white text-neutral-900 border-neutral-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]'
                  : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              New Release
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all ${
                tab === 'trending'
                  ? 'bg-white text-neutral-900 border-neutral-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]'
                  : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              Trending
            </button>
          </div>
        </div>
      )}
      
      {/* New Release / Trending Toggle - For pages without category heading */}
      {!categoryHeading && (
        <div className="mb-4 flex justify-center sm:justify-end">
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setTab('new')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all ${
                tab === 'new'
                  ? 'bg-white text-neutral-900 border-neutral-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]'
                  : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              New Release
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all ${
                tab === 'trending'
                  ? 'bg-white text-neutral-900 border-neutral-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]'
                  : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              Trending
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar */}
      {/* Category pills strip */}
      <div className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <PrismCategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          websiteCounts={websiteCounts}
          totalCount={websites.length}
        />
      </div>

      {/* Results Meta */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs sm:text-sm text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{Math.min(visibleCount, filteredWebsites.length)}</span> of{' '}
          <span className="font-semibold text-text-primary">{filteredWebsites.length}</span> sites
        </p>
        
        {(activeCategory !== 'Browse All' || searchQuery) && (
          <button
            onClick={() => {
              setActiveCategory('Browse All');
              setSearchQuery('');
            }}
            className="text-xs sm:text-sm text-deep-pink hover:text-dark-teal font-medium transition-colors self-start sm:self-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Website Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <WebsiteCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredWebsites.length > 0 ? (
        <MagneticGallery
          websites={filteredWebsites.slice(0, visibleCount)}
          hasMore={showManualLoadButton}
          onLoadMore={() => setVisibleCount((c) => c + 30)}
        />
      ) : (
        <EmptyState
          title="No websites found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{
            label: "Clear filters",
            onClick: () => {
              setActiveCategory('Browse All');
              setSearchQuery('');
            }
          }}
        />
      )}
    </>
  );
}
