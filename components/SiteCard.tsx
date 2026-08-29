import Link from "next/link";
import type { CardSite } from "@/lib/data";
import SitePreview from "./SitePreview";

export default function SiteCard({
  site,
  index,
}: {
  site: CardSite;
  index?: number;
}) {
  return (
    <Link href={`/archive/${site.slug}`} className="group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-line-strong group-hover:shadow-soft">
        {site.thumb ? (
          /* Real capture — top-aligned, gently pans up on hover */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={site.thumb}
            alt={`${site.name} website screenshot`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1.6s] ease-out group-hover:translate-y-[-18%] group-hover:scale-105"
            style={{ objectPosition: "top" }}
          />
        ) : (
          <SitePreview palette={site.palette} label={site.domain} className="h-full" />
        )}
        <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink shadow-sm backdrop-blur">
          {site.style}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-bold tracking-tight">{site.name}</h3>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:text-orange">
            {site.categoryName}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-pretty text-[13.5px] leading-relaxed text-muted">
          {site.summary}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <div className="flex gap-1">
            {site.palette.slice(0, 6).map((p, i) => (
              <span
                key={`${p.hex}-${i}`}
                title={`${p.role} ${p.hex}`}
                className="h-3.5 w-3.5 rounded-sm ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: p.hex }}
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            Inspect
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
