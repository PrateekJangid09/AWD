'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryColor } from '@/lib/categories';
import { Website } from '@/lib/types';

interface RelatedExhibitsProps {
  sectionTitle?: string;
  websites: Website[];
  buttonText?: string;
  buttonLink?: string;
}

export default function RelatedExhibits({
  sectionTitle = 'Similar Aesthetics',
  websites,
  buttonText = 'Browse Collections',
  buttonLink = '/',
}: RelatedExhibitsProps) {
  // Take first 6 websites
  const items = websites.slice(0, 6).map((website, i) => ({
    title: website.name,
    cat: website.displayCategory || website.category,
    img: website.screenshotUrl,
    slug: website.slug,
    rot: [-2, 1.5, -1.5, 2, -1, 1][i] || 0,
  }));

  return (
    <section
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '100px 20px 140px 20px',
        overflow: 'hidden',
        borderTop: '1px solid #E5E5E5',
      }}
    >
      {/* --- HEADER --- */}
      <div
        style={{
          marginBottom: '80px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#999',
            borderBottom: '1px solid #EEE',
            paddingBottom: '8px',
          }}
        >
          // DISCOVER_MORE
        </div>
        <h2
          style={{
            fontSize: '40px',
            fontWeight: 900,
            color: '#111',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {sectionTitle}
        </h2>
      </div>

      {/* --- THE POLAROID GRID (6 Items) --- */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '60px',
          width: '100%',
          maxWidth: '1400px',
        }}
      >
        {items.map((item, i) => (
          <PolaroidCard
            key={item.slug || i}
            title={item.title}
            category={item.cat}
            image={item.img}
            rotation={item.rot}
            slug={item.slug}
          />
        ))}
      </div>

      {/* --- BROWSE COLLECTIONS BUTTON --- */}
      <div style={{ marginTop: '100px' }}>
        <Link href={buttonLink} style={{ textDecoration: 'none' }}>
          <motion.button
            whileHover={{ scale: 1.05, gap: '12px' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '20px 40px',
              backgroundColor: '#111',
              color: '#FFF',
              border: 'none',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            {buttonText}
            <span>→</span>

            {/* Decorative "Perforations" on sides */}
            <div
              style={{
                position: 'absolute',
                left: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FFF',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FFF',
              }}
            />
          </motion.button>
        </Link>
      </div>
    </section>
  );
}

// --- SUB-COMPONENT: POLAROID CARD ---
interface PolaroidCardProps {
  title: string;
  category: string;
  image: string;
  rotation: number;
  slug: string;
}

function PolaroidCard({ title, category, image, rotation, slug }: PolaroidCardProps) {
  const tapeColor = getCategoryColor(category);

  return (
    <Link href={`/sites/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ rotate: rotation }}
        whileHover={{
          rotate: 0,
          scale: 1.05,
          y: -15,
          zIndex: 10,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          width: '340px',
          backgroundColor: '#FFF',
          padding: '12px 12px 60px 12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid #E5E5E5',
        }}
      >
        {/* 1. The Washi Tape (Holds it to the wall) */}
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%) rotate(2deg)',
            width: '80px',
            height: '28px',
            backgroundColor: tapeColor,
            opacity: 0.8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 5,
            clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
          }}
        />

        {/* 2. The Image Frame */}
        <div
          style={{
            width: '100%',
            aspectRatio: '4/3',
            backgroundColor: '#F5F5F5',
            overflow: 'hidden',
            border: '1px solid #EEE',
            marginBottom: '16px',
            position: 'relative',
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              style={{
                objectFit: 'cover',
              }}
              sizes="340px"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CCC',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              NO PREVIEW
            </div>
          )}
        </div>

        {/* 3. The Handwritten Label (Absolute positioned at bottom) */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 700,
                color: '#111',
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#999',
                fontWeight: 500,
              }}
            >
              Featured Selection
            </span>
          </div>

          {/* Small Category Stamp */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: tapeColor,
              border: `1px solid ${tapeColor}`,
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {category}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
