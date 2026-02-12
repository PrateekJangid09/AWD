'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { getCategoryColor } from '@/lib/categories';

// --- 1. CONFIGURATION (Light Mode) ---
const THEME = {
  bg: '#FAFAFA', // Light Background
  panelBg: 'rgba(255, 255, 255, 0.9)', // Light glass
  text: '#1A1A1A', // Dark text
  sub: '#666666', // Gray subtext
  border: 'rgba(0,0,0,0.08)', // Dark borders
  activeBorder: 'rgba(0,0,0,0.15)',
};

interface NebulaFilterProps {
  title?: string;
  categories?: string[];
  selectedCategories?: string[];
  onCategoryChange?: (selected: string[]) => void;
}

export default function NebulaFilter({
  title = 'Browse by Sector',
  categories = [],
  selectedCategories = [],
  onCategoryChange,
}: NebulaFilterProps) {
  const [selected, setSelected] = React.useState<string[]>(selectedCategories);

  // Sync with external state changes
  React.useEffect(() => {
    setSelected(selectedCategories);
  }, [selectedCategories]);

  // Get unique categories with colors
  const availableCategories = React.useMemo(() => {
    const unique = Array.from(new Set(categories));
    return unique.filter((cat) => cat && cat !== 'Browse All');
  }, [categories]);

  // -- HANDLERS --
  const isAllActive = selected.length === 0;

  const toggleAll = () => {
    const newSelection: string[] = [];
    setSelected(newSelection);
    onCategoryChange?.(newSelection);
  };

  const toggleCategory = (cat: string) => {
    let newSelection: string[];
    if (selected.includes(cat)) {
      // Remove category
      newSelection = selected.filter((c) => c !== cat);
    } else {
      // Add category
      newSelection = [...selected, cat];
    }
    setSelected(newSelection);
    onCategoryChange?.(newSelection);
  };


  return (
    <section
      style={{
        width: '100%',
        minHeight: '500px',
        backgroundColor: THEME.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px)',
        fontFamily: 'var(--font-sora), sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(600px, 90vw)',
          height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* HEADER */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '60px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontSize: 'clamp(28px, 5vw, 42px)',
            color: THEME.text, // Dark text
            margin: '0 0 16px 0',
            letterSpacing: '-1.5px',
            fontWeight: 700,
          }}
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '100px',
            border: `1px solid ${THEME.border}`, // Dark border
            background: 'rgba(255,255,255,0.8)', // Light background
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)', // Lighter glow
            }}
          />
          <span
            style={{
              fontSize: '12px',
              color: THEME.sub, // Dark subtext
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          >
            {isAllActive
              ? 'Viewing Full Archive'
              : `Filtering by ${selected.length} Sector${selected.length > 1 ? 's' : ''}`}
          </span>
        </motion.div>
      </div>

      {/* --- THE NEBULA DECK --- */}
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: THEME.panelBg, // Light panel
          backdropFilter: 'blur(40px)', // Heavy frost
          borderRadius: '24px',
          border: `1px solid ${THEME.border}`, // Dark border
          padding: 'clamp(16px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(0,0,0,0.05)', // Lighter shadows
          position: 'relative',
        }}
      >
        {/* Noise Texture Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundSize: '100px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* 1. THE "ALL" PRISM (Master Control) */}
          <motion.button
            onClick={toggleAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: isAllActive ? '#000000' : 'rgba(255,255,255,0.8)',
              color: isAllActive ? '#FFFFFF' : THEME.text,
              boxShadow: isAllActive ? '0 0 25px rgba(0,0,0,0.2)' : 'none',
            }}
            style={{
              border: `1px solid ${isAllActive ? '#000000' : THEME.border}`, // Dark border
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-sora), sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '2px',
                background: isAllActive ? '#FFF' : '#000',
                transform: 'rotate(45deg)',
              }}
            />
            All
          </motion.button>

          {/* Divider */}
          {availableCategories.length > 0 && (
            <div
              style={{
                width: '1px',
                height: '40px',
                background: THEME.border,
                margin: '0 8px',
              }}
            />
          )}

          {/* 2. CATEGORY BUTTONS */}
          {availableCategories.map((cat) => {
            const isActive = selected.includes(cat);
            const color = getCategoryColor(cat) || '#666666';

            return (
              <motion.button
                key={cat}
                onClick={() => toggleCategory(cat)}
                whileHover={{ scale: 1.05, borderColor: color }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  backgroundColor: isActive ? `${color}15` : 'rgba(255,255,255,0.8)',
                  borderColor: isActive ? color : THEME.border, // Dark border
                  boxShadow: isActive
                    ? `0 0 20px -5px ${color}40, inset 0 0 10px ${color}10`
                    : 'none',
                }}
                style={{
                  color: isActive ? THEME.text : THEME.sub, // Dark text
                  borderRadius: '12px',
                  border: '1px solid transparent', // handled by animate
                  padding: '12px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sora), sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* The "Light" Indicator */}
                <motion.div
                  animate={{
                    backgroundColor: isActive ? color : 'rgba(0,0,0,0.2)',
                    scale: isActive ? 1.2 : 1,
                  }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                  }}
                />
                {cat}

                {/* Active Gloss Shine */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
