import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { TOOLS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Free Color & Design Tools",
  description:
    "A growing suite of free, no-signup design tools from AllWebsites.design — color transformation, palette preview and a color dictionary. Runs in your browser.",
};

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Design Tools"
        title="Tools for people who sweat the details."
        intro="A growing suite of free, no-signup tools built alongside the archive. Everything runs locally in your browser — paste a colour, get to work."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Tools" }]}
        meta="No signup · Runs locally · Copy-ready output"
      />

      <section className="py-16 sm:py-24">
        <div className="wrap grid gap-6 md:grid-cols-2">
          {TOOLS.map((tool, i) => {
            const live = tool.status !== "soon";
            const Card = (
              <div
                className={`group relative flex h-full flex-col justify-between border border-line bg-paper p-7 transition-all duration-300 sm:p-8 ${
                  live ? "hover:-translate-y-1 hover:border-line-strong hover:shadow-soft" : "opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${live ? "text-orange" : "text-muted"}`}
                      >
                        {live ? "● Live" : "Soon"}
                      </span>
                    </div>
                    {live && (
                      <span
                        className="text-lg text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange"
                        aria-hidden
                      >
                        ↗
                      </span>
                    )}
                  </div>

                  <h2 className="mega mt-5 text-4xl sm:text-5xl">{tool.name}</h2>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted">
                    {tool.tagline}
                  </p>
                  <p className="mt-4 max-w-md text-pretty text-[14.5px] leading-relaxed text-soft">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-8">
                  <div className="flex h-9 overflow-hidden border border-line">
                    {tool.swatches.map((c) => (
                      <span key={c} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {tool.tags.map((t) => (
                        <span key={t} className="text-[11px] uppercase tracking-[0.1em] text-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                    {live && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                        Open tool →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <Reveal key={tool.name} delay={(i % 2) * 80} className="h-full">
                {live ? (
                  <a href={`/tools/${tool.slug}`} className="block h-full">
                    {Card}
                  </a>
                ) : (
                  Card
                )}
              </Reveal>
            );
          })}
        </div>

        {/* strip */}
        <div className="wrap mt-16">
          <div className="flex flex-col items-center gap-4 border-t border-line pt-12 text-center">
            <p className="eyebrow text-ink">Built for the archive</p>
            <h3 className="mega max-w-2xl text-3xl sm:text-4xl">
              Same taste, every tool.
            </h3>
            <p className="max-w-xl text-pretty text-soft">
              Each tool shares the design language of the archive — restrained,
              precise and free. More are on the way.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
