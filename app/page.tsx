import Link from "next/link";
import Marquee from "@/components/Marquee";
import SiteCard from "@/components/SiteCard";
import CategoryCard from "@/components/CategoryCard";
import SitePreview from "@/components/SitePreview";
import Reveal from "@/components/Reveal";
import {
  CATEGORIES,
  SITES,
  STATS,
  TRENDING,
  TOOLS,
  getCategory,
} from "@/lib/data";

export default function Home() {
  const trending = TRENDING.map(getCategory).filter(Boolean);
  const heroCards = SITES.slice(0, 3);
  const distribution = CATEGORIES.slice(0, 6);
  const distMax = Math.max(...distribution.map((c) => c.count));

  return (
    <>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
        <div className="wrap relative grid gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow text-ink">The Website Design Archive</p>

            <h1 className="mega mt-7 text-6xl leading-[0.86] sm:text-8xl lg:text-[7.5rem]">
              Study the
              <br />
              web&apos;s best
              <br />
              <span className="text-orange">design.</span>
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-soft">
              Discover, compare and study how real websites are designed — by
              industry, style, colour, typography and technology. Structured design
              intelligence, not just screenshots.
            </p>

            <form action="/archive" className="mt-8 flex max-w-xl border border-ink">
              <span className="grid place-items-center px-4 text-lg text-muted">⌕</span>
              <input
                name="q"
                type="search"
                placeholder="Search 5,896 sites — SaaS, portfolio, Framer…"
                aria-label="Search the archive"
                className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted"
              />
              <button type="submit" className="btn bg-ink px-6 text-white hover:bg-black">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/archive" className="btn-primary">
                Browse full archive <span aria-hidden>↗</span>
              </Link>
              <Link href="/c" className="link-underline text-sm font-semibold uppercase tracking-[0.08em]">
                Explore 22 categories
              </Link>
            </div>
          </div>

          {/* Hero visual: orange block + card cluster */}
          <div className="relative hidden h-[460px] lg:block" aria-hidden>
            <div className="absolute right-4 top-8 h-[360px] w-[300px] bg-orange" />
            <div className="absolute left-10 top-3 z-30 -rotate-3">
              <div className="w-64 border border-ink shadow-soft-lg">
                <SitePreview palette={heroCards[0].palette} label={heroCards[0].domain} />
              </div>
            </div>
            <div className="absolute right-0 top-24 z-20 rotate-3">
              <div className="w-56 border border-ink shadow-soft-lg">
                <SitePreview palette={heroCards[1].palette} label={heroCards[1].domain} />
              </div>
            </div>
            <div className="absolute bottom-0 left-24 z-40 -rotate-1">
              <div className="w-60 border border-ink shadow-soft-lg">
                <SitePreview palette={heroCards[2].palette} label={heroCards[2].domain} />
              </div>
            </div>
            <span className="absolute -right-4 top-1/2 z-40 origin-center -translate-y-1/2 rotate-90 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink">
              5,896 references
            </span>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative border-t border-line">
          <div className="wrap grid grid-cols-2 md:grid-cols-4">
            {[
              { k: STATS.total.toLocaleString(), v: "Curated references" },
              { k: STATS.categories.toString(), v: "Governed categories" },
              { k: STATS.pages.toString(), v: "Crawlable pages" },
              { k: "100%", v: "Source-verified" },
            ].map((s, i) => (
              <div
                key={i}
                className={`px-2 py-7 md:px-6 ${i > 0 ? "md:border-l md:border-line" : ""} ${i === 1 ? "border-l border-line md:border-l" : ""} ${i === 3 ? "border-l border-line" : ""}`}
              >
                <div className="mega text-4xl text-ink sm:text-5xl">{s.k}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={["Industry", "Style", "Colour", "Typography", "Technology", "Layout"]} />

      {/* ─────────────────── SELECTED REFERENCES (up top) ─────────────────── */}
      <section className="border-b border-line py-16 sm:py-20">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-ink">Selected references</p>
              <h2 className="mega mt-5 text-4xl sm:text-6xl">
                Real websites,
                <br />
                studied in context.
              </h2>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {["All", "Portfolio", "SaaS", "Agency", "AI"].map((f, i) => (
                <span
                  key={f}
                  className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${i === 0 ? "text-ink" : "text-muted"}`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SITES.map((site, i) => (
              <Reveal key={site.slug} delay={(i % 3) * 70}>
                <SiteCard site={site} index={i} />
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/archive" className="btn-dark">
              View all 5,896 references ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────── CATEGORIES ─────────────────────── */}
      <section className="border-b border-line bg-bone py-16 sm:py-20">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-ink">Governed collections</p>
              <h2 className="mega mt-5 text-4xl sm:text-5xl">Browse by category.</h2>
            </div>
            <Link href="/c" className="btn-ghost self-start sm:self-auto">
              All 22 categories →
            </Link>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {trending.map((c) => (
              <CategoryCard key={c!.slug} category={c!} featured />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── TOOLS ─────────────────────── */}
      <section className="border-b border-line py-16 sm:py-20">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-ink">Free design tools</p>
              <h2 className="mega mt-5 text-4xl sm:text-6xl">
                Colour tools, built in.
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-soft">
                Five free, no-signup tools that run in your browser — palette
                building, gradients, colour naming and more.
              </p>
            </div>
            <Link href="/tools" className="btn-ghost self-start sm:self-auto">
              All tools →
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => (
              <Reveal key={t.slug} delay={(i % 3) * 60}>
                <a
                  href={`/tools/${t.slug}`}
                  className="group flex h-full flex-col justify-between border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-soft"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-orange">
                        ● Live
                      </span>
                      <span className="text-base text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange" aria-hidden>
                        ↗
                      </span>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight">{t.name}</h3>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-muted">
                      {t.tagline}
                    </p>
                    <p className="mt-3 text-pretty text-[13.5px] leading-relaxed text-soft">
                      {t.desc}
                    </p>
                  </div>
                  <div className="mt-6 flex h-8 overflow-hidden border border-line">
                    {t.swatches.map((s) => (
                      <span key={s} className="flex-1" style={{ backgroundColor: s }} />
                    ))}
                  </div>
                </a>
              </Reveal>
            ))}
            {/* trailing CTA card */}
            <Link
              href="/tools"
              className="group flex min-h-[220px] flex-col items-start justify-between border border-dashed border-line-strong bg-bone p-6 transition-colors hover:border-orange"
            >
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                The suite
              </span>
              <span className="mega text-3xl">
                See all
                <br />
                five tools
                <span className="text-orange"> →</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────── WHY / DESIGN INTELLIGENCE ─────────────────── */}
      <section className="border-b border-line bg-ink py-16 text-paper sm:py-20">
        <div className="wrap">
          <p className="eyebrow text-white/90">Why AllWebsites</p>
          <h2 className="mega mt-5 max-w-3xl text-4xl text-paper sm:text-5xl">
            A constructed record, never a raw row.
          </h2>

          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Design tokens", d: "Area-weighted palettes with roles, and typography split into display, body and mono — read from the rendered page." },
              { t: "Technology signals", d: "Builder, framework, hosting and CDN from headers and DOM — labelled detected, likely or unknown." },
              { t: "Governed taxonomy", d: "22 maintained categories with reviewed corrections that override automated mapping." },
              { t: "Editorial provenance", d: "Integrity checks, review dates and correction paths. The official site is always the authority." },
              { t: "Similar aesthetics", d: "A design-similarity graph that turns one reference into an exploration path." },
              { t: "Free tools", d: "Colorhyme, TrueGradient, WebPalette and more — free colour tools built alongside the archive." },
            ].map((f, i) => (
              <Reveal
                key={f.t}
                delay={(i % 3) * 60}
                className="bg-ink p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 bg-orange" />
                  <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-paper">{f.t}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-white/60">
                  {f.d}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── DESIGN INDEX ─────────────────── */}
      <section className="border-b border-line bg-bone py-16 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow text-ink">2026 Design Index</p>
            <h2 className="mega mt-5 text-4xl sm:text-5xl">
              What the
              <br />
              web is
              <br />
              <span className="text-orange">building.</span>
            </h2>
            <Link href="/research/website-design-index-2026" className="btn-ghost mt-8">
              Read the full index →
            </Link>
          </div>
          <div className="space-y-5">
            {distribution.map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`} className="group block">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold tracking-tight">{c.name}</span>
                  <span className="text-[12px] tabular-nums text-muted">
                    {c.count.toLocaleString()} · {c.share}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-paper-dark">
                  <div
                    className="h-full bg-ink transition-all duration-500 group-hover:bg-orange"
                    style={{ width: `${(c.count / distMax) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── CTA ─────────────────────── */}
      <section className="bg-ink py-24 text-paper sm:py-32">
        <div className="wrap text-center">
          <p className="eyebrow justify-center text-white/90">Start exploring</p>
          <h2 className="mega mt-6 text-6xl leading-[0.9] sm:text-8xl">
            Build the
            <br />
            archive <span className="text-orange">with us.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-lg text-white/60">
            Submit a site, request a correction, or just start studying 5,896 of the
            web&apos;s best-designed pages.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/archive" className="btn bg-orange px-7 py-4 text-white hover:bg-orange-600">
              Explore the archive ↗
            </Link>
            <Link
              href="/submit"
              className="btn border border-white/30 px-7 py-4 text-white hover:bg-white hover:text-ink"
            >
              Submit a site
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
