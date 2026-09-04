"use client";

import { useEffect, useState } from "react";
import { checkoutEnabled, PADDLE_CLIENT_TOKEN } from "@/lib/paddle-catalog";

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: {
        token: string;
        pwCustomer?: { id: string };
      }) => void;
      Checkout: {
        open: (opts: {
          items: Array<{ priceId: string; quantity: number }>;
          customData?: Record<string, string>;
        }) => void;
      };
    };
  }
}

let paddleBoot: Promise<void> | null = null;
let autoOpened = false;

function loadPaddle(token: string, customerId?: string) {
  if (!paddleBoot) {
    paddleBoot = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-paddle]");
      const start = () => {
        if (!window.Paddle) {
          reject(new Error("Paddle.js failed to load"));
          return;
        }
        // Live is the default. Do not call Paddle.Environment.set("sandbox").
        window.Paddle.Initialize({
          token,
          ...(customerId ? { pwCustomer: { id: customerId } } : {}),
        });
        resolve();
      };
      if (existing) {
        start();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.dataset.paddle = "true";
      script.onload = start;
      script.onerror = () => reject(new Error("Paddle.js failed to load"));
      document.head.appendChild(script);
    });
  }
  return paddleBoot;
}

export default function CheckoutButton({
  priceId,
  label,
  figmaUserId,
  paddleCustomerId,
  autoOpen = false,
}: {
  priceId: string;
  label: string;
  figmaUserId?: string;
  paddleCustomerId?: string;
  autoOpen?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = checkoutEnabled();
  const token = PADDLE_CLIENT_TOKEN;

  async function open() {
    if (!enabled || !token) return;
    setBusy(true);
    setError(null);
    try {
      await loadPaddle(token, paddleCustomerId);
      window.Paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: figmaUserId ? { figmaUserId } : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not open.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!autoOpen || autoOpened || !enabled || !token) return;
    autoOpened = true;
    void open();
    // open is stable enough for a one-shot overlay; exhaustive-deps would retrigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, enabled, token, priceId]);

  if (!enabled) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        Checkout is unavailable until the Paddle client token is configured.
      </p>
    );
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => void open()}
        disabled={busy || !token}
        data-checkout-price={priceId}
        className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-orange disabled:opacity-50"
      >
        {busy ? "Opening payment…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-ink/60">{error}</p> : null}
    </div>
  );
}
