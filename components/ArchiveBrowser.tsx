"use client";

import { useMemo, useState } from "react";
import SiteCard from "./SiteCard";
import type { CardSite } from "@/lib/data";

// Real, working search + category filter over the loaded records.
// No fake pagination, no inflated counts — it reports exactly what it shows.
export default function ArchiveBrowser({
  items,
  initialQuery = "",
}: {
  items: CardSite[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [cat, setCat] = useState<string>("all");

  // Categories that actually have loaded records (by real name).
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

  return (
    <section className="py-10 sm:py-14">
      <div className="wrap">
        {/* Sticky search + filters */}
        <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 overflow-hidden rounded-xl border border-ink">
              <span className="grid place-items-center px-4 text-muted">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, category, style, technology…"
                aria-label="Search references"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
                style={{ borderRadius: 0 }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="px-3 text-sm text-muted hover:text-ink"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              <button
                onClick={() => setCat("all")}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${cat === "all" ? "border-ink bg-ink text-white" : "border-line hover:border-line-strong"}`}
              >
                All
              </button>
              {presentCats.map((name) => (
                <button
                  key={name}
                  onClick={() => setCat(name)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${cat === name ? "border-ink bg-ink text-white" : "border-line hover:border-line-strong"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Honest count */}
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
              }}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-orange"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((site, i) => (
              <SiteCard key={site.slug} site={site} index={i} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-lg rounded-xl rounded-xl border border-dashed border-line-strong bg-bone px-8 py-14 text-center">
            <p className="text-lg text-soft">
              No references match{" "}
              {query && <span className="font-semibold text-ink">“{query}”</span>}. Try
              a broader term.
            </p>
          </div>
        )}

        <p className="mt-12 border-t border-line pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          Showing the loaded reference set. The full 5,896-record archive connects to
          the live dataset in production.
        </p>
      </div>
    </section>
  );
}
