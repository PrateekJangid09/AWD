/**
 * In-process job queue + analysis context, with batch support.
 *
 * Extraction never runs inside an HTTP request (same rule as the DTC tool).
 * The API enqueues jobs, returns immediately, and a bounded pool of background
 * workers drains the queue. A CSV import is just a batch of enqueued jobs with
 * shared progress tracking.
 */
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { runPipeline } from "./pipeline/index.js";
import { openDb, upsertSite, getExistingDateAdded, getSite } from "./db.js";

export function createRunner({ dbPath = "data/allwebsites.db", shotsDir = "public/shots", concurrency = 3 } = {}) {
  mkdirSync(shotsDir, { recursive: true });
  const db = openDb(dbPath);
  const jobs = new Map();
  const batches = new Map();
  const pending = [];
  let active = 0;

  function makeContext(job) {
    const fields = {};
    const stages = {};
    const domainGuess = safeDomain(job.url);
    return {
      wantScreenshot: job.wantScreenshot !== false,
      shotsDir,
      screenshotPath: join(shotsDir, `${domainGuess}.png`),
      faviconPath: join(shotsDir, `${domainGuess}__favicon`),
      pageShotPath: (slug) => join(shotsDir, `${domainGuess}__${slug}.png`),
      existingDateAdded: getExistingDateAdded(db, domainGuess),
      fields,
      stages,
      setField(k, v) { fields[k] = v; job.fields = fields; },
      setStage(name, status, extra = {}) {
        stages[name] = { status, ...extra, at: new Date().toISOString() };
        job.stages = stages;
        job.updated_at = new Date().toISOString();
      }
    };
  }

  async function worker() {
    if (active >= concurrency) return;
    const job = pending.shift();
    if (!job) return;
    active++;
    job.status = "running";
    job.started_at = new Date().toISOString();
    const ctx = makeContext(job);
    try {
      const fields = await runPipeline(job.url, ctx);
      const saved = upsertSite(db, fields);
      job.status = "done";
      job.result = saved;
      job.category = saved.category;
    } catch (err) {
      job.status = "error";
      job.error = err.message;
    } finally {
      active--;
      job.finished_at = new Date().toISOString();
      if (job.batchId) updateBatch(job);
      setImmediate(drain);
    }
  }

  function drain() { while (active < concurrency && pending.length) worker(); }

  function enqueue(url, opts = {}) {
    const id = randomUUID();
    const job = {
      id, url, status: "queued", wantScreenshot: opts.wantScreenshot,
      batchId: opts.batchId || null, created_at: new Date().toISOString(), stages: {}, fields: {}
    };
    jobs.set(id, job);
    pending.push(job);
    setImmediate(drain);
    return job;
  }

  /* ---- batch (CSV import) ---- */
  function enqueueBatch(urls, opts = {}) {
    const id = randomUUID();
    const seen = new Set();
    const items = [];
    let skipped = 0;

    for (const raw of urls) {
      const norm = normalizeUrl(raw);
      if (!norm) continue;
      const dom = safeDomain(norm);
      if (seen.has(dom)) continue;                       // dedupe within the file
      seen.add(dom);
      if (opts.skipExisting !== false && getSite(db, dom)) { skipped++; continue; } // already analyzed
      items.push({ url: norm, domain: dom, status: "queued", job_id: null });
    }

    const batch = {
      id, created_at: new Date().toISOString(),
      total: items.length, requested: urls.length, skipped,
      done: 0, failed: 0, items,
      wantScreenshot: opts.wantScreenshot !== false
    };
    batches.set(id, batch);

    for (const item of items) {
      const job = enqueue(item.url, { wantScreenshot: batch.wantScreenshot, batchId: id });
      item.job_id = job.id;
    }
    return batch;
  }

  function updateBatch(job) {
    const batch = batches.get(job.batchId);
    if (!batch) return;
    const item = batch.items.find((i) => i.job_id === job.id);
    if (!item) return;
    if (job.status === "done") { item.status = "done"; item.category = job.category || null; batch.done++; }
    else if (job.status === "error") { item.status = "error"; item.error = job.error; batch.failed++; }
    batch.updated_at = new Date().toISOString();
  }

  function getBatch(id) {
    const b = batches.get(id);
    if (!b) return null;
    const running = b.items.filter((i) => i.status === "queued" && jobs.get(i.job_id)?.status === "running").length;
    return {
      id: b.id, total: b.total, requested: b.requested, skipped: b.skipped,
      done: b.done, failed: b.failed,
      pending: b.total - b.done - b.failed,
      running,
      finished: b.done + b.failed >= b.total,
      wantScreenshot: b.wantScreenshot,
      created_at: b.created_at, updated_at: b.updated_at,
      items: b.items.slice(0, 1000).map((i) => ({ domain: i.domain, status: liveStatus(i), category: i.category || null, error: i.error || null }))
    };
  }
  function liveStatus(item) {
    if (item.status !== "queued") return item.status;
    const j = jobs.get(item.job_id);
    return j && j.status === "running" ? "running" : "queued";
  }

  return {
    db,
    enqueue,
    enqueueBatch,
    getJob: (id) => jobs.get(id) || null,
    getBatch,
    stats: () => ({ active, pending: pending.length, jobs: jobs.size, batches: batches.size })
  };
}

export function normalizeUrl(raw) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/^['"]|['"]$/g, "");
  if (!s || /^(url|website|link|domain|site)$/i.test(s)) return null; // header cell
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try { const u = new URL(s); if (!/\./.test(u.hostname)) return null; return u.href; }
  catch { return null; }
}

/**
 * Parse a CSV / plain list into a URL array. Detects a url-ish column from the
 * header; otherwise falls back to the first column, or the whole line for a
 * plain list.
 */
export function parseUrlsFromCsv(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const first = splitCsvLine(lines[0]);
  let col = -1, startRow = 0;
  const headerIdx = first.findIndex((c) => /^(url|website|link|domain|site|homepage)$/i.test(c.trim()));
  if (headerIdx >= 0) { col = headerIdx; startRow = 1; }

  const urls = [];
  for (let i = startRow; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (col >= 0) { if (cells[col]) urls.push(cells[col]); continue; }
    const urlish = cells.find((c) => /\.[a-z]{2,}/i.test(c) && !/\s/.test(c.trim()));
    urls.push(urlish || cells[0]);
  }
  return urls.filter(Boolean);
}

function splitCsvLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { q = !q; continue; }
    if (ch === "," && !q) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function safeDomain(u) {
  try { return new URL(/^https?:\/\//.test(u) ? u : "https://" + u).hostname.replace(/^www\./, ""); }
  catch { return "site"; }
}
