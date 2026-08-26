import Link from "next/link";

export default function StatusPage({
  code,
  tag,
  title,
  message,
  actions,
  accent = "#FF6112",
}: {
  code: string;
  tag: string;
  title: string;
  message: string;
  actions: { href: string; label: string; primary?: boolean }[];
  accent?: string;
}) {
  return (
    <section className="relative flex min-h-[82vh] items-center overflow-hidden bg-paper">
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div className="wrap relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center text-ink">{tag}</p>

          <h1
            className="mega mt-8 text-[34vw] leading-[0.8] sm:text-[15rem]"
            style={{ color: accent }}
          >
            {code}
          </h1>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-soft">
            {message}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={a.primary ? "btn-primary" : "btn-ghost"}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
