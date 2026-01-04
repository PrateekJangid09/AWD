"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type Variant = "minimal" | "bold"
type Density = "comfortable" | "compact"

type FAQItem = {
    icon: string
    question: string
    answer: string

    showLink?: boolean
    linkLabel: string
    linkHref: string
    linkNewTab?: boolean

    badge: string
}

type FAQSectionProps = {
    // Header
    showHeader?: boolean
    title?: string
    subtitle?: string

    // Accordion
    items?: FAQItem[]
    maxItems?: number
    allowMultipleOpen?: boolean
    defaultOpenIndex?: number
    openFirstByDefault?: boolean

    // Support CTA
    showSupportCTA?: boolean
    supportTitle?: string
    supportBody?: string
    supportPrimaryLabel?: string
    supportPrimaryHref?: string
    supportPrimaryNewTab?: boolean
    supportSecondaryLabel?: string
    supportSecondaryHref?: string
    supportSecondaryNewTab?: boolean
    showSupportSecondary?: boolean

    // Style
    variant?: Variant
    density?: Density
    theme?: ThemeMode

    accent?: string

    // Light colors
    background?: string
    textColor?: string

    // Dark colors
    darkBackground?: string
    darkTextColor?: string

    fontFamily?: string
    maxWidth?: number
    radius?: number

    titleSize?: number
    subtitleSize?: number
    questionSize?: number
    answerSize?: number

    // Icons
    expandIcon?: string
    collapseIcon?: string

    // Motion
    enableHoverLift?: boolean

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
    const [width, setWidth] = React.useState<number>(1200)

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

export default function FAQSection(props: FAQSectionProps) {
    const {
        style,
        showHeader = true,
        title = "Frequently asked questions",
        subtitle = "Everything you need to know about templates, licensing, and updates.",
        items = [],
        maxItems = 10,
        allowMultipleOpen = true,
        defaultOpenIndex = 0,
        openFirstByDefault = true,
        showSupportCTA = true,
        supportTitle = "Still have questions?",
        supportBody = "Talk to support or check the docs — we're fast and friendly.",
        supportPrimaryLabel = "Contact support",
        supportPrimaryHref = "/contact",
        supportPrimaryNewTab = false,
        supportSecondaryLabel = "Read docs",
        supportSecondaryHref = "/docs",
        supportSecondaryNewTab = false,
        showSupportSecondary = true,
        variant = "bold",
        density = "comfortable",
        theme = "auto",
        accent = "#A855F7",
        background = "#FFFFFF",
        textColor = "#0B0B12",
        darkBackground = "#070711",
        darkTextColor = "#F4F5FF",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        maxWidth = 1200,
        radius = 16,
        titleSize = 30,
        subtitleSize = 15,
        questionSize = 15,
        answerSize = 13,
        expandIcon = "+",
        collapseIcon = "−",
        enableHoverLift = true,
    } = props

    const reducedMotion = usePrefersReducedMotion()
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { theme: contextTheme } = useTheme()

    const resolvedTheme = theme === "light" || theme === "dark" ? theme : contextTheme

    const isMobile = width <= 720
    const isTablet = width > 720 && width <= 980
    const compact = density === "compact"

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
    }, [resolvedTheme, background, textColor, darkBackground, darkTextColor])

    const padY = isMobile ? 48 : isTablet ? 64 : 76
    const padX = isMobile ? 18 : 24

    const safeItems = React.useMemo(
        () => (items || []).slice(0, clamp(maxItems, 1, 24)),
        [items, maxItems]
    )

    const initialOpen = React.useMemo(() => {
        if (openFirstByDefault) return 0
        const d = clamp(defaultOpenIndex ?? -1, -1, safeItems.length - 1)
        return d
    }, [openFirstByDefault, defaultOpenIndex, safeItems.length])

    const [openSet, setOpenSet] = React.useState<Set<number>>(() => {
        const s = new Set<number>()
        if (initialOpen >= 0) s.add(initialOpen)
        return s
    })

    React.useEffect(() => {
        // Reset when user changes default controls or item count
        const s = new Set<number>()
        if (initialOpen >= 0) s.add(initialOpen)
        setOpenSet(s)
    }, [initialOpen])

    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([])
    const contentRefs = React.useRef<Array<HTMLDivElement | null>>([])

    const toggle = React.useCallback(
        (idx: number) => {
            setOpenSet((prev) => {
                const next = new Set(prev)
                const isOpen = next.has(idx)
                if (allowMultipleOpen) {
                    if (isOpen) next.delete(idx)
                    else next.add(idx)
                    return next
                }
                // single-open mode
                next.clear()
                if (!isOpen) next.add(idx)
                return next
            })
        },
        [allowMultipleOpen]
    )

    // Manage animated heights (maxHeight) for smooth open/close
    const [heights, setHeights] = React.useState<Record<number, number>>({})

    const recalcHeights = React.useCallback(() => {
        const next: Record<number, number> = {}
        openSet.forEach((idx) => {
            const el = contentRefs.current[idx]
            if (!el) return
            next[idx] = el.scrollHeight
        })
        setHeights(next)
    }, [openSet])

    React.useEffect(() => {
        recalcHeights()
        if (typeof window === "undefined") return
        const onResize = () => recalcHeights()
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [recalcHeights])

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
        height: 560,
        background: `radial-gradient(40% 60% at 20% 40%, ${accent}2A, transparent 70%),
                     radial-gradient(38% 60% at 70% 18%, rgba(124,58,237,.18), transparent 70%),
                     radial-gradient(38% 60% at 85% 72%, rgba(192,132,252,.14), transparent 70%)`,
        filter: "blur(18px)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: resolvedTheme === "dark" ? 0.9 : 1,
    }

    const inner: React.CSSProperties = {
        maxWidth: clamp(maxWidth, 920, 1400),
        margin: "0 auto",
        padding: `${padY}px ${padX}px`,
        position: "relative",
        zIndex: 2,
        display: "grid",
        gap: 14,
    }

    const header: React.CSSProperties = {
        display: showHeader ? "grid" : "none",
        gap: 8,
        maxWidth: 820,
    }

    const h2: React.CSSProperties = {
        margin: 0,
        fontSize: clamp(titleSize || (isMobile ? 24 : 30), 20, 40),
        fontWeight: 950,
        letterSpacing: "-0.03em",
        lineHeight: 1.08,
    }

    const sub: React.CSSProperties = {
        margin: 0,
        fontSize: clamp(subtitleSize || (isMobile ? 14 : 15), 12, 18),
        lineHeight: 1.6,
        color: colors.muted,
    }

    const list: React.CSSProperties = {
        display: "grid",
        gap: 10,
        marginTop: 6,
    }

    const itemCard: React.CSSProperties = {
        borderRadius: clamp(radius + 8, 16, 30),
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(16px) saturate(1.25)",
        WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        boxShadow:
            variant === "bold"
                ? `0 28px 80px ${colors.shadow}`
                : `0 18px 44px ${colors.shadow}`,
        overflow: "hidden",
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease",
    }

    const qBtn: React.CSSProperties = {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: compact ? "12px 12px" : "14px 14px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        outline: "none",
        color: "inherit",
    }

    const left: React.CSSProperties = {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        minWidth: 0,
        flex: "1 1 auto",
    }

    const iconChip: React.CSSProperties = {
        width: 38,
        height: 38,
        borderRadius: clamp(radius, 12, 18),
        display: "grid",
        placeItems: "center",
        border: `1px solid ${accent}22`,
        background: `radial-gradient(120% 120% at 20% 10%, ${accent}28, transparent 65%), linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        boxShadow: `0 16px 44px ${colors.shadow}`,
        flex: "0 0 auto",
        fontSize: 16,
    }

    const qText: React.CSSProperties = {
        display: "grid",
        gap: 6,
        minWidth: 0,
    }

    const qTop: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        minWidth: 0,
    }

    const qTitle: React.CSSProperties = {
        margin: 0,
        fontSize: clamp(questionSize || 15, 13, 18),
        fontWeight: 950,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: isMobile ? 260 : 520,
    }

    const badge: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}22`,
        background: `linear-gradient(135deg, ${accent}12, transparent)`,
        color: colors.text,
        fontWeight: 950,
        fontSize: 12,
        whiteSpace: "nowrap",
    }

    const chevron: React.CSSProperties = {
        width: 34,
        height: 34,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        border: `1px solid ${colors.stroke}`,
        background:
            variant === "bold"
                ? `linear-gradient(135deg, ${accent}10, transparent)`
                : "transparent",
        color: colors.text,
        fontWeight: 950,
        flex: "0 0 auto",
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1)",
    }

    const contentOuter: React.CSSProperties = {
        padding: `0 ${compact ? 12 : 14}px ${compact ? 12 : 14}px`,
    }

    const contentWrap = (
        isOpen: boolean,
        idx: number
    ): React.CSSProperties => ({
        maxHeight: isOpen ? (heights[idx] ?? 999) : 0,
        overflow: "hidden",
        transition: reducedMotion
            ? "none"
            : "max-height 280ms cubic-bezier(.2,.8,.2,1)",
        willChange: "max-height",
    })

    const aText: React.CSSProperties = {
        margin: "0 0 10px 0",
        fontSize: clamp(answerSize || 13, 12, 16),
        lineHeight: 1.65,
        color: colors.muted,
    }

    const linkPill: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 10px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(135deg, ${accent}10, transparent)`,
        color: colors.text,
        textDecoration: "none",
        fontWeight: 900,
        fontSize: 13,
        outline: "none",
        width: "fit-content",
    }

    const focusRing: React.CSSProperties = {
        boxShadow: `0 0 0 4px ${accent}22`,
    }
    const lift = reducedMotion || !enableHoverLift ? 0 : -4

    const supportCard: React.CSSProperties = {
        display: showSupportCTA ? "grid" : "none",
        gridTemplateColumns: isMobile ? "1fr" : "1.5fr auto",
        alignItems: "center",
        gap: 12,
        marginTop: 8,
        borderRadius: clamp(radius + 10, 18, 34),
        border: `1px solid ${accent}22`,
        background:
            variant === "bold"
                ? `radial-gradient(120% 120% at 20% 10%, ${accent}24, transparent 60%),
                   linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`
                : `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(18px) saturate(1.25)",
        WebkitBackdropFilter: "blur(18px) saturate(1.25)",
        boxShadow: `0 34px 110px ${colors.shadow}`,
        padding: compact ? 14 : 16,
    }

    const supportLeft: React.CSSProperties = { display: "grid", gap: 6 }
    const supportT: React.CSSProperties = {
        margin: 0,
        fontSize: 16,
        fontWeight: 950,
        letterSpacing: "-0.02em",
    }
    const supportB: React.CSSProperties = {
        margin: 0,
        fontSize: 13,
        color: colors.muted,
        lineHeight: 1.6,
    }

    const btnRow: React.CSSProperties = {
        display: "flex",
        gap: 10,
        justifyContent: isMobile ? "flex-start" : "flex-end",
        flexWrap: "wrap",
    }

    const btnPrimary: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 14px",
        borderRadius: 999,
        border: `1px solid ${accent}55`,
        background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
        color: "#fff",
        fontWeight: 950,
        fontSize: 13,
        textDecoration: "none",
        outline: "none",
        boxShadow: `0 18px 44px ${accent}22`,
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease",
        userSelect: "none",
    }

    const btnSecondary: React.CSSProperties = {
        display: showSupportSecondary ? "inline-flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background: "transparent",
        color: colors.text,
        fontWeight: 900,
        fontSize: 13,
        textDecoration: "none",
        outline: "none",
        userSelect: "none",
    }

    const onKeyNav = (e: React.KeyboardEvent, idx: number) => {
        const key = e.key
        const last = safeItems.length - 1
        if (key === "ArrowDown") {
            e.preventDefault()
            const next = idx === last ? 0 : idx + 1
            buttonRefs.current[next]?.focus()
        }
        if (key === "ArrowUp") {
            e.preventDefault()
            const prev = idx === 0 ? last : idx - 1
            buttonRefs.current[prev]?.focus()
        }
        if (key === "Home") {
            e.preventDefault()
            buttonRefs.current[0]?.focus()
        }
        if (key === "End") {
            e.preventDefault()
            buttonRefs.current[last]?.focus()
        }
    }

    return (
        <section ref={ref} style={root}>
            <div style={bgWash} />

            <div style={inner}>
                <div style={header}>
                    <h2 style={h2}>{title}</h2>
                    <p style={sub}>{subtitle}</p>
                </div>

                <div style={list} aria-label="FAQ accordion">
                    {safeItems.map((it, idx) => {
                        const isOpen = openSet.has(idx)
                        const btnId = `faq-btn-${idx}`
                        const panelId = `faq-panel-${idx}`

                        return (
                            <div
                                key={idx}
                                style={itemCard}
                                onMouseEnter={(e) => {
                                    if (reducedMotion || !enableHoverLift)
                                        return
                                    ;(
                                        e.currentTarget as HTMLDivElement
                                    ).style.transform = `translateY(${lift}px)`
                                    ;(
                                        e.currentTarget as HTMLDivElement
                                    ).style.boxShadow =
                                        `0 34px 110px ${colors.shadow}, 0 0 0 3px ${accent}12`
                                }}
                                onMouseLeave={(e) => {
                                    ;(
                                        e.currentTarget as HTMLDivElement
                                    ).style.transform = "translateY(0)"
                                    ;(
                                        e.currentTarget as HTMLDivElement
                                    ).style.boxShadow =
                                        variant === "bold"
                                            ? `0 28px 80px ${colors.shadow}`
                                            : `0 18px 44px ${colors.shadow}`
                                }}
                            >
                                <button
                                    ref={(el) => (buttonRefs.current[idx] = el)}
                                    id={btnId}
                                    type="button"
                                    style={qBtn}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    onClick={() => toggle(idx)}
                                    onKeyDown={(e) => onKeyNav(e, idx)}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = "none"
                                    }}
                                >
                                    <span style={left}>
                                        <span
                                            style={iconChip}
                                            aria-hidden="true"
                                        >
                                            {it.icon || "💜"}
                                        </span>
                                        <span style={qText}>
                                            <span style={qTop}>
                                                <span style={qTitle}>
                                                    {it.question}
                                                </span>
                                                {it.badge ? (
                                                    <span style={badge}>
                                                        {it.badge}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </span>
                                    </span>

                                    <span
                                        style={{
                                            ...chevron,
                                            transform: isOpen
                                                ? "rotate(0deg)"
                                                : "rotate(0deg)",
                                        }}
                                        aria-hidden="true"
                                    >
                                        {isOpen
                                            ? collapseIcon || "−"
                                            : expandIcon || "+"}
                                    </span>
                                </button>

                                <div style={contentOuter}>
                                    <div
                                        id={panelId}
                                        role="region"
                                        aria-labelledby={btnId}
                                        style={contentWrap(isOpen, idx)}
                                    >
                                        <div
                                            ref={(el) =>
                                                (contentRefs.current[idx] = el)
                                            }
                                        >
                                            <p style={aText}>{it.answer}</p>

                                            {it.showLink ? (
                                                <Link
                                                    href={it.linkHref || "#"}
                                                    target={targetFor(
                                                        it.linkNewTab
                                                    )}
                                                    rel={
                                                        it.linkNewTab
                                                            ? "noreferrer"
                                                            : undefined
                                                    }
                                                    style={linkPill}
                                                    aria-label={
                                                        it.linkLabel ||
                                                        "Learn more"
                                                    }
                                                    onFocus={(e) =>
                                                        Object.assign(
                                                            e.currentTarget
                                                                .style,
                                                            focusRing
                                                        )
                                                    }
                                                    onBlur={(e) => {
                                                        e.currentTarget.style.boxShadow =
                                                            "none"
                                                    }}
                                                >
                                                    <span>
                                                        {it.linkLabel ||
                                                            "Learn more"}
                                                    </span>
                                                    <span
                                                        aria-hidden="true"
                                                        style={{
                                                            color: accent,
                                                            fontWeight: 950,
                                                        }}
                                                    >
                                                        →
                                                    </span>
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {showSupportCTA && (
                    <div style={supportCard} aria-label="Support CTA">
                        <div style={supportLeft}>
                            <p style={supportT}>{supportTitle}</p>
                            <p style={supportB}>{supportBody}</p>
                        </div>

                        <div style={btnRow}>
                            {showSupportSecondary && (
                                <Link
                                    href={supportSecondaryHref || "#"}
                                    target={targetFor(supportSecondaryNewTab)}
                                    rel={
                                        supportSecondaryNewTab
                                            ? "noreferrer"
                                            : undefined
                                    }
                                    style={btnSecondary}
                                    aria-label={supportSecondaryLabel}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                >
                                    <span>{supportSecondaryLabel}</span>
                                </Link>
                            )}

                            <Link
                                href={supportPrimaryHref || "#"}
                                target={targetFor(supportPrimaryNewTab)}
                                rel={
                                    supportPrimaryNewTab
                                        ? "noreferrer"
                                        : undefined
                                }
                                style={btnPrimary}
                                aria-label={supportPrimaryLabel}
                                onMouseEnter={(e) => {
                                    if (reducedMotion || !enableHoverLift)
                                        return
                                    e.currentTarget.style.transform =
                                        "translateY(-1px)"
                                    e.currentTarget.style.boxShadow = `0 22px 56px ${accent}28, 0 0 0 3px ${accent}18`
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)"
                                    e.currentTarget.style.boxShadow = `0 18px 44px ${accent}22`
                                }}
                                onFocus={(e) =>
                                    Object.assign(e.currentTarget.style, focusRing)
                                }
                            >
                                <span>{supportPrimaryLabel}</span>
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
