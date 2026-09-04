/** Public Paddle Billing catalog IDs (live). Not secrets. */
export const PADDLE_PRODUCT_ID = "pro_01m1pay3kybbzcd3mm4n5dc7gy";
export const PADDLE_PRICE_MONTHLY = "pri_01m1payhevwpedkhbb1evj09bj";
export const PADDLE_PRICE_YEARLY = "pri_01m1payhgxxzfryc575496n65w";

export const PLANS = [
  {
    id: "monthly" as const,
    priceId: PADDLE_PRICE_MONTHLY,
    name: "Monthly",
    amountUsd: 3,
    amountInr: 249,
    amountPaise: 24900,
    currency: "INR" as const,
    accessDays: 30,
    period: "month",
    blurb: "Unlimited applies across Chromary, Colorhyme, TrueGradient and WebPalette.",
  },
  {
    id: "yearly" as const,
    priceId: PADDLE_PRICE_YEARLY,
    name: "Yearly",
    amountUsd: 30,
    amountInr: 2490,
    amountPaise: 249000,
    currency: "INR" as const,
    accessDays: 365,
    period: "year",
    blurb: "Two months free versus paying monthly. Same suite, billed once a year.",
  },
];

export const FREE_USES_PER_PLUGIN = 3;

export const PLUGIN_IDS = [
  "chromary",
  "colorhyme",
  "truegradient",
  "webpalette",
] as const;

export type PlanId = (typeof PLANS)[number]["id"];
export type PluginId = (typeof PLUGIN_IDS)[number];

export function isPluginId(value: string): value is PluginId {
  return (PLUGIN_IDS as readonly string[]).includes(value);
}

/** Public Paddle.js client token (live). Not a secret. Kept for the unused Paddle webhook. */
export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";

/** Public Razorpay key id. Never expose RAZORPAY_KEY_SECRET to the client. */
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export function checkoutEnabled() {
  return Boolean(RAZORPAY_KEY_ID);
}

export function planFromQuery(raw?: string | string[] | null): "monthly" | "yearly" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "yearly" ? "yearly" : "monthly";
}

export function planById(id: string) {
  return PLANS.find((plan) => plan.id === id) ?? null;
}
