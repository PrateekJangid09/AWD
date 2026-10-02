"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";

// One place to load Motion's features and honour the reader's
// reduced-motion setting for every animation on the site.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: [0.22, 0.7, 0.2, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
