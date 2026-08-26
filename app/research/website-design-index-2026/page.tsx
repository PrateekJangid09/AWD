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
        meta={`${STATS.total.toLocaleString()} records · ${STATS.categories} categories · Method ${STATS.method}`}
      />

      {/* Distribution */}
      <section className="py-14 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl sm:text-4xl">Category composition</h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
              Share of archive
            </span>
          </div>

          <div className="mt-10 space-y-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="group grid grid-cols-[1fr] items-center gap-3 border border-ink/15 bg-chalk p-3 transition-colors hover:bg-paper sm:grid-cols-[220px_1fr_120px]"
              >
                <span className="font-mono text-sm font-medium uppercase tracking-wide">
                  {c.name}
                </span>
                <span className="hidden h-6 border border-ink/20 bg-paper sm:block">
                  <span
                    className="block h-full"
                    style={{
                      width: `${(c.count / max) * 100}%`,
                      backgroundColor: c.accent,
                    }}
                  />
                </span>
                <span className="text-right font-mono text-xs text-ink/60">
                  {c.count.toLocaleString()} · {c.share}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="border-t border-ink bg-bone py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">METHODOLOGY</p>
            <h2 className="display mt-3 text-3xl">How the numbers are built.</h2>
            <ul className="mt-6 space-y-3">
              {[
                "Counts exclude hidden, invalid, placeholder and duplicate records.",
                "Categories use governed automated mapping.",
                "Reviewed corrections override automation.",
                "Numbers describe this catalogue, not the whole web.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink/75">
                  <span className="font-mono text-orange">→</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line bg-orange/10 p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-orange">
              DISCLAIMER
            </p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink/75">
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
