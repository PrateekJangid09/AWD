/** Paid access is live only while the subscription period has not ended. */
export function isLiveEntitlement(entitlement: {
  status?: unknown;
  current_period_end?: unknown;
} | null): boolean {
  if (!entitlement) return false;
  const status = entitlement.status;
  const endRaw = entitlement.current_period_end;
  const endMs =
    typeof endRaw === "string" && endRaw
      ? Date.parse(endRaw)
      : typeof endRaw === "number"
        ? endRaw
        : Number.NaN;
  if (!Number.isFinite(endMs) || endMs <= Date.now()) return false;
  return status === "active" || status === "trialing" || status === "cancelled";
}

export function unixToIso(seconds?: number | null) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}
