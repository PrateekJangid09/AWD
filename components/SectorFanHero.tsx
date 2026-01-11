'use client';

import * as React from "react"
import { motion } from "framer-motion"
import Link from 'next/link';
import { Website } from '@/lib/types';
import { MACRO_CATEGORIES, getCategoryColor, slugifyCategory } from '@/lib/categories';

// --- 1. THEME: OBSIDIAN & GLASS ---
const THEME = {
    bg: "#050505",
    text: "#FFFFFF",
    sub: "#888888",
    cardBg: "#0F0F0F",
    border: "rgba(255,255,255,0.1)",
}

const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
`

interface SectorFanHeroProps {
    title?: string;
    subtitle?: string;
    websites: Website[];
    currentCategory?: string;
}

interface CategoryData {
    id: string;
    label: string;
    color: string;
    count: number;
    slug: string;
    image: string;
}

// --- 3. MAIN COMPONENT ---
export default function SectorFanHero(props: SectorFanHeroProps) {
    const { title = "THE SECTORS", subtitle, websites, currentCategory } = props
    const [isHovering, setIsHovering] = React.useState(false)
    const [hoveredCardIndex, setHoveredCardIndex] = React.useState<number | null>(null)
    const [isMounted, setIsMounted] = React.useState(false)

    // Generate base categories data (deterministic for SSR)
    const baseCategories = React.useMemo<CategoryData[]>(() => {
        // Get all categories except "Browse All" and current category
        const availableCategories = MACRO_CATEGORIES.filter(
            (cat) => cat !== 'Browse All' && cat !== currentCategory
        );

        // Calculate count for each category and create category data
        return availableCategories.map((catName) => {
            const categoryWebsites = websites.filter(
                (site) => (site.displayCategory || site.category) === catName
            );
            // Get first website image (prefer featured, then first available)
            const featuredSite = categoryWebsites.find((site) => site.featured);
            const firstSite = categoryWebsites[0];
            const categoryImage = featuredSite?.screenshotUrl || firstSite?.screenshotUrl || '';
            
            return {
                id: slugifyCategory(catName),
                label: catName,
                color: getCategoryColor(catName),
                count: categoryWebsites.length,
                slug: slugifyCategory(catName),
                image: categoryImage,
            };
        });
    }, [websites, currentCategory]);

    // Shuffle categories only on client side after mount to prevent hydration errors
    const CATEGORIES = React.useMemo<CategoryData[]>(() => {
        if (!isMounted) {
            // Return first 7 categories deterministically for SSR
            return baseCategories.slice(0, 7);
        }
        
        // Shuffle and take first 7 for variety (client-side only)
        const shuffled = [...baseCategories];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, 7);
    }, [baseCategories, isMounted]);

    // Set mounted flag after hydration
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <section
            style={{
                width: "100%",
                height: "850px", // Tall hero section
                backgroundColor: THEME.bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                fontFamily: `"Inter", sans-serif`,
            }}
            // Trigger the fan spread when mouse enters the general area
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <style jsx global>{fontStyles}</style>

            {/* Background Atmosphere */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.3,
                    background:
                        "radial-gradient(circle at 50% 50%, #111 0%, #050505 70%)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    height: "1px",
                    background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
            />

            {/* HEADER TEXT (Fades out slightly when interacting with cards) */}
            <motion.div
                animate={{
                    opacity: isHovering ? 0.3 : 1,
                    y: isHovering ? -50 : 0,
                }}
                transition={{ duration: 0.5 }}
                style={{
                    textAlign: "center",
                    position: "absolute",
                    top: "15%",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            >
                <div
                    style={{
                        fontFamily: `"Inter", sans-serif`,
                        fontSize: "12px",
                        color: THEME.sub,
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        marginBottom: "16px",
                    }}
                >
                    Category Index
                </div>
                <h1
                    style={{
                        fontFamily: `"Space Grotesk", sans-serif`,
                        fontSize: "80px",
                        color: "#FFF",
                        margin: 0,
                        lineHeight: 0.9,
                        letterSpacing: "-2px",
                    }}
                >
                    {title}
                </h1>
            </motion.div>

            {/* THE FAN DECK CONTAINER */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "1000px",
                    height: "400px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 20,
                    perspective: "1000px", // Essential for 3D tilts
                }}
            >
                {CATEGORIES.map((cat, index) => {
                    // --- MATH FOR THE FAN ---
                    const total = CATEGORIES.length
                    const center = (total - 1) / 2
                    const offset = index - center // -3, -2, -1, 0, 1, 2, 3

                    // Idle State: Stacked with tiny random rotation
                    const idleX = offset * 5 // Slight separation so it's not a single line
                    const idleRotate = offset * 2

                    // Hover State: Spread out wide
                    const hoverX = offset * 130 // Spread width
                    const hoverRotate = offset * 5 // Fan arch

                    // Is this specific card being hovered?
                    const isSelfHovered = hoveredCardIndex === index

                    return (
                        <SectorCard
                            key={cat.id}
                            item={cat}
                            index={index}
                            x={isHovering ? hoverX : idleX}
                            rotate={isHovering ? hoverRotate : idleRotate}
                            isFanOpen={isHovering}
                            isSelfHovered={isSelfHovered}
                            setHovered={setHoveredCardIndex}
                        />
                    )
                })}
            </div>

            {/* INSTRUCTION (Only shows when closed) */}
            <motion.div
                animate={{
                    opacity: isHovering ? 0 : 1,
                    y: isHovering ? 20 : 0,
                }}
                style={{
                    position: "absolute",
                    bottom: "100px",
                    color: "#444",
                    fontSize: "12px",
                    fontFamily: `"Inter", sans-serif`,
                    letterSpacing: "1px",
                }}
            >
                HOVER TO EXPLORE SECTORS
            </motion.div>
        </section>
    )
}

// --- SUB-COMPONENT: SECTOR CARD ---
interface SectorCardProps {
    item: CategoryData;
    index: number;
    x: number;
    rotate: number;
    isFanOpen: boolean;
    isSelfHovered: boolean;
    setHovered: (index: number | null) => void;
}

function SectorCard({
    item,
    index,
    x,
    rotate,
    isFanOpen,
    isSelfHovered,
    setHovered,
}: SectorCardProps) {
    return (
        <Link href={`/c/${item.slug}`} style={{ textDecoration: 'none' }}>
            <motion.div
                // Layout animation for smooth position changes
                initial={false}
                animate={{
                    x: x,
                    rotate: isSelfHovered ? 0 : rotate, // Straighten if hovered
                    y: isSelfHovered ? -40 : 0, // Pop up if hovered
                    scale: isSelfHovered ? 1.1 : 1,
                    zIndex: isSelfHovered ? 50 : index, // Bring to front
                }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{
                    position: "absolute",
                    width: "220px",
                    height: "320px",
                    cursor: "pointer",
                    transformOrigin: "bottom center",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "16px",
                        backgroundColor: THEME.cardBg,
                        border: `1px solid ${isSelfHovered ? item.color : THEME.border}`, // Glow color on hover
                        boxShadow: isSelfHovered
                            ? `0 20px 50px -10px ${item.color}40`
                            : "0 10px 30px -10px #000",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "24px",
                        transition: "border 0.3s, box-shadow 0.3s",
                    }}
                >
                    {/* 1. Card Background Image */}
                    {item.image && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 0,
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.image}
                                alt={item.label}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    opacity: isSelfHovered ? 0.5 : (isFanOpen ? 0.3 : 0.15),
                                    filter: isSelfHovered 
                                        ? "grayscale(50%) brightness(0.6)" 
                                        : "grayscale(100%) brightness(0.4)",
                                    transition: "opacity 0.3s, filter 0.3s",
                                }}
                            />
                        </div>
                    )}

                    {/* 2. Card Background Gradient Overlay */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(to bottom, ${item.color}10, transparent)`,
                            opacity: isFanOpen ? 1 : 0, // Hide color when stacked
                            zIndex: 1,
                        }}
                    />

                    {/* 3. Dark Overlay for Text Readability */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "50%",
                            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                            zIndex: 1,
                        }}
                    />

                    {/* 4. Top Content */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                background: isSelfHovered
                                    ? item.color
                                    : "rgba(255,255,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#FFF",
                                transition: "background 0.3s",
                            }}
                        >
                            {item.label[0]}
                        </div>
                    </div>

                    {/* 5. Bottom Content */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div
                            style={{
                                fontFamily: `"Space Grotesk", sans-serif`,
                                fontSize: "24px",
                                fontWeight: 700,
                                color: "#FFF",
                                marginBottom: "4px",
                            }}
                        >
                            {item.label}
                        </div>
                        <div
                            style={{
                                fontFamily: `"Inter", sans-serif`,
                                fontSize: "12px",
                                color: THEME.sub,
                            }}
                        >
                            {item.count} Projects
                        </div>
                    </div>

                    {/* 6. Shine Effect (Only on self hover) */}
                    {isSelfHovered && (
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                transform: "skewX(-20deg)",
                            }}
                        />
                    )}
                </div>
            </motion.div>
        </Link>
    )
}
