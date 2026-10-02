import type { Config } from "tailwindcss";

// Every neutral is a theme token (see app/globals.css). Light and dark values
// live in CSS, so a class like `bg-paper` or `text-muted` is correct in both
// themes without a `dark:` variant.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#FF6112",
          500: "#FF6112",
          600: "#E8500A",
          // Orange that is safe for small text on the current theme.
          700: token("orange-ink"),
          ink: token("orange-ink"),
        },
        ink: token("ink"),
        soft: token("soft"),
        muted: token("muted"),
        paper: token("bg"),
        chalk: token("surface"),
        surface: token("surface"),
        "paper-dark": token("paper-2"),
        "paper-2": token("paper-2"),
        matte: token("matte"),
        "paper-light": token("paper-light"),
        bone: token("bone"),
        sand: token("bone"),
        "sand-2": token("paper-2"),
        line: token("rule"),
        "line-strong": token("rule-strong"),
        // Fixed light/dark pair for the few surfaces that must not flip,
        // such as text sitting on the orange button.
        "on-accent": "#11100E",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mega: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        hand: ["var(--font-hand)", "cursive"],
      },
      borderRadius: {
        // One practical radius for the product UI.
        lg: "6px",
        xl: "6px",
        "2xl": "6px",
        "3xl": "6px",
      },
      boxShadow: {
        // Depth comes from overlap and paper contrast, never soft shadows.
        soft: "none",
        "soft-lg": "none",
        brutal: "none",
        "brutal-sm": "none",
        "brutal-lg": "none",
        "brutal-orange": "none",
      },
      transitionTimingFunction: {
        paper: "cubic-bezier(0.22, 0.7, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
