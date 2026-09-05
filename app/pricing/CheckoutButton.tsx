"use client";

import { useEffect, useState } from "react";
import type { PlanId } from "@/lib/paddle-catalog";

function payHref(planId: PlanId, figmaUserId?: string) {
  const params = new URLSearchParams({ plan: planId });
  if (figmaUserId) params.set("figma", figmaUserId);
  return `/api/pay?${params.toString()}`;
}

export default function CheckoutButton({
  planId,
  label,
  figmaUserId,
  autoOpen = false,
}: {
  planId: PlanId;
  label: string;
  figmaUserId?: string;
  autoOpen?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const href = payHref(planId, figmaUserId);

  useEffect(() => {
    if (!autoOpen) return;
    window.location.assign(href);
  }, [autoOpen, href]);

  return (
    <div className="mt-5">
      <a
        href={href}
        data-checkout-plan={planId}
        onClick={() => setBusy(true)}
        className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-orange"
      >
        {busy ? "Opening payment…" : label}
      </a>
    </div>
  );
}
