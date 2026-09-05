import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import JsonLd from "@/components/JsonLd";
import { TOOLS } from "@/lib/data";
import {
  CANONICAL,
  DATASET,
  categorySlug,
  liveCategories,
} from "@/lib/canonical";
import { publishedPosts } from "@/lib/journal";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Site Map — Every Page in the Archive";
const description =
  "The full structure of AllWebsites.Design: archive, industry categories, free colour tools, research and editorial pages, with every published record linked.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/site-map",
});

const SECTIONS: { heading: string; links: { href: string; label: string; desc: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { href: "/", label: "Home", desc: "Website design examples, studied in depth." },
      { href: "/archive", label: "Archive", desc: "Search and filter every published record." },
      { href: "/c", label: "Categories", desc: "Website design examples by industry." },
      { href: "/tools", label: "Tools", desc: "Free colour tools that run in your browser." },
      { href: "/pricing", label: "Plugin pricing", desc: "Figma plugins: three free uses, then $3/month or $30/year." },
      { href: "/checkout", label: "Plugin checkout", desc: "Razorpay hosted checkout for the Figma plugin suite." },
      {
        href: "/research/website-design-index-2026",
        label: "2026 Design Index",
        desc: "How the catalogue breaks down, and the method behind it.",
      },
      { href: "/blogs", label: "Resources", desc: "Original research measured from the archive." },
    ],
  },
  {
    heading: "About the archive",
    links: [
      { href: "/about", label: "About", desc: "How the archive studies websites." },
      { href: "/manifesto", label: "Manifesto", desc: "Why useful inspiration needs context." },
      {
        href: "/editorial-guidelines",
        label: "Editorial guidelines",
        desc: "Inclusion, classification and corrections.",
      },
      { href: "/submit", label: "Submit a site", desc: "Nominate a website for review." },
      { href: "/contact", label: "Contact", desc: "Corrections and editorial questions." },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy policy", desc: "What we collect and why." },
      { href: "/terms", label: "Terms of service", desc: "Terms for the archive and plugin subscriptions." },
      { href: "/refund-policy", label: "Refund policy", desc: "Cancellations and refunds for plugin subscriptions." },
      { href: "/cookie-preference", label: "Cookie preferences", desc: "Manage analytics cookies." },
    ],
  },
];

export default function SiteMapPage() {
  const categories = liveCategories().filter((c) => c.count > 0);
  const byCategory = categories.map((category) => ({
    category,
    records: CANONICAL.filter(
      (site) => categorySlug(site.classification.category) === category.slug,
    ),
  }));
  const uncategorised = CANONICAL.filter(
    (site) =>
      !categories.some(
        (category) => categorySlug(site.classification.category) === category.slug,
      ),
  );

  return (
    <>
      <JsonLd
        data={collectionPageGraph({
          path: "/site-map",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Site map" },
          ],
          listName: "Site sections",
          items: [
            ...SECTIONS.flatMap((section) =>
              section.links.map((link) => ({
                name: link.label,
                url: absUrl(link.href),
              })),
            ),
            ...categories.map((category) => ({
              name: `${category.name} website design examples`,
              url: absUrl(`/c/${category.slug}`),
            })),
            ...TOOLS.map((tool) => ({
              name: tool.name,
              url: absUrl(`/tools/${tool.slug}`),
            })),
            ...publishedPosts().map((post) => ({
              name: post.h1,
              url: absUrl(`/blogs/${post.slug}`),
            })),
          ],
        })}
      />
      <UtilityHero
        eyebrow="Site map"
        title="Every page, in one place."
        intro="The whole structure of the archive: sections, industry categories, tools and all published records. Useful if you would rather scan than search."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Site map" }]}
        meta={`${CANONICAL.length.toLocaleString()} records · ${categories.length} categories · ${TOOLS.length} tools`}
      />

      <section className="py-12 sm:py-16">
        <div className="wrap grid gap-10 md:grid-cols-3">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {section.heading}
              </h2>
              <ul className="mt-5 space-y-4">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block text-[15px] font-medium tracking-tight hover:text-orange"
                    >
                      {link.label}
                    </Link>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                      {link.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-bone py-12 sm:py-16">
        <div className="wrap">
          <h2 className="display text-2xl sm:text-3xl">Research and writing</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedPosts().map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className="rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-line-strong"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-orange">
                  {post.kicker}
                </span>
                <span className="mt-2 block text-[15px] font-semibold tracking-tight">
                  {post.h1}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                  {post.keyStat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="wrap">
          <h2 className="display text-2xl sm:text-3xl">Free colour tools</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-line-strong"
              >
                <span className="block text-[15px] font-semibold tracking-tight">
                  {tool.name}
                </span>
                <span className="mt-1 block text-[13px] text-muted">{tool.tagline}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-bone py-12 sm:py-16">
        <div className="wrap">
          <h2 className="display text-2xl sm:text-3xl">
            All {CANONICAL.length.toLocaleString()} records, by category
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-soft">
            Every published design study, grouped the way the archive classifies it.
            Dataset last updated {DATASET.updatedAt}.
          </p>

          <div className="mt-10 space-y-10">
            {byCategory.map(({ category, records }) => (
              <div key={category.slug}>
                <h3 className="flex items-baseline gap-2.5 text-[15px] font-semibold tracking-tight">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.accent }}
                  />
                  <Link href={`/c/${category.slug}`} className="hover:text-orange">
                    {category.name}
                  </Link>
                  <span className="text-[13px] font-normal text-muted">
                    {records.length.toLocaleString()}
                  </span>
                </h3>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {records.map((site) => (
                    <li key={site.identity.slug}>
                      <Link
                        href={`/archive/${site.identity.slug}`}
                        className="text-[13.5px] text-soft hover:text-orange"
                      >
                        {site.identity.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {uncategorised.length > 0 && (
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">
                  Uncategorised{" "}
                  <span className="text-[13px] font-normal text-muted">
                    {uncategorised.length.toLocaleString()}
                  </span>
                </h3>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {uncategorised.map((site) => (
                    <li key={site.identity.slug}>
                      <Link
                        href={`/archive/${site.identity.slug}`}
                        className="text-[13.5px] text-soft hover:text-orange"
                      >
                        {site.identity.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
