"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type Variant = "minimal" | "bold"
type Density = "comfortable" | "compact"

type SortKey = "popular" | "new" | "latest" | "priceLow" | "priceHigh"

type Category = {
    label: string
    key: string
    icon?: string
}

type ColorOption = {
    label: string
    value: string
}

type TemplateItem = {
    title: string
    subtitle: string
    imageUrl: string
    href: string
    newTab?: boolean

    categoryKey: string
    tool: "Figma" | "Framer" | "Both"
    color: string // hex or token (must match ColorOption.value)

    priceLabel: string // "Free", "$29", etc.
    priceValue: number // 0 for free; numeric for sorting
    isFree: boolean
    isPaid: boolean

    isPopular: boolean
    isNew: boolean

    badge: string
    tag1: string
    tag2: string
}

type BrowseTemplatesProps = {
    // Copy
    title?: string
    subtitle?: string
    showHeader?: boolean

    // Filters toggles
    showSearch?: boolean
    showSort?: boolean
    showToolToggle?: boolean
    showPriceToggle?: boolean
    showColorFilter?: boolean
    showCategoryFilter?: boolean
    showClearButton?: boolean

    // Data
    categories?: Category[]
    colors?: ColorOption[]
    templates?: TemplateItem[]
    maxResults?: number

    // Defaults
    defaultSort?: SortKey
    defaultTool?: "All" | "Figma" | "Framer" | "Both"
    defaultPrice?: "All" | "Free" | "Paid"
    defaultCategory?: string // categoryKey or "all"
    defaultColor?: string // color hex or "all"

    // Style
    variant?: Variant
    theme?: ThemeMode
    density?: Density

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

    // Grid
    desktopColumns?: number
    tabletColumns?: number
    gridGap?: number
    imageHeight?: number

    // Motion
    enableHoverLift?: boolean

    // Drawer (mobile)
    drawerTitle?: string
    filterButtonLabel?: string

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

function safeLower(s: string) {
    return (s || "").toLowerCase()
}

function sortTemplates(items: TemplateItem[], key: SortKey) {
    const arr = [...items]
    if (key === "popular") {
        arr.sort(
            (a, b) =>
                Number(b.isPopular) - Number(a.isPopular) ||
                Number(b.isNew) - Number(a.isNew)
        )
        return arr
    }
    if (key === "new") {
        arr.sort(
            (a, b) =>
                Number(b.isNew) - Number(a.isNew) ||
                Number(b.isPopular) - Number(a.isPopular)
        )
        return arr
    }
    if (key === "priceLow") {
        arr.sort((a, b) => a.priceValue - b.priceValue)
        return arr
    }
    if (key === "priceHigh") {
        arr.sort((a, b) => b.priceValue - a.priceValue)
        return arr
    }
    // latest: keep given order (assume newest first in data)
    return arr
}

export default function BrowseTemplates(props: BrowseTemplatesProps) {
    const {
        style,
        title = "Browse templates",
        subtitle = "Filter by category, color, tool, and pricing. Find your next purple-neon UI in seconds.",
        showHeader = true,
        showSearch = true,
        showSort = true,
        showToolToggle = true,
        showPriceToggle = true,
        showColorFilter = true,
        showCategoryFilter = true,
        showClearButton = true,
        categories = [],
        colors = [],
        templates = [],
        maxResults = 12,
        defaultSort = "popular",
        defaultTool = "All",
        defaultPrice = "All",
        defaultCategory = "all",
        defaultColor = "all",
        variant = "bold",
        theme = "auto",
        density = "comfortable",
        accent = "#4600BE",
        background = "#FFFFFF",
        textColor = "#0B0B12",
        darkBackground = "#070711",
        darkTextColor = "#F4F5FF",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        radius = 16,
        maxWidth = 1200,
        desktopColumns = 3,
        tabletColumns = 2,
        gridGap = 14,
        imageHeight = 180,
        enableHoverLift = true,
        drawerTitle = "Filters",
        filterButtonLabel = "Filters",
    } = props

    const reducedMotion = usePrefersReducedMotion()
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { theme: contextTheme } = useTheme()

    const resolvedTheme: "light" | "dark" = theme === "light" || theme === "dark" ? theme : contextTheme

    const isMobile = width <= 720
    const isTablet = width > 720 && width <= 980

    const colorsys = React.useMemo(() => {
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

    const padY = isMobile ? 48 : isTablet ? 64 : 72
    const padX = isMobile ? 18 : 24
    const compact = density === "compact"

    const safeCategories = (categories || []).slice(0, 24)
    const safeColors = (colors || []).slice(0, 18)
    const safeTemplates = (templates || []).slice(0, 80)

    // State
    const [query, setQuery] = React.useState("")
    const [sortKey, setSortKey] = React.useState<SortKey>(
        defaultSort || "popular"
    )
    const [tool, setTool] = React.useState<"All" | "Figma" | "Framer" | "Both">(
        defaultTool || "All"
    )
    const [price, setPrice] = React.useState<"All" | "Free" | "Paid">(
        defaultPrice || "All"
    )
    const [category, setCategory] = React.useState<string>(
        defaultCategory || "all"
    )
    const [color, setColor] = React.useState<string>(defaultColor || "all")
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    React.useEffect(() => {
        if (!isMobile) setDrawerOpen(false)
    }, [isMobile])

    React.useEffect(() => {
        if (!drawerOpen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setDrawerOpen(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [drawerOpen])

    const clearAll = React.useCallback(() => {
        setQuery("")
        setSortKey(defaultSort || "popular")
        setTool(defaultTool || "All")
        setPrice(defaultPrice || "All")
        setCategory(defaultCategory || "all")
        setColor(defaultColor || "all")
    }, [defaultSort, defaultTool, defaultPrice, defaultCategory, defaultColor])

    const activeCount = React.useMemo(() => {
        let n = 0
        if (query.trim()) n++
        if (tool !== "All") n++
        if (price !== "All") n++
        if (category !== "all") n++
        if (color !== "all") n++
        return n
    }, [query, tool, price, category, color])

    const filtered = React.useMemo(() => {
        let items = safeTemplates

        const q = safeLower(query).trim()
        if (q) {
            items = items.filter((t) => {
                const hay =
                    `${t.title} ${t.subtitle} ${t.badge} ${t.tag1} ${t.tag2} ${t.tool}`.toLowerCase()
                return hay.includes(q)
            })
        }

        if (tool !== "All") {
            items = items.filter((t) => {
                if (tool === "Both") return t.tool === "Both"
                return t.tool === tool || t.tool === "Both"
            })
        }

        if (price !== "All") {
            items = items.filter((t) =>
                price === "Free" ? t.isFree : t.isPaid
            )
        }

        if (category !== "all") {
            items = items.filter((t) => t.categoryKey === category)
        }

        if (color !== "all") {
            items = items.filter((t) => safeLower(t.color) === safeLower(color))
        }

        items = sortTemplates(items, sortKey)
        return items.slice(0, clamp(maxResults, 1, 60))
    }, [
        safeTemplates,
        query,
        tool,
        price,
        category,
        color,
        sortKey,
        maxResults,
    ])

    // Layout
    const cols = isMobile
        ? 1
        : isTablet
          ? clamp(tabletColumns, 1, 3)
          : clamp(desktopColumns, 2, 4)

    // Styles
    const root: React.CSSProperties = {
        ...style,
        width: "100%",
        height: "auto",
        background: colorsys.bg,
        color: colorsys.text,
        fontFamily,
        position: "relative",
        overflow: "hidden",
    }

    const bgWash: React.CSSProperties = {
        position: "absolute",
        inset: "-30% -10% auto -10%",
        height: 560,
        background: `radial-gradient(40% 60% at 22% 44%, ${accent}2A, transparent 70%),
                     radial-gradient(38% 60% at 70% 18%, rgba(124,58,237,.18), transparent 70%),
                     radial-gradient(38% 60% at 85% 72%, rgba(192,132,252,.14), transparent 70%)`,
        filter: "blur(18px)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: resolvedTheme === "dark" ? 0.9 : 1,
    }

    const inner: React.CSSProperties = {
        maxWidth: clamp(maxWidth, 960, 1400),
        margin: "0 auto",
        padding: `${padY}px ${padX}px`,
        position: "relative",
        zIndex: 2,
        display: "grid",
        gap: 16,
    }

    const headerRow: React.CSSProperties = {
        display: showHeader ? "flex" : "none",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
    }

    const h2: React.CSSProperties = {
        margin: 0,
        fontSize: isMobile ? 24 : 30,
        fontWeight: 900,
        letterSpacing: "-0.03em",
        lineHeight: 1.08,
    }

    const sub: React.CSSProperties = {
        margin: "6px 0 0 0",
        color: colorsys.muted,
        fontSize: isMobile ? 14 : 15,
        lineHeight: 1.5,
        maxWidth: 860,
    }

    const panel: React.CSSProperties = {
        borderRadius: clamp(radius + 6, 14, 28),
        border: `1px solid ${colorsys.stroke}`,
        background: `linear-gradient(180deg, ${colorsys.glass}, ${colorsys.glass2})`,
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        boxShadow:
            variant === "bold"
                ? `0 28px 70px ${colorsys.shadow}`
                : `0 18px 44px ${colorsys.shadow}`,
        padding: compact ? 12 : 14,
        display: "grid",
        gap: 12,
    }

    const row: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
    }

    const leftRow: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        flex: "1 1 auto",
        minWidth: 240,
    }

    const rightRow: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "flex-end",
        flex: "0 0 auto",
    }

    const inputWrap: React.CSSProperties = {
        display: showSearch ? "flex" : "none",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: clamp(radius, 12, 20),
        border: `1px solid ${colorsys.stroke}`,
        background: "rgba(255,255,255,.0)",
        minWidth: isMobile ? "100%" : 320,
        flex: isMobile ? "1 1 auto" : "0 0 auto",
    }

    const input: React.CSSProperties = {
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        color: colorsys.text,
        fontWeight: 650,
        fontSize: 14,
    }

    const pillBase: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 12px",
        borderRadius: 999,
        border: `1px solid ${colorsys.stroke}`,
        background: `linear-gradient(180deg, ${colorsys.glass}, ${colorsys.glass2})`,
        backdropFilter: "blur(12px) saturate(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        color: colorsys.muted,
        fontWeight: 800,
        fontSize: 13,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
        transition: reducedMotion
            ? "none"
            : "transform 180ms cubic-bezier(.2,.8,.2,1)",
    }

    const pillOn = (on: boolean): React.CSSProperties => ({
        border: `1px solid ${on ? `${accent}55` : colorsys.stroke}`,
        background: on
            ? `linear-gradient(135deg, ${accent}20, transparent)`
            : pillBase.background,
        color: on ? colorsys.text : colorsys.muted,
        boxShadow: on
            ? `0 16px 40px ${accent}12`
            : `0 12px 26px ${colorsys.shadow}`,
    })

    const labelMini: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 850,
        color: colorsys.muted,
        marginRight: 2,
    }

    const select: React.CSSProperties = {
        display: showSort ? "inline-flex" : "none",
        height: 36,
        borderRadius: 999,
        border: `1px solid ${colorsys.stroke}`,
        background: `linear-gradient(180deg, ${colorsys.glass}, ${colorsys.glass2})`,
        color: colorsys.text,
        fontWeight: 800,
        fontSize: 13,
        padding: "0 12px",
        outline: "none",
        cursor: "pointer",
        boxShadow: `0 12px 26px ${colorsys.shadow}`,
    }

    const clearBtn: React.CSSProperties = {
        display: showClearButton ? "inline-flex" : "none",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 12px",
        borderRadius: 999,
        border: `1px solid ${activeCount ? `${accent}55` : colorsys.stroke}`,
        background: activeCount
            ? `linear-gradient(135deg, ${accent}18, transparent)`
            : "transparent",
        color: activeCount ? colorsys.text : colorsys.muted,
        fontWeight: 850,
        fontSize: 13,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
    }

    const filterButton: React.CSSProperties = {
        display: isMobile ? "inline-flex" : "none",
        alignItems: "center",
        gap: 10,
        height: 40,
        padding: "0 14px",
        borderRadius: 999,
        border: `1px solid ${accent}55`,
        background: `linear-gradient(135deg, ${accent}18, transparent)`,
        color: colorsys.text,
        fontWeight: 900,
        fontSize: 13,
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
        boxShadow: `0 18px 44px ${colorsys.shadow}`,
    }

    const colorRow: React.CSSProperties = {
        display: showColorFilter ? "flex" : "none",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
    }

    const swatch = (on: boolean): React.CSSProperties => ({
        width: 28,
        height: 28,
        borderRadius: 999,
        border: `1px solid ${on ? `${accent}66` : resolvedTheme === "dark" ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.10)"}`,
        boxShadow: on
            ? `0 0 0 4px ${accent}22, 0 16px 36px ${colorsys.shadow}`
            : `0 12px 26px ${colorsys.shadow}`,
        cursor: "pointer",
        outline: "none",
        transition: reducedMotion
            ? "none"
            : "transform 180ms cubic-bezier(.2,.8,.2,1)",
    })

    const categoryRow: React.CSSProperties = {
        display: showCategoryFilter ? "flex" : "none",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
    }

    const grid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: clamp(gridGap, 10, 22),
    }

    const card: React.CSSProperties = {
        borderRadius: clamp(radius + 6, 14, 28),
        border: `1px solid ${colorsys.stroke}`,
        background: `linear-gradient(180deg, ${colorsys.glass}, ${colorsys.glass2})`,
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        outline: "none",
        boxShadow:
            variant === "bold"
                ? `0 28px 70px ${colorsys.shadow}`
                : `0 18px 44px ${colorsys.shadow}`,
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease",
        display: "grid",
        gridTemplateRows: "auto 1fr",
    }

    const img: React.CSSProperties = {
        width: "100%",
        height: clamp(imageHeight, 140, 280),
        objectFit: "cover",
        display: "block",
        filter: "saturate(1.05) contrast(1.02)",
        opacity: resolvedTheme === "dark" ? 0.9 : 1,
    }

    const cardBody: React.CSSProperties = {
        padding: compact ? 12 : 14,
        display: "grid",
        gap: 8,
    }

    const cardTitle: React.CSSProperties = {
        margin: 0,
        fontSize: 15,
        fontWeight: 900,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
    }

    const cardSub: React.CSSProperties = {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.45,
        color: colorsys.muted,
    }

    const tagRow: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    }

    const tag = (tone: "neutral" | "accent"): React.CSSProperties => ({
        fontSize: 12,
        fontWeight: 850,
        padding: "6px 10px",
        borderRadius: 999,
        border:
            tone === "accent"
                ? `1px solid ${accent}33`
                : resolvedTheme === "dark"
                  ? "1px solid rgba(255,255,255,.12)"
                  : "1px solid rgba(0,0,0,.10)",
        background:
            tone === "accent"
                ? `linear-gradient(135deg, ${accent}12, transparent)`
                : resolvedTheme === "dark"
                  ? "rgba(255,255,255,.03)"
                  : "rgba(255,255,255,.60)",
        color: tone === "accent" ? colorsys.text : colorsys.muted,
        whiteSpace: "nowrap",
    })

    const metaRow: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
    }

    const badge: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 900,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}22`,
        background: `linear-gradient(135deg, ${accent}14, transparent)`,
        color: colorsys.text,
        whiteSpace: "nowrap",
    }

    const priceStyle: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 950,
        color: colorsys.text,
        whiteSpace: "nowrap",
    }

    const focusRing: React.CSSProperties = {
        boxShadow: `0 0 0 4px ${accent}22`,
    }

    // Drawer
    const overlay: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.38)",
        zIndex: 9998,
        display: isMobile && drawerOpen ? "block" : "none",
    }

    const drawer: React.CSSProperties = {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        transform:
            isMobile && drawerOpen ? "translateY(0)" : "translateY(18px)",
        opacity: isMobile && drawerOpen ? 1 : 0,
        pointerEvents: isMobile && drawerOpen ? "auto" : "none",
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        border: `1px solid ${colorsys.stroke}`,
        background: `linear-gradient(180deg, ${colorsys.glass}, ${colorsys.glass2})`,
        backdropFilter: "blur(16px) saturate(1.25)",
        WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        boxShadow: `0 -28px 80px rgba(0,0,0,.25)`,
        padding: 14,
        maxHeight: "78vh",
        overflow: "auto",
    }

    const drawerTop: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    }

    const drawerTitleStyle: React.CSSProperties = {
        fontSize: 14,
        fontWeight: 950,
        letterSpacing: "-0.02em",
    }

    const closeBtn: React.CSSProperties = {
        height: 36,
        padding: "0 12px",
        borderRadius: 999,
        border: `1px solid ${colorsys.stroke}`,
        background: "transparent",
        color: colorsys.text,
        fontWeight: 900,
        cursor: "pointer",
        outline: "none",
    }

    const renderFilterControls = (inDrawer: boolean) => (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ ...row, justifyContent: "flex-start" }}>
                <div
                    style={{
                        ...inputWrap,
                        display: showSearch ? "flex" : "none",
                        minWidth: inDrawer ? "100%" : inputWrap.minWidth,
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{ color: accent, fontWeight: 900 }}
                    >
                        ⌕
                    </span>
                    <input
                        aria-label="Search templates"
                        placeholder="Search templates…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={input}
                    />
                </div>

                <div
                    style={{
                        display: showSort ? "flex" : "none",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span style={labelMini}>Sort</span>
                    <select
                        aria-label="Sort templates"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        style={select}
                    >
                        <option value="popular">Popular</option>
                        <option value="new">New</option>
                        <option value="latest">Latest</option>
                        <option value="priceLow">Price: Low</option>
                        <option value="priceHigh">Price: High</option>
                    </select>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                {showToolToggle ? (
                    <>
                        <span style={labelMini}>Tool</span>
                        {(["All", "Figma", "Framer", "Both"] as const).map(
                            (k) => {
                                const on = tool === k
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        style={{ ...pillBase, ...pillOn(on) }}
                                        aria-pressed={on}
                                        onClick={() => setTool(k)}
                                        onFocus={(e) =>
                                            Object.assign(
                                                e.currentTarget.style,
                                                focusRing
                                            )
                                        }
                                    >
                                        <span aria-hidden="true">
                                            {k === "Figma"
                                                ? "🧩"
                                                : k === "Framer"
                                                  ? "🧱"
                                                  : k === "Both"
                                                    ? "🧬"
                                                    : "✨"}
                                        </span>
                                        <span>{k}</span>
                                    </button>
                                )
                            }
                        )}
                    </>
                ) : null}

                {showPriceToggle ? (
                    <>
                        <span style={{ ...labelMini, marginLeft: 4 }}>
                            Price
                        </span>
                        {(["All", "Free", "Paid"] as const).map((k) => {
                            const on = price === k
                            return (
                                <button
                                    key={k}
                                    type="button"
                                    style={{ ...pillBase, ...pillOn(on) }}
                                    aria-pressed={on}
                                    onClick={() => setPrice(k)}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                >
                                    <span aria-hidden="true">
                                        {k === "Free"
                                            ? "🆓"
                                            : k === "Paid"
                                              ? "💎"
                                              : "✨"}
                                    </span>
                                    <span>{k}</span>
                                </button>
                            )
                        })}
                    </>
                ) : null}

                {showClearButton ? (
                    <button
                        type="button"
                        style={clearBtn}
                        onClick={clearAll}
                        aria-label="Clear filters"
                    >
                        <span aria-hidden="true">↺</span>
                        <span>Clear</span>
                        {activeCount ? (
                            <span
                                aria-hidden="true"
                                style={{
                                    marginLeft: 2,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: `${accent}22`,
                                    border: `1px solid ${accent}33`,
                                    fontSize: 12,
                                    fontWeight: 950,
                                }}
                            >
                                {activeCount}
                            </span>
                        ) : null}
                    </button>
                ) : null}
            </div>

            {showColorFilter ? (
                <div style={colorRow} aria-label="Color filter">
                    <span style={labelMini}>Color</span>

                    <button
                        type="button"
                        style={{ ...pillBase, ...pillOn(color === "all") }}
                        aria-pressed={color === "all"}
                        onClick={() => setColor("all")}
                    >
                        <span aria-hidden="true">🎨</span>
                        <span>All</span>
                    </button>

                    {safeColors.map((c, idx) => {
                        const on = safeLower(color) === safeLower(c.value)
                        return (
                            <button
                                key={idx}
                                type="button"
                                aria-label={c.label}
                                onClick={() => setColor(c.value)}
                                style={{ ...swatch(on), background: c.value }}
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
                            />
                        )
                    })}
                </div>
            ) : null}

            {showCategoryFilter ? (
                <div style={categoryRow} aria-label="Category filter">
                    <span style={labelMini}>Category</span>

                    <button
                        type="button"
                        style={{ ...pillBase, ...pillOn(category === "all") }}
                        aria-pressed={category === "all"}
                        onClick={() => setCategory("all")}
                    >
                        <span aria-hidden="true">🧭</span>
                        <span>All</span>
                    </button>

                    {safeCategories.map((c, idx) => {
                        const on = c.key === category
                        return (
                            <button
                                key={idx}
                                type="button"
                                style={{ ...pillBase, ...pillOn(on) }}
                                aria-pressed={on}
                                onClick={() => setCategory(c.key)}
                                onFocus={(e) =>
                                    Object.assign(
                                        e.currentTarget.style,
                                        focusRing
                                    )
                                }
                            >
                                <span aria-hidden="true">{c.icon || "✨"}</span>
                                <span>{c.label}</span>
                            </button>
                        )
                    })}
                </div>
            ) : null}
        </div>
    )

    return (
        <section ref={ref} style={root}>
            <div style={bgWash} />

            <div style={inner}>
                <div style={headerRow}>
                    <div>
                        <h2 style={h2}>{title}</h2>
                        <p style={sub}>{subtitle}</p>
                    </div>

                    <button
                        type="button"
                        style={filterButton}
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open filters"
                    >
                        <span aria-hidden="true">⚙️</span>
                        <span>{filterButtonLabel}</span>
                        {activeCount ? (
                            <span
                                aria-hidden="true"
                                style={{
                                    marginLeft: 4,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: `${accent}22`,
                                    border: `1px solid ${accent}33`,
                                    fontSize: 12,
                                    fontWeight: 950,
                                }}
                            >
                                {activeCount}
                            </span>
                        ) : null}
                    </button>
                </div>

                {/* Desktop / Tablet filter panel */}
                <div style={{ ...panel, display: isMobile ? "none" : "grid" }}>
                    {renderFilterControls(false)}
                </div>

                {/* Mobile: small filter strip */}
                <div style={{ ...panel, display: isMobile ? "grid" : "none" }}>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            type="button"
                            style={filterButton}
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open filters"
                        >
                            <span aria-hidden="true">⚙️</span>
                            <span>{filterButtonLabel}</span>
                            {activeCount ? (
                                <span
                                    aria-hidden="true"
                                    style={{
                                        marginLeft: 4,
                                        padding: "2px 8px",
                                        borderRadius: 999,
                                        background: `${accent}22`,
                                        border: `1px solid ${accent}33`,
                                        fontSize: 12,
                                        fontWeight: 950,
                                    }}
                                >
                                    {activeCount}
                                </span>
                            ) : null}
                        </button>

                        {showClearButton ? (
                            <button
                                type="button"
                                style={clearBtn}
                                onClick={clearAll}
                            >
                                <span aria-hidden="true">↺</span>
                                <span>Clear</span>
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Results */}
                <div style={grid} aria-label="Filtered templates">
                    {filtered.map((t, i) => (
                        <Link
                            key={i}
                            href={t.href || "#"}
                            target={targetFor(t.newTab)}
                            rel={t.newTab ? "noreferrer" : undefined}
                            style={card}
                            aria-label={t.title}
                            onMouseEnter={(e) => {
                                if (reducedMotion || !enableHoverLift) return
                                e.currentTarget.style.transform =
                                    "translateY(-6px)"
                                e.currentTarget.style.boxShadow = `0 30px 80px ${colorsys.shadow}, 0 0 0 3px ${accent}16`
                            }}
                            onMouseLeave={(e) => {
                                if (reducedMotion || !enableHoverLift) return
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow =
                                    variant === "bold"
                                        ? `0 28px 70px ${colorsys.shadow}`
                                        : `0 18px 44px ${colorsys.shadow}`
                            }}
                            onFocus={(e) =>
                                Object.assign(e.currentTarget.style, focusRing)
                            }
                            onBlur={(e) =>
                                Object.assign(e.currentTarget.style, {
                                    boxShadow:
                                        variant === "bold"
                                            ? `0 28px 70px ${colorsys.shadow}`
                                            : `0 18px 44px ${colorsys.shadow}`,
                                })
                            }
                        >
                            <img src={t.imageUrl} alt={t.title} style={img} />
                            <div style={cardBody}>
                                <p style={cardTitle}>{t.title}</p>
                                <p style={cardSub}>{t.subtitle}</p>

                                <div style={tagRow}>
                                    <span style={tag("neutral")}>{t.tool}</span>
                                    <span style={tag("accent")}>{t.tag1}</span>
                                    {t.tag2 ? (
                                        <span style={tag("neutral")}>
                                            {t.tag2}
                                        </span>
                                    ) : null}
                                </div>

                                <div style={metaRow}>
                                    <span style={badge}>{t.badge}</span>
                                    <span style={priceStyle}>
                                        {t.priceLabel}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div
                    style={{
                        fontSize: 12,
                        color: colorsys.muted,
                        fontWeight: 700,
                    }}
                >
                    Results:{" "}
                    <span style={{ color: colorsys.text, fontWeight: 900 }}>
                        {filtered.length}
                    </span>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div
                style={overlay}
                onClick={() => setDrawerOpen(false)}
                aria-hidden={!drawerOpen}
            />
            <div
                style={drawer}
                role="dialog"
                aria-label="Filters"
                aria-modal={drawerOpen ? true : undefined}
            >
                <div style={drawerTop}>
                    <div style={drawerTitleStyle}>{drawerTitle}</div>
                    <button
                        type="button"
                        style={closeBtn}
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close filters"
                    >
                        Close
                    </button>
                </div>
                {renderFilterControls(true)}
            </div>
        </section>
    )
}
