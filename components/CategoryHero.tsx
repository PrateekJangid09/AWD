'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useTime,
  MotionValue,
} from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

/**
 * THE ZENITH HORIZON HERO
 * - "Living" Aurora Background
 * - Volumetric Glass Physics (Refraction simulation)
 * - Layered Depth (Text behind Glass)
 * - Heavy, Cinematic Inertia
 */

const theme = {
  bg: '#010101',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.5)',
  accent: '#3B82F6',
  glassBorder: 'rgba(255,255,255,0.15)',
};

interface CategoryHeroProps {
  category: string;
  websites: Website[];
  description?: string;
}

export default function CategoryHero({
  category,
  websites,
  description = 'The Collection',
}: CategoryHeroProps) {
  // Filter websites for this category
  const categoryWebsites = websites.filter(
    (site) => (site.displayCategory || site.category) === category
  );

  // Get top 3 websites for the glass monoliths (featured first, then by quality)
  const featuredWebsites = React.useMemo(() => {
    const sorted = [...categoryWebsites]
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      })
      .slice(0, 3);
    
    // Ensure we have 3 images (repeat if necessary)
    while (sorted.length < 3) {
      sorted.push(sorted[0] || categoryWebsites[0]);
    }
    return sorted;
  }, [categoryWebsites]);

  // Default subtitle - use description or category
  const subtitle = description || category;

  // --- PHYSICS ENGINE ---
  const time = useTime();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Very heavy mass for that "Cinematic Slow Motion" feel
  const mouseX = useSpring(x, { stiffness: 30, damping: 40, mass: 3 });
  const mouseY = useSpring(y, { stiffness: 30, damping: 40, mass: 3 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width);
    y.set((clientY - top) / height);
  }

  // 1. SCENE ROTATION (The Camera Move)
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);

  // 2. DYNAMIC LIGHTING (The Sun)
  // Light moves opposite to mouse to simulate 3D source
  const lightX = useTransform(mouseX, [0, 1], ['120%', '-20%']);
  const lightY = useTransform(mouseY, [0, 1], ['-20%', '120%']);
  const sheenGradient = useMotionTemplate`radial-gradient(800px circle at ${lightX} ${lightY}, rgba(255,255,255,0.2), transparent 60%)`;

  // 3. ORGANIC DRIFT (The Soul)
  const auroraRotate = useTransform(time, [0, 20000], [0, 360]);
  const floatingY = useTransform(time, (t) => Math.sin(t / 2000) * 10);

  // Parallax for background text
  const textParallax = useTransform(mouseX, [0, 1], [40, -40]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: '950px',
        backgroundColor: theme.bg,
        color: theme.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1500px',
      }}
      onMouseMove={handleMouseMove}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,600&family=Inter:wght@300;800&display=swap');
        
        @media (max-width: 900px) {
          .stage-container {
            transform: scale(0.6);
          }
          .zenith-title {
            font-size: 100px !important;
          }
        }
      `}</style>

      {/* 1. ATMOSPHERE */}
      <motion.div
        className="absolute"
        style={{
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          background:
            'conic-gradient(from 0deg at 50% 50%, #010101 0deg, #050505 120deg, #1a1a1a 240deg, #010101 360deg)',
          opacity: 0.6,
          filter: 'blur(100px)',
          zIndex: 0,
          transform: 'scale(1.5)',
          rotate: auroraRotate,
        }}
      />
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          opacity: 0.07,
          zIndex: 5,
          mixBlendMode: 'overlay',
        }}
      />

      {/* 2. BACKGROUND DEPTH TEXT */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] text-center w-full pointer-events-none"
      >
        <motion.div
          className="zenith-title"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(120px, 18vw, 300px)',
            fontWeight: 800,
            color: '#080808',
            textShadow:
              '0 40px 80px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.1)',
            lineHeight: 0.8,
            letterSpacing: '-0.06em',
            whiteSpace: 'nowrap',
            x: textParallax,
          }}
        >
          {category}
        </motion.div>
      </div>

      {/* 3. 3D STAGE */}
      <motion.div
        className="stage-container relative z-10 flex items-center justify-center"
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '600px',
          transformStyle: 'preserve-3d',
          rotateX: rotateX,
          rotateY: rotateY,
        }}
      >
        {/* Left Satellite */}
        <GlassMonolith
          image={featuredWebsites[1]?.screenshotUrl}
          width={280}
          height={360}
          x={-350}
          y={40}
          z={-50}
          rotation={-15}
          sheen={sheenGradient}
          delay={0.1}
        />

        {/* Right Satellite */}
        <GlassMonolith
          image={featuredWebsites[2]?.screenshotUrl}
          width={280}
          height={360}
          x={350}
          y={-40}
          z={-50}
          rotation={15}
          sheen={sheenGradient}
          delay={0.2}
        />

        {/* Center Hero */}
        <GlassMonolith
          image={featuredWebsites[0]?.screenshotUrl}
          width={440}
          height={580}
          x={0}
          y={0}
          z={50}
          rotation={0}
          sheen={sheenGradient}
          isHero={true}
          floatingY={floatingY}
        />
      </motion.div>

      {/* 4. FOREGROUND TEXT */}
      <motion.div
        className="absolute bottom-20 z-20 text-center pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: '24px',
            color: theme.text,
            textShadow: '0 4px 10px rgba(0,0,0,0.5)',
          }}
        >
          {subtitle}
        </div>
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENT: THE GLASS MONOLITH ---
interface GlassMonolithProps {
  image?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  sheen: MotionValue<string>;
  isHero?: boolean;
  floatingY?: MotionValue<number>;
  delay?: number;
}

function GlassMonolith({
  image,
  width,
  height,
  x,
  y,
  z,
  rotation,
  sheen,
  isHero,
  floatingY,
  delay = 0,
}: GlassMonolithProps) {
  return (
    <motion.div
      className="absolute rounded-3xl overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.glassBorder}`,
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
        x: x,
        y: isHero && floatingY ? floatingY : y,
        z: z,
        rotateY: rotation,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.2,
        delay: delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.05, z: z + 50, rotateY: 0 }}
    >
      {/* Image Layer (Slightly transparent to blend with glass) */}
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.8 }}
          sizes="(max-width: 900px) 280px, 440px"
          unoptimized
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: '#050505',
            color: '#333',
            fontWeight: 800,
            letterSpacing: '2px',
          }}
        >
          VISUAL
        </div>
      )}

      {/* Inner Light (Volumetric) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: -100,
          background: sheen,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Reflection Layer (Surface Gloss) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.05) 30%)',
          mixBlendMode: 'plus-lighter',
        }}
      />

      {/* Border Highlight (Sharp Edges) */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
    </motion.div>
  );
}
