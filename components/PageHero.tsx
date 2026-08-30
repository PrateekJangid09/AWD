import Breadcrumb from "./Breadcrumb";

export default function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  meta,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  breadcrumb?: { href?: string; label: string }[];
  meta?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <span className="aura" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div className="wrap relative py-16 sm:py-24">
        {breadcrumb && (
          <div className="mb-10">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        <p className="eyebrow text-ink">{eyebrow}</p>
        <h1 className="mega mt-6 max-w-5xl text-balance text-5xl sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-soft">
            {intro}
          </p>
        )}
        {meta && (
          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">
            {meta}
          </p>
        )}
      </div>
    </section>
  );
}
