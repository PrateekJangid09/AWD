import Breadcrumb from "./Breadcrumb";

// Compact hero for product surfaces (Archive, Categories, Tools, Submit,
// Contact). Editorial serif headline, then straight into the content.
export default function UtilityHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  meta,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  breadcrumb?: { href?: string; label: string }[];
  meta?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative border-b border-line">
      <div className="wrap relative pb-12 pt-8 sm:pb-16 sm:pt-10">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div className={aside ? "grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-end" : ""}>
          <div className="mt-10 sm:mt-14">
            {eyebrow && (
              <div className="anim-up" style={{ animationDelay: "0ms" }}>
                <p className="eyebrow text-ink">{eyebrow}</p>
              </div>
            )}
            <div className="anim-up" style={{ animationDelay: "70ms" }}>
              <h1 className="mega mt-5 max-w-[16ch] text-balance text-[48px] sm:text-[68px] lg:text-[80px]">
                {title}
              </h1>
            </div>
            {intro && (
              <div className="anim-up" style={{ animationDelay: "140ms" }}>
                <p className="mt-6 max-w-[62ch] text-pretty text-[17px] leading-[1.55] text-soft sm:text-[18px]">
                  {intro}
                </p>
              </div>
            )}
            {meta && (
              <div className="anim-up" style={{ animationDelay: "210ms" }}>
                <p className="mt-6 text-[13px] font-medium text-muted">{meta}</p>
              </div>
            )}
            {children && <div className="anim-up" style={{ animationDelay: "280ms" }}>{children}</div>}
          </div>
          {aside && <div className="hidden lg:block">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
