import Link from "next/link";

/** H2s are phrased as the questions people ask, so they can anchor an answer. */
export function Q({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="display mt-14 scroll-mt-24 text-2xl leading-tight sm:text-3xl"
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-pretty text-[16.5px] leading-relaxed text-ink/85">
      {children}
    </p>
  );
}

/** A number pulled straight from the record set, shown with its sample size. */
export function Figure({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-orange/[0.06] p-6">
      <p className="mega text-4xl leading-none text-ink sm:text-5xl">{value}</p>
      <p className="mt-3 text-pretty text-[15px] font-medium leading-relaxed text-ink">
        {label}
      </p>
      {note && (
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
          {note}
        </p>
      )}
    </div>
  );
}

export type Column = { key: string; head: string; align?: "left" | "right" };
export type Row = Record<string, React.ReactNode> & { key: string; href?: string };

export function DataTable({
  columns,
  rows,
  caption,
}: {
  columns: Column[];
  rows: Row[];
  caption: string;
}) {
  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full border-collapse text-left text-[14.5px]">
          <thead>
            <tr className="border-b border-line bg-bone">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted ${
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
              <tr key={row.key} className="border-b border-line last:border-0">
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 tabular-nums ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${i === 0 ? "font-medium text-ink" : "text-soft"}`}
                  >
                    {i === 0 && row.href ? (
                      <Link
                        href={row.href}
                        className="underline decoration-line decoration-2 underline-offset-2 hover:decoration-orange"
                      >
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
      <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

/** How a number was produced. Stated on the page, never left implicit. */
export function Method({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-10 rounded-2xl border border-line bg-bone p-6">
      <p className="eyebrow text-ink">How this was measured</p>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-soft">
        {children}
      </div>
    </aside>
  );
}

/** Descriptive internal links, kept close to the claim they support. */
export function Related({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-2.5">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
