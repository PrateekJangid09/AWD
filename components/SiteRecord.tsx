import Link from "next/link";
import Breadcrumb from "./Breadcrumb";
import SiteCard from "./SiteCard";
import { assetBase, canonicalCards, categorySlug, type CanonicalSite } from "@/lib/canonical";
import { categoryColor, type CardSite } from "@/lib/catalog";

/* ── small building blocks ─────────────────────────────────────── */

function Shot({
  src,
  label,
  href,
  eager = false,
  height = 480,
  className = "",
}: {
  src: string;
  label: string;
  href?: string;
  eager?: boolean;
  height?: number;
  className?: string;
}) {
  return (
    <figure className={`overflow-hidden rounded-xl glass ${className}`}>
      <figcaption className="flex items-center gap-1.5 border-b border-white/40 bg-white/30 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 truncate rounded-md bg-paper px-2 py-0.5 text-center text-[10px] font-medium tracking-wide text-muted">
          {label}
        </span>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-orange"
          >
            Open ↗
          </a>
        )}
      </figcaption>
      {/* Full-page capture scrolls inside the window */}
      <div
        className="skeleton no-scrollbar overflow-y-auto"
        style={{ height }}
        tabIndex={0}
        aria-label={`${label} — scroll to view the full page`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${label} full-page screenshot`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block w-full"
        />
      </div>
    </figure>
  );
}

function Confidence({ label, value }: { label: string; value?: number }) {
  const pct = value != null ? Math.round(value * 100) : null;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-[12px] tabular-nums text-muted">
          {pct != null ? `${pct}%` : "—"}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full bg-paper-dark">
        <div className="h-full bg-orange" style={{ width: `${pct ?? 0}%` }} />
      </div>
    </div>
  );
}

function Tech({
  label,
  value,
  state,
}: {
  label: string;
  value?: string;
  state: "Detected" | "Likely" | "Not detected";
}) {
  const tone =
    state === "Detected"
      ? "text-orange border-orange"
      : state === "Likely"
        ? "text-ink border-ink/40"
        : "text-muted border-line";
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-sm font-medium">{value || "—"}</span>
        <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${tone}`}>
          {state}
        </span>
      </span>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-b border-line py-12 sm:py-16 ${className}`}>
      <div className="wrap">
        <p className="eyebrow text-ink">{eyebrow}</p>
        <h2 className="display mt-3 text-2xl sm:text-3xl">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/* ── the template ──────────────────────────────────────────────── */

export default function SiteRecord({ site }: { site: CanonicalSite }) {
  const base = assetBase(site);
  const { identity, classification, design, technology, contact, social, seo, pages, extraction } = site;

  const meta = [classification.category, classification.subcategory, classification.website_type]
    .filter(Boolean)
    .join(" · ");

  // Key-page gallery: use the desktop capture for Homepage, then the rest.
  const gallery = [
    { label: "Homepage", file: site.screenshots.desktop ?? "desktop.png", href: pages.homepage },
    ...site.screenshots.pages
      .filter((p) => p.file !== "homepage.png")
      .map((p) => ({
        label: p.label,
        file: p.file,
        href:
          pages[p.label.toLowerCase().split(/[\/\s]/)[0]] ??
          pages[p.label.toLowerCase()] ??
          undefined,
      })),
  ];

  // ── Similar sites in the same category (keeps the user in a loop) ──
  const catName = classification.category ?? "";
  const catSlug = catName ? categorySlug(catName) : "";
  const cat = catSlug ? { slug: catSlug, name: catName } : undefined;
  const accent = categoryColor(catName);
  const pool: CardSite[] = canonicalCards().filter((s) => s.slug !== identity.slug);
  const sameCat = pool.filter((s) => s.categoryName === catName);
  const similar = (
    sameCat.length >= 4
      ? sameCat
      : [...sameCat, ...pool.filter((s) => !sameCat.includes(s))]
  ).slice(0, 4);

  const techRows: { label: string; value?: string; state: "Detected" | "Likely" | "Not detected" }[] = [
    { label: "Framework", value: technology.framework.join(", "), state: technology.framework.length ? "Detected" : "Not detected" },
    { label: "CMS / Builder", value: technology.builder_cms.join(", "), state: technology.builder_cms.length ? "Detected" : "Not detected" },
    { label: "Language", value: technology.language ?? undefined, state: technology.language ? "Likely" : "Not detected" },
    { label: "Web server", value: technology.web_server.join(", "), state: technology.web_server.length ? "Detected" : "Not detected" },
    { label: "Hosting", value: technology.hosting.join(", "), state: technology.hosting.length ? "Likely" : "Not detected" },
    { label: "CDN", value: technology.cdn.join(", "), state: technology.cdn.length ? "Likely" : "Not detected" },
    { label: "E-commerce", value: technology.ecommerce.join(", "), state: technology.ecommerce.length ? "Detected" : "Not detected" },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <span className="aura" aria-hidden />
        <div className="wrap relative py-8 sm:py-10">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/archive", label: "Archive" },
              ...(cat
                ? [{ href: `/c/${cat.slug}`, label: cat.name }]
                : []),
              { label: identity.name },
            ]}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Shot
              src={`${base}/${site.screenshots.desktop ?? "desktop.png"}`}
              label={identity.domain}
              href={identity.url}
              eager
              height={560}
            />

            <div>
              <div className="flex items-center gap-3">
                {identity.favicon && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`${base}/${identity.favicon}`}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-lg border border-line bg-white object-contain p-1"
                  />
                )}
                <span className="font-mono text-sm uppercase tracking-wider text-muted">
                  {identity.domain}
                </span>
              </div>

              <h1 className="mega mt-4 text-5xl sm:text-6xl">{identity.name}</h1>

              {meta && (
                <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-soft">
                  {meta}
                </p>
              )}

              {classification.audience.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {classification.audience.map((a) => (
                    <span key={a} className="tag">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {seo.description && (
                <div className="mt-6 border-l-2 border-orange pl-4">
                  <p className="eyebrow text-ink">Summary</p>
                  <p className="mt-2 text-pretty leading-relaxed text-soft">
                    {seo.description}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={identity.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-primary"
                >
                  Visit website ↗
                </a>
                {cat && (
                  <Link href={`/c/${cat.slug}`} className="btn-ghost">
                    More {cat.name}
                  </Link>
                )}
                <Link href="/contact" className="btn-ghost">
                  Report incorrect info
                </Link>
              </div>

              {design.style_tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {design.style_tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Design DNA ── */}
      <Section eyebrow="Design DNA" title="Palette, type & style" className="bg-bone">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Palette */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Palette · {design.palette.length} colours
            </p>
            <div className="mt-4 space-y-2">
              {design.palette.map((p, i) => (
                <div key={`${p.hex}-${i}`} className="glass flex items-center gap-4 rounded-lg p-2">
                  <span className="h-10 w-10 shrink-0 border border-line" style={{ backgroundColor: p.hex }} />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {p.role}
                    </p>
                    <p className="font-mono text-sm">{p.hex.toUpperCase()}</p>
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {Math.round((p.coverage ?? 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Typography · {design.fonts.length} fonts
            </p>
            <div className="mt-4 space-y-3">
              {design.fonts.map((f) => (
                <div key={f.name} className="glass rounded-xl p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold tracking-tight">{f.name}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange">
                      {f.role}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[12px] text-muted">
                    {f.weights.length > 0 && (
                      <span>Weights {f.weights.join(" · ")}</span>
                    )}
                    {f.sizes.length > 0 && (
                      <span>Sizes {f.sizes[0]}–{f.sizes[f.sizes.length - 1]}px</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Technology + Confidence ── */}
      <Section eyebrow="Technology" title={technology.summary ? `Built with ${technology.summary}` : "Detected stack"}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            {techRows.map((r) => (
              <Tech key={r.label} label={r.label} value={r.value} state={r.state} />
            ))}
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">
              Signals from headers, DOM markers and rendered evidence. Backend details
              are inferred, never guaranteed.
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Classification confidence
              {classification.confidence != null && (
                <span className="ml-2 text-orange">
                  {Math.round(classification.confidence * 100)}% overall
                </span>
              )}
            </p>
            <div className="mt-5 space-y-4">
              <Confidence label="Category" value={classification.field_confidence.category} />
              <Confidence label="Subcategory" value={classification.field_confidence.subcategory} />
              <Confidence label="Website type" value={classification.field_confidence.website_type} />
              <Confidence label="Audience" value={classification.field_confidence.audience} />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Page structure ── */}
      <Section eyebrow="Page structure" title="Key pages, captured" className="bg-bone">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((g) => (
            <Shot
              key={g.label}
              src={`${base}/${g.file}`}
              label={g.label}
              href={g.href ?? undefined}
              height={320}
            />
          ))}
        </div>
      </Section>

      {/* ── Contact & provenance ── */}
      <section className="py-12 sm:py-16">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          {/* Contact */}
          <div className="glass-card p-6">
            <p className="eyebrow text-ink">Contact</p>
            <dl className="mt-5 space-y-3">
              {contact.email && (
                <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Email</dt>
                  <dd className="flex items-center gap-2 text-sm">
                    <a href={`mailto:${contact.email}`} className="font-medium hover:text-orange">
                      {contact.email}
                    </a>
                    {contact.on_official_domain && (
                      <span className="border border-orange px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-orange">
                        On-domain
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {contact.address && (
                <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Address</dt>
                  <dd className="text-right text-sm text-soft">{contact.address}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Social</dt>
                <dd className="flex gap-3 text-sm">
                  {social.linkedin ? (
                    <a href={social.linkedin} className="hover:text-orange" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  ) : null}
                  {social.x ? (
                    <a href={social.x} className="hover:text-orange" target="_blank" rel="noopener noreferrer">X</a>
                  ) : null}
                  {!social.linkedin && !social.x && <span className="text-muted">Not detected</span>}
                </dd>
              </div>
            </dl>
          </div>

          {/* Provenance */}
          <div className="rounded-xl border border-line bg-ink p-6 text-paper">
            <p className="eyebrow text-white/90">Provenance</p>
            <dl className="mt-5 space-y-3">
              {[
                ["Record ID", site.site_id],
                ["Status", extraction.status],
                ["Completeness", extraction.completeness != null ? `${extraction.completeness}%` : "—"],
                ["Last checked", extraction.extracted_at ? new Date(extraction.extracted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
                ["Extractor", extraction.extractor_version],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-white/50">{k}</dt>
                  <dd className="font-mono text-sm text-paper">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/contact" className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-orange underline decoration-2 underline-offset-2">
              Report incorrect information →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Similar sites — keep the user in a discovery loop ── */}
      {similar.length > 0 && (
        <section className="relative overflow-hidden border-t border-line bg-bone py-14 sm:py-20">
          <span className="aura" aria-hidden />
          <div className="wrap relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-ink">More like this</p>
                <h2 className="display mt-3 text-3xl sm:text-4xl">
                  Similar {catName} sites
                </h2>
                <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-soft">
                  Keep exploring the same corner of the archive — related brands
                  studied the same way.
                </p>
              </div>
              <Link
                href={cat ? `/c/${cat.slug}` : "/archive"}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors"
                style={{ backgroundColor: `${accent}18`, color: accent }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                {cat ? `All ${cat.name}` : "Browse archive"} →
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
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
