'use client';

import * as React from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import Image from 'next/image';

interface SingleSiteHeroProps {
  siteName: string;
  siteDescription: string;
  category: string;
  accentColor: string;
  spotlightSize?: number;
  image: string;
}

export default function SingleSiteHero({
  siteName,
  siteDescription,
  category,
  accentColor,
  spotlightSize = 300,
  image,
}: SingleSiteHeroProps) {
  // --- MOUSE LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      style={{
        width: '100%',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050505',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* --- LAYER 1: THE GHOST IMAGE (Background Context) --- */}
      {/* This is always visible but dark/grayscale so text is readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.3,
          filter: 'grayscale(100%) contrast(120%) blur(2px)',
        }}
      >
        {image ? (
          <Image
            src={image}
            alt={`${siteName} background`}
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#222',
            }}
          />
        )}
      </div>

      {/* --- LAYER 2: THE REVEAL IMAGE (Flashlight) --- */}
      {/* Full color, sharp, revealed only by mouse */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          maskImage: maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        {image && (
          <Image
            src={image}
            alt={`${siteName} spotlight`}
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
        )}
      </motion.div>

      {/* --- LAYER 3: CONTENT --- */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: '900px',
          padding: '0 20px',
          pointerEvents: 'none',
        }}
      >
        {/* Category Tag */}
        <div
          style={{
            marginBottom: '32px',
            padding: '8px 20px',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            color: accentColor,
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            pointerEvents: 'auto',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}`,
            }}
          />
          {category}
        </div>

        {/* Site Title */}
        <h1
          style={{
            fontSize: 'clamp(60px, 8vw, 120px)',
            fontWeight: 900,
            margin: '0 0 24px 0',
            color: '#FFF',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            textShadow: '0 20px 60px rgba(0,0,0,0.8)',
          }}
        >
          {siteName}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '20px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
            maxWidth: '600px',
            textShadow: '0 4px 10px rgba(0,0,0,1)',
            fontWeight: 500,
          }}
        >
          {siteDescription}
        </p>
      </div>
    </div>
  );
}
