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
  "Pay $3 per month or $30 per year to unlock Chromary, Colorhyme, TrueGradient and WebPalette. Razorpay hosted checkout attaches your Figma account.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/checkout",
  index: false,
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
        intro="Pay opens Razorpay hosted checkout. Pick monthly or yearly. Access lasts for the period you buy; pay again to renew."
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
              className="rounded-[6px] border border-ink bg-surface p-6 sm:p-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {plan.name}
                {plan.id === selected ? " · opening" : ""}
              </p>
              <p className="mt-4 font-display text-[64px] leading-none">
                ${plan.amountUsd}
                <span className="ml-2 text-lg font-medium text-muted">
                  / {plan.period}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-soft">{plan.blurb}</p>
              <CheckoutButton
                planId={plan.id}
                label={plan.id === "yearly" ? "Pay $30 / year" : "Pay $3 / month"}
                figmaUserId={figmaUserId}
                autoOpen={Boolean(figmaUserId) && plan.id === selected}
              />
            </article>
          ))}
        </div>
        <p className="wrap mt-8 max-w-2xl text-sm text-soft">
          Compare plans on the{" "}
          <Link href="/pricing" className="underline decoration-orange decoration-2 underline-offset-2">
            pricing page
          </Link>
          . Start from the plugin Unlock button so the payment is tied to your Figma
          account. Questions:{" "}
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
