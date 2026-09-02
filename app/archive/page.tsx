import type { Metadata } from "next";
import UtilityHero from "@/components/UtilityHero";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import type { CardSite } from "@/lib/data";
import { CANONICAL, canonicalCards } from "@/lib/canonical";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Website Design Inspiration — Searchable Archive";
const description =
  "Search every website design example in the archive by name, industry, style or technology. Each reference lists its palette, typefaces and detected stack.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/archive",
});

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

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
        intro="The core discovery surface — filter real websites by name, category, style and technology."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Archive" }]}
        meta={`${CANONICAL.length.toLocaleString()} published references`}
      />
      <ArchiveBrowser items={items} initialQuery={q ?? ""} />
      <ExploreMore except={["/archive"]} />
    </>
  );
}
