'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME ---
const THEME = {
  bg: '#020202', // Pure Void
  text: '#FFFFFF',
  sub: 'rgba(255,255,255,0.6)',
  border: 'rgba(255,255,255,0.1)',
  accent: '#FFFFFF', // Monochrome Luxury
};

interface VelocityListicleProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
  initialSearchQuery?: string;
  initialCategory?: string;
}

export default function VelocityListicle({
  title = 'The Index',
  subtitle = 'A curated list of design engineering masterpieces.',
  websites,
  initialSearchQuery = '',
  initialCategory = 'Browse All',
}: VelocityListicleProps) {
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
      // Maintain original order but only include search results
      // Create a map of search result order for sorting
      const relevanceOrder = new Map(searchResults.map((r, idx) => [r.item.id, idx]));
      const searchResultIds = new Set(searchResults.map((r) => r.item.id));
      
      // Filter and sort by search relevance while preserving featured priority
      results = results
        .filter((site) => searchResultIds.has(site.id))
        .sort((a, b) => {
          // Featured websites first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then by search relevance
          const orderA = relevanceOrder.get(a.id) ?? Infinity;
          const orderB = relevanceOrder.get(b.id) ?? Infinity;
          return orderA - orderB;
        });
    }

    // Preserve original order from data.ts (featured first, then alphabetical) for default view
    // Only re-sort if we're filtering by category (but still preserve featured order)
    if (!isDefaultView && !searchQuery.trim()) {
      // When filtering by category, maintain featured first, then alphabetical
      results = results.sort((a, b) => {
        // Featured websites first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then alphabetical
        return a.name.localeCompare(b.name);
      });
    }
    // For default view, keep the original order from websites array (already sorted by sortWebsitesByQuality)

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

  // Shared State for "Focus Mode"
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <section
      id="browse"
      className="relative w-full flex flex-col items-center scroll-mt-20"
      style={{
        backgroundColor: THEME.bg,
        padding: '120px 20px',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@1,400;1,500;1,600&family=JetBrains+Mono:wght@500&display=swap');
        
        .velocity-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 32px;
        }
        
        @media (max-width: 1024px) {
          .velocity-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 640px) {
          .velocity-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Background Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.15,
          background: 'radial-gradient(circle at 50% 0%, #222 0%, transparent 60%)',
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 w-full max-w-[1200px] mb-20 flex justify-between items-end"
      >
        <div>
          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '64px',
              fontStyle: 'italic',
              color: THEME.text,
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '18px',
              color: THEME.sub,
              maxWidth: '500px',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: THEME.sub,
            border: `1px solid ${THEME.border}`,
            padding: '8px 16px',
            borderRadius: '100px',
          }}
        >
          ARCHIVE: 01 — {Math.min(visibleCount, filteredWebsites.length).toString().padStart(2, '0')} / {filteredWebsites.length.toString().padStart(2, '0')}
        </div>
      </div>

      {/* THE LISTICLE GRID */}
      <div
        className="velocity-grid relative z-10 w-full"
        style={{
          maxWidth: '1400px',
        }}
      >
        {filteredWebsites.slice(0, visibleCount).map((website, i) => (
          <CinematicCard
            key={website.id}
            website={website}
            index={i}
            isHovered={hoveredId === website.id}
            isDimmed={hoveredId !== null && hoveredId !== website.id}
            onHover={() => setHoveredId(website.id)}
            onLeave={() => setHoveredId(null)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showManualLoadButton && (
        <motion.button
          onClick={() => setVisibleCount((c) => c + 30)}
          className="mt-16 px-8 py-4 rounded-full border backdrop-blur-xl font-semibold text-sm transition-all"
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

// --- CINEMATIC CARD COMPONENT ---
interface CinematicCardProps {
  website: Website;
  index: number;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function CinematicCard({
  website,
  index,
  isHovered,
  isDimmed,
  onHover,
  onLeave,
}: CinematicCardProps) {
  const { name, description, screenshotUrl, displayCategory, category, slug } =
    website;
  const tag = displayCategory || category;
  const accentColor = getCategoryColor(tag);

  // --- LOCKED ANIMATION PHYSICS (Tilt Effect) ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  return (
    <Link href={`/sites/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        style={{
          perspective: 1000,
          zIndex: isHovered ? 20 : 1,
          height: '480px', // Taller, poster-like aspect ratio
        }}
        onMouseMove={handleMouseMove}
        onHoverStart={onHover}
        onHoverEnd={() => {
          onLeave();
          x.set(0);
          y.set(0);
        }}
        animate={{
          opacity: isDimmed ? 0.3 : 1, // Focus Mode Locked
          filter: isDimmed
            ? 'blur(4px) grayscale(100%)'
            : 'blur(0px) grayscale(0%)',
          scale: isDimmed ? 0.95 : 1,
        }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#0A0A0A',
            border: `1px solid ${THEME.border}`,
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            scale: isHovered ? 1.02 : 1,
            boxShadow: isHovered
              ? '0 40px 80px -20px rgba(0,0,0,0.6)'
              : '0 10px 30px -10px rgba(0,0,0,0.3)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* 1. FULL BLEED IMAGE */}
          {screenshotUrl ? (
            <motion.div
              className="absolute inset-0 overflow-hidden"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{
                  y: isHovered ? ['0%', '-20%', '0%'] : 0,
                }}
                transition={{
                  duration: isHovered ? 4 : 0.8,
                  repeat: isHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <Image
                  src={screenshotUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 33vw"
                  style={{ objectPosition: 'top' }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: '#111',
              }}
            />
          )}

          {/* 2. GRADIENT OVERLAY (Always visible for readability) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 60%)',
            }}
          />

          {/* 3. EDITORIAL INDEX NUMBER (Watermark) */}
          <div
            className="absolute top-5 left-6 pointer-events-none"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '64px',
              fontStyle: 'italic',
              color: '#FFF',
              opacity: 0.15,
              lineHeight: 1,
            }}
          >
            {(index + 1).toString().padStart(2, '0')}
          </div>

          {/* 4. CATEGORY BADGE (Top Right) */}
          <div
            className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: `1px solid ${THEME.border}`,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '11px',
                color: '#FFF',
                textTransform: 'uppercase',
              }}
            >
              {tag || 'Unknown'}
            </span>
          </div>

          {/* 5. FLOATING GLASS UI (Bottom) */}
          <div
            className="absolute bottom-5 left-5 right-5 flex flex-col gap-2 rounded-xl p-5 backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${THEME.border}`,
            }}
          >
            <h3
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: THEME.text,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {name}
            </h3>

            {/* Description & CTA (Reveal on Hover) */}
            <motion.div
              initial={false}
              animate={{
                height: isHovered ? 'auto' : 0,
                opacity: isHovered ? 1 : 0,
                marginTop: isHovered ? 8 : 0,
              }}
              style={{ overflow: 'hidden' }}
            >
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  margin: '0 0 16px 0',
                  lineHeight: 1.5,
                }}
              >
                {description || 'A world-class digital experience designed for high performance.'}
              </p>

              <div
                className="flex items-center gap-2"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '11px',
                  color: accentColor,
                }}
              >
                EXPLORE PROJECT <span>→</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
