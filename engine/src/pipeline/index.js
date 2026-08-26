/**
 * Pipeline orchestrator for allwebsites.design.
 *
 * Same contract as the DTC tool: extraction NEVER runs inside an HTTP request.
 * Each data point is its own micro-algorithm; the orchestrator runs them as
 * staged, budgeted steps and emits each field's envelope the moment it
 * resolves, so the UI can stream progress.
 *
 *   resolve        8s   DNS + SSRF guard + redirects        -> Official Link
 *   static_fetch  12s   raw HTML + headers
 *   identity      ~0s   Name, Description                   (static)
 *   classify      ~0s   Category/Subcategory/Type/Audience  (static, may re-run on render)
 *   design        ~0s   Palette, Fonts, Style               (static, better on render)
 *   pages          9s   Homepage/About/Contact/Pricing/Jobs (probes)
 *   social        ~0s   LinkedIn, X
 *   render        45s   full-page screenshot (scroll dance) CONDITIONAL/optional
 *   assemble      ~0s   merge + internal fields
 */

import { resolveUrl } from "./resolve.js";
import { fetchWithTimeout, BROWSER_HEADERS, assertSafeUrl } from "./resolve.js";
import { staticFetch, looksLikeSpaShell } from "./staticFetch.js";
import { envelope, evidence } from "./envelope.js";
import { extractIdentity } from "./identity.js";
import { classifyToEnvelopes } from "./taxonomy.js";
import { extractPalette } from "./palette.js";
import { extractFonts } from "./fonts.js";
import { classifyStyle } from "./style.js";
import { findKeyPages } from "./pages.js";
import { extractSocial } from "./social.js";
import { extractContact } from "./contact.js";
import { detectTechStack } from "./techstack.js";
import { extractFavicon } from "./favicon.js";
import { captureFullPage, captureKeyPages } from "./screenshot.js";
import { buildPaletteFromTokens, buildFontsFromTokens } from "./designTokens.js";
import { basename, dirname, join } from "node:path";

export async function runPipeline(url, ctx) {
  const set = (k, v) => ctx.setField(k, v);
  const stage = (n, s, extra) => ctx.setStage(n, s, extra);

  /* ---- resolve ---- */
  stage("resolve", "running");
  let resolved;
  try {
    resolved = await resolveUrl(url, { budgetMs: 8000 });
  } catch (err) {
    stage("resolve", "failed", { note: err.message });
    set("dp_official_link", envelope(null, "unavailable", 0, [], { crawl_failure: err.message }));
    throw new Error(`URL resolution failed: ${err.message}`);
  }
  stage("resolve", "complete");

  /* ---- static fetch ---- */
  stage("static_fetch", "running");
  let page;
  try {
    page = await staticFetch(resolved.resolved_url, { budgetMs: 12000 });
  } catch (err) {
    stage("static_fetch", "failed", { note: err.message });
    throw new Error(`Fetch failed: ${err.message}`);
  }
  stage("static_fetch", "complete", { bytes: page.html ? page.html.length : 0, bot_wall: page.botWall || null });
  let html = page.html || "";

  /* ---- identity ---- */
  stage("identity", "running");
  const id = extractIdentity(html, resolved);
  set("dp_name", id.dp_name);
  set("dp_official_link", id.dp_official_link);
  set("dp_description", id.dp_description);
  stage("identity", "complete");

  /* ---- classify (category / subcategory / type / audience) ---- */
  stage("classify", "running");
  let cls = classifyToEnvelopes(html, resolved.resolved_url);
  set("dp_category", cls.dp_category);
  set("dp_subcategory", cls.dp_subcategory);
  set("dp_website_type", cls.dp_website_type);
  set("dp_audience", cls.dp_audience);
  stage("classify", "complete", { top: cls._debug ? cls._debug.topScores : null });

  /* ---- design (palette / fonts / style) ---- */
  stage("design", "running");
  let pal = extractPalette(html, resolved);
  let fon = extractFonts(html, resolved);
  set("dp_palette", pal.dp_palette);
  set("dp_fonts", fon.dp_fonts);
  let sty = classifyStyle(html, resolved, {
    palette: pal.dp_palette.value || [],
    fonts: fon.dp_fonts.value || []
  });
  set("dp_style", sty.dp_style);
  stage("design", "complete");

  /* ---- pages + multi-document classification refine ---- */
  stage("pages", "running");
  let classificationDocuments = [];
  try {
    const pg = await findKeyPages(html, resolved, { budgetMs: 15000 });
    set("dp_key_pages", pg.dp_key_pages);
    classificationDocuments = pg.classification_documents || [];
    stage("pages", "complete", { found: pg.dp_key_pages.found_count, classification_documents: classificationDocuments.length });

    // A site's About/Pricing copy sharpens category/subcategory precision.
    if (classificationDocuments.length) {
      const refined = classifyToEnvelopes(html, resolved.resolved_url, {
        supplementalHtml: classificationDocuments.map((d) => d.html)
      });
      if (preferClassification(refined, cls)) {
        cls = refined;
        set("dp_category", cls.dp_category);
        set("dp_subcategory", cls.dp_subcategory);
        set("dp_website_type", cls.dp_website_type);
        set("dp_audience", cls.dp_audience);
      }
      stage("classification_refine", "complete", { documents: classificationDocuments.length });
    }

    /* ---- contact (email + address), using the fetched Contact/About pages ---- */
    stage("contact", "running");
    const contactDocs = classificationDocuments.map((d) => d.html);
    // The Contact page is the likeliest home for an email; fetch it if found
    // and not already among the classification documents.
    const contactUrl = ctx.fields.dp_key_pages && ctx.fields.dp_key_pages.value && ctx.fields.dp_key_pages.value.Contact
      ? ctx.fields.dp_key_pages.value.Contact.url : null;
    if (contactUrl && !classificationDocuments.some((d) => d.url === contactUrl)) {
      try {
        await assertSafeUrl(contactUrl);
        const res = await fetchWithTimeout(contactUrl, { timeoutMs: 4500, headers: BROWSER_HEADERS, redirect: "follow" });
        const ct = res.headers.get("content-type") || "";
        if (res.ok && /text\/html|xhtml/i.test(ct)) contactDocs.push((await res.text()).slice(0, 180000));
      } catch { /* contact page optional */ }
    }
    const contact = extractContact(html, resolved, { supplementalHtml: contactDocs });
    set("dp_contact", contact.dp_contact);
    stage("contact", "complete", { email: contact.dp_contact.value ? contact.dp_contact.value.email : null });
  } catch (err) {
    stage("pages", "failed", { note: err.message });
  }

  /* ---- social ---- */
  stage("social", "running");
  const soc = extractSocial(html, resolved);
  set("dp_social", soc.dp_social);
  stage("social", "complete");

  /* ---- tech stack (headers + cookies + html fingerprints) ---- */
  stage("techstack", "running");
  const tech = detectTechStack(html, page.headers || {}, page.setCookies || [], resolved.resolved_url);
  set("dp_tech_stack", tech.dp_tech_stack);
  stage("techstack", "complete", { summary: tech.dp_tech_stack.value ? tech.dp_tech_stack.value.summary : null });

  /* ---- favicon ---- */
  const shotsDir = ctx.shotsDir || (ctx.screenshotPath ? dirname(ctx.screenshotPath) : null);
  const domainSafe = (resolved.registrable_domain || "site").replace(/[^a-z0-9.-]/gi, "_");
  stage("favicon", "running");
  try {
    const faviconSave = ctx.faviconPath || (shotsDir ? join(shotsDir, `${domainSafe}__favicon`) : null);
    const fav = await extractFavicon(html, resolved, { savePath: faviconSave });
    set("dp_favicon", fav.dp_favicon);
    stage("favicon", "complete", { source: fav.dp_favicon.value ? fav.dp_favicon.value.source : null });
  } catch (err) {
    set("dp_favicon", { value: null, status: "unmeasured", confidence: 0, confidence_band: "unknown", reason: err.message });
    stage("favicon", "failed", { note: err.message });
  }

  /* ---- render + full-page screenshot (optional, heaviest) ---- */
  if (ctx.wantScreenshot !== false) {
    stage("screenshot", "running");
    const shot = await captureFullPage(resolved.resolved_url, {
      budgetMs: 45000,
      outPath: ctx.screenshotPath || null
    }).catch((err) => ({ available: true, captured: false, error: err.message }));

    if (shot.available && shot.captured) {
      // Build the WEB path with basename so it is correct on every OS.
      // Windows fs paths use backslashes, so splitting on "/" would break them.
      const webPath = shot.outPath ? "/shots/" + basename(shot.outPath) : null;
      set("dp_screenshot", envelope(
        { path: webPath, fs_path: shot.outPath, height_px: shot.page_height_px, viewport_px: shot.viewport_px, method: shot.method, scroll_steps: shot.scroll_steps, bytes: shot.bytes },
        "verified", 0.9,
        [evidence("full_page_capture", resolved.resolved_url, shot.method)]));
      stage("screenshot", "complete", { steps: shot.scroll_steps, height: shot.page_height_px });

      // Precision pass: a static fetch of an SPA sees only a shell, so recompute
      // the design fields from the rendered page. Prefer the area-weighted
      // computed-style tokens (most accurate), then fall back to HTML parsing.
      const rhtml = shot.rendered_html && shot.rendered_html.length > (html.length || 0) ? shot.rendered_html : null;
      const tokPal = shot.design_tokens ? buildPaletteFromTokens(shot.design_tokens, resolved) : null;
      const tokFon = shot.design_tokens ? buildFontsFromTokens(shot.design_tokens, resolved) : null;

      if (tokPal) set("dp_palette", tokPal);
      else if (rhtml) { const p = extractPalette(rhtml, resolved); if (p.dp_palette.value) { p.dp_palette.source_dom = "rendered"; set("dp_palette", p.dp_palette); } }

      if (tokFon) set("dp_fonts", tokFon);
      else if (rhtml) { const f = extractFonts(rhtml, resolved); if (f.dp_fonts.value) { f.dp_fonts.source_dom = "rendered"; set("dp_fonts", f.dp_fonts); } }

      if (rhtml || tokPal || tokFon) {
        // recompute style using the best palette/fonts we now have
        const palVal = (ctx.fields.dp_palette && ctx.fields.dp_palette.value) || [];
        const fonVal = (ctx.fields.dp_fonts && ctx.fields.dp_fonts.value) || [];
        const palHex = palVal.map((p) => p.hex || p);
        const fonNames = fonVal.map((f) => f.name || f);
        const rSty = classifyStyle(rhtml || html, resolved, { palette: palHex.map((h) => ({ hex: h })), fonts: fonNames });
        if (rSty.dp_style.value) { rSty.dp_style.source_dom = rhtml ? "rendered" : "tokens"; set("dp_style", rSty.dp_style); }

        // re-classify only if the static pass was weak or empty
        const staticCat = ctx.fields.dp_category;
        if (rhtml && (!staticCat || !staticCat.value || staticCat.confidence < 0.6)) {
          const rCls = classifyToEnvelopes(rhtml, resolved.resolved_url, {
            supplementalHtml: classificationDocuments.map((d) => d.html)
          });
          if (preferClassification(rCls, { dp_category: staticCat })) {
            set("dp_category", rCls.dp_category); set("dp_subcategory", rCls.dp_subcategory);
            set("dp_website_type", rCls.dp_website_type); set("dp_audience", rCls.dp_audience);
          }
        }
        stage("rendered_refine", "complete", { tokens: !!shot.design_tokens });
      }

      // tech stack often needs the rendered DOM (SPAs inject _next/, __NUXT__,
      // builder markers after hydration) plus the real response headers.
      if (shot.rendered_html || shot.response_headers) {
        const mergedHeaders = { ...(page.headers || {}), ...(shot.response_headers || {}) };
        const rTech = detectTechStack(shot.rendered_html || html, mergedHeaders, page.setCookies || [], resolved.resolved_url);
        const prev = ctx.fields.dp_tech_stack;
        const prevCount = prev && prev.detected_count ? prev.detected_count : 0;
        if (rTech.dp_tech_stack.value && (rTech.dp_tech_stack.detected_count || 0) >= prevCount) {
          rTech.dp_tech_stack.source_dom = "rendered";
          set("dp_tech_stack", rTech.dp_tech_stack);
        }
      }

      /* ---- key-page screenshots ---------------------------------------
       * The homepage shot we already have IS the Homepage capture. For every
       * OTHER key page that was actually found (About, Contact, Pricing,
       * Jobs/Careers), run the identical scroll-and-capture routine. Then list
       * Homepage + each captured page together. If only Pricing + Homepage were
       * found, exactly those two are captured. */
      const found = (ctx.fields.dp_key_pages && ctx.fields.dp_key_pages.value) || {};
      const homepageUrl = (found.Homepage && found.Homepage.url) || resolved.resolved_url;
      const pageShots = [{ label: "Homepage", url: homepageUrl, path: webPath, main: true }];

      const toCapture = [];
      for (const label of ["About", "Contact", "Pricing", "Jobs/Careers"]) {
        const pg = found[label];
        if (pg && pg.url && pg.url !== homepageUrl) {
          const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          toCapture.push({ label, url: pg.url, outPath: ctx.pageShotPath ? ctx.pageShotPath(slug) : (shotsDir ? join(shotsDir, `${domainSafe}__${slug}.png`) : null) });
        }
      }

      if (toCapture.length) {
        stage("page_screenshots", "running", { count: toCapture.length });
        const many = await captureKeyPages(toCapture, { perPageBudgetMs: 40000 }).catch((err) => ({ available: true, results: [], error: err.message }));
        for (const r of many.results || []) {
          if (r.captured && r.path) pageShots.push({ label: r.label, url: r.url, path: r.path });
        }
        stage("page_screenshots", "complete", { captured: (many.results || []).filter((r) => r.captured).length });
      }

      set("dp_page_shots", envelope(pageShots, "verified", 0.9,
        [evidence("multi_page_capture", resolved.resolved_url, `${pageShots.length} pages captured with full-page scroll`)],
        { count: pageShots.length }));
    } else {
      set("dp_screenshot", envelope(null, shot.available ? "unavailable" : "unmeasured", 0, [],
        { reason: shot.note || shot.error || "capture failed", degraded: true }));
      stage("screenshot", shot.available ? "failed" : "skipped", { note: shot.note || shot.error });
    }
  } else {
    stage("screenshot", "skipped", { note: "screenshot disabled for this run" });
  }

  /* ---- assemble + internal fields ---- */
  const now = new Date().toISOString();
  set("_internal", {
    date_added: ctx.existingDateAdded || now,   // preserved across re-checks
    last_checked: now,
    method_bundle: "awd-2026.08.13-a"
  });
  stage("assemble", "complete");

  return ctx.fields;
}

/* A refined classification replaces the current one only when it is genuinely
 * better: same category with equal-or-higher confidence, or a category change
 * backed by a meaningful confidence gain (or first-party structured metadata). */
function preferClassification(next, current) {
  const n = next?.dp_category;
  const c = current?.dp_category;
  if (!n?.value) return false;
  if (!c?.value) return true;
  if (n.value === c.value) return n.confidence >= c.confidence - 0.03;
  const structured = Array.isArray(n.structured_signals) && n.structured_signals.length > 0;
  return n.confidence >= c.confidence + 0.08 || (structured && n.confidence >= c.confidence);
}
