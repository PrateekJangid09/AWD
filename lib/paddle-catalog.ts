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
    period: "month",
    blurb: "Unlimited applies across Chromary, Colorhyme, TrueGradient and WebPalette.",
  },
  {
    id: "yearly" as const,
    priceId: PADDLE_PRICE_YEARLY,
    name: "Yearly",
    amountUsd: 30,
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

export type PluginId = (typeof PLUGIN_IDS)[number];

export function isPluginId(value: string): value is PluginId {
  return (PLUGIN_IDS as readonly string[]).includes(value);
}

/** Public Paddle.js client token (live). Not a secret. */
export const PADDLE_CLIENT_TOKEN =
  process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "live_2a71b76e9af63dc5cb7f9d44760";

export function checkoutEnabled() {
  return Boolean(PADDLE_CLIENT_TOKEN);
}

export function planFromQuery(raw?: string | string[] | null): "monthly" | "yearly" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "yearly" ? "yearly" : "monthly";
}
