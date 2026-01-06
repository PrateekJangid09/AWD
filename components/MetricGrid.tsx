'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform, MotionValue } from 'framer-motion';

interface MetricGridProps {
  totalWebsites: number;
  totalCategories: number;
}

const sectionStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#111111',
  display: 'flex',
  justifyContent: 'center',
  borderTop: '2px solid #111',
  borderBottom: '2px solid #111',
};

const gridStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1400,
  display: 'flex',
  flexWrap: 'wrap',
};

export default function MetricGrid({ totalWebsites, totalCategories }: MetricGridProps) {
  const stat1_num = `${totalWebsites.toLocaleString()}+`;
  const stat1_label = 'Curated Websites';

  const stat2_num = `${totalCategories}`;
  const stat2_label = 'Design Categories';

  const stat3_num = '1000+';
  const stat3_label = 'Designers Community';
  const accentColor = '#CCFF00';

  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section style={sectionStyle}>
      <div
        style={{
          ...gridStyle,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <StatBlock
          num={stat1_num}
          label={stat1_label}
          borderRight={!isMobile}
          borderBottom={isMobile}
          accent={accentColor}
          delay={0}
          index={0}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          isMobile={isMobile}
        />
        <StatBlock
          num={stat2_num}
          label={stat2_label}
          borderRight={!isMobile}
          borderBottom={isMobile}
          accent={accentColor}
          delay={0.2}
          index={1}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          isMobile={isMobile}
        />
        <StatBlock
          num={stat3_num}
          label={stat3_label}
          borderRight={false}
          borderBottom={false}
          accent={accentColor}
          delay={0.4}
          showSticker
          index={2}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          isMobile={isMobile}
        />
      </div>
    </section>
  );
}

interface StatBlockProps {
  num: string;
  label: string;
  borderRight: boolean;
  borderBottom: boolean;
  accent: string;
  delay: number;
  showSticker?: boolean;
  index: number;
  activeIndex: number | null;
  setActiveIndex: (idx: number | null) => void;
  isMobile: boolean;
}

function StatBlock({ num, label, borderRight, borderBottom, accent, delay, showSticker, index, activeIndex, setActiveIndex, isMobile }: StatBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const rawNumber = parseFloat(num.replace(/[^0-9.]/g, '')) || 0;
  const suffix = num.replace(/[0-9.]/g, '') || '';

  const count = useSpring(0, { stiffness: 80, damping: 20 });
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => count.set(rawNumber), delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, rawNumber, delay, count]);

  return (
    <motion.div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 300,
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderRight: borderRight ? '2px solid #111' : 'none',
        borderBottom: borderBottom ? '2px solid #111' : 'none',
        backgroundColor: isHovered ? '#FFFFFF' : '#111111',
        color: isHovered ? '#111111' : '#FFFFFF',
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        setActiveIndex(index);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveIndex(null);
      }}
    >
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: isHovered ? '#F0F0F0' : '#222222',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 40,
          transform: 'rotate(-2deg)',
          transition: 'background-color 0.3s',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 'clamp(64px, 8vw, 120px)',
          fontWeight: 800,
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        <Counter value={rounded} />
        <span>{suffix}</span>
      </div>

      {showSticker && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 80,
            height: 80,
            opacity: isHovered ? 1 : 0.8,
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path
              id="circlePath"
              d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
              fill="transparent"
            />
            <text fill={isHovered ? '#111' : accent}>
              <textPath
                href="#circlePath"
                startOffset="0"
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                }}
              >
                • Verified • Community • Verified • Community
              </textPath>
            </text>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

function Counter({ value }: { value: MotionValue<number> }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    return value.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest);
      }
    });
  }, [value]);

  return <span ref={ref} />;
}

