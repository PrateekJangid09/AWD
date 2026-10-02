"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { ArrowDownLeft, ArrowLoopRight, Note, Spark } from "../Doodles";

export type CollageShot = { slug: string; name: string; src: string };

// Authored placements. Each piece has its own angle and its own depth, so
// the cluster never repeats one rotation and scroll moves it in layers.
const LAYOUT = [
  { box: "left-[4%] top-[9%] w-[64%] z-[2]", rotate: -2, depth: 18, tape: "-top-3 left-[38%] rotate-[-4deg]" },
  { box: "right-0 top-[3%] w-[44%] z-[3]", rotate: 2.6, depth: 34 },
  { box: "left-0 bottom-[6%] w-[42%] z-[4]", rotate: -3.4, depth: 46, tape: "-top-3 left-[12%] rotate-[5deg]" },
  { box: "right-[3%] bottom-[0%] w-[52%] z-[3]", rotate: 1.2, depth: 26 },
];

function Piece({
  shot,
  index,
  progress,
  still,
}: {
  shot: CollageShot;
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const place = LAYOUT[index];
  const y = useTransform(progress, [0, 1], [0, still ? 0 : -place.depth]);
  return (
    <m.div
      className={`absolute ${place.box}`}
      style={{ y }}
      initial={{ opacity: 0, rotate: place.rotate * 2.2, y: 24 }}
      animate={{ opacity: 1, rotate: place.rotate }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.09, ease: [0.22, 0.7, 0.2, 1] }}
    >
      {place.tape && <span aria-hidden className={`tape ${place.tape}`} />}
      <Link
        href={`/archive/${shot.slug}`}
        prefetch={false}
        className="group block bg-paper-light p-1.5 ring-1 ring-ink/10"
      >
        <span className="shot block aspect-[16/10] transition-colors duration-150 group-hover:border-orange">
          <Image
            src={shot.src}
            alt={`Screenshot of the ${shot.name} homepage`}
            fill
            unoptimized
            priority={index === 0}
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="object-cover object-top"
          />
        </span>
        <span className="sr-only">{shot.name}</span>
      </Link>
    </m.div>
  );
}

export default function HeroCollage({ shots }: { shots: CollageShot[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const still = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  return (
    <div ref={ref} className="relative mx-auto aspect-[1/0.86] w-full max-w-[720px]">
      {shots.slice(0, 4).map((shot, i) => (
        <Piece key={shot.slug} shot={shot} index={i} progress={scrollYProgress} still={still} />
      ))}

      {/* Margin notes: three at most, each pointing at something real. */}
      <m.div
        className="absolute -left-2 top-[-6%] z-[5] hidden items-end gap-1 text-ink lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.3 }}
      >
        <Note className="text-[26px]">real sites, real pages</Note>
        <ArrowDownLeft className="h-10 w-12 translate-y-6 text-ink" />
      </m.div>
      <m.div
        className="absolute -bottom-[9%] right-[8%] z-[5] hidden items-center gap-2 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <ArrowLoopRight className="h-8 w-20 -scale-x-100 text-ink" />
        <Note className="text-[26px]">open any one for palette + type</Note>
      </m.div>
      <m.span
        className="absolute right-[-2%] top-[-5%] z-[5] block h-9 w-9"
        initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.35 }}
      >
        <Spark className="h-full w-full" />
      </m.span>
    </div>
  );
}
