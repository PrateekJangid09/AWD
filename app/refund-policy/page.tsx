import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Refund policy";
const description =
  "How AllWebsites.Design handles refunds and cancellations for Figma plugin subscriptions billed through Paddle, including the 14-day unused-period window.";

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
        title="Refund policy"
        description="Cancellations and refunds for Figma plugin subscriptions. Paddle is the merchant of record."
        updated="4 September 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Refund policy" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap prose max-w-2xl">
          <p>
            Paid Figma plugin access is sold as a subscription: $3 per month or $30
            per year. Paddle processes the payment and appears on your statement.
          </p>

          <h2>Cancel</h2>
          <p>
            Cancel at any time. Access continues until the end of the period you
            already paid for. After that, each plugin returns to three free applies.
          </p>

          <h2>Refunds</h2>
          <p>
            If you have not used paid applies and you ask within 14 days of the
            charge, we will refund that period. Contact{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the email
            on the Paddle receipt.
          </p>
          <p>
            We may refuse a refund where the subscription was used heavily, where
            we see refund abuse, or where Paddle’s buyer terms require us to.
          </p>

          <h2>How to ask</h2>
          <p>
            Email {CONTACT_EMAIL} or use the{" "}
            <Link href="/contact">contact form</Link>. Include your Paddle receipt
            ID if you have it.
          </p>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}
