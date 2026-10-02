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
import { ArrowDown, Note } from "@/components/Doodles";
import { categoryInsights, categoryIntro, categoryPatterns } from "@/lib/insights";
import {
  absUrl,
  collectionPageGraph,
  fitDescription,
  pageMeta,
  TITLE_MAX,
} from "@/lib/seo";

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
  const insight = categoryInsights(category);
  const intro = categoryIntro(cat.name, cat.blurb, insight);
  const withCount = `${cat.name} Website Design Inspiration`;
  const bare = `${cat.name} Website Designs`;
  return pageMeta({
    title: withCount.length <= TITLE_MAX ? withCount : bare,
    description: fitDescription(intro, [
      ` ${insight.fonts.length ? `Type includes ${insight.fonts[0]}.` : ""}`,
      " Screenshots and provenance on every record.",
    ]),
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
  const insight = categoryInsights(cat.slug);
  const intro = categoryIntro(cat.name, cat.blurb, insight);
  const patterns = categoryPatterns(cat.name, insight);

  const description = intro;
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
      <section className="border-b border-line">
        <div className="wrap pb-12 pt-8 sm:pb-16">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/c", label: "Categories" },
              { label: cat.name },
            ]}
          />
          <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow anim-up text-ink">
                {cat.count.toLocaleString()} {cat.count === 1 ? "website" : "websites"} · {cat.share} of the archive
              </p>
              <h1
                className="mega anim-up mt-5 max-w-[14ch] text-balance text-[48px] sm:text-[72px] lg:text-[88px]"
                style={{ animationDelay: "60ms" }}
              >
                {cat.name} Website Design Inspiration
              </h1>
              <p
                className="anim-up mt-6 max-w-[64ch] text-pretty text-[17px] leading-[1.55] text-soft"
                style={{ animationDelay: "120ms" }}
              >
                {intro}
              </p>
              {cat.descriptors.length > 0 && (
                <div className="anim-up mt-6 flex flex-wrap gap-2" style={{ animationDelay: "170ms" }}>
                  {cat.descriptors.map((d) => (
                    <span key={d} className="tag">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {records.length > 0 && (
              <div className="relative hidden lg:col-span-4 lg:block">
                <Note className="absolute -top-10 right-6 text-[28px]">{cat.count} sites</Note>
                <ArrowDown className="absolute -top-2 right-24 h-14 w-8 rotate-[18deg] text-ink" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="wrap">
          {records.length > 0 ? (
            <>
              <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
                <h2 className="display text-[32px] sm:text-[40px]">Published references</h2>
                <Link href="/archive" className="link-underline text-[14px] font-semibold text-ink">
                  Search the whole archive →
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {records.map((site, i) => (
                  <Reveal key={site.slug} delay={(i % 4) * 60}>
                    <SiteCard site={site} priority={i < 4} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-xl border-t border-ink pt-8">
              <p className="text-[18px] leading-relaxed text-ink">
                No verified references are published in this category yet. We only show
                records we have reviewed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
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

      {records.length > 0 && (
        <section className="border-t border-line py-14 sm:py-20">
          <div className="wrap grid gap-8 lg:grid-cols-12">
            <h2 className="display text-[36px] sm:text-[44px] lg:col-span-4">Common patterns</h2>
            <div className="lg:col-span-8">
              <p className="max-w-[68ch] text-pretty text-[16.5px] leading-[1.65] text-soft">{patterns}</p>
              <p className="mt-6 max-w-[68ch] border-l-2 border-orange pl-4 text-[14px] leading-relaxed text-muted">
                Categories come from automated classification plus reviewed corrections.
                Labels can be wrong, and the official site is always the authority. Spot
                a mistake?{" "}
                <Link href="/contact" className="link-underline font-semibold text-ink">
                  Report it
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line py-14">
        <div className="wrap">
          <p className="eyebrow text-ink">Other categories</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {related.map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`} className="chip">
                {c.name}
                <span className="text-[12px] tabular-nums text-muted">{c.count}</span>
              </Link>
            ))}
            <Link href="/c" className="chip !border-ink">
              All categories →
            </Link>
          </div>
        </div>
      </section>
      <ExploreMore except={["/c"]} />
    </>
  );
}
