"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Moon, Sun } from "@phosphor-icons/react";

type Theme = "light" | "dark";
const KEY = "awd-theme";

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-fade");
  root.setAttribute("data-theme", theme);
  window.setTimeout(() => root.classList.remove("theme-fade"), 220);
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(current());
    // Until the reader picks a theme, keep following the OS.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch {}
      if (saved === "light" || saved === "dark") return;
      const next: Theme = media.matches ? "dark" : "light";
      apply(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = current() === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    setTheme(next);
  }

  const label = theme
    ? `Theme: ${theme}. Switch to ${theme === "dark" ? "light" : "dark"} theme`
    : "Switch colour theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-[6px] border border-line text-ink transition-colors hover:border-ink/60 ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={theme ?? "unset"}
          initial={{ opacity: 0, rotate: -40, y: 6 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          exit={{ opacity: 0, rotate: 40, y: -6 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          {theme === "dark" ? <Sun size={19} weight="regular" /> : <Moon size={19} weight="regular" />}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
