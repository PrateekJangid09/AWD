import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { CONTACT_EMAIL, pageMeta } from "@/lib/seo";
import CancelForm from "./CancelForm";

export const metadata: Metadata = pageMeta({
  title: "Cancel subscription",
  description:
    "Cancel the AllWebsites.Design Color Tool Suite monthly or yearly subscription. Access stays until the paid-through date.",
  path: "/pay/cancel",
});

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export default async function CancelSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ figma?: string | string[]; track?: string | string[] }>;
}) {
  const params = await searchParams;
  const figmaUserId = first(params.figma).slice(0, 128);
  const track = first(params.track);

  return (
    <>
      <PageHero
        eyebrow="Subscription"
        title="Cancel subscription."
        intro="This stops the next $3 monthly or $30 yearly charge. You keep Color Tool Suite access until the date you already paid through."
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/pricing", label: "Pricing" },
          { label: "Cancel" },
        ]}
      />
      <section className="py-14">
        <CancelForm figmaUserId={figmaUserId} trackId={track} />
        <p className="wrap mt-8 max-w-xl text-sm text-ink/60">
          If the button fails, email {CONTACT_EMAIL} and I will cancel it in Razorpay.
        </p>
      </section>
    </>
  );
}
