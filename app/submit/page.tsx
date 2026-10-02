import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Submit a Site";
const description =
  "Nominate a website for the archive. Every submission is checked against our editorial guidelines, then studied for palette, typography and detected technology.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/submit",
});

export default function SubmitPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/submit",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Submit" },
          ],
        })}
      />
      <UtilityHero
        eyebrow="Found something worth saving?"
        title="Submit a website to the archive."
        intro="Send us a real, live website that is worth studying for its layout, colour or type. Every submission is reviewed against the editorial guidelines, and if it is accepted we capture it and record its palette, typefaces and detected technology. Submitting does not guarantee inclusion."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Submit" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <div className="rounded-[6px] border border-ink bg-surface p-6 sm:p-10">
              <span aria-hidden className="tape -top-3 left-12 rotate-[-3deg]" />
              <h2 className="display text-[34px] sm:text-[40px]">Submit a website</h2>
              <ContactForm
                to={CONTACT_EMAIL}
                defaultReason="Submission"
                websiteLabel="Website URL"
                websiteRequired
                messageLabel="Why it belongs"
                submitLabel="Submit for review"
              />
            </div>
          </div>

          <aside className="lg:col-span-5">
            <h2 className="display text-[34px] sm:text-[40px]">What we look for</h2>
            <ol className="mt-6 border-t border-ink">
              {[
                ["A real, reachable site", "The official destination loads and is not a placeholder or a parked domain."],
                ["A usable capture", "The page renders well enough to screenshot without a login wall or cookie maze."],
                ["Reference value", "Something in the layout, colour, type or structure is worth studying."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[40px_1fr] gap-2 border-b border-line py-5">
                  <span className="font-serif text-[26px] leading-none text-orange-ink">{i + 1}</span>
                  <span>
                    <span className="block text-[16px] font-semibold text-ink">{t}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-soft">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[15px] leading-relaxed text-soft">
              We exclude hidden, placeholder, duplicate and platform-hosted records. Read
              the full{" "}
              <Link href="/editorial-guidelines" className="link-underline font-semibold text-ink">
                editorial guidelines
              </Link>{" "}
              or browse the{" "}
              <Link href="/archive" className="link-underline font-semibold text-ink">
                archive
              </Link>{" "}
              to see what is already in.
            </p>
          </aside>
        </div>
      </section>
      <ExploreMore except={["/submit"]} />
    </>
  );
}
