'use client';

import * as React from 'react';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';
import { slugifyCategory } from '@/lib/categories';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export interface CategoryPill {
  title: string;
  count: string;
}

export interface QuantumDirectoryHeroProps {
  headline?: string;
  subheadline?: string;
  categories?: CategoryPill[];
  browseButtonText?: string;
  browseButtonLink?: string;
  textColor?: string;
  accentColor?: string;
  bgColor?: string;
}

function getCategoryColor(title: string): string {
  const map: Record<string, string> = {
    SaaS: '#3B82F6',
    'Design Studio': '#8B5CF6',
    'Agency/Studio': '#8B5CF6',
    Fintech: '#10B981',
    'E-commerce': '#F59E0B',
    Portfolio: '#EC4899',
    'AI Tool': '#6366F1',
    AI: '#6366F1',
    'AI Agent': '#FF6B6B',
    'Creative Studio': '#A855F7',
    Media: '#14B8A6',
    Template: '#84CC16',
    Education: '#F97316',
    Health: '#EF4444',
    Crypto: '#06B6D4',
    'Crypto/Web3': '#06B6D4',
    DevTool: '#8B5CF6',
    Developer: '#8B5CF6',
    Cloud: '#3B82F6',
    Marketing: '#F59E0B',
  };
  return map[title] || '#6B7280';
}

const DEFAULT_CATEGORIES: CategoryPill[] = [
  { title: 'SaaS', count: '850' },
  { title: 'Portfolio', count: '620' },
  { title: 'E-commerce', count: '900' },
  { title: 'Crypto/Web3', count: '410' },
  { title: 'AI', count: '320' },
  { title: 'Agency/Studio', count: '320' },
  { title: 'Fintech', count: '210' },
  { title: 'Media', count: '150' },
];

export default function QuantumDirectoryHero(props: QuantumDirectoryHeroProps) {
  const {
    headline = 'The Encyclopedia of Digital Design.',
    subheadline = 'Curated inspiration for designers, developers, and founders. Browse by category to find exactly what you need.',
    categories = DEFAULT_CATEGORIES,
    browseButtonText = 'Browse All Templates',
    browseButtonLink = '#browse',
    textColor = '#050505',
    accentColor = '#3B82F6',
    bgColor = '#FFFFFF',
  } = props;

  const [isMobile, setIsMobile] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const checkRes = () => setIsMobile(window.innerWidth <= 810);
    checkRes();
    window.addEventListener('resize', checkRes);
    return () => window.removeEventListener('resize', checkRes);
  }, []);

  const sectionStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '700px',
    backgroundColor: bgColor,
    paddingTop: isMobile ? '140px' : '180px',
    paddingBottom: '100px',
    paddingLeft: '5%',
    paddingRight: '5%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '48px',
    fontFamily: poppins.style.fontFamily,
    color: textColor,
    boxSizing: 'border-box',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const h1Style: React.CSSProperties = {
    fontSize: isMobile ? '40px' : '72px',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-2px',
    maxWidth: '900px',
    margin: '0 0 24px 0',
  };

  const pStyle: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '18px',
    opacity: 0.6,
    lineHeight: 1.6,
    maxWidth: '540px',
    margin: '0 auto',
  };

  const pillsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    maxWidth: '900px',
    marginTop: '16px',
    zIndex: 2,
  };

  const isExternal = browseButtonLink.startsWith('http') || browseButtonLink.startsWith('//');

  return (
    <section style={sectionStyle} className={poppins.variable}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          height: '60%',
          background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ zIndex: 1 }}>
        <motion.h1
          style={h1Style}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {headline}
        </motion.h1>
        <motion.p
          style={pStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {subheadline}
        </motion.p>
      </div>

      <div style={pillsContainerStyle}>
        {categories.map((cat, i) => {
          const pillColor = getCategoryColor(cat.title);
          const isHovered = hoveredIndex === i;
          const slug = slugifyCategory(cat.title);
          const href = slug ? `/c/${slug}` : '#browse';

          return (
            <Link key={i} href={href} style={{ textDecoration: 'none' }}>
              <motion.div
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '100px',
                  backgroundColor: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isHovered ? pillColor : textColor + '15'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: isHovered ? `0 0 20px -5px ${pillColor}80` : '0 4px 20px -5px rgba(0,0,0,0.05)',
                  color: isHovered ? pillColor : textColor,
                  transition: 'all 0.3s ease',
                }}
              >
                <span>{cat.title}</span>
                <span
                  style={{
                    opacity: 0.5,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isHovered ? pillColor : textColor,
                  }}
                >
                  {cat.count}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {isExternal ? (
        <motion.a
          href={browseButtonLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{
            scale: 1.02,
            boxShadow: `0 20px 40px -10px ${accentColor}40`,
          }}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: '32px',
            padding: '16px 48px',
            backgroundColor: textColor,
            color: bgColor,
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: 600,
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {browseButtonText}
          <span>↓</span>
        </motion.a>
      ) : (
        <Link href={browseButtonLink} style={{ textDecoration: 'none', zIndex: 2 }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{
              scale: 1.02,
              boxShadow: `0 20px 40px -10px ${accentColor}40`,
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: '32px',
              padding: '16px 48px',
              backgroundColor: textColor,
              color: bgColor,
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {browseButtonText}
            <span>↓</span>
          </motion.span>
        </Link>
      )}
    </section>
  );
}
