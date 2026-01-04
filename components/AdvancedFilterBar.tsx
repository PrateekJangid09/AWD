 'use client';

import { useState, useEffect, useRef } from 'react';
import { getCategoryColor } from '@/lib/categories';

interface AdvancedFilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  websiteCounts: Record<string, number>;
  totalCount: number;
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  sortBy: string;
  showFeatured: boolean;
  showRecent: boolean;
  colorScheme: string;
  showPopular: boolean;
}

export default function AdvancedFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  websiteCounts,
  totalCount,
  onSortChange,
  onFilterChange,
}: AdvancedFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'name',
    showFeatured: false,
    showRecent: false,
    colorScheme: 'all',
    showPopular: false,
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      sortBy: 'name',
      showFeatured: false,
      showRecent: false,
      colorScheme: 'all',
      showPopular: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.showFeatured || filters.showRecent || filters.colorScheme !== 'all' || filters.showPopular;

  return (
    <div className="space-y-4">
      {/* Main Category Filter */}
      <div className="relative">
        <div className="pb-2">
          <div className="flex flex-wrap gap-2 px-1">
            {['Browse All', ...categories.filter(c => c !== 'Browse All')].map((category) => {
              const isActive = activeCategory === category;
              const count = category === 'Browse All' ? totalCount : websiteCounts[category] || 0;
              const categoryColor = getCategoryColor(category);
              
              return (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-sm border transition-all duration-500 group-hover:bg-white/10 group-hover:backdrop-blur-md group-hover:shadow-xl whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: category === 'Browse All' ? '#FFA200CC' : `${categoryColor}CC`,
                    borderColor: category === 'Browse All' ? '#FFA20080' : `${categoryColor}80`,
                    boxShadow: category === 'Browse All' ? '0 4px 20px #FFA20066' : `0 4px 20px ${categoryColor}66`,
                  }}
                  aria-pressed={isActive}
                >
                  <span>{category} {count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Filters removed per request */}
    </div>
  );
}
