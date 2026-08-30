import type { Metadata } from "next";
import UtilityHero from "@/components/UtilityHero";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import type { CardSite } from "@/lib/data";
import { CANONICAL, canonicalCards } from "@/lib/canonical";

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

  const items: CardSite[] = canonicalCards();

  return (
    <>
      <UtilityHero
        eyebrow="The Archive"
        title="Search every website."
        intro="The core discovery surface — filter real websites by name, category, style and technology."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Archive" }]}
        meta={`${CANONICAL.length.toLocaleString()} published references`}
      />
      <ArchiveBrowser items={items} initialQuery={q ?? ""} />
    </>
  );
}
