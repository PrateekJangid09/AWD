import Breadcrumb from "./Breadcrumb";

// Compact, functional hero for product surfaces (Archive, Categories, Tools,
// Submit, Contact). Archivo heading — NOT Anton — to get users in fast.
export default function UtilityHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  meta,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  breadcrumb?: { href?: string; label: string }[];
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <span className="aura" aria-hidden />
      <div className="wrap relative py-10 sm:py-12">
        {breadcrumb && (
          <div className="mb-6">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        {eyebrow && <p className="eyebrow text-ink">{eyebrow}</p>}
        <h1 className="display mt-4 max-w-4xl text-balance text-3xl sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-soft">
            {intro}
          </p>
        )}
        {meta && (
          <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-muted">
            {meta}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
