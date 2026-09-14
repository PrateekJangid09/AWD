"use client";

import { useState } from "react";

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
      aria-label={`Copy ${value}`}
      className="group inline-flex items-center gap-2 rounded-lg border border-line bg-bone py-1 pl-1 pr-2.5 transition-colors hover:border-line-strong"
    >
      <span className="h-6 w-6 rounded-md border border-line" style={{ backgroundColor: hex }} />
      <span className="font-mono text-[11px] tabular-nums text-ink">
        {copied ? "Copied!" : value}
      </span>
      <span
        className={`text-[11px] transition-opacity ${copied ? "text-orange opacity-100" : "text-muted opacity-0 group-hover:opacity-100"}`}
        aria-hidden
      >
        {copied ? "✓" : "⧉"}
      </span>
    </button>
  );
}
