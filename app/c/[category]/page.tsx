import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import SiteCard from "@/components/SiteCard";
import Reveal from "@/components/Reveal";
import { CATEGORIES } from "@/lib/data";
import {
  canonicalCardsInCategory,
  liveCategories,
  resolveCategory,
} from "@/lib/canonical";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { absUrl, collectionPageGraph, fitDescription, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  const slugs = new Set([
    ...CATEGORIES.map((c) => c.slug),
    ...liveCategories().map((c) => c.slug),
  ]);
  return [...slugs].map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = resolveCategory(category);
  if (!cat) return { title: "Category not found" };
  // The count is useful in the title but not worth overrunning it for.
  const withCount = `${cat.name} Website Design Examples (${cat.count})`;
  return pageMeta({
    title: withCount.length <= 50 ? withCount : `${cat.name} Website Design Examples`,
    description: fitDescription(
      `${cat.count} ${cat.name.toLowerCase()} website design examples, each studied with its colour palette, typefaces and detected technology.`,
      [
        ` ${cat.blurb}`,
        " Screenshots and provenance on every record.",
        " Updated as the archive grows.",
      ],
    ),
    path: `/c/${category}`,
    index: cat.count > 0,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = resolveCategory(category);
  if (!cat) notFound();

  const records = canonicalCardsInCategory(cat.slug);

  const description = `${cat.blurb} Study ${cat.name} website design references — palettes, typography, layout and technology.`;
  const related = liveCategories()
    .filter((c) => c.slug !== cat.slug && c.count > 0)
    .slice(0, 12);

  return (
    <>
      <JsonLd
        data={collectionPageGraph({
          path: `/c/${cat.slug}`,
          name: `${cat.name} website designs`,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Categories", path: "/c" },
            { name: cat.name },
          ],
          listName: `${cat.name} sites`,
          items: records.map((site) => ({
            name: site.name,
            url: absUrl(`/archive/${site.slug}`),
          })),
        })}
      />
      {/* Header — colour-forward */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-[80px]"
          style={{ background: cat.accent }}
          aria-hidden
        />
        <div className="wrap relative py-10 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/c", label: "Categories" },
              { label: cat.name },
            ]}
          />
          <span
            className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ backgroundColor: `${cat.accent}18`, color: cat.accent }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.accent }} />
            {cat.count.toLocaleString()} references · {cat.share} of archive
          </span>
          <h1 className="display mt-4 text-4xl sm:text-6xl">{cat.name}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-soft">
            {cat.blurb}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {cat.descriptors.map((d) => (
              <span key={d} className="tag">{d}</span>
            ))}
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
              <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {records.map((site, i) => (
                  <Reveal key={site.slug} delay={(i % 4) * 60}>
                    <SiteCard site={site} />
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

      {/* Related categories — colourful */}
      <section className="bg-ink py-14 text-paper">
        <div className="wrap">
          <p className="eyebrow text-white/90">Explore more</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {related.map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                  {c.name}
                </Link>
              ))}
            <Link
              href="/c"
              className="inline-flex items-center rounded-full bg-orange px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-orange-600"
            >
              All categories →
            </Link>
          </div>
        </div>
      </section>
      <ExploreMore except={["/c"]} />
    </>
  );
}
