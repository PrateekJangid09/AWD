'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MACRO_CATEGORIES, slugifyCategory } from '@/lib/categories';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="mx-auto max-w-7xl">
        <div 
          className={`relative overflow-visible transition-all duration-500 ${
            isScrolled ? 'rounded-3xl' : 'rounded-4xl'
          }`}
          style={{ background: 'transparent' }}
        >
          
          {/* Content */}
          <div className="relative flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo and Title */}
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-3 lg:gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-2xl p-2 -m-2"
              aria-label="Go to FigFiles homepage"
            >
              <div 
                className={`flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center transition-all duration-300 ${
                  isScrolled ? 'scale-95' : 'scale-100'
                }`}
                style={{ borderRadius: '16px' }}
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold brand-title transition-colors duration-200">
                  FigFiles
                </h1>
                <p className="text-xs sm:text-sm text-foreground/70 hidden sm:block font-medium">Design inspiration & resources</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 sm:gap-4 text-foreground">
              <Link href="/" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium transition-colors inline-flex items-center">
                Browse Templates
              </Link>
              <Link href="#resources" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium transition-colors">
                Resources
              </Link>
              <a 
                href="https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-black font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #FFD769 0%, #FFA200 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 170, 0, 0.6)',
                  borderRadius: '50px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 18px rgba(255,162,0,0.35)'
                }}
              >
                Try Web‑to‑Figma
              </a>
              <button
                onClick={() => {
                  const root = document.documentElement;
                  const isLight = root.classList.toggle('theme-light');
                  try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e) {}
                }}
                className="ml-2 px-3 py-2 text-foreground/80 hover:text-foreground font-medium transition-colors"
                aria-label="Toggle theme"
              >
                Toggle theme
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/20 px-4 py-4">
              <nav className="flex flex-col gap-2 text-foreground">
                <Link 
                  href="/" 
                  className="px-4 py-3 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-lg hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Templates
                </Link>
                <Link 
                  href="#resources" 
                  className="px-4 py-3 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-lg hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Resources
                </Link>
                <a 
                  href="https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 text-black font-semibold transition-all duration-300 hover:scale-105 rounded-lg text-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFD769 0%, #FFA200 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 170, 0, 0.6)',
                    borderRadius: '50px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 18px rgba(255,162,0,0.35)'
                  }}
                >
                  Try Web‑to‑Figma
                </a>
                <button
                  onClick={() => {
                    const root = document.documentElement;
                    const isLight = root.classList.toggle('theme-light');
                    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e) {}
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-lg hover:bg-white/5 text-left"
                  aria-label="Toggle theme"
                >
                  Toggle theme
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}