"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"

type ThemeMode = "auto" | "light" | "dark"
type BackgroundStyle = "solid" | "glass"
type Density = "comfortable" | "compact"
type Variant = "minimal" | "bold"
type ToggleStyle = "icon" | "iconText"

type NavItem = {
    label: string
    href: string
    newTab?: boolean
}

type HeaderProps = {
    // Content
    brandName?: string
    logoImageUrl?: string
    logoLink?: string
    showLogoImage?: boolean

    showAnnouncement?: boolean
    announcementText?: string
    announcementHref?: string
    announcementIcon?: string

    navItems?: NavItem[]

    primaryCtaLabel?: string
    primaryCtaHref?: string
    primaryCtaNewTab?: boolean

    secondaryCtaLabel?: string
    secondaryCtaHref?: string
    secondaryCtaNewTab?: boolean
    showSecondaryCta?: boolean

    // Theme Toggle
    showThemeToggle?: boolean
    persistTheme?: boolean
    toggleStyle?: ToggleStyle
    toggleLightLabel?: string
    toggleDarkLabel?: string
    toggleLightIcon?: string
    toggleDarkIcon?: string
    toggleAriaLabel?: string

    // Style
    variant?: Variant
    theme?: ThemeMode
    backgroundStyle?: BackgroundStyle
    accent?: string

    // Light colors
    textColor?: string
    bgColor?: string

    // Dark colors
    darkTextColor?: string
    darkBgColor?: string

    fontFamily?: string
    logoSize?: number
    navFontSize?: number
    buttonFontSize?: number
    radius?: number
    sticky?: boolean
    density?: Density
    showDividerGlow?: boolean

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


export default function Header(props: HeaderProps) {
    const {
        style,
        brandName = "AllWebsiteTemplates",
        logoImageUrl,
        logoLink = "/",
        showLogoImage = false,
        showAnnouncement = false,
        announcementText = "",
        announcementHref = "#",
        announcementIcon = "✨",
        navItems = [],
        primaryCtaLabel = "Get Started",
        primaryCtaHref = "#",
        primaryCtaNewTab = false,
        secondaryCtaLabel = "Browse",
        secondaryCtaHref = "#",
        secondaryCtaNewTab = false,
        showSecondaryCta = true,
        // Toggle
        showThemeToggle = true,
        persistTheme = true,
        toggleStyle = "icon",
        toggleLightLabel = "Light",
        toggleDarkLabel = "Dark",
        toggleLightIcon = "☀️",
        toggleDarkIcon = "🌙",
        toggleAriaLabel = "Toggle light and dark mode",
        variant = "bold",
        theme = "auto",
        backgroundStyle = "glass",
        accent = "#A855F7",
        textColor = "#0B0B12",
        bgColor = "#FFFFFF",
        darkTextColor = "#F4F5FF",
        darkBgColor = "#070711",
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        logoSize = 22,
        navFontSize = 14,
        buttonFontSize = 14,
        radius = 14,
        sticky = true,
        density = "comfortable",
        showDividerGlow = true,
    } = props

    const reducedMotion = usePrefersReducedMotion()
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const { theme: contextTheme, toggleTheme } = useTheme()

    const isMobile = width <= 720
    const isTablet = width > 720 && width <= 980

    // Use context theme, but allow prop override for specific cases
    const mode = theme === "light" || theme === "dark" ? theme : contextTheme

    const padX = density === "compact" ? 14 : 18
    const headerH = density === "compact" ? 64 : 72

    const [menuOpen, setMenuOpen] = React.useState(false)

    React.useEffect(() => {
        if (!isMobile) setMenuOpen(false)
    }, [isMobile])

    React.useEffect(() => {
        if (!menuOpen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [menuOpen])

    const colors = React.useMemo(() => {
        const light = {
            bg: bgColor || "#FFFFFF",
            text: textColor || "#0B0B12",
            muted: "rgba(11,11,18,.68)",
            card: "rgba(255,255,255,.72)",
            card2: "rgba(255,255,255,.58)",
        }
        const dark = {
            bg: darkBgColor || "#070711",
            text: darkTextColor || "#F4F5FF",
            muted: "rgba(244,245,255,.72)",
            card: "rgba(10,10,22,.62)",
            card2: "rgba(10,10,22,.48)",
        }
        return mode === "dark" ? dark : light
    }, [mode, bgColor, textColor, darkBgColor, darkTextColor])

    const glass = backgroundStyle === "glass"

    const divider = showDividerGlow
        ? `linear-gradient(90deg, transparent, ${accent}33, transparent)`
        : mode === "dark"
          ? "linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)"
          : "linear-gradient(90deg, transparent, rgba(0,0,0,.08), transparent)"

    const root: React.CSSProperties = {
        ...style,
        width: "100%",
        height: "auto",
        position: sticky ? "sticky" : "relative",
        top: sticky ? 0 : undefined,
        zIndex: 50,
        fontFamily,
        color: colors.text,
        background: glass
            ? `linear-gradient(180deg, ${colors.card}, rgba(0,0,0,0))`
            : colors.bg,
        backdropFilter: glass ? "blur(12px) saturate(1.2)" : undefined,
        WebkitBackdropFilter: glass ? "blur(12px) saturate(1.2)" : undefined,
        borderBottom:
            mode === "dark"
                ? "1px solid rgba(168,85,247,.20)"
                : "1px solid rgba(168,85,247,.16)",
        boxShadow:
            variant === "bold"
                ? mode === "dark"
                    ? "0 10px 30px rgba(0,0,0,.35), 0 1px 0 rgba(168,85,247,.14)"
                    : "0 10px 30px rgba(10,10,20,.08), 0 1px 0 rgba(168,85,247,.14)"
                : mode === "dark"
                  ? "0 8px 24px rgba(0,0,0,.30)"
                  : "0 8px 24px rgba(10,10,20,.06)",
    }

    const inner: React.CSSProperties = {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: `0 ${padX}px`,
    }

    const row: React.CSSProperties = {
        height: headerH,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    }

    const logoWrap: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 160,
        textDecoration: "none",
        color: "inherit",
    }

    const logoMark: React.CSSProperties = {
        width: clamp(logoSize, 18, 34),
        height: clamp(logoSize, 18, 34),
        borderRadius: clamp(radius, 10, 18),
        overflow: "hidden",
        background: `radial-gradient(120% 120% at 20% 10%, ${accent}55, transparent 60%), linear-gradient(135deg, ${accent}22, transparent)`,
        boxShadow: `0 10px 30px ${accent}1F`,
        display: "grid",
        placeItems: "center",
        border: `1px solid ${accent}2A`,
        flex: "0 0 auto",
    }

    const logoText: React.CSSProperties = {
        fontSize: clamp(logoSize + 2, 16, 20),
        fontWeight: 650,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        whiteSpace: "nowrap",
    }

    const badge: React.CSSProperties = {
        fontSize: 12,
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${accent}33`,
        background: `linear-gradient(180deg, ${accent}12, transparent)`,
        color: colors.muted,
        fontWeight: 600,
    }

    const nav: React.CSSProperties = {
        display: isMobile ? "none" : "flex",
        alignItems: "center",
        gap: isTablet ? 14 : 18,
        flex: "1 1 auto",
        justifyContent: "center",
        minWidth: 0,
    }

    const linkStyle: React.CSSProperties = {
        fontSize: clamp(navFontSize, 12, 16),
        fontWeight: 560,
        color: colors.muted,
        textDecoration: "none",
        position: "relative",
        padding: "10px 6px",
        borderRadius: 10,
        outline: "none",
    }

    const ctas: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: "0 0 auto",
    }

    const btnBase: React.CSSProperties = {
        fontSize: clamp(buttonFontSize, 12, 16),
        fontWeight: 650,
        borderRadius: clamp(radius, 10, 18),
        padding: density === "compact" ? "9px 12px" : "10px 14px",
        border: "1px solid transparent",
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        userSelect: "none",
        outline: "none",
        background: "transparent",
        transition: reducedMotion
            ? "none"
            : "transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease, background 220ms ease",
    }

    const btnSecondary: React.CSSProperties = {
        ...btnBase,
        color: colors.text,
        border: `1px solid rgba(168,85,247,.22)`,
        boxShadow:
            mode === "dark"
                ? "0 8px 20px rgba(0,0,0,.26)"
                : "0 8px 20px rgba(10,10,20,.06)",
        background: mode === "dark" ? "rgba(255,255,255,.02)" : "transparent",
    }

    const btnPrimary: React.CSSProperties = {
        ...btnBase,
        background:
            variant === "bold"
                ? `linear-gradient(135deg, ${accent}, #7C3AED)`
                : `linear-gradient(135deg, ${accent}, #8B5CF6)`,
        color: "#FFFFFF",
        boxShadow: `0 12px 30px ${accent}2A`,
        border: `1px solid ${accent}55`,
    }

    const menuBtn: React.CSSProperties = {
        ...btnSecondary,
        padding: density === "compact" ? "9px 10px" : "10px 10px",
        display: isMobile ? "inline-flex" : "none",
        lineHeight: 0,
    }

    const themeBtn: React.CSSProperties = {
        ...btnSecondary,
        padding: density === "compact" ? "9px 10px" : "10px 10px",
        lineHeight: 0,
    }

    const announceWrap: React.CSSProperties = {
        display: showAnnouncement ? "block" : "none",
        borderBottom: "1px solid rgba(168,85,247,.12)",
        background: `linear-gradient(90deg, ${accent}12, transparent 40%, ${accent}12)`,
    }

    const announceInner: React.CSSProperties = {
        ...inner,
        paddingTop: 8,
        paddingBottom: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 13,
        color: colors.muted,
    }

    const announcePill: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}22`,
        background: glass
            ? colors.card2
            : mode === "dark"
              ? "rgba(255,255,255,.04)"
              : "rgba(255,255,255,.65)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: `0 10px 26px ${accent}14`,
        textDecoration: "none",
        color: colors.text,
        fontWeight: 600,
    }

    const dividerGlow: React.CSSProperties = {
        height: 1,
        backgroundImage: divider,
        opacity: showDividerGlow ? 1 : 0.6,
    }

    const drawerWrap: React.CSSProperties = {
        display: isMobile ? "block" : "none",
        overflow: "hidden",
        maxHeight: menuOpen ? 520 : 0,
        transition: reducedMotion
            ? "none"
            : "max-height 320ms cubic-bezier(.2,.8,.2,1)",
        borderBottom: `1px solid rgba(168,85,247,.14)`,
    }

    const drawerInner: React.CSSProperties = {
        ...inner,
        paddingTop: 14,
        paddingBottom: 16,
        display: "grid",
        gap: 10,
    }

    const drawerLink: React.CSSProperties = {
        ...linkStyle,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 12px",
        background:
            variant === "bold"
                ? `linear-gradient(180deg, ${accent}0D, transparent)`
                : "transparent",
        border: `1px solid rgba(168,85,247,.14)`,
    }

    const focusRing: React.CSSProperties = {
        boxShadow: `0 0 0 3px ${accent}33`,
    }

    const HoverLift = reducedMotion ? 0 : -1
    const safeNav = (navItems || []).slice(0, 7)

    const themeLabel = mode === "dark" ? toggleDarkLabel : toggleLightLabel
    const themeIcon = mode === "dark" ? toggleDarkIcon : toggleLightIcon

    return (
        <header ref={ref} style={root}>
            {/* Announcement */}
            {showAnnouncement && (
                <div style={announceWrap}>
                    <div style={announceInner}>
                        <Link
                            href={announcementHref || "#"}
                            style={announcePill}
                            aria-label="Announcement"
                        >
                            <span
                                aria-hidden="true"
                                style={{
                                    filter: `drop-shadow(0 6px 14px rgba(168,85,247,.25))`,
                                }}
                            >
                                {announcementIcon || "✨"}
                            </span>
                            <span style={{ opacity: 0.9 }}>{announcementText}</span>
                            <span aria-hidden="true" style={{ color: accent }}>
                                →
                            </span>
                        </Link>
                    </div>
                    <div style={dividerGlow} />
                </div>
            )}

            {/* Main header */}
            <div style={inner}>
                <div style={row}>
                    {/* Logo */}
                    <Link
                        href={logoLink || "/"}
                        style={logoWrap}
                        aria-label="Home"
                    >
                        {showLogoImage && (
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
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M12 2l2.4 6.1L21 10l-6.6 1.9L12 18l-2.4-6.1L3 10l6.6-1.9L12 2z"
                                            stroke={accent}
                                            strokeWidth="1.8"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </div>
                        )}

                        <div style={logoText}>
                            <span>{brandName}</span>
                            <span style={badge}>Templates</span>
                        </div>
                    </Link>

                    {/* Nav */}
                    <nav style={nav} aria-label="Primary navigation">
                        {safeNav.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href || "#"}
                                target={item.newTab ? "_blank" : "_self"}
                                rel={item.newTab ? "noreferrer" : undefined}
                                style={linkStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = colors.text)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = colors.muted)
                                }
                                onFocus={(e) =>
                                    Object.assign(e.currentTarget.style, {
                                        color: colors.text,
                                    })
                                }
                                onBlur={(e) =>
                                    Object.assign(e.currentTarget.style, {
                                        color: colors.muted,
                                    })
                                }
                            >
                                <span>{item.label}</span>
                                <span
                                    aria-hidden="true"
                                    style={{
                                        position: "absolute",
                                        left: 10,
                                        right: 10,
                                        bottom: 6,
                                        height: 2,
                                        borderRadius: 999,
                                        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                                        opacity: 0,
                                        transform: "translateY(2px)",
                                        transition: reducedMotion
                                            ? "none"
                                            : "opacity 180ms ease, transform 180ms ease",
                                    }}
                                    className="neon-underline"
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* CTAs */}
                    <div style={ctas}>
                        {/* Theme toggle */}
                        {showThemeToggle && (
                            <button
                                type="button"
                                style={themeBtn}
                                aria-label={toggleAriaLabel || "Toggle theme"}
                                onClick={toggleTheme}
                                onFocus={(e) =>
                                    Object.assign(
                                        e.currentTarget.style,
                                        focusRing
                                    )
                                }
                                onBlur={(e) =>
                                    Object.assign(e.currentTarget.style, {
                                        boxShadow:
                                            mode === "dark"
                                                ? "0 8px 20px rgba(0,0,0,.26)"
                                                : "0 8px 20px rgba(10,10,20,.06)",
                                    })
                                }
                                onMouseEnter={(e) => {
                                    if (reducedMotion) return
                                    e.currentTarget.style.transform = `translateY(${HoverLift}px)`
                                    e.currentTarget.style.boxShadow = `0 14px 34px rgba(10,10,20,.10), 0 0 0 3px ${accent}18`
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)"
                                    e.currentTarget.style.boxShadow =
                                        mode === "dark"
                                            ? "0 8px 20px rgba(0,0,0,.26)"
                                            : "0 8px 20px rgba(10,10,20,.06)"
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{ fontSize: 16, lineHeight: 0 }}
                                >
                                    {themeIcon}
                                </span>
                                {toggleStyle === "iconText" && (
                                    <span
                                        style={{
                                            fontSize: clamp(
                                                buttonFontSize,
                                                12,
                                                16
                                            ),
                                            lineHeight: 1,
                                        }}
                                    >
                                        {themeLabel}
                                    </span>
                                )}
                            </button>
                        )}

                        {showSecondaryCta && (
                            <Link
                                href={secondaryCtaHref || "#"}
                                target={secondaryCtaNewTab ? "_blank" : "_self"}
                                rel={
                                    secondaryCtaNewTab
                                        ? "noreferrer"
                                        : undefined
                                }
                                style={btnSecondary}
                                onMouseEnter={(e) => {
                                    if (reducedMotion) return
                                    e.currentTarget.style.transform = `translateY(${HoverLift}px)`
                                    e.currentTarget.style.boxShadow = `0 14px 34px rgba(10,10,20,.10), 0 0 0 3px ${accent}22`
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)"
                                    e.currentTarget.style.boxShadow =
                                        mode === "dark"
                                            ? "0 8px 20px rgba(0,0,0,.26)"
                                            : "0 8px 20px rgba(10,10,20,.06)"
                                }}
                                onFocus={(e) =>
                                    Object.assign(
                                        e.currentTarget.style,
                                        focusRing
                                    )
                                }
                                onBlur={(e) =>
                                    Object.assign(e.currentTarget.style, {
                                        boxShadow:
                                            mode === "dark"
                                                ? "0 8px 20px rgba(0,0,0,.26)"
                                                : "0 8px 20px rgba(10,10,20,.06)",
                                    })
                                }
                                aria-label={secondaryCtaLabel}
                            >
                                {secondaryCtaLabel}
                            </Link>
                        )}

                        <Link
                            href={primaryCtaHref || "#"}
                            target={primaryCtaNewTab ? "_blank" : "_self"}
                            rel={primaryCtaNewTab ? "noreferrer" : undefined}
                            style={btnPrimary}
                            onMouseEnter={(e) => {
                                if (reducedMotion) return
                                e.currentTarget.style.transform = `translateY(${HoverLift}px)`
                                e.currentTarget.style.boxShadow = `0 18px 40px ${accent}2A, 0 0 0 3px ${accent}22`
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)"
                                e.currentTarget.style.boxShadow = `0 12px 30px ${accent}2A`
                            }}
                            onFocus={(e) =>
                                Object.assign(e.currentTarget.style, focusRing)
                            }
                            onBlur={(e) =>
                                Object.assign(e.currentTarget.style, {
                                    boxShadow: `0 12px 30px ${accent}2A`,
                                })
                            }
                            aria-label={primaryCtaLabel}
                        >
                            <span>{primaryCtaLabel}</span>
                            <span aria-hidden="true" style={{ opacity: 0.9 }}>
                                →
                            </span>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            style={menuBtn}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((s) => !s)}
                            onFocus={(e) =>
                                Object.assign(e.currentTarget.style, focusRing)
                            }
                            onBlur={(e) =>
                                Object.assign(e.currentTarget.style, {
                                    boxShadow:
                                        mode === "dark"
                                            ? "0 8px 20px rgba(0,0,0,.26)"
                                            : "0 8px 20px rgba(10,10,20,.06)",
                                })
                            }
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                {menuOpen ? (
                                    <path
                                        d="M7 7l10 10M17 7L7 17"
                                        stroke={colors.text}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                ) : (
                                    <path
                                        d="M5 7h14M5 12h14M5 17h14"
                                        stroke={colors.text}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            <div style={drawerWrap} aria-hidden={!isMobile}>
                <div style={drawerInner}>
                    {/* Theme toggle inside drawer */}
                    {showThemeToggle && (
                        <button
                            type="button"
                            style={{
                                ...btnSecondary,
                                justifyContent: "space-between",
                                width: "100%",
                                padding: "12px 12px",
                                border: `1px solid rgba(168,85,247,.14)`,
                            }}
                            aria-label={toggleAriaLabel || "Toggle theme"}
                            onClick={toggleTheme}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{ fontSize: 16 }}
                                >
                                    {themeIcon}
                                </span>
                                <span style={{ fontWeight: 750 }}>
                                    {themeLabel}
                                </span>
                            </span>
                            <span
                                aria-hidden="true"
                                style={{ color: accent, fontWeight: 900 }}
                            >
                                →
                            </span>
                        </button>
                    )}

                    {safeNav.map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.href || "#"}
                            target={item.newTab ? "_blank" : "_self"}
                            rel={item.newTab ? "noreferrer" : undefined}
                            style={drawerLink}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>{item.label}</span>
                            <span
                                aria-hidden="true"
                                style={{ color: accent, fontWeight: 800 }}
                            >
                                →
                            </span>
                        </Link>
                    ))}

                    <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
                        {showSecondaryCta && (
                            <Link
                                href={secondaryCtaHref || "#"}
                                target={secondaryCtaNewTab ? "_blank" : "_self"}
                                rel={
                                    secondaryCtaNewTab
                                        ? "noreferrer"
                                        : undefined
                                }
                                style={{
                                    ...btnSecondary,
                                    justifyContent: "center",
                                }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {secondaryCtaLabel}
                            </Link>
                        )}
                        <Link
                            href={primaryCtaHref || "#"}
                            target={primaryCtaNewTab ? "_blank" : "_self"}
                            rel={primaryCtaNewTab ? "noreferrer" : undefined}
                            style={{ ...btnPrimary, justifyContent: "center" }}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>{primaryCtaLabel}</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Underline hover */}
            <style jsx>{`
                nav a:hover .neon-underline {
                    opacity: 1;
                    transform: translateY(0);
                }
                nav a:focus .neon-underline {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </header>
    )
}
