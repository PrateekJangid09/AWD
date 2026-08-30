import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { getTool } from "@/lib/data";
import { absUrl, collectionPageGraph, pageMeta } from "@/lib/seo";

const title = "Tools for Studying and Building the Web";
const description =
  "A connected set of free, no-signup design tools — find, transform, build, preview, test and interpolate colour. Everything runs in your browser.";

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
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bone">
                    {live ? (
                      <Image
                        src={`/tools/previews/${j.slug}.webp`}
                        alt={`${name} — ${tagline}`}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full">
                        {swatches.map((s) => (
                          <span key={s} className="flex-1" style={{ backgroundColor: s }} />
                        ))}
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
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
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/archive" className="btn-ghost">
              Browse the archive
            </Link>
            <Link href="/c" className="btn-ghost">
              Explore categories
            </Link>
          </div>
        </div>
      </section>
      <ExploreMore except={["/tools"]} />
    </>
  );
}
