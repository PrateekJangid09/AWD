/**
 * The evidence envelope. Every data point in this platform returns one of
 * these, exactly like the DTC Intel tool. The shape is the contract that
 * lets the UI render confidence chips, evidence popovers and honest
 * "unmeasured" states uniformly, no matter which micro-algorithm produced
 * the value.
 *
 *   value            the extracted / computed result (any shape)
 *   status           verified | probable | inferred | unmeasured | unavailable
 *   confidence       0..1
 *   confidence_band  derived from confidence (verified/probable/inferred/unknown)
 *   evidence[]       {method, source_url, snippet, observed_at}
 *   method_version   which algorithm version produced this
 *   computed_at      ISO timestamp
 */

export const METHOD_VERSION = "awd-2026.08.13-a";

export function envelope(value, status, confidence, evidenceList = [], extra = {}) {
  return {
    value,
    status,
    confidence: round2(confidence),
    confidence_band: band(confidence),
    evidence: evidenceList,
    source_class: "first_party",
    method_version: METHOD_VERSION,
    computed_at: new Date().toISOString(),
    ...extra
  };
}

export function evidence(method, sourceUrl, snippet, observedAt = new Date().toISOString()) {
  return {
    method,
    source_url: sourceUrl || null,
    snippet: snippet ? String(snippet).slice(0, 200) : null,
    observed_at: observedAt
  };
}

/** A first-class "we could not measure this" state, distinct from a low score. */
export function unmeasured(reason) {
  return envelope(null, "unmeasured", 0, [], { reason });
}

export function band(c) {
  if (c >= 0.85) return "verified";
  if (c >= 0.7) return "probable";
  if (c >= 0.45) return "inferred";
  return "unknown";
}

export function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

export function titleCase(s) {
  return String(s || "").replace(/\b\w/g, (c) => c.toUpperCase());
}
