'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- STYLES ---
// Styles will be dynamic based on variant

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1400,
  display: 'flex',
  flexDirection: 'column',
};

// Styles will be dynamic based on variant

// Styles will be dynamic based on variant

// Styles will be dynamic based on variant

// --- MAIN FOOTER ---
interface FooterProps {
  variant?: 'default' | 'inverted';
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const accentColor = '#CCFF00';
  
  // Inverted colors for about page
  const isInverted = variant === 'inverted';
  const bgColor = isInverted ? '#050505' : '#FFFFFF';
  const textColor = isInverted ? '#FFFFFF' : '#111';
  const borderColor = isInverted ? '#FFFFFF' : '#111';
  const lightTextColor = isInverted ? '#888' : '#666';
  const linkColor = isInverted ? '#AAA' : '#555';
  const columnBorderColor = isInverted ? 'rgba(255,255,255,0.2)' : '#E5E5E5';

  const col1Links: FooterColumnLink[] = [
    { label: 'Featured', href: '/' },
    { label: 'Trending', href: '/?tab=trending' },
    { label: 'New Arrivals', href: '/?tab=new' },
    { label: 'Collections', href: '/website-templates-for-framer' },
  ];

  const col2Links: FooterColumnLink[] = [
    { label: 'Submit a Site', href: '#submit' },
    { label: 'Pro Membership', href: '/website-templates-for-framer/pricing' },
    { label: 'Guidelines', href: '/about' },
  ];

  const col3Links: FooterColumnLink[] = [
    { label: 'About', href: '/about' },
    { label: 'Manifesto', href: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '/about' },
  ];

  return (
    <footer style={{
      width: '100%',
      backgroundColor: bgColor,
      color: textColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderTop: `2px solid ${borderColor}`,
      overflow: 'hidden',
    }}>
      <div style={containerStyle}>
        {/* 1. LINKS GRID */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
          borderBottom: `2px solid ${borderColor}`,
        }}>
          <FooterColumn title="Discover" links={col1Links} accent={accentColor} isInverted={isInverted} textColor={textColor} lightTextColor={lightTextColor} linkColor={linkColor} columnBorderColor={columnBorderColor} />
          <FooterColumn title="Submit" links={col2Links} accent={accentColor} isInverted={isInverted} textColor={textColor} lightTextColor={lightTextColor} linkColor={linkColor} columnBorderColor={columnBorderColor} />
          <FooterColumn title="Company" links={col3Links} accent={accentColor} isInverted={isInverted} textColor={textColor} lightTextColor={lightTextColor} linkColor={linkColor} columnBorderColor={columnBorderColor} />

          {/* Community Column */}
          <div style={{
            flex: 1,
            minWidth: 260,
            padding: '60px 40px',
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            <h4
              style={{
                margin: 0,
                fontSize: 14,
                color: lightTextColor,
                textTransform: 'uppercase',
              }}
            >
              Community
            </h4>
            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <SocialSticker label="TW" href="https://twitter.com" isInverted={isInverted} />
              <SocialSticker label="IG" href="https://instagram.com" isInverted={isInverted} />
              <SocialSticker label="LN" href="https://linkedin.com" isInverted={isInverted} />
              <SocialSticker label="YT" href="https://youtube.com" isInverted={isInverted} />
            </div>
            <p
              style={{
                fontSize: 14,
                color: lightTextColor,
                lineHeight: 1.5,
                marginTop: 'auto',
              }}
            >
              Join 15,000+ designers building the future of the web.
            </p>
          </div>
        </div>

        {/* 2. MASSIVE BRAND TEXT (STATIC) */}
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            padding: '60px 20px',
            position: 'relative',
          }}
        >
          <BrandText text="AllWebsites.Design" textColor={textColor} />
        </div>

        {/* 3. BOTTOM BAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px 40px 40px 40px',
            fontSize: 13,
            color: lightTextColor,
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>© {currentYear} AllWebsites.Design. Curated in California.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy" style={{ textDecoration: 'none', color: linkColor }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: linkColor }}>
              Terms of Service
            </Link>
            <Link href="/sitemap.xml" style={{ textDecoration: 'none', color: linkColor }}>
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- SUB-COMPONENTS ---

interface FooterColumnLink {
  label: string;
  href: string;
}

function FooterColumn({
  title,
  links,
  accent,
  isInverted,
  textColor,
  lightTextColor,
  linkColor,
  columnBorderColor,
}: {
  title: string;
  links: FooterColumnLink[];
  accent: string;
  isInverted: boolean;
  textColor: string;
  lightTextColor: string;
  linkColor: string;
  columnBorderColor: string;
}) {
  return (
    <div style={{
      flex: 1,
      minWidth: 200,
      padding: '60px 40px',
      borderRight: `1px solid ${columnBorderColor}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    }}>
      <h4
        style={{
          margin: 0,
          fontSize: 14,
          color: lightTextColor,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h4>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {links.map((link) => (
          <HoverLink key={link.label} text={link.label} href={link.href} accent={accent} textColor={textColor} />
        ))}
      </div>
    </div>
  );
}

function HoverLink({ text, href, accent, textColor }: { text: string; href: string; accent: string; textColor: string }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none',
        color: textColor,
        fontSize: 16,
        fontWeight: 500,
        position: 'relative',
        width: 'fit-content',
        cursor: 'pointer',
      }}
    >
      {text}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: hover ? '100%' : 0 }}
        style={{
          height: 2,
          backgroundColor: accent,
          marginTop: 2,
          borderRadius: 2,
        }}
      />
    </motion.a>
  );
}

function SocialSticker({ label, href, isInverted }: { label: string; href: string; isInverted: boolean }) {
  const bgColor = isInverted ? '#FFFFFF' : '#111';
  const textColor = isInverted ? '#111' : '#FFF';
  const borderColor = isInverted ? '#FFFFFF' : '#111';
  
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        scale: 1.1,
        rotate: 3,
        boxShadow: isInverted ? '0 10px 20px rgba(255,255,255,0.15)' : '0 10px 20px rgba(0,0,0,0.15)',
      }}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        border: `2px solid ${borderColor}`,
        textDecoration: 'none',
      }}
    >
      {label}
    </motion.a>
  );
}

function BrandText({ text, textColor }: { text: string; textColor: string }) {
  return (
    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{
        fontSize: '5.5vw',
        lineHeight: 0.85,
        fontWeight: 900,
        letterSpacing: '-0.03em',
        margin: 0,
        color: textColor,
        textAlign: 'center',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      {text}
    </motion.h1>
  );
}

