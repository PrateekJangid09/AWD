"use client";

import { useState } from "react";
import { checkoutEnabled } from "@/lib/paddle-catalog";

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
}: {
  priceId: string;
  label: string;
  figmaUserId?: string;
  paddleCustomerId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const enabled = checkoutEnabled();
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";

  async function open() {
    if (!enabled || !token) return;
    setBusy(true);
    try {
      await loadPaddle(token, paddleCustomerId);
      window.Paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: figmaUserId ? { figmaUserId } : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        Checkout stays closed until Paddle finishes domain approval and account
        verification. The prices above are the live catalog.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy || !token}
      className="mt-5 inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-orange disabled:opacity-50"
    >
      {busy ? "Opening…" : label}
    </button>
  );
}
