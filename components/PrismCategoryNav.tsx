'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const containerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 0',
  backgroundColor: 'transparent',
};

const trackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  gap: 12,
  width: '100%',
  height: '100%',
  padding: '0 clamp(16px, 4vw, 40px)',
  userSelect: 'none',
};

interface PrismCategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  websiteCounts: Record<string, number>;
  totalCount: number;
}

export default function PrismCategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  websiteCounts,
  totalCount,
}: PrismCategoryNavProps) {
  const pills = categories.map((cat) => {
    const count = websiteCounts[cat] ?? 0;
    return {
      id: cat,
      label: cat,
      count: cat === 'Browse All' ? totalCount : count,
    };
  });

  const [active, setActive] = useState<string>(activeCategory || (pills[0]?.id ?? 'Browse All'));

  const handleClick = (id: string) => {
    setActive(id);
    onCategoryChange(id);
  };

  return (
    <div style={containerStyle}>
      <div className="prism-track" style={trackStyle}>
        {pills.map((pill) => (
          <CategoryPill
            key={pill.id}
            label={pill.label}
            count={pill.count}
            isActive={active === pill.id}
            onClick={() => handleClick(pill.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryPillProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function CategoryPill({ label, count, isActive, onClick }: CategoryPillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const gradient = getGradientForCategory(label);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      animate={{
        background: isActive ? gradient : '#F3F4F6',
        boxShadow: isActive ? '0 8px 20px -6px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
      }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        padding: '10px 20px',
        borderRadius: 100,
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isActive ? '#FFF' : '#DDD',
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: isActive ? '#FFFFFF' : '#4B5563',
          letterSpacing: '0.02em',
          textTransform: 'none',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          opacity: isActive ? 0.9 : 0.6,
          backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.04)',
          padding: '2px 6px',
          borderRadius: 12,
        }}
      >
        {count}
      </span>
    </motion.button>
  );
}

function getGradientForCategory(category: string): string {
  switch (category) {
    case 'Browse All':
      return 'linear-gradient(135deg, #FF9F43 0%, #FFC078 100%)';
    case 'SaaS':
      return 'linear-gradient(135deg, #5D5FEF 0%, #888AFC 100%)';
    case 'Agency/Studio':
    case 'Agency':
      return 'linear-gradient(135deg, #F55F90 0%, #FF8FAB 100%)';
    case 'Portfolio':
      return 'linear-gradient(135deg, #2ECC71 0%, #58D68D 100%)';
    case 'Fintech':
      return 'linear-gradient(135deg, #1ABC9C 0%, #48C9B0 100%)';
    case 'E-commerce':
      return 'linear-gradient(135deg, #FF9F43 0%, #FFB775 100%)';
    case 'Developer':
      return 'linear-gradient(135deg, #9B59B6 0%, #AF7AC5 100%)';
    case 'AI':
      return 'linear-gradient(135deg, #00D2FC 0%, #55E0FF 100%)';
    case 'AI Agent':
      return 'linear-gradient(135deg, #FF4D4D 0%, #FF7676 100%)';
    case 'Crypto/Web3':
    case 'Crypto':
      return 'linear-gradient(135deg, #F7931A 0%, #F9B256 100%)';
    case 'Health':
      return 'linear-gradient(135deg, #A3D655 0%, #C4E57D 100%)';
    case 'Education':
      return 'linear-gradient(135deg, #4D7CFF 0%, #7AA0FF 100%)';
    case 'Templates':
    case 'Template':
      return 'linear-gradient(135deg, #95A5A6 0%, #BCC6C7 100%)';
    case 'Other':
      return 'linear-gradient(135deg, #7F8C8D 0%, #9FA8A9 100%)';
    default:
      return 'linear-gradient(135deg, #333 0%, #555 100%)';
  }
}

