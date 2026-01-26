'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

interface WebsiteCardBrandedProps {
  website: Website;
}

export default function WebsiteCardBranded({ website }: WebsiteCardBrandedProps) {
  const [imageError, setImageError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string>(website.screenshotUrl);

  const categoryColor = getCategoryColor(website.displayCategory || website.category);
  const displayCategory = website.displayCategory || website.category;

  const fallbackSrc = useMemo(
    () => `/screenshots/fallbacks/${website.slug}.webp`,
    [website.slug]
  );

  function handleImageError() {
    // First failure: try server-generated fallback image
    if (!triedFallback) {
      setTriedFallback(true);
      setDisplaySrc(fallbackSrc);
      return;
    }
    // Fallback also failed → show gradient card UI
    setImageError(true);
  }

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Full-bleed hero image with overlaid content */}
      <div className="relative h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] overflow-hidden">
        {!imageError ? (
          <>
            <Image
              src={displaySrc}
              alt={`${website.name} homepage`}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={handleImageError}
              priority={false}
            />
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            
            {/* Category badge - top left */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              <div 
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-sm border border-white/20"
                style={{ backgroundColor: `${categoryColor}CC` }}
              >
                {displayCategory}
              </div>
            </div>


            {/* Main content overlay - centered */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 z-10">
              <div className="text-white">
                {/* Website name - large and bold */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 leading-tight drop-shadow-lg">
                  {website.name}
                </h3>
              </div>
            </div>

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
              <h3 className="text-2xl font-bold mb-2">{website.name}</h3>
            </div>
          </div>
        )}
      </div>


      {/* Click overlay to navigate to detail page */}
      <Link
        href={`/sites/${website.slug}`}
        className="absolute inset-0 z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        aria-label={`View details for ${website.name} - ${displayCategory}`}
      >
        <span className="sr-only">View {website.name} details</span>
      </Link>
    </div>
  );
}
