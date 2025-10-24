'use client';

import { useRef } from 'react';
import { getCategoryColor } from '@/lib/categories';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  websiteCounts: Record<string, number>;
  totalCount: number;
  showQualityFilter?: boolean;
}

export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  websiteCounts,
  totalCount,
  showQualityFilter = false,
}: FilterBarProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const allCategories = showQualityFilter 
    ? ['Best Quality', 'High Quality', 'Medium Quality', 'Low Quality', 'Browse All', ...categories.filter(c => c !== 'Browse All')]
    : ['Browse All', ...categories.filter(c => c !== 'Browse All')];
  
  return (
    <div className="relative">
      <div className="pb-2">
        <div className="flex flex-wrap gap-2 px-1">
          {allCategories.map((category) => {
            const isActive = activeCategory === category;
            const count = category === 'Browse All' 
              ? totalCount
              : category.startsWith('Quality')
              ? 0 // Quality filters don't show counts
              : websiteCounts[category] || 0;
            const categoryColor = getCategoryColor(category);
            const isLight = typeof window !== 'undefined' && document.documentElement.classList.contains('theme-light');
            
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`
                  group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium category-chip
                  transition-all duration-300 active:scale-95 whitespace-nowrap
                  ${
                    isActive
                      ? (isLight ? 'shadow-none' : 'text-white shadow-lg')
                      : (isLight ? '' : 'text-white/90 hover:shadow-md')
                  }
                `}
                style={{
                  // expose color for light mode CSS
                  ['--chip-color' as any]: category === 'Browse All' ? '#4735DD' : categoryColor,
                  ...(isLight
                    ? {
                        background: isActive
                          ? (category === 'Browse All' ? '#4735DD' : categoryColor)
                          : `${category === 'Browse All' ? '#4735DD' : categoryColor}26`, // ~15% tint
                        color: isActive ? '#FFFFFF' : '#0B0B14',
                        border: `1px solid ${category === 'Browse All' ? '#4735DD' : categoryColor}55`,
                        borderRadius: '50px',
                        boxShadow: 'none',
                        backdropFilter: 'none',
                      }
                    : {
                        background: isActive
                          ? `linear-gradient(135deg, ${category === 'Browse All' ? '#4735DD' : categoryColor}80, ${category === 'Browse All' ? '#4735DD' : categoryColor}40)`
                          : `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))`,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50px',
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.1)`,
                      }
                  ),
                }}
                aria-pressed={isActive}
                aria-label={`Filter by ${category} (${count} sites)`}
              >
                {/* Neon glow background (dark mode only) */}
                {!isLight && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        `radial-gradient(120% 120% at 50% 0%, ${(category === 'Browse All' ? '#4735DD' : categoryColor)}22 0%, transparent 60%),` +
                        `radial-gradient(80% 80% at 90% 100%, ${(category === 'Browse All' ? '#4735DD' : categoryColor)}18 0%, transparent 70%),` +
                        `radial-gradient(80% 80% at 10% 100%, ${(category === 'Browse All' ? '#4735DD' : categoryColor)}10 0%, transparent 70%)`,
                      mixBlendMode: 'screen',
                      borderRadius: '50px',
                      boxShadow: `inset 0 0 0 1px ${(category === 'Browse All' ? '#4735DD' : categoryColor)}33, 0 8px 24px -10px ${(category === 'Browse All' ? '#4735DD' : categoryColor)}55`,
                    }}
                  />
                )}

                <span className="relative z-10">{category}</span>
                <span
                  className={`
                    inline-flex h-5 min-w-[20px] items-center justify-center px-1.5 text-xs font-semibold count-badge
                    ${
                      isActive
                        ? (isLight ? '' : 'bg-white/20 text-white')
                        : (isLight ? '' : 'text-white')
                    }
                  `}
                  style={{ 
                    backgroundColor: isLight
                      ? (isActive ? `${(category === 'Browse All' ? '#4735DD' : categoryColor)}66` : `${(category === 'Browse All' ? '#4735DD' : categoryColor)}33`)
                      : (!isActive ? `${(category === 'Browse All' ? '#4735DD' : categoryColor)}26` : undefined),
                    borderRadius: '50px',
                    color: isLight ? (isActive ? '#FFFFFF' : '#0B0B14') : undefined,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

