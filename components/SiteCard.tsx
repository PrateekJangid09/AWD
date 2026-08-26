import Link from "next/link";
import type { SiteRecord } from "@/lib/data";
import SitePreview from "./SitePreview";

export default function SiteCard({
  site,
  index,
}: {
  site: SiteRecord;
  index?: number;
}) {
  return (
    <Link
      href={`/sites/${site.slug}`}
      className="group flex flex-col"
    >
      <div className="relative overflow-hidden border border-line transition-colors duration-300 group-hover:border-line-strong">
        <SitePreview palette={site.palette} label={site.domain} className="aspect-[16/10]" />
        <span className="absolute right-3 top-3 bg-paper/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">
          {site.style}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-bold tracking-tight">
            {site.name}
          </h3>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:text-orange">
            {site.categoryName}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-pretty text-[13.5px] leading-relaxed text-muted">
          {site.summary}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <div className="flex gap-1">
            {site.palette.map((p) => (
              <span
                key={p.hex}
                title={`${p.role} ${p.hex}`}
                className="h-3.5 w-3.5"
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
