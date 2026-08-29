import Link from "next/link";
import Breadcrumb from "./Breadcrumb";
import SiteCard from "./SiteCard";
import type { CardSite, SiteRecord } from "@/lib/data";
import { getCategory } from "@/lib/data";

export default function CatalogSitePage({
  site,
  similar,
}: {
  site: SiteRecord;
  similar: CardSite[];
}) {
  const cat = getCategory(site.category);

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="wrap py-10 sm:py-12">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: `/c/${site.category}`, label: site.categoryName },
              { label: site.name },
            ]}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <figure className="overflow-hidden rounded-xl border border-line bg-chalk shadow-soft">
              <figcaption className="flex items-center gap-1.5 border-b border-line bg-bone px-3.5 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 flex-1 truncate rounded-md bg-paper px-2 py-0.5 text-center text-[10px] font-medium tracking-wide text-muted">
                  {site.domain}
                </span>
                <a
                  href={site.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-orange"
                >
                  Open ↗
                </a>
              </figcaption>
              <div className="no-scrollbar overflow-y-auto bg-white" style={{ height: 560 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/screenshots/${site.slug}.webp`}
                  alt={`${site.name} website screenshot`}
                  className="block w-full"
                />
              </div>
            </figure>

            <div>
              <div className="flex items-center gap-2">
                <span className="tag bg-chalk">{site.style}</span>
                <span className="tag bg-chalk">{site.websiteType}</span>
              </div>
              <h1 className="mega mt-4 text-6xl sm:text-7xl">{site.name}</h1>
              <p className="mt-2 font-mono text-sm uppercase tracking-wider text-muted">
                {site.domain}
              </p>

              <div className="mt-6 border-l-2 border-orange pl-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Source summary
                </p>
                <p className="mt-2 text-pretty leading-relaxed text-soft">{site.summary}</p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={site.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-primary"
                >
                  Visit website ↗
                </a>
                <Link href={`/c/${site.category}`} className="btn-ghost">
                  More {site.categoryName} →
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {site.tags.map((t) => (
                  <span key={t} className="tag bg-paper">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-bone py-14">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6">
            <p className="eyebrow">Design system</p>
            <h2 className="display mt-3 text-2xl">Palette</h2>
            <div className="mt-6 space-y-2">
              {site.palette.map((p) => (
                <div
                  key={p.hex}
                  className="flex items-center gap-4 border border-line bg-chalk p-2"
                >
                  <span
                    className="h-10 w-10 shrink-0 border border-line"
                    style={{ backgroundColor: p.hex }}
                  />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {p.role}
                    </p>
                    <p className="font-mono text-sm">{p.hex.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-ink p-6 text-paper">
            <p className="font-mono text-[11px] uppercase tracking-widest text-orange">
              Editorial status
            </p>
            <dl className="mt-4 space-y-3">
              {[
                ["Verification", site.verification],
                ["Archive review", site.reviewedAt],
                ["Source last checked", site.lastChecked],
                ["Category", site.categoryName],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-paper/15 pb-3 last:border-0"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/55">
                    {k}
                  </dt>
                  <dd className="text-sm text-paper">{v}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/contact"
              className="mt-5 inline-block font-mono text-[11px] uppercase tracking-wider text-orange underline decoration-2 underline-offset-2"
            >
              Request a correction →
            </Link>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="wrap">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">Similar aesthetics</p>
                <h2 className="display mt-3 text-3xl sm:text-4xl">
                  References with a related feel.
                </h2>
              </div>
              {cat && (
                <Link href={`/c/${cat.slug}`} className="btn-ghost self-start sm:self-auto">
                  More {cat.name} →
                </Link>
              )}
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s, i) => (
                <SiteCard key={s.slug} site={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
