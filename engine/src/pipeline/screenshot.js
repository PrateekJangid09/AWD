/**
 * DP: Complete full-page screenshot (+ key-page screenshots)
 * =========================================================
 * Many sites reveal sections only as they enter the viewport
 * (IntersectionObserver / scroll-triggered animations) and defer images with
 * loading="lazy". A single top-to-bottom pass, or a naive fullPage:true on
 * load, captures half-animated or blank sections.
 *
 * The capture sequence (one shared routine, `captureOnPage`, so the homepage
 * and every extra key page get the IDENTICAL logic):
 *
 *   1. Disable smooth-scroll so programmatic jumps are instant & deterministic.
 *   2. Descend the page in viewport-sized steps, pausing at each so every
 *      scroll-triggered animation fires and every lazy image begins loading.
 *   3. Rest at the very bottom (footer) so late/staggered animations settle.
 *   4. Force every lazy asset to load, then wait for fonts + images.
 *   5. Scroll back to the TOP and rest so "on-enter" hero animations settle.
 *   6. Optionally FREEZE animations at their end state.
 *   7. Take the full-page screenshot.
 *
 * `captureFullPage`  captures one page (the homepage) and also returns the
 *                    rendered DOM, design tokens and response headers used by
 *                    the palette/fonts/style/tech stages.
 * `captureKeyPages`  reuses the SAME routine to screenshot each discovered key
 *                    page (About, Contact, Pricing, Jobs/Careers...) in one
 *                    shared browser session.
 */

import { assertSafeUrl } from "./resolve.js";
import { PAGE_TOKENS_FN } from "./designTokens.js";

const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE = 1; // bump to 2 for retina captures (heavier files)

async function loadChromium() {
  try { const { chromium } = await import("playwright"); return chromium; }
  catch { return null; }
}

async function launchContext(chromium) {
  const browser = await chromium.launch({ headless: true, args: ["--hide-scrollbars"] });
  const context = await browser.newContext({
    userAgent: process.env.CRAWL_UA || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    ignoreHTTPSErrors: false,
    serviceWorkers: "block",
    acceptDownloads: false
  });
  // Same SSRF discipline as the crawler: validate every subresource origin.
  const safeOrigins = new Map();
  await context.route("**/*", async (route) => {
    const target = route.request().url();
    if (!/^https?:/i.test(target)) return route.continue();
    try {
      const key = new URL(target).origin;
      let v = safeOrigins.get(key);
      if (!v) { v = assertSafeUrl(target); safeOrigins.set(key, v); }
      await v;
      return route.continue();
    } catch { return route.abort("blockedbyclient"); }
  });
  return { browser, context };
}

/**
 * The shared capture routine. Operates on an already-open page, performs the
 * scroll dance, and writes/returns the screenshot. This is the single source of
 * truth for "how we screenshot a page".
 */
async function captureOnPage(page, url, opts) {
  const {
    budgetMs = 45000, stepPauseMs = 350, bottomRestMs = 1200, topRestMs = 900,
    maxScrollSteps = 60, freezeAnimations = true, returnHtml = false,
    collectTokens = false, outPath = null
  } = opts;

  const work = (async () => {
    const navResponse = await page.goto(url, { waitUntil: "domcontentloaded", timeout: Math.max(8000, budgetMs - 8000) });
    const responseHeaders = navResponse ? navResponse.headers() : {};

    // (1) kill smooth scrolling; make programmatic scroll instant.
    await page.addStyleTag({ content: `*{scroll-behavior:auto !important;}` }).catch(() => {});
    await page.waitForTimeout(600); // let first paint / hero mount

    // (2)+(3) descend in steps to the footer, pausing so anims fire & lazy
    // assets load. We re-measure height each step because content can grow.
    const meta = await page.evaluate(async ({ stepPause, maxSteps, restMs }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const vh = window.innerHeight;
      let steps = 0, lastBottom = -1;
      while (steps < maxSteps) {
        const doc = document.documentElement;
        const fullH = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
        const y = Math.min((steps + 1) * vh * 0.9, fullH); // 90% overlap avoids skipping
        window.scrollTo(0, y);
        await sleep(stepPause);
        steps++;
        const atBottom = (window.scrollY + vh) >= fullH - 4;
        if (atBottom && fullH === lastBottom) break;
        lastBottom = fullH;
        if (atBottom) {
          await sleep(stepPause);
          const grown = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
          if (grown <= fullH) break;
        }
      }
      window.scrollTo(0, Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0));
      await sleep(restMs);
      return { steps, finalHeight: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0), viewport: vh };
    }, { stepPause: stepPauseMs, maxSteps: maxScrollSteps, restMs: bottomRestMs });

    // (4) force lazy assets to load, then wait for images + fonts.
    await page.evaluate(async () => {
      document.querySelectorAll("img[loading='lazy']").forEach((img) => { img.loading = "eager"; });
      document.querySelectorAll("img[data-src]").forEach((img) => { if (!img.src) img.src = img.getAttribute("data-src"); });
      const imgs = Array.from(document.images);
      await Promise.allSettled(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
    });
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});

    // (5) back to the TOP and rest so hero/on-enter animations are settled.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(topRestMs);

    // (6) freeze animations at their END state so the stitched capture is clean.
    if (freezeAnimations) {
      await page.addStyleTag({ content: `
        *,*::before,*::after{
          animation-duration:0s !important; animation-delay:0s !important;
          transition-duration:0s !important; transition-delay:0s !important;
          animation-play-state:paused !important; animation-fill-mode:forwards !important;
        }` }).catch(() => {});
      await page.waitForTimeout(200);
    }

    // (7) full-page screenshot.
    const shotOpts = { fullPage: true, type: "png", animations: "disabled", caret: "hide" };
    let buffer;
    if (outPath) { await page.screenshot({ ...shotOpts, path: outPath }); }
    else { buffer = await page.screenshot(shotOpts); }

    const renderedHtml = returnHtml ? await page.content().catch(() => null) : null;
    const designTokens = collectTokens ? await page.evaluate(PAGE_TOKENS_FN).catch(() => null) : null;

    return { steps: meta.steps, finalHeight: meta.finalHeight, viewport: meta.viewport, buffer, renderedHtml, designTokens, responseHeaders };
  })();

  let result, timedOut = false;
  try {
    result = await Promise.race([
      work,
      new Promise((_, rej) => setTimeout(() => rej(new Error("screenshot_budget_exceeded")), budgetMs))
    ]);
  } catch (err) {
    timedOut = /budget/.test(err.message);
    result = { error: err.message };
  }

  if (result.error) return { captured: false, timedOut, error: result.error };
  return {
    captured: true,
    outPath: outPath || null,
    base64: result.buffer ? result.buffer.toString("base64") : null,
    bytes: result.buffer ? result.buffer.length : null,
    scroll_steps: result.steps,
    page_height_px: result.finalHeight,
    viewport_px: result.viewport,
    rendered_html: result.renderedHtml || null,
    design_tokens: result.designTokens || null,
    response_headers: result.responseHeaders || null,
    method: "scroll-to-footer -> settle -> load-lazy -> scroll-to-top -> freeze -> fullPage",
    captured_at: new Date().toISOString()
  };
}

/** Homepage capture: also collects rendered DOM, tokens and headers. */
export async function captureFullPage(url, opts = {}) {
  const chromium = await loadChromium();
  if (!chromium) return { available: false, note: "playwright_not_installed" };

  let browser, context, page;
  try {
    ({ browser, context } = await launchContext(chromium));
    page = await context.newPage();
  } catch (err) {
    await browser?.close().catch(() => {});
    return { available: false, note: "playwright_launch_failed", error: err.message };
  }

  const res = await captureOnPage(page, url, { returnHtml: true, collectTokens: true, ...opts });
  await browser.close().catch(() => {});
  if (!res.captured) return { available: true, captured: false, timedOut: res.timedOut, error: res.error };
  return { available: true, ...res };
}

/**
 * Capture a full-page screenshot of each discovered key page, reusing the SAME
 * routine in one shared browser session.
 *
 * @param {Array<{label:string,url:string,outPath:string}>} pages
 * @returns {Promise<{available:boolean, results?:Array}>}
 */
export async function captureKeyPages(pages, { perPageBudgetMs = 40000 } = {}) {
  if (!pages || !pages.length) return { available: true, results: [] };
  const chromium = await loadChromium();
  if (!chromium) return { available: false, note: "playwright_not_installed", results: [] };

  let browser, context;
  try {
    ({ browser, context } = await launchContext(chromium));
  } catch (err) {
    await browser?.close().catch(() => {});
    return { available: false, note: "playwright_launch_failed", error: err.message, results: [] };
  }

  const results = [];
  for (const p of pages) {
    let page;
    try {
      page = await context.newPage();
      const r = await captureOnPage(page, p.url, {
        outPath: p.outPath, returnHtml: false, collectTokens: false, budgetMs: perPageBudgetMs
      });
      results.push({
        label: p.label, url: p.url,
        captured: r.captured,
        path: r.captured && r.outPath ? "/shots/" + basenameOf(r.outPath) : null,
        page_height_px: r.page_height_px || null,
        error: r.error || null
      });
    } catch (err) {
      results.push({ label: p.label, url: p.url, captured: false, path: null, error: err.message });
    } finally {
      await page?.close().catch(() => {});
    }
  }
  await browser.close().catch(() => {});
  return { available: true, results };
}

function basenameOf(p) { return String(p).split(/[\\/]/).pop(); }
