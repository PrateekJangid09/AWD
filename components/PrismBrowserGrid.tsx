'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME ---
const THEME = {
  bg: '#050505',
  cardBg: '#0A0A0A',
  text: '#FFFFFF',
  sub: '#888888',
  border: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.04)',
  activeGlowOpacity: 0.4,
};

interface PrismBrowserGridProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
  initialSearchQuery?: string;
  initialCategory?: string;
}

export default function PrismBrowserGrid({
  title = 'Selected Projects',
  subtitle = 'A showcase of high-fidelity digital products.',
  websites,
  initialSearchQuery = '',
  initialCategory = 'Browse All',
}: PrismBrowserGridProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeCategory] = useState(initialCategory);
  const [visibleCount, setVisibleCount] = useState(30);
  const [autoLoadCount, setAutoLoadCount] = useState(0);

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

  // Filter and search websites
  const filteredWebsites = useMemo(() => {
    let results = websites;

    // Check if we're in default/homepage view (no filters applied)
    const isDefaultView = activeCategory === 'Browse All' && !searchQuery.trim();

    // Apply category filter
    if (activeCategory !== 'Browse All') {
      results = results.filter(
        (site) => (site.displayCategory || site.category) === activeCategory
      );
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
  }, [websites, activeCategory, searchQuery, fuse]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(30);
    setAutoLoadCount(0);
  }, [activeCategory, searchQuery]);

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

  return (
    <section
      id="browse"
      className="relative w-full flex flex-col items-center overflow-hidden scroll-mt-20"
      style={{
        backgroundColor: THEME.bg,
        padding: '120px 20px',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
      `}</style>

      {/* BACKGROUND: Technical Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.1,
          backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* BACKGROUND: Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, transparent 50%, #050505 100%)',
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 w-full max-w-[1200px] mb-20 flex flex-col gap-6"
      >
        <h2
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '48px',
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
            background: 'rgba(255,255,255,0.1)',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '60px 40px',
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
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderColor: THEME.border,
            color: THEME.text,
          }}
          whileHover={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.2)',
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
              ? `0 20px 60px -10px ${accentColor}30, 0 0 0 1px ${accentColor}`
              : '0 10px 30px -10px rgba(0,0,0,0.3)',
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
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            {/* Dots */}
            <div className="flex gap-1.5" style={{ opacity: 0.4 }}>
              <div
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: '#FFF',
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: '#FFF',
                }}
              />
            </div>

            {/* Category Pill */}
            <motion.div
              animate={{
                backgroundColor: isHovered
                  ? accentColor
                  : 'rgba(255,255,255,0.05)',
                color: isHovered ? '#000' : '#888',
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
              backgroundColor: '#020202',
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
                  <img
                    src={imageUrl}
                    alt={name}
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
                  color: '#333',
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
            animate={{ color: isHovered ? '#FFF' : '#AAA' }}
            style={{
              fontSize: '16px',
              fontWeight: 500,
              margin: 0,
            }}
          >
            {name}
          </motion.h3>

          <motion.div
            animate={{
              x: isHovered ? 4 : 0,
              color: isHovered ? accentColor : '#555',
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
