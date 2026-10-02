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
  "Request a correction to a record, ask how a website was classified, or reach the AllWebsites.Design editorial team directly. We answer every corrections email.";

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
          <div className="rounded-[6px] border border-ink bg-surface p-6 sm:p-10">
            <h2 className="display text-[34px] sm:text-[40px]">Send a message</h2>
            <ContactForm
              to={CONTACT_EMAIL}
              reasons={REASONS}
              defaultReason={REASONS[0].t}
              websiteLabel="Website URL"
            />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            <div className="border-t border-ink pt-6">
              <p className="eyebrow text-ink">How we handle it</p>
              <p className="mt-3 text-[15px] leading-relaxed text-soft">
                Corrections are prioritised. The official site always remains the
                authority for current facts — we update records as they change.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-soft">
                Prefer your own mail client? Write to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="link-underline font-semibold text-ink"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>

            <div className="border-t border-line pt-6">
              <p className="eyebrow text-ink">Support the archive</p>
              <p className="mt-3 text-[15px] leading-relaxed text-soft">
                Every record and every tool is free. If the archive saved you time,
                a coffee funds the next batch of studies.
              </p>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-4"
              >
                Buy me a coffee
              </a>
            </div>

            <div className="border-t border-line pt-6">
              <p className="eyebrow text-ink">Elsewhere</p>
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
                      className="index-row !py-3 text-[15px] font-medium text-ink"
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
