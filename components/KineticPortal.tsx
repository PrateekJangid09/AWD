'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { Website } from '@/lib/types';
import { MACRO_CATEGORIES, getCategoryColor, slugifyCategory } from '@/lib/categories';

const theme = {
  bg: '#020202',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.4)',
  accent: '#3B82F6',
};

interface KineticPortalProps {
  title?: string;
  subtitle?: string;
  currentCategory?: string;
  websites: Website[];
}

export default function KineticPortal({
  title = 'UNIVERSE',
  subtitle = 'Explore the',
  currentCategory,
  websites,
}: KineticPortalProps) {
  // Prepare categories data
  const availableCategories = MACRO_CATEGORIES.filter(
    (cat) => cat !== 'Browse All' && cat !== currentCategory
  );

  const rawCategories = React.useMemo(() => {
    // Deterministic selection: always take first 4 available categories
    // This ensures server and client render the same content
    const selected = availableCategories.slice(0, 4);

    return selected.map((catName) => {
      const categoryWebsites = websites.filter(
        (site) => (site.displayCategory || site.category) === catName
      );
      const featuredImage =
        categoryWebsites.find((site) => site.featured)?.screenshotUrl ||
        categoryWebsites[0]?.screenshotUrl ||
        '';
      const count = categoryWebsites.length;

      return {
        name: catName,
        img: featuredImage,
        color: getCategoryColor(catName),
        count: `${count} Sites`,
        slug: slugifyCategory(catName),
      };
    });
  }, [availableCategories, websites]);

  // ---- Motion / Looping ----
  const baseX = useMotionValue(0);
  const [isCardHovered, setCardHovered] = React.useState(false);
  const [isDragging, setDragging] = React.useState(false);

  // speed (negative = left)
  const baseVelocity = -0.5;

  // Refs to measure "one set width" using first card of set1 and first card of set2
  const firstOfSet1Ref = React.useRef<HTMLDivElement>(null);
  const firstOfSet2Ref = React.useRef<HTMLDivElement>(null);
  const [loopWidth, setLoopWidth] = React.useState(0);

  // 3 copies for seamless looping
  const categories = [...rawCategories, ...rawCategories, ...rawCategories];
  const setLen = rawCategories.length;

  const measureLoopWidth = React.useCallback(() => {
    const a = firstOfSet1Ref.current;
    const b = firstOfSet2Ref.current;
    if (!a || !b) return;
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const w = rb.left - ra.left;
    if (w > 0) setLoopWidth(w);
  }, []);

  React.useLayoutEffect(() => {
    measureLoopWidth();
    // Re-measure on resize (responsive card widths)
    const onResize = () => measureLoopWidth();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measureLoopWidth]);

  const normalizeX = React.useCallback(() => {
    if (!loopWidth) return;
    let x = baseX.get();

    // keep in [-loopWidth, 0)
    while (x <= -loopWidth) x += loopWidth;
    while (x >= 0) x -= loopWidth;

    if (x !== baseX.get()) baseX.set(x);
  }, [baseX, loopWidth]);

  useAnimationFrame((t, delta) => {
    if (!loopWidth) return;

    // Only auto-scroll if not hovering a card and not dragging
    if (!isCardHovered && !isDragging) {
      const moveBy = baseVelocity * (delta / 16);
      baseX.set(baseX.get() + moveBy);
      normalizeX();
    } else {
      // even if paused, keep it normalized (nice & stable)
      normalizeX();
    }
  });

  return (
    <div
      className="relative w-full flex flex-col justify-center overflow-hidden border-t"
      style={{
        backgroundColor: theme.bg,
        padding: '140px 0',
        borderTopColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&family=Inter:wght@300;800&display=swap');
        
        @media (max-width: 900px) {
          .portal-header { 
            flex-direction: column; 
            align-items: flex-start; 
            gap: 20px; 
            padding: 0 20px 40px !important; 
          }
          .track { 
            padding-left: 20px !important; 
            gap: 20px !important; 
          }
          .portal-card { 
            min-width: 260px !important; 
            height: 380px !important; 
          }
        }
      `}</style>

      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.04,
          zIndex: 0,
        }}
      />

      {/* Spotlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '80%',
          height: '400px',
          background: `radial-gradient(ellipse, ${theme.accent}08 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        className="portal-header relative z-10 px-15 pb-15 flex items-end justify-between max-w-[1800px] mx-auto w-full"
        style={{
          padding: '0 60px 60px',
        }}
      >
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(32px, 4vw, 56px)',
              color: theme.dim,
              marginBottom: '-15px',
              zIndex: 1,
            }}
          >
            {subtitle}
          </span>
          <span
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 'clamp(48px, 6vw, 96px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: theme.text,
              lineHeight: 0.9,
              letterSpacing: '-3px',
              zIndex: 0,
            }}
          >
            {title}
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: theme.dim,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.accent,
              boxShadow: `0 0 10px ${theme.accent}`,
            }}
          />
          Explore Next
        </div>
      </div>

      {/* Track Container */}
      <div
        className="relative z-10 w-full overflow-hidden py-5"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
        }}
      >
        <motion.div
          className="track flex gap-10 pl-15"
          style={{
            paddingLeft: '60px',
            gap: '40px',
            x: baseX,
            willChange: 'transform',
          }}
          drag="x"
          dragConstraints={false}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={() => setDragging(true)}
          onDrag={() => normalizeX()}
          onDragEnd={() => {
            setDragging(false);
            normalizeX();
          }}
        >
          {categories.map((cat, i) => {
            // Assign refs for measuring set width
            const ref =
              i === 0
                ? firstOfSet1Ref
                : i === setLen
                  ? firstOfSet2Ref
                  : undefined;

            return (
              <PortalCard
                key={`${cat.name}-${i}`}
                data={cat}
                innerRef={ref}
                onHoverChange={setCardHovered}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: PORTAL CARD ---
interface PortalCardData {
  name: string;
  img: string;
  color: string;
  count: string;
  slug: string;
}

interface PortalCardProps {
  data: PortalCardData;
  innerRef?: React.RefObject<HTMLDivElement>;
  onHoverChange: (isHovered: boolean) => void;
}

function PortalCard({ data, onHoverChange, innerRef }: PortalCardProps) {
  const brandColor = data.color || theme.accent;

  return (
    <Link href={`/c/${data.slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={innerRef}
        className="portal-card relative rounded-3xl overflow-hidden flex-shrink-0"
        style={{
          minWidth: '400px',
          height: '560px',
          backgroundColor: '#080808',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        whileHover="hover"
        initial="initial"
        onHoverStart={() => onHoverChange(true)}
        onHoverEnd={() => onHoverChange(false)}
      >
        {/* IMAGE */}
        <motion.div
          className="absolute inset-0 z-0"
          variants={{
            initial: {
              scale: 1,
              filter: 'grayscale(100%) brightness(0.7)',
            },
            hover: {
              scale: 1.1,
              filter: 'grayscale(0%) brightness(1)',
            },
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {data.img ? (
            <Image
              src={data.img}
              alt={data.name || 'Category'}
              fill
              className="object-cover"
              sizes="(max-width: 900px) 260px, 400px"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(45deg, #111, #222)',
              }}
            />
          )}
        </motion.div>

        {/* OVERLAY */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to top, #000 0%, transparent 60%)',
          }}
        />

        {/* COLOR TINT */}
        <motion.div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundColor: brandColor,
            mixBlendMode: 'overlay',
          }}
          variants={{ initial: { opacity: 0 }, hover: { opacity: 0.4 } }}
          transition={{ duration: 0.4 }}
        />

        {/* CONTENT */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-[2] flex flex-col gap-2 p-10"
          variants={{ initial: { y: 10 }, hover: { y: 0 } }}
        >
          <div
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {data.count}
          </div>
          <div
            style={{
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: '42px',
              color: theme.text,
              lineHeight: 1,
            }}
          >
            {data.name}
          </div>

          <motion.div
            className="mt-4 flex items-center gap-2 overflow-hidden"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: theme.text,
              height: '20px',
            }}
          >
            <motion.span
              variants={{
                initial: { y: 20 },
                hover: { y: 0, color: brandColor },
              }}
              transition={{ delay: 0.1 }}
            >
              Enter Portal
            </motion.span>
            <motion.span
              variants={{
                initial: { x: -10, opacity: 0 },
                hover: { x: 0, opacity: 1, color: brandColor },
              }}
              transition={{ delay: 0.2 }}
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>

        {/* GLOSS */}
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            background:
              'linear-gradient(105deg, rgba(255,255,255,0.1) 0%, transparent 40%)',
          }}
        />

        {/* HOVER BORDER */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none z-[4]"
          style={{
            border: `1px solid ${brandColor}`,
            boxShadow: `0 0 30px ${brandColor}40`,
          }}
          variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
        />
      </motion.div>
    </Link>
  );
}
