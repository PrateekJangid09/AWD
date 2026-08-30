import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#FF6112",
          500: "#FF6112",
          600: "#E8500A",
          700: "#C23A08",
        },
        // Cool, modern neutral scale
        ink: "#0E0E10",
        soft: "#52525B",
        muted: "#8B8B92",
        paper: "#FFFFFF",
        chalk: "#FFFFFF",
        "paper-dark": "#F1F1F3",
        bone: "#FAFAFA",
        sand: "#F4F4F5",
        "sand-2": "#EDEDF0",
        line: "#ECECEE",
        "line-strong": "#DBDBDF",
      },
      fontFamily: {
        // Modern-minimal: one clean grotesk everywhere.
        mega: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.05), 0 12px 30px -12px rgba(0,0,0,0.12)",
        "soft-lg": "0 2px 6px rgba(0,0,0,0.05), 0 40px 70px -24px rgba(0,0,0,0.18)",
        brutal: "0 1px 3px rgba(0,0,0,0.05), 0 12px 30px -12px rgba(0,0,0,0.12)",
        "brutal-sm": "0 1px 2px rgba(0,0,0,0.05)",
        "brutal-lg": "0 2px 6px rgba(0,0,0,0.05), 0 40px 70px -24px rgba(0,0,0,0.18)",
        "brutal-orange": "0 16px 40px -16px rgba(255,97,18,0.45)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marquee-reverse 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
