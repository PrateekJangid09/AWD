import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PolicyNav from "@/components/PolicyNav";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Refund policy";
const description =
  "Refund policy for AllWebsites.Design Figma plugin access: 14-day unused refund on Razorpay charges for the monthly or yearly suite.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/refund-policy",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Refund policy" },
          ],
        })}
      />
      <DocumentHero
        title="Refund and cancellation policy"
        description="How we refund a Razorpay charge for Figma plugin access. Payments are one-time for a month or a year."
        updated="4 September 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Refund policy" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["product", "What this covers"],
                ["cancel", "Cancel"],
                ["refunds", "Refunds"],
                ["ask", "How to ask"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-ink/60 hover:text-orange">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <PolicyNav current="/refund-policy" />
          </aside>

          <article className="prose max-w-2xl">
            <h2 id="product">What this covers</h2>
            <p>
              This policy applies to paid Figma plugin access sold on{" "}
              <Link href="/pricing">allwebsites.design/pricing</Link>: ₹249 per month
              or ₹2,490 per year for Chromary, Colorhyme, TrueGradient, and
              WebPalette. Razorpay processes the payment. Browser tools on this site
              are free and are not billed.
            </p>
            <p>
              Related pages: <Link href="/terms">terms of service</Link> and{" "}
              <Link href="/privacy-policy">privacy policy</Link>.
            </p>

            <h2 id="cancel">Cancel</h2>
            <p>
              Access lasts until the end of the monthly or yearly period you paid
              for. Razorpay Standard Checkout does not auto-renew, so there is no
              subscription to cancel. After the period ends, each plugin returns to
              three free applies.
            </p>
            <p>
              Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you need
              help with a charge.
            </p>

            <h2 id="refunds">Refunds</h2>
            <p>
              If you have not used paid applies and you ask within 14 days of the
              charge, we will refund that period. This is a digital product delivered
              immediately through Figma.
            </p>
            <p>
              We may refuse a refund where the access was used heavily or where we
              see refund abuse. Chargebacks should be a last resort; email us first
              so we can help.
            </p>

            <h2 id="ask">How to ask</h2>
            <p>
              Email {CONTACT_EMAIL} or use the{" "}
              <Link href="/contact">contact form</Link>. Include the email on the
              Razorpay receipt and the payment id if you have it. We will refund
              through Razorpay.
            </p>
          </article>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}
