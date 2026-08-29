import type { Metadata } from "next";
import UtilityHero from "@/components/UtilityHero";
import { TOOLS, getTool } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tools for Studying and Building the Web",
  description:
    "A connected set of free, no-signup design tools — find, transform, build, preview, test and interpolate colour. Everything runs in your browser.",
};

type Job = {
  job: string;
  verb: string;
  slug: string | null;
  soon?: { name: string; tagline: string; swatches: string[] };
};

const JOBS: Job[] = [
  { job: "Find", verb: "Find and understand colours.", slug: "chromary" },
  { job: "Transform", verb: "Create controlled related colours from one.", slug: "colorhyme" },
  { job: "Build", verb: "Turn brand colours into a complete system.", slug: "webpalette" },
  { job: "Preview", verb: "See a palette in real interface context.", slug: "mockupalettes" },
  { job: "Interpolate", verb: "Control the space between gradient stops.", slug: "truegradient" },
  {
    job: "Test",
    verb: "Check role behaviour, contrast and usability.",
    slug: null,
    soon: { name: "Palette Checker", tagline: "Role & contrast testing", swatches: ["#F4F2EC", "#141414", "#FF6112", "#6B6660"] },
  },
];

export default function ToolsPage() {
  return (
    <>
      <UtilityHero
        title="Tools for studying and building the web."
        intro="Six focused tools, one design language. Each owns a single job — find, transform, build, preview, test or interpolate. Free, no signup, everything runs in your browser."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Tools" }]}
      />

      <section>
        <div className="wrap">
          {JOBS.map((j, i) => {
            const tool = j.slug ? getTool(j.slug) : undefined;
            const live = Boolean(tool);
            const name = tool?.name ?? j.soon!.name;
            const tagline = tool?.tagline ?? j.soon!.tagline;
            const swatches = tool?.swatches ?? j.soon!.swatches;

            const inner = (
              <div className="grid items-center gap-6 py-10 sm:py-12 lg:grid-cols-[minmax(0,0.9fr)_1fr_auto] lg:gap-10">
                {/* Job label */}
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[12px] text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-3xl uppercase tracking-tight sm:text-5xl">
                    {j.job}
                  </span>
                </div>

                {/* Tool + verb */}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight">{name}</h2>
                    <span
                      className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${live ? "text-orange" : "text-muted"}`}
                    >
                      {live ? "● Live" : "Soon"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-pretty text-[15px] leading-relaxed text-soft">
                    {j.verb}{" "}
                    <span className="text-muted">{tagline}.</span>
                  </p>
                </div>

                {/* Swatches + action */}
                <div className="flex items-center gap-5">
                  <span className="hidden h-10 w-28 overflow-hidden border border-line sm:flex">
                    {swatches.map((s) => (
                      <span key={s} className="flex-1" style={{ backgroundColor: s }} />
                    ))}
                  </span>
                  {live ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors group-hover:text-orange">
                      Open
                      <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                    </span>
                  ) : (
                    <span className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                      In progress
                    </span>
                  )}
                </div>
              </div>
            );

            return live ? (
              <a
                key={j.job}
                href={`/tools/${j.slug}`}
                className="group block border-t border-line transition-colors last:border-b hover:bg-bone"
              >
                {inner}
              </a>
            ) : (
              <div key={j.job} className="border-t border-line opacity-60 last:border-b">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* One system note */}
      <section className="border-t border-line bg-ink py-16 text-paper sm:py-20">
        <div className="wrap max-w-3xl">
          <p className="eyebrow text-white/90">One system</p>
          <p className="mt-6 text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            Not free SEO widgets — a connected set of design instruments that share a
            shell, so a colour can travel from{" "}
            <span className="text-orange">find</span> to{" "}
            <span className="text-orange">build</span> without leaving the language.
          </p>
        </div>
      </section>
    </>
  );
}
