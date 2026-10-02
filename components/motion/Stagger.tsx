"use client";

import * as m from "motion/react-m";
import type { Variants } from "motion/react";

const parent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const child: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.7, 0.2, 1] } },
};

/** Staggers direct <StaggerItem> children once on first paint. */
export function Stagger({
  children,
  className = "",
  inView = false,
}: {
  children: React.ReactNode;
  className?: string;
  inView?: boolean;
}) {
  return (
    <m.div
      data-reveal
      className={className}
      variants={parent}
      initial="hidden"
      {...(inView
        ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -8% 0px" } }
        : { animate: "show" })}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const Comp = m[as];
  return (
    <Comp data-reveal className={className} variants={child}>
      {children}
    </Comp>
  );
}
