# AllWebsites.design - Architecture & Feature Specification

**Version:** 1.0 (finalized)
**Method bundle:** `awd-2026.08.13-a` · Taxonomy `awd-tax-2026.08.16-a` · Tech `awd-tech-2026.08.13-a`
**Runtime:** Node.js 22+ · Express · node:sqlite (built-in) · Playwright (optional)

A directory/gallery engine for the web. You give it a URL (or a CSV of up to a
few thousand), and for each site it runs one dedicated micro-algorithm per data
point, stores an evidence-backed profile, and presents it in a filterable
gallery with precise full-page screenshots.

---

## 1. Design philosophy

Three principles shape every part of the system.

**One micro-algorithm per data point.** Each thing we extract (name, category,
palette, tech stack, email...) is its own small, self-contained module with a
single job. They do not share mutable state; they each take input and return a
result. This makes every field independently testable, tunable, and replaceable.

**Every result is an evidence envelope.** No field returns a bare value. Every
one returns `{ value, status, confidence, confidence_band, evidence[],
method_version, computed_at }`. A blank is always an honest `unmeasured` with a
reason, never a silent zero. The UI renders confidence chips and evidence
directly from this uniform shape.

**Extraction never runs inside an HTTP request.** The API enqueues a job and
returns immediately (202 + job id). A bounded pool of background workers does
the crawling, rendering, and analysis. This keeps the server responsive and lets
a 1000-site CSV import run without holding any request open.

---

## 2. System architecture

```
                    ┌─────────────────────────────────────────────────┐
                    │                   CLIENT (browser)               │
                    │   index.html (gallery)      site.html (detail)   │
                    │   app.css  ·  vanilla JS  ·  no build step       │
                    └───────────────┬─────────────────────────────────┘
                                    │ HTTP / JSON
                    ┌───────────────▼─────────────────────────────────┐
                    │                 src/server.js (Express)          │
                    │  GET /api/sites · /api/facets · /api/site/:domain│
                    │  POST /api/analyze  → 202 + job_id               │
                    │  POST /api/batch    → 202 + batch_id  (CSV)      │
                    │  GET /api/job/:id · /api/batch/:id  (progress)   │
                    └───────────────┬─────────────────────────────────┘
                                    │ enqueue (never blocks)
                    ┌───────────────▼─────────────────────────────────┐
                    │                 src/queue.js                     │
                    │  in-process job queue · concurrency pool (3)     │
                    │  batch tracking · dedupe · skip-existing         │
                    └───────────────┬─────────────────────────────────┘
                                    │ runPipeline(url, ctx)
                    ┌───────────────▼─────────────────────────────────┐
                    │              src/pipeline/index.js               │
                    │        staged, budgeted orchestrator             │
                    │  resolve → fetch → identity → classify → design  │
                    │  → pages → contact → social → tech → favicon     │
                    │  → screenshot (+ rendered refine + page shots)   │
                    │  → assemble                                      │
                    └───────┬──────────────────────────────┬──────────┘
                            │ per-field micro-algorithms    │
              ┌─────────────▼───────────┐      ┌────────────▼───────────┐
              │  static primitives      │      │  browser (Playwright)  │
              │  resolve.js (SSRF safe) │      │  screenshot.js         │
              │  staticFetch.js         │      │  designTokens.js       │
              └─────────────────────────┘      └────────────────────────┘
                                    │ upsert
                    ┌───────────────▼─────────────────────────────────┐
                    │                 src/db.js (node:sqlite)          │
                    │  sites table: queryable columns + full profile   │
                    └──────────────────────────────────────────────────┘
```

### 2.1 Request lifecycle

1. Client POSTs a URL to `/api/analyze` (or a CSV to `/api/batch`).
2. Server validates, enqueues a job, and returns `202 { job_id }` at once.
3. A background worker pulls the job and calls `runPipeline(url, ctx)`.
4. The orchestrator runs each stage in order, writing each field's envelope to
   the job as soon as it resolves (so progress is observable) and advancing a
   per-stage status.
5. On completion the flattened profile is upserted into SQLite.
6. The client polls `/api/job/:id` (single) or `/api/batch/:id` (bulk) and
   refreshes the gallery as results land.

### 2.2 Concurrency & budgets

- Worker pool concurrency defaults to **3** (configurable in `createRunner`).
- Every stage has a hard time budget so one slow site cannot stall a batch:
  resolve 8s, static fetch 12s, key-pages 15s, homepage screenshot 45s, each
  extra page screenshot 40s.
- The homepage screenshot runs under a `Promise.race` against its budget and
  degrades gracefully if Playwright or its browser is absent.

---

## 3. The pipeline (stage by stage)

`src/pipeline/index.js` orchestrates 15 stages. Stages marked **(browser)** need
Playwright's Chromium; everything else runs from static HTML + response headers.

| # | Stage | Produces | Notes |
|---|-------|----------|-------|
| 1 | `resolve` | official link | DNS + SSRF guard + redirect resolution |
| 2 | `static_fetch` | raw HTML, headers, cookies | bot-wall + SPA-shell detection |
| 3 | `identity` | name, description | precedence chains over meta/JSON-LD/DOM |
| 4 | `classify` | category, subcategory, website type, audience | weighted zones + structured signals |
| 5 | `design` | palette, fonts, style | static fallback; refined later on render |
| 6 | `pages` | key pages + classification documents | discovers + fetches About/Pricing |
| 6b | `classification_refine` | sharpened category | re-runs with multi-document evidence |
| 7 | `contact` | email + postal address | also fetches the discovered Contact page |
| 8 | `social` | LinkedIn, X | anchors + JSON-LD sameAs |
| 9 | `techstack` | builder/CMS, framework, language, hosting, CDN, storage | evidence-weighted |
| 10 | `favicon` | site icon | validated + saved locally |
| 11 | `screenshot` **(browser)** | full-page homepage capture | scroll-to-footer-then-top |
| 11b | `rendered_refine` **(browser)** | palette/fonts/style/tech from rendered DOM | area-weighted tokens |
| 11c | `page_screenshots` **(browser)** | full-page shots of each found key page | same capture routine |
| 12 | `assemble` | internal fields | date_added (preserved), last_checked |

---

## 4. Data points (one algorithm each)

All 17 fields, their module, and their method. Every one returns an evidence
envelope.

| Field | Module | Method summary |
|-------|--------|----------------|
| `dp_name` | `identity.js` | og:site_name > title brand segment > JSON-LD name > domain |
| `dp_description` | `identity.js` | meta description > og:description > JSON-LD > first real paragraph |
| `dp_official_link` | `identity.js` | resolved URL + canonical origin + registrable domain |
| `dp_favicon` | `favicon.js` | link rel=icon (largest) > apple-touch > manifest > og:image > /favicon.ico; validated as a real image, saved locally |
| `dp_category` | `taxonomy.js` | weighted keyword zones + keyword-specificity + evidence diversity + structured signals + vertical dominance + disambiguation, over homepage **and** inner pages |
| `dp_subcategory` | `taxonomy.js` | scored per-category subcategory keywords with an absolute floor |
| `dp_website_type` | `websiteType.js` | 68 site shapes scored from phrase + DOM-structure signals, constrained to the category's allowed types |
| `dp_audience` | `taxonomy.js` | intent signals (B2B/dev/consumer...) constrained to the category |
| `dp_palette` | `designTokens.js` (rendered) / `palette.js` (static) | area-weighted computed colors: background / text / brand roles with coverage |
| `dp_fonts` | `designTokens.js` (rendered) / `fonts.js` (static) | computed font-family per role (display/body/mono) + observed weights |
| `dp_style` | `style.js` | design-trait scoring: Minimal / Brutalist / Editorial / Playful / Bold / Motion-Driven / Corporate |
| `dp_tech_stack` | `techstack.js` | evidence-weighted signatures for builder/CMS, framework, language, hosting, CDN, storage, server, frontend, ecommerce |
| `dp_key_pages` | `pages.js` | Homepage/About/Contact/Pricing/Jobs via nav+footer link match and slug probing with soft-404 rejection |
| `dp_page_shots` | `screenshot.js` | full-page screenshot of every found key page, same scroll routine |
| `dp_contact` | `contact.js` | JSON-LD email/contactPoint > mailto > de-obfuscated text; on-domain + role addresses preferred; postal address from schema/`<address>` |
| `dp_social` | `social.js` | LinkedIn (company/in/school) + X profiles; share-intents filtered |
| `dp_screenshot` | `screenshot.js` | precise full-page homepage capture |

Internal (not a data point): `_internal.date_added` (preserved across
re-checks) and `_internal.last_checked`.

---

## 5. Flagship algorithms

### 5.1 Category classification (`taxonomy.js`)
Encodes all 26 PDF categories, each with subcategories, allowed website types,
and audiences. Runs three coupled classifiers (category+subcategory, website
type, audience) over six weighted DOM zones (title 3.0, meta 3.0, headings 3.0,
slugs 2.5, nav 2.0, body 1.0), sharpened by:
- **keyword-specificity weighting** - 3-word phrases outweigh single words;
  low-signal buzzwords (platform, services, solution...) are down-weighted;
- **evidence diversity** - a category must appear across >= 2 zones, and broader
  spread raises confidence;
- **structured signals** - og:type and schema.org @type (SoftwareApplication,
  Product, JobPosting, Recipe, LocalBusiness, Course...) give a strong boost;
- **vertical dominance** - hard verticals (e.g. pest control) beat generic copy;
- **multi-document classification** - homepage + fetched About/Pricing pages,
  capped so inner pages never overpower the homepage;
- **disambiguation** - confusable pairs (AI-image tool -> Design & Creative
  Tools not Media; storefront signals -> Ecommerce).

Guarded by a 26-case benchmark: `node --test tests/taxonomy-benchmark.test.js`.

### 5.2 Full-page screenshot (`screenshot.js`)
One shared routine (`captureOnPage`) so the homepage and every extra key page
get identical logic: disable smooth-scroll → descend in overlapping viewport
steps pausing at each so scroll-triggered animations fire → rest at the footer
→ force lazy assets to load, wait for fonts/images → scroll back to top and rest
→ freeze animations at end-state → capture full page. Hard-bounded, SSRF-guarded
subresources, degrades gracefully without a browser.

### 5.3 Design tokens (`designTokens.js`)
Runs inside the rendered page: walks every painted element, reads computed color
and font, and weights each by the screen **area** it covers. Area weighting is
what distinguishes the page background from the body text color from the brand
color, and the display typeface from the body typeface, each with coverage and
weights. Falls back to static CSS parsing only when no browser is available.

### 5.4 Tech stack (`techstack.js`)
Evidence-weighted signatures across five classes (response header, Set-Cookie,
vendor asset URL, DOM marker, meta generator). A signature fires only when
summed weight clears its threshold, so a plain-text brand mention never triggers
a false positive. Runs on static HTML+headers, then again on the rendered DOM +
real response headers (SPAs only expose `_next/`, `__NUXT__`, builder markers
after hydration), keeping whichever pass identified more.

---

## 6. Features

- **Single-URL analysis** with live stage-by-stage progress.
- **CSV / bulk import** (up to ~5000 per file) with dedupe, skip-already-analyzed,
  a live progress panel, and an optional screenshots toggle. CLI equivalent:
  `node scripts/import.js sites.csv [--no-shot] [--concurrency=N] [--reanalyze]`.
- **Precise full-page screenshots** with the scroll-to-footer-then-top routine.
- **Multi-page screenshots** of every discovered key page (Homepage + About /
  Contact / Pricing / Jobs when found), listed on the detail page.
- **Favicon** on every gallery card.
- **Contact extraction** - official email (mailto/JSON-LD/de-obfuscated text,
  on-domain + role preferred) and postal address.
- **Filterable gallery** (Portfolio Grid, monochrome frame, category rail, sort).
- **Confidence + evidence** on every field.
- **Re-check** to refresh a site while preserving its original date_added.

---

## 7. HTTP API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/sites?category=&style=&q=&sort=&limit=&offset=` | gallery list |
| GET | `/api/facets` | category counts for the filter rail |
| GET | `/api/site/:domain` | full profile (all envelopes) |
| POST | `/api/analyze` `{ url }` | enqueue one; returns `202 { job_id }` |
| GET | `/api/job/:id` | job status, stages, fields, result |
| POST | `/api/batch` `{ csv }` or `{ urls[] }` | enqueue many; returns `202 { batch_id }` |
| GET | `/api/batch/:id` | batch progress (done/failed/running/items) |

---

## 8. Storage

`node:sqlite`, one row per site in `sites`. Queryable columns (domain, name,
category, subcategory, website_type, style, tech_summary, contact_email,
contact_address, favicon, screenshot, date_added, last_checked...) mirror the
fields the gallery filters and sorts on; the full envelope bundle is kept as JSON
in a `profile` column. Upsert is keyed by domain and preserves the original
`date_added` across re-checks. Screenshots and favicons are saved under
`public/shots/` and served at `/shots`.

---

## 9. Security & robustness

- **SSRF guard** on every fetch and every browser subresource (private/loopback
  ranges blocked; redirects re-validated).
- **Budgets** on every stage; `Promise.race` on the browser capture.
- **Graceful degradation** when Playwright's browser is missing: no screenshots,
  no rendered-DOM refinement, static extraction only, no crash.
- **Portable paths** (`basename`) so screenshot URLs are correct on Windows too.
- **Honest blanks**: fields that cannot be measured return `unmeasured` with a
  reason rather than guessing.

---

## 10. Project layout

```
allwebsites-design/
├─ package.json               scripts: start · seed · import · check · test
├─ README.md                  quick start + usage
├─ ARCHITECTURE.md            this document
├─ sample-sites.csv           example import file
├─ data/                      SQLite db (created at runtime)
├─ public/
│  ├─ index.html              gallery (masonry grid, filter rail, analyze, import)
│  ├─ site.html               detail view (all data points + page shots)
│  ├─ app.css                 monochrome design system, Plus Jakarta Sans
│  └─ shots/                  saved screenshots + favicons
├─ scripts/
│  ├─ seed.js                 offline demo rows, or live crawl of given URLs
│  ├─ import.js               headless CSV bulk import
│  └─ check.js                re-check stored sites (preserves date_added)
├─ tests/
│  ├─ verify.mjs              fixture spot-checks
│  └─ taxonomy-benchmark.test.js   26-case category benchmark
└─ src/
   ├─ server.js               Express routes
   ├─ queue.js                job queue + batch tracking
   ├─ db.js                   node:sqlite storage
   └─ pipeline/
      ├─ index.js             orchestrator (15 stages)
      ├─ envelope.js          the evidence-envelope contract
      ├─ resolve.js           URL resolution + SSRF guard
      ├─ staticFetch.js       HTML + headers + cookies
      ├─ identity.js          name · description · official link
      ├─ favicon.js           site icon
      ├─ taxonomy.js          category · subcategory · audience (+ website type wiring)
      ├─ websiteType.js       68-type website classifier
      ├─ palette.js           static color palette
      ├─ fonts.js             static font detection
      ├─ designTokens.js      rendered area-weighted colors + fonts
      ├─ style.js             design-style classifier
      ├─ techstack.js         builder/framework/language/hosting/CDN/storage
      ├─ pages.js             key-page discovery + classification documents
      ├─ contact.js           email + postal address
      ├─ social.js            LinkedIn + X
      └─ screenshot.js        full-page + multi-page capture, rendered tokens
```

---

## 11. Running it

```bash
npm install
npx playwright install chromium     # enables screenshots + rendered colors/fonts/tech

npm run seed        # offline demo rows, or: node scripts/seed.js https://linear.app
npm start           # http://localhost:3000

node scripts/import.js sample-sites.csv --no-shot   # fast bulk classify
node scripts/check.js mylyra.com                    # re-check one site
node --test tests/taxonomy-benchmark.test.js        # category accuracy
```

**Note on precision:** the richest results (rendered-DOM colors and fonts,
SPA-accurate tech stack, favicons, multi-page screenshots) require Playwright's
Chromium. Without it the tool still runs and classifies, but from static HTML
only.
```
