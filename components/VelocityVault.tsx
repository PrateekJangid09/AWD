'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { Website } from '@/lib/types';

// --- THEME: PLATINUM LIGHT ---
const THEME = {
  bg: '#F0F2F5', // Ultra Light Grey
  surface: '#FFFFFF',
  text: '#111111',
  dim: '#888888',
  accent: '#0055FF',
  success: '#00CC66',
  combo: '#FF9900',
  border: 'rgba(0,0,0,0.06)',
  shadow: '0 20px 40px -10px rgba(0,0,0,0.08), 0 0 2px rgba(0,0,0,0.05)',
};

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap');
`;

interface VelocityVaultProps {
  title?: string;
  websites: Website[];
}

export default function VelocityVault({
  title = 'Velocity Deck',
  websites,
}: VelocityVaultProps) {
  // Generate items from websites (use first 15 for variety)
  const websiteItems = React.useMemo(() => {
    return websites.slice(0, 15).map((w, idx) => ({
      uniqueId: `website-${w.id || idx}`,
      title: w.name,
      tag: w.displayCategory || w.category,
      img: w.screenshotUrl,
      slug: w.slug,
    }));
  }, [websites]);

  // -- DATA LOGIC --
  const generateLevelData = React.useCallback(
    (levelIndex: number) => {
      const newItems = [];
      const startIdx = (levelIndex - 1) * 5;
      for (let i = 0; i < 5; i++) {
        const itemIdx = (startIdx + i) % websiteItems.length;
        newItems.push(websiteItems[itemIdx]);
      }
      return newItems;
    },
    [websiteItems]
  );

  // -- STATE --
  const [level, setLevel] = React.useState(1);
  const [queue, setQueue] = React.useState<typeof websiteItems>([]);
  const [bank, setBank] = React.useState<typeof websiteItems>([]);
  const [mode, setMode] = React.useState<'deck' | 'grid' | 'community'>('deck');

  // Initialize queue on mount and when level changes
  React.useEffect(() => {
    setQueue(generateLevelData(1));
  }, [generateLevelData]);

  // Combo
  const [combo, setCombo] = React.useState(0);
  const [showCombo, setShowCombo] = React.useState(false);
  const shakeControls = useAnimation();

  // -- 3D CARD TILT LOGIC --
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left - width / 2);
    mouseY.set(clientY - top - height / 2);
  }

  // -- INTERACTIONS --
  const handleCollect = React.useCallback(async () => {
    if (queue.length === 0) return;
    setCombo((c) => c + 1);
    setShowCombo(true);
    setTimeout(() => setShowCombo(false), 800);

    const shakeIntensity = Math.min(combo + 2, 10);
    shakeControls.start({
      x: [0, -shakeIntensity, shakeIntensity, 0],
      transition: { duration: 0.1 },
    });

    const currentCard = queue[0];
    const remaining = queue.slice(1);
    setBank([...bank, currentCard]);
    setQueue(remaining);

    if (remaining.length === 0) setTimeout(() => setMode('grid'), 250);
  }, [queue, combo, bank, shakeControls]);

  const handleNextLevel = React.useCallback(() => {
    if (level >= 3) {
      setMode('community');
      return;
    }
    setMode('deck');
    setBank([]);
    setCombo(0);
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setTimeout(() => setQueue(generateLevelData(nextLevel)), 300);
  }, [level, generateLevelData]);

  const progress = (bank.length / 5) * 100;

  return (
    <motion.section
      animate={shakeControls}
      style={{
        width: '100%',
        minHeight: '850px',
        backgroundColor: THEME.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", sans-serif',
        color: THEME.text,
      }}
    >
      <style jsx global>{fontStyles}</style>

      {/* LIGHT MODE GRID */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#CCC 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(circle, black 40%, transparent 80%)',
        }}
      />

      {/* HUD */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        style={{
          position: 'absolute',
          top: 40,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid ${THEME.border}`,
          boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)',
          padding: '8px 20px',
          borderRadius: '100px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: THEME.dim,
            fontWeight: 700,
          }}
        >
          SEQ_0{level}
        </span>
        <div
          style={{
            width: '100px',
            height: '4px',
            background: '#E5E5E5',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            style={{ height: '100%', background: THEME.accent }}
          />
        </div>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: THEME.text,
            fontWeight: 'bold',
          }}
        >
          {bank.length}/5
        </span>
      </motion.div>

      {/* COMBO POPUP */}
      <AnimatePresence>
        {showCombo && combo > 1 && (
          <motion.div
            key="combo-popup"
            initial={{ scale: 0.5, y: 20, opacity: 0 }}
            animate={{
              scale: 1.2,
              y: -40,
              opacity: 1,
              rotate: Math.random() * 10 - 5,
            }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: '45%',
              zIndex: 60,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 900,
                fontSize: '64px',
                color: THEME.combo,
                lineHeight: 0.8,
                fontStyle: 'italic',
                textShadow: '0 4px 0px rgba(0,0,0,0.1)',
              }}
            >
              {combo}x
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN STAGE */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '600px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <AnimatePresence mode="wait">
          {/* --- 1. DECK MODE --- */}
          {mode === 'deck' && (
            <motion.div
              key="deck"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 1.1,
                filter: 'blur(10px)',
                transition: { duration: 0.2 },
              }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '340px',
                  height: '460px',
                  perspective: '1200px',
                }}
              >
                <AnimatePresence>
                  {queue.map((item, index) => (
                    <DeckCard
                      key={item.uniqueId}
                      item={item}
                      index={index}
                      onSwipe={handleCollect}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  marginTop: '40px',
                  textAlign: 'center',
                }}
              >
                <h2
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: '32px',
                    color: THEME.text,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '-1px',
                  }}
                >
                  {title}
                </h2>
                <p
                  style={{
                    fontSize: '12px',
                    color: THEME.dim,
                    marginTop: '8px',
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '1px',
                  }}
                >
                  [ TAP TO ARCHIVE ]
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* --- 2. GRID MODE --- */}
          {mode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              <h2
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '40px',
                  color: THEME.text,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                <span style={{ color: THEME.success }}>✓</span> BATCH COMPLETE
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  width: '100%',
                }}
              >
                {bank.map((item, i) => (
                  <GridCard key={item.uniqueId} item={item} index={i} />
                ))}
              </div>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#000',
                  color: '#FFF',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextLevel}
                style={{
                  background: '#FFF',
                  color: '#000',
                  border: '2px solid #000',
                  padding: '16px 48px',
                  borderRadius: '100px',
                  fontSize: '14px',
                  fontWeight: 800,
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                }}
              >
                {level >= 3 ? 'Finalize Sequence' : 'Next Batch >>'}
              </motion.button>
            </motion.div>
          )}

          {/* --- 3. COMMUNITY MODE (PREMIUM UPGRADE) --- */}
          {mode === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onMouseMove={handleMouseMove} // Enable 3D Tilt
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: 2000,
              }}
            >
              {/* Ambient Light Behind Card */}
              <motion.div
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: '500px',
                  height: '500px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                  zIndex: 0,
                }}
              />

              {/* THE TITANIUM CARD */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  zIndex: 10,
                  transformStyle: 'preserve-3d',
                }}
                initial={{ scale: 0.8, rotateX: 20 }}
                animate={{ scale: 1, rotateX: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                <div
                  style={{
                    width: '440px',
                    height: '280px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #F9F9F9 0%, #DCDCDC 50%, #FFFFFF 100%)', // Brushed Metal
                    border: '1px solid #FFF',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 30px 60px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '32px',
                  }}
                >
                  {/* Iridescent Coating */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.3,
                      mixBlendMode: 'color-dodge',
                      background: 'linear-gradient(45deg, transparent 30%, #FFD700 45%, #00E5FF 55%, transparent 70%)',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '11px',
                        color: '#888',
                        letterSpacing: '2px',
                        fontWeight: 700,
                      }}
                    >
                      FOUNDER_ACCESS
                    </div>
                    {/* Platinum Chip */}
                    <div
                      style={{
                        width: 44,
                        height: 32,
                        borderRadius: '6px',
                        background: 'linear-gradient(to bottom right, #E0E0E0, #999)',
                        boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                  </div>

                  <div style={{ zIndex: 2 }}>
                    <div
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontSize: '36px',
                        color: '#111',
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        mixBlendMode: 'multiply',
                        opacity: 0.8,
                      }}
                    >
                      MEMBER
                    </div>
                    <div
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '14px',
                        color: '#666',
                        marginTop: '8px',
                        letterSpacing: '1px',
                      }}
                    >
                      0000 8888 2024 PLAT
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  marginTop: '60px',
                  textAlign: 'center',
                  zIndex: 10,
                }}
              >
                <h3
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '32px',
                    color: '#111',
                    marginBottom: '16px',
                    fontWeight: 700,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Welcome to the Inner Circle.
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '40px',
                    maxWidth: '400px',
                    lineHeight: 1.5,
                  }}
                >
                  Your sequence is archived. Use your pass to access our private design resources.
                </p>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: '#111',
                    color: '#FFF',
                    border: 'none',
                    padding: '20px 50px',
                    borderRadius: '100px',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: '"Inter", sans-serif',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  Claim Membership
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// --- SUB COMPONENTS ---
interface DeckCardItem {
  uniqueId: string;
  title: string;
  tag: string;
  img: string;
  slug?: string;
}

function DeckCard({
  item,
  index,
  onSwipe,
}: {
  item: DeckCardItem;
  index: number;
  onSwipe: () => void;
}) {
  if (index > 2) return null;
  const isTop = index === 0;
  return (
    <motion.div
      layoutId={item.uniqueId}
      onClick={isTop ? onSwipe : undefined}
      initial={{ scale: 0.8, y: 50, opacity: 0 }}
      animate={{
        scale: 1 - index * 0.05,
        y: index * 12,
        opacity: 1 - index * 0.3,
        filter: isTop ? 'blur(0px)' : 'blur(2px) grayscale(100%)',
      }}
      exit={{
        scale: 1.1,
        opacity: 0,
        filter: 'blur(10px)',
        transition: { duration: 0.15 },
      }}
      whileHover={
        isTop ? { scale: 1.02, y: -5, boxShadow: THEME.shadow } : {}
      }
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10 - index,
        borderRadius: '24px',
        backgroundColor: '#FFF',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: isTop ? '0 25px 50px -10px rgba(0,0,0,0.1)' : 'none',
        overflow: 'hidden',
        cursor: isTop ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          height: '70%',
          position: 'relative',
          background: '#F5F5F5',
        }}
      >
        {item.img ? (
          <Image
            src={item.img}
            alt={item.title}
            fill
            className="object-cover"
            sizes="340px"
          />
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <div
        style={{
          height: '30%',
          background: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: THEME.accent,
            marginBottom: '4px',
            fontWeight: 700,
          }}
        >
          {item.tag}
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: THEME.text,
            lineHeight: 1,
          }}
        >
          {item.title}
        </div>
      </div>
    </motion.div>
  );
}

function GridCard({ item, index }: { item: DeckCardItem; index: number }) {
  return (
    <motion.div
      layoutId={item.uniqueId}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 400 }}
      style={{
        height: '200px',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${THEME.border}`,
        background: '#FFF',
      }}
    >
      {item.img ? (
        <Image
          src={item.img}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 900px) 50vw, 200px"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#F0F0F0',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#000',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {item.title}
        </div>
      </div>
    </motion.div>
  );
}
