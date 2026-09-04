import { createHmac, timingSafeEqual } from "node:crypto";

const IPS_URL = "https://api.paddle.com/ips";
const IP_CACHE_MS = 60 * 60 * 1000;

let ipCache: { at: number; cidrs: string[] } | null = null;

export async function paddleWebhookCidrs(): Promise<string[]> {
  const now = Date.now();
  if (ipCache && now - ipCache.at < IP_CACHE_MS) return ipCache.cidrs;
  const response = await fetch(IPS_URL, {
    headers: { "Paddle-Version": "1" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Paddle IP list failed: ${response.status}`);
  }
  const body = (await response.json()) as { data?: { ipv4_cidrs?: string[] } };
  const cidrs = body.data?.ipv4_cidrs ?? [];
  if (!cidrs.length) throw new Error("Paddle IP list was empty.");
  ipCache = { at: now, cidrs };
  return cidrs;
}

/** Exact /32 match, plus other CIDRs if Paddle starts returning them. */
export function ipInCidrs(ip: string, cidrs: string[]): boolean {
  const addr = ipv4ToInt(ip);
  if (addr === null) return false;
  for (const cidr of cidrs) {
    const [base, bitsRaw] = cidr.split("/");
    const bits = Number(bitsRaw ?? "32");
    const network = ipv4ToInt(base);
    if (network === null || !Number.isFinite(bits)) continue;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    if ((addr & mask) === (network & mask)) return true;
  }
  return false;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (
    ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0
  );
}

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

/**
 * Paddle Billing webhook signatures: `ts=...;h1=...` over `${ts}:${rawBody}`.
 * https://developer.paddle.com/webhooks/signature-verification
 */
export function verifyPaddleSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(";").map((part) => {
      const idx = part.indexOf("=");
      return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()];
    }),
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;
  const expected = createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const a = Buffer.from(h1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
