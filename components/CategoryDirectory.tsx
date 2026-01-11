'use client';

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';
import { MACRO_CATEGORIES, getCategoryColor, slugifyCategory } from '@/lib/categories';
import { Website } from '@/lib/types';

// --- 1. THEME SYSTEM ---
const THEME = {
    bg: "#020202",
    text: "#FFFFFF",
    sub: "#888888",
    cardBg: "#0A0A0A",
    cardBorder: "rgba(255,255,255,0.08)",
    accent: "#3B82F6", // Default accent
};

const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
`;

interface CategoryDirectoryProps {
    title?: string;
    subtitle?: string;
    websites?: Website[];
}

interface CategoryData {
    id: string;
    name: string;
    count: number;
    featured: boolean;
    color: string;
    slug: string;
    previews: string[]; // Screenshot URLs for preview
}

export default function CategoryDirectory({
    title = "Directory",
    subtitle = "Browse our comprehensive collection of design templates.",
    websites = [],
}: CategoryDirectoryProps) {
    // Calculate category data from real websites
    const categories: CategoryData[] = React.useMemo(() => {
        const categoriesList = MACRO_CATEGORIES.filter(cat => cat !== 'Browse All');
        
        return categoriesList.map((catName, index) => {
            const categoryWebsites = websites.filter(
                (site) => (site.displayCategory || site.category) === catName
            );
            const count = categoryWebsites.length;
            
            // Mark first 2 as featured for layout variety
            const featured = index < 2;
            
            // Get first 3 websites' screenshots for preview
            const previews = categoryWebsites
                .slice(0, 3)
                .map(site => site.screenshotUrl || '');
            
            return {
                id: slugifyCategory(catName),
                name: catName,
                count,
                featured,
                color: getCategoryColor(catName),
                slug: slugifyCategory(catName),
                previews,
            };
        });
    }, [websites]);

    return (
        <section
            style={{
                width: "100%",
                backgroundColor: THEME.bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "120px 0",
                fontFamily: `"Inter", sans-serif`,
                position: "relative",
            }}
        >
            <style jsx global>{fontStyles}</style>

            {/* Background Texture */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: `url("https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png")`,
                    pointerEvents: "none",
                }}
            />

            {/* --- THE CATEGORY GRID --- */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    // Auto-dense packing for bento feel
                    gridAutoFlow: "dense",
                    gap: "24px",
                    width: "100%",
                    maxWidth: "1200px",
                    padding: "0 24px",
                    zIndex: 10,
                    position: "relative",
                }}
            >
                {categories.map((cat, i) => (
                    <CategoryCard key={cat.id} data={cat} index={i} />
                ))}
            </div>
        </section>
    );
}

// --- SUB-COMPONENT: CATEGORY CARD ---
interface CategoryCardProps {
    data: CategoryData;
    index: number;
}

function CategoryCard({ data, index }: CategoryCardProps) {
    const { name, count, featured, color, slug, previews } = data;

    // Mouse Spotlight Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <Link 
            href={`/c/${slug}`} 
            style={{ 
                textDecoration: 'none', 
                display: 'contents',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05 }}
                onMouseMove={handleMouseMove}
                style={{
                    gridColumn: featured ? "span 2" : "span 1",
                    gridRow: featured ? "span 2" : "span 1",
                    height: featured ? "400px" : "240px",
                    position: "relative",
                    backgroundColor: THEME.cardBg,
                    borderRadius: "24px",
                    border: `1px solid ${THEME.cardBorder}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "32px",
                }}
                whileHover="hover"
            >
                {/* 1. Spotlight Gradient Background */}
                <motion.div
                    style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        background: useMotionTemplate`
                            radial-gradient(
                                600px circle at ${mouseX}px ${mouseY}px,
                                ${color}15,
                                transparent 80%
                            )
                        `,
                    }}
                    variants={{ hover: { opacity: 1 } }}
                />

                {/* 2. Top Content: Icon & Count */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
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
                        }}
                    >
                        {name[0]}
                    </div>

                    <div
                        style={{
                            fontFamily: `"Inter", sans-serif`,
                            fontSize: "13px",
                            color: THEME.sub,
                            background: "rgba(255,255,255,0.03)",
                            padding: "6px 12px",
                            borderRadius: "100px",
                            border: `1px solid ${THEME.cardBorder}`,
                        }}
                    >
                        {count} items
                    </div>
                </div>

                {/* 3. The "Peek" Previews (Slide up on hover) */}
                <motion.div
                    variants={{ hover: { y: -10, opacity: 1 } }}
                    initial={{ y: 20, opacity: 0 }}
                    style={{
                        position: "absolute",
                        top: "20%",
                        right: "-10%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        transform: "rotate(-10deg)",
                        opacity: 0.5,
                    }}
                >
                    {previews.map((screenshotUrl, i) => (
                        <div
                            key={i}
                            style={{
                                width: "140px",
                                height: "80px",
                                backgroundColor: "#1a1a1a",
                                border: `1px solid ${THEME.cardBorder}`,
                                borderRadius: "8px",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {screenshotUrl && (
                                <Image
                                    src={screenshotUrl}
                                    alt={`${name} preview ${i + 1}`}
                                    fill
                                    style={{
                                        objectFit: "cover",
                                        objectPosition: "top",
                                    }}
                                    sizes="140px"
                                />
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* 4. Bottom Content: Title & Arrow */}
                <div style={{ position: "relative", zIndex: 10 }}>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: featured ? "32px" : "24px",
                            fontFamily: `"Space Grotesk", sans-serif`,
                            color: "#FFF",
                            maxWidth: "80%",
                        }}
                    >
                        {name}
                    </h3>

                    {/* Reveal Arrow */}
                    <motion.div
                        variants={{ hover: { x: 5, opacity: 1 } }}
                        initial={{ x: 0, opacity: 0.5 }}
                        style={{
                            marginTop: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            color: color,
                            fontWeight: 500,
                        }}
                    >
                        Explore Collection →
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    );
}