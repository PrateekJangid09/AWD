import type { Metadata } from "next";
import { Suspense } from "react";
import UtilityHero from "@/components/UtilityHero";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import type { CardSite } from "@/lib/data";
import { CANONICAL, canonicalCards, liveCategories } from "@/lib/canonical";
import Link from "next/link";
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
        title="Every website in the archive."
        intro="Search and filter real website design examples by name, industry, style and technology. Each card opens a full record with the live-page screenshot, colour palette, typefaces and the stack we could verify, so you can compare decisions instead of scrolling a mood board."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Archive" }]}
        meta={`${CANONICAL.length.toLocaleString()} published references · filter by industry below`}
      />
      <Suspense fallback={null}>
        <ArchiveBrowser items={items} />
      </Suspense>
      <section className="border-t border-line py-16">
        <div className="wrap grid gap-8 lg:grid-cols-[4fr_8fr]">
          <h2 className="display text-[36px] sm:text-[44px]">Browse by industry</h2>
          <ul className="grid border-t border-ink sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
            {liveCategories()
              .filter((category) => category.count > 0)
              .map((category) => (
                <li key={category.slug}>
                  <Link href={`/c/${category.slug}`} className="index-row !py-3 text-[15px] text-ink">
                    <span className="flex-1">{category.name}</span>
                    <span className="text-[13px] tabular-nums text-muted">{category.count}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
      <ExploreMore except={["/archive"]} />
    </>
  );
}
