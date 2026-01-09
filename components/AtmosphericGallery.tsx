'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  MotionValue,
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

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width);
    y.set((clientY - top) / height);
  }

  // 3D Plane Rotation (The "Flyover" Effect)
  const rotateX = useTransform(mouseY, [0, 1], [15, 5]); // Slight tilt range
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);
  const planeX = useTransform(mouseX, [0, 1], ['2%', '-2%']);
  const planeY = useTransform(mouseY, [0, 1], ['2%', '-2%']);

  // The Flashlight Gradient - need to get current values for template
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

  return (
    <div
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        height: '1000px',
        backgroundColor: theme.bg,
        perspective: '1200px',
      }}
      onMouseMove={handleMouseMove}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&family=Inter:wght@300;400;600&display=swap');
      `}</style>

      {/* Noise layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          opacity: 0.06,
          zIndex: 50,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 20%, #020202 100%)',
          zIndex: 20,
        }}
      />

      {/* Flashlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: spotlightGradient,
          zIndex: 25,
          mixBlendMode: 'overlay',
        }}
      />

      {/* --- THE 3D PLANE --- */}
      <motion.div
        className="absolute"
        style={{
          width: '120%',
          height: '120%',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          padding: '100px',
          transformStyle: 'preserve-3d',
          zIndex: 10,
          rotateX: rotateX,
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
      <div
        className="absolute z-40 flex flex-col items-center text-center pointer-events-none"
        style={{
          width: '100%',
          maxWidth: '800px',
          padding: '0 20px',
        }}
      >
        <motion.h1
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(60px, 8vw, 120px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#FFF',
            marginBottom: '20px',
            textShadow: '0 30px 60px rgba(0,0,0,0.8)',
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>

        <motion.div
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '60px',
            background: 'rgba(0,0,0,0.6)',
            padding: '8px 24px',
            borderRadius: '100px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {subtitle}
        </motion.div>

        {/* Glass Search Input */}
        <motion.form
          onSubmit={handleSearchSubmit}
          className="pointer-events-auto relative"
          style={{
            width: '100%',
            maxWidth: '500px',
          }}
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
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-5 bg-white text-black rounded-[10px] font-semibold text-sm flex items-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            Search
          </button>
        </motion.form>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: ATMOSPHERIC CARD ---
interface AtmosphericCardProps {
  src?: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  index: number;
}

function AtmosphericCard({ src, mouseX, mouseY, index }: AtmosphericCardProps) {
  const hasImage = Boolean(src);

  return (
    <motion.div
      className="w-full h-full relative rounded-xl overflow-hidden"
      style={{
        minHeight: '240px',
        backgroundColor: '#050505',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      whileHover={{
        scale: 1.05,
        z: 50,
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
            unoptimized
          />
        </motion.div>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(45deg, #0a0a0a, #111)',
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
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(125deg, rgba(255,255,255,0.1) 0%, transparent 40%)',
        }}
      />
    </motion.div>
  );
}
