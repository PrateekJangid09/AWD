import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteCard from "@/components/SiteCard";
import CountUp from "@/components/CountUp";
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
      {/* ── Hero — 55/45 split ── */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 70% at 82% 20%, rgba(255,97,18,0.08), transparent 60%)" }}
          aria-hidden
        />
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />

        <div className="wrap relative grid items-center gap-10 py-14 lg:grid-cols-[11fr_9fr] lg:gap-12 lg:py-20">
          <div>
            <p className="anim-up flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-medium text-soft" style={{ animationDelay: "40ms" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-orange" />
              {all.length.toLocaleString()} websites, studied in depth
            </p>

            <h1 className="mega anim-up mt-5 text-[2.6rem] leading-[1.03] sm:text-5xl lg:text-[3.6rem]" style={{ animationDelay: "120ms" }}>
              World&apos;s best website designs and web design tools.
            </h1>

            <p className="anim-up mt-5 max-w-[46ch] text-pretty text-[17px] leading-relaxed text-soft" style={{ animationDelay: "220ms" }}>
              Explore real websites and the colour, type and
              technology behind them — then build with the same
              tools we use to study them.
            </p>

            <div className="anim-up mt-4 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
              <Link href="/archive" className="btn-primary !px-6 !py-3.5 text-[14px]">
                Explore the archive
                <span aria-hidden>→</span>
              </Link>
              <Link href="/tools" className="btn-ghost !px-6 !py-3.5 text-[14px]">
                Browse the tools
              </Link>
            </div>

            <form action="/archive" className="anim-up mt-6 flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-white py-2 pl-5 pr-2 shadow-soft focus-within:border-line-strong" style={{ animationDelay: "360ms" }}>
              <span className="text-muted">⌕</span>
              <input
                name="q"
                type="search"
                placeholder="Search SaaS, portfolio, Framer…"
                aria-label="Search the archive"
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
                style={{ borderRadius: 0 }}
              />
              <button type="submit" className="btn-dark shrink-0 !px-5 !py-2.5">Search</button>
            </form>
          </div>

          <div className="anim-pop hidden min-w-0 lg:block" style={{ animationDelay: "220ms" }}>
            <div className="grid h-[500px] grid-cols-2 grid-rows-3 gap-4">
              <div
                className="relative row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-soft-lg"
                style={{ background: "linear-gradient(160deg, #FF6112 0%, #FF7A33 45%, #FF9A5A 100%)" }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">Colour</span>
                <div>
                  <div className="mega text-5xl leading-none">{categories.length}</div>
                  <p className="mt-1 text-sm text-white/85">colour systems, mapped</p>
                  <div className="mt-4 flex gap-1.5">
                    {["#FFFFFF", "#FFD9C2", "#0E0E10", "#FFB088"].map((c) => (
                      <span key={c} className="h-6 flex-1 rounded-md" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-soft">
                <div className="mega text-6xl leading-none text-ink">Aa</div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Typography</p>
                  <p className="text-sm font-medium text-ink">Inter · Archivo</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-line bg-bone p-6 shadow-soft">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ["Next.js", "#0E0E10"],
                    ["React", "#2F6BFF"],
                    ["Tailwind", "#16a34a"],
                    ["Webflow", "#FF6112"],
                    ["Vercel", "#0E0E10"],
                  ].map(([name, c]) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                      {name}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Tech stack, detected</p>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-3 overflow-hidden rounded-3xl border border-line bg-white px-6 py-5 shadow-soft">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Palette · roles</p>
                  <p className="mt-1 text-sm font-medium text-ink">Primary · accent · neutral · dark</p>
                </div>
                <div className="flex shrink-0 -space-x-2">
                  {["#0E1F3D", "#FF6112", "#2F6BFF", "#16a34a", "#F4F4F5"].map((c) => (
                    <span key={c} className="h-10 w-10 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-line bg-bone/60">
          <div className="wrap grid grid-cols-2 divide-x divide-line md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className={`px-3 py-6 text-center sm:py-8 ${i === 2 ? "border-t border-line md:border-t-0" : ""} ${i === 3 ? "border-t border-line md:border-t-0" : ""}`}>
                <div className="mega text-3xl text-ink sm:text-5xl">
                  <CountUp to={s.to} suffix={s.suffix} format={s.format} />
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
                preview it on a mockup, and make OKLCH gradients. Free, no signup,
                everything runs in your browser.
              </p>
            </div>
            <Link href="/tools" className="btn-dark shrink-0 self-start sm:self-auto">
              Explore all tools ↗
            </Link>
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
      <section className="max-w-full overflow-hidden border-b border-line bg-ink py-4">
        <div className="ticker-track flex w-max max-w-none gap-3">
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
