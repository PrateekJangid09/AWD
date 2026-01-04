'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MACRO_CATEGORIES, slugifyCategory } from '@/lib/categories';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrowseDropdownOpen, setIsBrowseDropdownOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check initial theme
    const checkTheme = () => {
      const root = document.documentElement;
      setIsLightMode(root.classList.contains('theme-light'));
    };

    checkTheme();
    window.addEventListener('scroll', handleScroll);
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="mx-auto max-w-7xl">
        <div 
          className={`relative overflow-visible transition-all duration-500 ${
            isScrolled ? 'rounded-3xl' : 'rounded-4xl'
          } bg-background header-container ${isScrolled ? 'border border-white/10' : 'border border-white/10'} shadow-[0_4px_20px_rgba(0,0,0,0.15)]`}
        >
          
          {/* Content */}
          <div className="relative flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo and Title */}
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center gap-2 sm:gap-3 lg:gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-2xl p-2 -m-2"
              aria-label="Go to AllWebsites.Design homepage"
            >
              <div 
                className={`flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center transition-all duration-300 ${
                  isScrolled ? 'scale-95' : 'scale-100'
                }`}
                style={{ borderRadius: '16px' }}
              >
                <Image
                  src={isLightMode ? "/logo-light.png" : "/logo.png"}
                  alt="AllWebsites.Design Logo"
                  width={48}
                  height={48}
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain rounded-2xl"
                  priority
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold brand-title transition-colors duration-200">
                  AllWebsites.Design
                </h1>
                <p className="text-xs sm:text-sm text-foreground/70 hidden sm:block font-medium">Design inspiration & resources</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 justify-end items-center gap-2 sm:gap-4 text-foreground min-w-0">
              <div 
                className="relative"
                onMouseEnter={() => setIsBrowseDropdownOpen(true)}
                onMouseLeave={() => setIsBrowseDropdownOpen(false)}
              >
                <Link 
                  href="/" 
                  className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium transition-colors inline-flex items-center rounded-xl hover:bg-white/10"
                >
                  Browse Templates
                  <svg className="ml-1.5 h-4 w-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                
                {/* Dropdown Menu */}
                {isBrowseDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-96 z-50">
                    <div className="bg-background border border-white/10 rounded-xl shadow-xl overflow-hidden">
                      <div className="py-2 grid grid-cols-2">
                      {MACRO_CATEGORIES.filter(cat => cat !== 'Browse All').map((category) => (
                        <Link
                          key={category}
                          href={`/c/${slugifyCategory(category)}`}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          {category}
                        </Link>
                      ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/website-templates-for-framer" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-xl hover:bg-white/10">
                Website Templates
              </Link>
              <Link href="#resources" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-xl hover:bg-white/10">
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
                  setIsLightMode(isLight);
                  try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e) {}
                }}
                className="ml-2 p-2.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-white/10 transition-all"
                aria-label="Toggle theme"
              >
                {isLightMode ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
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
                  href="/website-templates-for-framer" 
                  className="px-4 py-3 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-lg hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Website Templates
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
                    setIsLightMode(isLight);
                    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e) {}
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-foreground/80 hover:text-foreground font-medium transition-colors rounded-lg hover:bg-white/5 text-left flex items-center gap-3"
                  aria-label="Toggle theme"
                >
                  {isLightMode ? (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}