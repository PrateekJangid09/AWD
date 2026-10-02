import Breadcrumb from "./Breadcrumb";

// Compact hero for legal and policy documents. Breadcrumb, title, short
// description, last updated. Quiet on purpose.
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
    <section className="border-b border-line">
      <div className="wrap anim-up pb-10 pt-8 sm:pb-12">
        <Breadcrumb items={breadcrumb} />
        <h1 className="display mt-10 text-[44px] sm:text-[60px]">{title}</h1>
        {description && (
          <p className="mt-4 max-w-[62ch] text-pretty text-[16px] leading-relaxed text-soft">
            {description}
          </p>
        )}
        {updated && <p className="mt-5 text-[13px] font-medium text-muted">Last updated {updated}</p>}
      </div>
    </section>
  );
}
