"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type Variant = "minimal" | "bold"
type Density = "comfortable" | "compact"

type FooterLink = {
    label: string
    href: string
    newTab?: boolean
}

type FooterColumn = {
    title: string
    links: FooterLink[]
}

type SocialLink = {
    label: string
    icon: string // emoji or short text, fully editable
    href: string
    newTab?: boolean
}

type FooterProps = {
    // Brand
    brandName?: string
    brandTagline?: string
    logoImageUrl?: string
    showLogoImage?: boolean
    brandHref?: string

    // Newsletter
    showNewsletter?: boolean
    newsletterTitle?: string
    newsletterBody?: string
    emailPlaceholder?: string
    buttonLabel?: string
    buttonHref?: string
    buttonNewTab?: boolean
    showSecondaryLink?: boolean
    secondaryLinkLabel?: string
    secondaryLinkHref?: string
    secondaryLinkNewTab?: boolean

    // Columns
    columns?: FooterColumn[]
    maxColumns?: number
    maxLinksPerColumn?: number

    // Bottom
    socialLinks?: SocialLink[]
    maxSocial?: number
    legalLinks?: FooterLink[]
    maxLegal?: number
    copyrightText?: string

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
    radius?: number
    maxWidth?: number

    showGlowStrip?: boolean
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

export default function Footer(props: FooterProps) {
    const {
        style,
        brandName = "AllWebsiteTemplates",
        brandTagline = "Purple-neon website templates and design resources — curated for fast shipping.",
        logoImageUrl,
        showLogoImage = false,
        brandHref = "/",
        showNewsletter = true,
        newsletterTitle = "Newsletter",
        newsletterBody = "Weekly drops: new templates, freebies, and design tool resources. No spam.",
        emailPlaceholder = "you@company.com",
        buttonLabel = "Join",
        buttonHref = "/subscribe",
        buttonNewTab = false,
        showSecondaryLink = true,
        secondaryLinkLabel = "Browse Freebies",
        secondaryLinkHref = "/freebies",
        secondaryLinkNewTab = false,
        columns = [],
        maxColumns = 4,
        maxLinksPerColumn = 8,
        socialLinks = [],
        maxSocial = 6,
        legalLinks = [],
        maxLegal = 6,
        copyrightText = "© 2026 AllWebsiteTemplates. All rights reserved.",
        variant = "bold",
        density = "comfortable",
        theme = "auto",
        accent = "#A855F7",
        background = "#FFFFFF",
        textColor = "#0B0B12",
        darkBackground = "#070711",
        darkTextColor = "#F4F5FF",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        radius = 16,
        maxWidth = 1200,
        showGlowStrip = true,
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
            faint: "rgba(11,11,18,.45)",
            glass: "rgba(255,255,255,.74)",
            glass2: "rgba(255,255,255,.56)",
            stroke: "rgba(168,85,247,.18)",
            shadow: "rgba(10,10,20,.08)",
        }
        const dark = {
            bg: darkBackground || "#070711",
            text: darkTextColor || "#F4F5FF",
            muted: "rgba(244,245,255,.72)",
            faint: "rgba(244,245,255,.48)",
            glass: "rgba(10,10,22,.62)",
            glass2: "rgba(10,10,22,.44)",
            stroke: "rgba(168,85,247,.22)",
            shadow: "rgba(0,0,0,.35)",
        }
        return resolvedTheme === "dark" ? dark : light
    }, [resolvedTheme, background, textColor, darkBackground, darkTextColor])

    const padY = isMobile ? 44 : isTablet ? 56 : 72
    const padX = isMobile ? 18 : 24

    const safeColumns = (columns || [])
        .slice(0, clamp(maxColumns, 1, 6))
        .map((c) => ({
            ...c,
            links: (c.links || []).slice(0, clamp(maxLinksPerColumn, 1, 12)),
        }))
    const safeSocial = (socialLinks || []).slice(0, clamp(maxSocial, 1, 12))
    const safeLegal = (legalLinks || []).slice(0, clamp(maxLegal, 1, 8))

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
        inset: "auto -10% -30% -10%",
        height: 620,
        background: `radial-gradient(42% 70% at 20% 40%, ${accent}20, transparent 70%),
                     radial-gradient(42% 70% at 70% 60%, rgba(124,58,237,.18), transparent 70%),
                     radial-gradient(42% 70% at 90% 20%, rgba(192,132,252,.14), transparent 70%)`,
        filter: "blur(18px)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: resolvedTheme === "dark" ? 0.95 : 1,
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

    const topRow: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
        gap: 14,
        alignItems: "start",
    }

    const brandCard: React.CSSProperties = {
        borderRadius: clamp(radius + 10, 18, 34),
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(16px) saturate(1.25)",
        WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        boxShadow:
            variant === "bold"
                ? `0 28px 90px ${colors.shadow}`
                : `0 18px 44px ${colors.shadow}`,
        padding: compact ? 14 : 16,
        display: "grid",
        gap: 10,
    }

    const brandTop: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
    }

    const logoMark: React.CSSProperties = {
        width: 42,
        height: 42,
        borderRadius: clamp(radius, 12, 18),
        overflow: "hidden",
        background: `radial-gradient(120% 120% at 20% 10%, ${accent}28, transparent 65%), linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        border: `1px solid ${accent}22`,
        boxShadow: `0 16px 44px ${colors.shadow}`,
        flex: "0 0 auto",
        display: "grid",
        placeItems: "center",
    }

    const brandNameStyle: React.CSSProperties = {
        fontSize: 16,
        fontWeight: 950,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        margin: 0,
    }

    const tagline: React.CSSProperties = {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.6,
        color: colors.muted,
        maxWidth: 520,
    }

    const newsletterCard: React.CSSProperties = {
        display: showNewsletter ? "grid" : "none",
        borderRadius: clamp(radius + 10, 18, 34),
        border: `1px solid ${accent}22`,
        background:
            variant === "bold"
                ? `radial-gradient(120% 120% at 20% 10%, ${accent}24, transparent 60%),
                   linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`
                : `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(16px) saturate(1.25)",
        WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        boxShadow: `0 28px 90px ${colors.shadow}`,
        padding: compact ? 14 : 16,
        gap: 10,
    }

    const label: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 950,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: colors.muted,
    }

    const inputRow: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
        gap: 10,
        alignItems: "center",
    }

    const input: React.CSSProperties = {
        height: 44,
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        color: colors.text,
        padding: "0 14px",
        outline: "none",
        fontSize: 13,
        fontWeight: 800,
    }

    const btn: React.CSSProperties = {
        height: 44,
        borderRadius: 999,
        border: `1px solid ${accent}55`,
        background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
        color: "#fff",
        fontWeight: 950,
        fontSize: 13,
        padding: "0 14px",
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        outline: "none",
        userSelect: "none",
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease",
        boxShadow: `0 18px 44px ${accent}22`,
    }

    const secondaryLink: React.CSSProperties = {
        display: showSecondaryLink ? "inline-flex" : "none",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(135deg, ${accent}10, transparent)`,
        color: colors.text,
        textDecoration: "none",
        fontWeight: 900,
        fontSize: 13,
        width: "fit-content",
        outline: "none",
    }

    const columnsGrid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile
            ? "1fr"
            : `repeat(${Math.min(4, safeColumns.length || 1)}, minmax(0, 1fr))`,
        gap: 14,
        marginTop: 4,
    }

    const col: React.CSSProperties = {
        borderRadius: clamp(radius + 10, 18, 34),
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        backdropFilter: "blur(16px) saturate(1.25)",
        WebkitBackdropFilter: "blur(16px) saturate(1.25)",
        boxShadow:
            variant === "bold"
                ? `0 24px 80px ${colors.shadow}`
                : `0 18px 44px ${colors.shadow}`,
        padding: compact ? 14 : 16,
        display: "grid",
        gap: 10,
    }

    const colTitle: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 950,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: colors.muted,
        margin: 0,
    }

    const linkList: React.CSSProperties = {
        display: "grid",
        gap: 10,
    }

    const linkStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: colors.text,
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 850,
        outline: "none",
        width: "fit-content",
    }

    const bottomRow: React.CSSProperties = {
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        paddingTop: 6,
    }

    const socials: React.CSSProperties = {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
    }

    const socialBtn: React.CSSProperties = {
        height: 38,
        padding: "0 12px",
        borderRadius: 999,
        border: `1px solid ${colors.stroke}`,
        background: `linear-gradient(180deg, ${colors.glass}, ${colors.glass2})`,
        color: colors.text,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 950,
        fontSize: 13,
        outline: "none",
        transition: reducedMotion
            ? "none"
            : "transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease",
        boxShadow: `0 14px 34px ${colors.shadow}`,
        userSelect: "none",
    }

    const legalRow: React.CSSProperties = {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
    }

    const small: React.CSSProperties = {
        fontSize: 12,
        color: colors.muted,
        fontWeight: 800,
    }

    const focusRing: React.CSSProperties = {
        boxShadow: `0 0 0 4px ${accent}22`,
    }
    const lift = reducedMotion || !enableHoverLift ? 0 : -2

    const glowStrip: React.CSSProperties = {
        display: showGlowStrip ? "block" : "none",
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, rgba(124,58,237,1), transparent)`,
        opacity: 0.9,
    }

    return (
        <footer ref={ref} style={root}>
            <div style={bgWash} />
            <div style={inner}>
                <div style={topRow}>
                    <div style={brandCard}>
                        <Link
                            href={brandHref || "/"}
                            style={{
                                textDecoration: "none",
                                color: "inherit",
                            }}
                            aria-label="Home"
                        >
                            <div style={brandTop}>
                                {showLogoImage ? (
                                    <div style={logoMark} aria-hidden="true">
                                        {logoImageUrl ? (
                                            <img
                                                src={logoImageUrl}
                                                alt=""
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <span
                                                style={{
                                                    color: accent,
                                                    fontWeight: 950,
                                                }}
                                            >
                                                A
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                                <p style={brandNameStyle}>{brandName}</p>
                            </div>
                        </Link>
                        <p style={tagline}>{brandTagline}</p>
                    </div>

                    {showNewsletter && (
                        <div style={newsletterCard}>
                            <div style={label}>{newsletterTitle}</div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: colors.muted,
                                    lineHeight: 1.6,
                                }}
                            >
                                {newsletterBody}
                            </div>

                            <div style={inputRow}>
                                <input
                                    type="email"
                                    placeholder={emailPlaceholder}
                                    aria-label="Email"
                                    style={input}
                                    onFocus={(e) =>
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = "none"
                                    }}
                                />
                                <Link
                                    href={buttonHref || "#"}
                                    target={targetFor(buttonNewTab)}
                                    rel={buttonNewTab ? "noreferrer" : undefined}
                                    style={btn}
                                    aria-label={buttonLabel}
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
                                        Object.assign(
                                            e.currentTarget.style,
                                            focusRing
                                        )
                                    }
                                    onBlur={(e) => {
                                        e.currentTarget.style.boxShadow = `0 18px 44px ${accent}22`
                                    }}
                                >
                                    <span>{buttonLabel}</span>
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>

                            {showSecondaryLink && (
                                <Link
                                    href={secondaryLinkHref || "#"}
                                    target={targetFor(secondaryLinkNewTab)}
                                    rel={
                                        secondaryLinkNewTab
                                            ? "noreferrer"
                                            : undefined
                                    }
                                    style={secondaryLink}
                                    aria-label={secondaryLinkLabel}
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
                                    <span>{secondaryLinkLabel}</span>
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
                            )}
                        </div>
                    )}
                </div>

                {safeColumns.length > 0 && (
                    <div style={columnsGrid} aria-label="Footer links">
                        {safeColumns.map((c, idx) => (
                            <div key={idx} style={col}>
                                <p style={colTitle}>{c.title}</p>
                                <div style={linkList}>
                                    {(c.links || []).map((l, i) => (
                                        <Link
                                            key={i}
                                            href={l.href || "#"}
                                            target={targetFor(l.newTab)}
                                            rel={
                                                l.newTab
                                                    ? "noreferrer"
                                                    : undefined
                                            }
                                            style={linkStyle}
                                            aria-label={l.label}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color =
                                                    accent
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color =
                                                    colors.text
                                            }}
                                            onFocus={(e) =>
                                                Object.assign(
                                                    e.currentTarget.style,
                                                    focusRing
                                                )
                                            }
                                            onBlur={(e) => {
                                                e.currentTarget.style.boxShadow =
                                                    "none"
                                            }}
                                        >
                                            <span>{l.label}</span>
                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    color: colors.faint,
                                                }}
                                            >
                                                →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={bottomRow}>
                    {safeSocial.length > 0 && (
                        <div style={socials} aria-label="Social links">
                            {safeSocial.map((s, idx) => (
                                <Link
                                    key={idx}
                                    href={s.href || "#"}
                                    target={targetFor(s.newTab)}
                                    rel={s.newTab ? "noreferrer" : undefined}
                                    style={socialBtn}
                                    aria-label={s.label}
                                    onMouseEnter={(e) => {
                                        if (reducedMotion || !enableHoverLift)
                                            return
                                        e.currentTarget.style.transform = `translateY(${lift}px)`
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
                                    <span aria-hidden="true">
                                        {s.icon || "✦"}
                                    </span>
                                    <span>{s.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div style={legalRow} aria-label="Legal links">
                        {safeLegal.map((l, idx) => (
                            <Link
                                key={idx}
                                href={l.href || "#"}
                                target={targetFor(l.newTab)}
                                rel={l.newTab ? "noreferrer" : undefined}
                                style={{
                                    ...small,
                                    textDecoration: "none",
                                    outline: "none",
                                }}
                                aria-label={l.label}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = accent)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = colors.muted)
                                }
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
                                {l.label}
                            </Link>
                        ))}
                        <span style={small}>{copyrightText}</span>
                    </div>
                </div>
            </div>

            <div style={glowStrip} aria-hidden="true" />

            <style jsx>{`
                footer ::-webkit-scrollbar {
                    height: 0px;
                    width: 0px;
                }
            `}</style>
        </footer>
    )
}
