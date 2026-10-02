import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import UtilityHero from "@/components/UtilityHero";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { TOOLS } from "@/lib/catalog";
import { archiveStats } from "@/lib/insights";
import { publishedPosts } from "@/lib/journal";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Website Design Resources";
const description =
  "Website design resources from the archive: research notes with sample sizes, the 2026 Design Index, free colour tools, curation rules and a full site map.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/resources",
});

const REFERENCE = [
  {
    href: "/research/website-design-index-2026",
    label: "2026 Website Design Index",
    desc: "What the archive measures across every record, and how.",
  },
  {
    href: "/editorial-guidelines",
    label: "Editorial guidelines",
    desc: "What gets into the archive, what stays out, and how corrections work.",
  },
  {
    href: "/manifesto",
    label: "Manifesto",
    desc: "Why the archive records evidence instead of opinions.",
  },
  {
    href: "/about#method",
    label: "Methodology",
    desc: "Capture, extract, classify, review: the four steps behind each record.",
  },
  {
    href: "/site-map",
    label: "Site map",
    desc: "Every page and record in one list.",
  },
  {
    href: "/pricing",
    label: "Figma plugin pricing",
    desc: "Three free uses per plugin, then one payment unlocks the suite.",
  },
];

export default function ResourcesPage() {
  const posts = publishedPosts();
  const archive = archiveStats();

  return (
    <>
      <JsonLd
        data={collectionPageGraph({
          path: "/resources",
          name: title,
          description,
          crumbs: [{ name: "Home", path: "/" }, { name: "Resources" }],
          listName: "Website design resources",
          items: [
            ...posts.map((post) => ({ name: post.h1, url: absUrl(`/blogs/${post.slug}`) })),
            ...REFERENCE.map((r) => ({ name: r.label, url: absUrl(r.href) })),
            ...TOOLS.map((t) => ({ name: t.name, url: absUrl(`/tools/${t.slug}`) })),
          ],
        })}
      />
      <UtilityHero
        eyebrow="Resources"
        title="Resources for studying website design."
        intro={`Everything here is built from the same ${archive.records} website records you can browse in the archive. Research notes state their sample size, the design index explains what is measured, the tools are free, and the curation rules say what gets in and what stays out.`}
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Resources" }]}
      />

      {/* Research */}
      <section className="py-16 sm:py-24">
        <div className="wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">Research notes</p>
              <h2 className="display mt-5 max-w-[18ch] text-[40px] sm:text-[56px]">
                What the archive shows, measured.
              </h2>
            </div>
            <Link href="/blogs" className="btn-ghost self-start sm:self-auto">
              Open the journal
            </Link>
          </div>
          <ul className="mt-12 border-t border-ink">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 60}>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="index-row grid !items-baseline gap-y-2 !py-7 sm:grid-cols-[180px_1fr_auto] sm:gap-x-10"
                >
                  <span className="font-serif text-[44px] leading-none text-ink">{post.keyStat.value}</span>
                  <span>
                    <span className="block text-[19px] font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-[21px]">
                      {post.h1}
                    </span>
                    <span className="mt-1.5 block text-[14.5px] text-muted">{post.keyStat.label}</span>
                  </span>
                  <span className="text-[13px] font-medium text-muted">{post.readingMinutes} min read →</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Tools */}
      <section className="border-t border-line py-16 sm:py-24">
        <div className="wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">Free tools</p>
              <h2 className="display mt-5 text-[40px] sm:text-[56px]">Colour tools</h2>
            </div>
            <Link href="/tools" className="btn-ghost self-start sm:self-auto">
              All tools
            </Link>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-5">
            {TOOLS.map((t, i) => (
              <Reveal as="li" key={t.slug} delay={i * 50}>
                <a href={`/tools/${t.slug}`} className="group block">
                  <span className="shot block aspect-[16/10] transition-colors duration-150 group-hover:border-orange">
                    <Image
                      src={`/tools/previews/${t.slug}.webp`}
                      alt={`${t.name} interface`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover object-top"
                    />
                  </span>
                  <span className="mt-3 block text-[16px] font-semibold text-ink">{t.name}</span>
                  <span className="block text-[14px] text-muted">{t.tagline}</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Reference */}
      <section className="border-t border-line py-16 sm:py-24">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ink">Reference</p>
            <h2 className="display mt-5 text-[40px] sm:text-[56px]">How the archive works</h2>
          </div>
          <ul className="grid border-t border-ink sm:grid-cols-2 sm:gap-x-10 lg:col-span-8">
            {REFERENCE.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="index-row group">
                  <span className="flex-1">
                    <span className="block text-[17px] font-semibold text-ink">{r.label}</span>
                    <span className="mt-1 block text-[14.5px] leading-relaxed text-muted">{r.desc}</span>
                  </span>
                  <span aria-hidden className="text-muted group-hover:text-orange-ink">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ExploreMore except={["/resources"]} />
    </>
  );
}
