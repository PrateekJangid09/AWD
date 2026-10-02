import Link from "next/link";
import WebsiteScreenshot from "./WebsiteScreenshot";
import type { Category } from "@/lib/data";

/**
 * Category as an editorial entry: one representative screenshot, the name in
 * the serif, a one-line description from the record set, and the count.
 */
export default function CategoryCard({
  category,
  featured = false,
  line,
  thumb,
  tilt = "",
}: {
  category: Category;
  featured?: boolean;
  line?: string;
  thumb?: string | null;
  tilt?: string;
}) {
  const copy = line ?? category.blurb;
  return (
    <Link href={`/c/${category.slug}`} className="group block">
      {thumb && (
        <span className={`block bg-paper-light p-1.5 ring-1 ring-ink/10 ${tilt}`}>
          <span className="shot block aspect-[16/10] transition-colors duration-150 group-hover:border-orange">
            <WebsiteScreenshot
              src={thumb}
              alt={`Screenshot of a ${category.name} website in the archive`}
              fill
              className="object-cover object-top"
            />
          </span>
        </span>
      )}
      <span className="mt-5 flex items-baseline justify-between gap-4">
        <span
          className={`min-w-0 font-serif leading-none text-ink underline decoration-transparent decoration-[1.5px] underline-offset-[6px] transition-colors group-hover:decoration-orange ${featured ? "text-[38px]" : "text-[30px]"}`}
        >
          {category.name}
        </span>
        <span className="shrink-0 text-[14px] tabular-nums text-muted">
          {category.count.toLocaleString()} sites
        </span>
      </span>
      <span className="mt-2 block max-w-[46ch] text-pretty text-[15px] leading-relaxed text-soft">
        {copy}
      </span>
    </Link>
  );
}
