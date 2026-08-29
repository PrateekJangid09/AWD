"use client";

import { useMemo, useState } from "react";
import SiteCard from "./SiteCard";
import type { CardSite } from "@/lib/data";

const PAGE_SIZE = 24;

export default function ArchiveBrowser({
  items,
  initialQuery = "",
}: {
  items: CardSite[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [cat, setCat] = useState<string>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const presentCats = useMemo(() => {
    const seen = new Map<string, number>();
    items.forEach((i) => seen.set(i.categoryName, (seen.get(i.categoryName) ?? 0) + 1));
    return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [items]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (cat !== "all" && s.categoryName !== cat) return false;
      if (!q) return true;
      const hay = [s.name, s.domain, s.categoryName, s.style, s.summary]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, cat]);

  const shown = results.slice(0, visible);

  return (
    <section className="py-10 sm:py-14">
      <div className="wrap">
        <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 overflow-hidden rounded-xl border border-ink">
              <span className="grid place-items-center px-4 text-muted">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder="Search name, category, style, technology…"
                aria-label="Search references"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
                style={{ borderRadius: 0 }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setVisible(PAGE_SIZE);
                  }}
                  className="px-3 text-sm text-muted hover:text-ink"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setCat("all");
                  setVisible(PAGE_SIZE);
                }}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${cat === "all" ? "border-ink bg-ink text-white" : "border-line hover:border-line-strong"}`}
              >
                All
              </button>
              {presentCats.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setCat(name);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${cat === name ? "border-ink bg-ink text-white" : "border-line hover:border-line-strong"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-baseline justify-between">
          <p className="text-sm font-semibold tracking-tight">
            {results.length}
            <span className="text-muted">
              {" "}
              {results.length === 1 ? "reference" : "references"}
              {query || cat !== "all" ? " match" : " loaded"}
            </span>
          </p>
          {(query || cat !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setCat("all");
                setVisible(PAGE_SIZE);
              }}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-orange"
            >
              Reset
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((site, i) => (
                <SiteCard key={site.slug} site={site} index={i} />
              ))}
            </div>
            {visible < results.length && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_SIZE)}
                  className="btn-dark"
                >
                  Load more ({results.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto mt-12 max-w-lg rounded-xl border border-dashed border-line-strong bg-bone px-8 py-14 text-center">
            <p className="text-lg text-soft">
              No references match{" "}
              {query && <span className="font-semibold text-ink">“{query}”</span>}. Try
              a broader term.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
