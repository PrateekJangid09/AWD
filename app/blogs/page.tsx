import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { ORG_ID, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Resources — Notes on How the Web Is Designed";
const description =
  "Essays and research from the AllWebsites.Design archive — colour, typography, technology and the decisions behind great websites.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/blogs",
  index: false,
});

const POSTS = [
  {
    kicker: "Typography",
    title: "Why portfolios shout and SaaS whispers.",
    excerpt:
      "Display type is a status signal. We looked across the archive at where oversized headlines actually earn their space — and where they just add noise.",
  },
  {
    kicker: "Colour",
    title: "The quiet dominance of near-black and off-white.",
    excerpt:
      "Almost every reference we study leans on a restrained neutral base with one decisive accent. A short study of why the 90/10 rule keeps winning.",
  },
  {
    kicker: "Technology",
    title: "What the framework says about the team.",
    excerpt:
      "Astro, Next, Framer, Webflow — the stack a site ships on quietly predicts how it looks and how fast it feels. Patterns from the detected data.",
  },
];

export default function BlogsPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "Blog",
          path: "/blogs",
          name: "AllWebsites.Design Journal",
          description: "Notes on how the web is designed.",
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Resources" },
          ],
          idSuffix: "blog",
          extra: {
            publisher: { "@id": ORG_ID },
          },
        })}
      />
      <UtilityHero
        eyebrow="Resources"
        title="Notes on how the web is designed."
        intro="Short, opinionated pieces drawn from the archive — colour, typography, technology and the decisions behind websites worth studying."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Resources" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 90}>
                <article className="hover-lift group flex h-full flex-col rounded-xl border border-line bg-paper p-6 hover:border-line-strong hover:shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange">
                      {p.kicker}
                    </span>
                    <span className="border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                      Coming soon
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight">
                    {p.title}
                  </h2>
                  <p className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
                    {p.excerpt}
                  </p>
                  <span className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                    In the works
                  </span>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 border-t border-line pt-12 text-center">
            <p className="eyebrow justify-center text-ink">First pieces landing soon</p>
            <h3 className="mega mt-5 text-3xl sm:text-4xl">
              Want the archive in your inbox?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-soft">
              The journal ships alongside the design index. Until then, explore the
              archive or submit a site worth writing about.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/archive" className="btn-primary">
                Explore the archive
              </Link>
              <Link href="/submit" className="btn-ghost">
                Submit a site
              </Link>
              <Link href="/research/website-design-index-2026" className="btn-ghost">
                Read the 2026 Index
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ExploreMore except={["/blogs"]} />
    </>
  );
}
