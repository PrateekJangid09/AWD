'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

const defaultStyles = {
    fontFamily: `"Sora", system-ui, sans-serif`,
  color: '#FFFFFF',
};

interface AllWebsitesAboutProps {
  title?: string;
  missionText?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  section1Title?: string;
  section1Body?: string;
  section2Title?: string;
  section2Body?: string;
  ctaText?: string;
  borderColor?: string;
  bgColor?: string;
  accentColor?: string;
}

export default function AllWebsitesAbout({
  title = 'AllWebsites.Design',
  missionText = 'We curate the internet\'s finest digital experiences. Our mission is to provide designers and developers with a comprehensive resource for design inspiration and best practices.',
  stat1Value = '954+',
  stat1Label = 'Curated Designs',
  stat2Value = '13+',
  stat2Label = 'Categories',
  section1Title = 'What We Do',
  section1Body = 'We carefully curate hero sections and landing pages from top SaaS, agencies, and fintech platforms.',
  section2Title = 'For Designers',
  section2Body = 'Whether you\'re building a new landing page or redesigning an existing site, find the latest trends here.',
  ctaText = 'Explore the Collection on Homepage',
  bgColor = '#050505',
  borderColor = '#222222',
  accentColor = '#444444',
}: AllWebsitesAboutProps) {
  const styles = {
    container: {
      ...defaultStyles,
      width: '100%',
      backgroundColor: bgColor,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '80px 20px 120px',
    },
    bentoGrid: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr 1fr',
      gridTemplateRows: 'auto auto',
      width: '100%',
      maxWidth: '1200px',
      border: `1px solid ${borderColor}`,
      backgroundColor: borderColor,
      gap: '1px',
    },
    cellMain: {
      gridColumn: '1 / span 1',
      gridRow: '1 / span 2',
      backgroundColor: bgColor,
      padding: '60px 40px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      minHeight: '400px',
    },
    cellStat: {
      backgroundColor: bgColor,
      padding: '40px 30px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      gap: '12px',
    },
    cellInfo: {
      backgroundColor: bgColor,
      padding: '40px 30px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    cellCTA: {
      gridColumn: '2 / span 2',
      backgroundColor: bgColor,
      padding: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
    badge: {
      fontFamily: 'monospace',
      fontSize: '12px',
      textTransform: 'uppercase' as const,
      color: accentColor,
      marginBottom: '16px',
      display: 'block',
    },
    h1: {
      fontSize: 'clamp(32px, 3vw, 48px)',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-1px',
      marginBottom: '24px',
      color: '#fff',
    },
    pMain: {
      fontSize: '18px',
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.7)',
      maxWidth: '500px',
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#fff',
      margin: 0,
    },
    pSmall: {
      fontSize: '15px',
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.5)',
      margin: 0,
    },
    statValue: {
      fontSize: '42px',
      fontWeight: 600,
      color: '#fff',
      letterSpacing: '-1px',
    },
    arrow: {
      fontSize: '24px',
      color: accentColor,
    },
  };

  return (
    <div style={styles.container}>
      <div className="bento-grid" style={styles.bentoGrid}>
        {/* 1. Main Mission Cell (Left) */}
        <motion.div
          className="cell-main"
          style={styles.cellMain}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span style={styles.badge}>// Our Mission</span>
            <h1 style={styles.h1}>{title}</h1>
            <p style={styles.pMain}>{missionText}</p>
          </div>
        </motion.div>

        {/* 2. Stat Cell 1 (Top Middle) */}
        <div style={styles.cellStat}>
          <span style={styles.statValue}>{stat1Value}</span>
          <span style={styles.badge}>{stat1Label}</span>
        </div>

        {/* 3. Stat Cell 2 (Top Right) */}
        <div style={styles.cellStat}>
          <span style={styles.statValue}>{stat2Value}</span>
          <span style={styles.badge}>{stat2Label}</span>
        </div>

        {/* 4. Info Cell 1 (Bottom Middle) */}
        <div style={styles.cellInfo}>
          <h3 style={styles.h3}>{section1Title}</h3>
          <p style={styles.pSmall}>{section1Body}</p>
        </div>

        {/* 5. Info Cell 2 (Bottom Right) */}
        <div style={styles.cellInfo}>
          <h3 style={styles.h3}>{section2Title}</h3>
          <p style={styles.pSmall}>{section2Body}</p>
        </div>

        {/* 6. Full Width CTA (Bottom) */}
        <motion.div
          style={styles.cellCTA}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {ctaText}
          </span>
          <span style={styles.arrow}>→</span>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 1px !important;
          }
          .cell-main {
            min-height: auto !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

