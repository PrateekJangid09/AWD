import Link from "next/link";

/** H2s are phrased as the questions people ask, so they can anchor an answer. */
export function Q({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="display mt-16 scroll-mt-28 text-[34px] leading-[1.02] sm:text-[42px]">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-pretty text-[17.5px] leading-[1.7] text-soft">{children}</p>;
}

/** A number pulled straight from the record set, shown with its sample size. */
export function Figure({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="my-10 border-y border-ink py-8">
      <p className="font-serif text-[72px] leading-[0.9] tracking-[-0.03em] text-ink sm:text-[96px]">{value}</p>
      <p className="mt-4 max-w-[48ch] text-pretty text-[18px] font-medium leading-snug text-ink">{label}</p>
      {note && <p className="mt-3 font-mono text-[12px] leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

export type Column = { key: string; head: string; align?: "left" | "right" };
export type Row = Record<string, React.ReactNode> & { key: string; href?: string };

export function DataTable({ columns, rows, caption }: { columns: Column[]; rows: Row[]; caption: string }) {
  return (
    <figure className="my-10">
      <div className="overflow-x-auto border-t border-ink">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted first:pl-0 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-line">
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3 tabular-nums first:pl-0 ${col.align === "right" ? "text-right" : "text-left"} ${
                      i === 0 ? "font-medium text-ink" : "text-soft"
                    }`}
                  >
                    {i === 0 && row.href ? (
                      <Link href={row.href} className="link-underline">
                        {row[col.key]}
                      </Link>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-3 text-[13px] leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

/** How a number was produced. Stated on the page, never left implicit. */
export function Method({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-14 rounded-[6px] border border-line bg-surface p-6 sm:p-8">
      <p className="eyebrow text-ink">How this was measured</p>
      <div className="mt-4 space-y-3 text-[15.5px] leading-relaxed text-soft">{children}</div>
    </aside>
  );
}

/** Descriptive internal links, kept close to the claim they support. */
export function Related({ links }: { links: { href: string; label: string }[] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="chip">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
