import Link from "next/link";

export default function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="link-underline text-muted hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden className="text-line-strong">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
