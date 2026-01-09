'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME ---
const THEME = {
  bg: '#050505', // Deep Void
  cardBg: '#0A0A0A', // Obsidian
  gold: '#D4AF37', // Metallic Gold
  goldLight: '#F3E5AB', // Pale Gold
  text: '#FFFFFF',
  sub: '#666666',
};

interface RelicGridProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
}

export default function RelicGrid({
  title = 'The Pantheon',
  subtitle = 'A collection of digital masterpieces that have achieved legendary status.',
  websites,
}: RelicGridProps) {
  // Get first 9 websites
  const items = websites.slice(0, 9).map((w, idx) => ({
    id: w.id || idx + 1,
    title: w.name,
    tag: w.displayCategory || w.category,
    img: w.screenshotUrl,
    slug: w.slug,
  }));

  return (
    <section
      className="relative w-full flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: THEME.bg,
        padding: '140px 20px',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Cinzel:wght@400;700&family=Playfair+Display:ital,wght@1,500&display=swap');
        
        .relic-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        
        @media (max-width: 1024px) {
          .relic-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 640px) {
          .relic-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ATMOSPHERE: Static Noise & Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 60%)',
          zIndex: 0,
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 w-full max-w-[1200px] mb-25 text-center flex flex-col items-center"
        style={{
          marginBottom: '100px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-6"
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: '12px',
            color: THEME.gold,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '1px',
              background: `linear-gradient(to right, transparent, ${THEME.gold})`,
            }}
          />
          Hall of Legends
          <div
            style={{
              width: '40px',
              height: '1px',
              background: `linear-gradient(to left, transparent, ${THEME.gold})`,
            }}
          />
        </motion.div>

        <h2
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(48px, 5vw, 80px)',
            color: THEME.text,
            margin: 0,
            lineHeight: 1,
            fontStyle: 'italic',
            background: 'linear-gradient(to bottom, #FFF 30%, #666 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '16px',
            color: THEME.sub,
            maxWidth: '500px',
            marginTop: '24px',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* THE 3x3 GRID */}
      <div
        className="relic-grid relative z-10 w-full max-w-[1200px] grid gap-10"
      >
        {items.map((item, i) => (
          <RelicCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

// --- THE RELIC CARD ---
interface RelicCardItem {
  id: number | string;
  title: string;
  tag: string;
  img: string;
  slug: string;
}

function RelicCard({ item, index }: { item: RelicCardItem; index: number }) {
  const { title, tag, img, slug } = item;
  const accentColor = getCategoryColor(tag);
  const goldColor = accentColor !== '#ADADAD' ? accentColor : THEME.gold;

  // MOUSE TRACKING (For the "Sheen" effect)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <Link href={`/sites/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial="idle"
        whileHover="hover"
        onMouseMove={handleMouseMove}
        className="relative w-full cursor-pointer"
        style={{
          aspectRatio: '4/5',
          perspective: 1000,
        }}
      >
        <motion.div
          className="relative w-full h-full rounded overflow-hidden"
          style={{
            backgroundColor: THEME.cardBg,
            border: `1px solid ${THEME.bg}`,
            transformStyle: 'preserve-3d',
          }}
          variants={{
            hover: {
              y: -10,
              boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), 0 0 20px ${goldColor}20`,
            },
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* 1. THE GOLDEN FRAME (Scales in on hover) */}
          <motion.div
            variants={{
              idle: { opacity: 0, scale: 0.98 },
              hover: { opacity: 1, scale: 1 },
            }}
            className="absolute inset-0 pointer-events-none z-20 rounded"
            style={{
              border: `1px solid ${goldColor}`,
              boxShadow: `inset 0 0 20px ${goldColor}20`,
            }}
          />

          {/* 2. IMAGE CONTAINER */}
          <div className="relative w-full h-full" style={{ backgroundColor: '#111' }}>
            {img ? (
              <motion.div
                className="absolute inset-0"
                variants={{
                  idle: {
                    scale: 1,
                  },
                  hover: {
                    scale: 1.1,
                  },
                }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 33vw"
                  unoptimized
                />
              </motion.div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  color: '#333',
                  fontFamily: 'serif',
                }}
              >
                ARTIFACT_MISSING
              </div>
            )}

            {/* Vignette Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, transparent 40%, #000 100%)',
                opacity: 0.6,
              }}
            />

            {/* Bottom Gradient for Text */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, #000 0%, transparent 60%)',
              }}
            />
          </div>

          {/* 3. HOLOGRAPHIC SHEEN (The "Rare Card" Effect) */}
          <motion.div
            variants={{
              idle: { x: '-100%', opacity: 0 },
              hover: { x: '200%', opacity: 0.3 },
            }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{
              width: '50%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              transform: 'skewX(-20deg)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* 4. CONTENT (Engraved) */}
          <div
            className="absolute inset-0 p-8 flex flex-col justify-end z-30 pointer-events-none"
          >
            {/* The "Seal" */}
            <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
              <motion.div
                variants={{
                  idle: { scale: 0.9, opacity: 0.5 },
                  hover: { scale: 1, opacity: 1 },
                }}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '24px',
                  color: goldColor,
                  textShadow: `0 0 10px ${goldColor}`,
                }}
              >
                {(index + 1).toString().padStart(2, '0')}
              </motion.div>
            </div>

            {/* Tag */}
            <motion.div
              variants={{
                idle: { y: 10, opacity: 0 },
                hover: { y: 0, opacity: 1 },
              }}
              className="mb-2"
            >
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '10px',
                  color: goldColor,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  borderBottom: `1px solid ${goldColor}`,
                  paddingBottom: '4px',
                }}
              >
                {tag || 'Unknown'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h3
              variants={{ hover: { y: -5, color: '#FFF' } }}
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '32px',
                fontWeight: 600,
                color: '#CCC',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {title}
            </motion.h3>

            {/* "View" Text */}
            <motion.div
              variants={{
                idle: { height: 0, opacity: 0 },
                hover: { height: 'auto', opacity: 1 },
              }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center gap-2 mt-4"
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '10px',
                  color: goldColor,
                }}
              >
                UNVEIL MASTERPIECE <span style={{ fontSize: '14px' }}>✦</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
