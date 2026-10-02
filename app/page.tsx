import type { Metadata } from "next";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import SiteCard from "@/components/SiteCard";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import HandUnderline from "@/components/motion/HandUnderline";
import HeroCollage, { type CollageShot } from "@/components/home/HeroCollage";
import ToolIndex from "@/components/home/ToolIndex";
import PageTypeBrowser, { type PageKindGroup } from "@/components/home/PageTypeBrowser";
import { ArrowDown, Note } from "@/components/Doodles";
import { TOOLS, type CardSite } from "@/lib/catalog";
import {
  CANONICAL,
  DATASET,
  canonicalCards,
  getCanonical,
  liveCategories,
  recordsWithPage,
  thumbnailPath,
} from "@/lib/canonical";
import { publishedPosts } from "@/lib/journal";
import { absUrl, DEFAULT_DESCRIPTION, DEFAULT_TITLE, homePageGraph, pageMeta } from "@/lib/seo";

const { alternates: _homeAlternates, openGraph: homeOg, ...homeMeta } = pageMeta({
  title: "Website Design Examples & Inspiration",
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  ...homeMeta,
  title: { absolute: DEFAULT_TITLE },
  // Next.js drops the root trailing slash from metadata URLs. The served
  // homepage is `/`, so canonical and og:url are emitted as raw tags below.
  openGraph: homeOg ? { ...homeOg, url: undefined } : undefined,
};

// Curator picks. Records are looked up live; a slug that leaves the archive
// simply drops out instead of rendering a stale card.
const HERO_PICKS = ["copilot-money", "sebastiancamargo", "breeder", "houseofhoney"];
const FEATURED_PICKS = [
  "cursor",
  "harrymoses",
  "midday",
  "basement",
  "merge-berlin",
  "killianherzer",
  "supabase",
  "glaze",
];
const PAGE_PICKS = ["linear", "supabase", "cursor", "notion", "midday", "paddle", "neon", "liveblocks", "basement", "oxide-computer"];

const PAGE_KINDS: { label: string; title: string }[] = [
  { label: "Pricing", title: "Pricing pages" },
  { label: "About", title: "About pages" },
  { label: "Jobs/Careers", title: "Careers pages" },
  { label: "Contact", title: "Contact pages" },
];

function formatMonth(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function Home() {
  const all = canonicalCards();
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const categories = liveCategories().filter((c) => c.count > 0);
  const posts = publishedPosts();

  const collage: CollageShot[] = HERO_PICKS.flatMap((slug) => {
    const rec = getCanonical(slug);
    const src = rec ? thumbnailPath(rec) : null;
    return rec && src ? [{ slug, name: rec.identity.name, src }] : [];
  });

  const featured: CardSite[] = [
    ...FEATURED_PICKS.flatMap((slug) => (bySlug.has(slug) ? [bySlug.get(slug)!] : [])),
    ...all,
  ]
    .filter((c, i, arr) => c.thumb && arr.findIndex((x) => x.slug === c.slug) === i)
    .slice(0, 8);

  const pageGroups: PageKindGroup[] = PAGE_KINDS.map(({ label, title }) => {
    const rows = recordsWithPage(label);
    const ordered = [
      ...PAGE_PICKS.flatMap((slug) => rows.filter((r) => r.site.identity.slug === slug)),
      ...rows,
    ].filter((r, i, arr) => arr.indexOf(r) === i);
    return {
      label,
      title,
      total: rows.length,
      items: ordered.slice(0, 4).map((r) => ({
        slug: r.site.identity.slug,
        name: r.site.identity.name,
        thumb: r.thumb,
      })),
    };
  }).filter((g) => g.items.length > 0);

  const chips = categories.filter((c) => c.slug !== "other").slice(0, 6);
  const pageTotal = new Set(
    PAGE_KINDS.flatMap(({ label }) => recordsWithPage(label).map((r) => r.site.identity.slug)),
  ).size;

  return (
    <>
      <link rel="canonical" href={absUrl("/")} />
      <meta property="og:url" content={absUrl("/")} />
      <JsonLd
        data={homePageGraph({
          recordCount: all.length,
          categoryCount: categories.length,
          updated: DATASET.updatedAt,
        })}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="wrap grid grid-cols-1 items-center gap-14 pb-16 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-20">
          <div className="min-w-0 lg:col-span-6 xl:col-span-6">
            <p className="eyebrow anim-up text-ink">A curated gallery of real websites</p>

            <h1
              className="mega anim-up mt-6 max-w-[13ch] text-[42px] min-[380px]:text-[50px] sm:text-[76px] lg:text-[84px] xl:text-[100px]"
              style={{ animationDelay: "60ms" }}
            >
              Discover the best{" "}
              <HandUnderline delay={0.55}>website</HandUnderline> designs on the internet.
            </h1>

            <p
              className="anim-up mt-7 max-w-[56ch] text-pretty text-[17px] leading-[1.55] text-soft sm:text-[19px]"
              style={{ animationDelay: "120ms" }}
            >
              A curated archive of {all.length.toLocaleString()} real websites across SaaS,
              portfolios, agencies, e-commerce and more. Each record shows the live page, its
              colour palette, typefaces and detected technology, and five free colour tools
              help you put what you find to work.
            </p>

            <form
              action="/archive"
              role="search"
              className="anim-up mt-9 flex h-[60px] w-full max-w-[660px] items-center rounded-[6px] border border-ink bg-surface pl-4 transition-colors focus-within:border-orange sm:h-[64px]"
              style={{ animationDelay: "180ms" }}
            >
              <label htmlFor="hero-search" className="sr-only">
                Search websites, categories or technologies
              </label>
              <MagnifyingGlass size={20} className="shrink-0 text-muted" aria-hidden />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Search sites, categories or tech…"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-ink outline-none placeholder:text-muted"
                style={{ borderRadius: 0, boxShadow: "none" }}
              />
              <button
                type="submit"
                className="btn-primary m-1.5 h-[calc(100%-12px)] shrink-0 !min-h-0 !px-5 sm:!px-6"
              >
                Search
              </button>
            </form>

            <div className="anim-up mt-5 flex flex-wrap gap-2" style={{ animationDelay: "230ms" }}>
              {chips.map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`} className="chip">
                  {c.name}
                </Link>
              ))}
            </div>

            <dl
              className="anim-up mt-10 grid max-w-[620px] grid-cols-2 gap-y-6 sm:grid-cols-3 sm:divide-x sm:divide-line"
              style={{ animationDelay: "280ms" }}
            >
              {[
                [all.length.toLocaleString(), "Websites studied"],
                [String(categories.length), "Categories"],
                [formatMonth(DATASET.updatedAt), "Archive updated"],
              ].map(([value, label], i) => (
                <div key={label} className={i === 0 ? "pr-6" : "sm:px-6"}>
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {label}
                  </dt>
                  <dd className="mt-1.5 font-serif text-[34px] leading-none text-ink sm:text-[40px]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 lg:col-span-6 lg:pl-6">
            <HeroCollage shots={collage} />
          </div>
        </div>
      </section>

      {/* ── From the archive ── */}
      <section className="py-20 sm:py-28 lg:py-36">
        <div className="wrap">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative">
              <p className="eyebrow text-ink">From the archive</p>
              <h2 className="display mt-5 max-w-[16ch] text-[42px] sm:text-[60px] lg:text-[68px]">
                Websites worth studying this month.
              </h2>
              <div className="absolute -right-40 bottom-0 hidden items-end gap-1 xl:flex">
                <Note>curator picks</Note>
                <ArrowDown className="h-12 w-7 text-ink" />
              </div>
            </div>
            <Link href="/archive" className="btn-ghost self-start sm:self-auto">
              Browse all {all.length.toLocaleString()}
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {featured.map((site, i) => (
              <Reveal key={site.slug} delay={(i % 4) * 70}>
                <SiteCard site={site} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by industry: a typographic index ── */}
      <section className="border-y border-line bg-bone/70 py-20 sm:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-ink">Browse by industry</p>
            <h2 className="display mt-5 text-[42px] sm:text-[56px]">Pick a sector, compare its choices.</h2>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-soft">
              Every category is counted from the live record set, so the numbers move as
              the archive grows.
            </p>
            <Link href="/c" className="btn-ghost mt-8">
              All {categories.length} categories
            </Link>
          </Reveal>
          <ol className="grid border-t border-ink sm:grid-cols-2 sm:gap-x-10 lg:col-span-8">
            {categories.filter((c) => c.slug !== "other").slice(0, 14).map((c, i) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="index-row group !py-4">
                  <span className="w-7 shrink-0 text-[13px] tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-serif text-[26px] leading-tight text-ink sm:text-[28px]">
                    {c.name}
                  </span>
                  <span className="text-[14px] tabular-nums text-muted">{c.count}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Browse by page ── */}
      {pageGroups.length > 0 && (
        <section className="py-20 sm:py-28 lg:py-36">
          <div className="wrap">
            <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-ink">Browse by page</p>
                <h2 className="display mt-5 text-[42px] sm:text-[60px] lg:text-[68px]">
                  Don&apos;t just study the homepage.
                </h2>
              </div>
              <p className="max-w-[48ch] text-[16px] leading-relaxed text-soft lg:col-span-5">
                {pageTotal} records also carry captures of their pricing, about, careers or
                contact pages, so you can see how a site carries its design past the first
                screen.
              </p>
            </Reveal>
            <Reveal className="mt-10">
              <PageTypeBrowser groups={pageGroups} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Tools ── */}
      <section className="border-t border-line py-20 sm:py-28 lg:py-36">
        <div className="wrap">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-ink">Tools for what you find</p>
              <h2 className="display mt-5 text-[42px] sm:text-[60px] lg:text-[68px]">
                Take a palette from study to build.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="max-w-[48ch] text-[16px] leading-relaxed text-soft">
                Five browser tools, free and without signup. The same engines ship as Figma
                plugins: three free uses each, then $3/month or $30/year for the suite.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/tools" className="btn-dark">
                  All tools
                </Link>
                <Link href="/pricing" className="btn-ghost">
                  Plugin pricing
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <ToolIndex tools={TOOLS} />
          </Reveal>
        </div>
      </section>

      {/* ── Research ── */}
      {posts.length > 0 && (
        <section className="border-t border-line py-20 sm:py-28">
          <div className="wrap">
            <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-ink">Research</p>
                <h2 className="display mt-5 max-w-[18ch] text-[42px] sm:text-[56px]">
                  What the archive shows, measured.
                </h2>
              </div>
              <Link href="/resources" className="btn-ghost self-start sm:self-auto">
                All resources
              </Link>
            </Reveal>
            <ul className="mt-12 border-t border-ink">
              {posts.map((post, i) => (
                <Reveal as="li" key={post.slug} delay={i * 60}>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="index-row group grid !items-baseline gap-y-2 !py-7 sm:grid-cols-[180px_1fr_auto] sm:gap-x-10"
                  >
                    <span className="font-serif text-[44px] leading-none text-ink">
                      {post.keyStat.value}
                    </span>
                    <span>
                      <span className="block text-[19px] font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-[21px]">
                        {post.h1}
                      </span>
                      <span className="mt-1.5 block text-[14.5px] text-muted">{post.keyStat.label}</span>
                    </span>
                    <span className="text-[13px] font-medium text-muted">
                      {post.readingMinutes} min read →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Curator note + submit ── */}
      <section className="border-t border-line py-20 sm:py-28 lg:py-36">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-ink">Curator note</p>
            <blockquote className="mt-6 font-serif text-[34px] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[46px]">
              &ldquo;We save websites worth studying, then go deeper than the homepage. If
              a palette, typeface or stack can&apos;t be verified, the record says so
              instead of guessing.&rdquo;
            </blockquote>
            <Link href="/editorial-guidelines" className="link-underline mt-6 inline-block text-[15px] font-semibold text-ink">
              Read the curation rules →
            </Link>
          </Reveal>

          <Reveal className="relative lg:col-span-5 lg:self-end" delay={80}>
            <div className="relative rounded-[6px] border border-ink bg-surface p-8 sm:p-10">
              <span aria-hidden className="tape -top-3 right-10 rotate-[3deg]" />
              <h2 className="display text-[38px] sm:text-[46px]">Found something worth saving?</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-soft">
                Send us a real, live website. Every submission is reviewed against the
                editorial guidelines before it joins the archive.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/submit" className="btn-primary">
                  Submit a website
                </Link>
                <Link href="/editorial-guidelines" className="btn-ghost">
                  Curation rules
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
