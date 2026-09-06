import { NextResponse } from "next/server";
import { cancelPluginAccess } from "@/lib/plugin-access";
import { razorpaySubscriptionIdFromRef } from "@/lib/entitlement-status";
import { notifyOwner } from "@/lib/notify-owner";
import {
  cancelRazorpaySubscription,
  razorpayAlreadyCancelled,
  razorpayConfigured,
  razorpayErrorStatus,
} from "@/lib/razorpay";
import { CONTACT_EMAIL } from "@/lib/seo";
import {
  getEntitlement,
  getEntitlementByTrack,
  supabaseConfigured,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

function supportMailto(figmaUserId: string, trackId: string, detail: string) {
  const params = new URLSearchParams({
    subject: "Cancel subscription failed",
    body: `Hi Prateek,\n\nCancel subscription did not finish.\nFigma id: ${figmaUserId}\nTrack id: ${trackId || "—"}\nDetail: ${detail}\n`,
  });
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}

export async function POST(request: Request) {
  let body: { figmaUserId?: string; trackId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json", supportEmail: CONTACT_EMAIL }, 400);
  }

  const figmaUserId = typeof body.figmaUserId === "string" ? body.figmaUserId.trim().slice(0, 128) : "";
  const trackId =
    typeof body.trackId === "string" && /^\d{10}$/.test(body.trackId.trim()) ? body.trackId.trim() : "";
  if (!figmaUserId) {
    return json(
      {
        error: "figmaUserId_required",
        supportEmail: CONTACT_EMAIL,
        mailto: supportMailto("", trackId, "missing Figma id"),
      },
      400,
    );
  }

  const support = {
    supportEmail: CONTACT_EMAIL,
    mailto: supportMailto(figmaUserId, trackId, "Please cancel this Razorpay subscription."),
  };

  if (!supabaseConfigured()) {
    return json({ error: "billing_unconfigured", ...support }, 503);
  }

  const entitlement =
    (await getEntitlement(figmaUserId)) || (trackId ? await getEntitlementByTrack(trackId) : null);
  if (!entitlement) {
    return json({ error: "no_subscription", ...support }, 404);
  }

  const periodEnd =
    typeof entitlement.current_period_end === "string" ? entitlement.current_period_end : null;
  const planId = typeof entitlement.plan === "string" ? entitlement.plan : "monthly";
  const subscriptionId = razorpaySubscriptionIdFromRef(entitlement.paddle_subscription_id);
  const alreadyCancelled = entitlement.status === "cancelled";

  if (alreadyCancelled) {
    return json({
      ok: true,
      cancelled: true,
      alreadyCancelled: true,
      plan: planId,
      currentPeriodEnd: periodEnd,
      ...support,
    });
  }

  let razorpayCancelled = !subscriptionId;
  let razorpayError = subscriptionId ? "" : "no_razorpay_subscription_id";

  if (subscriptionId) {
    if (!razorpayConfigured()) {
      await notifyOwner({
        subject: `[AllWebsites.Design] Cancel failed — ${figmaUserId}`,
        text: [
          "A subscriber tapped Cancel but Razorpay keys are missing.",
          `Figma id: ${figmaUserId}`,
          `Track id: ${trackId || "—"}`,
          `Plan: ${planId}`,
          `Razorpay subscription: ${subscriptionId}`,
          `Paid through: ${periodEnd || "—"}`,
        ].join("\n"),
      });
      return json({ error: "razorpay_unconfigured", ...support }, 503);
    }
    try {
      await cancelRazorpaySubscription(subscriptionId);
      razorpayCancelled = true;
    } catch (err) {
      if (razorpayAlreadyCancelled(err)) {
        razorpayCancelled = true;
      } else {
        razorpayError = razorpayErrorStatus(err).message;
      }
    }
  }

  if (subscriptionId && !razorpayCancelled) {
    await notifyOwner({
      subject: `[AllWebsites.Design] Cancel failed — ${figmaUserId}`,
      text: [
        "A subscriber tapped Cancel. Razorpay did not cancel the subscription.",
        `Figma id: ${figmaUserId}`,
        `Track id: ${trackId || "—"}`,
        `Plan: ${planId}`,
        `Razorpay subscription: ${subscriptionId}`,
        `Paid through: ${periodEnd || "—"}`,
        `Error: ${razorpayError}`,
        "",
        "Cancel it in the Razorpay Dashboard if the next charge should stop.",
      ].join("\n"),
    });
    return json({ error: "razorpay_cancel_failed", detail: razorpayError, ...support }, 502);
  }

  await cancelPluginAccess({
    figmaUserId,
    planId,
    trackId,
    subscriptionId: subscriptionId || undefined,
    periodEnd,
  });

  await notifyOwner({
    subject: `[AllWebsites.Design] Subscription cancelled — ${figmaUserId}`,
    text: [
      "A Color Tool Suite subscriber cancelled.",
      `Figma id: ${figmaUserId}`,
      `Track id: ${trackId || "—"}`,
      `Plan: ${planId}`,
      `Razorpay subscription: ${subscriptionId || "none (one-time payment)"}`,
      `Paid through: ${periodEnd || "—"}`,
      "They keep access until that date. The next renewal should not charge.",
    ].join("\n"),
  });

  return json({
    ok: true,
    cancelled: true,
    plan: planId,
    currentPeriodEnd: periodEnd,
    ...support,
  });
}
