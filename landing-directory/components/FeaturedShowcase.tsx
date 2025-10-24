'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Website } from '@/lib/types';
import { useMemo } from 'react';

interface FeaturedShowcaseProps {
  websites: Website[];
}

// Returns an array partitioned into: [lead, mediums[], smalls[]]
function partitionFeatured(websites: Website[]) {
  const items = [...websites];
  // Prefer featured flag for lead
  items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const lead = items[0];
  const rest = items.slice(1);
  const mediums = rest.slice(0, 2);
  const smalls = rest.slice(2, 8);
  return { lead, mediums, smalls };
}

export default function FeaturedShowcase({ websites }: FeaturedShowcaseProps) {
  const { lead, mediums, smalls } = useMemo(() => partitionFeatured(websites), [websites]);

  if (!lead) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Row 1: Lead card + two mediums */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Lead Card (spans 2 on large screens) */}
        <ShowcaseCard website={lead} size="lead" className="md:col-span-2 lg:col-span-2" />
        {mediums.map((w) => (
          <ShowcaseCard key={w.id} website={w} size="medium" />
        ))}
      </div>

      {/* Row 2: Small grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {smalls.map((w) => (
          <ShowcaseCard key={w.id} website={w} size="small" />
        ))}
      </div>
    </div>
  );
}

function ShowcaseCard({ website, size, className = '' }: { website: Website; size: 'lead' | 'medium' | 'small'; className?: string }) {
  const dimensions = size === 'lead' ? 'h-[280px] sm:h-[350px] lg:h-[420px]' : 
                    size === 'medium' ? 'h-[240px] sm:h-[280px] lg:h-[320px]' : 
                    'h-[200px] sm:h-[240px] lg:h-[260px]';

  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] ${dimensions} ${className}`}
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        perspective: '1200px'
      }}
    >
      {/* Image */}
      <Image
        src={website.screenshotUrl}
        alt={website.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        unoptimized
      />

      {/* Remove dark depth overlay */}
      <div className="hidden" />

      {/* Remove rim and ambient frames */}
      <div className="hidden" />
      <div className="hidden" />

      {/* Hover shimmer */}
      <div className="hidden" />

      {/* Badge */}
      {website.featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm border"
            style={{ color: '#1a1200', background: 'linear-gradient(90deg, #FFD769, #FFA200)', borderColor: '#FFD769', boxShadow: '0 8px 24px rgba(255,162,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            Featured
          </span>
        </div>
      )}

      {/* Labels */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-white font-semibold truncate tracking-wide text-base font-unbounded">{website.name}</div>
        <div className="text-white/80 text-xs truncate font-lato">{website.displayCategory || website.category}</div>
      </div>

      {/* Hover action bar */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md p-2">
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(135deg, #FFD769, #FFA200)' }}
            aria-label={`Open ${website.name}`}
          >
            Open
          </a>
          <a
            href={`/sites/${website.slug}`}
            className="pointer-events-auto px-4 py-2 rounded-xl text-sm font-semibold text-white/90 hover:text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', border: '1px solid rgba(255,255,255,0.25)' }}
            aria-label={`View details for ${website.name}`}
          >
            Details
          </a>
        </div>
      </div>

      {/* Subtle 3D tilt on hover */}
      <div className="absolute inset-0" style={{ transform: 'translateZ(0)', willChange: 'transform' }} />
    </div>
  );
}


