'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useInView,
  useTransform,
  animate,
} from 'framer-motion';

// --- THEME ---
const theme = {
  bg: '#050505', // Obsidian
  glass: 'rgba(255, 255, 255, 0.02)',
  text: '#FFFFFF',
};

interface ChameleonHUDProps {
  stat1_val: string;
  stat1_lbl: string;
  stat1_color: string;
  stat2_val: string;
  stat2_lbl: string;
  stat2_color: string;
  stat3_val: string;
  stat3_lbl: string;
  stat3_color: string;
  stat4_val: string;
  stat4_lbl: string;
  stat4_color: string;
}

export default function ChameleonHUD({
  stat1_val,
  stat1_lbl,
  stat1_color,
  stat2_val,
  stat2_lbl,
  stat2_color,
  stat3_val,
  stat3_lbl,
  stat3_color,
  stat4_val,
  stat4_lbl,
  stat4_color,
}: ChameleonHUDProps) {
  // --- MOUSE PHYSICS ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Heavy spring for the "Liquid Light" feel
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  // --- COLOR PHYSICS (The Chameleon Engine) ---
  // We start with a neutral color
  const activeColor = useMotionValue('rgba(255, 255, 255, 0.1)');

  // Function to morph color smoothly
  const morphColor = React.useCallback((newColor: string) => {
    animate(activeColor, newColor, { duration: 0.5 });
  }, [activeColor]);

  // The Moving Spotlight (Now uses activeColor)
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, ${activeColor}, transparent 80%)`;

  // The Border Light (Sharper, brighter version of the color)
  const borderLight = useMotionTemplate`radial-gradient(300px circle at ${smoothX}px ${smoothY}px, ${activeColor}, transparent 80%)`;

  return (
    <section
      style={{
        width: '100%',
        backgroundColor: theme.bg,
        display: 'flex',
        justifyContent: 'center',
        padding: '140px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap');
        
        @media (max-width: 900px) {
          .chameleon-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 500px) {
          .chameleon-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          zIndex: 0,
        }}
      />

      {/* THE HUD OBJECT */}
      <div
        className="chameleon-grid relative"
        style={{
          width: '100%',
          maxWidth: '1200px',
          background: theme.glass,
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          overflow: 'hidden',
          zIndex: 10,
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => morphColor('rgba(255,255,255,0.1)')} // Reset to white on exit
      >
        {/* 1. Internal Spotlight (Changing Color) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: spotlight,
            opacity: 0.6,
          }}
        />

        {/* 2. Content Blocks (Triggers) */}
        <StatItem
          val={stat1_val}
          lbl={stat1_lbl}
          index={0}
          color={stat1_color}
          onHover={morphColor}
        />
        <StatItem
          val={stat2_val}
          lbl={stat2_lbl}
          index={1}
          color={stat2_color}
          onHover={morphColor}
        />
        <StatItem
          val={stat3_val}
          lbl={stat3_lbl}
          index={2}
          color={stat3_color}
          onHover={morphColor}
        />
        <StatItem
          val={stat4_val}
          lbl={stat4_lbl}
          index={3}
          color={stat4_color}
          onHover={morphColor}
        />

        {/* 3. Dynamic Borders */}
        <motion.div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            padding: '1px',
            background: borderLight,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            zIndex: 21,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </section>
  );
}

// --- SUB-COMPONENT: STAT ITEM ---
interface StatItemProps {
  val: string;
  lbl: string;
  index: number;
  color: string;
  onHover: (color: string) => void;
}

function StatItem({ val, lbl, index, color, onHover }: StatItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Parse Number
  const rawNumber = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
  const suffix = val.replace(/[0-9.]/g, '') || '';

  // Counter Animation
  const count = useSpring(0, { stiffness: 30, damping: 20 });
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  // Entrance Animation
  const opacity = useSpring(0, { stiffness: 30, damping: 20 });
  const y = useSpring(20, { stiffness: 30, damping: 20 });

  React.useEffect(() => {
    if (isInView) {
      const delay = index * 150;
      setTimeout(() => {
        count.set(rawNumber);
        opacity.set(1);
        y.set(0);
      }, delay);
    }
  }, [isInView, rawNumber, index, count, opacity, y]);

  return (
    <motion.div
      ref={ref}
      className="relative z-30"
      style={{
        padding: '60px 40px',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        alignItems: 'flex-start',
      }}
      onMouseEnter={() => onHover(color)}
    >
      {/* Tech Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        {/* The little bar lights up with the specific color too */}
        <motion.div
          style={{
            width: 30,
            height: 2,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
          }}
          whileHover={{ backgroundColor: color, width: 50 }}
        />
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '1px',
          }}
        >
          0{index + 1}
        </div>
      </div>

      {/* The Value (Chrome Gradient) */}
      <motion.div style={{ opacity, y }}>
        <div
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 'clamp(48px, 5vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            // Chrome Gradient Text
            backgroundImage: 'linear-gradient(180deg, #FFFFFF 20%, #888888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
          }}
        >
          <Counter value={rounded} />
          <span
            style={{
              fontSize: '0.5em',
              marginLeft: '4px',
              verticalAlign: 'top',
              color: '#666',
            }}
          >
            {suffix}
          </span>
        </div>
      </motion.div>

      {/* Label */}
      <div
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {lbl}
      </div>
    </motion.div>
  );
}

interface CounterProps {
  value: ReturnType<typeof useTransform<number, number>>;
}

function Counter({ value }: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    return value.on('change', (latest) => {
      if (ref.current) ref.current.textContent = Math.floor(latest).toString();
    });
  }, [value]);
  return <span ref={ref} />;
}
