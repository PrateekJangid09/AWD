import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Terms & Conditions";
const description =
  "The terms governing use of the AllWebsites.Design archive and tools, including third-party brand ownership, accuracy limits and how our records may be cited.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/terms",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Terms" },
          ],
        })}
      />
      <DocumentHero
        title="Terms & Conditions"
        description="The terms that govern use of the archive, including third-party ownership and accuracy limitations."
        updated="11 August 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Terms" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["purpose", "Archive purpose"],
                ["permitted", "Permitted use"],
                ["prohibited", "Prohibited use"],
                ["ownership", "Third-party ownership"],
                ["accuracy", "Accuracy limitation"],
                ["law", "Governing law"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-ink/60 hover:text-orange">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <article className="prose max-w-2xl">
            <p>
              By using AllWebsites.Design you agree to these terms. They exist to keep
              the archive useful, honest and fair to the third parties whose work it
              references.
            </p>

            <h2 id="purpose">Archive purpose</h2>
            <p>
              AllWebsites.Design is provided for design research and inspiration. It is
              a reference layer — not the authoritative source for any third-party
              company represented within it.
            </p>

            <h2 id="permitted">Permitted use</h2>
            <ul>
              <li>Browse the archive and follow source links</li>
              <li>Use references to inform your own original design work</li>
            </ul>

            <h2 id="prohibited">Prohibited use</h2>
            <ul>
              <li>Misusing or disrupting the service</li>
              <li>Harmful scraping behaviour</li>
              <li>Claiming third-party work as your own</li>
            </ul>

            <h2 id="ownership">Third-party ownership</h2>
            <ul>
              <li>Third-party names remain the property of their owners</li>
              <li>Screenshots remain connected to their original websites</li>
              <li>Trademarks remain the property of their owners</li>
              <li>Inclusion does not imply endorsement or transfer any rights</li>
            </ul>

            <h2 id="accuracy">Accuracy limitation</h2>
            <p>
              The catalogue can become outdated and automated classification can be
              imperfect. Always treat the official website as the authority for current
              facts. You can request a correction via our{" "}
              <Link href="/contact">contact page</Link>.
            </p>

            <h2 id="law">Governing law</h2>
            <p>
              These terms are provided in good faith. Where verified operator details
              have not been published, we deliberately avoid asserting a specific legal
              entity or jurisdiction. This section will be updated as those details are
              formalised.
            </p>
          </article>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}
