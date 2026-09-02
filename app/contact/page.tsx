import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";
import {
  CONTACT_EMAIL,
  ORG_ID,
  SUPPORT_URL,
  absUrl,
  pageMeta,
  typedPageGraph,
} from "@/lib/seo";

const title = "Contact — Corrections & Editorial";
const description =
  "Request a correction, ask about a record, or reach the AllWebsites.Design editorial team.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/contact",
});

const REASONS = [
  { t: "Correction", d: "A record is wrong, outdated or miscategorised." },
  { t: "Submission", d: "You want a site reviewed for the archive." },
  { t: "Press / partnership", d: "Media, research or collaboration enquiries." },
  { t: "Something else", d: "General questions about the archive." },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "ContactPage",
          path: "/contact",
          name: "Contact AllWebsites.Design",
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Contact" },
          ],
          extra: {
            about: { "@id": ORG_ID },
            mainEntity: {
              "@type": "ContactPoint",
              contactType: "editorial",
              email: CONTACT_EMAIL,
              url: absUrl("/contact"),
              availableLanguage: "English",
            },
          },
        })}
      />
      <UtilityHero
        eyebrow="CONTACT"
        title="Corrections, questions, and everything editorial."
        intro="Websites change and automated classification isn't perfect. If a record needs fixing — or you just have a question — this reaches the editorial team."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Contact" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Form */}
          <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6 sm:p-8">
            <p className="eyebrow">Send a message</p>
            <ContactForm
              to={CONTACT_EMAIL}
              reasons={REASONS}
              defaultReason={REASONS[0].t}
              websiteLabel="Website URL"
            />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            <div className="rounded-xl border border-line bg-ink p-6 text-paper">
              <p className="eyebrow text-white/90">How we handle it</p>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                Corrections are prioritised. The official site always remains the
                authority for current facts — we update records as they change.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-paper/70">
                Prefer your own mail client? Write to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-orange underline decoration-2 underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>

            <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6">
              <p className="eyebrow">Support the archive</p>
              <p className="mt-3 text-sm leading-relaxed text-soft">
                Every record and every tool is free. If the archive saved you time,
                a coffee funds the next batch of studies.
              </p>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFDD00] px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] transition-transform hover:-translate-y-0.5"
              >
                <span aria-hidden>☕</span>
                Buy me a coffee
              </a>
            </div>

            <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6">
              <p className="eyebrow">Elsewhere</p>
              <ul className="mt-4 space-y-3">
                {[
                  ["Submit a site", "/submit"],
                  ["Editorial guidelines", "/editorial-guidelines"],
                  ["Manifesto", "/manifesto"],
                  ["Cookie preferences", "/cookie-preference"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center justify-between border-b-2 border-ink/10 pb-3 text-sm font-medium hover:text-orange"
                    >
                      {label}
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <ExploreMore except={["/contact"]} />
    </>
  );
}
