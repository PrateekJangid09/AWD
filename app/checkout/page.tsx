import { redirect } from "next/navigation";

function first(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string | string[];
    figma?: string | string[];
    track?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  query.set("plan", first(params.plan) || "monthly");
  const figma = first(params.figma);
  const track = first(params.track);
  if (figma) query.set("figma", figma);
  if (track) query.set("track", track);
  redirect(`/api/pay?${query.toString()}`);
}
