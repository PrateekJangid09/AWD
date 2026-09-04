import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PolicyNav from "@/components/PolicyNav";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Privacy Policy";
const description =
  "Privacy policy for AllWebsites.Design: analytics, contact messages, Figma plugin usage, Paddle billing, and the choices you can make about that data.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/privacy-policy",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Privacy" },
          ],
        })}
      />
      <DocumentHero
        title="Privacy Policy"
        description="What AllWebsites.Design collects, why, who processes it, and how to ask for a copy or a deletion."
        updated="4 September 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Privacy" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["who", "Who we are"],
                ["what-we-collect", "What we collect"],
                ["how-we-use-it", "How we use it"],
                ["payments", "Payments"],
                ["processors", "Service providers"],
                ["your-controls", "Your controls"],
                ["contact", "Contact"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-ink/60 hover:text-orange">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <PolicyNav current="/privacy-policy" />
          </aside>

          <article className="prose max-w-2xl">
            <p>
              AllWebsites.Design is an independent website-design research archive and
              a small set of colour tools, including paid Figma plugins. We aim to
              collect as little as possible. This policy explains what we collect,
              why, and the controls you have.
            </p>

            <h2 id="who">Who we are</h2>
            <p>
              Controller: Prateek Jangid, operating AllWebsites.Design as a sole
              proprietor. Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Site:{" "}
              <a href="https://allwebsites.design">https://allwebsites.design</a>.
            </p>

            <h2 id="what-we-collect">What we collect</h2>
            <h3>Automatically</h3>
            <ul>
              <li>Analytics information about how the site is used</li>
              <li>Device and browser information</li>
              <li>IP-related information (including for webhook security)</li>
              <li>Page and performance information</li>
            </ul>
            <h3>When you interact</h3>
            <ul>
              <li>Email address, name, and message content from the contact form</li>
              <li>A website URL and notes if you submit a site</li>
              <li>Figma user id when you run a plugin (not your canvas or files)</li>
              <li>Plugin usage counts (applies, styles, dropped swatches)</li>
              <li>Subscription status and Paddle customer / subscription ids if you pay</li>
            </ul>
            <p>
              We do not collect your Figma file contents. We do not store card numbers.
            </p>

            <h2 id="how-we-use-it">How we use it</h2>
            <ul>
              <li>Operating and improving the archive and tools</li>
              <li>Measuring performance</li>
              <li>Responding to messages and processing submissions</li>
              <li>Newsletter communication you opt into</li>
              <li>Counting Figma plugin free uses and unlocking paid access</li>
              <li>Abuse prevention and legal requirements</li>
            </ul>

            <h2 id="payments">Payments</h2>
            <p>
              Checkout is handled by Paddle as merchant of record. Paddle collects
              the payment details needed to charge you, issue an invoice, and apply
              tax. We receive events such as subscription activated or canceled, plus
              the customer id Paddle assigns. See{" "}
              <a href="https://www.paddle.com/legal/privacy" rel="noopener noreferrer">
                Paddle's privacy policy
              </a>
              . Pricing is on the{" "}
              <Link href="/pricing">pricing page</Link>.
            </p>

            <h2 id="processors">Service providers</h2>
            <p>
              These providers process data on our behalf or as independent
              controllers for payments:
            </p>
            <ul>
              <li>
                <strong>Paddle.com Market Limited</strong> (and affiliates) for
                checkout, invoices, tax, and subscription billing.
              </li>
              <li>
                <strong>Supabase</strong> stores plugin usage counts and subscription
                status keyed to your Figma user id.
              </li>
              <li>Hosting, DNS, analytics, and form-delivery providers</li>
              <li>Authorities when required by law</li>
            </ul>

            <h2 id="your-controls">Your controls</h2>
            <p>You can, at any time:</p>
            <ul>
              <li>Unsubscribe from newsletter communications</li>
              <li>Request access to your information</li>
              <li>Request correction of your information</li>
              <li>Request deletion, including plugin usage rows keyed by Figma user id</li>
            </ul>
            <p>
              Manage optional analytics cookies on{" "}
              <Link href="/cookie-preference">cookie preferences</Link>. Related
              pages: <Link href="/terms">terms of service</Link>,{" "}
              <Link href="/refund-policy">refund policy</Link>.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Privacy questions and data requests:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or the{" "}
              <Link href="/contact">contact page</Link>. We respond to verified
              requests within a reasonable period.
            </p>
          </article>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}
