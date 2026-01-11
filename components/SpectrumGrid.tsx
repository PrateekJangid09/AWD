'use client';

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from 'next/link';
import { MACRO_CATEGORIES, getCategoryColor, slugifyCategory } from '@/lib/categories';
import { Website } from '@/lib/types';

// --- 1. THEME ---
const THEME = {
    bg: "#020202", // Seamless match with Hero
    cardBg: "rgba(10, 10, 10, 0.6)",
    cardBorder: "rgba(255,255,255,0.08)",
    text: "#FFFFFF",
    sub: "#888888",
};

const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
`;

interface SpectrumGridProps {
    title?: string;
    websites?: Website[];
}

interface CategoryData {
    id: string;
    name: string;
    count: number;
    color: string;
    tags: string[];
    slug: string;
}

// Generate tags based on category name
function generateTags(categoryName: string): string[] {
    const tagMap: Record<string, string[]> = {
        'SaaS': ['Dashboards', 'CRM', 'B2B'],
        'Agency/Studio': ['Creative', 'Design', 'Video'],
        'Portfolio': ['Personal', 'Photography', 'CV'],
        'Fintech': ['Banking', 'Crypto', 'Wallets'],
        'E-commerce': ['Shopify', 'DTC', 'Fashion'],
        'Developer': ['Docs', 'APIs', 'Open Source'],
        'AI': ['LLMs', 'Agents', 'Chat'],
        'AI Agent': ['Agents', 'Automation', 'AI Tools'],
        'Crypto/Web3': ['DeFi', 'NFT', 'DAO'],
        'Health': ['Wellness', 'Clinics', 'Apps'],
        'Education': ['Courses', 'Learning', 'Platforms'],
        'Template': ['Designs', 'Resources', 'Kits'],
        'Other': ['Various', 'Mixed', 'General'],
    };
    return tagMap[categoryName] || ['Explore', 'Browse', 'Discover'];
}

export default function SpectrumGrid({
    title = "BROWSE SECTORS",
    websites = [],
}: SpectrumGridProps) {
    // Calculate category data from real websites
    const categories: CategoryData[] = React.useMemo(() => {
        const categoriesList = MACRO_CATEGORIES.filter(cat => cat !== 'Browse All');
        
        return categoriesList.map((catName) => {
            const categoryWebsites = websites.filter(
                (site) => (site.displayCategory || site.category) === catName
            );
            const count = categoryWebsites.length;
            
            return {
                id: slugifyCategory(catName),
                name: catName,
                count,
                color: getCategoryColor(catName),
                tags: generateTags(catName),
                slug: slugifyCategory(catName),
            };
        });
    }, [websites]);

    return (
        <section
            style={{
                width: "100%",
                backgroundColor: THEME.bg,
                padding: "80px 24px 160px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: `"Inter", sans-serif`,
            }}
        >
            <style jsx global>{fontStyles}</style>

            {/* SECTION LABEL */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    marginBottom: "40px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <div
                    style={{
                        height: "1px",
                        flex: 1,
                        background: "rgba(255,255,255,0.1)",
                    }}
                />
                <span
                    style={{
                        fontSize: "12px",
                        color: THEME.sub,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        fontWeight: 600,
                    }}
                >
                    {title}
                </span>
                <div
                    style={{
                        height: "1px",
                        flex: 1,
                        background: "rgba(255,255,255,0.1)",
                    }}
                />
            </div>

            {/* GRID CONTAINER */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "24px",
                    width: "100%",
                    maxWidth: "1200px",
                }}
            >
                {categories.map((cat, i) => (
                    <SpectrumCard key={cat.id} data={cat} index={i} />
                ))}
            </div>
        </section>
    );
}

// --- 4. THE SPECTRUM CARD ---
interface SpectrumCardProps {
    data: CategoryData;
    index: number;
}

function SpectrumCard({ data, index }: SpectrumCardProps) {
    const { name, count, color, tags, slug } = data;

    // Mouse Spotlight Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <Link href={`/c/${slug}`} style={{ textDecoration: 'none', display: 'contents' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05 }}
                onMouseMove={handleMouseMove}
                whileHover="hover"
                style={{
                    height: "280px",
                    position: "relative",
                    backgroundColor: THEME.cardBg,
                    borderRadius: "20px",
                    border: `1px solid ${THEME.cardBorder}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "32px",
                }}
            >
                {/* 1. DYNAMIC BACKGROUND MESH */}
                {/* This creates the breathing "Holo" effect specific to the category color */}
                <motion.div
                    animate={{
                        background: [
                            `radial-gradient(circle at 0% 0%, ${color}10 0%, transparent 50%)`,
                            `radial-gradient(circle at 100% 100%, ${color}10 0%, transparent 50%)`,
                            `radial-gradient(circle at 0% 0%, ${color}10 0%, transparent 50%)`,
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                    }}
                />

                {/* 2. SPOTLIGHT OVERLAY (Follows Mouse) */}
                <motion.div
                    style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        background: useMotionTemplate`
                            radial-gradient(
                                500px circle at ${mouseX}px ${mouseY}px,
                                ${color}15,
                                transparent 80%
                            )
                        `,
                    }}
                    variants={{ hover: { opacity: 1 } }}
                />

                {/* 3. CARD CONTENT: HEADER */}
                <div style={{ position: "relative", zIndex: 10 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "24px",
                        }}
                    >
                        {/* Icon Box */}
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.03)",
                                border: `1px solid ${THEME.cardBorder}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: color,
                                fontSize: "20px",
                                fontWeight: 700,
                                fontFamily: `"Space Grotesk", sans-serif`,
                                boxShadow: `0 0 20px ${color}10`,
                            }}
                        >
                            {name[0]}
                        </div>

                        {/* Arrow Button (Animates on hover) */}
                        <motion.div
                            variants={{
                                hover: {
                                    x: 5,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                },
                            }}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                border: `1px solid ${THEME.cardBorder}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFF",
                                fontSize: "14px",
                            }}
                        >
                            ↗
                        </motion.div>
                    </div>

                    <h3
                        style={{
                            margin: 0,
                            fontSize: "28px",
                            fontFamily: `"Space Grotesk", sans-serif`,
                            color: "#FFF",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        {name}
                    </h3>
                </div>

                {/* 4. CARD CONTENT: FOOTER (Reveals on Hover) */}
                <div style={{ position: "relative", zIndex: 10 }}>
                    {/* Default State: Count */}
                    <motion.div
                        variants={{ hover: { opacity: 0, y: -10 } }}
                        style={{
                            fontSize: "14px",
                            color: THEME.sub,
                            fontFamily: `"Inter", sans-serif`,
                        }}
                    >
                        {count} Templates Available
                    </motion.div>

                    {/* Hover State: Sub-tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        variants={{ hover: { opacity: 1, y: 0 } }}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                        }}
                    >
                        {tags.map((tag, i) => (
                            <span
                                key={i}
                                style={{
                                    fontSize: "11px",
                                    color: color,
                                    background: `${color}15`,
                                    border: `1px solid ${color}30`,
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* 5. ACTIVE BORDER GLOW */}
                <motion.div
                    variants={{ hover: { opacity: 1 } }}
                    initial={{ opacity: 0 }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "20px",
                        border: `1px solid ${color}`,
                        pointerEvents: "none",
                        boxShadow: `inset 0 0 20px ${color}10`,
                    }}
                />
            </motion.div>
        </Link>
    );
}