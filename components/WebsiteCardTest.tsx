'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

interface WebsiteCardTestProps {
  website: Website;
}

export default function WebsiteCardTest({ website }: WebsiteCardTestProps) {
  const [imageError, setImageError] = useState(false);
  
  const categoryColor = getCategoryColor(website.displayCategory || website.category);
  const displayCategory = website.displayCategory || website.category;

  return (
    <div className="group">
      <Link
        href={`/sites/${website.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative overflow-hidden rounded-tl-none rounded-br-none rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] block touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
      {/* Liquid glass shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      {/* Liquid glass inner glow */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-45 transition-opacity duration-500">
        <div 
          className="absolute inset-0 rounded-tl-none rounded-br-none rounded-2xl"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Framed screenshot */}
      <div className="relative p-2 sm:p-3">
        {/* Frame rim */}
        <div
          className="pointer-events-none absolute inset-0 rounded-tl-none rounded-br-none rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 24px rgba(0,0,0,0.20)'
          }}
        />

        {/* Image area */}
        <div className="relative aspect-[8/9] overflow-hidden rounded-[16px]">
          {!imageError ? (
            <>
              <Image
              src={website.screenshotUrl}
              alt={`${website.name} homepage`}
              fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110 brightness-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
              priority={false}
            />
            
              {/* Liquid glass overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
            
              {/* Category badge - HIDDEN */}
              {/* <div className="absolute top-4 right-4 z-10">
                <div 
                  className="px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-lg backdrop-blur-sm border transition-all duration-500 group-hover:bg-white/10 group-hover:backdrop-blur-md group-hover:shadow-xl"
                  style={{ backgroundColor: `${categoryColor}CC`, borderColor: `${categoryColor}80`, boxShadow: `0 4px 20px ${categoryColor}66` }}
                >
                  {displayCategory}
                </div>
              </div> */}

              {/* Main content overlay - removed website name */}

            </>
          ) : (
            /* Fallback design for missing images */
            <div 
              className="flex h-full w-full items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}CC 50%, #1F2937 100%)`,
              }}
            >
              <div className="text-center text-white z-10 px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                {/* Website name removed - now shown below card */}
              </div>
            </div>
          )}
        </div>
      </div>

      </Link>
      
      {/* Website name below the card */}
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-2 sm:mt-3 text-center transition-colors duration-300 group-hover:text-foreground/80 font-unbounded">
        {website.name}
      </h3>
      <p className="text-xs text-foreground/70 text-center font-lato">{website.displayCategory || website.category}</p>
    </div>
  );
}
