'use client';

import * as React from "react";
import { motion, useTime, useTransform, useMotionTemplate } from "framer-motion";

// --- 1. THEME: LIQUID METAL & VOID ---
const THEME = {
    bg: "#020202",
    text: "#FFFFFF",
    sub: "#888888",
    accent: "#3B82F6",
    glass: "rgba(255, 255, 255, 0.03)",
    border: "rgba(255, 255, 255, 0.08)",
};

const CATEGORIES_TICKER = [
    "SaaS",
    "•",
    "Fintech",
    "•",
    "Agency",
    "•",
    "AI Models",
    "•",
    "Web3",
    "•",
    "E-Commerce",
    "•",
    "Portfolio",
    "•",
    "Health",
    "•",
    "Developer",
    "•",
    "Minimalist",
    "•",
    "Dark Mode",
    "•",
];

const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700;800&display=swap');
    
    .gradient-text {
        background: linear-gradient(to bottom, #FFFFFF 20%, #666666 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

interface LuminousGatewayProps {
    title?: string;
    subtitle?: string;
    placeholder?: string;
}

// --- 2. MAIN COMPONENT ---
export default function LuminousGateway({
    title = "THE ARCHIVE",
    subtitle = "A curated collection of digital design systems and templates.",
    placeholder = "What are you building today?",
}: LuminousGatewayProps) {
    // Dynamic Background Gradient
    const time = useTime();
    const rotate = useTransform(time, [0, 10000], [0, 360]);

    // Ticker Animation
    const tickerX = useTransform(time, [0, 20000], [0, -1000]);

    return (
        <section
            style={{
                width: "100%",
                height: "800px",
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

            {/* --- 1. AMBIENT LIGHTING --- */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                {/* The "Aurora" Blob */}
                <motion.div
                    style={{
                        position: "absolute",
                        top: "-20%",
                        left: "50%",
                        width: "1000px",
                        height: "1000px",
                        x: "-50%",
                        rotate: rotate,
                        background:
                            "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.15) 60deg, transparent 120deg)",
                        filter: "blur(80px)",
                        opacity: 0.6,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")`,
                        opacity: 0.05,
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* --- 2. CENTER STAGE --- */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    width: "100%",
                    maxWidth: "800px",
                    padding: "0 24px",
                    textAlign: "center",
                }}
            >
                {/* Floating Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 16px",
                        borderRadius: "100px",
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${THEME.border}`,
                        backdropFilter: "blur(10px)",
                        marginBottom: "32px",
                        boxShadow: "0 10px 20px -5px rgba(0,0,0,0.5)",
                    }}
                >
                    <div
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#FFF",
                            boxShadow: "0 0 10px #FFF",
                        }}
                    />
                    <span
                        style={{
                            fontSize: "12px",
                            color: "#CCC",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontWeight: 600,
                        }}
                    >
                        Library v4.0
                    </span>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="gradient-text"
                    style={{
                        fontFamily: `"Space Grotesk", sans-serif`,
                        fontSize: "clamp(64px, 10vw, 110px)",
                        lineHeight: 0.9,
                        fontWeight: 800,
                        margin: "0 0 24px 0",
                        letterSpacing: "-3px",
                    }}
                >
                    {title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{
                        fontSize: "18px",
                        color: THEME.sub,
                        maxWidth: "500px",
                        margin: "0 auto 48px auto",
                        lineHeight: 1.6,
                    }}
                >
                    {subtitle}
                </motion.p>

                {/* --- THE HALO SEARCH --- */}
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
                            background: "rgba(15, 15, 15, 0.8)",
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${THEME.border}`,
                            borderRadius: "20px",
                            padding: "8px 8px 8px 20px",
                            boxShadow: "0 20px 50px -10px rgba(0,0,0,0.8)",
                        }}
                    >
                        <SearchIcon />

                        <input
                            placeholder={placeholder}
                            style={{
                                flex: 1,
                                height: "48px",
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                color: "#FFF",
                                fontSize: "16px",
                                fontFamily: `"Inter", sans-serif`,
                                marginLeft: "12px",
                            }}
                        />

                        <button
                            style={{
                                padding: "12px 24px",
                                borderRadius: "14px",
                                background: "#FFF",
                                color: "#000",
                                border: "none",
                                fontWeight: 600,
                                fontSize: "14px",
                                cursor: "pointer",
                                fontFamily: `"Space Grotesk", sans-serif`,
                            }}
                        >
                            Search
                        </button>
                    </div>

                    {/* Glow Under Search */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "100%",
                            height: "100%",
                            background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
                            opacity: 0.2,
                            filter: "blur(60px)",
                            zIndex: -1,
                        }}
                    />
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        marginTop: "24px",
                        display: "flex",
                        justifyContent: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <span style={{ fontSize: "12px", color: "#444" }}>
                        Trending:
                    </span>
                    {["SaaS", "AI Agents", "Portfolio"].map((tag) => (
                        <span
                            key={tag}
                            style={{
                                fontSize: "12px",
                                color: THEME.sub,
                                cursor: "pointer",
                                textDecoration: "underline",
                                textUnderlineOffset: "4px",
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* --- 3. INFINITE TICKER FOOTER --- */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "60px",
                    borderTop: `1px solid ${THEME.border}`,
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(5px)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "100px",
                        background:
                            "linear-gradient(90deg, #020202, transparent)",
                        zIndex: 10,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: "100px",
                        background:
                            "linear-gradient(-90deg, #020202, transparent)",
                        zIndex: 10,
                    }}
                />

                <motion.div
                    style={{
                        display: "flex",
                        gap: "40px",
                        x: tickerX,
                        whiteSpace: "nowrap",
                    }}
                >
                    {[
                        ...CATEGORIES_TICKER,
                        ...CATEGORIES_TICKER,
                        ...CATEGORIES_TICKER,
                    ].map((item, i) => (
                        <span
                            key={i}
                            style={{
                                fontFamily: `"Space Grotesk", sans-serif`,
                                fontSize: "12px",
                                color: item === "•" ? "#333" : "#666",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                fontWeight: 600,
                            }}
                        >
                            {item}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function SearchIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    );
}