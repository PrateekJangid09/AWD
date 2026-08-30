import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { CATEGORIES, STATS } from "@/lib/data";

export const metadata: Metadata = {
  title: "2026 Website Design Index",
  description:
    "A transparent snapshot of 5,896 cleaned and deduplicated website design records across 22 categories.",
};

export default function DesignIndexPage() {
  const max = Math.max(...CATEGORIES.map((c) => c.count));

  return (
    <>
      <PageHero
        eyebrow="RESEARCH"
        title="The 2026 Website Design Index."
        intro="A transparent snapshot of the current 5,896 cleaned and deduplicated website records. Counts describe the AllWebsites.Design catalogue — not the entire web."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "2026 Design Index" }]}
        meta={`${STATS.total.toLocaleString()} records · ${STATS.categories} categories`}
      />

      {/* Distribution — colourful bars */}
      <section className="py-14 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl sm:text-4xl">Category composition</h2>
            <span className="text-[13px] text-muted">Share of archive</span>
          </div>

          <div className="mt-10 space-y-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="group grid grid-cols-[110px_1fr] items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-bone sm:grid-cols-[220px_1fr_130px]"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium tracking-tight">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="hidden h-2.5 overflow-hidden rounded-full bg-paper-dark sm:block">
                  <span
                    className="block h-full rounded-full transition-all duration-500"
                    style={{ width: `${(c.count / max) * 100}%`, backgroundColor: c.accent }}
                  />
                </span>
                <span className="text-right text-[13px] tabular-nums text-muted">
                  {c.count.toLocaleString()} · {c.share}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="border-t border-line bg-bone py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-ink">Methodology</p>
            <h2 className="display mt-3 text-3xl">How the numbers are built.</h2>
            <ul className="mt-6 space-y-3">
              {[
                "Counts exclude hidden, invalid, placeholder and duplicate records.",
                "Categories use reviewed automated classification.",
                "Reviewed corrections override automation.",
                "Numbers describe this catalogue, not the whole web.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-soft">
                  <span className="text-orange">→</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-orange/[0.06] p-6">
            <p className="eyebrow text-ink">A note on accuracy</p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-soft">
              Automated classification should be manually reviewed before being treated
              as factual research. This index is a snapshot of a living archive; figures
              shift as records are added, corrected and re-checked.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
