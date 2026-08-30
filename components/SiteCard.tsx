import Link from "next/link";
import { categoryColor, type CardSite } from "@/lib/data";

// Modern-minimal gallery card: 9:16 frame, real capture that auto-scrolls
// on hover, skeleton while loading, category colour accent, quiet meta.
export default function SiteCard({ site }: { site: CardSite; index?: number }) {
  const accent = categoryColor(site.categoryName);
  const primary =
    site.palette.find((p) => p.role === "primary")?.hex ??
    site.palette[1]?.hex ??
    "#111111";
  const bg = site.palette.find((p) => p.role === "background")?.hex ?? "#F4F4F5";

  return (
    <Link href={`/archive/${site.slug}`} className="group block">
      <div
        className={`relative aspect-[9/16] overflow-hidden rounded-2xl border border-line ${site.thumb ? "skeleton" : ""}`}
      >
        {site.thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={site.thumb}
            alt={`${site.name} website`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
            style={{ backgroundColor: bg }}
          >
            <span className="h-14 w-14 rounded-2xl" style={{ backgroundColor: primary }} />
            <span className="text-center text-lg font-semibold tracking-tight text-ink/80">
              {site.name}
            </span>
          </div>
        )}

        {/* colour accent bar (category) — grows on hover */}
        <div
          className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
          style={{ backgroundColor: accent }}
        />

        <span className="glass-chip absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-medium text-ink opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
          {site.style}
        </span>

        {/* palette strip peeks up on hover */}
        <div className="absolute inset-x-0 bottom-0 flex h-1.5 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          {site.palette.slice(0, 6).map((p, i) => (
            <span key={`${p.hex}-${i}`} className="flex-1" style={{ backgroundColor: p.hex }} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
        <h3 className="truncate text-[15px] font-medium tracking-tight text-ink">
          {site.name}
        </h3>
        <span
          className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium"
          style={{ color: accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
          {site.categoryName}
        </span>
      </div>
    </Link>
  );
}
