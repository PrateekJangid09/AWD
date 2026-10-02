"use client";

import * as m from "motion/react-m";

/**
 * Fades a block in the first time it enters the viewport. Short and once:
 * 10px of travel, about half a second. With reduced motion only the fade
 * remains, and a <noscript> rule in the layout keeps it visible without JS.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  y = 10,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
  y?: number;
}) {
  const Comp = m[as];
  return (
    <Comp
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.52, delay: delay / 1000, ease: [0.22, 0.7, 0.2, 1] }}
    >
      {children}
    </Comp>
  );
}
