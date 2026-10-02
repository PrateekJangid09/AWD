import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { BODIES } from "@/content/journal";
import { JOURNAL, getPost, publishedPosts } from "@/lib/journal";
import { articleGraph, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return JOURNAL.map((post) => ({ slug: post.slug }));
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return pageMeta({
    title: post.title,
    description: post.description,
    path: `/blogs/${post.slug}`,
    type: "article",
    // A draft is kept out of the index but still passes link value onward.
    index: post.status === "published",
  });
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const Body = BODIES[post.slug];
  if (!Body) notFound();

  const more = publishedPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      <JsonLd
        data={articleGraph({
          path: `/blogs/${post.slug}`,
          headline: post.h1,
          description: post.description,
          published: post.published,
          modified: post.modified,
          about: post.about,
          faqs: post.faqs,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "Journal", path: "/blogs" },
            { name: post.title },
          ],
        })}
      />

      <article>
        <header className="relative border-b border-line">
          <div className="wrap pb-14 pt-8 sm:pb-20">
            <Breadcrumb
              items={[
                { href: "/", label: "Home" },
                { href: "/resources", label: "Resources" },
                { href: "/blogs", label: "Journal" },
                { label: post.title },
              ]}
            />
            <div className="mx-auto mt-12 max-w-[920px] sm:mt-16">
              <p className="eyebrow anim-up text-ink">{post.kicker}</p>
              <h1
                className="mega anim-up mt-6 text-balance text-[46px] sm:text-[72px] lg:text-[84px]"
                style={{ animationDelay: "60ms" }}
              >
                {post.h1}
              </h1>

              {/* Self-contained answer: quotable without the rest of the page. */}
              <p
                className="anim-up mt-8 max-w-[64ch] text-pretty text-[19px] leading-[1.55] text-ink sm:text-[21px]"
                style={{ animationDelay: "120ms" }}
              >
                {post.answer}
              </p>

              <p className="anim-up mt-8 text-[14px] leading-relaxed text-muted" style={{ animationDelay: "160ms" }}>
                <span className="font-medium text-ink">Last updated {formatDay(post.modified)}</span>
                {" · First published "}
                {formatDay(post.published)}
                {` · ${post.readingMinutes} min read · Compiled and reviewed by the `}
                <Link href="/editorial-guidelines" className="link-underline text-ink">
                  AllWebsites.Design editorial team
                </Link>
                {" · "}
                <Link href="/about#method" className="link-underline text-ink">
                  Methodology
                </Link>
              </p>

              {post.status !== "published" && (
                <p className="mt-6 inline-block rounded-[6px] border border-line px-3 py-1.5 text-[13px] text-muted">
                  Draft, not yet indexed
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Long reading text sits on solid paper: no waves or texture behind it. */}
        <div className="bg-paper py-14 sm:py-20">
          <div className="wrap">
            <div className="mx-auto max-w-[720px]">
              <Body />

              <section className="mt-20 border-t border-ink pt-10">
                <h2 className="display text-[34px] sm:text-[42px]">Questions people also ask</h2>
                <div className="mt-8 border-t border-line">
                  {post.faqs.map((faq) => (
                    <details key={faq.question} className="group border-b border-line py-5">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-semibold text-ink">
                        {faq.question}
                        <span
                          className="mt-0.5 shrink-0 text-[20px] leading-none text-orange-ink transition-transform duration-200 group-open:rotate-45"
                          aria-hidden
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-pretty text-[16px] leading-relaxed text-soft">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="mt-14">
                <p className="eyebrow text-ink">Related questions this raises</p>
                <ul className="mt-5 space-y-2">
                  {post.fanout.map((question) => (
                    <li key={question} className="border-l-2 border-line pl-4 text-[15.5px] text-soft">
                      {question}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-line py-16 sm:py-24">
          <div className="wrap">
            <h2 className="display text-[40px] sm:text-[52px]">Keep reading</h2>
            <ul className="mt-10 border-t border-ink">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blogs/${p.slug}`}
                    className="index-row grid !items-baseline gap-y-2 !py-7 sm:grid-cols-[180px_1fr_auto] sm:gap-x-10"
                  >
                    <span className="font-serif text-[44px] leading-none text-ink">{p.keyStat.value}</span>
                    <span>
                      <span className="block text-[20px] font-semibold leading-snug text-ink">{p.h1}</span>
                      <span className="mt-1.5 block text-[14.5px] text-muted">{p.description}</span>
                    </span>
                    <span className="text-[13px] font-medium text-muted">{p.readingMinutes} min read →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ExploreMore except={["/blogs"]} />
    </>
  );
}
