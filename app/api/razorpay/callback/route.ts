import { NextResponse } from "next/server";
import { grantPluginAccess } from "@/lib/plugin-access";
import {
  razorpayClient,
  razorpayKeys,
  verifyRazorpayPaymentLinkSignature,
} from "@/lib/razorpay";
import { absUrl } from "@/lib/seo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("razorpay_payment_id") || "";
  const linkId = url.searchParams.get("razorpay_payment_link_id") || "";
  const referenceId = url.searchParams.get("razorpay_payment_link_reference_id") || "";
  const status = url.searchParams.get("razorpay_payment_link_status") || "";
  const signature = url.searchParams.get("razorpay_signature") || "";
  const thanks = absUrl("/pay/thanks");
  const failed = absUrl("/checkout?error=unpaid");

  const { keySecret } = razorpayKeys();
  if (!keySecret || !paymentId || !linkId || !signature) {
    return NextResponse.redirect(failed, 302);
  }
  if (!verifyRazorpayPaymentLinkSignature(linkId, referenceId, status, paymentId, signature, keySecret)) {
    return NextResponse.redirect(failed, 302);
  }
  if (status !== "paid") return NextResponse.redirect(failed, 302);

  const client = razorpayClient();
  let figmaUserId = (url.searchParams.get("figma") || "").trim().slice(0, 128);
  let trackId = (url.searchParams.get("track") || "").trim().slice(0, 16);
  let planId = url.searchParams.get("plan") || "monthly";
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

  const billingId = figmaUserId || trackId;
  if (billingId) {
    await grantPluginAccess({ figmaUserId: billingId, planId, paymentId, trackId });
  }

  const dest = new URL(thanks);
  if (billingId) dest.searchParams.set("figma", billingId);
  dest.searchParams.set("plan", planId);
  return NextResponse.redirect(dest.toString(), 302);
}
