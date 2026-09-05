import { NextResponse } from "next/server";
import { grantPluginAccess } from "@/lib/plugin-access";
import { razorpayKeys, verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayKeys().keySecret;
  if (!secret || !verifyRazorpayWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "signature_mismatch" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string } };
      payment_link?: {
        entity?: {
          status?: string;
          notes?: Record<string, string>;
        };
      };
    };
  };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (event.event !== "payment_link.paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const notes = event.payload?.payment_link?.entity?.notes || {};
  const paymentId = event.payload?.payment?.entity?.id || "";
  const figmaUserId = typeof notes.figmaUserId === "string" ? notes.figmaUserId : "";
  const trackId = typeof notes.trackId === "string" ? notes.trackId : "";
  const planId = typeof notes.plan === "string" ? notes.plan : "monthly";
  const billingId = figmaUserId || trackId;
  if (billingId && paymentId) {
    await grantPluginAccess({ figmaUserId: billingId, planId, paymentId, trackId });
  }
  return NextResponse.json({ ok: true });
}
