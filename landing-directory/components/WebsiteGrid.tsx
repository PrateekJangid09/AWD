'use client';

import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import WebsiteCardTest from '@/components/WebsiteCardTest';
import WebsiteCardSkeleton from '@/components/WebsiteCardSkeleton';
import EmptyState from '@/components/EmptyState';
import AdvancedFilterBar from '@/components/AdvancedFilterBar';
import EnhancedSearchBar from '@/components/EnhancedSearchBar';
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
  }, [initialSearchQuery]);

  // Reset pagination when filters/search/category change
  useEffect(() => {
    setVisibleCount(30);
  }, [activeCategory, searchQuery, filters.sortBy, filters.showFeatured, filters.showRecent, filters.colorScheme, filters.showPopular, tab]);

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
          <div className="inline-flex items-center bg-foreground/5 border border-white/20 rounded-full p-1">
            <button
              onClick={() => setTab('new')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${tab === 'new' ? 'text-white' : 'text-foreground/80'}`}
              style={tab === 'new' ? { background: 'linear-gradient(135deg, #4735DD, #FF3E6C)' } : {}}
            >
              New Release
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`ml-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${tab === 'trending' ? 'text-white' : 'text-foreground/80'}`}
              style={tab === 'trending' ? { background: 'linear-gradient(135deg, #4735DD, #FF3E6C)' } : {}}
            >
              Trending
            </button>
          </div>
        </div>
      )}
      
      {/* New Release / Trending Toggle - For pages without category heading */}
      {!categoryHeading && (
        <div className="mb-4 flex justify-center sm:justify-end">
          <div className="inline-flex items-center bg-foreground/5 border border-white/20 rounded-full p-1">
            <button
              onClick={() => setTab('new')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${tab === 'new' ? 'text-white' : 'text-foreground/80'}`}
              style={tab === 'new' ? { background: 'linear-gradient(135deg, #4735DD, #FF3E6C)' } : {}}
            >
              New Release
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`ml-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${tab === 'trending' ? 'text-white' : 'text-foreground/80'}`}
              style={tab === 'trending' ? { background: 'linear-gradient(135deg, #4735DD, #FF3E6C)' } : {}}
            >
              Trending
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar */}
      <div className="mb-8">
        <EnhancedSearchBar
          onSearch={setSearchQuery}
          websites={websites}
          placeholder="Search by name, description, or category..."
        />
      </div>

      {/* Advanced Filter Bar */}
      <div className="mb-6">
        <AdvancedFilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          websiteCounts={websiteCounts}
          totalCount={websites.length}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-12">
            {filteredWebsites.slice(0, visibleCount).map((website) => (
              <WebsiteCardTest key={website.id} website={website} />
            ))}
          </div>
          {visibleCount < filteredWebsites.length && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + 30)}
                className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #FFD769 0%, #FFA200 100%)',
                  color: '#0b0b14',
                  border: '1px solid rgba(255, 170, 0, 0.6)',
                  borderRadius: '50px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 18px rgba(255,162,0,0.25)'
                }}
              >
                Load more
              </button>
            </div>
          )}
        </>
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
