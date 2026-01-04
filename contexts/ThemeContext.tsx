"use client"

import * as React from "react"

const STORAGE_KEY = "theme"

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
        // Check if theme-light class is already set (from main app)
        const hasThemeLight = document.documentElement.classList.contains('theme-light')
        if (hasThemeLight) return "light"
        // Check localStorage
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
            document.documentElement.classList.remove("theme-light")
        } else {
            document.documentElement.classList.add("light")
            document.documentElement.classList.add("theme-light")
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
        const newTheme = theme === "dark" ? "light" : "dark"
        setTheme(newTheme)
        // Also sync with main app's theme system
        if (typeof window !== "undefined") {
            const root = document.documentElement
            if (newTheme === "light") {
                root.classList.add('theme-light')
            } else {
                root.classList.remove('theme-light')
            }
        }
    }, [theme, setTheme])

    // Sync with main app's theme system
    React.useEffect(() => {
        if (typeof window === "undefined") return
        
        // Function to sync theme from main app
        const syncTheme = () => {
            const hasThemeLight = document.documentElement.classList.contains('theme-light')
            const currentTheme = hasThemeLight ? 'light' : 'dark'
            if (currentTheme !== theme) {
                setThemeState(currentTheme)
            }
        }
        
        // Initial sync
        syncTheme()
        
        // Listen for theme changes from main app (Header toggle)
        const observer = new MutationObserver(syncTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })
        
        return () => observer.disconnect()
    }, [theme])

    // Update document when theme changes (for template components that need it)
    React.useEffect(() => {
        applyThemeToDocument(theme)
    }, [theme, applyThemeToDocument])

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
