'use client';

import * as React from "react";
import { motion, useTime, useTransform } from "framer-motion";

// --- 1. THEME ---
const THEME = {
    bg: "#020202",
    text: "#FFFFFF",
    sub: "#888888",
    accent: "#3B82F6",
    grid: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.1)",
};

const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
`;

interface ArchiveHeroProps {
    title?: string;
    subtitle?: string;
    placeholder?: string;
}

// --- 2. MAIN COMPONENT ---
export default function ArchiveHero({
    title = "THE ARCHIVE",
    subtitle = "Explore our comprehensive database of templates and systems.",
    placeholder = "Search for categories, tags, or styles...",
}: ArchiveHeroProps) {
    // Infinite Grid Animation
    const time = useTime();
    const gridY = useTransform(time, [0, 2000], [0, 40]); // Moves 40px (one grid square) every 2s

    return (
        <section
            style={{
                width: "100%",
                height: "600px",
                backgroundColor: THEME.bg,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                fontFamily: `"Inter", sans-serif`,
            }}
        >
            <style jsx global>{fontStyles}</style>

            {/* --- 1. BACKGROUND: THE INFINITY FLOOR --- */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    perspective: "500px", // Deep perspective
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            >
                {/* The Grid Plane */}
                <motion.div
                    style={{
                        position: "absolute",
                        top: "0%",
                        left: "-50%",
                        right: "-50%",
                        bottom: "-50%",
                        width: "200%",
                        height: "200%",
                        transformOrigin: "center top",
                        rotateX: "60deg", // Tilt it flat
                        y: gridY, // Move it endlessly
                        backgroundImage: `
                            linear-gradient(to right, ${THEME.grid} 1px, transparent 1px),
                            linear-gradient(to bottom, ${THEME.grid} 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                        maskImage:
                            "linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)",
                    }}
                />

                {/* Horizon Fog */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to bottom, #020202 20%, transparent 50%, #020202 100%)",
                    }}
                />
            </div>

            {/* --- 2. CONTENT --- */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    textAlign: "center",
                    width: "100%",
                    maxWidth: "800px",
                    padding: "0 24px",
                }}
            >
                {/* System Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        borderRadius: "100px",
                        border: `1px solid ${THEME.border}`,
                        background: "rgba(255,255,255,0.02)",
                        marginBottom: "32px",
                    }}
                >
                    <div
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#10B981",
                            boxShadow: "0 0 10px #10B981",
                        }}
                    />
                    <span
                        style={{
                            fontSize: "12px",
                            color: THEME.sub,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontWeight: 600,
                        }}
                    >
                        Archive Online
                    </span>
                </motion.div>

                {/* Massive Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontFamily: `"Space Grotesk", sans-serif`,
                        fontSize: "clamp(56px, 8vw, 96px)",
                        color: "#FFF",
                        margin: "0 0 24px 0",
                        letterSpacing: "-2px",
                        lineHeight: 0.9,
                        textShadow: "0 20px 60px rgba(0,0,0,0.8)",
                    }}
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontSize: "18px",
                        color: THEME.sub,
                        marginBottom: "48px",
                        maxWidth: "500px",
                        margin: "0 auto 48px auto",
                    }}
                >
                    {subtitle}
                </motion.p>

                {/* --- 3. THE SEARCH BAR (HERO OBJECT) --- */}
                <motion.div
                    initial={{ width: "80%", opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    style={{
                        position: "relative",
                        maxWidth: "600px",
                        margin: "0 auto",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(20, 20, 20, 0.6)",
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${THEME.border}`,
                            borderRadius: "16px",
                            padding: "4px",
                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                        }}
                    >
                        {/* Search Icon */}
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: THEME.sub,
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                ></line>
                            </svg>
                        </div>

                        {/* Input Field */}
                        <input
                            placeholder={placeholder}
                            style={{
                                flex: 1,
                                height: "50px",
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                color: "#FFF",
                                fontSize: "16px",
                                fontFamily: `"Inter", sans-serif`,
                                paddingRight: "16px",
                            }}
                        />

                        {/* Command Key Visual */}
                        <div
                            style={{
                                padding: "6px 10px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                border: `1px solid ${THEME.border}`,
                                color: THEME.sub,
                                fontSize: "12px",
                                fontWeight: 600,
                                marginRight: "8px",
                            }}
                        >
                            ⌘K
                        </div>
                    </div>

                    {/* Glow Under Search */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "110%",
                            height: "50px",
                            background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
                            opacity: 0.15,
                            filter: "blur(40px)",
                            zIndex: -1,
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
}