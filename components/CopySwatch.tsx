"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

export default function CopySwatch({ hex, role }: { hex: string; role?: string }) {
  const [copied, setCopied] = useState(false);
  const value = hex.toUpperCase();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={role ? `Copy ${value} (${role})` : `Copy ${value}`}
      aria-label={`Copy ${value}${role ? `, ${role}` : ""}`}
      className="group flex min-w-0 flex-col text-left"
    >
      <span
        className="block h-14 w-full rounded-[4px] border border-ink/20 transition-colors group-hover:border-orange"
        style={{ backgroundColor: hex }}
      />
      <span className="mt-2 font-mono text-[12px] tabular-nums text-ink">
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={copied ? "c" : "v"}
            className="block"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.12 }}
          >
            {copied ? "Copied" : value}
          </m.span>
        </AnimatePresence>
      </span>
      {role && <span className="text-[11.5px] capitalize text-muted">{role}</span>}
      <span className="sr-only" role="status">
        {copied ? `${value} copied` : ""}
      </span>
    </button>
  );
}
