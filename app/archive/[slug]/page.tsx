import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import SiteCard from "@/components/SiteCard";
import SitePreview from "@/components/SitePreview";
import SiteRecord from "@/components/SiteRecord";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { SITES, getSite, getCategory } from "@/lib/data";
import { CANONICAL, getCanonical } from "@/lib/canonical";
import {
  archiveRecordGraph,
  archiveSampleGraph,
  pageMeta,
  studyDescription,
  studyTitle,
} from "@/lib/seo";

export function generateStaticParams() {
  // Real canonical records + the remaining sample records.
  return CANONICAL.map((s) => ({ slug: s.identity.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rec = getCanonical(slug);
  if (rec) {
    const shot = rec.screenshots.desktop ?? "desktop.webp";
    return pageMeta({
      title: studyTitle(rec.identity.name),
      description: studyDescription(rec),
      path: `/archive/${slug}`,
      image: {
        url: `/sites/${slug}/${shot}`,
        alt: `${rec.identity.name} full-page screenshot`,
      },
    });
  }
  const site = getSite(slug);
  if (!site) return { title: "Record not found" };
  return pageMeta({
    title: studyTitle(site.name),
    description: `A design study of ${site.name}: ${site.style} styling, palette, type and detected technology.`,
    path: `/archive/${slug}`,
  });
}

function TechRow({
  label,
  value,
  state,
}: {
  label: string;
  value?: string;
  state: "Detected" | "Likely" | "Unknown";
}) {
  const color =
    state === "Detected"
      ? "text-orange border-orange"
      : state === "Likely"
        ? "text-ink border-ink/40"
        : "text-ink/40 border-ink/20";
  return (
    <div className="flex items-center justify-between border-b-2 border-ink/10 py-3 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-sm font-medium">{value ?? "—"}</span>
        <span
          className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${color}`}
        >
          {state}
        </span>
      </span>
    </div>
  );
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Real canonical record → rich template.
  const canonical = getCanonical(slug);
  if (canonical) {
    return (
      <>
        <JsonLd data={archiveRecordGraph(canonical)} />
        <SiteRecord site={canonical} />
        <ExploreMore except={["/archive"]} />
      </>
    );
  }

  // Fallback: sample record → original render.
  const site = getSite(slug);
  if (!site) notFound();

  const cat = getCategory(site.category);
  const similar = site.similar
    .map(getSite)
    .filter(Boolean)
    .slice(0, 3) as NonNullable<ReturnType<typeof getSite>>[];
  const filled =
    similar.length >= 3
      ? similar
      : [...similar, ...SITES.filter((s) => s.slug !== site.slug)].slice(0, 3);

  return (
    <>
        <JsonLd
          data={archiveSampleGraph({
            slug,
            name: site.name,
            description: `${site.summary} Study the palette, typography, style and technology behind ${site.name}.`,
            officialUrl: site.officialUrl,
            categoryName: site.categoryName,
            categorySlug: site.category,
          })}
        />
      {/* Hero */}
      <section className="border-b border-ink bg-paper">
        <div className="wrap py-10 sm:py-12">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: `/c/${site.category}`, label: site.categoryName },
              { label: site.name },
            ]}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            {/* Screenshot */}
            <div className="border border-line shadow-brutal">
              <SitePreview
                palette={site.palette}
                label={`${site.name} — ${site.categoryName} website design screenshot`}
                className="min-h-[320px]"
              />
            </div>

            {/* Meta */}
            <div>
              <div className="flex items-center gap-2">
                <span className="tag bg-chalk">{site.style}</span>
                <span className="tag bg-chalk">{site.websiteType}</span>
              </div>
              <h1 className="mega mt-4 text-6xl sm:text-7xl">{site.name}</h1>
              <p className="mt-2 font-mono text-sm uppercase tracking-wider text-ink/50">
                {site.domain}
              </p>

              <div className="mt-6 border-l-2 border-orange pl-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40">
                  Source summary
                </p>
                <p className="mt-2 text-pretty leading-relaxed text-ink/80">
                  {site.summary}
                </p>
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
                <a
                  href={`/c/${site.category}`}
                  className="btn-ghost"
                >
                  More {site.categoryName} →
                </a>
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

      {/* Design system + Technology */}
      <section className="border-b border-ink bg-bone py-14">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          {/* Design */}
          <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6">
            <p className="eyebrow">Design system</p>
            <h2 className="display mt-3 text-2xl">Palette &amp; type</h2>

            <div className="mt-6 space-y-2">
              {site.palette.map((p) => (
                <div
                  key={p.hex}
                  className="flex items-center gap-4 border border-ink/15 bg-chalk p-2"
                >
                  <span
                    className="h-10 w-10 shrink-0 border border-ink/15"
                    style={{ backgroundColor: p.hex }}
                  />
                  <div className="flex-1">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
                      {p.role}
                    </p>
                    <p className="font-mono text-sm">{p.hex.toUpperCase()}</p>
                  </div>
                  {p.coverage && (
                    <span className="font-mono text-xs text-ink/50">{p.coverage}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Display", site.typography.display],
                ["Body", site.typography.body],
                ["Mono", site.typography.mono ?? "—"],
                ["Weights", site.typography.weights],
                ["Style", site.style],
              ].map(([k, v]) => (
                <div key={k} className="border border-ink/15 bg-chalk p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                    {k}
                  </p>
                  <p className="mt-1 text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology + provenance */}
          <div className="flex flex-col gap-6">
            <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6">
              <p className="eyebrow">Technology</p>
              <h2 className="display mt-3 text-2xl">Detected stack</h2>
              <div className="mt-5">
                <TechRow label="Framework" value={site.technology.framework} state={site.technology.framework ? "Detected" : "Unknown"} />
                <TechRow label="CMS / Builder" value={site.technology.cms} state={site.technology.cms ? "Detected" : "Unknown"} />
                <TechRow label="Hosting" value={site.technology.hosting} state={site.technology.hosting ? "Likely" : "Unknown"} />
                <TechRow label="CDN" value={site.technology.cdn} state={site.technology.cdn ? "Likely" : "Unknown"} />
                <TechRow label="Backend language" state="Unknown" />
              </div>
              <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink/45">
                Signals from headers, DOM markers and rendered evidence. We never fabricate
                certainty — unproven fields stay Unknown.
              </p>
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
                  ["Audience", site.audience],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-paper/15 pb-3 last:border-0">
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
        </div>
      </section>

      {/* Similar */}
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
            {filled.map((s, i) => (
              <SiteCard key={s.slug} site={s} index={i} />
            ))}
          </div>
        </div>
      </section>
      <ExploreMore except={["/archive"]} />
    </>
  );
}
