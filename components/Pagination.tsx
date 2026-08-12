import Link from 'next/link';

export default function Pagination({ page, totalPages, pathname, query = {} }: { page: number; totalPages: number; pathname: string; query?: Record<string, string | undefined> }) {
  if (totalPages <= 1) return null;
  const href = (target: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => value && params.set(key, value));
    if (target > 1) params.set('page', String(target));
    const suffix = params.toString();
    return `${pathname}${suffix ? `?${suffix}` : ''}`;
  };
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages].filter((value) => value >= 1 && value <= totalPages))];
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2 py-12">
      {page > 1 && <Link className="rounded-full border border-current px-4 py-2" rel="prev" href={href(page - 1)}>Previous</Link>}
      {pages.map((value) => <Link key={value} aria-current={value === page ? 'page' : undefined} className={`rounded-full border px-4 py-2 ${value === page ? 'bg-black text-white' : 'border-current'}`} href={href(value)}>{value}</Link>)}
      {page < totalPages && <Link className="rounded-full border border-current px-4 py-2" rel="next" href={href(page + 1)}>Next</Link>}
    </nav>
  );
}
