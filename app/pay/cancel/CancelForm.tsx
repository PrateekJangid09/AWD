"use client";

import { useState } from "react";

const CONTACT_EMAIL = "prateekjangid10@gmail.com";

export default function CancelForm({
  figmaUserId,
  trackId,
}: {
  figmaUserId: string;
  trackId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"ok" | "fail" | null>(null);
  const [detail, setDetail] = useState("");
  const mailto =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent("Cancel subscription failed")}` +
    `&body=${encodeURIComponent(`Hi Prateek,\n\nCancel subscription did not finish.\nFigma id: ${figmaUserId}\nTrack id: ${trackId || "—"}\n`)}`;

  async function onCancel() {
    if (!figmaUserId || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/plugins/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figmaUserId, trackId: trackId || undefined }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        cancelled?: boolean;
        error?: string;
        currentPeriodEnd?: string | null;
      };
      if (response.ok && data.cancelled) {
        setResult("ok");
        setDetail(
          data.currentPeriodEnd
            ? `Cancelled. You keep access until ${data.currentPeriodEnd.slice(0, 10)}.`
            : "Cancelled. You keep access until the end of this period.",
        );
      } else {
        setResult("fail");
        const errors: Record<string, string> = {
          no_subscription: "No paid subscription is attached to this Figma account.",
          razorpay_cancel_failed: "Razorpay did not cancel it.",
          razorpay_unconfigured: "Razorpay is not configured on the server.",
          figmaUserId_required: "Open Cancel from the plugin so we can attach your Figma id.",
        };
        setDetail(errors[data.error || ""] || "Cancel did not finish.");
      }
    } catch {
      setResult("fail");
      setDetail("Cancel did not finish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap max-w-xl space-y-5">
      {figmaUserId ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={busy || result === "ok"}
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-orange disabled:opacity-50"
        >
          {busy ? "Cancelling…" : result === "ok" ? "Cancelled" : "Cancel subscription"}
        </button>
      ) : (
        <p className="text-sm text-ink/70">
          Open Cancel from the Color Tool Suite Settings tab so we can attach your Figma id.
        </p>
      )}
      {detail && <p className="text-sm text-ink/80">{detail}</p>}
      <p className="text-sm text-ink/70">
        Contact me:{" "}
        <a className="text-orange underline decoration-2 underline-offset-2" href={mailto}>
          {CONTACT_EMAIL}
        </a>{" "}
        in case it didn&apos;t cancel.
      </p>
    </div>
  );
}
