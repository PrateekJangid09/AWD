"use client";

import { useEffect, useRef } from "react";
import { useScroll, useSpring, useVelocity } from "motion/react";

/**
 * Background wave field: thin ink lines drifting slowly behind the page, with
 * one orange line. Scrolling adds a little energy to the swell, which settles
 * back on a spring.
 *
 * Kept cheap on purpose: one canvas, a handful of polylines, capped frame
 * rate, paused while the tab is hidden. Reduced-motion readers get one still
 * frame.
 */

type Line = {
  base: number; // vertical position, 0..1 of viewport height
  amp: number; // px
  len: number; // wavelength, fraction of width
  speed: number;
  phase: number;
  accent?: boolean;
  weight: number;
};

const LINES: Line[] = [
  { base: 0.14, amp: 16, len: 1.15, speed: 0.11, phase: 0.2, weight: 1 },
  { base: 0.24, amp: 22, len: 0.95, speed: 0.08, phase: 1.4, weight: 1 },
  { base: 0.33, amp: 18, len: 1.3, speed: 0.13, phase: 2.1, weight: 1 },
  { base: 0.41, amp: 26, len: 1.05, speed: 0.09, phase: 0.9, weight: 1 },
  { base: 0.5, amp: 20, len: 0.85, speed: 0.12, phase: 3.0, weight: 1 },
  { base: 0.6, amp: 28, len: 1.2, speed: 0.07, phase: 1.1, weight: 1 },
  { base: 0.7, amp: 18, len: 1.0, speed: 0.1, phase: 2.6, weight: 1 },
  { base: 0.8, amp: 24, len: 1.4, speed: 0.08, phase: 0.5, weight: 1 },
  { base: 0.9, amp: 16, len: 0.9, speed: 0.11, phase: 1.9, accent: true, weight: 1.3 },
];

const FRAME_MS = 1000 / 40;

function readColours() {
  const css = getComputedStyle(document.documentElement);
  return {
    ink: css.getPropertyValue("--wave-ink").trim() || "17 16 14",
    alpha: parseFloat(css.getPropertyValue("--wave-alpha")) || 0.07,
    accentAlpha: parseFloat(css.getPropertyValue("--wave-accent-alpha")) || 0.4,
  };
}

export default function WaveField() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  // Scroll energy, smoothed so the swell eases in and settles out.
  const energy = useSpring(0, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    return velocity.on("change", (v) => {
      energy.set(Math.min(1, Math.abs(v) / 2400));
    });
  }, [velocity, energy]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let colours = readColours();
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let t = Math.random() * 40;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const narrow = width < 640;
      const lines = narrow ? LINES.filter((_, i) => i % 2 === 0 || LINES[i].accent) : LINES;
      const boost = 1 + energy.get() * 1.6;
      const drift = scrollY.get() * 0.04;
      const step = narrow ? 10 : 8;

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      lines.forEach((line, i) => {
        const k = (Math.PI * 2) / (width * line.len);
        const y0 = line.base * height;
        const a = line.amp * (narrow ? 0.7 : 1) * boost;
        const s = t * line.speed;

        ctx!.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const y =
            y0 +
            a * Math.sin(k * x + s * 6 + line.phase + drift * 0.02 * (i + 1)) +
            a * 0.38 * Math.sin(k * 2.6 * x - s * 4.2 + line.phase * 1.7);
          if (x === -step) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        if (line.accent) {
          ctx!.strokeStyle = `rgba(255, 97, 18, ${colours.accentAlpha})`;
        } else {
          ctx!.strokeStyle = `rgb(${colours.ink} / ${colours.alpha})`;
        }
        ctx!.lineWidth = line.weight;
        ctx!.stroke();
      });
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      t += dt;
      draw();
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduce.matches || document.hidden) {
        draw();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    resize();
    start();

    const onResize = () => {
      resize();
      draw();
    };
    const onVisibility = () => start();
    const observer = new MutationObserver(() => {
      colours = readColours();
      draw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", start);
    };
  }, [energy, scrollY]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen"
    />
  );
}
