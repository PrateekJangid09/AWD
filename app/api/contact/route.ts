import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/seo";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  reason?: string;
  website?: string;
  message?: string;
  // Honeypot: real people never fill this in.
  company?: string;
};

const MAX = { name: 120, email: 160, reason: 60, website: 300, message: 5000 };

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (clean(body.company, 50)) {
    // Silently accept spam so the bot does not learn anything.
    return NextResponse.json({ ok: true, delivered: true });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const reason = clean(body.reason, MAX.reason) || "General";
  const website = clean(body.website, MAX.website);
  const message = clean(body.message, MAX.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 },
    );
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { error: "That email address does not look right." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  // Without a mail provider the browser falls back to opening the visitor's
  // own mail client, so the form still reaches the inbox.
  if (!apiKey || !from) {
    return NextResponse.json({ ok: true, delivered: false, fallback: "mailto" });
  }

  const subject = `[AllWebsites.Design] ${reason} — ${name}`;
  const text = [
    `Reason: ${reason}`,
    `Name: ${name}`,
    `Email: ${email}`,
    website ? `Website: ${website}` : null,
    "",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: true, delivered: false, fallback: "mailto" });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch {
    return NextResponse.json({ ok: true, delivered: false, fallback: "mailto" });
  }
}
