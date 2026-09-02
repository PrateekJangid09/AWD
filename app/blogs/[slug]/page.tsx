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
            { name: "Resources", path: "/blogs" },
            { name: post.title },
          ],
        })}
      />

      <article>
        <header className="relative overflow-hidden border-b border-line bg-paper">
          <span className="aura" aria-hidden />
          <div className="wrap relative py-10 sm:py-14">
            <Breadcrumb
              items={[
                { href: "/", label: "Home" },
                { href: "/blogs", label: "Resources" },
                { label: post.title },
              ]}
            />

            <p className="eyebrow mt-8 text-orange">{post.kicker}</p>
            <h1 className="mega mt-4 max-w-4xl text-pretty text-4xl leading-[1.05] sm:text-5xl">
              {post.h1}
            </h1>

            {/* Self-contained answer: quotable without the rest of the page. */}
            <div className="mt-7 max-w-3xl border-l-2 border-orange pl-4">
              <p className="eyebrow text-ink">The short answer</p>
              <p className="mt-2 text-pretty text-[17px] leading-relaxed text-ink/85">
                {post.answer}
              </p>
            </div>

            <p className="mt-6 text-[13px] leading-relaxed text-muted">
              <span className="font-medium text-ink">
                Last updated {formatDay(post.modified)}
              </span>
              {" · First published "}
              {formatDay(post.published)}
              {` · ${post.readingMinutes} min read · Compiled and reviewed by the `}
              <Link
                href="/editorial-guidelines"
                className="underline decoration-orange decoration-2 underline-offset-2 hover:text-ink"
              >
                AllWebsites.Design editorial team
              </Link>
              {" · "}
              <Link
                href="/about#method"
                className="underline decoration-line decoration-2 underline-offset-2 hover:text-ink"
              >
                Methodology
              </Link>
            </p>

            {post.status !== "published" && (
              <p className="mt-6 inline-block border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                Draft — not yet indexed
              </p>
            )}
          </div>
        </header>

        <div className="wrap max-w-3xl py-12 sm:py-16">
          <Body />

          <section className="mt-16 border-t border-line pt-12">
            <h2 className="display text-2xl sm:text-3xl">
              Questions people also ask
            </h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {post.faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[16px] font-medium text-ink">
                    {faq.question}
                    <span
                      className="mt-1 shrink-0 text-orange transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-pretty text-[15px] leading-relaxed text-soft">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <p className="eyebrow text-ink">Related questions this raises</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {post.fanout.map((question) => (
                <li
                  key={question}
                  className="rounded-full bg-bone px-3.5 py-1.5 text-[13px] text-soft"
                >
                  {question}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-line bg-bone py-14 sm:py-20">
          <div className="wrap">
            <h2 className="display text-3xl sm:text-4xl">Keep reading</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {more.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blogs/${p.slug}`}
                  className="hover-lift group flex h-full flex-col rounded-xl border border-line bg-paper p-6 hover:border-line-strong hover:shadow-soft"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange">
                    {p.kicker}
                  </span>
                  <h3 className="mt-4 text-xl font-bold leading-tight tracking-tight">
                    {p.h1}
                  </h3>
                  <p className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
                    {p.description}
                  </p>
                  <span className="mt-5 text-[13px] font-medium text-ink">
                    Read the piece →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ExploreMore except={["/blogs"]} />
    </>
  );
}
