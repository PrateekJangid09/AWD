import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import UtilityHero from "@/components/UtilityHero";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import type { CardSite } from "@/lib/data";
import { CANONICAL, canonicalCards, liveCategories } from "@/lib/canonical";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Website Design Examples Archive";
const description =
  "Search every website design example in the archive by name, industry, style or technology. Each reference lists its palette, typefaces and detected stack.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/archive",
});

export default function ArchivePage() {
  const items: CardSite[] = canonicalCards();

  return (
    <>
      <JsonLd
        data={collectionPageGraph({
          path: "/archive",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Archive" },
          ],
          listName: "Published website design records",
          items: items.map((site) => ({
            name: site.name,
            url: absUrl(`/archive/${site.slug}`),
          })),
        })}
      />
      <UtilityHero
        eyebrow="The Archive"
        title="Search every website."
        intro="The core discovery surface. Filter real website design examples by name, category, style and technology."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Archive" }]}
        meta={`${CANONICAL.length.toLocaleString()} published references`}
      />
      <section className="border-b border-line bg-bone py-8">
        <div className="wrap">
          <p className="eyebrow">Browse by industry</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {liveCategories()
              .filter((category) => category.count > 0)
              .map((category) => (
                <Link
                  key={category.slug}
                  href={`/c/${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] text-soft transition-colors hover:border-line-strong hover:text-ink"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: category.accent }}
                  />
                  {category.name}
                  <span className="font-mono text-[11px] text-muted">
                    {category.count}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <Suspense fallback={null}>
        <ArchiveBrowser items={items} />
      </Suspense>
      <ExploreMore except={["/archive"]} />
    </>
  );
}
