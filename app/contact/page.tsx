import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

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
      <PageHero
        eyebrow="CONTACT"
        title="Corrections, questions, and everything editorial."
        intro="Websites change and automated classification isn't perfect. If a record needs fixing — or you just have a question — this reaches the editorial team."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Contact" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Form */}
          <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6 sm:p-8">
            <p className="eyebrow">SEND_A_MESSAGE</p>
            <form action="#" className="mt-6 space-y-5" aria-label="Contact form">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
                    Name
                  </span>
                  <input
                    type="text"
                    required
                    className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                  />
                </label>
              </div>

              <fieldset>
                <legend className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
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
                  type="url"
                  placeholder="https://"
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
                  Message
                </span>
                <textarea
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
                <Link href="/privacy" className="underline decoration-orange decoration-2 underline-offset-2">
                  privacy policy
                </Link>
                . We only use your details to respond.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            <div className="border border-line bg-ink p-6 text-paper">
              <p className="font-mono text-[11px] uppercase tracking-widest text-orange">
                RESPONSE_TIME
              </p>
              <p className="display mt-3 text-3xl text-paper">2–3 days</p>
              <p className="mt-2 text-sm text-paper/60">
                Corrections are prioritised. The official site always remains the
                authority for current facts.
              </p>
            </div>

            <div className="card-brutal hover:!translate-x-0 hover:!translate-y-0 p-6">
              <p className="eyebrow">FASTER_ROUTES</p>
              <ul className="mt-4 space-y-3">
                {[
                  ["Submit a site", "/submit"],
                  ["Editorial guidelines", "/editorial-guidelines"],
                  ["Manifesto", "/manifesto"],
                  ["Cookie preferences", "/cookies"],
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
