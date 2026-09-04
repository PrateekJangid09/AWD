import Breadcrumb from "./Breadcrumb";

// Very compact hero for legal / policy documents (Privacy, Terms, Editorial
// Guidelines, Cookies). Breadcrumb + small title + short description + last
// updated. No Anton, no oversized display.
export default function DocumentHero({
  title,
  description,
  updated,
  breadcrumb,
}: {
  title: string;
  description?: string;
  updated?: string;
  breadcrumb: { href?: string; label: string }[];
}) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="wrap py-8 sm:py-10">
        <Breadcrumb items={breadcrumb} />
        <h1 className="display mt-5 text-2xl sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-soft">
            {description}
          </p>
        )}
        {updated && (
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
            Last updated · {updated}
          </p>
        )}
      </div>
    </section>
  );
}
