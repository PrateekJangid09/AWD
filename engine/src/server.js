/**
 * HTTP surface for allwebsites.design (local intelligence engine).
 *
 * Public (read-only, allowlisted):
 *   GET  /api/sites
 *   GET  /api/facets
 *   GET  /api/sites/:domain
 *   GET  /api/site/:domain     (alias → public DTO only)
 *
 * Admin (requires auth — Bearer ADMIN_SECRET or session cookie):
 *   POST /api/admin/login
 *   POST /api/admin/logout
 *   POST /api/admin/analyze
 *   GET  /api/admin/job/:id
 *   POST /api/admin/batch
 *   GET  /api/admin/batch/:id
 *   POST /api/admin/reanalyze
 *   GET  /api/admin/site/:domain/internal
 *   GET  /admin
 *
 * Analysis never runs inside the request; jobs are enqueued for background workers.
 */
import express from "express";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createRunner, parseUrlsFromCsv } from "./queue.js";
import { listSites, facets, getSite } from "./db.js";
import { toPublicSite, toPublicListItem, toInternalSite } from "./publicSite.js";
import {
  requireAdmin,
  authenticateRequest,
  loginHandler,
  logoutHandler,
  isAuthConfigured
} from "./auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");
const ADMIN_HTML = join(__dirname, "..", "admin", "admin.html");
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

const runner = createRunner({
  dbPath: join(__dirname, "..", "data", "allwebsites.db"),
  shotsDir: join(PUBLIC, "shots")
});

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "8mb" }));
app.use(express.text({ type: ["text/csv", "text/plain"], limit: "8mb" }));

/* ---- Admin HTML (auth-gated; not linked from public nav) ---- */
app.get(["/admin", "/admin.html"], (req, res) => {
  if (!authenticateRequest(req)) {
    return res.status(401).type("html").send(loginPageHtml());
  }
  return res.sendFile(ADMIN_HTML);
});

app.use(express.static(PUBLIC, { index: "index.html", extensions: ["html"] }));
app.use("/shots", express.static(join(PUBLIC, "shots")));

/* ---- Public read-only API ---- */
app.get("/api/facets", (req, res) => {
  try {
    res.json(facets(runner.db));
  } catch {
    res.status(500).json({ error: "failed to load facets" });
  }
});

app.get("/api/sites", (req, res) => {
  try {
    const { category, style, q, sort } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 60, 120);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = listSites(runner.db, { category, style, q, sort, limit, offset });
    res.json(rows.map(toPublicListItem));
  } catch {
    res.status(500).json({ error: "failed to list sites" });
  }
});

function sendPublicSite(req, res) {
  try {
    const site = getSite(runner.db, req.params.domain);
    if (!site) return res.status(404).json({ error: "not found" });
    return res.json(toPublicSite(site));
  } catch {
    return res.status(500).json({ error: "failed to load site" });
  }
}

app.get("/api/sites/:domain", sendPublicSite);
app.get("/api/site/:domain", sendPublicSite); // backward-compatible alias — public DTO only

/* ---- Reject legacy public analysis routes ---- */
function goneAnalyze(_req, res) {
  res.status(404).json({ error: "not found" });
}
app.post("/api/analyze", goneAnalyze);
app.get("/api/job/:id", goneAnalyze);
app.post("/api/batch", goneAnalyze);
app.get("/api/batch/:id", goneAnalyze);

/* ---- Admin API ---- */
app.post("/api/admin/login", loginHandler);
app.post("/api/admin/logout", logoutHandler);

app.get("/api/admin/session", requireAdmin, (_req, res) => {
  res.json({ ok: true, auth: "admin" });
});

app.post("/api/admin/analyze", requireAdmin, (req, res) => {
  const url = ((req.body && req.body.url) || "").trim();
  if (!url || !/^([a-z]+:\/\/)?[a-z0-9.-]+\.[a-z]{2,}/i.test(url)) {
    return res.status(400).json({ error: "provide a valid url" });
  }
  const job = runner.enqueue(/^https?:\/\//i.test(url) ? url : "https://" + url, {
    wantScreenshot: !(req.body && req.body.screenshot === false)
  });
  res.status(202).json({ job_id: job.id, status: job.status });
});

app.post("/api/admin/reanalyze", requireAdmin, (req, res) => {
  const url = ((req.body && req.body.url) || (req.body && req.body.domain) || "").trim();
  if (!url) return res.status(400).json({ error: "provide a valid url or domain" });
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const job = runner.enqueue(normalized, {
    wantScreenshot: !(req.body && req.body.screenshot === false)
  });
  res.status(202).json({ job_id: job.id, status: job.status });
});

app.get("/api/admin/job/:id", requireAdmin, (req, res) => {
  const job = runner.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "unknown job" });
  res.json({
    id: job.id,
    status: job.status,
    error: job.error || null,
    stages: job.stages || {},
    fields: job.fields || {},
    result: job.result ? toPublicSite(job.result) : null
  });
});

app.post("/api/admin/batch", requireAdmin, (req, res) => {
  let urls = [];
  const wantScreenshot = !(req.body && req.body.screenshot === false);
  if (typeof req.body === "string") {
    urls = parseUrlsFromCsv(req.body);
  } else if (req.body && Array.isArray(req.body.urls)) {
    urls = req.body.urls;
  } else if (req.body && typeof req.body.csv === "string") {
    urls = parseUrlsFromCsv(req.body.csv);
  }
  if (!urls.length) return res.status(400).json({ error: "no usable urls found in upload" });
  if (urls.length > 5000) {
    return res.status(413).json({ error: "batch too large; split into files of <= 5000 urls" });
  }

  const batch = runner.enqueueBatch(urls, {
    wantScreenshot,
    skipExisting: !(req.body && req.body.reanalyze)
  });
  res.status(202).json({
    batch_id: batch.id,
    total: batch.total,
    requested: batch.requested,
    skipped: batch.skipped
  });
});

app.get("/api/admin/batch/:id", requireAdmin, (req, res) => {
  const b = runner.getBatch(req.params.id);
  if (!b) return res.status(404).json({ error: "unknown batch" });
  res.json(b);
});

app.get("/api/admin/site/:domain/internal", requireAdmin, (req, res) => {
  const site = getSite(runner.db, req.params.domain);
  if (!site) return res.status(404).json({ error: "not found" });
  res.json(toInternalSite(site));
});

/* Generic error handler — no stack traces to clients */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

export { app, runner };

function loginPageHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin login</title><link rel="stylesheet" href="/app.css"></head>
<body><main class="detail" style="max-width:420px;margin:10vh auto">
  <h1 style="font-size:1.4rem;margin-bottom:8px">Admin</h1>
  <p style="color:var(--ink-3);margin-bottom:16px">Enter your admin secret to access the intelligence engine.</p>
  <form id="f" class="analyze" style="flex-direction:column;align-items:stretch;gap:10px">
    <input id="secret" type="password" autocomplete="current-password" placeholder="ADMIN_SECRET" aria-label="Admin secret" style="flex:1">
    <button class="btn" type="submit">Sign in</button>
  </form>
  <p id="err" style="color:#b00020;margin-top:12px;display:none">Unauthorized</p>
</main>
<script>
document.getElementById("f").onsubmit = async (e) => {
  e.preventDefault();
  const secret = document.getElementById("secret").value;
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret })
  });
  if (!res.ok) { document.getElementById("err").style.display = "block"; return; }
  location.href = "/admin";
};
</script></body></html>`;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  app.listen(PORT, HOST, () => {
    const authNote = isAuthConfigured()
      ? "admin auth configured"
      : "WARNING: set ADMIN_SECRET and SESSION_SECRET before using /admin";
    console.log(`allwebsites.design engine on http://${HOST}:${PORT} (${authNote})`);
  });
}
