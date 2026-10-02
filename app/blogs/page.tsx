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
        eyebrow="Journal"
        title="What the archive shows, measured."
        intro={`This journal publishes findings measured directly from the ${archive.records} records in the AllWebsites.Design archive, across ${archive.categories} industry categories. Each piece states its sample size, explains how the number was produced, and links to the records behind it. Nothing here is estimated from outside sources.`}
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/resources", label: "Resources" },
          { label: "Journal" },
        ]}
        meta={`Last updated ${formatDay(modified)} · ${posts.length} published ${posts.length === 1 ? "piece" : "pieces"}`}
      />

      <section className="py-16 sm:py-24">
        <div className="wrap">
          <ol className="border-t border-ink">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 70} className="border-b border-line">
                <Link href={`/blogs/${post.slug}`} className="group grid gap-6 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                  <div className="lg:col-span-4">
                    <p className="font-serif text-[80px] leading-[0.85] tracking-[-0.03em] text-ink sm:text-[104px]">
                      {post.keyStat.value}
                    </p>
                    <p className="mt-3 max-w-[30ch] text-[14.5px] leading-snug text-muted">{post.keyStat.label}</p>
                  </div>
                  <div className="lg:col-span-8">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {post.kicker} · {post.readingMinutes} min read
                    </p>
                    <h2 className="display mt-4 text-[34px] underline decoration-transparent decoration-2 underline-offset-[8px] transition-colors group-hover:decoration-orange sm:text-[46px]">
                      {post.h1}
                    </h2>
                    <p className="mt-4 max-w-[62ch] text-pretty text-[16.5px] leading-relaxed text-soft">
                      {post.description}
                    </p>
                    <span className="mt-6 inline-block text-[14px] font-semibold text-ink">Read the research →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ol>

          <div className="mt-16 grid gap-8 lg:grid-cols-12">
            <h2 className="display text-[36px] sm:text-[44px] lg:col-span-5">Every figure traces back to a record.</h2>
            <div className="lg:col-span-7">
              <p className="max-w-[60ch] text-pretty text-[16px] leading-relaxed text-soft">
                These findings come from the same {archive.records} studies you can browse.
                Open any record to see the palette, typefaces and detected stack the numbers
                are built from. Compiled and reviewed by the{" "}
                <Link href="/editorial-guidelines" className="link-underline font-semibold text-ink">
                  AllWebsites.Design editorial team
                </Link>
                .
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/archive" className="btn-primary">
                  Explore the archive
                </Link>
                <Link href="/research/website-design-index-2026" className="btn-ghost">
                  Read the 2026 Index
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ExploreMore except={["/blogs"]} />
    </>
  );
}
