'use client';

import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';
import { useState } from 'react';

interface WebsiteInfoCardProps {
  website: Website;
}

export default function WebsiteInfoCard({ website }: WebsiteInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const categoryColor = getCategoryColor(website.displayCategory || website.category);
  const displayCategory = website.displayCategory || website.category;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-foreground/5 border border-white/20">
      <div className="relative p-8 space-y-6">
        {/* Category Badge */}
        <div className="inline-flex">
          <div
            className="px-4 py-2 rounded-full backdrop-blur-sm border border-white/30 text-sm font-semibold text-white shadow-lg"
            style={{ backgroundColor: `${categoryColor}DD` }}
          >
            {displayCategory}
          </div>
        </div>

        {/* Website Name */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
            {website.name}
          </h1>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {website.description}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 py-4 border-y border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-foreground/80 font-medium">Live Site</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm text-foreground/80 font-medium">Featured</span>
          </div>
        </div>

        {/* Import to Figma Button - styled like header "Try Web‑to‑Figma" */}
        <a
          href="https://www.figma.com/community/plugin/1297530151115228662/web-to-figma-convert-any-website-or-html-code-to-design"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Import to Figma"
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 text-black font-semibold transition-all duration-300 hover:scale-105 focus-visible:outline-none"
          style={{
            background: 'linear-gradient(135deg, #FFD769 0%, #FFA200 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 170, 0, 0.6)',
            borderRadius: '50px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 18px rgba(255,162,0,0.35)'
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 30 30" fill="currentColor" aria-hidden="true">
            <path d="M10 29L10 29c-2.209 0-4-1.791-4-4l0 0c0-2.209 1.791-4 4-4h2.857C13.488 21 14 21.512 14 22.143V25C14 27.209 12.209 29 10 29zM20 9h-2.857C16.512 9 16 8.488 16 7.857V2.143C16 1.512 16.512 1 17.143 1H20c2.209 0 4 1.791 4 4l0 0C24 7.209 22.209 9 20 9zM10 1h2.857C13.488 1 14 1.512 14 2.143v5.714C14 8.488 13.488 9 12.857 9H10C7.791 9 6 7.209 6 5l0 0C6 2.791 7.791 1 10 1zM10 11h2.857C13.488 11 14 11.512 14 12.143v5.714C14 18.488 13.488 19 12.857 19H10c-2.209 0-4-1.791-4-4l0 0C6 12.791 7.791 11 10 11zM20 11A4 4 0 1020 19 4 4 0 1020 11z" />
          </svg>
          <span>Import to Figma</span>
        </a>

        {/* Share Section */}
        <div className="pt-4">
          <p className="text-sm text-foreground/60 mb-3 font-medium">Share this website</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 border border-white/20 rounded-xl text-sm font-medium text-foreground/80 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${website.name}`)}&url=${encodeURIComponent(website.url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-foreground/10 hover:bg-foreground/20 border border-white/20 rounded-xl transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Share on Twitter"
            >
              <svg className="w-4 h-4 text-foreground/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(website.url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-foreground/10 hover:bg-foreground/20 border border-white/20 rounded-xl transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-4 h-4 text-foreground/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.564v11.452zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* URL Display */}
        <div className="pt-2">
          <p className="text-xs text-foreground/60 mb-1 font-medium">Website URL</p>
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:opacity-90 font-medium break-all transition-colors duration-200"
          >
            {website.url}
          </a>
        </div>
      </div>
    </div>
  );
}
