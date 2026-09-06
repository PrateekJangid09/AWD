import { NextResponse } from "next/server";
import { grantPluginAccess, periodEndFromSubscription } from "@/lib/plugin-access";
import { planById } from "@/lib/paddle-catalog";
import {
  razorpayClient,
  razorpayKeys,
  verifyRazorpayPaymentLinkSignature,
  verifyRazorpaySubscriptionSignature,
} from "@/lib/razorpay";
import { absUrl } from "@/lib/seo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("razorpay_payment_id") || "";
  const linkId = url.searchParams.get("razorpay_payment_link_id") || "";
  const referenceId = url.searchParams.get("razorpay_payment_link_reference_id") || "";
  const status = url.searchParams.get("razorpay_payment_link_status") || "";
  const subscriptionId = url.searchParams.get("razorpay_subscription_id") || "";
  const signature = url.searchParams.get("razorpay_signature") || "";
  const thanks = absUrl("/pay/thanks");
  const failed = absUrl("/checkout?error=unpaid");

  const { keySecret } = razorpayKeys();
  if (!keySecret || !paymentId || !signature) {
    return NextResponse.redirect(failed, 302);
  }

  const client = razorpayClient();
  let figmaUserId = (url.searchParams.get("figma") || "").trim().slice(0, 128);
  let trackId = (url.searchParams.get("track") || "").trim().slice(0, 16);
  let planId = url.searchParams.get("plan") || "monthly";
  let periodEnd: string | null = null;
  let grantedSubscriptionId = subscriptionId;

  if (subscriptionId) {
    if (!verifyRazorpaySubscriptionSignature(paymentId, subscriptionId, signature, keySecret)) {
      return NextResponse.redirect(failed, 302);
    }
    if (client) {
      try {
        const subscription = await client.subscriptions.fetch(subscriptionId);
        const notes = (subscription.notes || {}) as Record<string, string>;
        if (typeof notes.figmaUserId === "string") figmaUserId = notes.figmaUserId;
        if (typeof notes.trackId === "string") trackId = notes.trackId;
        if (typeof notes.plan === "string") planId = notes.plan;
        periodEnd = periodEndFromSubscription(
          subscription.current_end,
          planById(planId)?.accessDays,
        );
      } catch {
        // notes are optional; signature already matched
      }
    }
  } else if (linkId) {
    if (!verifyRazorpayPaymentLinkSignature(linkId, referenceId, status, paymentId, signature, keySecret)) {
      return NextResponse.redirect(failed, 302);
    }
    if (status !== "paid") return NextResponse.redirect(failed, 302);
    if (client) {
      try {
        const link = await client.paymentLink.fetch(linkId);
        const notes = (link.notes || {}) as Record<string, string>;
        if (typeof notes.figmaUserId === "string") figmaUserId = notes.figmaUserId;
        if (typeof notes.trackId === "string") trackId = notes.trackId;
        if (typeof notes.plan === "string") planId = notes.plan;
      } catch {
        // notes are optional; signature already matched
      }
    }
  } else {
    return NextResponse.redirect(failed, 302);
  }

  const billingId = figmaUserId || trackId;
  if (billingId) {
    await grantPluginAccess({
      figmaUserId: billingId,
      planId,
      paymentId,
      trackId,
      subscriptionId: grantedSubscriptionId || undefined,
      periodEnd,
    });
  }

  const dest = new URL(thanks);
  if (billingId) dest.searchParams.set("figma", billingId);
  dest.searchParams.set("plan", planId);
  return NextResponse.redirect(dest.toString(), 302);
}
