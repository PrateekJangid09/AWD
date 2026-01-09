'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME ---
const theme = {
  bg: '#030303',
  cardBg: '#0A0A0A',
  text: '#FFFFFF',
  sub: '#A1A1AA',
  border: 'rgba(255,255,255,0.08)',
};

interface SpotlightArchiveProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
}

export default function SpotlightArchive({
  title = 'Discover the Future',
  subtitle = 'Navigate the curated selection of next-gen digital experiences.',
  websites,
}: SpotlightArchiveProps) {
  // Get first 9 websites
  const items = websites.slice(0, 9).map((w, idx) => ({
    id: idx + 1,
    title: w.name,
    tag: w.displayCategory || w.category,
    img: w.screenshotUrl,
    link: `/sites/${w.slug}`,
  }));

  // GLOBAL MOUSE TRACKING (The Flashlight)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // The Flashlight Beam
  const spotlight = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent 80%)`;

  return (
    <section
      className="relative w-full flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: theme.bg,
        padding: '140px 40px',
        cursor: 'default',
      }}
      onMouseMove={handleMouseMove}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,500&family=JetBrains+Mono:wght@500&display=swap');
        
        @media (max-width: 900px) {
          .spotlight-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 1. Dim Base Grid (Always visible slightly) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.05,
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          zIndex: 0,
        }}
      />

      {/* 2. Bright Active Grid (Revealed by Mouse) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: spotlight,
          WebkitMaskImage: spotlight,
          zIndex: 1,
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 text-center mb-25"
        style={{
          marginBottom: '100px',
          maxWidth: '900px',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(56px, 6vw, 80px)',
            color: theme.text,
            marginBottom: '24px',
            lineHeight: 1,
            textShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '18px',
            color: theme.sub,
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* CARDS */}
      <div
        className="spotlight-grid relative z-10 grid gap-10 w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          maxWidth: '1400px',
        }}
      >
        {items.map((item) => (
          <HookCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

// --- THE HOOK CARD ---
interface HookCardItem {
  id: number;
  title: string;
  tag: string;
  img: string;
  link: string;
}

function HookCard({ item }: { item: HookCardItem }) {
  const { title, tag, img, link } = item;
  const accentColor = getCategoryColor(tag);

  // 3D TILT PHYSICS
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <motion.div
        style={{ perspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial="idle"
        whileHover="hover"
      >
        <motion.div
          className="relative w-full"
          style={{
            aspectRatio: '3/4',
            borderRadius: '16px',
            backgroundColor: theme.cardBg,
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: 'preserve-3d',
            cursor: 'pointer',
          }}
        >
          {/* 1. THE LASER BORDER (Revealed on Hover) */}
          <motion.div
            variants={{ idle: { opacity: 0 }, hover: { opacity: 1 } }}
            className="absolute"
            style={{
              inset: -2,
              borderRadius: '18px',
              background: `linear-gradient(45deg, ${accentColor}, transparent 40%, ${accentColor})`,
              filter: 'blur(4px)',
              zIndex: -1,
            }}
          />

          {/* 2. IMAGE CONTAINER */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden z-[1]"
            style={{
              border: `1px solid ${theme.border}`,
            }}
          >
            {img ? (
              <motion.div
                className="relative w-full h-full"
                variants={{
                  idle: {
                    scale: 1,
                  },
                  hover: {
                    scale: 1.1,
                  },
                }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 33vw"
                  unoptimized
                />
              </motion.div>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: '#111',
                }}
              />
            )}

            {/* Gradient Shade */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.95), transparent 60%)',
              }}
            />
          </div>

          {/* 3. FLOATING CONTENT */}
          <div
            className="absolute inset-0 p-6 flex flex-col justify-end z-20 pointer-events-none"
            style={{
              transform: 'translateZ(30px)',
            }}
          >
            {/* The Pulse Pill */}
            <div className="mb-3 flex">
              <motion.div
                variants={{
                  idle: {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  hover: {
                    backgroundColor: `${accentColor}20`,
                    borderColor: accentColor,
                  },
                }}
                className="border flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
              >
                {/* The Heartbeat Dot */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: accentColor,
                    boxShadow: `0 0 8px ${accentColor}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {tag || 'Unknown'}
                </span>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h3
              variants={{ hover: { y: -5 } }}
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: theme.text,
                margin: 0,
                textShadow: '0 4px 12px rgba(0,0,0,0.8)',
              }}
            >
              {title}
            </motion.h3>

            {/* CTA Reveal */}
            <div className="overflow-hidden" style={{ height: '20px' }}>
              <motion.div
                variants={{
                  idle: { y: 20, opacity: 0 },
                  hover: { y: 0, opacity: 1 },
                }}
                className="flex items-center gap-1.5 mt-1.5"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '11px',
                  color: theme.sub,
                }}
              >
                EXPLORE_PROJECT{' '}
                <span style={{ color: accentColor }}>→</span>
              </motion.div>
            </div>
          </div>

          {/* 4. SURFACE GLOSS */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.1), transparent 40%)',
              opacity: 0.5,
            }}
          />
        </motion.div>
      </motion.div>
    </Link>
  );
}
