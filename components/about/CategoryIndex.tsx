'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MACRO_CATEGORIES, getCategoryColor, slugifyCategory } from '@/lib/categories';

const defaultStyles = {
    fontFamily: `"Sora", system-ui, sans-serif`,
  color: '#FFFFFF',
};

interface CategoryIndexProps {
  title?: string;
}

interface CategoryItem {
  name: string;
  color: string;
}

export default function CategoryIndex({ title = 'Curated Collections' }: CategoryIndexProps) {
  const borderColor = '#222222';
  const bgColor = '#050505';
  const textColor = '#FFFFFF';

  // Build items from macro categories (exclude "Browse All")
  const items: CategoryItem[] = MACRO_CATEGORIES.filter((c) => c !== 'Browse All').map((name) => ({
    name,
    color: getCategoryColor(name),
  }));

  const styles = {
    container: {
      ...defaultStyles,
      width: '100%',
      backgroundColor: bgColor,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '80px 20px',
      borderBottom: `1px solid ${borderColor}`,
    },
    header: {
      width: '100%',
      maxWidth: '1200px',
      marginBottom: '40px',
      textAlign: 'left' as const,
    },
    badge: {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: textColor,
      opacity: 0.5,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      display: 'block',
      marginBottom: '16px',
    },
    h2: {
      fontSize: '32px',
      fontWeight: 600,
      color: textColor,
      margin: 0,
      letterSpacing: '-0.5px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      width: '100%',
      maxWidth: '1200px',
      border: `1px solid ${borderColor}`,
      backgroundColor: borderColor,
      gap: '1px',
    },
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        @media (max-width: 900px) {
          .archive-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .archive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.header}>
        <span style={styles.badge}>// {items.length} Categories</span>
        <h2 style={styles.h2}>{title}</h2>
      </div>

      <div className="archive-grid" style={styles.grid}>
        {items.map((item, i) => (
          <CategoryCard
            key={item.name}
            index={i}
            name={item.name}
            color={item.color}
            textColor={textColor}
            bgColor={bgColor}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  index: number;
  name: string;
  color: string;
  textColor: string;
  bgColor: string;
}

function CategoryCard({ index, name, color, textColor, bgColor }: CategoryCardProps) {
  const [isHovered, setHovered] = React.useState(false);

  const cardStyles = {
    backgroundColor: isHovered ? `${color}10` : bgColor,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    height: '160px',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background-color 0.3s ease',
    color: textColor,
    textDecoration: 'none',
  };

  const href = `/c/${slugifyCategory(name)}`;

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.div
        style={cardStyles}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color,
              fontWeight: 600,
            }}
          >
            {index < 9 ? `0${index + 1}` : index + 1}
          </span>

          <motion.span
            animate={{
              x: isHovered ? 2 : 0,
              y: isHovered ? -2 : 0,
              opacity: isHovered ? 1 : 0.3,
            }}
            style={{ fontSize: '16px', color }}
          >
            ↗
          </motion.span>
        </div>

        <span
          style={{
            fontSize: '20px',
            fontWeight: 500,
            letterSpacing: '-0.5px',
          }}
        >
          {name}
        </span>
      </motion.div>
    </Link>
  );
}

