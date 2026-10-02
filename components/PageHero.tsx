import Breadcrumb from "./Breadcrumb";

export default function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  meta,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  breadcrumb?: { href?: string; label: string }[];
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative border-b border-line">
      <div className="wrap relative pb-16 pt-8 sm:pb-24 sm:pt-10">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div className="mt-12 sm:mt-20">
          <div className="anim-up" style={{ animationDelay: "0ms" }}>
            <p className="eyebrow text-ink">{eyebrow}</p>
          </div>
          <div className="anim-up" style={{ animationDelay: "70ms" }}>
            <h1 className="mega mt-6 max-w-[15ch] text-balance text-[52px] sm:text-[80px] lg:text-[104px]">
              {title}
            </h1>
          </div>
          {intro && (
            <div className="anim-up" style={{ animationDelay: "140ms" }}>
              <p className="mt-8 max-w-[60ch] text-pretty text-[18px] leading-[1.55] text-soft sm:text-[20px]">
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
      </div>
    </section>
  );
}
