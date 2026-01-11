'use client';

import * as React from "react"
import {
    motion,
    AnimatePresence,
    useAnimation,
    useMotionValue,
    useTransform,
} from "framer-motion"

// --- 1. THEME: OBSIDIAN BLACK ---
const THEME = {
    bg: "#050505", // Deepest Void
    surface: "#111111", // Matte Carbon
    text: "#FFFFFF", // Pure White
    dim: "#666666", // Steel Grey
    combo: "#FFD700", // Gold (Combos)
    border: "rgba(255,255,255,0.12)",
    shadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
}

// --- LEVEL COLOR MAPPING ---
const LEVEL_COLORS = {
    1: "#3B82F6", // Level 1: Blue
    2: "#EF4444", // Level 2: Red
    3: "#FFD700", // Level 3: Gold
}

const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;900&family=Space+Grotesk:wght@500;700;900&family=JetBrains+Mono:wght@700&display=swap');
`

interface VelocityVaultObsidianProps {
    title?: string;
    t1?: string;
    tag1?: string;
    img1?: string;
    t2?: string;
    tag2?: string;
    img2?: string;
    t3?: string;
    tag3?: string;
    img3?: string;
    t4?: string;
    tag4?: string;
    img4?: string;
    t5?: string;
    tag5?: string;
    img5?: string;
    t6?: string;
    tag6?: string;
    img6?: string;
    t7?: string;
    tag7?: string;
    img7?: string;
    t8?: string;
    tag8?: string;
    img8?: string;
}

// --- 2. MAIN COMPONENT ---
export default function VelocityVaultObsidian(props: VelocityVaultObsidianProps) {
    const { title = "Velocity Deck" } = props

    // -- DATA LOGIC --
    const generateLevelData = React.useCallback((levelIndex: number) => {
        // Create array of available prop indices (1-8)
        const availableIndices = Array.from({ length: 8 }, (_, i) => i + 1);
        
        // Shuffle using Fisher-Yates algorithm
        const shuffled = [...availableIndices];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Take first 5 random indices for this level
        const selectedIndices = shuffled.slice(0, 5);
        
        const newItems = []
        for (let i = 0; i < 5; i++) {
            const propIndex = selectedIndices[i]
            newItems.push({
                uniqueId: `lvl-${levelIndex}-card-${i}`,
                title: props[`t${propIndex}` as keyof VelocityVaultObsidianProps] as string || '',
                tag: props[`tag${propIndex}` as keyof VelocityVaultObsidianProps] as string || '',
                img: props[`img${propIndex}` as keyof VelocityVaultObsidianProps] as string || '',
            })
        }
        return newItems
    }, [props])

    // -- STATE --
    const [level, setLevel] = React.useState(1)
    const [queue, setQueue] = React.useState(generateLevelData(1))
    const [bank, setBank] = React.useState<Array<{ uniqueId: string; title: string; tag: string; img: string }>>([])
    const [mode, setMode] = React.useState<"deck" | "grid" | "community">("deck")

    // Dynamic Color based on Level
    const currentAccent = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS[3]

    // Combo Logic
    const [combo, setCombo] = React.useState(0)
    const [showCombo, setShowCombo] = React.useState(false)
    const shakeControls = useAnimation()

    // -- 3D CARD TILT LOGIC (Gyroscopic) --
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const rotateX = useTransform(mouseY, [-300, 300], [15, -15])
    const rotateY = useTransform(mouseX, [-300, 300], [-15, 15])

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
        const { left, top, width, height } =
            currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left - width / 2)
        mouseY.set(clientY - top - height / 2)
    }

    // -- INTERACTIONS --
    const handleCollect = async () => {
        if (queue.length === 0) return

        // 1. Combo & Shake
        setCombo((c) => c + 1)
        setShowCombo(true)
        setTimeout(() => setShowCombo(false), 800)

        const shakeIntensity = Math.min(combo + 2, 12)
        shakeControls.start({
            x: [
                0,
                -shakeIntensity,
                shakeIntensity,
                -shakeIntensity / 2,
                shakeIntensity / 2,
                0,
            ],
            transition: { duration: 0.1 },
        })

        // 2. Logic
        const currentCard = queue[0]
        const remaining = queue.slice(1)
        setBank([...bank, currentCard])
        setQueue(remaining)

        // 3. Instant Level Check
        if (remaining.length === 0) {
            setTimeout(() => setMode("grid"), 250)
        }
    }

    const handleNextLevel = () => {
        if (level >= 3) {
            setMode("community")
            return
        }

        setMode("deck")
        setBank([])
        setCombo(0)
        setLevel((l) => {
            const newLevel = l + 1
            setTimeout(() => {
                setQueue(generateLevelData(newLevel))
            }, 300)
            return newLevel
        })
    }

    const progress = (bank.length / 5) * 100

    return (
        <motion.section
            animate={shakeControls}
            style={{
                width: "100%",
                minHeight: "850px",
                backgroundColor: THEME.bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                position: "relative",
                overflow: "hidden",
                fontFamily: `"Inter", sans-serif`,
                color: THEME.text,
            }}
        >
            <style jsx global>{fontStyles}</style>

            {/* DARK MODE GRID BACKGROUND */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.15,
                    pointerEvents: "none",
                    backgroundImage: `radial-gradient(#555 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                    maskImage:
                        "radial-gradient(circle, black 40%, transparent 80%)",
                }}
            />

            {/* HUD */}
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                style={{
                    position: "absolute",
                    top: 40,
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    background: "rgba(15,15,15,0.8)",
                    border: `1px solid ${THEME.border}`,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                    padding: "8px 20px",
                    borderRadius: "100px",
                    backdropFilter: "blur(10px)",
                }}
            >
                <span
                    style={{
                        fontFamily: `"JetBrains Mono", monospace`,
                        fontSize: "12px",
                        color: THEME.dim,
                        fontWeight: 700,
                    }}
                >
                    SEQ_0{level}
                </span>
                <div
                    style={{
                        width: "100px",
                        height: "4px",
                        background: "#333",
                        borderRadius: "10px",
                        overflow: "hidden",
                    }}
                >
                    <motion.div
                        animate={{
                            width: `${progress}%`,
                            backgroundColor: currentAccent,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                        style={{
                            height: "100%",
                            boxShadow: `0 0 10px ${currentAccent}`,
                        }}
                    />
                </div>
                <span
                    style={{
                        fontFamily: `"JetBrains Mono", monospace`,
                        fontSize: "12px",
                        color: THEME.text,
                        fontWeight: "bold",
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
                            position: "absolute",
                            top: "45%",
                            zIndex: 60,
                            pointerEvents: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: `"Space Grotesk", sans-serif`,
                                fontWeight: 900,
                                fontSize: "64px",
                                color: "transparent",
                                lineHeight: 0.8,
                                WebkitTextStroke: `2px ${THEME.combo}`,
                                fontStyle: "italic",
                                filter: `drop-shadow(0 0 10px ${THEME.combo})`,
                            }}
                        >
                            {combo}x
                        </div>
                        <div
                            style={{
                                fontFamily: `"JetBrains Mono", monospace`,
                                fontSize: "14px",
                                color: "#000",
                                fontWeight: 700,
                                letterSpacing: "2px",
                                background: THEME.combo,
                                padding: "4px 8px",
                                borderRadius: "4px",
                            }}
                        >
                            COMBO!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN STAGE */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    minHeight: "600px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                }}
            >
                <AnimatePresence mode="wait">
                    {/* --- 1. DECK MODE --- */}
                    {mode === "deck" && (
                        <motion.div
                            key="deck"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{
                                opacity: 0,
                                scale: 1.1,
                                filter: "blur(10px)",
                                transition: { duration: 0.2 },
                            }}
                            style={{
                                width: "100%",
                                height: "600px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "340px",
                                    height: "460px",
                                    perspective: "1200px",
                                }}
                            >
                                <AnimatePresence>
                                    {queue.map((item, index) => (
                                        <DeckCard
                                            key={item.uniqueId}
                                            item={item}
                                            index={index}
                                            accent={currentAccent}
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
                                    marginTop: "40px",
                                    textAlign: "center",
                                }}
                            >
                                <h2
                                    style={{
                                        fontFamily: `"Space Grotesk", sans-serif`,
                                        fontSize: "32px",
                                        color: THEME.text,
                                        margin: 0,
                                        textTransform: "uppercase",
                                        letterSpacing: "-1px",
                                    }}
                                >
                                    {title}
                                </h2>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: THEME.dim,
                                        marginTop: "8px",
                                        fontFamily: `"JetBrains Mono", monospace`,
                                        letterSpacing: "1px",
                                    }}
                                >
                                    [ TAP TO ARCHIVE ]
                                </p>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* --- 2. GRID MODE --- */}
                    {mode === "grid" && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "32px",
                                marginTop: "120px",
                                paddingBottom: "40px",
                            }}
                        >
                            <h2
                                style={{
                                    fontFamily: `"Space Grotesk", sans-serif`,
                                    fontSize: "40px",
                                    color: THEME.text,
                                    margin: 0,
                                    fontStyle: "italic",
                                }}
                            >
                                <span style={{ color: currentAccent }}>✓</span>{" "}
                                BATCH COMPLETE
                            </h2>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "24px",
                                    width: "100%",
                                    maxWidth: "1000px",
                                }}
                            >
                                {bank.map((item, i) => (
                                    <GridCard
                                        key={item.uniqueId}
                                        item={item}
                                        index={i}
                                        accent={currentAccent}
                                    />
                                ))}
                            </div>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: THEME.text,
                                    color: "#000",
                                    boxShadow: `0 0 20px ${currentAccent}`,
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextLevel}
                                style={{
                                    background: "transparent",
                                    color: "#FFF",
                                    border: `1px solid ${THEME.border}`,
                                    padding: "16px 48px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: 800,
                                    fontFamily: `"JetBrains Mono", monospace`,
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                    marginTop: "20px",
                                }}
                            >
                                {level >= 3
                                    ? "Unlock Rewards"
                                    : "Next Batch >>"}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* --- 3. COMMUNITY MODE (PLATINUM + DIAMOND) --- */}
                    {mode === "community" && (
                        <motion.div
                            key="community"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onMouseMove={handleMouseMove}
                            style={{
                                width: "100%",
                                height: "600px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                perspective: 2000,
                            }}
                        >
                            {/* Prism Glow */}
                            <motion.div
                                animate={{
                                    opacity: [0.5, 0.8, 0.5],
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 90, 180],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                style={{
                                    position: "absolute",
                                    width: "600px",
                                    height: "600px",
                                    background: `conic-gradient(from 0deg, #00FFFF, #FFFFFF, #00FFFF)`,
                                    filter: "blur(100px)",
                                    opacity: 0.15,
                                    zIndex: 0,
                                }}
                            />

                            {/* THE DIAMOND CARD */}
                            <motion.div
                                style={{
                                    rotateX,
                                    rotateY,
                                    zIndex: 10,
                                    transformStyle: "preserve-3d",
                                }}
                                initial={{ scale: 0.8, rotateX: 20 }}
                                animate={{ scale: 1, rotateX: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20,
                                    delay: 0.2,
                                }}
                            >
                                <div
                                    style={{
                                        width: "440px",
                                        height: "280px",
                                        borderRadius: "20px",
                                        // Platinum Gradient
                                        background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
                                        // Diamond Border
                                        border: `2px solid transparent`,
                                        backgroundClip: "padding-box",
                                        position: "relative",
                                        overflow: "hidden",
                                        boxShadow: `0 30px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(6,182,212,0.3)`,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        padding: "32px",
                                    }}
                                >
                                    {/* Border Gradient Hack */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: -2,
                                            zIndex: -1,
                                            background:
                                                "linear-gradient(45deg, #06B6D4, #FFFFFF, #06B6D4)",
                                            borderRadius: "22px",
                                        }}
                                    />

                                    {/* Holographic Texture */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            opacity: 0.3,
                                            backgroundImage:
                                                "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))",
                                            backgroundSize: "4px 4px",
                                        }}
                                    />

                                    {/* Moving Sheen (Prismatic) */}
                                    <motion.div
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            repeatDelay: 1,
                                            ease: "easeInOut",
                                        }}
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background:
                                                "linear-gradient(9deg, transparent, rgba(255,255,255,0.4), transparent)",
                                            transform: "skewX(-20deg)",
                                            mixBlendMode: "overlay",
                                        }}
                                    />

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            zIndex: 2,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily: `"JetBrains Mono", monospace`,
                                                fontSize: "11px",
                                                color: "#06B6D4",
                                                letterSpacing: "2px",
                                                fontWeight: 700,
                                                textShadow: "0 0 10px #06B6D4",
                                            }}
                                        >
                                            DIAMOND_TIER
                                        </div>
                                        <div
                                            style={{
                                                width: 44,
                                                height: 30,
                                                borderRadius: "6px",
                                                background:
                                                    "linear-gradient(135deg, #e2e8f0, #94a3b8)",
                                                border: "1px solid #FFF",
                                                boxShadow:
                                                    "0 0 15px rgba(255,255,255,0.5)",
                                            }}
                                        />
                                    </div>

                                    <div style={{ zIndex: 2 }}>
                                        <div
                                            style={{
                                                fontFamily: `"Space Grotesk", sans-serif`,
                                                fontSize: "32px",
                                                color: "#FFF",
                                                fontWeight: 900,
                                                letterSpacing: "-1px",
                                                textShadow:
                                                    "0 0 20px rgba(255,255,255,0.5)",
                                                background:
                                                    "linear-gradient(to bottom, #FFF 40%, #94a3b8 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor:
                                                    "transparent",
                                            }}
                                        >
                                            PLATINUM ACCESS
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: `"JetBrains Mono", monospace`,
                                                fontSize: "14px",
                                                color: "#94a3b8",
                                                marginTop: "8px",
                                                letterSpacing: "1px",
                                            }}
                                        >
                                            8888 9999 2026 VIP
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                style={{
                                    marginTop: "60px",
                                    textAlign: "center",
                                    zIndex: 10,
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: `"Inter", sans-serif`,
                                        fontSize: "28px",
                                        color: THEME.text,
                                        marginBottom: "12px",
                                        fontWeight: 700,
                                    }}
                                >
                                    Welcome to the Inner Circle.
                                </h3>
                                <p
                                    style={{
                                        fontSize: "16px",
                                        color: THEME.dim,
                                        lineHeight: 1.6,
                                        marginBottom: "32px",
                                        maxWidth: "400px",
                                    }}
                                >
                                    You have achieved the ultimate status. Your
                                    Platinum + Diamond privileges are now
                                    active.
                                </p>
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 30px #06B6D4",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        background: "#FFF",
                                        color: "#000",
                                        border: "none",
                                        padding: "20px 50px",
                                        borderRadius: "100px",
                                        fontSize: "16px",
                                        fontWeight: 800,
                                        fontFamily: `"Inter", sans-serif`,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        margin: "0 auto",
                                    }}
                                >
                                    Enter Portal <span>→</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    )
}

// --- SUB: DECK CARD ---
interface DeckCardProps {
    item: { uniqueId: string; title: string; tag: string; img: string };
    index: number;
    onSwipe: () => void;
    accent: string;
}

function DeckCard({ item, index, onSwipe, accent }: DeckCardProps) {
    if (index > 2) return null
    const isTop = index === 0

    return (
        <motion.div
            layoutId={item.uniqueId}
            onClick={isTop ? onSwipe : undefined}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{
                scale: 1 - index * 0.05,
                y: index * 12,
                opacity: 1 - index * 0.3,
                filter: isTop ? "blur(0px)" : "blur(2px) grayscale(100%)",
            }}
            exit={{
                scale: 1.1,
                opacity: 0,
                filter: "blur(10px)",
                transition: { duration: 0.15 },
            }}
            whileHover={
                isTop
                    ? {
                          scale: 1.02,
                          y: -5,
                          borderColor: accent,
                          boxShadow: `0 0 20px ${accent}`,
                      }
                    : {}
            }
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 10 - index,
                borderRadius: "24px",
                backgroundColor: THEME.surface,
                border: `1px solid ${isTop ? accent : THEME.border}`,
                boxShadow: isTop ? "0 25px 50px -10px rgba(0,0,0,0.5)" : "none",
                overflow: "hidden",
                cursor: isTop ? "pointer" : "default",
            }}
        >
            <div
                style={{
                    height: "70%",
                    position: "relative",
                    background: "#000",
                }}
            >
                {item.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.img}
                        alt={item.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.8,
                        }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%" }} />
                )}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to top, #0F0F0F 0%, transparent 100%)",
                    }}
                />
            </div>
            <div
                style={{
                    height: "30%",
                    background: THEME.surface,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 24px",
                    borderTop: `1px solid ${THEME.border}`,
                }}
            >
                <div
                    style={{
                        fontFamily: `"JetBrains Mono", monospace`,
                        fontSize: "10px",
                        color: accent,
                        marginBottom: "4px",
                        fontWeight: 700,
                    }}
                >
                    {item.tag}
                </div>
                <div
                    style={{
                        fontFamily: `"Space Grotesk", sans-serif`,
                        fontSize: "28px",
                        fontWeight: 700,
                        color: THEME.text,
                        lineHeight: 1,
                    }}
                >
                    {item.title}
                </div>
            </div>
        </motion.div>
    )
}

// --- SUB: GRID CARD ---
interface GridCardProps {
    item: { uniqueId: string; title: string; tag: string; img: string };
    index: number;
    accent: string;
}

function GridCard({ item, index, accent }: GridCardProps) {
    return (
        <motion.div
            layoutId={item.uniqueId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, type: "spring", stiffness: 400 }}
            whileHover={{
                scale: 1.02,
                boxShadow: "0 15px 30px -5px rgba(0,0,0,0.5)",
                borderColor: accent,
            }}
            style={{
                aspectRatio: "3/4",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                border: `1px solid ${THEME.border}`,
                background: THEME.surface,
                cursor: "pointer",
            }}
        >
            {item.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={item.img}
                    alt={item.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.7,
                        transition: "opacity 0.3s ease",
                    }}
                />
            ) : (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "#111",
                    }}
                />
            )}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                }}
            >
                <div
                    style={{
                        fontFamily: `"JetBrains Mono", monospace`,
                        fontSize: "10px",
                        color: accent,
                        marginBottom: "4px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                    }}
                >
                    {item.tag}
                </div>
                <div
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#FFF",
                        fontFamily: `"Space Grotesk", sans-serif`,
                        lineHeight: 1.1,
                    }}
                >
                    {item.title}
                </div>
            </div>
        </motion.div>
    )
}
