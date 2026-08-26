import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CategoryCard from "@/components/CategoryCard";
import Reveal from "@/components/Reveal";
import { CATEGORIES, STATS, TRENDING, getCategory } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Categories — Governed Website Design Collections",
  description:
    "Browse 22 governed collections of website design examples, organized for useful comparison across industry, product type and audience.",
};

export default function CategoriesPage() {
  const trending = TRENDING.map(getCategory).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="LIBRARY_V4.0"
        title="Governed collections, organized for comparison."
        intro="Twenty-two categories. Each one deliberate, maintained and mapped through a governed taxonomy — not a raw tag dump. Pick a lane and study how a whole sector presents itself."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Categories" }]}
        meta={`${STATS.total.toLocaleString()} website examples · ${STATS.categories} categories · ${STATS.library}`}
      />

      {/* Trending */}
      <section className="border-b border-ink bg-bone py-14">
        <div className="wrap">
          <p className="eyebrow">TRENDING_NOW</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {trending.map((c) => (
              <CategoryCard key={c!.slug} category={c!} featured />
            ))}
          </div>
        </div>
      </section>

      {/* All categories */}
      <section className="py-16 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl sm:text-4xl">All 22 categories</h2>
            <Link
              href="/archive"
              className="font-mono text-[11px] uppercase tracking-wider text-ink/60 hover:text-orange"
            >
              Skip to full archive →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 60}>
                <CategoryCard category={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Terminology note */}
      <section className="border-t border-ink bg-ink py-12 text-paper">
        <div className="wrap flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-orange">
            NOTE
          </p>
          <p className="max-w-3xl text-pretty text-paper/70">
            Counts describe <strong className="text-paper">website examples</strong> —
            curated references and inspiration, not downloadable templates. Only the
            dedicated{" "}
            <Link href="/c/template" className="text-orange underline decoration-2 underline-offset-2">
              Template
            </Link>{" "}
            category contains actual design kits and resources.
          </p>
        </div>
      </section>
    </>
  );
}
