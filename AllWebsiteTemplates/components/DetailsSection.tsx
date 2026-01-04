"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type Variant = "minimal" | "bold"
type Density = "comfortable" | "compact"

type Feature = {
    icon: string
    title: string
    body: string
    linkLabel: string
    linkHref: string
    linkNewTab?: boolean
    showLink?: boolean
}

type Integration = {
    name: string
    logoUrl: string
    href: string
    newTab?: boolean
}

type DetailsSectionProps = {
    // Copy
    title?: string
    subtitle?: string

    // Features
    features?: Feature[]
    maxFeatures?: number

    // Integrations
    showIntegrations?: boolean
    integrationsTitle?: string
    integrations?: Integration[]
    maxIntegrations?: number

    // CTA
    showCTA?: boolean
    ctaTitle?: string
    ctaBody?: string
    primaryLabel?: string
    primaryHref?: string
    primaryNewTab?: boolean
    secondaryLabel?: string
    secondaryHref?: string
    secondaryNewTab?: boolean
    showSecondary?: boolean

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
    gridGap?: number

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

export default function DetailsSection(props: DetailsSectionProps) {
    const {
        style,
        title = "Built for creators who ship fast",
        subtitle = "A curated marketplace of Framer + Figma templates and resources. Filter instantly, customize deeply, and publish with confidence.",
        features = [],
        maxFeatures = 6,
        showIntegrations = true,
        integrationsTitle = "Works with",
        integrations = [],
        maxIntegrations = 10,
        showCTA = true,
        ctaTitle = "Start with free templates today",
        ctaBody = "Grab the free pack or upgrade for full access to premium templates and resource drops.",
        primaryLabel = "Get Access",
        primaryHref = "/pricing",
        primaryNewTab = false,
        secondaryLabel = "Explore Freebies",
        secondaryHref = "/freebies",
        secondaryNewTab = false,
        showSecondary = true,
        variant = "bold",
        theme = "auto",
        density = "comfortable",
        accent = "#A855F7",
        background = "#FFFFFF",
        textColor = "#0B0B12",
        darkBackground = "#070711",
        darkTextColor = "#F4F5FF",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        radius = 16,
        maxWidth = 1200,
        gridGap = 14,
        enableHoverLift = true,
    } = props

    const reducedMotion = usePrefersReducedMotion()
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { theme: contextTheme } = useTheme()

    const resolvedTheme = theme === "light" || theme === "dark" ? theme : contextTheme

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
    }, [resolvedTheme, background, textColor, darkBackground, darkTextColor])

    const padY = isMobile ? 48 : isTablet ? 64 : 76
    const padX = isMobile ? 18 : 24
    const compact = density === "compact"

    const cols = isMobile ? 1 : isTablet ? 2 : 3
    const safeFeatures = (features || []).slice(0, clamp(maxFeatures, 1, 12))
    const safeIntegrations = (integrations || []).slice(
        0,
        clamp(maxIntegrations, 1, 24)
    )

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
        background: `radial-gradient(40% 60% at 18% 40%, ${accent}2A, transparent 70%),
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
        gap: 18,
    }

    const header: React.CSSProperties = {
        display: "grid",
        gap: 8,
        maxWidth: 820,
    }

    const h2: React.CSSProperties = {
        margin: 0,
        fontSize: isMobile ? 24 : 30,
        fontWeight: 900,
        letterSpacing: "-0.03em",
        lineHeight: 1.08,
    }

    const sub: React.CSSProperties = {
        margin: 0,
        fontSize: isMobile ? 14 : 15,
        lineHeight: 1.55,
        color: colors.muted,
    }

    const grid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: clamp(gridGap, 10, 22),
    }

    const card: React.CSSProperties = {
        borderRadius: clamp(radius + 6, 14, 28),
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        boxShadow:
            variant === "bold"
                ? `0 28px 70px ${colors.shadow}, 0 0 0 1px ${accent}10`
                : `0 18px 44px ${colors.shadow}`,
        padding: compact ? 12 : 14,
        display: "grid",
        gap: 10,
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease",
        outline: "none",
    }

    const iconChip: React.CSSProperties = {
        width: 44,
        height: 44,
        borderRadius: clamp(radius, 12, 18),
        display: "grid",
        placeItems: "center",
        border: `1px solid ${accent}22`,
        background: `radial-gradient(120% 120% at 20% 10%, ${accent}28, transparent 65%), linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        boxShadow: `0 16px 44px ${colors.shadow}`,
        fontSize: 18,
    }

    const cardTitle: React.CSSProperties = {
        margin: 0,
        fontSize: 15,
        fontWeight: 950,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
    }

    const cardBody: React.CSSProperties = {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.55,
        color: colors.muted,
    }

    const link: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        color: colors.text,
        fontWeight: 900,
        fontSize: 13,
        marginTop: 2,
        width: "fit-content",
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background:
            variant === "bold"
                ? `linear-gradient(135deg, ${accent}14, transparent)`
                : "transparent",
        outline: "none",
    }

    const integrationsWrap: React.CSSProperties = {
        display: showIntegrations ? "grid" : "none",
        gap: 10,
        marginTop: 6,
    }

    const integrationsLabel: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 900,
        color: colors.muted,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    }

    const integrationsRow: React.CSSProperties = {
        display: "flex",
        gap: 10,
        alignItems: "center",
        overflowX: isMobile ? "auto" : "hidden",
        paddingBottom: isMobile ? 6 : 0,
        scrollbarWidth: "none",
    }

    const integrationPill: React.CSSProperties = {
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(12px) saturate(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        boxShadow: `0 14px 34px ${colors.shadow}`,
        textDecoration: "none",
        color: colors.text,
        outline: "none",
    }

    const logo: React.CSSProperties = {
        width: 18,
        height: 18,
        borderRadius: 6,
        objectFit: "cover",
        display: "block",
        border: `1px solid ${accent}18`,
        background: `${accent}10`,
    }

    const ctaCard: React.CSSProperties = {
        display: showCTA ? "grid" : "none",
        gridTemplateColumns: isMobile ? "1fr" : "1.4fr auto",
        alignItems: "center",
        gap: 12,
        marginTop: 6,
        borderRadius: clamp(radius + 8, 16, 30),
        border: `1px solid ${accent}22`,
        background:
            variant === "bold"
                ? `radial-gradient(120% 120% at 20% 10%, ${accent}24, transparent 60%),
                   linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`
                : `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(16px) saturate(1.25)",
        WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        boxShadow: `0 30px 90px ${colors.shadow}`,
        padding: compact ? 14 : 16,
    }

    const ctaTextWrap: React.CSSProperties = { display: "grid", gap: 6 }
    const ctaT: React.CSSProperties = {
        margin: 0,
        fontSize: 16,
        fontWeight: 950,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
    }
    const ctaB: React.CSSProperties = {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.55,
        color: colors.muted,
    }

    const btnRow: React.CSSProperties = {
        display: "flex",
        gap: 10,
        justifyContent: isMobile ? "flex-start" : "flex-end",
        flexWrap: "wrap",
    }

    const btnBase: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 950,
        textDecoration: "none",
        outline: "none",
        cursor: "pointer",
        userSelect: "none",
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease",
    }

    const btnPrimary: React.CSSProperties = {
        ...btnBase,
        color: "#fff",
        background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
        border: `1px solid ${accent}55`,
        boxShadow: `0 18px 44px ${accent}22`,
    }

    const btnSecondary: React.CSSProperties = {
        ...btnBase,
        color: colors.text,
        background: "transparent",
        border: `1px solid ${colors.stroke}`,
        boxShadow: `0 14px 34px ${colors.shadow}`,
        display: showSecondary ? "inline-flex" : "none",
    }

    const focusRing: React.CSSProperties = {
        boxShadow: `0 0 0 4px ${accent}22`,
    }
    const lift = reducedMotion || !enableHoverLift ? 0 : -6

    return (
        <section ref={ref} style={root}>
            <div style={bgWash} />

            <div style={inner}>
                <div style={header}>
                    <h2 style={h2}>{title}</h2>
                    <p style={sub}>{subtitle}</p>
                </div>

                <div style={grid} aria-label="Value props">
                    {safeFeatures.map((f, i) => (
                        <div
                            key={i}
                            style={card}
                            tabIndex={0}
                            onMouseEnter={(e) => {
                                if (reducedMotion || !enableHoverLift) return
                                e.currentTarget.style.transform = `translateY(${lift}px)`
                                e.currentTarget.style.boxShadow = `0 30px 90px ${colors.shadow}, 0 0 0 3px ${accent}16`
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow =
                                    variant === "bold"
                                        ? `0 28px 70px ${colors.shadow}, 0 0 0 1px ${accent}10`
                                        : `0 18px 44px ${colors.shadow}`
                            }}
                            onFocus={(e) =>
                                Object.assign(
                                    (e.currentTarget as HTMLDivElement).style,
                                    focusRing
                                )
                            }
                            onBlur={(e) => {
                                ;(
                                    e.currentTarget as HTMLDivElement
                                ).style.boxShadow =
                                    variant === "bold"
                                        ? `0 28px 70px ${colors.shadow}, 0 0 0 1px ${accent}10`
                                        : `0 18px 44px ${colors.shadow}`
                            }}
                            aria-label={f.title}
                        >
                            <div style={iconChip} aria-hidden="true">
                                {f.icon || "✨"}
                            </div>
                            <p style={cardTitle}>{f.title}</p>
                            <p style={cardBody}>{f.body}</p>

                            {f.showLink ? (
                                <Link
                                    href={f.linkHref || "#"}
                                    target={targetFor(f.linkNewTab)}
                                    rel={f.linkNewTab ? "noreferrer" : undefined}
                                    style={link}
                                    aria-label={f.linkLabel}
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
                                    <span>{f.linkLabel}</span>
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
                    ))}
                </div>

                {showIntegrations && safeIntegrations.length > 0 && (
                    <div style={integrationsWrap}>
                        <div style={integrationsLabel}>
                            {integrationsTitle}
                        </div>
                        <div style={integrationsRow} aria-label="Integrations">
                            {safeIntegrations.map((it, idx) => (
                                <Link
                                    key={idx}
                                    href={it.href || "#"}
                                    target={targetFor(it.newTab)}
                                    rel={it.newTab ? "noreferrer" : undefined}
                                    style={integrationPill}
                                    aria-label={it.name}
                                    onMouseEnter={(e) => {
                                        if (reducedMotion || !enableHoverLift)
                                            return
                                        e.currentTarget.style.transform =
                                            "translateY(-1px)"
                                        e.currentTarget.style.boxShadow = `0 18px 44px ${colors.shadow}, 0 0 0 3px ${accent}12`
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)"
                                        e.currentTarget.style.boxShadow = `0 14px 34px ${colors.shadow}`
                                    }}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = `0 14px 34px ${colors.shadow}`
                                    }}
                                >
                                    {it.logoUrl ? (
                                        <img
                                            src={it.logoUrl}
                                            alt=""
                                            style={logo}
                                        />
                                    ) : null}
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 900,
                                        }}
                                    >
                                        {it.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {showCTA && (
                    <div style={ctaCard} aria-label="CTA">
                        <div style={ctaTextWrap}>
                            <p style={ctaT}>{ctaTitle}</p>
                            <p style={ctaB}>{ctaBody}</p>
                        </div>

                        <div style={btnRow}>
                            {showSecondary && (
                                <Link
                                    href={secondaryHref || "#"}
                                    target={targetFor(secondaryNewTab)}
                                    rel={
                                        secondaryNewTab
                                            ? "noreferrer"
                                            : undefined
                                    }
                                    style={btnSecondary}
                                    aria-label={secondaryLabel}
                                    onMouseEnter={(e) => {
                                        if (reducedMotion || !enableHoverLift)
                                            return
                                        e.currentTarget.style.transform =
                                            "translateY(-1px)"
                                        e.currentTarget.style.boxShadow = `0 18px 44px ${colors.shadow}, 0 0 0 3px ${accent}12`
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)"
                                        e.currentTarget.style.boxShadow = `0 14px 34px ${colors.shadow}`
                                    }}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = `0 14px 34px ${colors.shadow}`
                                    }}
                                >
                                    <span>{secondaryLabel}</span>
                                </Link>
                            )}

                            <Link
                                href={primaryHref || "#"}
                                target={targetFor(primaryNewTab)}
                                rel={primaryNewTab ? "noreferrer" : undefined}
                                style={btnPrimary}
                                aria-label={primaryLabel}
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
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = `0 18px 44px ${accent}22`
                                }}
                            >
                                <span>{primaryLabel}</span>
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                section ::-webkit-scrollbar {
                    height: 0px;
                    width: 0px;
                }
            `}</style>
        </section>
    )
}
