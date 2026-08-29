import type { Metadata } from "next";
import Link from "next/link";
import UtilityHero from "@/components/UtilityHero";

export const metadata: Metadata = {
  title: "Contact — Corrections & Editorial",
  description:
    "Request a correction, ask about a record, or reach the AllWebsites.Design editorial team.",
};

const REASONS = [
  { t: "Correction", d: "A record is wrong, outdated or miscategorised." },
  { t: "Submission", d: "You want a site reviewed for the archive." },
  { t: "Press / partnership", d: "Media, research or collaboration enquiries." },
  { t: "Something else", d: "General questions about the archive." },
];

export default function ContactPage() {
  return (
    <>
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
            <form
              action="mailto:hello@allwebsites.design"
              method="post"
              encType="text/plain"
              className="mt-6 space-y-5"
              aria-label="Contact form"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Name
                  </span>
                  <input
                    name="Name"
                    type="text"
                    required
                    className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Email
                  </span>
                  <input
                    name="From"
                    type="email"
                    required
                    className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                  />
                </label>
              </div>

              <fieldset>
                <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Reason
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {REASONS.map((r, i) => (
                    <label
                      key={r.t}
                      className="flex cursor-pointer items-start gap-3 border border-ink/15 bg-paper p-3 transition-colors has-[:checked]:border-orange has-[:checked]:bg-orange/10"
                    >
                      <input
                        type="radio"
                        name="reason"
                        defaultChecked={i === 0}
                        className="mt-1 accent-orange"
                      />
                      <span>
                        <span className="block text-sm font-semibold">{r.t}</span>
                        <span className="block text-xs text-ink/60">{r.d}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
                  Website URL <span className="text-ink/30">(optional)</span>
                </span>
                <input
                  name="Website URL"
                  type="url"
                  placeholder="https://"
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Message
                </span>
                <textarea
                  name="Message"
                  required
                  rows={5}
                  className="mt-2 w-full resize-y border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                />
              </label>

              <button type="submit" className="btn-primary w-full sm:w-auto">
                Send message →
              </button>
              <p className="font-mono text-[10px] leading-relaxed text-ink/45">
                By sending, you agree to our{" "}
                <Link href="/privacy-policy" className="underline decoration-orange decoration-2 underline-offset-2">
                  privacy policy
                </Link>
                . We only use your details to respond.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            <div className="rounded-xl border border-line bg-ink p-6 text-paper">
              <p className="eyebrow text-white/90">How we handle it</p>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                Corrections are prioritised. The official site always remains the
                authority for current facts — we update records as they change.
              </p>
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
    </>
  );
}
