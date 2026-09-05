import { planById } from "@/lib/paddle-catalog";
import { supabaseConfigured, upsertEntitlement } from "@/lib/supabase-admin";

export function periodEndIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function grantPluginAccess(input: {
  figmaUserId: string;
  planId: string;
  paymentId: string;
  trackId?: string;
}) {
  const plan = planById(input.planId);
  if (!plan || !input.figmaUserId || !supabaseConfigured()) return false;
  const track = input.trackId && /^\d{10}$/.test(input.trackId) ? `track:${input.trackId}` : null;
  await upsertEntitlement({
    figmaUserId: input.figmaUserId,
    email: track,
    status: "active",
    plan: plan.id,
    paddleSubscriptionId: `rzp:${input.paymentId}`,
    currentPeriodEnd: periodEndIso(plan.accessDays),
  });
  return true;
}
