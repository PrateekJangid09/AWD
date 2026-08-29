import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import SiteCard from "@/components/SiteCard";
import Reveal from "@/components/Reveal";
import { CATEGORIES, getCategory, sitesInCategory } from "@/lib/data";

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
    title: `${cat.name} Website Design — ${cat.count} References`,
    description: `${cat.blurb} Study ${cat.name} website design references — palettes, typography, layout and technology.`,
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

  // Show ONLY records that genuinely belong to this category.
  const records = sitesInCategory(cat.slug);

  return (
    <>
      {/* Header (compact / utility) */}
      <section className="border-b border-line bg-paper">
        <span className="block h-1 w-full" style={{ backgroundColor: cat.accent }} />
        <div className="wrap py-10 sm:py-12">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/c", label: "Categories" },
              { label: cat.name },
            ]}
          />
          <h1 className="display mt-6 text-4xl sm:text-6xl">{cat.name}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-soft">
            {cat.blurb}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
              {cat.count.toLocaleString()} references · {cat.share} of archive
            </span>
            <span className="flex flex-wrap gap-2">
              {cat.descriptors.map((d) => (
                <span key={d} className="tag">
                  {d}
                </span>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* Records */}
      <section className="py-14 sm:py-20">
        <div className="wrap">
          {records.length > 0 ? (
            <>
              <div className="flex items-end justify-between border-b border-line pb-6">
                <p className="text-sm font-semibold tracking-tight">
                  Showing {records.length}
                  <span className="text-muted">
                    {" "}
                    published {records.length === 1 ? "reference" : "references"}
                  </span>
                </p>
                <Link
                  href="/archive"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-orange"
                >
                  Search the archive →
                </Link>
              </div>
              <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {records.map((site, i) => (
                  <Reveal key={site.slug} delay={(i % 3) * 70}>
                    <SiteCard site={site} index={i} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            /* Honest empty state (spec §16) */
            <div className="mx-auto max-w-xl rounded-xl border border-dashed border-line-strong bg-bone px-8 py-16 text-center">
              <p className="eyebrow justify-center text-ink">{cat.name}</p>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-soft">
                No verified references are published in this category yet. We only show
                records we&apos;ve actually reviewed — never filler.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/submit" className="btn-primary">
                  Submit a {cat.name} site
                </Link>
                <Link href="/c" className="btn-ghost">
                  Browse other categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* A note on classification */}
      <section className="border-y border-line bg-bone py-10">
        <div className="wrap max-w-3xl">
          <p className="eyebrow text-ink">A note on classification</p>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-soft">
            Categories are assigned by automated classification and reviewed
            corrections, and curated for design comparison. Automated labels can be
            imperfect — always treat the official site as the authority. Spot something
            wrong?{" "}
            <Link href="/contact" className="underline decoration-orange decoration-2 underline-offset-2">
              Report it
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Related categories */}
      <section className="bg-ink py-12 text-paper">
        <div className="wrap">
          <p className="eyebrow text-white/90">Explore more</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {CATEGORIES.filter((c) => c.slug !== cat.slug)
              .slice(0, 10)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="border border-white/25 px-3 py-1.5 text-[12px] uppercase tracking-wider text-white/70 transition-colors hover:border-orange hover:text-orange"
                >
                  {c.name}
                </Link>
              ))}
            <Link
              href="/c"
              className="border border-orange bg-orange px-3 py-1.5 text-[12px] uppercase tracking-wider text-white"
            >
              All categories →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
