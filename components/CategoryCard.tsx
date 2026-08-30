import Link from "next/link";
import type { Category } from "@/lib/data";

export default function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  const c = category.accent;
  return (
    <Link
      href={`/c/${category.slug}`}
      className="glass-card group relative flex flex-col justify-between overflow-hidden p-6 hover:-translate-y-1"
    >
      {/* accent glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: c }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-bone px-2.5 py-1 text-[11px] font-medium text-soft">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
            {category.share}
          </span>
          <h3 className={`font-semibold tracking-tight ${featured ? "text-2xl" : "text-xl"}`}>
            {category.name}
          </h3>
          <p className="mt-2 max-w-[28ch] text-pretty text-[13px] leading-relaxed text-muted">
            {category.blurb}
          </p>
        </div>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-lg text-white transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden
        >
          →
        </span>
      </div>

      <div className="relative mt-6 flex items-end justify-between border-t border-line pt-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {category.descriptors.map((d) => (
            <span key={d} className="text-[11px] text-muted">{d}</span>
          ))}
        </div>
        <span className="text-xl font-semibold tracking-tight text-ink">
          {category.count.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
