import Link from "next/link";
import WebsiteScreenshot from "./WebsiteScreenshot";
import type { CardSite } from "@/lib/catalog";

/**
 * Screenshot-first archive card. 16:10 crop of the real homepage, name,
 * category and style. No shadow, no lift: on hover the frame and the name
 * pick up the orange accent.
 */
export default function SiteCard({
  site,
  priority = false,
}: {
  site: CardSite;
  index?: number;
  priority?: boolean;
}) {
  return (
    // Cards appear in grids of up to 300. Left on the default, each one
    // prefetches its record's RSC payload on sight, which is tens of megabytes
    // across a full archive scroll. This stays a plain crawlable anchor.
    <Link href={`/archive/${site.slug}`} prefetch={false} className="group block">
      <div className="shot aspect-[16/10] transition-colors duration-150 group-hover:border-orange">
        {site.thumb ? (
          <WebsiteScreenshot
            src={site.thumb}
            alt={`Screenshot of the ${site.name} homepage`}
            fill
            priority={priority}
            className="object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6">
            <span className="font-serif text-2xl text-muted">{site.name}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[17px] font-semibold tracking-[-0.01em] text-ink underline decoration-transparent decoration-[1.5px] underline-offset-[5px] transition-colors group-hover:decoration-orange">
          {site.name}
        </p>
        <span className="shrink-0 text-[12.5px] text-muted">{site.style}</span>
      </div>
      <p className="mt-0.5 truncate text-[13.5px] text-muted">{site.categoryName}</p>
    </Link>
  );
}
