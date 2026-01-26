"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type Variant = "minimal" | "bold"

type Chip = {
    label: string
    icon?: string
    preset: "free" | "paid" | "popular" | "new" | "color" | "tool" | "custom"
    colorValue?: string
    defaultActive?: boolean
}

type Card = {
    title: string
    subtitle: string
    price: string
    badge: string
    imageUrl: string
}

type HeroProps = {
    // Copy
    badgeText?: string
    title?: string
    highlightText?: string
    subtitle?: string

    // Search
    searchLabel?: string
    searchPlaceholder?: string
    searchLinkBase?: string
    showSearchHint?: boolean
    searchHintText?: string

    // Chips
    chips?: Chip[]

    // CTAs
    primaryCtaLabel?: string
    primaryCtaHref?: string
    primaryCtaNewTab?: boolean
    showSecondaryCta?: boolean
    secondaryCtaLabel?: string
    secondaryCtaHref?: string
    secondaryCtaNewTab?: boolean

    // Stats
    showStats?: boolean
    stat1?: string
    stat2?: string
    stat3?: string

    // Preview cards
    showPreviews?: boolean
    cards?: Card[]

    // Style
    variant?: Variant
    theme?: ThemeMode
    accent?: string
    background?: string
    textColor?: string
    fontFamily?: string
    radius?: number
    maxWidth?: number
    align?: "left" | "center"
    h1SizeDesktop?: number
    h1SizeTablet?: number
    h1SizeMobile?: number

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
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
        const el = ref.current
        if (!el || typeof window === "undefined") return
        const ro = new ResizeObserver((entries) => {
            const w = entries?.[0]?.contentRect?.width
            if (typeof w === "number") setWidth(w)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Return consistent width during SSR and initial client render
    return { ref, width: isMounted ? width : 1200 }
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n))
}

function targetFor(newTab: boolean) {
    return newTab ? "_blank" : "_self"
}

function splitHighlight(full: string, highlight: string) {
    if (!highlight?.trim()) return { before: full, mid: "", after: "" }
    const idx = full.toLowerCase().indexOf(highlight.toLowerCase())
    if (idx < 0) return { before: full, mid: "", after: "" }
    return {
        before: full.slice(0, idx),
        mid: full.slice(idx, idx + highlight.length),
        after: full.slice(idx + highlight.length),
    }
}

export default function Hero(props: HeroProps) {
    const {
        style,
        badgeText = "Curated website templates",
        title = "Discover beautiful website templates for your next project.",
        highlightText = "website templates",
        subtitle = "Browse free and paid templates by category, color, popularity, and newest releases. Built for founders and designers shipping weekly.",
        searchLabel = "Search templates and resources",
        searchPlaceholder = "Search: dashboards, landing pages, UI kits, icons...",
        searchLinkBase = "/templates",
        showSearchHint = true,
        searchHintText = 'Tip: try "purple dashboard", "pricing page", or "UI kit".',
        chips = [],
        primaryCtaLabel = "Browse Templates",
        primaryCtaHref = "/templates",
        primaryCtaNewTab = false,
        showSecondaryCta = true,
        secondaryCtaLabel = "Get Free Pack",
        secondaryCtaHref = "/freebies",
        secondaryCtaNewTab = false,
        showStats = true,
        stat1 = "200+ curated templates",
        stat2 = "Weekly drops",
        stat3 = "Commercial-ready licenses",
        showPreviews = true,
        cards = [],
        variant = "bold",
        theme = "auto",
        accent = "#4600BE",
        background = "#FFFFFF",
        textColor = "#0B0B12",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        radius = 16,
        maxWidth = 1200,
        align = "left",
        h1SizeDesktop = 52,
        h1SizeTablet = 44,
        h1SizeMobile = 34,
    } = props

    const reducedMotion = usePrefersReducedMotion()
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { theme: contextTheme } = useTheme()

    const resolvedTheme: "light" | "dark" = theme === "light" || theme === "dark" ? theme : contextTheme

    // Use consistent width (1200) for SSR to prevent hydration mismatches
    // The useElementWidth hook already returns 1200 during SSR
    const isMobile = width <= 720
    const isTablet = width > 720 && width <= 980

    const colors = React.useMemo(() => {
        const light = {
            bg: background || "#FFFFFF",
            text: textColor || "#0B0B12",
            muted: "rgba(11,11,18,.66)",
            glass: "rgba(255,255,255,.72)",
            glass2: "rgba(255,255,255,.56)",
        }
        const dark = {
            bg: "#070711",
            text: "#F4F5FF",
            muted: "rgba(244,245,255,.72)",
            glass: "rgba(10,10,22,.62)",
            glass2: "rgba(10,10,22,.46)",
        }
        return resolvedTheme === "dark" ? dark : light
    }, [resolvedTheme, background, textColor])

    const h1 = isMobile ? h1SizeMobile : isTablet ? h1SizeTablet : h1SizeDesktop
    const padY = isMobile ? 48 : isTablet ? 64 : 86
    const padX = isMobile ? 18 : 24

    const maxW = clamp(maxWidth, 960, 1400)

    const container: React.CSSProperties = {
        width: "100%",
        height: "auto",
        ...style,
        fontFamily,
        color: colors.text,
        background: colors.bg,
        position: "relative",
        overflow: "hidden",
    }

    const bgA: React.CSSProperties = {
        position: "absolute",
        inset: "-20% -10% auto -10%",
        height: 520,
        background: `radial-gradient(40% 60% at 30% 40%, ${accent}33, transparent 70%),
                     radial-gradient(38% 60% at 60% 20%, rgba(124,58,237,.20), transparent 70%),
                     radial-gradient(38% 60% at 80% 60%, rgba(192,132,252,.16), transparent 70%)`,
        filter: "blur(18px)",
        opacity: resolvedTheme === "dark" ? 0.9 : 1,
        pointerEvents: "none",
        zIndex: 0,
    }

    const bgB: React.CSSProperties = {
        position: "absolute",
        right: -120,
        top: 120,
        width: 420,
        height: 420,
        background: `radial-gradient(circle at 40% 40%, ${accent}2E, transparent 65%)`,
        filter: "blur(20px)",
        pointerEvents: "none",
        zIndex: 0,
    }

    const inner: React.CSSProperties = {
        maxWidth: maxW,
        margin: "0 auto",
        padding: `${padY}px ${padX}px`,
        position: "relative",
        zIndex: 2,
    }

    const grid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
        gap: isMobile ? 26 : 28,
        alignItems: "center",
    }

    const left: React.CSSProperties = {
        textAlign: align,
        display: "grid",
        gap: 14,
        justifyItems: align === "center" ? "center" : "start",
    }

    const badge: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${accent}22`,
        background:
            variant === "bold"
                ? `linear-gradient(135deg, ${accent}14, rgba(255,255,255,0))`
                : `linear-gradient(135deg, rgba(11,11,18,.04), rgba(255,255,255,0))`,
        boxShadow:
            variant === "bold"
                ? `0 14px 40px ${accent}14`
                : "0 10px 26px rgba(10,10,20,.06)",
        color: colors.muted,
        fontWeight: 650,
        fontSize: 13,
        letterSpacing: "-0.01em",
    }

    const headline: React.CSSProperties = {
        fontSize: clamp(h1, 28, 64),
        lineHeight: 1.03,
        letterSpacing: "-0.04em",
        fontWeight: 760,
        margin: 0,
        maxWidth: 740,
    }

    const neonWord: React.CSSProperties = {
        background: `linear-gradient(135deg, ${accent}, #7C3AED, #C084FC)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        textShadow: variant === "bold" ? `0 18px 60px ${accent}22` : "none",
    }

    const sub: React.CSSProperties = {
        margin: 0,
        fontSize: isMobile ? 15 : 18,
        lineHeight: 1.5,
        color: colors.muted,
        maxWidth: 640,
    }

    const searchWrap: React.CSSProperties = {
        width: "100%",
        maxWidth: 740,
        display: "grid",
        gap: 10,
        justifyItems: align === "center" ? "center" : "start",
        marginTop: 6,
    }

    const searchBar: React.CSSProperties = {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 10,
        padding: "10px",
        borderRadius: clamp(radius, 12, 22),
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(14px) saturate(1.25)",
        WebkitBackdropFilter: "blur(14px) saturate(1.25)",
        border: `1px solid ${accent}1F`,
        boxShadow:
            variant === "bold"
                ? `0 26px 70px rgba(10,10,20,.10), 0 1px 0 ${accent}1A`
                : `0 18px 50px rgba(10,10,20,.08)`,
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        height: isMobile ? 44 : 46,
        padding: "0 12px",
        borderRadius: clamp(radius, 10, 18),
        border: "1px solid transparent",
        outline: "none",
        background: "transparent",
        color: colors.text,
        fontSize: 14,
        fontWeight: 560,
    }

    const btnBase: React.CSSProperties = {
        borderRadius: clamp(radius, 12, 22),
        padding: isMobile ? "10px 12px" : "11px 14px",
        fontSize: 14,
        fontWeight: 720,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
        border: "1px solid transparent",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease",
        whiteSpace: "nowrap",
    }

    const searchBtn: React.CSSProperties = {
        ...btnBase,
        background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
        color: "#fff",
        boxShadow: `0 18px 40px ${accent}22`,
    }

    const chipRow: React.CSSProperties = {
        width: "100%",
        maxWidth: 800,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: align === "center" ? "center" : "flex-start",
    }

    const chipBase = (active: boolean): React.CSSProperties => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        height: 34,
        borderRadius: 999,
        border: `1px solid ${active ? `${accent}55` : "rgba(11,11,18,.10)"}`,
        background: active
            ? `linear-gradient(135deg, ${accent}18, rgba(255,255,255,0))`
            : `linear-gradient(180deg, rgba(255,255,255,.88), rgba(255,255,255,.60))`,
        color: active ? colors.text : colors.muted,
        fontSize: 13,
        fontWeight: 650,
        cursor: "pointer",
        outline: "none",
        boxShadow: active
            ? `0 14px 30px ${accent}14`
            : "0 10px 24px rgba(10,10,20,.06)",
        transition: reducedMotion
            ? "none"
            : "transform 180ms cubic-bezier(.2,.8,.2,1)",
    })

    const ctas: React.CSSProperties = {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        marginTop: 10,
    }

    const primaryBtn: React.CSSProperties = {
        ...btnBase,
        background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
        color: "#fff",
        boxShadow: `0 18px 44px ${accent}22`,
        border: `1px solid ${accent}55`,
    }

    const secondaryBtn: React.CSSProperties = {
        ...btnBase,
        background: "transparent",
        color: colors.text,
        border: `1px solid ${accent}22`,
        boxShadow: "0 12px 28px rgba(10,10,20,.06)",
    }

    const stats: React.CSSProperties = {
        display: showStats ? "flex" : "none",
        gap: 14,
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        marginTop: 8,
        color: colors.muted,
        fontSize: 13,
        fontWeight: 650,
    }

    const statPill: React.CSSProperties = {
        padding: "7px 10px",
        borderRadius: 999,
        border: "1px solid rgba(11,11,18,.10)",
        background: "rgba(255,255,255,.65)",
    }

    const right: React.CSSProperties = {
        display: showPreviews ? "grid" : "none",
        gap: 14,
        alignContent: "center",
    }

    const cardWrap = (i: number): React.CSSProperties => ({
        borderRadius: clamp(radius + 4, 14, 26),
        border: `1px solid ${accent}22`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        boxShadow:
            variant === "bold"
                ? `0 30px 80px rgba(10,10,20,.12), 0 0 0 1px ${accent}10`
                : `0 22px 60px rgba(10,10,20,.10)`,
        overflow: "hidden",
        transform:
            reducedMotion || isMobile
                ? "none"
                : i === 0
                  ? "translateY(-6px)"
                  : i === 1
                    ? "translateY(8px)"
                    : "translateY(0)",
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1)",
    })

    const cardImg: React.CSSProperties = {
        width: "100%",
        height: isMobile ? 160 : 170,
        objectFit: "cover",
        display: "block",
        filter: "saturate(1.05) contrast(1.02)",
    }

    const cardBody: React.CSSProperties = {
        padding: 14,
        display: "grid",
        gap: 8,
    }
    const cardTitle: React.CSSProperties = {
        fontSize: 14,
        fontWeight: 760,
        letterSpacing: "-0.02em",
        margin: 0,
    }
    const cardSub: React.CSSProperties = {
        fontSize: 13,
        color: colors.muted,
        margin: 0,
        lineHeight: 1.35,
    }
    const cardMeta: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginTop: 4,
    }
    const cardBadge: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 760,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}22`,
        background: `linear-gradient(135deg, ${accent}12, rgba(255,255,255,0))`,
        color: colors.text,
        whiteSpace: "nowrap",
    }
    const cardPrice: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 850,
        color: colors.text,
        whiteSpace: "nowrap",
    }

    const safeCards = (cards || []).slice(0, 3)

    // chips + query state
    const initialActive = React.useMemo(() => {
        const map = new Map<string, boolean>()
        ;(chips || []).forEach((c) => map.set(c.label, !!c.defaultActive))
        return map
    }, [chips])

    const [active, setActive] =
        React.useState<Map<string, boolean>>(initialActive)
    React.useEffect(() => setActive(initialActive), [initialActive])

    const [query, setQuery] = React.useState("")
    const activeChips = React.useMemo(() => {
        const arr: Chip[] = []
        ;(chips || []).forEach((c) => {
            if (active.get(c.label)) arr.push(c)
        })
        return arr
    }, [chips, active])

    const buildSearchHref = React.useCallback(() => {
        const base = (searchLinkBase || "/templates").trim() || "/templates"
        const q = encodeURIComponent(query.trim())
        const params: string[] = []
        if (q) params.push(`q=${q}`)
        activeChips.forEach((c) => {
            if (c.preset === "color" && c.colorValue)
                params.push(`color=${encodeURIComponent(c.colorValue)}`)
            else if (c.preset === "tool")
                params.push(`tool=${encodeURIComponent(c.label)}`)
            else params.push(`tag=${encodeURIComponent(c.label)}`)
        })
        return params.length ? `${base}?${params.join("&")}` : base
    }, [searchLinkBase, query, activeChips])

    const onSubmitSearch = React.useCallback(() => {
        if (typeof window === "undefined") return
        window.location.assign(buildSearchHref())
    }, [buildSearchHref])

    const [inputFocused, setInputFocused] = React.useState(false)
    const focusRing: React.CSSProperties = inputFocused
        ? { boxShadow: `0 0 0 4px ${accent}22` }
        : {}

    const { before, mid, after } = React.useMemo(
        () => splitHighlight(title, highlightText),
        [title, highlightText]
    )

    return (
        <section ref={ref} style={container}>
            <div style={bgA} />
            <div style={bgB} />

            <div style={inner}>
                <div style={grid}>
                    <div style={left}>
                        <div style={badge}>
                            <span aria-hidden="true">⚡</span>
                            <span>{badgeText}</span>
                        </div>

                        <h1 style={headline}>
                            {before}
                            {mid ? <span style={neonWord}>{mid}</span> : null}
                            {after}
                        </h1>

                        <p style={sub}>{subtitle}</p>

                        <div style={searchWrap}>
                            <div style={{ ...searchBar, ...focusRing }}>
                                <input
                                    aria-label={searchLabel}
                                    placeholder={searchPlaceholder}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") onSubmitSearch()
                                    }}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    style={inputStyle}
                                />
                                <button
                                    type="button"
                                    style={searchBtn}
                                    onClick={onSubmitSearch}
                                >
                                    <span>Search</span>
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>

                            {showSearchHint && (
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        fontWeight: 650,
                                    }}
                                >
                                    {searchHintText}
                                </div>
                            )}

                            {chips && chips.length > 0 && (
                                <div style={chipRow} aria-label="Quick filters">
                                    {chips.slice(0, 10).map((c, idx) => {
                                        const isActive = !!active.get(c.label)
                                        const emoji =
                                            c.icon ||
                                            (c.preset === "free"
                                                ? "🆓"
                                                : c.preset === "paid"
                                                  ? "💎"
                                                  : c.preset === "new"
                                                    ? "🆕"
                                                    : c.preset === "popular"
                                                      ? "🔥"
                                                      : c.preset === "color"
                                                        ? "🎨"
                                                        : "✨")

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                style={chipBase(isActive)}
                                                onClick={() => {
                                                    setActive((prev) => {
                                                        const next = new Map(prev)
                                                        next.set(c.label, !isActive)
                                                        return next
                                                    })
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (reducedMotion) return
                                                    e.currentTarget.style.transform =
                                                        "translateY(-1px)"
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(0)"
                                                }}
                                            >
                                                <span aria-hidden="true">
                                                    {emoji}
                                                </span>
                                                <span>{c.label}</span>
                                                {c.preset === "color" &&
                                                c.colorValue ? (
                                                    <span
                                                        aria-hidden="true"
                                                        style={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: 999,
                                                            background:
                                                                c.colorValue,
                                                            border: "1px solid rgba(0,0,0,.10)",
                                                            boxShadow: `0 0 0 3px ${accent}12`,
                                                        }}
                                                    />
                                                ) : null}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={ctas}>
                            <Link
                                href={primaryCtaHref || "#"}
                                target={targetFor(primaryCtaNewTab)}
                                rel={
                                    primaryCtaNewTab ? "noreferrer" : undefined
                                }
                                style={primaryBtn}
                                aria-label={primaryCtaLabel}
                            >
                                {primaryCtaLabel}{" "}
                                <span aria-hidden="true">→</span>
                            </Link>

                            {showSecondaryCta && (
                                <Link
                                    href={secondaryCtaHref || "#"}
                                    target={targetFor(secondaryCtaNewTab)}
                                    rel={
                                        secondaryCtaNewTab
                                            ? "noreferrer"
                                            : undefined
                                    }
                                    style={secondaryBtn}
                                    aria-label={secondaryCtaLabel}
                                >
                                    {secondaryCtaLabel}
                                </Link>
                            )}
                        </div>

                        {showStats && (
                            <div style={stats} aria-label="Hero stats">
                                <span style={statPill}>✅ {stat1}</span>
                                <span style={statPill}>⚡ {stat2}</span>
                                <span style={statPill}>🔒 {stat3}</span>
                            </div>
                        )}
                    </div>

                    {showPreviews && safeCards.length > 0 && (
                        <div style={right}>
                            {safeCards.map((c, i) => (
                                <div key={i} style={cardWrap(i)}>
                                    <Image
                                        src={c.imageUrl}
                                        alt={c.title}
                                        width={300}
                                        height={170}
                                        sizes="300px"
                                        style={cardImg}
                                    />
                                    <div style={cardBody}>
                                        <p style={cardTitle}>{c.title}</p>
                                        <p style={cardSub}>{c.subtitle}</p>
                                        <div style={cardMeta}>
                                            <span style={cardBadge}>
                                                {c.badge}
                                            </span>
                                            <span style={cardPrice}>
                                                {c.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
