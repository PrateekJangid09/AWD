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
        ink: "#141414",
        soft: "#3A3733",
        muted: "#6B6660",
        paper: "#FFFFFF",
        chalk: "#FFFFFF",
        "paper-dark": "#EDEAE1",
        bone: "#FAF9F6",
        sand: "#F4F2EC",
        "sand-2": "#EDEAE1",
        line: "#E7E4DC",
        "line-strong": "#D6D2C7",
      },
      fontFamily: {
        mega: ["var(--font-anton)", "Impact", "sans-serif"],
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,20,20,0.04), 0 12px 32px -12px rgba(20,20,20,0.14)",
        "soft-lg": "0 2px 4px rgba(20,20,20,0.05), 0 30px 60px -24px rgba(20,20,20,0.22)",
        // legacy names remapped to soft so old markup degrades gracefully
        brutal: "0 1px 2px rgba(20,20,20,0.04), 0 12px 32px -12px rgba(20,20,20,0.14)",
        "brutal-sm": "0 1px 2px rgba(20,20,20,0.05)",
        "brutal-lg": "0 2px 4px rgba(20,20,20,0.05), 0 30px 60px -24px rgba(20,20,20,0.22)",
        "brutal-orange": "0 12px 32px -12px rgba(255,90,31,0.4)",
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
