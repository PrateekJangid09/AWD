import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PolicyNav from "@/components/PolicyNav";
import { FREE_USES_PER_PLUGIN, PLANS } from "@/lib/paddle-catalog";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";
import CheckoutButton from "./CheckoutButton";

const title = "Figma plugin pricing";
const description =
  "Chromary, Colorhyme, TrueGradient and WebPalette: three free uses each, then $3 per month or $30 per year for the suite, billed through Paddle.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/pricing",
});

const FEATURES = [
  "Color name finder (Chromary)",
  "Color harmony generator (Colorhyme)",
  "OKLCH gradient generator (TrueGradient)",
  "Website color palette generator (WebPalette)",
  `${FREE_USES_PER_PLUGIN} free applies per plugin, then unlimited on a plan`,
  "Local paint styles and labelled swatches on the canvas",
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ figma?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.figma) ? params.figma[0] : params.figma;
  const figmaUserId =
    typeof raw === "string" && raw.trim() && raw.trim().length <= 128
      ? raw.trim()
      : undefined;
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/pricing",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Pricing" },
          ],
        })}
      />
      <PageHero
        eyebrow="Pricing"
        title="Figma color plugins, priced simply."
        intro="Four desktop plugins. Each one lets you apply, style or drop a result three times for free. After that, one subscription unlocks the suite."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Pricing" }]}
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
              </p>
              <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
                ${plan.amountUsd}
                <span className="ml-2 text-lg font-medium text-ink/50">
                  / {plan.period}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{plan.blurb}</p>
              <CheckoutButton
                priceId={plan.priceId}
                label={plan.id === "yearly" ? "Pay yearly" : "Pay monthly"}
                figmaUserId={figmaUserId}
              />
            </article>
          ))}
        </div>

        <div className="wrap mt-12 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            What you get
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/80">
            {FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink/60">
            Billing is handled by Paddle as merchant of record. Read the{" "}
            <Link href="/refund-policy" className="underline decoration-orange decoration-2 underline-offset-2">
              refund policy
            </Link>
            ,{" "}
            <Link href="/terms" className="underline decoration-orange decoration-2 underline-offset-2">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline decoration-orange decoration-2 underline-offset-2">
              privacy policy
            </Link>
            . Questions:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}
