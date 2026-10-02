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
        title="We study how real websites are designed."
        intro={`AllWebsites.Design is an independent archive of ${total.toLocaleString()} real websites across ${cats} categories. Each record pairs a full-page screenshot with the colour palette, typefaces and technology we could verify from the live site, and free colour tools help you put what you learn to work.`}
        breadcrumb={[{ href: "/", label: "Home" }, { label: "About" }]}
      />

      {/* What it is */}
      <section className="py-20 sm:py-28">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="font-serif text-[34px] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[44px]">
              A gallery shows you a screenshot. A record tells you what made it: the
              colours, the type, the stack, and where the page lives.
            </p>
          </Reveal>
          <dl className="border-t border-ink lg:col-span-5 lg:col-start-8">
            {[
              ["The archive", `${total.toLocaleString()} published records in ${cats} categories, searchable and crawlable.`, "/archive"],
              ["Each record", "Homepage capture, key pages where available, palette roles, typefaces, detected technology and provenance.", "/archive/linear"],
              ["The tools", "Five browser colour tools, free and without signup. The same engines ship as Figma plugins.", "/tools"],
              ["The research", "Findings measured from the record set, each with its sample size.", "/blogs"],
            ].map(([k, v, href]) => (
              <div key={k} className="border-b border-line py-5">
                <dt>
                  <Link href={href} className="link-underline text-[17px] font-semibold text-ink">
                    {k}
                  </Link>
                </dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-soft">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-line py-20 sm:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ink">Principles</p>
            <h2 className="display mt-5 text-[42px] sm:text-[56px]">What we hold to.</h2>
          </div>
          <ol className="border-t border-ink lg:col-span-8">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 60} className="grid gap-3 border-b border-line py-7 sm:grid-cols-[64px_1fr]">
                <span className="font-serif text-[32px] leading-none text-orange-ink">{p.n}</span>
                <div>
                  <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">{p.t}</h3>
                  <p className="mt-2 max-w-[60ch] text-pretty text-[16px] leading-relaxed text-soft">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Methodology */}
      <section id="method" className="scroll-mt-24 border-t border-line bg-bone/70 py-20 sm:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ink">Methodology</p>
            <h2 className="display mt-5 text-[42px] sm:text-[56px]">How a record is built.</h2>
            <p className="mt-5 max-w-[40ch] text-[16px] leading-relaxed text-soft">
              Every published study is assembled from the live site, then reviewed before
              it appears. Nothing is inferred to fill a gap.
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-muted">
              Dataset {DATASET.method} · first published {DATASET.publishedAt} · last updated{" "}
              {DATASET.updatedAt}
            </p>
          </div>
          <ol className="grid gap-x-10 border-t border-ink sm:grid-cols-2 lg:col-span-8">
            {[
              ["Capture", "The live homepage and key pages are captured full-page, so the screenshot is evidence rather than decoration."],
              ["Extract", "Colour palette, typefaces and technology signals are read from the rendered page and its response headers."],
              ["Classify", "Category, website type and audience are assigned automatically and carry a confidence score you can see on the record."],
              ["Review", "Records are checked against the editorial guidelines. Anything that cannot be verified stays marked as not detected."],
            ].map(([step, detail], i) => (
              <li key={step} className="border-b border-line py-7">
                <span className="text-[13px] font-semibold tabular-nums text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-serif text-[30px] leading-none text-ink">{step}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-soft">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="wrap mt-12 flex flex-wrap gap-3">
          <Link href="/editorial-guidelines" className="btn-ghost">
            Editorial guidelines
          </Link>
          <Link href="/research/website-design-index-2026" className="btn-ghost">
            2026 Design Index
          </Link>
          <Link href="/manifesto" className="btn-ghost">
            Manifesto
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line py-20 sm:py-28">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[44px] sm:text-[64px] lg:col-span-7">Help build the archive.</h2>
          <div className="lg:col-span-5">
            <p className="text-[16px] leading-relaxed text-soft">
              Submit a site, request a correction, or start browsing{" "}
              {total.toLocaleString()} records.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/submit" className="btn-primary">
                Submit a website
              </Link>
              <Link href="/archive" className="btn-ghost">
                Browse the archive
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ExploreMore except={["/about"]} />
    </>
  );
}
