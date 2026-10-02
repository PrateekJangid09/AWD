"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

export type PageKindGroup = {
  label: string;
  title: string;
  total: number;
  items: { slug: string; name: string; thumb: string }[];
};

export default function PageTypeBrowser({ groups }: { groups: PageKindGroup[] }) {
  const [active, setActive] = useState(groups[0]?.label);
  const group = groups.find((g) => g.label === active) ?? groups[0];
  if (!group) return null;

  return (
    <div>
      <div role="tablist" aria-label="Page type" className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const selected = g.label === group.label;
          return (
            <button
              key={g.label}
              role="tab"
              id={`tab-${g.label}`}
              aria-selected={selected}
              aria-controls="page-type-panel"
              aria-pressed={selected}
              onClick={() => setActive(g.label)}
              className="chip"
            >
              {g.title}
              <span className="text-[12px] tabular-nums text-muted">{g.total}</span>
            </button>
          );
        })}
      </div>

      <div
        id="page-type-panel"
        role="tabpanel"
        aria-labelledby={`tab-${group.label}`}
        className="relative mt-8 min-h-[200px]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.ul
            key={group.label}
            className="grid grid-cols-2 gap-5 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link href={`/archive/${item.slug}`} prefetch={false} className="group block">
                  <span className="shot block aspect-[16/10] transition-colors duration-150 group-hover:border-orange">
                    <Image
                      src={item.thumb}
                      alt={`Screenshot of the ${item.name} ${group.title.toLowerCase().replace(/s$/, "")}`}
                      fill
                      unoptimized
                      loading="lazy"
                      className="object-cover object-top"
                    />
                  </span>
                  <span className="mt-2.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-[15px] font-semibold text-ink">{item.name}</span>
                    <span className="shrink-0 text-[12.5px] text-muted">View page →</span>
                  </span>
                </Link>
              </li>
            ))}
          </m.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
