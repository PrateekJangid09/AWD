import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { pageJsonLd, pageMeta } from "@/lib/seo";

const title = "Submit a Site";
const description =
  "Submit a website for review. Every submission is checked against our editorial guidelines.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/submit",
});

export default function SubmitPage() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          name: title,
          description,
          path: "/submit",
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Submit", path: "/submit" },
          ],
        })}
      />
      <UtilityHero
        eyebrow="CONTRIBUTE"
        title="Submit a site to the archive."
        intro="Found a website worth studying? Send it over. Every submission is reviewed against our editorial guidelines — submission doesn't guarantee inclusion."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Submit" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6 sm:p-8">
            <p className="eyebrow">Submit a site</p>
            <form
              action="mailto:hello@allwebsites.design"
              method="post"
              encType="text/plain"
              className="mt-6 space-y-5"
              aria-label="Submit a site"
            >
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Website URL
                </span>
                <input
                  name="Website URL"
                  type="url"
                  required
                  placeholder="https://"
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Your email
                </span>
                <input
                  name="From"
                  type="email"
                  required
                  placeholder="you@studio.com"
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Why it belongs <span className="text-ink/30">(optional)</span>
                </span>
                <textarea
                  name="Why it belongs"
                  rows={4}
                  className="mt-2 w-full resize-y border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                />
              </label>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Submit for review →
              </button>
              <p className="text-[11px] leading-relaxed text-muted">
                Opens your email client to send the submission. We verify the
                destination, review its reference value, then classify and publish
                accepted sites.
              </p>
            </form>
          </div>

          <div className="rounded-xl border border-line bg-ink p-6 text-paper sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-widest text-orange">
              What we look for
            </p>
            <ul className="mt-5 space-y-4">
              {[
                "A real, reachable official destination",
                "A usable design capture",
                "Enough visual or structural reference value",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-paper/80">
                  <span className="font-mono text-orange">→</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-paper/60">
              We exclude hidden, placeholder, duplicate and platform-hosted records.
              Read the full{" "}
              <Link href="/editorial-guidelines" className="text-orange underline decoration-2 underline-offset-2">
                editorial guidelines
              </Link>
              {" "}or browse the{" "}
              <Link href="/archive" className="text-orange underline decoration-2 underline-offset-2">
                archive
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
      <ExploreMore except={["/submit"]} />
    </>
  );
}
