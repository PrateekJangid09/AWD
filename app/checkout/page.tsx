import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PolicyNav from "@/components/PolicyNav";
import { PLANS, planFromQuery } from "@/lib/paddle-catalog";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";
import CheckoutButton from "../pricing/CheckoutButton";

const title = "Unlock Figma plugins";
const description =
  "Pay ₹249 per month or ₹2,490 per year to unlock Chromary, Colorhyme, TrueGradient and WebPalette. Razorpay opens the payment modal on this page.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/checkout",
});

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ figma?: string | string[]; plan?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.figma) ? params.figma[0] : params.figma;
  const figmaUserId =
    typeof raw === "string" && raw.trim() && raw.trim().length <= 128
      ? raw.trim()
      : undefined;
  const selected = planFromQuery(params.plan);

  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/checkout",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Checkout" },
          ],
        })}
      />
      <PageHero
        eyebrow="Payment"
        title="Unlock the plugin suite."
        intro="Razorpay opens the payment modal when you tap Pay. Pick monthly or yearly. Access lasts for the period you buy; pay again to renew."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Checkout" }]}
      />
      <div className="wrap pt-8">
        <PolicyNav current="/pricing" />
      </div>

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-8 lg:grid-cols-2">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className="rounded-2xl border border-line bg-paper p-6 sm:p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                {plan.name}
                {plan.id === selected ? " · opening" : ""}
              </p>
              <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
                ₹{plan.amountInr.toLocaleString("en-IN")}
                <span className="ml-2 text-lg font-medium text-ink/50">
                  / {plan.period}
                </span>
              </p>
              <p className="text-sm text-ink/50">≈ ${plan.amountUsd} USD</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{plan.blurb}</p>
              <CheckoutButton
                planId={plan.id}
                label={plan.id === "yearly" ? "Pay ₹2,490 / year" : "Pay ₹249 / month"}
                figmaUserId={figmaUserId}
                autoOpen={plan.id === selected}
              />
            </article>
          ))}
        </div>
        <p className="wrap mt-8 max-w-2xl text-sm text-ink/60">
          Compare plans on the{" "}
          <Link href="/pricing" className="underline decoration-orange decoration-2 underline-offset-2">
            pricing page
          </Link>
          . Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
      <ExploreMore />
    </>
  );
}
