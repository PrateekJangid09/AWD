"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type Variant = "minimal" | "bold"

type TabKey = "popular" | "new" | "free" | "staff" | "purple" | "custom"

type Tab = {
    label: string
    key: TabKey
    icon?: string
    href?: string
    newTab?: boolean
}

type Card = {
    title: string
    subtitle: string
    imageUrl: string
    href: string
    newTab?: boolean
    toolTag: string
    colorTag: string
    price: string
    badge: string
    isFree: boolean
    isNew: boolean
    isPopular: boolean
    isStaffPick: boolean
    isPurple: boolean
}

type FeaturedWebsitesProps = {
    // Copy
    title?: string
    subtitle?: string
    viewAllLabel?: string
    viewAllHref?: string
    viewAllNewTab?: boolean
    showViewAll?: boolean

    // Data
    tabs?: Tab[]
    cards?: Card[]
    defaultTab?: TabKey

    // Style
    variant?: Variant
    theme?: ThemeMode
    accent?: string

    // Light colors
    background?: string
    textColor?: string

    // Dark colors
    darkBackground?: string
    darkTextColor?: string

    fontFamily?: string
    radius?: number
    maxWidth?: number
    gridGap?: number
    imageHeight?: number

    // Behavior
    enableHoverLift?: boolean

    // Framer
    style?: React.CSSProperties
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = React.useState(false)
    React.useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const onChange = () => setReduced(!!mq.matches)
        onChange()
        mq.addEventListener?.("change", onChange)
        return () => mq.removeEventListener?.("change", onChange)
    }, [])
    return reduced
}

function useElementWidth<T extends HTMLElement>() {
    const ref = React.useRef<T | null>(null)
    const [width, setWidth] = React.useState(1200)

    React.useEffect(() => {
        const el = ref.current
        if (!el || typeof window === "undefined") return
        const ro = new ResizeObserver((entries) => {
            const w = entries?.[0]?.contentRect?.width
            if (typeof w === "number") setWidth(w)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return { ref, width }
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n))
}

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
}

function targetFor(newTab?: boolean) {
    return newTab ? "_blank" : "_self"
}

function filterCardsByTab(cards: Card[], tabKey: TabKey) {
    if (!cards?.length) return []
    switch (tabKey) {
        case "popular":
            return cards.filter((c) => c.isPopular)
        case "new":
            return cards.filter((c) => c.isNew)
        case "free":
            return cards.filter((c) => c.isFree)
        case "staff":
            return cards.filter((c) => c.isStaffPick)
        case "purple":
            return cards.filter((c) => c.isPurple)
        case "custom":
        default:
            return cards
    }
}

export default function FeaturedWebsites(props: FeaturedWebsitesProps) {
    const {
        style,
        title = "Featured collections",
        subtitle = "Popular picks, latest drops, and free resources. Filter by what you need and start building.",
        viewAllLabel = "View all templates",
        viewAllHref = "/templates",
        viewAllNewTab = false,
        showViewAll = true,
        tabs = [],
        cards = [],
        defaultTab = "popular",
        variant = "bold",
        theme = "auto",
        accent = "#4600BE",
        background = "#FFFFFF",
        textColor = "#0B0B12",
        darkBackground = "#070711",
        darkTextColor = "#F4F5FF",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        radius = 16,
        maxWidth = 1200,
        gridGap = 14,
        imageHeight = 170,
        enableHoverLift = true,
    } = props

    const reducedMotion = usePrefersReducedMotion()
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { theme: contextTheme } = useTheme()

    const resolvedTheme: "light" | "dark" = theme === "light" || theme === "dark" ? theme : contextTheme

    const isMobile = width <= 720
    const isTablet = width > 720 && width <= 980

    const colors = React.useMemo(() => {
        const light = {
            bg: background || "#FFFFFF",
            text: textColor || "#0B0B12",
            muted: "rgba(11,11,18,.66)",
            glass: "rgba(255,255,255,.74)",
            glass2: "rgba(255,255,255,.56)",
            stroke: "rgba(168,85,247,.18)",
            shadow: "rgba(10,10,20,.08)",
        }
        const dark = {
            bg: darkBackground || "#070711",
            text: darkTextColor || "#F4F5FF",
            muted: "rgba(244,245,255,.72)",
            glass: "rgba(10,10,22,.62)",
            glass2: "rgba(10,10,22,.44)",
            stroke: "rgba(168,85,247,.22)",
            shadow: "rgba(0,0,0,.35)",
        }
        return resolvedTheme === "dark" ? dark : light
    }, [
        resolvedTheme,
        background,
        textColor,
        darkBackground,
        darkTextColor,
    ])

    const padY = isMobile ? 48 : isTablet ? 64 : 76
    const padX = isMobile ? 18 : 24

    const safeTabs = (tabs || []).slice(0, 6)
    const tabExists = safeTabs.some((t) => t.key === defaultTab)
    const initialTab: TabKey = tabExists
        ? defaultTab
        : safeTabs?.[0]?.key || "popular"
    const [activeTab, setActiveTab] = React.useState<TabKey>(initialTab)

    React.useEffect(() => {
        // keep stable when tabs change
        const stillExists = (tabs || []).some((t) => t.key === activeTab)
        if (!stillExists) setActiveTab(initialTab)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabs])

    const visibleCards = React.useMemo(() => {
        const filtered = filterCardsByTab(cards || [], activeTab)
        // Always show something (avoid empty state)
        return filtered.length ? filtered : (cards || []).slice(0, 6)
    }, [cards, activeTab])

    const cols = isMobile ? 1 : isTablet ? 2 : 3

    const root: React.CSSProperties = {
        ...style,
        width: "100%",
        height: "auto",
        background: colors.bg,
        color: colors.text,
        fontFamily,
        position: "relative",
        overflow: "hidden",
    }

    const bgWash: React.CSSProperties = {
        position: "absolute",
        inset: "-30% -10% auto -10%",
        height: 520,
        background: `radial-gradient(40% 60% at 20% 40%, ${accent}2A, transparent 70%),
                     radial-gradient(38% 60% at 70% 20%, rgba(124,58,237,.18), transparent 70%),
                     radial-gradient(38% 60% at 80% 70%, rgba(192,132,252,.14), transparent 70%)`,
        filter: "blur(18px)",
        pointerEvents: "none",
        zIndex: 0,
    }

    const inner: React.CSSProperties = {
        maxWidth: clamp(maxWidth, 960, 1400),
        margin: "0 auto",
        padding: `${padY}px ${padX}px`,
        position: "relative",
        zIndex: 2,
        display: "grid",
        gap: 18,
    }

    const headerRow: React.CSSProperties = {
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
    }

    const hTitle: React.CSSProperties = {
        margin: 0,
        fontSize: isMobile ? 24 : 30,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
    }

    const hSub: React.CSSProperties = {
        margin: "6px 0 0 0",
        color: colors.muted,
        fontSize: isMobile ? 14 : 15,
        lineHeight: 1.5,
        maxWidth: 720,
    }

    const viewAllBtn: React.CSSProperties = {
        display: showViewAll ? "inline-flex" : "none",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background:
            variant === "bold"
                ? `linear-gradient(135deg, ${accent}14, transparent)`
                : "transparent",
        color: colors.text,
        textDecoration: "none",
        fontWeight: 750,
        fontSize: 13,
        boxShadow: `0 12px 28px ${colors.shadow}`,
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease",
        userSelect: "none",
        outline: "none",
    }

    const tabList: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
    }

    const tabBtnBase = (active: boolean): React.CSSProperties => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 38,
        padding: "0 12px",
        borderRadius: 999,
        border: `1px solid ${active ? `${accent}55` : colors.stroke}`,
        background: active
            ? `linear-gradient(135deg, ${accent}20, transparent)`
            : `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(12px) saturate(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        color: active ? colors.text : colors.muted,
        fontWeight: 750,
        fontSize: 13,
        cursor: "pointer",
        outline: "none",
        boxShadow: active
            ? `0 16px 40px ${accent}12`
            : `0 12px 26px ${colors.shadow}`,
        transition: reducedMotion
            ? "none"
            : "transform 180ms cubic-bezier(.2,.8,.2,1)",
        userSelect: "none",
    })

    const grid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: clamp(gridGap, 10, 22),
    }

    const card: React.CSSProperties = {
        borderRadius: clamp(radius + 4, 14, 28),
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        overflow: "hidden",
        boxShadow:
            variant === "bold"
                ? `0 28px 70px ${colors.shadow}, 0 0 0 1px ${accent}10`
                : `0 18px 44px ${colors.shadow}`,
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease",
        textDecoration: "none",
        color: "inherit",
        outline: "none",
    }

    const imgStyle: React.CSSProperties = {
        width: "100%",
        height: clamp(imageHeight, 140, 260),
        objectFit: "cover",
        display: "block",
        filter: "saturate(1.05) contrast(1.02)",
    }

    const body: React.CSSProperties = {
        padding: 14,
        display: "grid",
        gap: 8,
    }

    const cardTitle: React.CSSProperties = {
        margin: 0,
        fontSize: 14,
        fontWeight: 820,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
    }

    const cardSub: React.CSSProperties = {
        margin: 0,
        color: colors.muted,
        fontSize: 13,
        lineHeight: 1.35,
    }

    const tagRow: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    }

    const tagPill = (tone: "neutral" | "accent"): React.CSSProperties => ({
        fontSize: 12,
        fontWeight: 750,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${tone === "accent" ? `${accent}33` : "rgba(0,0,0,.10)"}`,
        background:
            tone === "accent"
                ? `linear-gradient(135deg, ${accent}12, transparent)`
                : "rgba(255,255,255,.60)",
        color: tone === "accent" ? colors.text : colors.muted,
        whiteSpace: "nowrap",
    })

    const meta: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 6,
    }

    const price: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 900,
        color: colors.text,
    }

    const badge: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 850,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}22`,
        background: `linear-gradient(135deg, ${accent}14, transparent)`,
        color: colors.text,
        whiteSpace: "nowrap",
    }

    const focusRing: React.CSSProperties = {
        boxShadow: `0 0 0 4px ${accent}22`,
    }

    return (
        <section ref={ref} style={root}>
            <div style={bgWash} />

            <div style={inner}>
                <div style={headerRow}>
                    <div style={{ minWidth: 260 }}>
                        <h2 style={hTitle}>{title}</h2>
                        <p style={hSub}>{subtitle}</p>
                    </div>

                    {showViewAll && (
                        <Link
                            href={viewAllHref || "#"}
                            target={targetFor(viewAllNewTab)}
                            rel={viewAllNewTab ? "noreferrer" : undefined}
                            style={viewAllBtn}
                            onMouseEnter={(e) => {
                                if (reducedMotion) return
                                e.currentTarget.style.transform =
                                    "translateY(-1px)"
                                e.currentTarget.style.boxShadow = `0 18px 44px ${colors.shadow}, 0 0 0 3px ${accent}18`
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)"
                                e.currentTarget.style.boxShadow = `0 12px 28px ${colors.shadow}`
                            }}
                            onFocus={(e) =>
                                Object.assign(e.currentTarget.style, focusRing)
                            }
                            onBlur={(e) =>
                                Object.assign(e.currentTarget.style, {
                                    boxShadow: `0 12px 28px ${colors.shadow}`,
                                })
                            }
                            aria-label={viewAllLabel}
                        >
                            <span>{viewAllLabel}</span>
                            <span
                                aria-hidden="true"
                                style={{ color: accent, fontWeight: 900 }}
                            >
                                →
                            </span>
                        </Link>
                    )}
                </div>

                {safeTabs.length > 0 && (
                    <div
                        role="tablist"
                        aria-label="Featured collections"
                        style={tabList}
                    >
                        {safeTabs.map((t, idx) => {
                            const active = t.key === activeTab
                            return (
                                <button
                                    key={idx}
                                    role="tab"
                                    aria-selected={active}
                                    type="button"
                                    style={tabBtnBase(active)}
                                    onClick={() => setActiveTab(t.key)}
                                    onMouseEnter={(e) => {
                                        if (reducedMotion) return
                                        e.currentTarget.style.transform =
                                            "translateY(-1px)"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)"
                                    }}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                    onBlur={(e) => {
                                        // restore default
                                    }}
                                >
                                    <span aria-hidden="true">
                                        {t.icon || "✨"}
                                    </span>
                                    <span>{t.label}</span>
                                </button>
                            )
                        })}
                    </div>
                )}

                <div style={grid} aria-label="Template cards">
                    {visibleCards.slice(0, 12).map((c, i) => (
                        <Link
                            key={i}
                            href={c.href || "#"}
                            target={targetFor(c.newTab)}
                            rel={c.newTab ? "noreferrer" : undefined}
                            style={card}
                            aria-label={c.title}
                            onMouseEnter={(e) => {
                                if (reducedMotion || !enableHoverLift) return
                                e.currentTarget.style.transform =
                                    "translateY(-6px)"
                                e.currentTarget.style.boxShadow = `0 30px 80px ${colors.shadow}, 0 0 0 3px ${accent}16`
                            }}
                            onMouseLeave={(e) => {
                                if (reducedMotion || !enableHoverLift) return
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow =
                                    variant === "bold"
                                        ? `0 28px 70px ${colors.shadow}, 0 0 0 1px ${accent}10`
                                        : `0 18px 44px ${colors.shadow}`
                            }}
                            onFocus={(e) =>
                                Object.assign(e.currentTarget.style, focusRing)
                            }
                            onBlur={(e) => {
                                // restore
                                e.currentTarget.style.boxShadow =
                                    variant === "bold"
                                        ? `0 28px 70px ${colors.shadow}, 0 0 0 1px ${accent}10`
                                        : `0 18px 44px ${colors.shadow}`
                            }}
                        >
                            <img
                                src={c.imageUrl}
                                alt={c.title}
                                style={imgStyle}
                            />
                            <div style={body}>
                                <p style={cardTitle}>{c.title}</p>
                                <p style={cardSub}>{c.subtitle}</p>

                                <div style={tagRow}>
                                    <span style={tagPill("neutral")}>
                                        {c.toolTag}
                                    </span>
                                    <span style={tagPill("accent")}>
                                        {c.colorTag}
                                    </span>
                                </div>

                                <div style={meta}>
                                    <span style={badge}>{c.badge}</span>
                                    <span style={price}>{c.price}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
