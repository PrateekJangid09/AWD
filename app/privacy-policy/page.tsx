import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Privacy Policy";
const description =
  "How AllWebsites.Design collects, uses and protects information across the archive.";

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
        description="What AllWebsites.Design collects, why, and the controls you have. We aim to collect as little as possible."
        updated="11 August 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Privacy" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          {/* TOC */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["what-we-collect", "What we collect"],
                ["how-we-use-it", "How we use it"],
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
          </aside>

          {/* Body */}
          <article className="prose max-w-2xl">
            <p>
              AllWebsites.Design is an independent website-design research archive.
              This policy explains what information the archive collects, why, and the
              controls you have. We aim to collect as little as possible.
            </p>

            <h2 id="what-we-collect">What we collect</h2>
            <h3>Automatically</h3>
            <ul>
              <li>Analytics information about how the archive is used</li>
              <li>Device and browser information</li>
              <li>IP-related information</li>
              <li>Page and performance information</li>
            </ul>
            <h3>When you interact</h3>
            <p>Depending on the workflow, we may collect:</p>
            <ul>
              <li>Email address</li>
              <li>Name</li>
              <li>Message content</li>
              <li>A website URL and submission notes</li>
            </ul>

            <h2 id="how-we-use-it">How we use it</h2>
            <ul>
              <li>Operating and improving the archive</li>
              <li>Measuring performance</li>
              <li>Responding to messages and processing submissions</li>
              <li>Newsletter communication you opt into</li>
              <li>Abuse prevention and legal requirements</li>
            </ul>

            <h2 id="processors">Service providers</h2>
            <p>
              We rely on a small set of service providers for functions such as
              hosting, analytics, performance monitoring and form delivery. These
              providers process data on our behalf and under our instructions.
            </p>

            <h2 id="your-controls">Your controls</h2>
            <p>You can, at any time:</p>
            <ul>
              <li>Unsubscribe from newsletter communications</li>
              <li>Request access to your information</li>
              <li>Request correction of your information</li>
              <li>Request deletion through the contact workflow</li>
            </ul>
            <p>
              You can also manage optional analytics cookies from our{" "}
              <Link href="/cookie-preference">cookie preferences</Link> page.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Privacy questions and data requests can be sent through our{" "}
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
