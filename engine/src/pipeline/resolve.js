/**
 * URL validation, canonicalization and the single network boundary used by the
 * crawler. Every request and redirect hop is validated before it leaves the
 * process, which keeps SSRF protection consistent across every pipeline stage.
 */

import dns from "dns/promises";
import net from "net";
import { AsyncLocalStorage } from "async_hooks";

const fetchContext = new AsyncLocalStorage();
const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain", "0.0.0.0", "::", "::1"]);
const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".home", ".lan"];
const ALLOWED_PORTS = new Set(["", "80", "443"]);
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

export function runWithFetchContext(context, fn) {
  return fetchContext.run(context || {}, fn);
}

export function quickValidateUrl(raw) {
  let input = String(raw || "").trim();
  if (!/^https?:\/\//i.test(input)) input = "https://" + input;

  let u;
  try {
    u = new URL(input);
  } catch {
    return { ok: false, code: "invalid_url", reason: "Not a parseable URL" };
  }

  const problem = validateUrlShape(u);
  if (problem) return { ok: false, ...problem };
  const normalizedHost = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (isBlockedHostname(normalizedHost)) {
    return { ok: false, code: "ssrf_blocked", reason: "Host is not allowed" };
  }
  if (net.isIP(normalizedHost) && !isPublicIp(normalizedHost)) {
    return { ok: false, code: "ssrf_blocked", reason: "Host is not publicly routable" };
  }

  u.hostname = u.hostname.toLowerCase();
  u.hash = "";
  const tracking = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  tracking.forEach((p) => u.searchParams.delete(p));
  return { ok: true, normalizedUrl: u.toString() };
}

export async function resolveUrl(inputUrl, { budgetMs = 8000, maxHops = 6 } = {}) {
  const started = Date.now();
  const chain = [];
  let current = inputUrl;

  for (let hop = 0; hop <= maxHops; hop++) {
    const remaining = budgetMs - (Date.now() - started);
    if (remaining <= 0) throw new Error("resolve_budget_exceeded");
    await assertSafeUrl(current);

    let res = await fetchWithTimeout(current, {
      method: "HEAD",
      redirect: "manual",
      timeoutMs: Math.min(remaining, 5000)
    }).catch(() => null);

    if (!res || res.status === 403 || res.status === 405 || res.status === 501) {
      res = await fetchWithTimeout(current, {
        method: "GET",
        redirect: "manual",
        timeoutMs: Math.min(remaining, 5000),
        headers: { Range: "bytes=0-0", Accept: "text/html,*/*;q=0.1" }
      }).catch(() => null);
    }
    if (!res) break;

    if (REDIRECT_CODES.has(res.status)) {
      const loc = res.headers.get("location");
      if (!loc) break;
      if (hop === maxHops) throw new Error("too_many_redirects");
      const next = new URL(loc, current).toString();
      await assertSafeUrl(next);
      chain.push({ from: current, to: next, status: res.status });
      current = next;
      continue;
    }
    break;
  }

  const finalUrl = new URL(current);
  return {
    input_url: inputUrl,
    resolved_url: current,
    canonical_origin: finalUrl.origin,
    registrable_domain: registrableDomain(finalUrl.hostname),
    redirect_chain: chain
  };
}

export async function assertSafeUrl(rawUrl) {
  let u;
  try { u = new URL(rawUrl); } catch { throw new Error("invalid_url"); }
  const problem = validateUrlShape(u);
  if (problem) throw new Error(problem.code);
  await assertPublicHost(u.hostname);
  return u;
}

export async function assertPublicHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (isBlockedHostname(host)) throw new Error("ssrf_blocked_host");

  if (net.isIP(host)) {
    if (!isPublicIp(host)) throw new Error("ssrf_private_ip");
    return [{ address: host, family: net.isIP(host) }];
  }

  let addrs;
  try {
    addrs = await dns.lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("dns_resolution_failed");
  }
  if (!addrs.length) throw new Error("dns_resolution_failed");
  for (const { address } of addrs) {
    if (!isPublicIp(address)) throw new Error("ssrf_private_ip");
  }
  return addrs;
}

export async function fetchWithTimeout(url, { timeoutMs = 10000, maxRedirects = 6, ...opts } = {}) {
  const scoped = fetchContext.getStore() || {};
  const deadlineRemaining = Number.isFinite(scoped.deadlineAt) ? scoped.deadlineAt - Date.now() : Infinity;
  const effectiveTimeout = Math.max(1, Math.min(timeoutMs, deadlineRemaining));
  if (effectiveTimeout <= 1) throw new Error("pipeline_deadline_exceeded");

  const controller = new AbortController();
  const abort = () => controller.abort(scoped.signal?.reason || new Error("request_aborted"));
  if (scoped.signal?.aborted) abort();
  else scoped.signal?.addEventListener("abort", abort, { once: true });
  if (opts.signal?.aborted) controller.abort(opts.signal.reason);
  else opts.signal?.addEventListener("abort", () => controller.abort(opts.signal.reason), { once: true });

  const timer = setTimeout(() => controller.abort(new Error("request_timeout")), effectiveTimeout);
  let current = String(url);
  let method = String(opts.method || "GET").toUpperCase();
  let body = opts.body;
  const requestedRedirect = opts.redirect || "follow";

  try {
    for (let hop = 0; hop <= maxRedirects; hop++) {
      await assertSafeUrl(current);
      const response = await fetch(current, {
        ...opts,
        method,
        body,
        redirect: "manual",
        signal: controller.signal,
        headers: { ...BROWSER_HEADERS, ...(opts.headers || {}) }
      });

      if (requestedRedirect === "manual" || !REDIRECT_CODES.has(response.status)) return response;
      const loc = response.headers.get("location");
      if (!loc) return response;
      if (hop === maxRedirects) throw new Error("too_many_redirects");

      const next = new URL(loc, current).toString();
      await assertSafeUrl(next);
      if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === "POST")) {
        method = "GET";
        body = undefined;
      }
      current = next;
    }
    throw new Error("too_many_redirects");
  } finally {
    clearTimeout(timer);
    scoped.signal?.removeEventListener?.("abort", abort);
  }
}

function validateUrlShape(u) {
  if (!["http:", "https:"].includes(u.protocol)) return { code: "bad_scheme", reason: "Only http(s) is allowed" };
  if (u.username || u.password) return { code: "credentials_in_url", reason: "Credential-bearing URLs are rejected" };
  if (!ALLOWED_PORTS.has(u.port)) return { code: "blocked_port", reason: "Only standard web ports are allowed" };
  if (!u.hostname) return { code: "invalid_host", reason: "A hostname is required" };
  return null;
}

function isBlockedHostname(hostname) {
  const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  return BLOCKED_HOSTS.has(h) || BLOCKED_SUFFIXES.some((s) => h.endsWith(s));
}

function isPublicIp(ip) {
  const family = net.isIP(ip);
  if (family === 4) return isPublicIPv4(ip);
  if (family === 6) return isPublicIPv6(ip);
  return false;
}

function isPublicIPv4(ip) {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = octets;
  return !(
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  );
}

function isPublicIPv6(ip) {
  const s = ip.toLowerCase();
  if (s === "::" || s === "::1") return false;
  if (s.startsWith("fc") || s.startsWith("fd") || /^fe[89ab]/.test(s) || s.startsWith("ff")) return false;
  if (s.startsWith("2001:db8")) return false;
  const mapped = s.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPublicIPv4(mapped[1]);
  return true;
}


export function isSameSiteHost(candidate, base) {
  const a = String(candidate || "").toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
  const b = String(base || "").toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
  return Boolean(a && b && (a === b || a.endsWith("." + b)));
}

/** Lightweight PSL approximation for the prototype. */
export function registrableDomain(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
  if (net.isIP(host)) return host;
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  const twoLevelTlds = new Set(["co.uk", "org.uk", "com.au", "net.au", "co.in", "co.nz", "com.br", "com.mx", "com.sg", "com.hk", "com.pk", "co.za", "co.jp"]);
  const lastTwo = parts.slice(-2).join(".");
  return twoLevelTlds.has(lastTwo) ? parts.slice(-3).join(".") : lastTwo;
}

export const BROWSER_HEADERS = {
  "User-Agent": process.env.CRAWL_UA ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1"
};
