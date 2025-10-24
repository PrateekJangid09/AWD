'use client';

import React from 'react';

interface AutoScrollTickerProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  'Web Development',
  'UI/UX Design',
  'App Development',
  'Innovative Ideas',
  'Design Systems',
  'Micro‑interactions',
  'Accessibility',
  'Performance',
];

export default function AutoScrollTicker({ items = DEFAULT_ITEMS }: AutoScrollTickerProps) {
  const content = [...items, ...items]; // duplicate for seamless loop

  return (
    <div className="py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="relative overflow-hidden whitespace-nowrap border-y border-black/10 select-none"
          style={{ background: 'linear-gradient(90deg, #D4FF3A, #FFD769)' }}
        >
          <div className="inline-flex items-center gap-6 pr-6 animate-scroll py-4">
            {content.map((label, idx) => (
              <div
                key={`${label}-${idx}`}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/10 text-black font-semibold text-sm shadow-[0_1px_0_rgba(255,255,255,0.5)_inset]"
              >
                <span className="text-[10px]">✺</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


