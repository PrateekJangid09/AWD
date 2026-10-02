import Link from "next/link";
import Breadcrumb from "./Breadcrumb";
import SiteCard from "./SiteCard";
import CopySwatch from "./CopySwatch";
import PageViewer, { type ViewerPage } from "./PageViewer";
import {
  assetBase,
  canonicalCards,
  categorySlug,
  imageSize,
  recordDates,
  screenshotPath,
  type CanonicalSite,
} from "@/lib/canonical";
import { TOOLS, type CardSite } from "@/lib/catalog";
import { outboundUrl } from "@/lib/outbound";
import { displayName, studyAnswer } from "@/lib/seo";

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>
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

  const homepage = screenshotPath(site);
  const homepageFile = homepage?.split("/").pop();
  const officialUrl = outboundUrl(identity.url);
  const viewerPages: ViewerPage[] = [];
  if (homepage) {
    const size = imageSize(homepage);
    viewerPages.push({
      label: "Homepage",
      src: homepage,
      width: size?.width,
      height: size?.height,
      href: officialUrl ?? undefined,
    });
  }
  const PAGE_ORDER = ["Pricing", "About", "Blog", "Jobs/Careers", "Contact"];
  const orderedPages = [...site.screenshots.pages].sort(
    (a, b) => (PAGE_ORDER.indexOf(a.label) + 99) % 99 - (PAGE_ORDER.indexOf(b.label) + 99) % 99,
  );
  for (const p of orderedPages) {
    if (p.file === "homepage.png" || p.file === homepageFile) continue;
    const src = `${base}/${p.file}`;
    const size = imageSize(src);
    if (!size) continue;
    const raw =
      pages[p.label.toLowerCase().split(/[\/\s]/)[0]] ?? pages[p.label.toLowerCase()] ?? undefined;
    viewerPages.push({
      label: p.label === "Jobs/Careers" ? "Careers" : p.label,
      src,
      width: size.width,
      height: size.height,
      href: outboundUrl(isRecordedValue(raw) ? raw : undefined) ?? undefined,
    });
  }

  const crossSellSlugs = ["webpalette", "colorhyme", "mockupalettes"];
  const crossSell = crossSellSlugs
    .map((s) => TOOLS.find((t) => t.slug === s))
    .filter(Boolean) as (typeof TOOLS)[number][];

  const catName = classification.category ?? "";
  const catSlug = catName ? categorySlug(catName) : "";
  const cat = catSlug ? { slug: catSlug, name: catName } : undefined;
  const pool: CardSite[] = canonicalCards().filter((s) => s.slug !== identity.slug);
  const sameCat = pool.filter((s) => s.categoryName === catName);
  const similar = (
    sameCat.length >= 3 ? sameCat : [...sameCat, ...pool.filter((s) => !sameCat.includes(s))]
  ).slice(0, 3);

  return (
    <>
      <div className="wrap pb-16 pt-8 sm:pb-24">
        <Breadcrumb
          items={[
            { href: "/", label: "Home" },
            { href: "/archive", label: "Archive" },
            ...(cat ? [{ href: `/c/${cat.slug}`, label: cat.name }] : []),
            { label: displayName(site) },
          ]}
        />

        <div className="mt-10 grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Record */}
          <div className="min-w-0 lg:col-span-5 lg:order-2">
            <div className="lg:sticky lg:top-[100px]">
              <div className="anim-up flex items-center gap-3">
                {identity.favicon && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`${base}/${identity.favicon}`}
                    alt=""
                    width={40}
                    height={40}
                    loading="eager"
                    decoding="async"
                    className="h-10 w-10 shrink-0 rounded-[6px] border border-line bg-surface object-contain p-1"
                  />
                )}
                <span className="text-[14px] text-muted">{identity.domain}</span>
              </div>
              <h1
                className="mega anim-up mt-5 break-words text-[48px] sm:text-[64px]"
                style={{ animationDelay: "60ms" }}
              >
                {displayName(site)}
              </h1>

              <p
                className="anim-up mt-6 text-pretty text-[17px] leading-[1.6] text-soft"
                style={{ animationDelay: "110ms" }}
              >
                {studyAnswer(site)}
              </p>

              <div className="anim-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: "160ms" }}>
                {officialUrl && (
                  <a href={officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary">
                    Visit website
                    <span aria-hidden>↗</span>
                  </a>
                )}
                <Link href="/contact" className="btn-ghost">
                  Report a correction
                </Link>
              </div>

              <dl className="mt-10 border-t border-ink">
                {tags.length > 0 && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Classified as</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {cat && (
                        <Link href={`/c/${cat.slug}`} className="tag !border-ink/60 !text-ink hover:!border-orange">
                          {cat.name}
                        </Link>
                      )}
                      {tags
                        .filter((t) => t !== catName)
                        .map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                    </dd>
                  </div>
                )}
                {design.style_tags.length > 0 && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Style</dt>
                    <dd className="text-[15px] text-ink">{design.style_tags.join(", ")}</dd>
                  </div>
                )}
                {design.fonts.length > 0 && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Typefaces</dt>
                    <dd className="space-y-1">
                      {design.fonts.map((f) => (
                        <p key={f.name} className="text-[15px] text-ink">
                          {f.name} <span className="text-[13px] text-muted">· {f.role}</span>
                        </p>
                      ))}
                    </dd>
                  </div>
                )}
                {techChips.length > 0 && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Technology</dt>
                    <dd className="text-[15px] text-ink">{techChips.join(", ")}</dd>
                  </div>
                )}
                {isRecordedEmail(contact.email) && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Email</dt>
                    <dd className="min-w-0 text-[15px]">
                      <a href={`mailto:${contact.email}`} className="link-underline break-all text-ink">
                        {contact.email}
                      </a>
                      {contact.on_official_domain && (
                        <span className="ml-2 text-[12px] text-muted">on official domain</span>
                      )}
                    </dd>
                  </div>
                )}
                {isRecordedValue(contact.address) && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Address</dt>
                    <dd className="text-[15px] text-soft">{contact.address}</dd>
                  </div>
                )}
                {(social.linkedin || social.x) && (
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4">
                    <dt className="text-[13px] text-muted">Social</dt>
                    <dd className="flex gap-4 text-[15px]">
                      {social.linkedin ? (
                        <a href={social.linkedin} className="link-underline text-ink" target="_blank" rel="noopener noreferrer">
                          LinkedIn
                        </a>
                      ) : null}
                      {social.x ? (
                        <a href={social.x} className="link-underline text-ink" target="_blank" rel="noopener noreferrer">
                          X
                        </a>
                      ) : null}
                    </dd>
                  </div>
                )}
              </dl>

              {design.palette.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-baseline justify-between">
                    <Label>Colour palette · {design.palette.length}</Label>
                    <span className="text-[12px] text-muted">Select a swatch to copy</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                    {design.palette.map((p, i) => (
                      <CopySwatch key={`${p.hex}-${i}`} hex={p.hex} role={p.role} />
                    ))}
                  </div>
                </div>
              )}

              {seo.description && (
                <div className="mt-8 border-l-2 border-orange pl-4">
                  <Label>How the site describes itself</Label>
                  <p className="mt-2 text-pretty text-[15px] leading-relaxed text-soft">{seo.description}</p>
                </div>
              )}

              <p className="mt-8 text-[13px] leading-relaxed text-muted">
                <span className="font-medium text-ink">
                  {dates.exact
                    ? `Last checked ${formatDay(dates.modified)}`
                    : `Last reviewed in the ${formatDay(dates.modified)} archive revision`}
                </span>
                {" · "}Compiled and reviewed by the{" "}
                <Link href="/editorial-guidelines" className="link-underline font-medium text-ink">
                  AllWebsites.Design editorial team
                </Link>
                .{" "}
                <Link href="/about#method" className="link-underline text-ink">
                  Methodology
                </Link>
                {" · "}Record {site.site_id}
                {extraction.completeness != null ? ` · ${extraction.completeness}% complete` : ""}
              </p>
            </div>
          </div>

          {/* Screenshots */}
          <div className="relative min-w-0 lg:col-span-7 lg:order-1">
            <PageViewer name={identity.name} domain={identity.domain} pages={viewerPages} />
            {viewerPages.length > 0 && (
              <p className="mt-3 text-[13px] text-muted">
                Full-page captures. Scroll inside the frame to see the whole page.
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="border-t border-line py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display text-[36px] sm:text-[44px]">Use this palette</h2>
            <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-soft">
              Take these exact colours into the free tools. No signup, everything runs in
              your browser.
            </p>
          </div>
          <ul className="border-t border-ink lg:col-span-8">
            {crossSell.map((t) => (
              <li key={t.slug}>
                <a href={`/tools/${t.slug}`} className="index-row group !items-center">
                  <span className="w-32 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-ink sm:w-40 sm:text-[13px]">
                    {t.name}
                  </span>
                  <span className="flex-1 text-[15px] text-soft">{t.tagline}</span>
                  <span aria-hidden className="text-muted group-hover:text-orange-ink">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="border-t border-line py-14 sm:py-20">
          <div className="wrap">
            <div className="flex items-end justify-between gap-4">
              <h2 className="display text-[36px] sm:text-[44px]">
                Similar {catName ? `${catName} ` : ""}websites
              </h2>
              <Link href={cat ? `/c/${cat.slug}` : "/archive"} className="link-underline text-[14px] font-semibold text-ink">
                See all →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <SiteCard key={s.slug} site={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
