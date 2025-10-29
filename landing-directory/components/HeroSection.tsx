'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Website } from '@/lib/types';
import FeaturedShowcase from '@/components/FeaturedShowcase';

interface HeroSectionProps {
  totalWebsites: number;
  totalCategories: number;
  featuredWebsites: Website[];
  onSearch?: (query: string) => void;
}

export default function HeroSection({ 
  totalWebsites, 
  totalCategories, 
  featuredWebsites,
  onSearch,
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) onSearch(searchQuery);
    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  // Palette
  const ELECTRIC_INDIGO = '#4735DD';
  const CORAL = '#FF3E6C';
  const SUNSET_PEACH = '#61BFC2';
  const LIGHT_INDIGO = '#FFA200';
  const NAVY = '#0B0B14';

  return (
    <section className="relative overflow-hidden bg-background hero-section">
      <div
        className="pointer-events-none absolute inset-0"
          style={{
          background:
            `radial-gradient(1000px 600px at 15% 10%, ${ELECTRIC_INDIGO}22, transparent 60%),` +
            `radial-gradient(900px 520px at 80% 30%, ${CORAL}12, transparent 60%),` +
            `radial-gradient(800px 520px at 55% 85%, ${SUNSET_PEACH}14, transparent 60%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent hero-scrim" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] hero-inset" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20">
        <motion.div variants={container} initial="hidden" animate="visible" className="text-center">
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-foreground/10 border border-white/20 text-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold">{totalWebsites}+ curated websites • {totalCategories} categories</span>
          </motion.div>

          <motion.h1 variants={item} className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-foreground leading-tight">
            Elevate Your Next Design
          </motion.h1>

                 <motion.p variants={item} className="mt-3 sm:mt-5 text-base sm:text-lg lg:text-xl text-foreground/70 max-w-2xl sm:max-w-3xl mx-auto px-4 sm:px-0 font-lato">
            Explore award‑worthy landing pages and interfaces. Search, filter, and jump straight to pixel‑perfect inspiration.
          </motion.p>

          {/* Search bar removed per request */}

          {/* removed feature chips per request */}
          </motion.div>

        <motion.div variants={container} initial="hidden" animate="visible" className="mt-12 sm:mt-16">
          <motion.div variants={item} className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div
              className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #0077FF, #51C7FF)',
                border: '1px solid rgba(0,119,255,0.5)'
              }}
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <h2 className="text-left text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-unbounded">
              Featured now
            </h2>
            <span className="hidden sm:inline text-sm font-medium text-foreground/70 font-lato">Hand‑picked highlights</span>
          </motion.div>
          <div className="mb-8 h-0.5 w-full bg-gradient-to-r from-black/10 via-black/5 to-transparent theme-light:from-black/10" />
          <FeaturedShowcase websites={featuredWebsites.slice(0, 9)} />
                        </motion.div>
                      </div>
      {/* Soft fade to body background to avoid hard edge (match --background) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0), var(--background))' }}
      />
    </section>
  );
}
