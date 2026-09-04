import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { archiveStats } from "@/lib/insights";
import { journalModified, publishedPosts } from "@/lib/journal";
import { blogGraph, pageMeta } from "@/lib/seo";

const title = "Website Design Research Notes";
const description =
  "Original research from the archive: what the stack predicts about design, how big headlines really are, and how many accent colours sites use.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/blogs",
});

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogsPage() {
  const posts = publishedPosts();
  const archive = archiveStats();
  const modified = journalModified();

  return (
    <>
      <JsonLd
        data={blogGraph({
          modified,
          posts: posts.map((post) => ({
            path: `/blogs/${post.slug}`,
            headline: post.h1,
            description: post.description,
            published: post.published,
            modified: post.modified,
          })),
        })}
      />
      <UtilityHero
        eyebrow="Resources"
        title="What the archive shows, measured."
        intro={`Original research drawn from ${archive.records} websites studied in depth. Every figure is computed from the record set and shown with its sample size.`}
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Resources" }]}
      />

      <section className="border-b border-line bg-bone py-10">
        <div className="wrap">
          <div className="max-w-3xl border-l-2 border-orange pl-4">
            <p className="eyebrow text-ink">The short answer</p>
            <p className="mt-2 text-pretty text-[17px] leading-relaxed text-ink/85">
              This journal publishes findings measured directly from the{" "}
              {archive.records} records in the AllWebsites.Design archive, across{" "}
              {archive.categories} industry categories. Each piece states its
              sample size, explains how the number was produced, and links to the
              records behind it. Nothing here is estimated from outside sources.
            </p>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-ink">
              Last updated {formatDay(modified)}
            </span>
            {` · ${posts.length} published ${posts.length === 1 ? "piece" : "pieces"} · Compiled and reviewed by the `}
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
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 90}>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="hover-lift group flex h-full flex-col rounded-xl border border-line bg-paper p-6 hover:border-line-strong hover:shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange">
                      {post.kicker}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {post.readingMinutes} min
                    </span>
                  </div>

                  <h2 className="mt-5 text-[22px] font-bold leading-tight tracking-tight">
                    {post.h1}
                  </h2>

                  <div className="mt-5 rounded-lg bg-orange/[0.07] p-4">
                    <p className="mega text-3xl leading-none text-ink">
                      {post.keyStat.value}
                    </p>
                    <p className="mt-2 text-pretty text-[12.5px] leading-relaxed text-soft">
                      {post.keyStat.label}
                    </p>
                  </div>

                  <p className="mt-5 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
                    {post.description}
                  </p>

                  <span className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">
                    Read the research →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 border-t border-line pt-12 text-center">
            <p className="eyebrow justify-center text-ink">Built on the archive</p>
            <h2 className="mega mt-5 text-3xl sm:text-4xl">
              Every figure traces back to a record.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-soft">
              These findings come from the same {archive.records} studies you can
              browse yourself. Open any record to see the palette, typefaces and
              detected stack the numbers are built from.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/archive" className="btn-primary">
                Explore the archive
              </Link>
              <Link href="/research/website-design-index-2026" className="btn-ghost">
                Read the 2026 Index
              </Link>
              <Link href="/submit" className="btn-ghost">
                Submit a site
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ExploreMore except={["/blogs"]} />
    </>
  );
}
