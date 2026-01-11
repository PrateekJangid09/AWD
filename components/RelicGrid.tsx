'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME (Light Mode) ---
const THEME = {
  bg: '#FAFAFA', // Light Background
  cardBg: '#FFFFFF', // White Cards
  gold: '#B8860B', // Dark Gold (for contrast on light)
  goldLight: '#D4AF37', // Metallic Gold
  text: '#1A1A1A', // Dark Text
  sub: '#666666', // Gray Subtext
};

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Cinzel:wght@400;700&family=Playfair+Display:ital,wght@1,500&display=swap');
`;

interface RelicGridProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
}

export default function RelicGrid({
  title = 'HALL OF LEGENDS',
  subtitle = 'Digital Masterpieces That Define Excellence',
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
      style={{
        width: '100%',
        backgroundColor: THEME.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '140px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style jsx global>{fontStyles}</style>

      {/* ATMOSPHERE: Subtle Texture & Light Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 0%, rgba(184, 134, 11, 0.08) 0%, transparent 60%)',
          zIndex: 0,
        }}
      />

      {/* HEADER */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          marginBottom: '100px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(48px, 5vw, 80px)',
            color: THEME.text,
            margin: 0,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to bottom, #1A1A1A 30%, #666 100%)',
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '40px',
          width: '100%',
          maxWidth: '1200px',
          position: 'relative',
          zIndex: 10,
          marginBottom: '80px',
        }}
      >
        {items.map((item, i) => (
          <RelicCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* EXPLORE ALL BUTTON */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.button
          onClick={() => {
            document
              .getElementById('browse')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: `0 20px 40px -10px ${THEME.gold}40`,
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'transparent',
            border: `2px solid ${THEME.gold}`,
            color: THEME.text,
            padding: '16px 48px',
            borderRadius: '8px',
            fontFamily: '"Inter", sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: THEME.gold,
              zIndex: 0,
            }}
          />
          <motion.span
            initial={{ color: THEME.text }}
            whileHover={{ color: '#FFF' }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            Explore All Designs
          </motion.span>
        </motion.button>
      </motion.div>
    </section>
  );
}

// --- THE RELIC CARD (The Hook) ---
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

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
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
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/5',
          cursor: 'pointer',
          perspective: 1000,
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '4px', // Sharp, premium corners
            backgroundColor: THEME.cardBg,
            border: '1px solid rgba(0,0,0,0.08)', // Light border
            overflow: 'hidden',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
          variants={{
            hover: {
              y: -10, // Physical Lift
              boxShadow: `0 20px 50px -10px rgba(0,0,0,0.15), 0 0 20px ${goldColor}30`, // Gold glow bloom
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
            style={{
              position: 'absolute',
              inset: 0,
              border: `1px solid ${goldColor}`,
              borderRadius: '4px',
              zIndex: 20,
              pointerEvents: 'none',
              boxShadow: `inset 0 0 20px ${goldColor}20`, // Inner gold glow
            }}
          />

          {/* 2. IMAGE CONTAINER */}
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              backgroundColor: '#F5F5F5',
            }}
          >
            {img ? (
              <motion.div
                variants={{
                  idle: {
                    scale: 1,
                  },
                  hover: {
                    scale: 1.1,
                  },
                }}
                transition={{ duration: 0.8 }} // Slow, cinematic zoom
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
                  unoptimized
                />
              </motion.div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontFamily: 'serif',
                }}
              >
                ARTIFACT_MISSING
              </div>
            )}

            {/* Light Vignette Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)',
                opacity: 0.4,
              }}
            />

            {/* Bottom Gradient for Text (Lighter) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
              }}
            />
          </div>

          {/* 3. HOLOGRAPHIC SHEEN (The "Rare Card" Effect) */}
          <motion.div
            variants={{
              idle: { x: '-100%', opacity: 0 },
              hover: { x: '200%', opacity: 0.4 },
            }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '50%',
              background: `linear-gradient(90deg, transparent, ${goldColor}60, transparent)`,
              transform: 'skewX(-20deg)',
              zIndex: 10,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />

          {/* 4. CONTENT (Engraved) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              zIndex: 30,
            }}
          >
            {/* The "Seal" */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <motion.div
                variants={{
                  idle: { scale: 0.9, opacity: 0.5 },
                  hover: { scale: 1, opacity: 1 },
                }}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '24px',
                  color: goldColor,
                  textShadow: `0 0 10px ${goldColor}80, 0 2px 4px rgba(0,0,0,0.3)`,
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
              style={{ marginBottom: '8px' }}
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
                color: '#F5F5F5',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
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
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
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
