"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import type { Tool } from "@/lib/catalog";

/**
 * Workspace-style tool index. Ruled rows on the left; the preview on the
 * right crossfades to whichever row is hovered or focused.
 */
export default function ToolIndex({ tools }: { tools: Tool[] }) {
  const [active, setActive] = useState(tools[0]?.slug);
  const current = tools.find((t) => t.slug === active) ?? tools[0];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[7fr_5fr] lg:items-start">
      <ul className="border-t border-ink">
        {tools.map((t, i) => (
          <li key={t.slug}>
            <a
              href={`/tools/${t.slug}`}
              onMouseEnter={() => setActive(t.slug)}
              onFocus={() => setActive(t.slug)}
              className="index-row group !items-center !py-5 sm:!py-6"
            >
              <span className="hidden w-8 shrink-0 text-[13px] tabular-nums text-muted min-[400px]:inline">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="w-32 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-ink sm:w-48 sm:text-[13px]">
                {t.name}
              </span>
              <span className="flex-1 text-[15px] text-soft sm:text-[16px]">{t.tagline}</span>
              <span
                aria-hidden
                className={`text-[18px] transition-colors ${active === t.slug ? "text-orange-ink" : "text-muted"}`}
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="relative hidden lg:block">
        <div className="shot aspect-[16/10] rotate-[1.2deg]">
          <AnimatePresence initial={false}>
            <m.div
              key={current.slug}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={`/tools/previews/${current.slug}.webp`}
                alt={`${current.name} interface: ${current.tagline}`}
                fill
                sizes="40vw"
                className="object-cover object-top"
              />
            </m.div>
          </AnimatePresence>
        </div>
        <p className="mt-4 text-[14px] text-muted">
          <span className="font-semibold text-ink">{current.name}</span> · {current.tagline}
        </p>
      </div>
    </div>
  );
}
