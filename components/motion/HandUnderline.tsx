"use client";

import * as m from "motion/react-m";

// Three authored underline strokes. Tapered by drawing two passes with
// different widths; the path is static, only its length animates once.
const PATHS = [
  "M3 9.5C38 4.8 92 3.2 150 5.1c27 .9 47 2.6 64 4.6",
  "M2 7.8C46 10.4 101 4.2 160 4.9c21 .3 38 1.7 55 3.9",
  "M4 10.2c33-5.6 82-7.4 131-6.1 30 .8 55 2.8 78 5.5",
];

export default function HandUnderline({
  children,
  variant = 0,
  delay = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  variant?: 0 | 1 | 2;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="relative z-[1]">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 218 14"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.08em] left-[-4%] h-[0.22em] w-[108%] overflow-visible"
      >
        <m.path
          d={PATHS[variant]}
          fill="none"
          stroke="#FF6112"
          strokeWidth="4.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.32, delay, ease: [0.3, 0.1, 0.3, 1] }}
        />
      </svg>
    </span>
  );
}
