'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MarqueeColumnProps {
  images: string[];
  speed?: number;
  reverse?: boolean;
}

const MarqueeColumn: React.FC<MarqueeColumnProps> = ({ images, speed = 20, reverse = false }) => {
  // Duplicate images for seamless loop
  const looped = [...images, ...images];

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        animate={{ y: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{
          y: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {looped.map((img, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              aspectRatio: '16/10', // Screenshot ratio
              backgroundColor: '#1A1A1A',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {img ? (
              <Image
                src={img}
                alt={`Website screenshot ${i + 1}`}
                width={400}
                height={250}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#333',
                  fontSize: '10px',
                }}
              >
                SITE {i + 1}
              </div>
            )}
          </div>
        ))}
      </motion.div>
      {/* Gradient Overlay for smooth fade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(5,5,5,1) 0%, transparent 15%, transparent 85%, rgba(5,5,5,1) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

interface HeroSectionProps {
  title?: string;
  description?: string;
  statsText?: string;
  imagesCol1?: string[];
  imagesCol2?: string[];
}

export default function HeroSection({
  title = "We curate the internet's finest digital experiences.",
  description = "AllWebsites.Design is a curated directory of 954+ website designs from top companies. Our mission is to provide designers with a comprehensive resource for inspiration.",
  statsText = '954+ Active Sites Tracked',
  imagesCol1 = [],
  imagesCol2 = [],
}: HeroSectionProps) {
  const borderColor = '#222222';
  const bgColor = '#050505';
  const textColor = '#FFFFFF';
  const accentColor = '#CCFF00';

  return (
    <div
      style={{
        fontFamily: '"Sora", system-ui, sans-serif',
        color: '#FFFFFF',
        width: '100%',
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        borderBottom: `1px solid ${borderColor}`,
        overflow: 'hidden',
      }}
    >
      <div
        className="hero-grid grid grid-cols-1 md:grid-cols-[1.2fr_1fr] w-full max-w-[1400px] min-h-[700px]"
        style={{
          borderLeft: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
        }}
      >
        {/* Left: Text Content */}
        <div
          className="left-panel flex flex-col justify-center relative p-12 md:p-[80px_60px]"
          style={{
            borderRight: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: accentColor,
              marginBottom: '32px',
              padding: '6px 12px',
              border: `1px solid ${borderColor}`,
              width: 'fit-content',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            // ABOUT THE ARCHIVE
          </div>

          <motion.h1
            style={{
              fontSize: 'clamp(48px, 5vw, 80px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              marginBottom: '32px',
              color: textColor,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>

          <motion.p
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '500px',
              marginBottom: '48px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {description}
          </motion.p>

          <div
            style={{
              paddingTop: '32px',
              borderTop: `1px solid ${borderColor}`,
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                background: '#10B981',
                borderRadius: '50%',
                boxShadow: '0 0 10px #10B981',
              }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: textColor,
              }}
            >
              {statsText}
            </span>
          </div>
        </div>

        {/* Right: Scrolling Marquee */}
        <div
          className="right-panel grid grid-cols-2 h-full max-h-[800px]"
          style={{
            gap: '1px',
            backgroundColor: borderColor,
          }}
        >
          <div
            className="h-full overflow-hidden p-4"
            style={{
              backgroundColor: bgColor,
            }}
          >
            <MarqueeColumn images={imagesCol1} speed={40} reverse={false} />
          </div>
          <div
            className="h-full overflow-hidden p-4"
            style={{
              backgroundColor: bgColor,
            }}
          >
            <MarqueeColumn images={imagesCol2} speed={55} reverse={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
