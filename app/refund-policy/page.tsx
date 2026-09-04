import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PolicyNav from "@/components/PolicyNav";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Refund policy";
const description =
  "Refund and cancellation policy for AllWebsites.Design Figma plugin subscriptions: cancel anytime, plus a 14-day unused refund, billed by Paddle.";

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
        description="How to cancel a Figma plugin subscription and when we refund a charge. Paddle is the merchant of record."
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
              <Link href="/pricing">allwebsites.design/pricing</Link>: $3 per month
              or $30 per year for Chromary, Colorhyme, TrueGradient, and WebPalette.
              Paddle processes the payment and appears on your statement. Browser
              tools on this site are free and are not billed.
            </p>
            <p>
              Related pages: <Link href="/terms">terms of service</Link> and{" "}
              <Link href="/privacy-policy">privacy policy</Link>.
            </p>

            <h2 id="cancel">Cancel</h2>
            <p>
              Cancel at any time. Access continues until the end of the monthly or
              yearly period you already paid for. After that, each plugin returns to
              three free applies. Cancellation stops the next renewal; it is not
              itself a refund of the current period.
            </p>
            <p>
              Use the customer portal / manage-subscription link in your Paddle
              receipt email, or email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will
              help you cancel.
            </p>

            <h2 id="refunds">Refunds</h2>
            <p>
              If you have not used paid applies and you ask within 14 days of the
              charge, we will refund that period. This is a digital product delivered
              immediately through Figma.
            </p>
            <p>
              We may refuse a refund where the subscription was used heavily, where
              we see refund abuse, or where Paddle's buyer terms require us to.
              Chargebacks should be a last resort; email us first so we can help.
            </p>

            <h2 id="ask">How to ask</h2>
            <p>
              Email {CONTACT_EMAIL} or use the{" "}
              <Link href="/contact">contact form</Link>. Include the email on the
              Paddle receipt and the receipt ID if you have it. We will coordinate
              the refund through Paddle.
            </p>
          </article>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}
