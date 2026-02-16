'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getCategoryColor } from '@/lib/categories';

export interface LumosGalleryItem {
  title: string;
  author: string;
  tag: string;
  image: string;
  slug?: string;
}

interface LumosGalleryGridProps {
  headline?: string;
  subheadline?: string;
  items: LumosGalleryItem[];
  textColor?: string;
  bgColor?: string;
}

export default function LumosGalleryGrid({
  headline = 'Fresh from the Community',
  subheadline = 'Hand-picked websites showcasing the best in digital product design.',
  items,
  textColor = '#050505',
  bgColor = '#FFFFFF',
}: LumosGalleryGridProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const checkRes = () => setIsMobile(window.innerWidth <= 810);
    checkRes();
    window.addEventListener('resize', checkRes);
    return () => {
      window.removeEventListener('resize', checkRes);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  const sectionStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: bgColor,
    padding: isMobile ? '60px 20px' : '100px 5%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '60px',
    fontFamily: '"Inter", sans-serif',
    color: textColor,
    boxSizing: 'border-box',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '800px',
    marginBottom: '20px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: '48px 32px',
    width: '100%',
    maxWidth: '1400px',
  };

  const displayItems = items.slice(0, 6);

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <h2
          style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 700,
            marginBottom: '16px',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
          }}
        >
          {headline}
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.6, lineHeight: 1.6, fontWeight: 400 }}>
          {subheadline}
        </p>
      </div>

      <div style={gridStyle}>
        {displayItems.map((item, i) => (
          <DesignCard key={item.slug ?? i} item={item} index={i} textColor={textColor} />
        ))}
      </div>

      <div style={{ marginTop: '40px' }}>
        <Link
          href="/c"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: textColor,
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 600,
            borderBottom: `1px solid ${textColor}40`,
            paddingBottom: '4px',
            transition: 'opacity 0.2s',
          }}
        >
          View Full Archive →
        </Link>
      </div>
    </section>
  );
}

function DesignCard({
  item,
  index,
  textColor,
}: {
  item: LumosGalleryItem;
  index: number;
  textColor: string;
}) {
  const [isHovered, setHovered] = React.useState(false);
  const tagColor = getCategoryColor(item.tag);
  const href = item.slug ? `/sites/${item.slug}` : '#';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <motion.div
          animate={{
            y: isHovered ? -8 : 0,
            boxShadow: isHovered ? `0 20px 40px -10px ${tagColor}50` : '0 10px 20px -10px rgba(0,0,0,0.05)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9/16',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#F3F4F6',
          }}
        >
          <Image
            src={item.image}
            alt={item.title}
            width={400}
            height={711}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s',
            }}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 10,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </motion.div>
        </motion.div>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: textColor, letterSpacing: '-0.3px' }}>
            {item.title}
          </h3>
          <span style={{ fontSize: '14px', color: textColor, opacity: 0.5, fontWeight: 400 }}>
            by {item.author}
          </span>
        </div>
        <motion.div
          animate={{
            backgroundColor: isHovered ? tagColor : 'transparent',
            color: isHovered ? '#FFFFFF' : textColor,
            borderColor: isHovered ? tagColor : `${textColor}20`,
          }}
          transition={{ duration: 0.2 }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          {item.tag}
        </motion.div>
      </div>
    </motion.div>
  );
}
