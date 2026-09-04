import { NextResponse } from "next/server";
import { planById } from "@/lib/paddle-catalog";
import { absUrl } from "@/lib/seo";
import {
  MIN_AMOUNT_PAISE,
  createRazorpayPaymentLink,
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
    return fail("Razorpay keys are not set on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  const url = new URL(request.url);
  const plan = planById(url.searchParams.get("plan") || "monthly");
  if (!plan) return fail("Unknown plan.", 400);

  const figmaUserId = (url.searchParams.get("figma") || "").trim().slice(0, 128);
  const referenceId = `awd_${plan.id}_${Date.now()}`.slice(0, 40);
  const description =
    plan.id === "yearly"
      ? "AllWebsites.Design plugin suite · 1 year"
      : "AllWebsites.Design plugin suite · 1 month";
  const notes: Record<string, string> = { plan: plan.id };
  if (figmaUserId) notes.figmaUserId = figmaUserId;

  const callback = new URL(absUrl("/api/razorpay/callback"));
  if (figmaUserId) callback.searchParams.set("figma", figmaUserId);
  callback.searchParams.set("plan", plan.id);

  // Prefer USD so a US visitor lands on a dollar checkout. INR is the fallback
  // for Razorpay accounts that have not enabled international payments.
  const attempts = [
    { currency: "USD", amount: plan.amountUsdCents },
    { currency: "INR", amount: plan.amountPaise },
  ].filter((attempt) => Number.isFinite(attempt.amount) && attempt.amount >= MIN_AMOUNT_PAISE);

  let lastError = "Razorpay could not create a payment link.";
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
