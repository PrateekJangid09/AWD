'use client';

import * as React from 'react';
import Link from 'next/link';

/**
 * QUANTUM FLOATING DOCK HEADER (2026 Edition - Mobile Optimized)
 */

export interface NavItem {
  title: string;
  link: string;
}

export interface QuantumHeaderProps {
  logoText?: string;
  badgeText?: string;
  navItems?: NavItem[];
  ctaText?: string;
  ctaLink?: string;
  glassTint?: string;
  textColor?: string;
  accentColor?: string;
  variant?: 'default' | 'slug';
}

export default function Header(props: QuantumHeaderProps) {
  const {
    logoText = 'ALLWEBSITES',
    badgeText = '',
    navItems = [
      { title: 'Browse', link: '/' },
      { title: 'Website Templates', link: '/website-templates-for-framer' },
      { title: 'About', link: '/about' },
    ],
    ctaText = 'Try Web‑to‑Figma',
    ctaLink = 'https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design',
    glassTint = 'rgba(255, 255, 255, 0.85)',
    textColor = '#050505',
    accentColor = '#FF3B30',
    variant = 'default',
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const handleScroll = () =>
      setScrolled(variant === 'slug' || window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    const handleResize = () => setIsMobile(window.innerWidth <= 810);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, [variant]);

  const dockStyle: React.CSSProperties = {
    position: 'fixed',
    top: isMobile ? '16px' : scrolled ? '16px' : '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: isMobile ? 'calc(100% - 32px)' : 'auto',
    minWidth: isMobile ? 'unset' : '600px',
    maxWidth: '1200px',
    height: '64px',
    backgroundColor: glassTint,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: '20px',
    border: `1px solid ${textColor}15`,
    boxShadow: scrolled
      ? '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1) inset'
      : '0 10px 30px -10px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.2) inset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    gap: '24px',
    zIndex: 1000,
    fontFamily: '"Poppins", sans-serif',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '20px',
    backgroundColor: textColor,
    opacity: 0.1,
    display: isMobile ? 'none' : 'block',
  };

  const logoGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const badgeStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: accentColor,
    color: '#FFF',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: badgeText ? 'block' : 'none',
  };

  const navStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '100%',
  };

  const itemStyle = (i: number): React.CSSProperties => ({
    position: 'relative',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: textColor,
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: hoveredIndex === i ? 1 : 0.6,
    transition: 'opacity 0.3s ease',
  });

  const dotStyle = (isActive: boolean): React.CSSProperties => ({
    position: 'absolute',
    bottom: '0px',
    left: '50%',
    transform: isActive
      ? 'translateX(-50%) scale(1)'
      : 'translateX(-50%) scale(0)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: accentColor,
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  });

  const ctaStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: textColor,
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    display: isMobile ? 'none' : 'block',
    transition: 'transform 0.2s ease',
    whiteSpace: 'nowrap',
  };

  const isExternalCta = ctaLink.startsWith('http');

  return (
    <>
      <div style={dockStyle}>
        <Link href="/" style={logoGroupStyle}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '18px',
              color: textColor,
              letterSpacing: '-0.5px',
            }}
          >
            {logoText}
          </span>
          {badgeText ? <span style={badgeStyle}>{badgeText}</span> : null}
        </Link>

        <div style={dividerStyle} />

        <nav style={navStyle}>
          {navItems.map((item, i) => {
            const isExternal = item.link.startsWith('http');
            const content = (
              <>
                {item.title}
                <div style={dotStyle(hoveredIndex === i)} />
              </>
            );
            const style = itemStyle(i);
            if (isExternal) {
              return (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={style}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {content}
                </a>
              );
            }
            return (
              <Link
                key={i}
                href={item.link}
                style={style}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {!isMobile ? <div style={dividerStyle} /> : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {isExternalCta ? (
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              style={ctaStyle}
            >
              {ctaText}
            </a>
          ) : (
            <Link href={ctaLink} style={ctaStyle}>
              {ctaText}
            </Link>
          )}

          {isMobile ? (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: `${textColor}08`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
              }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <div
                style={{
                  position: 'relative',
                  width: '18px',
                  height: '14px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: isOpen ? '6px' : '0',
                    width: '100%',
                    height: '2px',
                    background: textColor,
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                    transition: '0.3s',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    width: '100%',
                    height: '2px',
                    background: textColor,
                    opacity: isOpen ? 0 : 1,
                    transition: '0.3s',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: isOpen ? '6px' : '0',
                    width: '100%',
                    height: '2px',
                    background: textColor,
                    transform: isOpen ? 'rotate(-45deg)' : 'rotate(0)',
                    transition: '0.3s',
                  }}
                />
              </div>
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Full Screen Menu */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: glassTint,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          pointerEvents: isOpen ? 'all' : 'none',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {navItems.map((item, i) => {
          const isExternal = item.link.startsWith('http');
          const linkStyle: React.CSSProperties = {
            fontSize: '24px',
            fontWeight: 600,
            color: textColor,
            textDecoration: 'none',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: `all 0.4s ease ${i * 0.1}s`,
          };
          if (isExternal) {
            return (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                style={linkStyle}
              >
                {item.title}
              </a>
            );
          }
          return (
            <Link
              key={i}
              href={item.link}
              onClick={() => setIsOpen(false)}
              style={linkStyle}
            >
              {item.title}
            </Link>
          );
        })}
        {isExternalCta ? (
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: '20px',
              padding: '16px 32px',
              backgroundColor: textColor,
              color: '#FFF',
              borderRadius: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.4s ease 0.3s',
            }}
          >
            {ctaText}
          </a>
        ) : (
          <Link
            href={ctaLink}
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: '20px',
              padding: '16px 32px',
              backgroundColor: textColor,
              color: '#FFF',
              borderRadius: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.4s ease 0.3s',
            }}
          >
            {ctaText}
          </Link>
        )}
      </div>
    </>
  );
}
