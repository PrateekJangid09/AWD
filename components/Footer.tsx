import Link from "next/link";
import { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { CANONICAL, DATASET, liveCategories } from "@/lib/canonical";
import { TOOLS } from "@/lib/catalog";
import { publishedPosts } from "@/lib/journal";
import { CONTACT_EMAIL, SUPPORT_URL } from "@/lib/seo";

const FEATURED: {
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  rel: string;
  title?: string;
}[] = [
  {
    href: "https://ideakiln.com/ideas/allwebsites-design",
    src: "https://ideakiln.com/dark.svg",
    alt: "Featured on Idea Kiln",
    width: 200,
    height: 54,
    rel: "noopener",
  },
  {
    href: "https://marketingdb.live",
    src: "https://marketingdb.live/badge.svg",
    alt: "Listed on MarketingDB",
    width: 190,
    height: 44,
    rel: "noopener noreferrer nofollow sponsored",
  },
  {
    href: "https://tools.launchllama.co?utm_source=badge&utm_medium=referral",
    src: "https://tools.launchllama.co/featured-badge.png?v=2",
    alt: "Featured on Launch Llama Tools",
    width: 200,
    height: 52,
    rel: "noopener noreferrer",
  },
  {
    href: "https://dofollow.tools",
    src: "https://dofollow.tools/badge/badge_dark.svg",
    alt: "Featured on Dofollow.Tools",
    width: 200,
    height: 54,
    rel: "noopener",
  },
  {
    href: "https://fazier.com/launches/allwebsites.design",
    src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark",
    alt: "Fazier badge",
    width: 120,
    height: 40,
    rel: "noopener",
  },
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge2-dark.svg",
    alt: "Featured on Twelve Tools",
    width: 148,
    height: 40,
    rel: "noopener",
  },
  {
    href: "https://startupfa.me/s/allwebsites?utm_source=allwebsites.design",
    src: "https://startupfa.me/badge?t=classic&theme=dark",
    alt: "AllWebsites - Featured on Startup Fame",
    width: 171,
    height: 54,
    rel: "noopener",
  },
  {
    href: "https://openhunts.com",
    src: "https://cdn.openhunts.com/badges/club.webp",
    alt: "OpenHunts Club Member",
    width: 195,
    height: 42,
    rel: "noopener",
    title: "OpenHunts Club",
  },
  {
    href: "https://uno.directory",
    src: "https://uno.directory/uno-directory.svg",
    alt: "Listed on Uno Directory",
    width: 120,
    height: 30,
    rel: "noopener",
  },
  {
    href: "https://tinyhunt.dev/projects/allwebsites-design?utm_source=badge",
    src: "https://r2.direasy-multi-tenant.focusapps.app/uploads/616d0b1a-3979-4b8c-94d1-b4f1fedd3ead/1783232960041/17rsshdhmati/featured-on-dark.svg",
    alt: "Featured on TinyHunt",
    width: 180,
    height: 44,
    rel: "noopener noreferrer",
  },
  {
    href: "https://dailypings.com/p/allwebsites-design",
    src: "https://dailypings.com/badge.svg",
    alt: "Featured on DailyPings",
    width: 179,
    height: 32,
    rel: "noopener",
    title: "Featured on DailyPings",
  },
  {
    href: "https://neeed.directory",
    src: "https://neeed.directory/badges/neeed-badge-dark.svg",
    alt: "Featured on neeed.directory",
    width: 139,
    height: 40,
    rel: "noopener",
  },
];

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/archive", label: "Archive" },
      { href: "/c", label: "Categories" },
      { href: "/research/website-design-index-2026", label: "2026 Design Index" },
      { href: "/site-map", label: "Site map" },
    ],
  },
  {
    title: "Tools",
    links: [
      ...TOOLS.map((t) => ({ href: `/tools/${t.slug}`, label: t.name })),
      { href: "/pricing", label: "Figma plugin pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resources" },
      { href: "/blogs", label: "Journal" },
      { href: "/editorial-guidelines", label: "Curation rules" },
      { href: "/submit", label: "Submit a site" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refunds" },
      { href: "/cookie-preference", label: "Cookie preferences" },
    ],
  },
];

export default function Footer() {
  const live = liveCategories().filter((c) => c.count > 0);
  const popular = live.slice(0, 8);
  const research = publishedPosts().slice(0, 3);

  return (
    <footer className="relative border-t border-ink bg-paper text-ink">
      <div className="wrap grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <p className="max-w-sm text-pretty text-[16px] leading-relaxed text-soft">
            A curated archive of real websites, studied for colour, type and
            technology, plus the free tools we use to study them.
          </p>
          <p className="mt-5 text-[13px] font-medium text-muted">
            {CANONICAL.length.toLocaleString()} websites · {live.length} categories · updated{" "}
            {DATASET.updatedAt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[14px]">
            <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline font-medium text-ink">
              {CONTACT_EMAIL}
            </a>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-medium text-ink"
            >
              Buy me a coffee
            </a>
          </div>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
            The archive and browser tools are free. Figma plugins include three free
            uses each, then $3/month or $30/year unlocks all four.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="link-underline text-[14px] text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {(popular.length > 0 || research.length > 0) && (
        <div className="wrap grid gap-8 border-t border-line py-8 lg:grid-cols-2">
          {popular.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                Popular categories
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {popular.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/c/${c.slug}`} className="link-underline text-[14px] text-ink">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {research.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                Latest research
              </p>
              <ul className="mt-3 space-y-2">
                {research.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blogs/${post.slug}`} className="link-underline text-[14px] text-ink">
                      {post.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="wrap overflow-hidden">
        <p
          aria-hidden
          className="select-none whitespace-nowrap pb-2 text-[clamp(56px,13.4vw,208px)] leading-[0.9] text-ink"
        >
          <Wordmark />
        </p>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            © {new Date().getFullYear()} AllWebsites.Design. Screenshots belong to the sites they show.
          </p>
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap py-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
            Listed on
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4">
            {FEATURED.map((badge) => (
              <a
                key={badge.href}
                href={badge.href}
                target="_blank"
                rel={badge.rel}
                title={badge.title}
                className="inline-flex items-center opacity-80 transition-opacity hover:opacity-100"
              >
                {/* External launch badges: served by each directory, not our optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  loading="lazy"
                  className="h-8 w-auto sm:h-9"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
