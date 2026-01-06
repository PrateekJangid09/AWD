'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { Website } from '@/lib/types';

interface FeaturedBentoProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
}

const sectionStyle: React.CSSProperties = {
  width: '100%',
  padding: '100px 20px',
  backgroundColor: '#FAFAFA',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1200,
  marginBottom: 60,
  textAlign: 'center',
};

const gridBaseStyle: React.CSSProperties = {
  display: 'grid',
  width: '100%',
  maxWidth: 1200,
  gap: 24,
};

const ACCENTS = ['#CCFF00', '#00E0FF', '#FF4D00', '#1DB954', '#FF5A5F', '#000000', '#7C3AED', '#F59E0B', '#10B981'];

export default function FeaturedBento({ title = 'The Weekly Edit', subtitle = 'A selection of the 9 finest websites.', websites }: FeaturedBentoProps) {
  const items = websites.slice(0, 9).map((w, idx) => ({
    id: idx + 1,
    title: w.name,
    tag: w.displayCategory || w.category,
    img: w.screenshotUrl,
    badge: w.displayCategory || w.category,
    accent: ACCENTS[idx % ACCENTS.length],
    link: `/sites/${w.slug}`,
  }));

  const [cols, setCols] = useState(3);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 650) setCols(1);
      else if (window.innerWidth < 1000) setCols(2);
      else setCols(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <h2
          style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#111',
            margin: '0 0 16px 0',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 18,
            color: '#666',
            margin: 0,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {subtitle}
        </p>
      </div>

      <div
        style={{
          ...gridBaseStyle,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
        onMouseLeave={() => setHoveredId(null)}
      >
        {items.map((item) => (
          <BentoCard
            key={item.id}
            item={item}
            isHovered={hoveredId === item.id}
            isDimmed={hoveredId !== null && hoveredId !== item.id}
            onHover={() => setHoveredId(item.id)}
          />
        ))}
      </div>

      <motion.a
        href="#browse"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          marginTop: 60,
          padding: '16px 32px',
          backgroundColor: '#111',
          color: '#FFF',
          border: 'none',
          borderRadius: 100,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textDecoration: 'none',
        }}
      >
        Load More Sites ↓
      </motion.a>
    </section>
  );
}

interface BentoItem {
  id: number;
  title: string;
  tag: string;
  img: string;
  badge?: string;
  accent: string;
  link: string;
}

function BentoCard({ item, isHovered, isDimmed, onHover }: { item: BentoItem; isHovered: boolean; isDimmed: boolean; onHover: () => void }) {
  const { title, tag, img, badge, accent, link } = item;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct * 20);
    y.set(yPct * 20);
  };

  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <motion.div
        onMouseEnter={onHover}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        animate={{
          opacity: isDimmed ? 0.4 : 1,
          scale: isHovered ? 1.02 : 1,
          filter: isDimmed ? 'blur(2px) grayscale(100%)' : 'blur(0px) grayscale(0%)',
        }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          height: 320,
          backgroundColor: '#FFF',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isHovered ? '0 30px 60px -10px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
          }}
        >
          {img ? (
            <motion.img
              src={img}
              alt={title}
              style={{
                width: '110%',
                height: '110%',
                x: springX,
                y: springY,
                marginLeft: '-5%',
                marginTop: '-5%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#EEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BBB',
                fontWeight: 700,
              }}
            >
              PREVIEW {item.id}
            </div>
          )}
        </div>

        {badge && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: accent,
              color: '#111',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '6px 12px',
              transform: 'rotate(3deg)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
          >
            {badge}
          </div>
        )}

        <motion.div
          initial={false}
          animate={{ y: isHovered ? 0 : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFF',
            padding: 20,
            borderTop: '1px solid #EEE',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: '#111', fontWeight: 700 }}>{title}</h3>
              <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{tag}</span>
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
              }}
            >
              ↗
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
