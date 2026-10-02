import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import CategoryCard from "@/components/CategoryCard";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import {
  CANONICAL,
  canonicalCardsInCategory,
  liveCategories,
} from "@/lib/canonical";
import { categoryInsights, categoryLine } from "@/lib/insights";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Website Design Examples by Industry";
const description =
  "Browse website design examples by industry: SaaS, portfolio, agency, e-commerce and more. Each category shows how a sector handles colour, type and layout.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/c",
});

function coverFor(slug: string) {
  return canonicalCardsInCategory(slug).find((card) => card.thumb)?.thumb ?? null;
}

export default function CategoriesPage() {
  const categories = liveCategories().filter((category) => category.count > 0);
  const trending = categories.filter((category) => category.slug !== "other").slice(0, 3);

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
        title="Website design by industry."
        intro="Study how different industries approach typography, layout, colour and interaction. Each category collects real websites from the archive with their screenshots, palettes, typefaces and detected technology, so you can see how a whole sector presents itself and where one site breaks from the pattern."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Categories" }]}
        meta={`${CANONICAL.length.toLocaleString()} references · ${categories.length} categories`}
      />

      {/* Trending: three sectors, one real screenshot each */}
      <section className="py-16 sm:py-24">
        <div className="wrap">
          <p className="eyebrow text-ink">The largest categories</p>
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((c, i) => (
              <Reveal key={c!.slug} delay={i * 80}>
                <CategoryCard
                  category={c!}
                  featured
                  thumb={coverFor(c!.slug)}
                  tilt={["rotate-[-1.4deg]", "rotate-[1.1deg]", "rotate-[-0.6deg]"][i]}
                  line={categoryLine(c!.name, categoryInsights(c!.slug))}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Full index */}
      <section className="border-t border-line py-16 sm:py-24">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display text-[40px] sm:text-[52px]">All {categories.length} categories</h2>
            <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-soft">
              Counts describe live websites studied for palette, typography and detected
              technology, recomputed from the archive on every build. They are not
              template or theme files.
            </p>
            <Link href="/archive" className="btn-ghost mt-8">
              Skip to the full archive
            </Link>
          </div>
          <ol className="grid border-t border-ink md:grid-cols-2 md:gap-x-10 lg:col-span-8">
            {categories.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="index-row group !items-start !py-5">
                  <span className="w-8 shrink-0 pt-2 text-[13px] tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-serif text-[28px] leading-tight text-ink">
                      {c.name}
                    </span>
                    <span className="mt-1 block max-w-[60ch] text-[14.5px] leading-relaxed text-muted">
                      {categoryLine(c.name, categoryInsights(c.slug))}
                    </span>
                  </span>
                  <span className="pt-2 text-[14px] tabular-nums text-muted">{c.count}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ExploreMore except={["/c"]} />
    </>
  );
}
