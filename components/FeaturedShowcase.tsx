'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Website } from '@/lib/types';
import { useMemo } from 'react';

interface FeaturedShowcaseProps {
  websites: Website[];
}

// Returns an array partitioned into: [leadTop, leadBottom, smalls[]]
function partitionFeatured(websites: Website[]) {
  const items = [...websites];
  // Prefer featured flag for lead
  items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const leadTop = items[0];
  const leadBottom = items[1];
  const smalls = items.slice(2, 8); // next 6 items
  return { leadTop, leadBottom, smalls };
}

export default function FeaturedShowcase({ websites }: FeaturedShowcaseProps) {
  const { leadTop, leadBottom, smalls } = useMemo(() => partitionFeatured(websites), [websites]);

  if (!leadTop) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Formation: left column has two large cards stacked; right side shows 2x3 small cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Left: two large cards stacked (spans 2 columns) */}
        <div className="md:col-span-2 flex flex-col gap-4 sm:gap-6">
          <ShowcaseCard website={leadTop} size="lead" />
          {leadBottom && <ShowcaseCard website={leadBottom} size="lead" />}
        </div>

        {/* Right: 2 x 3 small grid (spans 2 columns) */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
          {smalls.map((w) => (
            <ShowcaseCard key={w.id} website={w} size="small" />
          ))}
        </div>
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
      className={`group relative overflow-hidden rounded-[24px] ${dimensions} ${className} border-4 border-white`}
      style={{
        background: 'transparent',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        perspective: '1200px'
      }}
    >
      {/* Make whole card clickable to details */}
      <Link href={`/sites/${website.slug}`} className="absolute inset-0 z-10" aria-label={`View ${website.name}`} />
      {/* Image */}
      <Image
        src={website.screenshotUrl}
        alt={website.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        loading={size === 'lead' ? 'eager' : 'lazy'}
        priority={size === 'lead'}
      />

      {/* Dark gradient overlay at bottom for text visibility */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Badge */}
      {website.featured && (
        <div className="absolute top-3 left-3 z-30">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm border"
            style={{ color: '#1a1200', background: 'linear-gradient(90deg, #FFD769, #FFA200)', borderColor: '#FFD769', boxShadow: '0 8px 24px rgba(255,162,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            Featured
          </span>
        </div>
      )}

      {/* Labels */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20">
        <div className="text-white font-semibold truncate tracking-wide text-base font-unbounded drop-shadow-lg">{website.name}</div>
        <div className="text-white/90 text-xs truncate font-lato drop-shadow-md">{website.displayCategory || website.category}</div>
      </div>

      {/* Subtle 3D tilt on hover */}
      <div className="absolute inset-0" style={{ transform: 'translateZ(0)', willChange: 'transform' }} />
    </div>
  );
}


