import type { Metadata } from "next";
import UtilityHero from "@/components/UtilityHero";
import Reveal from "@/components/Reveal";
import { TOOLS, getTool } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tools for Studying and Building the Web",
  description:
    "A connected set of free, no-signup design tools — find, transform, build, preview, test and interpolate colour. Everything runs in your browser.",
};

type Job = {
  job: string;
  slug: string | null;
  soon?: { name: string; tagline: string; swatches: string[] };
};

const JOBS: Job[] = [
  { job: "Find", slug: "chromary" },
  { job: "Transform", slug: "colorhyme" },
  { job: "Build", slug: "webpalette" },
  { job: "Preview", slug: "mockupalettes" },
  { job: "Interpolate", slug: "truegradient" },
  {
    job: "Test",
    slug: null,
    soon: { name: "Palette Checker", tagline: "Role & contrast testing", swatches: ["#F4F4F5", "#0E0E10", "#FF6112", "#8B8B92"] },
  },
];

export default function ToolsPage() {
  return (
    <>
      <UtilityHero
        eyebrow="Tools"
        title="Tools for studying and building the web."
        intro="Six focused tools, one design language. Each owns a single job. Free, no signup, everything runs in your browser."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Tools" }]}
      />

      <section className="relative overflow-hidden py-12 sm:py-16">
        <span className="aura" aria-hidden />
        <div className="wrap relative">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {JOBS.map((j, i) => {
              const tool = j.slug ? getTool(j.slug) : undefined;
              const live = Boolean(tool);
              const name = tool?.name ?? j.soon!.name;
              const tagline = tool?.tagline ?? j.soon!.tagline;
              const desc = tool?.desc ?? "In progress — coming soon.";
              const swatches = tool?.swatches ?? j.soon!.swatches;

              const card = (
                <div
                  className={`glass-card group flex h-full flex-col overflow-hidden ${live ? "hover:-translate-y-1" : "opacity-70"}`}
                >
                  {/* colour cover */}
                  <div className="relative flex h-32 overflow-hidden">
                    {swatches.map((s) => (
                      <span
                        key={s}
                        className="flex-1 transition-transform duration-500 group-hover:scale-y-105"
                        style={{ backgroundColor: s }}
                      />
                    ))}
                    <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-ink shadow-sm backdrop-blur">
                      {j.job}
                    </span>
                    <span
                      className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10.5px] font-medium ${live ? "bg-orange text-white" : "bg-white/85 text-muted"}`}
                    >
                      {live ? "Live" : "Soon"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-medium tracking-tight">{name}</h2>
                    <p className="mt-0.5 text-[13px] text-muted">{tagline}</p>
                    <p className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
                      {desc}
                    </p>
                    {live && (
                      <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
                        Open tool
                        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                      </span>
                    )}
                  </div>
                </div>
              );

              return (
                <Reveal key={j.job} delay={(i % 3) * 70} className="h-full">
                  {live ? (
                    <a href={`/tools/${j.slug}`} className="block h-full">
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </div>

          <p className="mx-auto mt-16 max-w-2xl text-center text-pretty text-lg leading-relaxed text-soft">
            Not free SEO widgets — a connected set of design instruments that share a
            shell, so a colour can travel from one to the next without leaving the
            language.
          </p>
        </div>
      </section>
    </>
  );
}
