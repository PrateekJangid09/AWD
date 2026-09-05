import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "./Breadcrumb";
import SiteCard from "./SiteCard";
import CopySwatch from "./CopySwatch";
import {
  assetBase,
  canonicalCards,
  categorySlug,
  imageSize,
  recordDates,
  type CanonicalSite,
} from "@/lib/canonical";
import { TOOLS, categoryColor, type CardSite } from "@/lib/catalog";
import { studyAnswer } from "@/lib/seo";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    ...DATE_FORMAT,
    timeZone: "UTC",
  });
}

function Shot({
  src,
  label,
  alt,
  href,
  eager = false,
  height = 560,
}: {
  src: string;
  label: string;
  alt: string;
  href?: string;
  eager?: boolean;
  height?: number;
}) {
  const intrinsic = imageSize(src);
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
      <figcaption className="flex items-center gap-1.5 border-b border-line bg-bone px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-center text-[10px] font-medium tracking-wide text-muted">
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
      <div
        className="skeleton no-scrollbar overflow-y-auto"
        style={{ height }}
        tabIndex={0}
        aria-label={`${label} — scroll to view the full page`}
      >
        {intrinsic ? (
          <Image
            src={src}
            alt={alt}
            width={intrinsic.width}
            height={intrinsic.height}
            sizes="(max-width: 1024px) 100vw, 520px"
            priority={eager}
            loading={eager ? undefined : "lazy"}
            quality={72}
            className="block h-auto w-full"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="block w-full"
          />
        )}
      </div>
    </figure>
  );
}

function PageThumb({ src, label, href }: { src: string; label: string; href?: string }) {
  const inner = (
    <>
      <div className="skeleton relative aspect-[9/16] overflow-hidden rounded-lg border border-line bg-bone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${label} screenshot`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-2 truncate text-center text-[11px] font-medium text-muted">{label}</p>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="group block">
      {inner}
    </a>
  ) : (
    <div className="group block">{inner}</div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{children}</p>
  );
}

function isRecordedValue(value?: string | null) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !/^(not\s*found|n\/?a|none|unknown|null|-)$/i.test(trimmed);
}

function isRecordedEmail(value?: string | null) {
  return isRecordedValue(value) && Boolean(value?.includes("@"));
}

export default function SiteRecord({ site }: { site: CanonicalSite }) {
  const base = assetBase(site);
  const { identity, classification, design, technology, contact, social, seo, pages, extraction } = site;
  const dates = recordDates(site);

  const tags = [classification.category, classification.subcategory, classification.website_type].filter(
    Boolean,
  ) as string[];

  const techChips = Array.from(
    new Set(
      [
        ...technology.framework,
        ...technology.builder_cms,
        technology.language ?? "",
        ...technology.web_server,
        ...technology.hosting,
        ...technology.cdn,
        ...technology.ecommerce,
      ].filter(Boolean) as string[],
    ),
  );

  const homepageFile = site.screenshots.desktop ?? "desktop.png";
  const subPages = site.screenshots.pages
    .filter((p) => p.file !== "homepage.png" && p.file !== homepageFile)
    .slice(0, 3)
    .map((p) => {
      const raw =
        pages[p.label.toLowerCase().split(/[\/\s]/)[0]] ?? pages[p.label.toLowerCase()] ?? undefined;
      return {
        label: p.label,
        file: p.file,
        href: isRecordedValue(raw) && /^https?:\/\//i.test(raw ?? "") ? raw : undefined,
      };
    });

  const crossSellSlugs = ["webpalette", "colorhyme", "mockupalettes"];
  const crossSell = crossSellSlugs
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter(Boolean) as (typeof TOOLS)[number][];

  const catName = classification.category ?? "";
  const catSlug = catName ? categorySlug(catName) : "";
  const cat = catSlug ? { slug: catSlug, name: catName } : undefined;
  const accent = categoryColor(catName);
  const pool: CardSite[] = canonicalCards().filter((s) => s.slug !== identity.slug);
  const sameCat = pool.filter((s) => s.categoryName === catName);
  const similar = (
    sameCat.length >= 3 ? sameCat : [...sameCat, ...pool.filter((s) => !sameCat.includes(s))]
  ).slice(0, 3);

  return (
    <div className="wrap max-w-full py-6 sm:py-8">
      <Breadcrumb
        items={[
          { href: "/", label: "Home" },
          { href: "/archive", label: "Archive" },
          ...(cat ? [{ href: `/c/${cat.slug}`, label: cat.name }] : []),
          { label: identity.name },
        ]}
      />

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-5 lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {identity.favicon && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`${base}/${identity.favicon}`}
                  alt=""
                  width={48}
                  height={48}
                  loading="eager"
                  decoding="async"
                  className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white object-contain p-1.5"
                />
              )}
              <div className="min-w-0">
                <h1 className="mega truncate text-2xl sm:text-3xl">{identity.name}</h1>
                <span className="text-[13px] text-muted">{identity.domain}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <a
                href={identity.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-primary !py-2.5 !text-[13px]"
              >
                Visit website ↗
              </a>
              <Link href="/contact" className="btn-ghost !py-2.5 !text-[13px]">
                Report
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <p className="eyebrow text-ink">In short</p>
              <p className="mt-2.5 border-l-2 border-orange pl-4 text-pretty text-[15px] leading-relaxed text-soft">
                {studyAnswer(site)}
              </p>
            </div>

            {seo.description && (
              <div className="mt-5">
                <p className="eyebrow text-ink">How the site describes itself</p>
                <p className="mt-2.5 text-pretty text-[15px] leading-relaxed text-soft">
                  {seo.description}
                </p>
              </div>
            )}

            {(isRecordedEmail(contact.email) || isRecordedValue(contact.address) || social.linkedin || social.x) && (
              <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm">
                {isRecordedEmail(contact.email) && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">Email</dt>
                    <dd className="flex items-center gap-2">
                      <a href={`mailto:${contact.email}`} className="font-medium hover:text-orange">
                        {contact.email}
                      </a>
                      {contact.on_official_domain && (
                        <span className="rounded border border-orange px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-orange">
                          On-domain
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {isRecordedValue(contact.address) && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-muted">Address</dt>
                    <dd className="text-right text-soft">{contact.address}</dd>
                  </div>
                )}
                {(social.linkedin || social.x) && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">Social</dt>
                    <dd className="flex gap-3">
                      {social.linkedin ? (
                        <a href={social.linkedin} className="hover:text-orange" target="_blank" rel="noopener noreferrer">
                          LinkedIn
                        </a>
                      ) : null}
                      {social.x ? (
                        <a href={social.x} className="hover:text-orange" target="_blank" rel="noopener noreferrer">
                          X
                        </a>
                      ) : null}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            <p className="mt-5 border-t border-line pt-4 text-[12px] leading-relaxed text-muted">
              <span className="font-medium text-ink">
                {dates.exact
                  ? `Last checked ${formatDay(dates.modified)}`
                  : `Last reviewed in the ${formatDay(dates.modified)} archive revision`}
              </span>
              {" · "}
              Compiled and reviewed by the{" "}
              <Link
                href="/editorial-guidelines"
                className="font-medium text-ink underline decoration-orange decoration-2 underline-offset-2"
              >
                AllWebsites.Design editorial team
              </Link>
              .{" "}
              <Link href="/about#method" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                Methodology
              </Link>
              {" · "}
              Record {site.site_id}
              {extraction.completeness != null ? ` · ${extraction.completeness}% complete` : ""}
            </p>
          </div>

          <div className="space-y-5 rounded-2xl border border-line bg-white p-5">
            <div>
              <div className="flex items-center justify-between">
                <Label>Colour palette · {design.palette.length}</Label>
                <span className="text-[10px] text-muted">Click to copy</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {design.palette.map((p, i) => (
                  <CopySwatch key={`${p.hex}-${i}`} hex={p.hex} role={p.role} />
                ))}
              </div>
            </div>

            {design.fonts.length > 0 && (
              <div className="border-t border-line pt-4">
                <Label>Fonts · {design.fonts.length}</Label>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {design.fonts.map((f) => (
                    <span key={f.name} className="inline-flex items-baseline gap-1.5 rounded-lg border border-line bg-bone px-2.5 py-1.5">
                      <span className="text-sm font-semibold text-ink">{f.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted">{f.role}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {techChips.length > 0 && (
              <div className="border-t border-line pt-4">
                <Label>Tech stack, detected</Label>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {techChips.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-bone p-5">
            <p className="text-[15px] font-semibold tracking-tight text-ink">
              Want to apply this colour palette in your next design?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-soft">
              Take these exact colours into our free tools — no signup, everything runs in your browser.
            </p>
            <div className="mt-4 space-y-2">
              {crossSell.map((t) => (
                <a
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft"
                >
                  <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line">
                    {t.swatches.map((s) => (
                      <span key={s} className="flex-1" style={{ backgroundColor: s }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{t.name}</span>
                    <span className="block truncate text-[12px] text-muted">{t.tagline}</span>
                  </span>
                  <span className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {similar.length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold tracking-tight text-ink">
                  Similar {catName ? `${catName} ` : ""}brands
                </p>
                <Link
                  href={cat ? `/c/${cat.slug}` : "/archive"}
                  className="text-[12px] font-medium hover:opacity-80"
                  style={{ color: accent }}
                >
                  See all →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {similar.map((s) => (
                  <SiteCard key={s.slug} site={s} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-20 lg:order-2">
          <Shot
            src={`${base}/${homepageFile}`}
            label={identity.domain}
            alt={`${identity.name} homepage, full-page screenshot`}
            href={identity.url}
            eager
            height={560}
          />

          {subPages.length > 0 && (
            <div className="mt-4">
              <Label>Key pages</Label>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {subPages.map((p) => (
                  <PageThumb key={p.file} src={`${base}/${p.file}`} label={p.label} href={p.href} />
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-center text-[11px] text-muted">
            Source-verified
            {dates.exact ? ` · last checked ${formatDay(dates.modified)}` : ` · archive ${formatDay(dates.modified)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
