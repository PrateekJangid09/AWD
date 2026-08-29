import type { Metadata } from "next";
import UtilityHero from "@/components/UtilityHero";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import { STATS } from "@/lib/data";
import { allArchiveCards } from "@/lib/archive";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Archive — Every Website, Searchable",
  description:
    "Search and filter the AllWebsites.Design archive by name, category, style and technology. The core discovery surface.",
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const items = await allArchiveCards();

  return (
    <>
      <UtilityHero
        eyebrow="The Archive"
        title="Search every website."
        intro="The core discovery surface — filter real websites by name, category, style and technology."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Archive" }]}
        meta={`${STATS.total.toLocaleString()} references in the catalogue · ${STATS.categories} categories`}
      />
      <ArchiveBrowser items={items} initialQuery={q ?? ""} />
    </>
  );
}
