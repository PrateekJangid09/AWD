'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MACRO_CATEGORIES, slugifyCategory } from '@/lib/categories';

interface HeaderProps {
  variant?: 'default' | 'slug';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrowseDropdownOpen, setIsBrowseDropdownOpen] = useState(false);

  useEffect(() => {
    if (variant === 'slug') {
      // For slug pages, always show the dark bar
      setIsScrolled(true);
      return;
    }
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  const ACCENT_COLOR = '#CCFF00';
  const isSlugPage = variant === 'slug';

  return (
    <header 
      className="fixed top-0 left-0 right-0 w-full z-[1000] flex justify-center px-5"
    >
      <nav
        className={`
          w-full max-w-[1400px] flex items-center justify-between
          px-8 transition-all duration-300
          ${isSlugPage 
            ? 'h-[72px] bg-[#0F0F0F] rounded-b-2xl border-b border-white/5' 
            : isScrolled || isBrowseDropdownOpen 
              ? 'h-[72px] bg-black/85 backdrop-blur-xl border-b border-white/10 rounded-b-2xl' 
              : 'h-[88px] bg-transparent border-b border-transparent rounded-b-2xl'
          }
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white no-underline z-[1001]"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
              src="/Vector.png"
              alt="AllWebsites.Design Logo"
              width={32}
              height={32}
              className="object-contain w-auto h-auto"
              priority
            />
          </div>
          ALLWEBSITES
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {/* Browse Templates with Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsBrowseDropdownOpen(true)}
            onMouseLeave={() => setIsBrowseDropdownOpen(false)}
          >
            <Link
              href="/"
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${isBrowseDropdownOpen 
                  ? 'text-white bg-white/15' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Browse Templates
              <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {isBrowseDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 min-w-[320px] p-3 bg-black/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-[100]"
                >
                  <Link
                    href="/c"
                    className="block px-3 py-2 mb-1 text-sm font-semibold text-white hover:bg-white/10 rounded-md transition-colors border-b border-white/10 pb-2"
                  >
                    All Categories
                  </Link>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {MACRO_CATEGORIES.filter(cat => cat !== 'Browse All').map((category) => (
                      <Link
                        key={category}
                        href={`/c/${slugifyCategory(category)}`}
                        className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Link
            href="/website-templates-for-framer"
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            Website Templates
          </Link>
          
          <Link
            href="/about"
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            About
          </Link>
          
          {/* Desktop CTA */}
          <Link 
            href="https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design"
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            Try Web‑to‑Figma
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-white z-[1001]"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isMobileMenuOpen 
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[80px] left-0 w-full h-screen bg-black z-[999] flex flex-col p-10 gap-6"
          >
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-white"
            >
              Browse Templates
            </Link>
            <Link 
              href="/website-templates-for-framer" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-white"
            >
              Website Templates
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-white"
            >
              About
            </Link>

            <div className="h-px bg-white/10 my-4" />

            <Link 
              href="https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 text-center font-bold uppercase rounded-lg"
              style={{ background: ACCENT_COLOR, color: '#000' }}
            >
              Try Web‑to‑Figma
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
