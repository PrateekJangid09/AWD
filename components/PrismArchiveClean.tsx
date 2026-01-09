'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';
import { Website } from '@/lib/types';
import { getCategoryColor } from '@/lib/categories';

// --- THEME ---
const theme = {
  bg: '#020202', // Deepest Black
  cardBg: '#080808',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.08)',
};

interface PrismArchiveCleanProps {
  title?: string;
  subtitle?: string;
  websites: Website[];
}

export default function PrismArchiveClean({
  title = 'The Collection',
  subtitle = 'Curated interface design.',
  websites,
}: PrismArchiveCleanProps) {
  // Get first 9 websites
  const items = websites.slice(0, 9).map((w, idx) => ({
    id: idx + 1,
    title: w.name,
    tag: w.displayCategory || w.category,
    img: w.screenshotUrl,
    link: `/sites/${w.slug}`,
  }));

  // Masonry Logic
  const col1 = [items[0], items[3], items[6]].filter(Boolean);
  const col2 = [items[1], items[4], items[7]].filter(Boolean);
  const col3 = [items[2], items[5], items[8]].filter(Boolean);

  // Parallax Scroll
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const yMiddle = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yOuter = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Global Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // The "Lantern" spotlight (Softer, cleaner)
  const spotlight = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.03), transparent 100%)`;

  return (
    <div
      ref={ref}
      className="relative w-full flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: theme.bg,
        padding: '140px 40px',
      }}
      onMouseMove={handleMouseMove}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');
      `}</style>

      {/* The Clean Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          zIndex: 0,
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: spotlight,
          zIndex: 1,
        }}
      />

      {/* HEADER */}
      <div
        className="relative z-10 text-center mb-30"
        style={{
          marginBottom: '120px',
          maxWidth: '800px',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(56px, 6vw, 96px)',
            color: theme.text,
            marginBottom: '24px',
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '16px',
            color: theme.dim,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </motion.div>
      </div>

      {/* GRID */}
      <div
        className="relative z-10 w-full max-w-[1400px] flex gap-10 justify-center items-start"
      >
        {/* Col 1 */}
        <motion.div
          className="flex flex-col gap-[60px] w-full"
          style={{ y: yOuter }}
        >
          {col1.map((item) => (
            <PrismCard key={item.id} item={item} />
          ))}
        </motion.div>

        {/* Col 2 (Offset & Faster) */}
        <motion.div
          className="flex flex-col gap-[60px] w-full"
          style={{ marginTop: '120px', y: yMiddle }}
        >
          {col2.map((item) => (
            <PrismCard key={item.id} item={item} />
          ))}
        </motion.div>

        {/* Col 3 */}
        <motion.div
          className="flex flex-col gap-[60px] w-full"
          style={{ y: yOuter }}
        >
          {col3.map((item) => (
            <PrismCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// --- THE PRISM CARD ---
interface PrismCardItem {
  id: number;
  title: string;
  tag: string;
  img: string;
  link: string;
}

function PrismCard({ item }: { item: PrismCardItem }) {
  const { title, tag, img, link } = item;
  const accentColor = getCategoryColor(tag);

  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <motion.div
        initial="idle"
        whileHover="hover"
        className="relative w-full cursor-pointer"
      >
        {/* A. The "Neon Bloom" (Background Light) */}
        <motion.div
          variants={{
            idle: { opacity: 0, scale: 0.8 },
            hover: { opacity: 0.4, scale: 1.2 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}, transparent 65%)`,
            filter: 'blur(60px)',
            zIndex: 0,
          }}
        />

        {/* B. The Card Container */}
        <motion.div
          className="relative w-full overflow-hidden z-10"
          style={{
            aspectRatio: '3/4',
            borderRadius: '2px',
            backgroundColor: theme.cardBg,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Image (B&W to Color) */}
          <div className="relative w-full h-full overflow-hidden">
            {img ? (
              <motion.div
                className="absolute inset-0"
                variants={{
                  idle: {
                    scale: 1,
                  },
                  hover: {
                    scale: 1.05,
                  },
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
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
          </div>

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 50%)',
            }}
          />

          {/* The Glass Pill (Top Right) */}
          <div
            className="absolute top-4 right-4 overflow-hidden"
          >
            <motion.div
              variants={{
                idle: { y: -10, opacity: 0 },
                hover: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${accentColor}`,
                color: accentColor,
                padding: '6px 14px',
                fontSize: '10px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 500,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '100px',
              }}
            >
              {tag || 'Unknown'}
            </motion.div>
          </div>

          {/* Bottom Text Area */}
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col gap-2"
            style={{
              padding: '32px',
            }}
          >
            {/* Title Reveal */}
            <div style={{ overflow: 'hidden' }}>
              <motion.h3
                variants={{
                  idle: { y: 20, opacity: 0 },
                  hover: { y: 0, opacity: 1 },
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '32px',
                  fontStyle: 'italic',
                  color: theme.text,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {title}
              </motion.h3>
            </div>

            {/* Meta Line Reveal */}
            <div style={{ overflow: 'hidden' }}>
              <motion.div
                variants={{
                  idle: { y: 20, opacity: 0 },
                  hover: { y: 0, opacity: 1 },
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                  ease: 'easeOut',
                }}
                className="flex items-center gap-2"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  color: theme.dim,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: accentColor,
                    borderRadius: '50%',
                  }}
                />
                VIEW PROJECT
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
