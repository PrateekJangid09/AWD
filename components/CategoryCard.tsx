import Link from "next/link";
import type { Category } from "@/lib/data";

export default function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group relative flex flex-col justify-between border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-3 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5"
              style={{ backgroundColor: category.accent }}
            />
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted">
              {category.share}
            </span>
          </span>
          <h3 className={`font-bold tracking-tight ${featured ? "text-2xl" : "text-xl"}`}>
            {category.name}
          </h3>
          <p className="mt-2 max-w-[28ch] text-pretty text-[13px] leading-relaxed text-muted">
            {category.blurb}
          </p>
        </div>
        <span
          className="text-lg text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange"
          aria-hidden
        >
          →
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-line pt-4">
        <div className="flex flex-wrap gap-1.5">
          {category.descriptors.map((d) => (
            <span key={d} className="text-[11px] tracking-wide text-muted">
              {d}
              <span className="ml-1.5 text-line-strong">/</span>
            </span>
          ))}
        </div>
        <div className="text-right">
          <span className="block text-xl font-bold leading-none tracking-tight">
            {category.count.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
