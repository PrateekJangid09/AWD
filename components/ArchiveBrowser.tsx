"use client";

import { useMemo, useState } from "react";
import SiteCard from "./SiteCard";
import { categoryColor, type CardSite } from "@/lib/catalog";

export default function ArchiveBrowser({
  items,
  initialQuery = "",
}: {
  items: CardSite[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [cat, setCat] = useState<string>("all");

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
      const hay = [s.name, s.domain, s.categoryName, s.style, s.summary].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, cat]);

  return (
    <section className="py-8 sm:py-12">
      <div className="wrap">
        {/* Sticky search + colourful filters */}
        <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-paper px-5 py-1 shadow-soft focus-within:border-line-strong">
              <span className="text-muted">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, category, style, technology…"
                aria-label="Search references"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-muted"
                style={{ borderRadius: 0 }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Clear search">✕</button>
              )}
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
              <button
                onClick={() => setCat("all")}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium transition-all ${cat === "all" ? "border-ink bg-ink text-white" : "border-line text-soft hover:border-line-strong hover:text-ink"}`}
              >
                All
              </button>
              {presentCats.map((name) => {
                const color = categoryColor(name);
                const active = cat === name;
                return (
                  <button
                    key={name}
                    onClick={() => setCat(name)}
                    className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-medium transition-all"
                    style={{
                      borderColor: active ? color : `${color}44`,
                      backgroundColor: active ? color : "transparent",
                      color: active ? "#fff" : color,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? "#fff" : color }} />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mt-8 flex items-baseline justify-between">
          <p className="text-sm font-semibold tracking-tight">
            {results.length}
            <span className="font-normal text-muted">
              {" "}
              {results.length === 1 ? "website" : "websites"}
              {query || cat !== "all" ? " match" : ""}
            </span>
          </p>
          {(query || cat !== "all") && (
            <button
              onClick={() => { setQuery(""); setCat("all"); }}
              className="text-[13px] font-medium text-muted hover:text-orange"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {results.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-line-strong bg-bone px-8 py-14 text-center">
            <p className="text-lg text-soft">
              No websites match{" "}
              {query && <span className="font-semibold text-ink">“{query}”</span>}. Try a broader term.
            </p>
          </div>
        )}

        <p className="mt-14 border-t border-line pt-6 text-center text-[13px] leading-relaxed text-muted">
          {items.length.toLocaleString()} published design studies. The archive grows
          as records are reviewed.
        </p>
      </div>
    </section>
  );
}
