"use client"

import * as React from "react"

const STORAGE_KEY = "allwebsitetemplates_theme_v1"

type Theme = "light" | "dark"

type ThemeContextType = {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window === "undefined") return "dark" // Default to dark
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored === "light" || stored === "dark") return stored
        return "dark" // Default to dark
    })

    const applyThemeToDocument = React.useCallback((newTheme: Theme) => {
        if (typeof window === "undefined") return
        document.documentElement.setAttribute("data-theme", newTheme)
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark")
            document.documentElement.classList.remove("light")
        } else {
            document.documentElement.classList.add("light")
            document.documentElement.classList.remove("dark")
        }
    }, [])

    const setTheme = React.useCallback((newTheme: Theme) => {
        setThemeState(newTheme)
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, newTheme)
            applyThemeToDocument(newTheme)
        }
    }, [applyThemeToDocument])

    const toggleTheme = React.useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark")
    }, [theme, setTheme])

    // Initialize theme on mount
    React.useEffect(() => {
        applyThemeToDocument(theme)
    }, []) // Only run once on mount

    // Update document when theme changes
    React.useEffect(() => {
        applyThemeToDocument(theme)
    }, [theme, applyThemeToDocument])

    // Listen for system theme changes (if user hasn't set a preference)
    React.useEffect(() => {
        if (typeof window === "undefined") return
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored) return // User has set a preference, don't listen to system

        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => {
            if (!window.localStorage.getItem(STORAGE_KEY)) {
                setTheme(mq.matches ? "dark" : "light")
            }
        }
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [setTheme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = React.useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
