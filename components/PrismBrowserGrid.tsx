'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';
import { PAGE_TYPE_OPTIONS } from '@/components/PrecisionFilter';

// --- THEME (Light Mode) ---
const THEME = {
  bg: '#FAFAFA',
  cardBg: '#FFFFFF',
  text: '#1A1A1A',
  sub: '#666666',
  border: 'rgba(0,0,0,0.08)',
  glassBorder: 'rgba(0,0,0,0.04)',
  activeGlowOpacity: 0.4,
};

interface PrismBrowserGridProps {
  title?: string;
  subtitle?: string;
  /** If empty, component fetches from /api/websites on mount */
  websites?: Website[];
  initialSearchQuery?: string;
  initialCategory?: string;
  selectedCategories?: string[];
  /** Page-type labels from PrecisionFilter (e.g. "Landing page", "Blog"); grid filters by keyword in name/description */
  selectedPageTypes?: string[];
}

export default function PrismBrowserGrid({
  title = 'Selected Projects',
  subtitle = 'A showcase of high-fidelity digital products.',
  websites: initialWebsites = [],
  initialSearchQuery = '',
  initialCategory = 'Browse All',
  selectedCategories = [],
  selectedPageTypes = [],
}: PrismBrowserGridProps) {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [websitesLoading, setWebsitesLoading] = useState(initialWebsites.length === 0);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeCategory] = useState(initialCategory);
  const [visibleCount, setVisibleCount] = useState(30);
  const [autoLoadCount, setAutoLoadCount] = useState(0);

  // When no websites passed, fetch from API on mount
  useEffect(() => {
    if (initialWebsites.length > 0) return;
    let cancelled = false;
    fetch('/api/websites')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.websites) setWebsites(data.websites);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWebsitesLoading(false);
      });
    return () => { cancelled = true; };
  }, [initialWebsites.length]);

  // Use selectedCategories if provided, otherwise fall back to activeCategory
  const effectiveSelectedCategories = selectedCategories.length > 0 ? selectedCategories : (activeCategory !== 'Browse All' ? [activeCategory] : []);

  // Update search query when hero search changes
  useEffect(() => {
    if (initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
      setVisibleCount(30);
      setAutoLoadCount(0);
    }
  }, [initialSearchQuery]);

  // Setup Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(websites, {
      keys: ['name', 'description', 'displayCategory', 'category'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [websites]);

  // Keywords for selected page types (e.g. "Landing page" -> "landing")
  const pageTypeKeywords = useMemo(() => {
    if (selectedPageTypes.length === 0) return [];
    const set = new Set<string>();
    for (const label of selectedPageTypes) {
      const opt = PAGE_TYPE_OPTIONS.find((o) => o.label === label);
      if (opt) set.add(opt.keyword.toLowerCase());
    }
    return Array.from(set);
  }, [selectedPageTypes]);

  // Filter and search websites
  const filteredWebsites = useMemo(() => {
    let results = websites;

    // Check if we're in default/homepage view (no filters applied)
    const isDefaultView =
      effectiveSelectedCategories.length === 0 &&
      !searchQuery.trim() &&
      pageTypeKeywords.length === 0;

    // Apply category filter (supports multiple categories)
    if (effectiveSelectedCategories.length > 0) {
      results = results.filter((site) => {
        const siteCategory = site.displayCategory || site.category;
        return effectiveSelectedCategories.includes(siteCategory);
      });
    }

    // Apply page-type filter (name or description contains any selected keyword)
    if (pageTypeKeywords.length > 0) {
      results = results.filter((site) => {
        const text = `${site.name ?? ''} ${site.description ?? ''}`.toLowerCase();
        return pageTypeKeywords.some((kw) => text.includes(kw));
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const relevanceOrder = new Map(searchResults.map((r, idx) => [r.item.id, idx]));
      const searchResultIds = new Set(searchResults.map((r) => r.item.id));

      results = results
        .filter((site) => searchResultIds.has(site.id))
        .sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          const orderA = relevanceOrder.get(a.id) ?? Infinity;
          const orderB = relevanceOrder.get(b.id) ?? Infinity;
          return orderA - orderB;
        });
    }

    // Preserve original order for default view
    if (!isDefaultView && !searchQuery.trim()) {
      results = results.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return results;
  }, [websites, effectiveSelectedCategories, pageTypeKeywords, searchQuery, fuse]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(30);
    setAutoLoadCount(0);
  }, [effectiveSelectedCategories, selectedPageTypes, searchQuery]);

  // Auto-load more when scrolling (up to 2 times)
  const hasMore = visibleCount < filteredWebsites.length;
  const autoLoadLock = useRef(false);
  useEffect(() => {
    if (!hasMore || autoLoadCount >= 2) return;

    const handleScroll = () => {
      if (!hasMore || autoLoadCount >= 2 || autoLoadLock.current) return;
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
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

  const showManualLoadButton = hasMore && autoLoadCount >= 2;

  if (websitesLoading) {
    return (
      <section
        id="browse"
        className="relative w-full flex flex-col items-center overflow-hidden scroll-mt-20"
        style={{
          backgroundColor: THEME.bg,
          padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px)',
        }}
      >
        <div className="relative z-10 w-full max-w-[1200px] mb-20 flex flex-col gap-6">
          <div className="h-12 w-64 rounded bg-neutral-200 animate-pulse" />
          <div className="w-full h-px bg-neutral-200" />
        </div>
        <div
          className="prism-grid relative z-10 w-full max-w-[1200px] grid gap-15"
          style={{
            gap: 'clamp(30px, 5vw, 60px) clamp(20px, 3vw, 40px)',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden bg-neutral-200 animate-pulse"
              style={{ aspectRatio: '3/4' }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="browse"
      className="relative w-full flex flex-col items-center overflow-hidden scroll-mt-20"
      style={{
        backgroundColor: THEME.bg,
        padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px)',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
        
        .prism-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        
        @media (max-width: 1024px) {
          .prism-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 640px) {
          .prism-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* BACKGROUND: Technical Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage: 'radial-gradient(#999 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* BACKGROUND: Light Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, transparent 50%, rgba(0,0,0,0.02) 100%)',
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 w-full max-w-[1200px] mb-20 flex flex-col gap-6"
      >
        <h2
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 600,
            color: THEME.text,
            margin: 0,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
        <div
          style={{
            width: '100%',
            height: '1px',
            background: 'rgba(0,0,0,0.1)',
          }}
        />
        <div
          className="flex justify-between w-full"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: THEME.sub,
          }}
        >
          <span>{subtitle}</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </div>

      {/* GRID */}
      <div
        className="prism-grid relative z-10 w-full max-w-[1200px] grid gap-15"
        style={{
          gap: 'clamp(30px, 5vw, 60px) clamp(20px, 3vw, 40px)',
        }}
      >
        {filteredWebsites.slice(0, visibleCount).map((website) => (
          <PrismCard key={website.id} website={website} />
        ))}
      </div>

      {/* Load More Button */}
      {showManualLoadButton && (
        <motion.button
          onClick={() => setVisibleCount((c) => c + 30)}
          className="mt-16 px-8 py-4 rounded-lg border backdrop-blur-xl font-semibold text-sm transition-all"
          style={{
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderColor: THEME.border,
            color: THEME.text,
          }}
          whileHover={{
            backgroundColor: 'rgba(0,0,0,0.06)',
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          Load More
        </motion.button>
      )}
    </section>
  );
}

// --- PRISM CARD ---
interface PrismCardProps {
  website: Website;
}

function PrismCard({ website }: PrismCardProps) {
  const { name, description, screenshotUrl, fullScreenshotUrl, displayCategory, category, slug } =
    website;
  const tag = displayCategory || category;
  const accentColor = getCategoryColor(tag);
  const [isHovered, setIsHovered] = useState(false);
  // Use full screenshot if available, fallback to regular screenshot
  const imageUrl = fullScreenshotUrl || screenshotUrl;

  return (
    <Link href={`/sites/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        className="w-full cursor-pointer relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* THE CARD CONTAINER */}
        <motion.div
          animate={{
            y: isHovered ? -10 : 0,
            borderColor: isHovered ? accentColor : THEME.border,
            boxShadow: isHovered
              ? `0 20px 60px -10px ${accentColor}40, 0 0 0 1px ${accentColor}`
              : '0 10px 30px -10px rgba(0,0,0,0.08)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full flex flex-col overflow-hidden rounded-xl"
          style={{
            aspectRatio: '3/4',
            backgroundColor: THEME.cardBg,
            border: '1px solid',
            borderColor: THEME.border,
          }}
        >
          {/* A. Browser Chrome (Glass) */}
          <div
            className="w-full flex items-center justify-between px-4 border-b backdrop-blur-md z-10"
            style={{
              height: '44px',
              borderBottom: `1px solid ${THEME.glassBorder}`,
              backgroundColor: 'rgba(0,0,0,0.02)',
            }}
          >
            {/* Dots */}
            <div className="flex gap-1.5" style={{ opacity: 0.3 }}>
              <div
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: '#666',
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: '#666',
                }}
              />
            </div>

            {/* Category Pill */}
            <motion.div
              animate={{
                backgroundColor: isHovered
                  ? accentColor
                  : 'rgba(0,0,0,0.04)',
                color: isHovered ? '#FFF' : '#666',
              }}
              className="px-2 py-1 rounded flex items-center gap-1.5"
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
              >
                {tag || 'Unknown'}
              </span>
            </motion.div>
          </div>

          {/* B. Viewport */}
          <div
            className="flex-1 w-full relative overflow-hidden"
            style={{
              backgroundColor: '#F5F5F5',
            }}
          >
            {imageUrl ? (
              <div className="relative w-full h-full overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    width: '100%',
                    height: 'auto',
                    minHeight: '150%',
                  }}
                  animate={{
                    y: isHovered ? ['0%', '-25%', '0%'] : '0%',
                  }}
                  transition={{
                    duration: 8,
                    ease: 'easeInOut',
                    repeat: isHovered ? Infinity : 0,
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={600}
                    height={900}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-auto block"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      minHeight: '100%',
                      display: 'block',
                    }}
                  />
                </motion.div>
              </div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  color: '#999',
                  fontSize: '10px',
                }}
              >
                NO_PREVIEW
              </div>
            )}
          </div>
        </motion.div>

        {/* THE FOOTER INFO */}
        <div
          className="mt-5 flex justify-between items-center"
          style={{
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <motion.h3
            animate={{ color: isHovered ? THEME.text : '#666' }}
            style={{
              fontSize: '16px',
              fontWeight: 500,
              margin: 0,
              color: THEME.text,
            }}
          >
            {name}
          </motion.h3>

          <motion.div
            animate={{
              x: isHovered ? 4 : 0,
              color: isHovered ? accentColor : '#999',
            }}
            style={{ fontSize: '14px' }}
          >
            View Project ↗
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
