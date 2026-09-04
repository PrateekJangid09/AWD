import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Payment received",
  description: "Your AllWebsites.Design plugin suite payment was received. Reopen the Figma plugin to use paid access.",
  path: "/pay/thanks",
});

export default function PayThanksPage() {
  return (
    <>
      <PageHero
        eyebrow="Payment"
        title="You're in."
        intro="Razorpay confirmed the payment. Reopen Chromary, Colorhyme, TrueGradient or WebPalette in Figma — paid access is tied to your Figma account."
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }, { label: "Thanks" }]}
      />
      <section className="py-14">
        <p className="wrap max-w-xl text-sm text-ink/70">
          If the plugin still shows free uses, close it and run it again. Questions: see the{" "}
          <Link href="/pricing" className="underline decoration-orange decoration-2 underline-offset-2">
            pricing page
          </Link>
          .
        </p>
      </section>
    </>
  );
}
