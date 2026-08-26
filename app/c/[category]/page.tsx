import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import SiteCard from "@/components/SiteCard";
import Reveal from "@/components/Reveal";
import {
  CATEGORIES,
  SITES,
  STATS,
  getCategory,
  sitesInCategory,
} from "@/lib/data";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name} Website Design Inspiration: ${cat.count} Examples`,
    description: `${cat.blurb} Study ${cat.count} curated ${cat.name} website design references — palettes, typography, layout and technology.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  // Feature this category's records first, then fill the grid from the archive.
  const inCat = sitesInCategory(cat.slug);
  const grid = [...inCat, ...SITES.filter((s) => s.category !== cat.slug)].slice(0, 6);
  const totalPages = Math.max(1, Math.ceil(cat.count / STATS.perPage));

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-ink bg-paper">
        <div className="absolute inset-0 grid-bg opacity-70" aria-hidden />
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: cat.accent }}
        />
        <div className="wrap relative py-12 sm:py-16">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/c", label: "Categories" },
              { label: cat.name },
            ]}
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="tag bg-chalk">{cat.share} of archive</span>
            <span className="tag bg-chalk">{cat.count.toLocaleString()} examples</span>
            <span className="tag bg-chalk">{totalPages} pages</span>
          </div>
          <h1 className="mega mt-5 max-w-4xl text-balance text-5xl sm:text-7xl">
            {cat.name} Design
            <br />
            Inspiration:{" "}
            <span className="text-orange">{cat.count} Examples</span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-soft">
            {cat.blurb}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {cat.descriptors.map((d) => (
              <span key={d} className="tag bg-paper">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About this collection */}
      <section className="border-b border-ink bg-bone py-10">
        <div className="wrap grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">ABOUT_THIS_COLLECTION</p>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-ink/75">
              The {cat.name} collection gathers references where{" "}
              {cat.descriptors.map((d) => d.toLowerCase()).join(", ")} patterns
              dominate. Use it to compare how teams in this space handle hierarchy,
              calls to action, colour and typographic tone — then move any reference
              straight into your workflow.
            </p>
          </div>
          <div className="border border-line bg-orange/10 p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-orange">
              EDITORIAL_CAVEAT
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">
              Records are classified with governed automated mapping and reviewed
              corrections. Categories are curated for design comparison — always treat
              the official site as the authority for current facts.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-14 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <h2 className="display text-2xl sm:text-3xl">
              Page 1{" "}
              <span className="text-ink/40">/ {totalPages}</span>
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
              {STATS.perPage} per page · server-rendered
            </span>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((site, i) => (
              <Reveal key={site.slug} delay={(i % 3) * 70}>
                <SiteCard site={site} index={i} />
              </Reveal>
            ))}
          </div>

          {/* Pagination */}
          <nav
            aria-label="Pagination"
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="btn-ghost pointer-events-none !py-2.5 opacity-40">
              ← Prev
            </span>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <span
                key={i}
                className={`grid h-11 w-11 place-items-center border border-line font-mono text-sm shadow-brutal-sm ${
                  i === 0 ? "bg-ink text-paper" : "bg-chalk"
                }`}
              >
                {i + 1}
              </span>
            ))}
            {totalPages > 5 && (
              <>
                <span className="px-1 font-mono text-ink/40">…</span>
                <span className="grid h-11 w-11 place-items-center border border-line bg-chalk font-mono text-sm shadow-brutal-sm">
                  {totalPages}
                </span>
              </>
            )}
            <span className="btn-ghost !py-2.5">Next →</span>
          </nav>
        </div>
      </section>

      {/* Cross-links */}
      <section className="border-t border-ink bg-ink py-12 text-paper">
        <div className="wrap">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-orange">
            EXPLORE_MORE
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {CATEGORIES.filter((c) => c.slug !== cat.slug)
              .slice(0, 10)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="border border-paper/25 px-3 py-1.5 font-mono text-[12px] uppercase tracking-wider text-paper/70 transition-colors hover:border-orange hover:text-orange"
                >
                  {c.name}
                </Link>
              ))}
            <Link
              href="/c"
              className="border border-orange bg-orange px-3 py-1.5 font-mono text-[12px] uppercase tracking-wider text-white"
            >
              All categories →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
