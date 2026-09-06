import { isLiveEntitlement, unixToIso } from "@/lib/entitlement-status";
import { planById } from "@/lib/paddle-catalog";
import { getEntitlement, supabaseConfigured, upsertEntitlement } from "@/lib/supabase-admin";

export { isLiveEntitlement };

export function periodEndIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function grantPluginAccess(input: {
  figmaUserId: string;
  planId: string;
  paymentId?: string;
  trackId?: string;
  subscriptionId?: string;
  periodEnd?: string | null;
  status?: "active" | "cancelled";
}) {
  const plan = planById(input.planId);
  if (!plan || !input.figmaUserId || !supabaseConfigured()) return false;
  const existing = await getEntitlement(input.figmaUserId);
  const track = input.trackId && /^\d{10}$/.test(input.trackId) ? `track:${input.trackId}` : null;
  const subscriptionRef = input.subscriptionId
    ? `rzp_sub:${input.subscriptionId}`
    : input.paymentId
      ? `rzp:${input.paymentId}`
      : typeof existing?.paddle_subscription_id === "string"
        ? existing.paddle_subscription_id
        : null;
  const periodEnd =
    input.periodEnd ||
    (typeof existing?.current_period_end === "string" ? existing.current_period_end : null) ||
    periodEndIso(plan.accessDays);
  await upsertEntitlement({
    figmaUserId: input.figmaUserId,
    email: track,
    status: input.status || "active",
    plan: plan.id,
    paddleSubscriptionId: subscriptionRef,
    currentPeriodEnd: periodEnd,
  });
  return true;
}

export async function cancelPluginAccess(input: {
  figmaUserId: string;
  planId?: string;
  trackId?: string;
  subscriptionId?: string;
  periodEnd?: string | null;
}) {
  const existing = await getEntitlement(input.figmaUserId);
  const planId =
    input.planId || (typeof existing?.plan === "string" ? existing.plan : "monthly");
  return grantPluginAccess({
    figmaUserId: input.figmaUserId,
    planId,
    trackId: input.trackId,
    subscriptionId: input.subscriptionId,
    periodEnd:
      input.periodEnd ||
      (typeof existing?.current_period_end === "string" ? existing.current_period_end : null),
    status: "cancelled",
  });
}

export function periodEndFromSubscription(currentEnd?: number | null, accessDays?: number) {
  return unixToIso(currentEnd) || (accessDays ? periodEndIso(accessDays) : null);
}
