'use client';

import React, { useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- STYLES ---
const containerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  width: '100%',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  padding: '0 20px',
};

const navBarStyle: CSSProperties = {
  width: '100%',
  maxWidth: 1400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(5, 5, 5, 0.7)',
  backdropFilter: 'blur(16px)',
  borderRadius: '0 0 16px 16px',
  padding: '0 32px',
  transition: 'all 0.4s ease',
};

const linkGroupStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const mobileMenuStyle: CSSProperties = {
  position: 'fixed',
  top: 80,
  left: 0,
  width: '100%',
  height: '100vh',
  backgroundColor: '#050505',
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  padding: '40px 24px',
  gap: 24,
};

const ACCENT_COLOR = '#CCFF00';

export default function HeaderFramer() {
  // Links mapped to real routes
  const logoText = 'ALLWEBSITES';
  const link1 = 'Browse Templates';
  const link1Url = '/';
  const link2 = 'Website Templates';
  const link2Url = '/website-templates-for-framer';
  const link3 = 'About';
  const link3Url = '/about';
  const ctaText = 'Try Web‑to‑Figma';
  const ctaLink =
    'https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design';

  // --- SCROLL & RESIZE LOGIC ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    handleScroll();
    handleResize();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const barVariants = {
    top: {
      height: 88,
      backgroundColor: 'rgba(5, 5, 5, 0)',
      backdropFilter: 'blur(0px)',
      borderColor: 'rgba(255,255,255,0)',
    },
    scrolled: {
      height: 72,
      backgroundColor: 'rgba(5, 5, 5, 0.85)',
      backdropFilter: 'blur(16px)',
      borderColor: 'rgba(255,255,255,0.08)',
    },
  };

  return (
    <div style={containerStyle}>
      <motion.nav
        initial="top"
        animate={isScrolled || menuOpen ? 'scrolled' : 'top'}
        variants={barVariants}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={navBarStyle}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              background: ACCENT_COLOR,
              borderRadius: 2,
            }}
          />
          {logoText}
        </Link>

        {/* DESKTOP LINKS */}
        {!isMobile && (
          <div style={linkGroupStyle}>
            <GlowLink text={link1} href={link1Url} />
            <GlowLink text={link2} href={link2Url} />
            <GlowLink text={link3} href={link3Url} />
          </div>
        )}

        {/* DESKTOP CTA */}
        {!isMobile && (
          <Link href={ctaLink} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 24px',
                backgroundColor: '#FFF',
                color: '#000',
                border: 'none',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255,255,255,0.2)',
              }}
            >
              {ctaText}
            </motion.button>
          </Link>
        )}

        {/* MOBILE HAMBURGER */}
        {isMobile && (
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: 'pointer', zIndex: 1001, padding: 8 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </div>
        )}
      </motion.nav>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={mobileMenuStyle}
          >
            <MobileLink text={link1} href={link1Url} index={0} />
            <MobileLink text={link2} href={link2Url} index={1} />
            <MobileLink text={link3} href={link3Url} index={2} />

            <div
              style={{
                height: 1,
                background: 'rgba(255,255,255,0.1)',
                margin: '20px 0',
              }}
            />

            <Link href={ctaLink} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
              <div
                style={{
                  width: '100%',
                  padding: 16,
                  background: ACCENT_COLOR,
                  color: '#000',
                  textAlign: 'center',
                  borderRadius: 8,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {ctaText}
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface GlowLinkProps {
  text: string;
  href: string;
}

function GlowLink({ text, href }: GlowLinkProps) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none',
        position: 'relative',
        padding: '8px 16px',
        color: hover ? '#FFF' : 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: 500,
        transition: 'color 0.2s',
      }}
    >
      {text}
      {hover && (
        <motion.div
          layoutId="nav-glow"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            zIndex: -1,
            boxShadow: `0 0 20px -5px ${ACCENT_COLOR}40`,
          }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}

interface MobileLinkProps {
  text: string;
  href: string;
  index: number;
}

function MobileLink({ text, href, index }: MobileLinkProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        textDecoration: 'none',
        color: '#FFF',
        fontSize: 24,
        fontWeight: 700,
      }}
    >
      {text}
    </motion.a>
  );
}
