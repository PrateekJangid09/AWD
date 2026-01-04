const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(__dirname, '../data/websites.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/screenshots');
const FALLBACK_DIR = path.join(__dirname, '../public/screenshots/fallbacks');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(FALLBACK_DIR)) {
  fs.mkdirSync(FALLBACK_DIR, { recursive: true });
}

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryColor(category) {
  const colors = {
    'SaaS': '#3B82F6',
    'Design Studio': '#8B5CF6',
    'Fintech': '#10B981',
    'E-commerce': '#F59E0B',
    'Portfolio': '#EC4899',
    'AI Tool': '#6366F1',
    'Creative Studio': '#A855F7',
    'Media': '#14B8A6',
    'Template': '#84CC16',
    'Education': '#F97316',
    'Health': '#EF4444',
    'Crypto': '#06B6D4',
    'DevTool': '#8B5CF6',
    'Cloud': '#3B82F6',
    'Marketing': '#F59E0B',
  };
  
  const primaryCategory = category.split('/')[0].trim();
  return colors[primaryCategory] || '#6B7280';
}

async function generateFallbackImage(name, category, slug) {
  const sharp = require('sharp');
  const width = 1280;
  const height = 720;
  const color = getCategoryColor(category);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="#1F2937" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" text-anchor="middle" fill="#FFFFFF" font-size="56" font-weight="700" font-family="Inter, Arial, sans-serif">${escapeXml(name)}</text>
    <text x="50%" y="60%" text-anchor="middle" fill="#E5E7EB" font-size="28" font-family="Inter, Arial, sans-serif">${escapeXml(category)}</text>
  </svg>`;

  const outputPath = path.join(FALLBACK_DIR, `${slug}.webp`);
  const webpBuffer = await sharp(Buffer.from(svg)).webp({ quality: 85 }).toBuffer();
  fs.writeFileSync(outputPath, webpBuffer);
  return outputPath;
}

function escapeXml(value = '') {
  return value.replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

async function captureScreenshot(url, slug, name, category, timeoutMs, maxRetries = 2) {
  const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);
  
  // Skip if screenshot already exists
  if (fs.existsSync(outputPath)) {
    try {
      const stat = fs.statSync(outputPath);
      // If very small, likely a previous fallback written to main dir – recapture
      if (stat.size >= 20000) {
        console.log(`✓ Screenshot exists: ${slug}`);
        return true;
      } else {
        console.log(`↻ Replacing small/placeholder image: ${slug}`);
      }
    } catch {}
  }
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--disable-dev-shm-usage',
      ],
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    // Speed up by skipping heavy resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
        return req.abort();
      }
      req.continue();
    });
    
    // Navigation with retries
    const navTimeout = timeoutMs || 45000;
    let lastError = null;
    // Try multiple URL variants across retries
    const candidates = [];
    try { candidates.push(new URL(url).toString()); } catch { candidates.push(url); }
    const u = new URL(candidates[0]);
    // Toggle protocol
    candidates.push(`${u.protocol === 'https:' ? 'http:' : 'https:'}//${u.host}${u.pathname}${u.search}`);
    // Toggle www
    const hostNoWww = u.host.replace(/^www\./, '');
    const hostWithWww = hostNoWww.startsWith('www.') ? hostNoWww : `www.${hostNoWww}`;
    candidates.push(`${u.protocol}//${hostWithWww}${u.pathname}${u.search}`);
    candidates.push(`${u.protocol}//${hostNoWww}${u.pathname}${u.search}`);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const target = candidates[Math.min(attempt, candidates.length - 1)];
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: navTimeout });
        // Best-effort wait for network to settle
        try { await page.waitForNetworkIdle({ timeout: Math.min(5000, navTimeout) }); } catch {}
        // Ensure body exists
        await page.waitForSelector('body', { timeout: 3000 });
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
      }
    }
    if (lastError) throw lastError;
    
    // Remove common cookie banners and popups
    await page.evaluate(() => {
      const selectors = [
        '[class*="cookie"]',
        '[class*="gdpr"]',
        '[id*="cookie"]',
        '[class*="banner"]',
        '[class*="consent"]',
        '[class*="popup"]',
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          if (text.includes('cookie') || text.includes('accept') || text.includes('consent')) {
            el.remove();
          }
        });
      });
    });
    
    // Wait a bit for animations
    await new Promise((r) => setTimeout(r, 1000));
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      type: 'webp',
      quality: 85,
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });
    
    console.log(`✓ Screenshot captured: ${slug}`);
    return true;
    
  } catch (error) {
    console.log(`✗ Failed for ${slug}: ${error.message}`);
    
    // Generate fallback
    try {
      await generateFallbackImage(name, category, slug);
      console.log(`  → Generated fallback for ${slug}`);
      return false;
    } catch (fallbackError) {
      console.log(`  → Fallback failed for ${slug}: ${fallbackError.message}`);
      return false;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function processWebsites() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const { data } = Papa.parse(csvContent, {
    header: false,
    skipEmptyLines: true,
  });
  
  // Skip header
  let websites = data.slice(1).map(row => ({
    name: row[0]?.trim() || 'Unnamed',
    url: row[1]?.trim() || '',
    category: row[2]?.trim() || 'Uncategorized',
    slug: createSlug(row[0]?.trim() || 'unnamed'),
  }));

  // De-duplicate by slug to avoid repeats
  const seen = new Set();
  websites = websites.filter(w => (seen.has(w.slug) ? false : (seen.add(w.slug), true)));

  const maxSites = parseInt(process.env.MAX_SITES || '0', 10);
  if (maxSites > 0) {
    websites = websites.slice(0, maxSites);
  }
  
  console.log(`\n📸 Generating screenshots for ${websites.length} websites...\n`);
  
  let successCount = 0;
  let failCount = 0;
  const concurrency = Math.max(1, parseInt(process.env.CONCURRENCY || '5', 10));
  
  for (let i = 0; i < websites.length; i += concurrency) {
    const batch = websites.slice(i, i + concurrency);
    
    const results = await Promise.allSettled(
      batch.map(site => {
        // Skip known placeholders or empty URLs → generate fallback immediately
        if (!site.url || site.url.includes('impossiblefoods.com')) {
          return generateFallbackImage(site.name, site.category, site.slug).then(() => false);
        }
        // Allow configurable timeout
        if (process.env.TIMEOUT_MS) {
          const original = captureScreenshot;
          const t = parseInt(process.env.TIMEOUT_MS, 10);
          const retries = parseInt(process.env.RETRIES || '2', 10);
          return original(site.url, site.slug, site.name, site.category, t, retries);
        }
        const retries = parseInt(process.env.RETRIES || '2', 10);
        return captureScreenshot(site.url, site.slug, site.name, site.category, undefined, retries);
      })
    );
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      } else {
        failCount++;
      }
    });
    
    console.log(`\nProgress: ${Math.min(i + concurrency, websites.length)}/${websites.length}`);
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed/Fallback: ${failCount}\n`);
}

// Check if canvas is available, if not, install it
try {
  require('canvas');
  processWebsites();
} catch (e) {
  console.log('Installing canvas package for fallback images...');
  const { execSync } = require('child_process');
  execSync('npm install canvas', { stdio: 'inherit' });
  processWebsites();
}


