'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface CollageSitePageProps {
  title: string;
  category: string;
  description: string;
  siteUrl: string;
  image: string;
  fullImage?: string;
  fontName: string;
  colors: string[];
  accentColor: string;
}

export default function CollageSitePage({
  title,
  category,
  description,
  siteUrl,
  image,
  fullImage,
  fontName,
  colors,
  accentColor,
}: CollageSitePageProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <article
      style={{
        width: '100%',
        backgroundColor: '#F9F9F9',
        backgroundImage: 'radial-gradient(#CCC 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        color: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '120px 20px 100px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '60px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* --- 1. THE HEADER (Broken Grid Layout) --- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '20px',
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: '#111',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: '2px solid #111',
              paddingBottom: '2px',
            }}
          >
← Back To Collection
          </Link>

          {/* Massive Title with Negative Spacing */}
          <h1
            style={{
              fontSize: 'clamp(56px, 8vw, 100px)',
              fontWeight: 900,
              margin: 0,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: '#111',
              maxWidth: '90%',
            }}
          >
            {title}
          </h1>
        </div>

        {/* --- 2. THE COLLAGE LAYOUT --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
            gap: '80px',
            alignItems: 'start',
          }}
        >
          {/* LEFT: THE TAPED SCREENSHOT */}
          <div style={{ position: 'relative' }}>
            {/* The Image Container (Slightly Rotated) */}
            <motion.div
              initial={{ rotate: -2, y: 40, opacity: 0 }}
              animate={{ rotate: -1, y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                type: 'spring',
                bounce: 0.2,
              }}
              style={{
                width: '100%',
                backgroundColor: '#FFF',
                border: '1px solid #DDD',
                padding: '12px',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.15)',
                position: 'relative',
              }}
            >
              {/* Scrollable Image Container */}
              <div
                style={{
                  width: '100%',
                  height: '80vh',
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  position: 'relative',
                }}
                className="custom-scrollbar"
              >
                {/* Use full screenshot if available, otherwise regular screenshot */}
                <Image
                  src={fullImage || image}
                  alt={`${title} screenshot`}
                  width={1200}
                  height={2400}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    filter: 'grayscale(10%) contrast(105%)',
                  }}
                />
              </div>

              {/* --- COLLAGE ELEMENT: TAPE --- */}
              {/* Top Center Tape - positioned relative to the outer container */}
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(2deg)',
                  width: '140px',
                  height: '35px',
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(2px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  zIndex: 10,
                }}
              />

              {/* --- COLLAGE ELEMENT: THE JOB TICKET --- */}
              {/* A "receipt" stuck to the image - positioned relative to the outer container */}
              <motion.div
                initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
                animate={{ rotate: 2, scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '-20px',
                  padding: '16px',
                  backgroundColor: '#FFF',
                  border: '1px solid #111',
                  boxShadow: '4px 4px 0px #111',
                  transform: 'rotate(2deg)',
                  maxWidth: '200px',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#888',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  CATEGORY
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: accentColor,
                  }}
                >
                  {category}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT: THE NOTES (Sticky Note Style) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              paddingTop: '40px',
            }}
          >
            {/* 1. The Description Note */}
            <motion.div
              initial={{ rotate: -1, opacity: 0, y: 20 }}
              animate={{ rotate: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                padding: '30px',
                backgroundColor: '#FFF9C4',
                color: '#111',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                transform: 'rotate(1deg)',
                position: 'relative',
              }}
            >
              {/* Pin Graphic */}
              <div
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#D32F2F',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                }}
              />

              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                // EDITOR_NOTES.TXT
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '16px',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                }}
              >
                {description}
              </p>
            </motion.div>

            {/* 2. The Color Strip (Pantone Style) */}
            <motion.div
              initial={{ rotate: 1, opacity: 0 }}
              animate={{ rotate: -1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '16px',
                }}
              >
                Palette
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #DDD',
                  width: 'fit-content',
                  backgroundColor: '#FFF',
                  padding: '8px',
                  transform: 'rotate(-1deg)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                }}
              >
                {colors.map((color, index) => (
                  <ColorSwatch key={index} color={color} />
                ))}
              </div>
            </motion.div>

            {/* 3. The Typography Spec */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                borderLeft: '4px solid #111',
                paddingLeft: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Typeface
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                {fontName}
              </div>
            </motion.div>

            {/* 4. CTA (Big Sticker Button - Import to Figma) */}
            <motion.a
              href={`https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design?url=${encodeURIComponent(siteUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                marginTop: '20px',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '100%',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                  color: '#000',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%)',
                  boxShadow: '5px 5px 0px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Import to Figma →
              </motion.button>
            </motion.a>

            {/* 5. Visit Website Link */}
            <motion.a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{
                textDecoration: 'none',
                marginTop: '10px',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '20px',
                  backgroundColor: '#FFF',
                  border: '2px dashed #DDD',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span
                  style={{
                    color: '#111',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Visit Website →
                </span>
              </motion.div>
            </motion.a>
          </div>
        </div>
      </div>
    </article>
  );
}

// --- SUB-COMPONENT: COLOR SWATCH ---
function ColorSwatch({ color }: { color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: color,
          borderRadius: '50%',
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      />
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#666',
        }}
      >
        {color}
      </span>
    </div>
  );
}
