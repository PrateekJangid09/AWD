"use client";

import { useEffect, useState } from "react";
import { checkoutEnabled, RAZORPAY_KEY_ID, type PlanId } from "@/lib/paddle-catalog";

declare global {
  interface Window {
    Razorpay?: new (opts: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
      notes?: Record<string, string>;
      theme?: { color?: string };
    }) => {
      open: () => void;
      on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

let checkoutScript: Promise<void> | null = null;
let autoOpened = false;

function loadCheckoutJs() {
  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const existing = document.querySelector("script[data-razorpay]");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Razorpay checkout failed to load")));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpay = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay checkout failed to load"));
      document.head.appendChild(script);
    });
  }
  return checkoutScript;
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
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const enabled = checkoutEnabled();
  const key = RAZORPAY_KEY_ID;

  async function open() {
    if (!enabled || !key) return;
    setBusy(true);
    setError(null);
    try {
      await loadCheckoutJs();
      const created = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, figmaUserId }),
      });
      const order = (await created.json().catch(() => ({}))) as {
        order_id?: string;
        amount?: number;
        currency?: string;
        error?: string;
      };
      if (!created.ok || !order.order_id || !order.amount || !order.currency) {
        throw new Error(order.error || "Could not create a payment order.");
      }
      if (!window.Razorpay) throw new Error("Razorpay checkout failed to load");
      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: "AllWebsites.Design",
        description: planId === "yearly" ? "Plugin suite · 1 year" : "Plugin suite · 1 month",
        order_id: order.order_id,
        notes: {
          plan: planId,
          ...(figmaUserId ? { figmaUserId } : {}),
        },
        theme: { color: "#FF6112" },
        handler: (response) => {
          void (async () => {
            try {
              const verified = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  plan: planId,
                  figmaUserId,
                }),
              });
              const result = (await verified.json().catch(() => ({}))) as { ok?: boolean; error?: string };
              if (!verified.ok || !result.ok) {
                throw new Error(result.error || "Payment could not be verified.");
              }
              setPaid(true);
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Payment could not be verified.");
            } finally {
              setBusy(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError("Payment cancelled.");
          },
        },
      });
      rzp.on("payment.failed", (response) => {
        setBusy(false);
        setError(response.error?.description || "Payment failed.");
      });
      rzp.open();
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Checkout could not open.");
    }
  }

  useEffect(() => {
    if (!autoOpen || autoOpened || !enabled || !key || paid) return;
    autoOpened = true;
    void open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, enabled, key, planId]);

  if (!enabled) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        Checkout is unavailable until the Razorpay key is configured.
      </p>
    );
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => void open()}
        disabled={busy || paid || !key}
        data-checkout-plan={planId}
        className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-orange disabled:opacity-50"
      >
        {paid ? "Paid — suite unlocked" : busy ? "Opening payment…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-ink/60">{error}</p> : null}
    </div>
  );
}
