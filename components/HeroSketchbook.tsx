'use client';

import * as React from 'react';
import type { CSSProperties, MouseEvent, FormEvent } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import Image from 'next/image';
import { Website } from '@/lib/types';

interface HeroSketchbookProps {
  totalWebsites: number;
  totalCategories: number;
  featuredWebsites: Website[];
  onSearch?: (query: string) => void;
}

// --- STYLES ---
const containerStyle: CSSProperties = {
  width: '100%',
  minHeight: '800px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#050505',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'default',
};

const contentLayerStyle: CSSProperties = {
  position: 'relative',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  maxWidth: 800,
  padding: '0 20px',
  pointerEvents: 'none',
};

const pointerAuto: CSSProperties = {
  pointerEvents: 'auto',
};

export default function HeroSketchbook({
  totalWebsites,
  totalCategories,
  featuredWebsites,
  onSearch,
}: HeroSketchbookProps) {
  const title = 'Discover the Extraordinary.';
  const subtitle =
    'Explore a curated gallery of the world’s most innovative web design.';
  const placeholder = 'Search by style, color, or industry...';
  const accentColor = '#CCFF00';
  const spotlightSize = 400;

  // Collect up to 12 screenshots from featured websites
  const images = featuredWebsites
    .slice(0, 12)
    .map((w) => w.screenshotUrl)
    .concat(Array(12).fill(''))
    .slice(0, 12);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setTimeout(() => {
        document
          .getElementById('browse')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // --- MOUSE LOGIC FOR SPOTLIGHT ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div style={containerStyle} onMouseMove={handleMouseMove}>
      {/* LAYER 1: Dimmed grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          filter: 'grayscale(100%) contrast(120%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2px',
          zIndex: 0,
        }}
      >
        {images.map((img, i) => (
          <GridItem key={i} src={img} index={i} />
        ))}
      </div>

      {/* LAYER 2: Color grid revealed by spotlight */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2px',
          zIndex: 10,
          maskImage,
          WebkitMaskImage: maskImage as any,
        }}
      >
        {images.map((img, i) => (
          <GridItem key={i} src={img} index={i} isColor />
        ))}
      </motion.div>

      {/* LAYER 3: Content */}
      <div style={contentLayerStyle}>
        {/* Badge */}
        <div
          style={{
            marginBottom: 24,
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 100,
            color: 'rgba(255,255,255,0.8)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.05em',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: accentColor,
            }}
          />
          {totalWebsites.toLocaleString()}+ Curated Sites •{' '}
          {totalCategories} Categories
        </div>

        <h1
          style={{
            fontSize: 'clamp(48px, 6vw, 88px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: '0 0 24px 0',
            color: '#FFF',
            lineHeight: 1.05,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 48px 0',
            lineHeight: 1.6,
            maxWidth: 580,
          }}
        >
          {subtitle}
        </p>

        {/* SEARCH INPUT */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            ...pointerAuto,
            position: 'relative',
            width: '100%',
            maxWidth: 560,
          }}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 72,
              padding: '0 32px',
              fontSize: 18,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              outline: 'none',
              color: '#FFF',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = accentColor;
              e.target.style.backgroundColor = 'rgba(0,0,0,0.8)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          />

          {/* Search Button */}
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
              bottom: 10,
              padding: '0 24px',
              borderRadius: 8,
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: GRID ITEM ---
interface GridItemProps {
  src: string;
  index: number;
  isColor?: boolean;
}

function GridItem({ src, index, isColor }: GridItemProps) {
  const placeholderPattern =
    'repeating-linear-gradient(45deg, #222, #222 10px, #2a2a2a 10px, #2a2a2a 20px)';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={`Site ${index + 1}`}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          className="object-cover transition-transform duration-400"
          style={{
            transform: isColor ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: isColor ? '#333' : placeholderPattern,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #333',
          }}
        >
          {isColor && (
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.1)',
              }}
            >
              SITE {index + 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
