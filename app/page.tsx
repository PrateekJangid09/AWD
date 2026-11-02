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

      {/* ── Website inspirations ── */}
      <section className="border-b border-line py-16 sm:py-20">
        <div className="wrap">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">Website inspirations</p>
              <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
                {all.length.toLocaleString()} real websites, already studied.
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-soft">
                Each record keeps its palette, typefaces and detected stack.
                Browse the archive, or follow an industry.
              </p>
            </div>
            <Link href="/archive" className="btn-dark shrink-0 self-start sm:self-auto">
              Browse the archive ↗
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {gallery.map((site, i) => (
              <SiteCard key={site.slug} site={site} priority={i < 2} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {categories.slice(0, 12).map((c) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:-translate-y-0.5"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                {c.name}
                <span className="text-muted">{c.count.toLocaleString()}</span>
              </Link>
            ))}
            <Link href="/c" className="inline-flex items-center px-2 text-[13px] font-medium text-soft hover:text-ink">
              All {categories.length} inspirations →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-full overflow-hidden border-b border-line bg-ink py-4" aria-label="Industries">
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

      {/* ── Website components ── */}
      <section className="border-b border-line bg-bone py-16 sm:py-20">
        <div className="wrap">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">Website components</p>
              <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
                Free to copy. Heroes, buttons, and the rest of the page.
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-soft">
                Open any piece and copy it for Framer, copy it for Cursor, copy
                the complete code, or download the complete code. Then open it
                in Website Builder to see it on a full page.
              </p>
            </div>
            <Link href="/components" className="btn-primary shrink-0 self-start sm:self-auto">
              Browse components ↗
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["hero-aurora.jpg", "Hero"],
              ["bento-grid.jpg", "Features"],
              ["testimonials-wall.jpg", "Social proof"],
              ["cta-band.jpg", "Call to action"],
            ].map(([file, label]) => (
              <Link
                key={file}
                href="/components"
                className="group overflow-hidden rounded-2xl border border-line bg-white"
              >
                <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-paper">
                  <Image
                    src={`/webpalette/kit/thumbs/${file}`}
                    alt={`${label} component preview`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex items-center justify-between px-4 py-3 text-[14px] font-semibold text-ink">
                  {label}
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section className="relative overflow-hidden border-b border-line py-16 sm:py-20">
        <span className="aura hidden sm:block" aria-hidden />
        <div className="wrap relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-ink">Tools</p>
              <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
                Five colour tools, live in the browser.
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-soft">
                Chromary, Colorhyme, WebPalette, Mockupalettes and TrueGradient.
                Website Builder AI is the tool that joins them, wired to the
                component gallery.
              </p>
            </div>
            <Link href="/tools" className="btn-dark shrink-0 self-start sm:self-auto">
              Explore all tools ↗
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
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
            <Link
              href="/builder"
              className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-line-strong bg-bone p-6"
            >
              <span>
                <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink">
                  Joining the toolkit
                </span>
                <span className="mt-4 block text-[16px] font-semibold tracking-tight text-ink">
                  Website Builder AI
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-soft">
                  Place the free components on a full page, edit them, and download the site.
                </span>
              </span>
              <span className="mt-6 text-[13px] font-medium text-ink">Open the builder →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── List a product ── */}
      <section className="py-16 sm:py-24">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow text-ink">List a product</p>
            <h2 className="display mt-3 max-w-xl text-3xl sm:text-5xl">
              Put a website in front of people studying real design.
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-soft">
              A listing is a studied record: palette, type and stack, beside the
              {" "}{all.length.toLocaleString()} sites already here. Send the URL.
              We review it against the editorial guidelines before it is published.
            </p>
            <Link href="/submit" className="btn-primary mt-8 inline-flex">
              Submit a site ↗
            </Link>
          </div>
          <ul className="space-y-4 rounded-3xl border border-line bg-white p-6 sm:p-8">
            {[
              "A real destination, checked before it is added.",
              "The same palette, type and technology breakdown as every other record.",
              "A place in the archive people already browse by industry.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
