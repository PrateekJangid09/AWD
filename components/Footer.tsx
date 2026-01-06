'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- STYLES ---
const sectionStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#FFFFFF',
  color: '#111',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderTop: '2px solid #111',
  overflow: 'hidden',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1400,
  display: 'flex',
  flexDirection: 'column',
};

const topRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  borderBottom: '2px solid #111',
};

const columnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
  padding: '60px 40px',
  borderRight: '1px solid #E5E5E5',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#111',
  fontSize: 16,
  fontWeight: 500,
  position: 'relative',
  width: 'fit-content',
  cursor: 'pointer',
};

// --- MAIN FOOTER ---
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const accentColor = '#CCFF00';

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
    <footer style={sectionStyle}>
      <div style={containerStyle}>
        {/* 1. LINKS GRID */}
        <div style={topRowStyle}>
          <FooterColumn title="Discover" links={col1Links} accent={accentColor} />
          <FooterColumn title="Submit" links={col2Links} accent={accentColor} />
          <FooterColumn title="Company" links={col3Links} accent={accentColor} />

          {/* Community Column */}
          <div style={{ ...columnStyle, borderRight: 'none', minWidth: 260 }}>
            <h4
              style={{
                margin: 0,
                fontSize: 14,
                color: '#888',
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
              <SocialSticker label="TW" href="https://twitter.com" />
              <SocialSticker label="IG" href="https://instagram.com" />
              <SocialSticker label="LN" href="https://linkedin.com" />
              <SocialSticker label="YT" href="https://youtube.com" />
            </div>
            <p
              style={{
                fontSize: 14,
                color: '#666',
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
          <BrandText text="AllWebsites.Design" />
        </div>

        {/* 3. BOTTOM BAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px 40px 40px 40px',
            fontSize: 13,
            color: '#888',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>© {currentYear} AllWebsites.Design. Curated in California.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy" style={{ textDecoration: 'none', color: '#555' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: '#555' }}>
              Terms of Service
            </Link>
            <Link href="/sitemap.xml" style={{ textDecoration: 'none', color: '#555' }}>
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
}: {
  title: string;
  links: FooterColumnLink[];
  accent: string;
}) {
  return (
    <div style={columnStyle}>
      <h4
        style={{
          margin: 0,
          fontSize: 14,
          color: '#888',
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
          <HoverLink key={link.label} text={link.label} href={link.href} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function HoverLink({ text, href, accent }: { text: string; href: string; accent: string }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={linkStyle}
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

function SocialSticker({ label, href }: { label: string; href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        scale: 1.1,
        rotate: Math.random() * 10 - 5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
      }}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: '#111',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        border: '2px solid #111',
        textDecoration: 'none',
      }}
    >
      {label}
    </motion.a>
  );
}

function BrandText({ text }: { text: string }) {
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
        color: '#111',
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

