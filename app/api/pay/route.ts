import { NextResponse } from "next/server";
import { planById } from "@/lib/paddle-catalog";
import { absUrl } from "@/lib/seo";
import {
  MIN_AMOUNT_PAISE,
  createRazorpayPaymentLink,
  createRazorpaySubscription,
  razorpayConfigured,
  razorpayErrorStatus,
} from "@/lib/razorpay";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fail(message: string, status = 503) {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:system-ui;padding:2rem;max-width:40rem">
      <h1>Payment could not start</h1>
      <p>${escapeHtml(message)}</p>
      <p><a href="/pricing">Back to pricing</a></p>
    </body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: Request) {
  if (!razorpayConfigured()) {
    return fail(
      "Razorpay keys are not set on the server. In Vercel → Settings → Environment Variables, add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for Production, then Redeploy.",
    );
  }

  const url = new URL(request.url);
  const plan = planById(url.searchParams.get("plan") || "monthly");
  if (!plan) return fail("Unknown plan.", 400);

  const figmaUserId = (url.searchParams.get("figma") || "").trim().slice(0, 128);
  const trackId = (url.searchParams.get("track") || "").trim().slice(0, 16);
  if (!figmaUserId && !trackId) {
    return fail("Unlock from the Figma plugin so we can attach your tracking id. Open Color Tool Suite and tap Unlock $3.", 400);
  }
  const billingId = figmaUserId || trackId;
  const referenceId = `awd_${plan.id}_${Date.now()}`.slice(0, 40);
  const description =
    plan.id === "yearly"
      ? "AllWebsites.Design plugin suite · yearly subscription $30"
      : "AllWebsites.Design plugin suite · monthly subscription $3";
  const notes: Record<string, string> = { plan: plan.id, figmaUserId: billingId };
  if (trackId) notes.trackId = trackId;

  const callback = new URL(absUrl("/api/razorpay/callback"));
  callback.searchParams.set("figma", billingId);
  if (trackId) callback.searchParams.set("track", trackId);
  callback.searchParams.set("plan", plan.id);

  // Prefer a Razorpay Subscription so $3 monthly / $30 yearly actually renews.
  // USD first for international checkout; INR if the account has no USD plans.
  const attempts = [
    { currency: "USD", amount: plan.amountUsdCents },
    { currency: "INR", amount: plan.amountPaise },
  ].filter((attempt) => Number.isFinite(attempt.amount) && attempt.amount >= MIN_AMOUNT_PAISE);

  let lastError = "Razorpay could not start the subscription.";
  for (const attempt of attempts) {
    try {
      const subscription = await createRazorpaySubscription({
        planId: plan.id,
        amount: attempt.amount,
        currency: attempt.currency,
        notes,
      });
      if (subscription.short_url) {
        return NextResponse.redirect(subscription.short_url, 302);
      }
      lastError = "Razorpay did not return a subscription URL.";
    } catch (err) {
      lastError = razorpayErrorStatus(err).message;
    }
  }

  for (const attempt of attempts) {
    try {
      const link = await createRazorpayPaymentLink({
        amount: attempt.amount,
        currency: attempt.currency,
        description,
        referenceId: `${referenceId}_${attempt.currency}`.slice(0, 40),
        notes,
        callbackUrl: callback.toString(),
      });
      if (!link.short_url) return fail("Razorpay did not return a payment URL.");
      return NextResponse.redirect(link.short_url, 302);
    } catch (err) {
      lastError = razorpayErrorStatus(err).message;
    }
  }

  return fail(lastError, 500);
}
