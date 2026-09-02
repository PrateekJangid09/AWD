import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import CategoryCard from "@/components/CategoryCard";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { TRENDING } from "@/lib/data";
import { CANONICAL, liveCategories, resolveCategory } from "@/lib/canonical";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Website Design Examples by Industry";
const description =
  "Browse website design examples by industry — SaaS, portfolio, agency, e-commerce and more. Each category shows how a sector handles colour, type and layout.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/c",
});

export default function CategoriesPage() {
  const categories = liveCategories().filter((category) => category.count > 0);
  const trending = TRENDING.map(resolveCategory).filter((category) => category && category.count > 0);

  return (
    <>
      <JsonLd
        data={collectionPageGraph({
          path: "/c",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Categories" },
          ],
          listName: "Website design categories",
          items: categories.map((category) => ({
            name: category.name,
            url: absUrl(`/c/${category.slug}`),
          })),
        })}
      />
      <UtilityHero
        eyebrow="Categories"
        title="Explore by category."
        intro="Study how different industries approach typography, layout, colour and interaction. Pick a lane and see how a whole sector presents itself."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Categories" }]}
        meta={`${CANONICAL.length.toLocaleString()} references · ${categories.length} categories`}
      />

      {/* Trending */}
      <section className="border-b border-ink bg-bone py-14">
        <div className="wrap">
          <p className="eyebrow">Trending</p>
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
            <h2 className="display text-3xl sm:text-4xl">All {categories.length} categories</h2>
            <Link
              href="/archive"
              className="font-mono text-[11px] uppercase tracking-wider text-ink/60 hover:text-orange"
            >
              Skip to full archive →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
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
          <p className="eyebrow text-white/90">On the counts</p>
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
      <ExploreMore except={["/c"]} />
    </>
  );
}
