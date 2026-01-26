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
} from 'framer-motion';
import { Website } from '@/lib/types';

/**
 * THE ZENITH HORIZON HERO (Final Polish)
 * - Category Word: Static, Huge, Background Watermark
 * - Cards: 3D Physics
 * - Title: Parallax
 */

const theme = {
  bg: '#010101',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.5)',
  accent: '#3B82F6',
  glassBorder: 'rgba(255,255,255,0.15)',
};

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,600&family=Inter:wght@300;800;900&display=swap');
`;

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
  // Get featured images for the cards
  const featuredWebsites = websites
    .filter((w) => (w.displayCategory || w.category) === category)
    .slice(0, 3);

  const imageHero = featuredWebsites[0]?.screenshotUrl || '';
  const imageLeft = featuredWebsites[1]?.screenshotUrl || '';
  const imageRight = featuredWebsites[2]?.screenshotUrl || '';

  const titleLarge = category.toUpperCase();

  // --- PHYSICS ENGINE ---
  const time = useTime();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const mouseX = useSpring(x, { stiffness: 30, damping: 40, mass: 3 });
  const mouseY = useSpring(y, { stiffness: 30, damping: 40, mass: 3 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width);
    y.set((clientY - top) / height);
  }

  // 1. SCENE ROTATION
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);

  // 2. DYNAMIC LIGHTING
  const lightX = useTransform(mouseX, [0, 1], ['120%', '-20%']);
  const lightY = useTransform(mouseY, [0, 1], ['-20%', '120%']);
  const sheenGradient = useMotionTemplate`radial-gradient(800px circle at ${lightX} ${lightY}, rgba(255,255,255,0.2), transparent 60%)`;

  // 3. ORGANIC DRIFT
  const auroraRotate = useTransform(time, [0, 20000], [0, 360]);
  const floatingY = useTransform(time, (t: number) => Math.sin(t / 2000) * 10);

  // 4. PARALLAX FOR TITLE
  const textParallaxX = useTransform(mouseX, [0, 1], [40, -40]);

  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: theme.bg,
      color: theme.text,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      perspective: '1500px',
      padding: '60px 20px',
    },
    aurora: {
      position: 'absolute' as const,
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
    },
    noise: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
      opacity: 0.07,
      zIndex: 5,
      mixBlendMode: 'overlay' as const,
      pointerEvents: 'none' as const,
    },
    // Moving Title Container
    bgTextContainer: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2,
      textAlign: 'center' as const,
      width: '100%',
      pointerEvents: 'none' as const,
    },
    bigText: {
      fontFamily: '"Inter", sans-serif',
      fontSize: 'clamp(100px, 15vw, 280px)',
      fontWeight: 800,
      color: '#080808', // Very dark foreground text
      textShadow: '0 40px 80px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.1)',
      lineHeight: 0.8,
      letterSpacing: '-0.06em',
      whiteSpace: 'nowrap' as const,
    },
    // --- STATIC CATEGORY WATERMARK ---
    categoryWatermark: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', // Perfectly centered
      fontFamily: '"Inter", sans-serif',
      fontSize: 'clamp(150px, 25vw, 500px)', // Massive size
      fontWeight: 900,
      color: 'rgba(255, 255, 255, 0.03)', // Ultra subtle opacity
      zIndex: 1, // Behind the 3D stage
      pointerEvents: 'none' as const,
      whiteSpace: 'nowrap' as const,
      letterSpacing: '-0.08em',
      textAlign: 'center' as const,
      width: '100%',
    },
    stage: {
      width: '100%',
      maxWidth: '1200px',
      height: 'clamp(400px, 60vh, 600px)',
      position: 'relative' as const,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transformStyle: 'preserve-3d' as const,
    },
    mobileCss: `
      @media (max-width: 1024px) {
        .stage-container { transform: scale(0.7); }
        .zenith-title { font-size: clamp(60px, 12vw, 120px) !important; }
        .category-watermark { font-size: clamp(80px, 18vw, 200px) !important; }
      }
      @media (max-width: 768px) {
        .stage-container { transform: scale(0.5); }
        .zenith-title { font-size: clamp(48px, 10vw, 80px) !important; }
        .category-watermark { font-size: clamp(60px, 15vw, 120px) !important; }
      }
      @media (max-width: 480px) {
        .stage-container { transform: scale(0.35); }
        .zenith-title { font-size: clamp(36px, 9vw, 60px) !important; }
        .category-watermark { font-size: clamp(48px, 12vw, 80px) !important; }
        .subtitle-text { font-size: 18px !important; bottom: 40px !important; }
      }
    `,
  };

  return (
    <div style={styles.container} onMouseMove={handleMouseMove}>
      <style jsx global>{`${fontStyles}${styles.mobileCss}`}</style>

      {/* 1. ATMOSPHERE */}
      <motion.div style={{ ...styles.aurora, rotate: auroraRotate }} />
      <div style={styles.noise} />

      {/* 2. STATIC CATEGORY WATERMARK */}
      <div style={styles.categoryWatermark} className="category-watermark">
        {category}
      </div>

      {/* 3. MOVING BIG TITLE (Parallax) */}
      <div style={styles.bgTextContainer}>
        <motion.div
          className="zenith-title"
          style={{
            ...styles.bigText,
            x: textParallaxX,
          }}
        >
          {titleLarge}
        </motion.div>
      </div>

      {/* 4. 3D STAGE */}
      <motion.div
        className="stage-container"
        style={{
          ...styles.stage,
          rotateX: rotateX,
          rotateY: rotateY,
        }}
      >
        <GlassMonolith
          image={imageLeft}
          width={280}
          height={360}
          x={-350}
          y={40}
          z={-50}
          rotation={-15}
          sheen={sheenGradient}
          delay={0.1}
        />
        <GlassMonolith
          image={imageRight}
          width={280}
          height={360}
          x={350}
          y={-40}
          z={-50}
          rotation={15}
          sheen={sheenGradient}
          delay={0.2}
        />
        <GlassMonolith
          image={imageHero}
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

      {/* 5. FOREGROUND SUBTITLE */}
      <motion.div
        className="subtitle-text"
        style={{
          position: 'absolute',
          bottom: 'clamp(40px, 8vh, 80px)',
          zIndex: 20,
          textAlign: 'center',
          pointerEvents: 'none',
          padding: '0 20px',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 3vw, 24px)',
            color: theme.text,
            textShadow: '0 4px 10px rgba(0,0,0,0.5)',
          }}
        >
          {description}
        </div>
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENT: THE GLASS MONOLITH ---
interface GlassMonolithProps {
  image: string;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  sheen: ReturnType<typeof useMotionTemplate>;
  isHero?: boolean;
  floatingY?: ReturnType<typeof useTransform<number, number>>;
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
  isHero = false,
  floatingY,
  delay = 0,
}: GlassMonolithProps) {
  return (
    <motion.div
      style={{
        width: width,
        height: height,
        position: 'absolute',
        borderRadius: '24px',
        backgroundColor: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.glassBorder}`,
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        x: x,
        y: isHero ? floatingY : y,
        z: z,
        rotateY: rotation,
      }}
      initial={{ opacity: 0, scale: 0.8, y: y + 100 }}
      animate={{ opacity: 1, scale: 1, y: y }}
      transition={{
        duration: 1.2,
        delay: delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.05, z: z + 50, rotateY: 0 }}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.8 }}
          sizes="(max-width: 900px) 50vw, 440px"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            fontWeight: 800,
            letterSpacing: '2px',
            fontSize: '12px',
          }}
        >
          VISUAL
        </div>
      )}

      <motion.div
        style={{
          position: 'absolute',
          inset: -100,
          background: sheen,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.05) 30%)',
          pointerEvents: 'none',
          mixBlendMode: 'plus-lighter',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
