import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { CANONICAL, liveCategories } from "@/lib/canonical";
import { ORG_ID, absUrl, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "2026 Website Design Index";
const description =
  "A transparent snapshot of cleaned and deduplicated website design records across the AllWebsites.Design archive.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/research/website-design-index-2026",
  type: "article",
});

export default function DesignIndexPage() {
  const categories = liveCategories().filter((c) => c.count > 0);
  const max = Math.max(1, ...categories.map((c) => c.count));
  const total = CANONICAL.length;

  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "Report",
          path: "/research/website-design-index-2026",
          name: "The 2026 Website Design Index",
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Research" },
          ],
          idSuffix: "report",
          extra: {
            headline: "The 2026 Website Design Index",
            author: { "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
            image: {
              "@type": "ImageObject",
              url: absUrl("/og.jpg"),
              width: 1200,
              height: 630,
            },
          },
        })}
      />
      <PageHero
        eyebrow="RESEARCH"
        title="The 2026 Website Design Index."
        intro={`A transparent snapshot of the current ${total.toLocaleString()} cleaned and deduplicated website records. Counts describe the AllWebsites.Design catalogue — not the entire web.`}
        breadcrumb={[{ href: "/", label: "Home" }, { label: "2026 Design Index" }]}
        meta={`${total.toLocaleString()} records · ${categories.length} categories`}
      />

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
