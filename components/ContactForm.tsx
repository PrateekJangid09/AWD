"use client";

import Link from "next/link";
import { useState } from "react";

export type ContactField = "reason" | "website";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "handoff" }
  | { kind: "error"; message: string };

const INPUT =
  "mt-2 w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-orange";
const LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted";

export default function ContactForm({
  to,
  reasons,
  defaultReason,
  websiteLabel,
  websiteRequired = false,
  messageLabel = "Message",
  submitLabel = "Send message",
}: {
  to: string;
  reasons?: { t: string; d: string }[];
  defaultReason: string;
  websiteLabel?: string;
  websiteRequired?: boolean;
  messageLabel?: string;
  submitLabel?: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [reason, setReason] = useState(defaultReason);

  function mailtoHref(values: {
    name: string;
    email: string;
    reason: string;
    website: string;
    message: string;
  }) {
    const subject = `[AllWebsites.Design] ${values.reason} — ${values.name}`;
    const body = [
      `Reason: ${values.reason}`,
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.website ? `Website: ${values.website}` : null,
      "",
      values.message,
    ]
      .filter((line) => line !== null)
      .join("\n");
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      reason: String(data.get("reason") ?? defaultReason),
      website: String(data.get("website") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      company: String(data.get("company") ?? ""),
    };

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        delivered?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setStatus({
          kind: "error",
          message: result.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      if (result.delivered) {
        form.reset();
        setReason(defaultReason);
        setStatus({ kind: "sent" });
        return;
      }

      // No mail provider configured: hand off to the visitor's mail client.
      window.location.href = mailtoHref(values);
      setStatus({ kind: "handoff" });
    } catch {
      window.location.href = mailtoHref(values);
      setStatus({ kind: "handoff" });
    }
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5" aria-label="Contact form">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>Name</span>
          <input name="name" type="text" required autoComplete="name" className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>Email</span>
          <input name="email" type="email" required autoComplete="email" className={INPUT} />
        </label>
      </div>

      {reasons && reasons.length > 0 && (
        <fieldset>
          <legend className={LABEL}>Reason</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {reasons.map((r) => (
              <label
                key={r.t}
                className="flex cursor-pointer items-start gap-3 border border-ink/15 bg-paper p-3 transition-colors has-[:checked]:border-orange has-[:checked]:bg-orange/10"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.t}
                  checked={reason === r.t}
                  onChange={() => setReason(r.t)}
                  className="mt-1 accent-orange"
                />
                <span>
                  <span className="block text-sm font-semibold">{r.t}</span>
                  <span className="block text-xs text-ink/60">{r.d}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {(!reasons || reasons.length === 0) && (
        <input type="hidden" name="reason" value={defaultReason} />
      )}

      {websiteLabel && (
        <label className="block">
          <span className={LABEL}>
            {websiteLabel}{" "}
            {!websiteRequired && <span className="text-ink/30">(optional)</span>}
          </span>
          <input
            name="website"
            type="url"
            required={websiteRequired}
            placeholder="https://"
            className={INPUT}
          />
        </label>
      )}

      <label className="block">
        <span className={LABEL}>{messageLabel}</span>
        <textarea name="message" required rows={5} className={`${INPUT} resize-y`} />
      </label>

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
        {sending ? "Sending…" : `${submitLabel} →`}
      </button>

      <div aria-live="polite">
        {status.kind === "sent" && (
          <p className="text-sm font-medium text-ink">
            Thanks — that reached the editorial inbox. We reply to everything we can.
          </p>
        )}
        {status.kind === "handoff" && (
          <p className="text-sm leading-relaxed text-soft">
            Your mail app should be opening with the message ready to send. If nothing
            happened, email{" "}
            <a
              href={`mailto:${to}`}
              className="font-medium text-ink underline decoration-orange decoration-2 underline-offset-2"
            >
              {to}
            </a>{" "}
            directly.
          </p>
        )}
        {status.kind === "error" && (
          <p className="text-sm font-medium text-orange-700">{status.message}</p>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Or email{" "}
        <a
          href={`mailto:${to}`}
          className="font-medium text-ink underline decoration-orange decoration-2 underline-offset-2"
        >
          {to}
        </a>
        . By sending, you agree to our{" "}
        <Link
          href="/privacy-policy"
          className="underline decoration-orange decoration-2 underline-offset-2"
        >
          privacy policy
        </Link>
        . We only use your details to reply.
      </p>
    </form>
  );
}
