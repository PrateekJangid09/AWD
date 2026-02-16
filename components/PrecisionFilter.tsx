'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryColor } from '@/lib/categories';

/** Page-type sub-categories for the filter panel (label + keyword used in description/name filter) */
export const PAGE_TYPE_OPTIONS: { label: string; keyword: string }[] = [
  { label: 'Landing page', keyword: 'landing' },
  { label: 'Pricing page', keyword: 'pricing' },
  { label: 'Blog', keyword: 'blog' },
  { label: 'Homepage', keyword: 'home' },
  { label: 'Product page', keyword: 'product' },
  { label: 'About page', keyword: 'about' },
  { label: 'Contact', keyword: 'contact' },
  { label: 'Documentation', keyword: 'doc' },
];

interface PrecisionFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (selected: string[]) => void;
  selectedPageTypes?: string[];
  onPageTypeChange?: (selected: string[]) => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
}

function getFilterBarColor(title: string): string {
  if (title === 'All') return '#000000';
  return getCategoryColor(title);
}

export default function PrecisionFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  selectedPageTypes = [],
  onPageTypeChange,
  showSearch = true,
  searchQuery: controlledSearch = '',
  onSearchChange,
  textColor = '#050505',
  bgColor = 'rgba(255, 255, 255, 0.95)',
  borderColor = 'rgba(0, 0, 0, 0.08)',
}: PrecisionFilterProps) {
  const activeTab = selectedCategories.length === 0 ? 'All' : selectedCategories[0];
  const [isFocused, setIsFocused] = React.useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState('');
  const panelRef = React.useRef<HTMLDivElement>(null);
  const searchQuery = onSearchChange ? controlledSearch : localSearch;

  const filterCategories = React.useMemo(
    () => ['All', ...categories.filter((c) => c && c !== 'Browse All')],
    [categories]
  );

  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const checkRes = () => setIsMobile(window.innerWidth <= 810);
    checkRes();
    window.addEventListener('resize', checkRes);
    return () => {
      window.removeEventListener('resize', checkRes);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  React.useEffect(() => {
    if (!filterPanelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setFilterPanelOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterPanelOpen]);

  const setActiveTab = (cat: string) => {
    if (cat === 'All') {
      onCategoryChange([]);
    } else {
      onCategoryChange([cat]);
    }
    setTimeout(() => {
      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleCategoryInPanel = (cat: string) => {
    if (cat === 'All') {
      onCategoryChange([]);
      return;
    }
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    onCategoryChange(next);
  };

  const togglePageTypeInPanel = (label: string) => {
    const next = selectedPageTypes.includes(label)
      ? selectedPageTypes.filter((p) => p !== label)
      : [...selectedPageTypes, label];
    onPageTypeChange?.(next);
  };

  const handleClearFilters = () => {
    onCategoryChange([]);
    onPageTypeChange?.([]);
    setFilterPanelOpen(false);
    setTimeout(() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPageTypes.length > 0;

  const stickyContainer: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    width: '100%',
    zIndex: 990,
    backgroundColor: bgColor,
    borderBottom: `1px solid ${borderColor}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const innerLayout: React.CSSProperties = {
    maxWidth: '1400px',
    height: '72px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    gap: '24px',
  };

  const scrollContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    height: '100%',
    maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
    paddingRight: '40px',
  };

  return (
    <nav style={stickyContainer} id="browse">
      <div style={innerLayout}>
        <div className="no-scrollbar" style={scrollContainer}>
          {filterCategories.map((cat, i) => {
            const isActive = activeTab === cat;
            const brandColor = getFilterBarColor(cat);

            return (
              <motion.button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                whileHover={{
                  backgroundColor: isActive ? undefined : 'rgba(0,0,0,0.04)',
                }}
                whileTap={{ scale: 0.96 }}
                style={{
                  position: 'relative',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? brandColor : textColor,
                  opacity: isActive ? 1 : 0.6,
                  transition: 'color 0.2s, opacity 0.2s',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBg"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: brandColor,
                      opacity: 0.12,
                      borderRadius: '8px',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {cat}
              </motion.button>
            );
          })}
        </div>

        {showSearch && !isMobile && (
          <div ref={panelRef} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, position: 'relative' }}>
            <div style={{ width: '1px', height: '24px', backgroundColor: borderColor }} />
            <motion.div
              animate={{
                width: isFocused ? 220 : 160,
                backgroundColor: isFocused ? 'rgba(0,0,0,0.05)' : 'transparent',
                borderColor: isFocused ? borderColor : 'transparent',
              }}
              style={{
                position: 'relative',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                border: '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.5 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  if (onSearchChange) onSearchChange(v);
                  else setLocalSearch(v);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  marginLeft: '10px',
                  width: '100%',
                  outline: 'none',
                  fontSize: '13px',
                  fontFamily: '"Inter", sans-serif',
                  color: textColor,
                }}
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setFilterPanelOpen((o) => !o)}
              aria-expanded={filterPanelOpen}
              aria-haspopup="true"
              aria-label={filterPanelOpen ? 'Close filter panel' : 'Open filter by categories and page types'}
              style={{
                height: '40px',
                padding: '0 14px',
                borderRadius: '8px',
                border: `1px solid ${filterPanelOpen ? borderColor : 'transparent'}`,
                background: filterPanelOpen ? 'rgba(0,0,0,0.05)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: '"Inter", sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: textColor,
                opacity: hasActiveFilters ? 1 : 0.8,
              }}
            >
              Filter by tags…
              {hasActiveFilters && (
                <span style={{ fontSize: '11px', background: textColor, color: bgColor, padding: '2px 6px', borderRadius: '4px' }}>
                  {selectedCategories.length + selectedPageTypes.length}
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: filterPanelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <AnimatePresence>
              {filterPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    minWidth: '320px',
                    maxWidth: '90vw',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    padding: '20px',
                    zIndex: 1000,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  <div style={{ marginBottom: '16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: textColor, opacity: 0.6 }}>
                    Categories
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {filterCategories.map((cat) => {
                      const isAll = cat === 'All';
                      const checked = isAll ? selectedCategories.length === 0 : selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: textColor,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: checked ? `${getFilterBarColor(cat)}18` : 'transparent',
                            border: `1px solid ${checked ? getFilterBarColor(cat) : borderColor}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategoryInPanel(cat)}
                            style={{ width: '16px', height: '16px', accentColor: getFilterBarColor(cat) }}
                            aria-label={`Filter by ${cat}`}
                          />
                          {cat}
                        </label>
                      );
                    })}
                  </div>
                  <div style={{ marginBottom: '16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: textColor, opacity: 0.6 }}>
                    Page type
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {PAGE_TYPE_OPTIONS.map(({ label }) => {
                      const checked = selectedPageTypes.includes(label);
                      return (
                        <label
                          key={label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: textColor,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: checked ? 'rgba(0,0,0,0.06)' : 'transparent',
                            border: `1px solid ${checked ? borderColor : 'transparent'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePageTypeInPanel(label)}
                            style={{ width: '16px', height: '16px' }}
                            aria-label={`Filter by ${label}`}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    aria-label="Clear all filters"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${borderColor}`,
                      background: hasActiveFilters ? 'rgba(0,0,0,0.06)' : 'transparent',
                      color: textColor,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: hasActiveFilters ? 'pointer' : 'default',
                      opacity: hasActiveFilters ? 1 : 0.5,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {showSearch && isMobile && (
          <div style={{ padding: '8px' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={textColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        )}
      </div>
    </nav>
  );
}
