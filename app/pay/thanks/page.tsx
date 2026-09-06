import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { planFromQuery } from "@/lib/paddle-catalog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Subscription started",
  description:
    "Your AllWebsites.Design plugin suite subscription was started. Reopen the Figma plugin to use paid access.",
  path: "/pay/thanks",
});

export default async function PayThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const plan = planFromQuery((await searchParams).plan);
  const label =
    plan === "yearly"
      ? "$30 yearly subscription"
      : "$3 monthly subscription";

  return (
    <>
      <PageHero
        eyebrow="Subscription"
        title="You're in."
        intro={`Razorpay confirmed your ${label}. Reopen Chromary, Colorhyme, TrueGradient or WebPalette in Figma — paid access is tied to your Figma account for this billing period.`}
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }, { label: "Thanks" }]}
      />
      <section className="py-14">
        <p className="wrap max-w-xl text-sm text-ink/70">
          Monthly is $3 every month. Yearly is $30 once a year. If the plugin still shows
          free uses, close it and run it again. Questions: see the{" "}
          <Link href="/pricing" className="underline decoration-orange decoration-2 underline-offset-2">
            pricing page
          </Link>
          .
        </p>
      </section>
    </>
  );
}
