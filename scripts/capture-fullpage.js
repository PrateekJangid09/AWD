/*
  Full-page WebP capture script
  - Engine: puppeteer + sharp
  - Logs: [FullPageCapture] prefixed per user preference
*/
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const sharp = require('sharp');
const puppeteer = require('puppeteer');

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, 'data', 'websites.csv');
const OUTPUT_DIR = path.join(ROOT, 'public', 'fullshots');
const REPORT_DIR = path.join(ROOT, 'scripts', 'output');
const REPORT_PATH = path.join(REPORT_DIR, 'fullpage-report.json');

const CONCURRENCY = Math.max(1, parseInt(process.env.CONCURRENCY || '5', 10));
const TIMEOUT_MS = Math.max(5000, parseInt(process.env.TIMEOUT_MS || '15000', 10));
const MAX_SITES = Math.max(0, parseInt(process.env.MAX_SITES || '0', 10));
const MAX_HEIGHT = Math.max(0, parseInt(process.env.MAX_HEIGHT || '12000', 10));

function createSlug(name) {
  return (name || 'unnamed').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ensureDirs() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Guard against typo in ensureDirs
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

function log(msg) {
  console.log(`[FullPageCapture] ${msg}`);
}

async function captureFullPage(browser, site) {
  const outPath = path.join(OUTPUT_DIR, `${site.slug}.webp`);
  if (fs.existsSync(outPath)) {
    log(`skip exists → ${site.slug}`);
    return { status: 'exists', path: outPath };
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  try {
    await page.goto(site.url, { waitUntil: 'networkidle2', timeout: TIMEOUT_MS });

    // Remove cookie/pop banners (best-effort)
    await page.evaluate(() => {
      const sels = ['[id*="cookie"]', '[class*="cookie"]', '[class*="consent"]', '[class*="gdpr"]', '[class*="banner"]', '[role="dialog"]'];
      for (const sel of sels) document.querySelectorAll(sel).forEach(el => el.remove());
    });

    // Small settle delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pngBuffer = await page.screenshot({ fullPage: true, type: 'png' });

    // Post-process with sharp → clamp extreme heights
    let pipeline = sharp(pngBuffer);
    const meta = await pipeline.metadata();
    if (MAX_HEIGHT > 0 && meta.height && meta.height > MAX_HEIGHT) {
      // Crop from top to MAX_HEIGHT to keep hero/content most relevant
      pipeline = pipeline.extract({ left: 0, top: 0, width: meta.width, height: MAX_HEIGHT });
    }

    const webp = await pipeline.webp({ quality: 80 }).toBuffer();
    fs.writeFileSync(outPath, webp);
    log(`success → ${site.slug}`);
    return { status: 'success', path: outPath };
  } catch (err) {
    log(`fail → ${site.slug}: ${err.message}`);
    return { status: 'error', error: err.message };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const csv = fs.readFileSync(CSV_PATH, 'utf-8');
  const { data } = Papa.parse(csv, { header: false, skipEmptyLines: true });
  let items = data.slice(1).map(r => ({
    name: r[0]?.trim() || 'Unnamed',
    url: r[1]?.trim() || '',
    slug: createSlug(r[0] || 'unnamed')
  }));

  // Filter out invalid/placeholder URLs
  items = items.filter(x => x.url && !x.url.includes('impossiblefoods.com'));
  // Optionally restrict to specific slugs via env var (comma-separated)
  const includeSlugsEnv = (process.env.INCLUDE_SLUGS || '').trim();
  if (includeSlugsEnv) {
    const allow = new Set(includeSlugsEnv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
    items = items.filter(x => allow.has(x.slug));
  }
  if (MAX_SITES > 0) items = items.slice(0, MAX_SITES);

  log(`starting → total ${items.length}, concurrency ${CONCURRENCY}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const report = { total: items.length, success: 0, exists: 0, error: 0, items: [] };

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(site => captureFullPage(browser, site)));
    results.forEach((res, idx) => {
      const entry = { slug: batch[idx].slug, status: res.status, error: res.error };
      report.items.push(entry);
      if (res.status === 'success') report.success += 1;
      else if (res.status === 'exists') report.exists += 1;
      else report.error += 1;
    });
    log(`progress → ${Math.min(i + CONCURRENCY, items.length)}/${items.length}`);
  }

  await browser.close();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  log(`done → success ${report.success}, exists ${report.exists}, error ${report.error}`);
}

main().catch(err => {
  console.error('[FullPageCapture] fatal', err);
  process.exit(1);
});


