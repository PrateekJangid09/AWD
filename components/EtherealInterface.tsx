'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME CONFIG ---
const theme = {
  bg: '#020202', // Deepest Black
  cardBg: '#080808',
  text: '#FFFFFF',
  sub: '#A1A1AA',
  border: 'rgba(255,255,255,0.08)',
};

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@1,400;1,500&family=JetBrains+Mono:wght@500&display=swap');
`;

interface EtherealInterfaceProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
}

export default function EtherealInterface({
  title = 'Curated Excellence',
  subtitle = 'A selection of high-fidelity digital interfaces.',
  websites,
}: EtherealInterfaceProps) {
  // Get first 9 websites
  const items = websites.slice(0, 9).map((w, idx) => ({
    id: w.id || idx + 1,
    title: w.name,
    tag: w.displayCategory || w.category,
    img: w.screenshotUrl,
    slug: w.slug,
  }));

  // MOUSE TRACKING (For Global Background Grid)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlight = useMotionTemplate`radial-gradient(1200px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 80%)`;

  const styles = {
    section: {
      width: '100%',
      backgroundColor: theme.bg,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '140px 40px',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      cursor: 'default' as const,
    },
    // Technical Grid Background
    gridLayer: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage: `linear-gradient(${theme.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
      maskImage: spotlight,
      WebkitMaskImage: spotlight,
      zIndex: 1,
      pointerEvents: 'none' as const,
    },
    header: {
      position: 'relative' as const,
      zIndex: 10,
      textAlign: 'center' as const,
      marginBottom: '100px',
      maxWidth: '900px',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
      gap: '48px 40px',
      width: '100%',
      maxWidth: '1400px',
      zIndex: 10,
      position: 'relative' as const,
    },
    mobileCss: `
      @media (max-width: 900px) {
        .ethereal-grid { grid-template-columns: 1fr !important; }
      }
    `,
  };

  return (
    <section style={styles.section} onMouseMove={handleMouseMove}>
      <style jsx global>{`${fontStyles}${styles.mobileCss}`}</style>

      {/* ATMOSPHERE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 0%, #111, #020202)',
          zIndex: 0,
        }}
      />
      <motion.div style={styles.gridLayer} />

      {/* HEADER */}
      <div style={styles.header}>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // "Apple" ease
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(56px, 6vw, 96px)',
            color: theme.text,
            marginBottom: '24px',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1 }}
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '18px',
            color: theme.sub,
            maxWidth: '540px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </motion.div>
      </div>

      {/* CARDS */}
      <div className="ethereal-grid" style={styles.gridContainer}>
        {items.map((item, i) => (
          <EtherealCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

// --- THE ETHEREAL CARD (Micro-Interactions) ---
interface EtherealCardItem {
  id: number | string;
  title: string;
  tag: string;
  img: string;
  slug: string;
}

function EtherealCard({ item, index }: { item: EtherealCardItem; index: number }) {
  const { title, tag, img, slug } = item;
  const accentColor = getCategoryColor(tag);

  // LOCAL MOUSE PHYSICS (For Sheen)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  // The Sheen Gradient (Follows mouse)
  const sheen = useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.1), transparent 70%)`;

  return (
    <Link href={`/sites/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration: 0.8,
          delay: index * 0.1,
          ease: [0.25, 1, 0.5, 1],
        }} // Staggered entrance
        onMouseMove={handleMouseMove}
        whileHover="hover"
        style={{
          position: 'relative',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* A. VISUAL SLAB */}
        <div style={{ position: 'relative' }}>
          {/* 1. Volumetric Back Glow (The "Atmosphere") */}
          <motion.div
            variants={{
              idle: { opacity: 0, scale: 0.9 },
              hover: { opacity: 0.5, scale: 1 },
            }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: accentColor,
              filter: 'blur(70px)',
              zIndex: -1,
              borderRadius: '20px',
            }}
          />

          {/* 2. Main Card Body */}
          <motion.div
            variants={{ hover: { y: -8 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3', // 4:3 Ratio
              backgroundColor: theme.cardBg,
              borderRadius: '8px', // Sharp, modern radius
              overflow: 'hidden',
              zIndex: 10,
              // High-end double border technique
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {/* Image Layer */}
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {img ? (
                <motion.div
                  variants={{
                    idle: {
                      scale: 1,
                      filter: 'brightness(0.9)',
                    },
                    hover: {
                      scale: 1.05,
                      filter: 'brightness(1.1)',
                    },
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                </motion.div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#111',
                  }}
                />
              )}

              {/* Interactive Sheen (The Surface Reflection) */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: sheen,
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            </div>

            {/* 3. The Glass Badge (Top Left) */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 20,
              }}
            >
              <motion.div
                variants={{
                  idle: {
                    borderColor: 'rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  },
                  hover: {
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}20`,
                  },
                }}
                style={{
                  border: '1px solid',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
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
                    fontWeight: 500,
                    color: '#FFF',
                    textTransform: 'uppercase',
                  }}
                >
                  {tag || 'Unknown'}
                </span>
              </motion.div>
            </div>

            {/* 4. Active Border (Revealed on Hover) */}
            <motion.div
              variants={{
                idle: { opacity: 0 },
                hover: { opacity: 1 },
              }}
              style={{
                position: 'absolute',
                inset: 0,
                border: `1px solid ${accentColor}`,
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 30,
              }}
            />
          </motion.div>
        </div>

        {/* B. EDITORIAL INFO */}
        <div style={{ padding: '0 4px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            {/* Title & Meta */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <motion.h3
                variants={{
                  hover: { color: '#FFF' },
                  idle: { color: '#EEE' },
                }}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '22px',
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </motion.h3>
              <div
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '14px',
                  color: theme.sub,
                }}
              >
                View Case Study
              </div>
            </div>

            {/* Animated Button */}
            <motion.div
              variants={{
                idle: { opacity: 0.5, x: 0 },
                hover: { opacity: 1, x: 5, color: accentColor },
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
