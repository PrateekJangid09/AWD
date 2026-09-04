import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteCard from "@/components/SiteCard";
import JsonLd from "@/components/JsonLd";
import { TOOLS, type CardSite } from "@/lib/catalog";
import { CANONICAL, DATASET, canonicalCards, liveCategories } from "@/lib/canonical";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, homePageGraph, pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Website Design Examples & Inspiration",
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: DEFAULT_TITLE },
};

export default function Home() {
  const all = canonicalCards();
  const gallery: CardSite[] = all.slice(0, 12);
  const categories = liveCategories().filter((c) => c.count > 0);
  const stats = [
    { to: all.length || CANONICAL.length, format: true, suffix: "", label: "Websites studied" },
    { to: categories.length, suffix: "", label: "Categories" },
    { to: 17, suffix: "", label: "Data points each" },
    { to: 100, suffix: "%", label: "Source-verified" },
  ];
  const tickerCats = [...categories, ...categories];

  return (
    <>
      <JsonLd
        data={homePageGraph({
          recordCount: all.length,
          categoryCount: categories.length,
          updated: DATASET.updatedAt,
        })}
      />
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 hidden h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.10] blur-[90px] sm:block"
          style={{ background: "conic-gradient(from 0deg, #FF6112, #2563eb, #16a34a, #db2777, #f59e0b, #FF6112)" }}
          aria-hidden
        />
        <div className="wrap relative py-16 text-center sm:py-24">
          <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[12px] text-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" />
            {all.length.toLocaleString()} websites, studied in depth
          </p>

          <h1 className="mega mx-auto mt-7 max-w-4xl text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-7xl">
            Website design examples,
            <br className="hidden sm:block" /> studied in depth.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-soft sm:text-lg">
            {all.length.toLocaleString()} real websites across {categories.length}{" "}
            categories, each one broken down into its colour palette, typefaces and
            detected technology. Free to browse, with tools that speak the same
            language.
          </p>

          <form action="/archive" className="mx-auto mt-9 flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-paper p-1.5 pl-5 shadow-soft focus-within:border-line-strong">
            <span className="text-muted">⌕</span>
            <input
              name="q"
              type="search"
              placeholder="Search SaaS, portfolio, Framer, yellow…"
              aria-label="Search the archive"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
              style={{ borderRadius: 0 }}
            />
            <button type="submit" className="btn-primary shrink-0 !px-5">Search</button>
          </form>
        </div>

        <div className="relative border-t border-line bg-bone/60">
          <div className="wrap grid grid-cols-2 divide-x divide-line md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className={`px-3 py-6 text-center sm:py-8 ${i === 2 ? "border-t border-line md:border-t-0" : ""} ${i === 3 ? "border-t border-line md:border-t-0" : ""}`}>
                <div className="mega text-3xl text-ink sm:text-5xl">
                  {s.format ? s.to.toLocaleString() : s.to}
                  {s.suffix}
                </div>
                <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted sm:text-[12px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools — featured up top ── */}
      <section className="relative overflow-hidden border-b border-line py-16 sm:py-20">
        <span className="aura hidden sm:block" aria-hidden />
        <div className="wrap relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">The toolkit</p>
              <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
                Free design tools that share one language.
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-soft">
                Find a colour name, build a harmony, generate a website palette,
                preview it on a mockup, and make OKLCH gradients. Browser tools stay
                free. The same engines ship as Figma plugins: three free uses each,
                then ₹249/month or ₹2,490/year for the suite.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3 self-start sm:self-auto">
              <Link href="/tools" className="btn-dark">
                Explore all tools ↗
              </Link>
              <Link href="/pricing" className="btn-ghost">
                Plugin pricing
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => (
                <a
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-bone">
                    <Image
                      src={`/tools/previews/${t.slug}.webp`}
                      alt={`${t.name}: ${t.tagline}`}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink shadow-sm backdrop-blur">
                      Live tool
                    </span>
                  </span>
                  <span className="flex flex-1 items-center gap-4 p-5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-semibold tracking-tight text-ink">
                        {t.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted">
                        {t.tagline}
                      </span>
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </span>
                </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Colourful category ticker ── */}
      <section className="overflow-hidden border-b border-line bg-ink py-4">
        <div className="ticker-track flex w-max gap-3">
          {tickerCats.map((c, i) => (
            <Link
              key={`${c.slug}-${i}`}
              href={`/c/${c.slug}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
              {c.name}
              <span className="text-white/70">{c.count.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-12 sm:py-16">
        <div className="wrap">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">The gallery</p>
              <h2 className="display mt-3 text-2xl sm:text-3xl">
                Website design examples, recently studied.
              </h2>
            </div>
            <Link href="/archive" className="text-[13px] font-medium text-soft hover:text-ink">
              Browse all {all.length.toLocaleString()} →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {gallery.map((site, i) => (
              <SiteCard key={site.slug} site={site} priority={i < 2} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/archive" className="btn-ghost">
              Browse all {all.length.toLocaleString()} website design examples
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="border-t border-line bg-bone py-16 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-ink">Browse</p>
              <h2 className="display mt-3 text-2xl sm:text-3xl">By category.</h2>
            </div>
            <Link href="/c" className="text-[13px] font-medium text-soft hover:text-ink">
              All {categories.length} →
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:-translate-y-0.5"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                {c.name}
                <span className="text-muted">{c.count.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-line py-24 sm:py-32">
        <div className="wrap text-center">
          <h2 className="mega mx-auto max-w-3xl text-4xl sm:text-6xl">
            Discover, understand, explore.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-lg text-soft">
            The definitive place to study how the web is designed.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/archive" className="btn-primary !px-6 !py-3.5">Explore the archive</Link>
            <Link href="/submit" className="btn-ghost !px-6 !py-3.5">Submit a site</Link>
          </div>
        </div>
      </section>
    </>
  );
}
