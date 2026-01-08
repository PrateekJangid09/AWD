'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultStyles = {
  fontFamily: `"Sora", system-ui, sans-serif`,
  color: '#FFFFFF',
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  badge?: string;
  title?: string;
  items?: FaqItem[];
  highlightColor?: string;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: 'What is AllWebsites.Design?',
    answer:
      'AllWebsites.Design is a curated archive of high-quality marketing sites, product pages, and landing pages from across the web—built to give designers and founders fast, trustworthy inspiration.',
  },
  {
    question: 'How do you choose which sites get included?',
    answer:
      'Every site is manually reviewed. We look for clear hierarchy, strong visual systems, thoughtful storytelling, and real product/brand clarity. Most submissions do not get accepted—we bias toward signal over volume.',
  },
  {
    question: 'Can I submit my own website?',
    answer:
      'Yes. We periodically open submissions and also add standout sites we discover during our own research. A submission form will be linked from the homepage when open.',
  },
  {
    question: 'Do you only feature SaaS websites?',
    answer:
      'No. While SaaS and product companies are a big focus, we also feature agencies, AI tools, fintech, ecommerce, and other categories where design craft really matters.',
  },
];

export default function FaqSection({
  badge = '04 — FAQs',
  title = 'Answers to common questions.',
  items = DEFAULT_ITEMS,
  highlightColor = '#CCFF00',
  borderColor = '#222222',
  bgColor = '#050505',
  textColor = '#FFFFFF',
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

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
      flexDirection: 'column' as const,
      gap: '12px',
    },
    line: { width: '20px', height: '1px', background: highlightColor },
    h2: {
      fontSize: 'clamp(28px, 3.5vw, 40px)',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-1px',
      color: textColor,
      margin: 0,
    },
    right: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    item: {
      borderTop: `1px solid ${borderColor}`,
      padding: '18px 0',
      cursor: 'pointer',
    },
    questionRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    question: {
      fontSize: '17px',
      fontWeight: 500,
      color: textColor,
    },
    answer: {
      fontSize: '15px',
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.7)',
      marginTop: '8px',
      maxWidth: '640px',
    },
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        @media (max-width: 800px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .sticky-label-faq {
            position: relative !important;
            top: 0 !important;
            margin-bottom: 8px;
          }
        }
      `}</style>

      <div className="faq-grid" style={styles.content}>
        {/* Left label / intro */}
        <div style={styles.left}>
          <div className="sticky-label-faq" style={styles.stickyLabel}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={styles.line} /> {badge}
            </div>
            <h2 style={styles.h2}>{title}</h2>
          </div>
        </div>

        {/* Right: FAQ list */}
        <div style={styles.right}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                style={styles.item}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div style={styles.questionRow}>
                  <span style={styles.question}>{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '999px',
                      border: `1px solid ${highlightColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: highlightColor,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </motion.span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p style={styles.answer}>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

