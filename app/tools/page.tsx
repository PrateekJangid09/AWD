import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { getTool } from "@/lib/data";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Free Website Colour Tools";
const description =
  "Free colour tools with no signup: find a colour name, build a harmony, generate a website palette, preview it on a mockup, and make OKLCH gradients.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/tools",
});

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
      <JsonLd
        data={collectionPageGraph({
          path: "/tools",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Tools" },
          ],
          listName: "Free design tools",
          items: JOBS.flatMap((job) => {
            const tool = job.slug ? getTool(job.slug) : undefined;
            if (!tool) return [];
            return [{ name: tool.name, url: absUrl(`/tools/${tool.slug}`) }];
          }),
        })}
      />
      <UtilityHero
        eyebrow="Tools"
        title="Free website colour tools."
        intro="Five focused colour tools that share one design language. Each owns a single job: find a colour name, build a harmony, generate a website palette, preview it on a mockup, or interpolate an OKLCH gradient. They are free, need no signup, and run entirely in your browser."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Tools" }]}
      />

      <section className="py-16 sm:py-24">
        <div className="wrap">
          <ol className="border-t border-ink">
            {JOBS.map((j, i) => {
              const tool = j.slug ? getTool(j.slug) : undefined;
              const name = tool?.name ?? j.soon!.name;
              const tagline = tool?.tagline ?? j.soon!.tagline;
              const desc = tool?.desc ?? "In progress. Not available yet.";
              return (
                <Reveal as="li" key={j.job} className="border-b border-line">
                  <div className="grid gap-8 py-12 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-16">
                    <div className="lg:col-span-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {String(i + 1).padStart(2, "0")} · {j.job}
                      </p>
                      <h2 className="display mt-4 text-[44px] sm:text-[56px]">{name}</h2>
                      <p className="mt-2 text-[17px] font-medium text-ink">{tagline}</p>
                      <p className="mt-4 max-w-[48ch] text-pretty text-[16px] leading-relaxed text-soft">
                        {desc}
                      </p>
                      {tool ? (
                        <>
                          <p className="mt-5 text-[13px] text-muted">{tool.tags.join(" · ")}</p>
                          <a href={`/tools/${tool.slug}`} className="btn-primary mt-7">
                            Open {tool.name}
                          </a>
                        </>
                      ) : (
                        <p className="mt-6 inline-block rounded-[6px] border border-line px-3 py-1.5 text-[13px] text-muted">
                          In progress
                        </p>
                      )}
                    </div>
                    <div className={`lg:col-span-7 ${i % 2 ? "lg:order-first" : ""}`}>
                      {tool ? (
                        <a
                          href={`/tools/${tool.slug}`}
                          className={`group block bg-paper-light p-1.5 ring-1 ring-ink/10 ${["rotate-[1deg]", "rotate-[-1.2deg]", "rotate-[0.6deg]", "rotate-[-0.8deg]", "rotate-[1.4deg]"][i % 5]}`}
                          aria-label={`Open ${tool.name}`}
                        >
                          <span className="shot block aspect-[16/10] transition-colors duration-150 group-hover:border-orange">
                            <Image
                              src={`/tools/previews/${tool.slug}.webp`}
                              alt={`${tool.name} interface: ${tool.tagline}`}
                              fill
                              priority={i === 0}
                              sizes="(max-width: 1024px) 100vw, 55vw"
                              className="object-cover object-top"
                            />
                          </span>
                        </a>
                      ) : (
                        <div className="shot grid aspect-[16/10] place-items-center">
                          <div className="flex h-16 w-64 overflow-hidden rounded-[4px] border border-ink/20">
                            {j.soon!.swatches.map((sw) => (
                              <span key={sw} className="flex-1" style={{ backgroundColor: sw }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>

          <div className="mt-16 grid gap-8 lg:grid-cols-12">
            <h2 className="display text-[36px] sm:text-[44px] lg:col-span-5">Also in Figma</h2>
            <div className="lg:col-span-7">
              <p className="max-w-[60ch] text-pretty text-[16px] leading-relaxed text-soft">
                The tools share one shell, so a colour can travel from name finder to
                harmony to website palette without changing language. The same engines
                ship as Figma plugins: three free uses each, then one payment unlocks the
                suite.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/pricing" className="btn-dark">
                  Figma plugin pricing
                </Link>
                <Link href="/archive" className="btn-ghost">
                  Browse the archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ExploreMore except={["/tools"]} />
    </>
  );
}
