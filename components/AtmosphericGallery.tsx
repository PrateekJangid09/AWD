'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import { Website } from '@/lib/types';

// --- THEME ---
const theme = {
  bg: '#020202',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.4)',
  accent: '#3B82F6',
};

interface AtmosphericGalleryProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  featuredWebsites: Website[];
  onSearch?: (query: string) => void;
}

export default function AtmosphericGallery({
  title = 'DESIGN INTELLIGENCE',
  subtitle = 'Curating the finest digital experiences.',
  placeholder = 'Search the archive...',
  featuredWebsites,
  onSearch,
}: AtmosphericGalleryProps) {
  // Get up to 12 images from featured websites
  const images = React.useMemo(() => {
    return featuredWebsites
      .slice(0, 12)
      .map((w) => w.screenshotUrl)
      .concat(Array(12).fill(''))
      .slice(0, 12);
  }, [featuredWebsites]);

  // --- PHYSICS ENGINE ---
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Heavy, cinematic spring physics
  const springConfig = { damping: 40, stiffness: 150, mass: 1.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width);
    y.set((clientY - top) / height);
  }

  // 3D Plane Rotation (The "Flyover" Effect)
  const rotateX = useTransform(mouseY, [0, 1], [15, 5]); // Slight tilt range
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);
  const planeX = useTransform(mouseX, [0, 1], ['2%', '-2%']);
  const planeY = useTransform(mouseY, [0, 1], ['2%', '-2%']);

  // The Flashlight Gradient - need to use get() to access current values
  const spotlightX = useTransform(mouseX, [0, 1], [0, 100]);
  const spotlightY = useTransform(mouseY, [0, 1], [0, 100]);
  const spotlightGradient = useMotionTemplate`radial-gradient(500px circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.15), transparent 80%)`;

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
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

  const styles = {
    container: {
      width: '100%',
      height: '1000px',
      backgroundColor: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      overflow: 'hidden',
      perspective: '1200px', // Essential for depth
    },
    // 1. ATMOSPHERE LAYERS
    noise: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
      opacity: 0.06,
      pointerEvents: 'none' as const,
      zIndex: 50,
      mixBlendMode: 'overlay' as const,
    },
    vignette: {
      position: 'absolute' as const,
      inset: 0,
      background: 'radial-gradient(circle at center, transparent 20%, #020202 100%)',
      zIndex: 20,
      pointerEvents: 'none' as const,
    },
    flashlight: {
      position: 'absolute' as const,
      inset: 0,
      background: spotlightGradient,
      zIndex: 25,
      pointerEvents: 'none' as const,
      mixBlendMode: 'overlay' as const,
    },

    // 2. THE 3D GRID PLANE
    planeContainer: {
      width: '120%', // Oversize to prevent edge clipping
      height: '120%',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      padding: '100px',
      transformStyle: 'preserve-3d' as const,
      zIndex: 10,
    },

    // 3. CONTENT LAYER (Floating above)
    contentLayer: {
      position: 'absolute' as const,
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      pointerEvents: 'none' as const, // Let clicks pass through to grid (except input)
      width: '100%',
      maxWidth: '800px',
      padding: '0 20px',
    },
    h1: {
      fontFamily: 'var(--font-sora), sans-serif',
      fontSize: 'clamp(60px, 8vw, 120px)',
      fontWeight: 700,
      letterSpacing: '-0.04em',
      color: '#FFF',
      marginBottom: '20px',
      textShadow: '0 30px 60px rgba(0,0,0,0.8)', // Lift off background
    },
    subtitle: {
      fontFamily: 'var(--font-sora), sans-serif',
      fontStyle: 'italic' as const,
      fontSize: 'clamp(24px, 3vw, 32px)',
      color: 'rgba(255,255,255,0.8)',
      marginBottom: '60px',
      background: 'rgba(0,0,0,0.6)',
      padding: '8px 24px',
      borderRadius: '100px',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    inputWrapper: {
      pointerEvents: 'auto' as const,
      width: '100%',
      maxWidth: '500px',
      position: 'relative' as const,
    },
    // 4. SCROLL INDICATOR
    scrollIndicator: {
      position: 'absolute' as const,
      bottom: '40px',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '8px',
      color: theme.dim,
      fontFamily: 'var(--font-sora), sans-serif',
      fontSize: '12px',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
      pointerEvents: 'none' as const,
    },
  };

  return (
    <div style={styles.container} onMouseMove={handleMouseMove}>
      <div style={styles.noise} />
      <div style={styles.vignette} />
      <motion.div style={styles.flashlight} />

      {/* --- THE 3D PLANE --- */}
      <motion.div
        style={{
          ...styles.planeContainer,
          rotateX: rotateX, // Tilted floor effect
          rotateY: rotateY,
          x: planeX,
          y: planeY,
        }}
      >
        {images.map((img, i) => (
          <AtmosphericCard
            key={i}
            src={img}
            mouseX={mouseX}
            mouseY={mouseY}
            index={i}
          />
        ))}
      </motion.div>

      {/* --- FLOATING UI LAYER --- */}
      <div style={styles.contentLayer}>
        <motion.h1
          style={styles.h1}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>

        <motion.div
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {subtitle}
        </motion.div>

        {/* Glass Search Input - Hidden */}
        {/* <motion.form
          onSubmit={handleSearchSubmit}
          style={styles.inputWrapper}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '72px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '0 140px 0 32px',
              fontSize: '18px',
              color: '#FFF',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(0,0,0,0.8)';
              e.target.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.03)';
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          />
          <motion.button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-5 rounded-[10px] font-semibold text-sm flex items-center cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 4px 12px rgba(0,0,0,0.3)',
            }}
            whileHover={{
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.8), 0 6px 20px rgba(0,0,0,0.4)',
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
          >
            Search
          </motion.button>
        </motion.form> */}
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <motion.div
        style={styles.scrollIndicator}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ fontSize: '18px', lineHeight: 1 }}
        >
          ↓
        </motion.span>
        Scroll to explore
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENT: ATMOSPHERIC CARD ---
interface AtmosphericCardProps {
  src?: string;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  index: number;
}

function AtmosphericCard({ src, mouseX, mouseY, index }: AtmosphericCardProps) {
  // Generate placeholder if no image
  const hasImage = Boolean(src);

  return (
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '240px',
        borderRadius: '12px',
        position: 'relative',
        backgroundColor: '#050505',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      whileHover={{
        scale: 1.05,
        z: 50, // Lifts the card up towards camera
        borderColor: 'rgba(255,255,255,0.4)',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,1)',
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {hasImage ? (
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: 0.5,
            filter: 'grayscale(100%) blur(1px)',
          }}
          whileHover={{
            opacity: 1,
            filter: 'grayscale(0%) blur(0px)',
          }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={src!}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 900px) 50vw, 25vw"
            priority={index < 6}
          />
        </motion.div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, #0a0a0a, #111)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            fontWeight: 700,
            letterSpacing: '2px',
            fontSize: '12px',
          }}
        >
          ARCHIVE {index + 1}
        </div>
      )}

      {/* Dynamic Reflection Layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(125deg, rgba(255,255,255,0.1) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
