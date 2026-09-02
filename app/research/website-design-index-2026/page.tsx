import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { CANONICAL, DATASET, liveCategories } from "@/lib/canonical";
import { pageMeta, researchGraph } from "@/lib/seo";

const title = "Website Design Statistics — The 2026 Design Index";
const description =
  "How 304 studied websites break down by industry, with the method behind every count. A transparent, dated snapshot of the AllWebsites.Design research catalogue.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/research/website-design-index-2026",
  type: "article",
});

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function DesignIndexPage() {
  const categories = liveCategories().filter((c) => c.count > 0);
  const max = Math.max(1, ...categories.map((c) => c.count));
  const total = CANONICAL.length;
  const leader = categories[0];

  return (
    <>
      <JsonLd
        data={researchGraph({
          path: "/research/website-design-index-2026",
          headline: "The 2026 Website Design Index",
          description,
          datasetName: DATASET.name,
          datasetDescription: DATASET.description,
          recordCount: total,
          categoryCount: categories.length,
          method: DATASET.method,
          published: DATASET.publishedAt,
          modified: DATASET.updatedAt,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "2026 Design Index" },
          ],
        })}
      />
      <PageHero
        eyebrow="RESEARCH"
        title="The 2026 Website Design Index."
        intro={`A transparent snapshot of the current ${total.toLocaleString()} cleaned and deduplicated website records. Counts describe the AllWebsites.Design catalogue — not the entire web.`}
        breadcrumb={[{ href: "/", label: "Home" }, { label: "2026 Design Index" }]}
        meta={`${total.toLocaleString()} records · ${categories.length} categories`}
      />

      <section className="border-b border-line bg-bone py-10">
        <div className="wrap">
          <div className="max-w-3xl border-l-2 border-orange pl-4">
            <p className="eyebrow text-ink">The short answer</p>
            <p className="mt-2 text-pretty text-[17px] leading-relaxed text-ink/85">
              Across {total.toLocaleString()} websites studied in depth, the archive
              spans {categories.length} populated industry categories
              {leader
                ? `, led by ${leader.name} with ${leader.count.toLocaleString()} records (${Math.round((leader.count / Math.max(total, 1)) * 100)}% of the catalogue)`
                : ""}
              . Every record is classified from the live site and carries its palette,
              typefaces and detected technology.
            </p>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-ink">
              Last updated {formatDay(DATASET.updatedAt)}
            </span>
            {" · First published "}
            {formatDay(DATASET.publishedAt)}
            {" · Method "}
            <span className="font-mono">{DATASET.method}</span>
            {" · Compiled and reviewed by the "}
            <Link
              href="/editorial-guidelines"
              className="underline decoration-orange decoration-2 underline-offset-2 hover:text-ink"
            >
              AllWebsites.Design editorial team
            </Link>
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl sm:text-4xl">Category composition</h2>
            <span className="text-[13px] text-muted">Share of archive</span>
          </div>

          <div className="mt-10 space-y-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="group grid grid-cols-[110px_1fr] items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-bone sm:grid-cols-[220px_1fr_130px]"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium tracking-tight">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="hidden h-2.5 overflow-hidden rounded-full bg-paper-dark sm:block">
                  <span
                    className="block h-full rounded-full transition-all duration-500"
                    style={{ width: `${(c.count / max) * 100}%`, backgroundColor: c.accent }}
                  />
                </span>
                <span className="text-right text-[13px] tabular-nums text-muted">
                  {c.count.toLocaleString()} · {c.share}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-bone py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-ink">Methodology</p>
            <h2 className="display mt-3 text-3xl">How the numbers are built.</h2>
            <ul className="mt-6 space-y-3">
              {[
                "Counts exclude hidden, invalid, placeholder and duplicate records.",
                "Categories use reviewed automated classification.",
                "Reviewed corrections override automation.",
                "Numbers describe this catalogue, not the whole web.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-soft">
                  <span className="text-orange">→</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/archive" className="btn-primary">
                Browse the archive
              </Link>
              <Link href="/c" className="btn-ghost">
                All categories
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-orange/[0.06] p-6">
            <p className="eyebrow text-ink">A note on accuracy</p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-soft">
              Automated classification should be manually reviewed before being treated
              as factual research. This index is a snapshot of a living archive; figures
              shift as records are added, corrected and re-checked.
            </p>
          </div>
        </div>
      </section>
      <ExploreMore except={["/research/website-design-index-2026"]} />
    </>
  );
}
