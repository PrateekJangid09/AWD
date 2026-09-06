import { CONTACT_EMAIL } from "@/lib/seo";

export async function notifyOwner(input: { subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) return { delivered: false as const };

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
        subject: input.subject,
        text: input.text,
      }),
    });
    return { delivered: response.ok };
  } catch {
    return { delivered: false as const };
  }
}
