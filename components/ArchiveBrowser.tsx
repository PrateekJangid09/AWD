"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import SiteCard from "./SiteCard";
import type { CardSite } from "@/lib/catalog";

type Sort = "name" | "category";

export default function ArchiveBrowser({ items }: { items: CardSite[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [cat, setCat] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("name");

  const presentCats = useMemo(() => {
    const seen = new Map<string, number>();
    items.forEach((i) => seen.set(i.categoryName, (seen.get(i.categoryName) ?? 0) + 1));
    return [...seen.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const styles = useMemo(
    () => [...new Set(items.map((i) => i.style))].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((s) => {
      if (cat !== "all" && s.categoryName !== cat) return false;
      if (style !== "all" && s.style !== style) return false;
      if (!q) return true;
      const hay = [s.name, s.domain, s.categoryName, s.style, s.summary].join(" ").toLowerCase();
      return hay.includes(q);
    });
    return sort === "category"
      ? [...list].sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name))
      : list;
  }, [items, query, cat, style, sort]);

  const filtered = Boolean(query) || cat !== "all" || style !== "all";
  const key = `${query}|${cat}|${style}|${sort}`;

  function reset() {
    setQuery("");
    setCat("all");
    setStyle("all");
  }

  return (
    <section className="pb-20 pt-8 sm:pb-28">
      <div className="wrap">
        <div className="sticky top-[76px] z-30 -mx-5 border-b border-line bg-paper px-5 py-4 min-[480px]:-mx-6 min-[480px]:px-6 md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-[52px] flex-1 items-center rounded-[6px] border border-ink bg-surface pl-4 transition-colors focus-within:border-orange">
              <MagnifyingGlass size={18} className="shrink-0 text-muted" aria-hidden />
              <label htmlFor="archive-search" className="sr-only">
                Search websites, categories or technologies
              </label>
              <input
                id="archive-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, category, style, technology…"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-ink outline-none placeholder:text-muted"
                style={{ borderRadius: 0, boxShadow: "none" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="mr-1 grid h-11 w-11 place-items-center text-muted hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <label className="sr-only" htmlFor="archive-style">
                Style
              </label>
              <select
                id="archive-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="h-[52px] min-w-0 flex-1 border border-line bg-surface px-3 text-[14px] font-medium text-ink lg:w-48 lg:flex-none"
              >
                <option value="all">All styles</option>
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="archive-sort">
                Sort
              </label>
              <select
                id="archive-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-[52px] min-w-0 flex-1 border border-line bg-surface px-3 text-[14px] font-medium text-ink lg:w-44 lg:flex-none"
              >
                <option value="name">Sort: A–Z</option>
                <option value="category">Sort: Category</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button onClick={() => setCat("all")} aria-pressed={cat === "all"} className="chip">
            All
            <span className="text-[12px] tabular-nums text-muted">{items.length}</span>
          </button>
          {presentCats.map(([name, count]) => (
            <button key={name} onClick={() => setCat(name)} aria-pressed={cat === name} className="chip">
              {name}
              <span className="text-[12px] tabular-nums text-muted">{count}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 flex items-end justify-between gap-4 border-b border-line pb-4">
          <h2 className="display text-[32px] sm:text-[40px]">Published references</h2>
          <p className="text-[14px] text-muted" role="status" aria-live="polite">
            <span className="font-semibold text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "website" : "websites"}
            {filtered ? " match" : ""}
            {filtered && (
              <button onClick={reset} className="link-underline ml-3 font-semibold text-ink">
                Clear filters
              </button>
            )}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            {results.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((site, i) => (
                  <SiteCard key={site.slug} site={site} priority={i < 4} />
                ))}
              </div>
            ) : (
              <div className="mt-14 max-w-xl border-t border-ink pt-8">
                <p className="text-[18px] text-ink">
                  No websites match these filters
                  {query && (
                    <>
                      {" "}for <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                    </>
                  )}
                  .
                </p>
                <p className="mt-2 text-[15px] text-muted">Clear filters or try a broader category.</p>
                <button onClick={reset} className="btn-ghost mt-6">
                  Clear filters
                </button>
              </div>
            )}
          </m.div>
        </AnimatePresence>

        <p className="mt-16 border-t border-line pt-6 text-[14px] text-muted">
          {items.length.toLocaleString()} published design studies. The archive grows as
          records are reviewed.
        </p>
      </div>
    </section>
  );
}
