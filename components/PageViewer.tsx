"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ArrowSquareOut } from "@phosphor-icons/react";

export type ViewerPage = {
  label: string;
  src: string;
  width?: number;
  height?: number;
  href?: string;
};

/**
 * Archived page navigation for a record: Homepage, Pricing, About, Careers.
 * Each tab shows the real full-page capture in a scrollable frame.
 */
export default function PageViewer({ name, domain, pages }: { name: string; domain: string; pages: ViewerPage[] }) {
  const [active, setActive] = useState(0);
  const page = pages[active];

  if (!page) {
    return (
      <div className="shot grid aspect-[4/5] place-items-center px-6">
        <p className="text-center text-[14px] text-muted">No screenshot has been captured for this record yet.</p>
      </div>
    );
  }

  return (
    <div>
      {pages.length > 1 && (
        <div role="tablist" aria-label={`${name} archived pages`} className="mb-4 flex flex-wrap gap-2">
          {pages.map((p, i) => (
            <button
              key={p.label}
              role="tab"
              id={`page-tab-${i}`}
              aria-selected={i === active}
              aria-pressed={i === active}
              aria-controls="page-viewer"
              onClick={() => setActive(i)}
              className="chip"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <figure className="overflow-hidden rounded-[4px] border-[1.5px] border-ink bg-surface">
        <figcaption className="flex items-center gap-3 border-b border-ink/80 px-3.5 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full border border-ink/40" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink/40" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink/40" />
          </span>
          <span className="min-w-0 flex-1 truncate text-center text-[12px] font-medium text-muted">
            {domain} · {page.label}
          </span>
          {page.href && (
            <a
              href={page.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-ink hover:text-orange-ink"
            >
              Open <ArrowSquareOut size={13} aria-hidden />
            </a>
          )}
        </figcaption>
        <div
          id="page-viewer"
          role={pages.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={pages.length > 1 ? `page-tab-${active}` : undefined}
          className="relative aspect-[4/5] overflow-y-auto bg-matte"
          tabIndex={0}
          aria-label={`${name} ${page.label} screenshot, scroll to view the full page`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={page.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              {page.width && page.height ? (
                <Image
                  src={page.src}
                  alt={`Screenshot of the ${name} ${page.label.toLowerCase()} page`}
                  width={page.width}
                  height={page.height}
                  unoptimized
                  priority={active === 0}
                  className="block h-auto w-full"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={page.src}
                  alt={`Screenshot of the ${name} ${page.label.toLowerCase()} page`}
                  className="block w-full"
                />
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </figure>
    </div>
  );
}
