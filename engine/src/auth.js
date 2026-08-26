/**
 * Modular admin authentication for the local intelligence engine.
 *
 * Supports:
 *   - Authorization: Bearer <ADMIN_SECRET>   (CLI / scripts / curl)
 *   - HttpOnly session cookie after POST /api/admin/login
 *
 * Secrets come only from environment variables — never from frontend JS.
 * Designed so Cloudflare Access / an IdP can replace cookie login later
 * without moving /api/admin routes.
 */
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const COOKIE_NAME = "awd_admin_session";
const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function secretsEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  try {
    return timingSafeEqual(aa, bb);
  } catch {
    return false;
  }
}

export function getAdminSecret() {
  return process.env.ADMIN_SECRET || "";
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_SECRET || "";
}

export function isAuthConfigured() {
  return Boolean(getAdminSecret() && getSessionSecret());
}

export function requireAdmin(req, res, next) {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: "admin auth not configured" });
  }
  if (authenticateRequest(req)) return next();
  return res.status(401).json({ error: "unauthorized" });
}

export function authenticateRequest(req) {
  const secret = getAdminSecret();
  if (!secret) return false;

  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (secretsEqual(token, secret)) return true;
  }

  const cookies = parseCookies(req.headers.cookie || "");
  const session = cookies[COOKIE_NAME];
  if (session && verifySessionToken(session)) return true;

  return false;
}

export function loginHandler(req, res) {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: "admin auth not configured" });
  }
  const provided = (req.body && (req.body.secret || req.body.password || req.body.token)) || "";
  if (!secretsEqual(String(provided), getAdminSecret())) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const token = mintSessionToken();
  const secure = shouldUseSecureCookie(req);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(DEFAULT_TTL_MS / 1000)}${secure ? "; Secure" : ""}`
  );
  return res.json({ ok: true });
}

export function logoutHandler(req, res) {
  const secure = shouldUseSecureCookie(req);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`
  );
  return res.json({ ok: true });
}

export function mintSessionToken(ttlMs = DEFAULT_TTL_MS) {
  const sessionSecret = getSessionSecret();
  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      exp: Date.now() + ttlMs,
      nonce: randomBytes(8).toString("hex")
    }),
    "utf8"
  ).toString("base64url");
  const sig = sign(payload, sessionSecret);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const sessionSecret = getSessionSecret();
  if (!sessionSecret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!secretsEqual(sign(payload, sessionSecret), sig)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data || data.v !== 1 || typeof data.exp !== "number") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header).split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function shouldUseSecureCookie(req) {
  if (process.env.COOKIE_SECURE === "1") return true;
  if (process.env.COOKIE_SECURE === "0") return false;
  if (process.env.NODE_ENV === "production") return true;
  const proto = (req.headers["x-forwarded-proto"] || "").toString().split(",")[0].trim();
  return proto === "https";
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
