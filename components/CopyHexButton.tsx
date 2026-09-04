"use client";

import { useState } from "react";

export default function CopyHexButton({
  hex,
  role,
}: {
  hex: string;
  role?: string;
}) {
  const value = hex.toUpperCase();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-line bg-bone px-3 py-1.5 font-mono text-[12px] text-ink transition-colors hover:border-line-strong"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          setCopied(false);
        }
      }}
      title={role ? `Copy ${role} ${value}` : `Copy ${value}`}
      aria-label={role ? `Copy ${role} ${value}` : `Copy ${value}`}
    >
      <span
        className="h-3 w-3 rounded-full border border-line"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      {copied ? "Copied" : value}
    </button>
  );
}
