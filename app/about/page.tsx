import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { CANONICAL, DATASET, liveCategories } from "@/lib/canonical";
import { ORG_ID, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "About the Design Research Archive";
const description =
  "AllWebsites.Design is an independent website design research archive. How the archive, intelligence engine and workflow layer reinforce each other.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/about",
});

const PRINCIPLES = [
  {
    n: "01",
    t: "Useful inspiration needs context",
    d: "A design archive should help you compare decisions — not manufacture facts or disguise unfinished products.",
  },
  {
    n: "02",
    t: "Honest blanks over fabricated certainty",
    d: "When a signal can't be measured, we say so. Detected, likely, or unknown — never invented.",
  },
  {
    n: "03",
    t: "The source is always the authority",
    d: "We preserve official links and keep public counts tied to a single source of truth. Sites change; we point you home.",
  },
  {
    n: "04",
    t: "A constructed record, never a raw row",
    d: "Every public profile is deliberately assembled. Proprietary evidence stays internal; you get the useful part.",
  },
];

export default function AboutPage() {
  const total = CANONICAL.length;
  const cats = liveCategories().filter((c) => c.count > 0).length;
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "AboutPage",
          path: "/about",
          name: "About AllWebsites.Design",
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "About" },
          ],
          extra: {
            about: { "@id": ORG_ID },
          },
        })}
      />
      <PageHero
        eyebrow="About"
        title="A design-research layer for the public web."
        intro="Not another inspiration gallery. AllWebsites.Design is a structured, cleaned, governed archive of how real websites are actually designed — built for the people building the web."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "About" }]}
      />

      {/* Positioning */}
      <section className="border-b border-ink py-16 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">The short version</p>
            <p className="mt-5 text-balance font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
              We help designers, developers and founders{" "}
              <span className="text-orange">discover, compare and study</span>{" "}
              real website design — backed by an engine that reads design, taxonomy,
              technology and typography from the source.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              [total.toLocaleString(), "Curated references"],
              [cats.toString(), "Governed categories"],
              ["17", "Data points per record"],
              ["2026", "Design Index published"],
            ].map(([k, v]) => (
              <div key={v} className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-5">
                <div className="display text-4xl text-orange">{k}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink/55">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three layers */}
      <section className="border-b border-ink bg-ink py-16 text-paper sm:py-20">
        <div className="wrap">
          <p className="eyebrow">Three layers</p>
          <h2 className="display mt-3 max-w-2xl text-4xl text-paper sm:text-5xl">
            Archive → Intelligence → Workflow.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                t: "The Archive",
                d: `A public, curated, searchable and crawlable corpus of ${total.toLocaleString()} website-design references across ${cats} categories.`,
                tags: ["Curated", "Deduplicated", "Crawlable"],
              },
              {
                t: "The Intelligence",
                d: "A private modular engine that extracts identity, taxonomy, design tokens, typography, technology and more — with evidence and confidence.",
                tags: ["Palette", "Type", "Tech"],
              },
              {
                t: "The Workflow",
                d: "Free colour tools, Similar Aesthetics, the 2026 Design Index and public corrections turn browsing into a repeat utility.",
                tags: ["Tools", "Research", "Corrections"],
              },
            ].map((c, i) => (
              <Reveal
                key={c.t}
                delay={i * 90}
                className="border border-paper/20 bg-paper/[0.04] p-6"
              >
                <h3 className="display text-2xl text-paper">{c.t}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-paper/60">
                  {c.d}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-paper/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 sm:py-20">
        <div className="wrap">
          <p className="eyebrow">What we believe</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl">What we believe.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <Reveal key={p.n} className="card-brutal hover:!translate-x-0 hover:!translate-y-0 flex gap-5 p-6">
                <span className="display shrink-0 text-3xl text-orange">{p.n}</span>
                <div>
                  <h3 className="display text-xl">{p.t}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-ink/70">
                    {p.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="method" className="scroll-mt-24 border-t border-line bg-bone py-16 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Methodology</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">
              How a record is built.
            </h2>
            <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-soft">
              Every published study is assembled from the live site, then reviewed
              before it appears. Nothing is inferred to fill a gap.
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-muted">
              Dataset {DATASET.method} · first published {DATASET.publishedAt} · last
              updated {DATASET.updatedAt}
            </p>
          </div>
          <ol className="space-y-4">
            {[
              [
                "Capture",
                "The live homepage and key pages are captured full-page, so the screenshot is evidence rather than decoration.",
              ],
              [
                "Extract",
                "Colour palette, typefaces and technology signals are read from the rendered page and its response headers.",
              ],
              [
                "Classify",
                "Category, website type and audience are assigned automatically and carry a confidence score you can see on the record.",
              ],
              [
                "Review",
                "Records are checked against the editorial guidelines. Anything that cannot be verified stays marked as not detected.",
              ],
            ].map(([step, detail], i) => (
              <li key={step} className="flex gap-4 rounded-2xl border border-line bg-paper p-5">
                <span className="font-mono text-[13px] text-orange">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold tracking-tight">{step}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-soft">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="wrap mt-8 flex flex-wrap gap-3">
          <Link href="/editorial-guidelines" className="btn-ghost">
            Editorial guidelines
          </Link>
          <Link href="/research/website-design-index-2026" className="btn-ghost">
            2026 Design Index
          </Link>
          <Link href="/site-map" className="btn-ghost">
            Site map
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink bg-orange py-16 text-white sm:py-20">
        <div className="wrap flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="display text-4xl text-white sm:text-5xl">
              Build the archive with us.
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-lg text-white/90">
              Submit a site, request a correction, or just start exploring{" "}
              {total.toLocaleString()} references.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/submit" className="btn bg-ink px-6 py-3.5 text-white shadow-[6px_6px_0_0_#0A0A0A]">
              Submit a site
            </Link>
            <Link href="/archive" className="btn bg-white px-6 py-3.5 text-ink shadow-[6px_6px_0_0_#0A0A0A]">
              Explore archive
            </Link>
          </div>
        </div>
      </section>
      <ExploreMore except={["/about"]} />
    </>
  );
}
