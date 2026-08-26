import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SiteCard from "@/components/SiteCard";
import Reveal from "@/components/Reveal";
import { SITES, STATS, CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Complete Website Design Archive — 5,896 References",
  description:
    "The complete, crawlable archive of 5,896 cleaned and deduplicated website design references. Search and filter by category, style and technology.",
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  // Sample dataset repeated to represent a dense archive page.
  const grid = [...SITES, ...SITES].slice(0, 12);

  return (
    <>
      <PageHero
        eyebrow="COMPLETE_ARCHIVE"
        title="The complete website design archive."
        intro="5,896 cleaned and deduplicated references. Server-rendered, fully crawlable, 30 records per page across 197 pages."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Archive" }]}
        meta={`${STATS.total.toLocaleString()} references · ${STATS.pages} pages · ${STATS.perPage} per page`}
      />

      {/* Search + filters */}
      <section className="sticky top-16 z-30 border-b border-ink bg-paper/95 py-4 backdrop-blur">
        <div className="wrap flex flex-col gap-3 lg:flex-row lg:items-center">
          <form action="/archive" className="flex flex-1 overflow-hidden border border-line bg-chalk">
            <span className="grid place-items-center border-r border-ink px-4 font-mono">
              ⌕
            </span>
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search references…"
              aria-label="Search references"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-ink/40"
            />
            <button className="btn bg-ink px-5 text-white">Go</button>
          </form>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {["All", ...CATEGORIES.slice(0, 6).map((c) => c.name)].map((f, i) => (
              <button
                key={f}
                className={`shrink-0 border border-ink/15 px-3 py-2 font-mono text-[11px] uppercase tracking-wider ${
                  i === 0 ? "bg-orange text-white" : "bg-chalk hover:bg-paper-dark"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 sm:py-16">
        <div className="wrap">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
              {q ? (
                <>
                  Results for “<span className="text-ink">{q}</span>”
                </>
              ) : (
                <>Showing 1–12 of {STATS.total.toLocaleString()}</>
              )}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
              Page 1 / {STATS.pages}
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grid.map((site, i) => (
              <Reveal key={`${site.slug}-${i}`} delay={(i % 4) * 60}>
                <SiteCard site={site} index={i} />
              </Reveal>
            ))}
          </div>

          <nav
            aria-label="Pagination"
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="btn-ghost pointer-events-none !py-2.5 opacity-40">← Prev</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`grid h-11 w-11 place-items-center border border-line font-mono text-sm shadow-brutal-sm ${
                  n === 1 ? "bg-ink text-paper" : "bg-chalk"
                }`}
              >
                {n}
              </span>
            ))}
            <span className="px-1 font-mono text-ink/40">…</span>
            <span className="grid h-11 w-11 place-items-center border border-line bg-chalk font-mono text-sm shadow-brutal-sm">
              {STATS.pages}
            </span>
            <span className="btn-ghost !py-2.5">Next →</span>
          </nav>
        </div>
      </section>
    </>
  );
}
