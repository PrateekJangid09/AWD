'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { Website } from '@/lib/types';

interface MagneticGalleryProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  websites: Website[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const sectionStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#FAFAFA',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '80px 20px 120px 20px',
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1400,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: 60,
};

const gridBaseStyle: React.CSSProperties = {
  display: 'grid',
  width: '100%',
  maxWidth: 1400,
  gap: 40,
};

// Smart color mapping based on category text
function getCategoryColor(category?: string | null): string {
  if (!category) return '#111111';
  const key = category.toLowerCase().trim();

  if (key.includes('saas')) return '#00E0FF';
  if (key.includes('ai')) return '#9D00FF';
  if (key.includes('fintech')) return '#CCFF00';
  if (key.includes('agency')) return '#FF4D00';
  if (key.includes('web3')) return '#F7931A';
  if (key.includes('crypto')) return '#F7931A';
  if (key.includes('minimal')) return '#999999';
  if (key.includes('mobile')) return '#FF0088';
  if (key.includes('app')) return '#FF0088';

  return '#111111';
}

export default function MagneticGallery({
  title = 'Curated Showcase',
  subtitle = 'The finest pixels on the web, hand-picked daily.',
  accentColor = '#CCFF00',
  websites,
  onLoadMore,
  hasMore,
}: MagneticGalleryProps) {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) setCols(1);
      else if (window.innerWidth < 1100) setCols(2);
      else setCols(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              margin: '0 0 8px 0',
              color: '#111',
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: 16, color: '#666', margin: 0 }}>{subtitle}</p>
        </div>
      </div>

      <div
        style={{
          ...gridBaseStyle,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {websites.map((w, index) => (
          <MagneticCard
            key={w.id}
            website={w}
            accent={accentColor}
            isNew={index < 3}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div
          style={{
            marginTop: 80,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLoadMore}
            style={{
              padding: '14px 32px',
              borderRadius: 999,
              border: '1px solid rgba(15,15,20,0.08)',
              backgroundColor: '#111',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              textTransform: 'uppercase',
            }}
          >
            Load more sites
          </motion.button>
        </div>
      )}
    </section>
  );
}

interface MagneticCardProps {
  website: Website;
  accent: string;
  isNew: boolean;
}

function MagneticCard({ website, accent, isNew }: MagneticCardProps) {
  const { name: title, displayCategory, category, screenshotUrl, slug } = website;
  const ref = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const themeColor = getCategoryColor(displayCategory || category);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        cursor: 'none',
      }}
    >
      <Link href={`/sites/${slug}`} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
        <motion.div
          animate={{
            y: isHovered ? -12 : 0,
            boxShadow: isHovered
              ? '0 30px 60px rgba(0,0,0,0.12)'
              : '0 2px 10px rgba(0,0,0,0.05)',
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            width: '100%',
            aspectRatio: '4/3',
            backgroundColor: '#F5F5F5',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid #F0F0F0',
          }}
        >
          {screenshotUrl ? (
            <motion.div
              style={{ width: '100%', height: '100%' }}
              animate={{ y: isHovered ? '-30%' : '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
            >
              <img
                src={screenshotUrl}
                alt={title}
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
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
                color: '#CCC',
                fontWeight: 700,
              }}
            >
              PROJECT PREVIEW
            </div>
          )}

          {isNew && (
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                padding: '6px 14px',
                backgroundColor: accent,
                color: '#111',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transform: 'rotate(-2deg)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                zIndex: 10,
                clipPath: 'polygon(0% 0%, 100% 0%, 98% 100%, 2% 95%)',
              }}
            >
              Fresh Drop
            </div>
          )}

          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: themeColor,
              color: themeColor === '#CCFF00' ? '#111' : '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              pointerEvents: 'none',
              zIndex: 20,
              x: cursorX,
              y: cursorY,
              translateX: '-50%',
              translateY: '-50%',
              boxShadow: `0 0 20px ${themeColor}60`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isHovered ? 1 : 0,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            OPEN
          </motion.div>
        </motion.div>
      </Link>

      <div style={{ marginTop: 20, paddingLeft: 4 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#111',
            }}
          >
            {title}
          </h3>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: themeColor,
              border: `1px solid ${themeColor}40`,
              backgroundColor: `${themeColor}10`,
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            {displayCategory || category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

