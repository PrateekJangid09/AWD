'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

const defaultStyles = {
    fontFamily: `"Sora", system-ui, sans-serif`,
  color: '#FFFFFF',
};

interface ManifestoProps {
  badge?: string;
  title?: string;
  paragraph1?: string;
  paragraph2?: string;
  highlightColor?: string;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
}

export default function Manifesto({
  badge = '01 — THE MISSION',
  title = 'The internet is noisy. We curate the signal.',
  paragraph1 = 'Designers spend hours scrolling through generic templates and mediocre portfolios. We built AllWebsites to solve the discovery problem.',
  paragraph2 = "We believe inspiration should be efficient. That's why we manually review every single submission, rejecting 95% of sites to ensure you only see the world-class 5%.",
  highlightColor = '#FFFFFF',
  borderColor = '#222222',
  bgColor = '#050505',
  textColor = '#FFFFFF',
}: ManifestoProps) {
  const styles = {
    container: {
      ...defaultStyles,
      width: '100%',
      backgroundColor: bgColor,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '120px 20px',
      borderBottom: `1px solid ${borderColor}`,
    },
    content: {
      width: '100%',
      maxWidth: '1200px',
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '40px',
    },
    left: {
      position: 'relative' as const,
    },
    stickyLabel: {
      position: 'sticky' as const,
      top: '40px',
      fontFamily: 'monospace',
      fontSize: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      color: highlightColor,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    line: { width: '20px', height: '1px', background: highlightColor },
    right: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '40px',
    },
    h2: {
      fontSize: 'clamp(32px, 4vw, 56px)',
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '-1.5px',
      color: textColor,
      margin: 0,
    },
    p: {
      fontSize: '18px',
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.7)',
      maxWidth: '650px',
    },
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        @media (max-width: 800px) {
          .manifesto-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .sticky-label {
            position: relative !important;
            top: 0 !important;
            margin-bottom: 20px;
          }
        }
      `}</style>

      <div className="manifesto-grid" style={styles.content}>
        {/* Left: The "Tag" */}
        <div style={styles.left}>
          <div className="sticky-label" style={styles.stickyLabel}>
            <span style={styles.line} /> {badge}
          </div>
        </div>

        {/* Right: The "Story" */}
        <div style={styles.right}>
          <motion.h2
            style={styles.h2}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p style={styles.p}>{paragraph1}</p>
            <p
              style={{
                ...styles.p,
                borderLeft: `2px solid ${highlightColor}`,
                paddingLeft: '24px',
              }}
            >
              {paragraph2}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

