const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const sharp = require('sharp');

// Configuration
const CONFIG = {
  MAX_CONCURRENT: 5,
  TIMEOUT_MS: 15000,
  RETRY_ATTEMPTS: 3,
  VIEWPORT: { width: 1920, height: 1080 },
  OUTPUT_DIR: path.join(process.cwd(), 'public', 'screenshots'),
  QUALITY: 85,
  FORMAT: 'webp'
};

// Advanced hero section detection strategies
const HERO_DETECTION_STRATEGIES = [
  {
    name: 'header-selector',
    selectors: [
      'header',
      '[role="banner"]',
      '.hero',
      '.hero-section',
      '.banner',
      '.header',
      '.main-header',
      '.site-header',
      '.page-header',
      '.intro',
      '.landing',
      '.above-fold',
      '.viewport',
      '.hero-container',
      '.hero-wrapper'
    ]
  },
  {
    name: 'main-content',
    selectors: [
      'main',
      '[role="main"]',
      '.main',
      '.main-content',
      '.content',
      '.primary',
      '.page-content',
      '.site-content'
    ]
  },
  {
    name: 'viewport-detection',
    strategy: 'viewport',
    viewportHeight: 800
  },
  {
    name: 'first-section',
    selectors: [
      'section:first-of-type',
      '.section:first-of-type',
      '.container:first-of-type',
      '.wrapper:first-of-type'
    ]
  }
];

class AdvancedScreenshotSystem {
  constructor() {
    this.browser = null;
    this.stats = {
      processed: 0,
      successful: 0,
      failed: 0,
      retried: 0,
      skipped: 0
    };
    this.results = [];
  }

  async initialize() {
    console.log('🚀 Initializing Advanced Screenshot System...\n');
    
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }

    // Launch browser with optimized settings
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ],
      defaultViewport: CONFIG.VIEWPORT
    });

    console.log('✅ Browser launched successfully\n');
  }

  async loadWebsiteData() {
    const csvPath = path.join(process.cwd(), 'data', 'websites.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const { data } = Papa.parse(fileContent, {
      header: false,
      skipEmptyLines: true,
    });

    // Skip header and process websites
    const websites = data.slice(1).map((row, index) => ({
      id: `${index + 1}`,
      name: row[0]?.trim() || 'Unnamed',
      url: row[1]?.trim() || '',
      category: row[2]?.trim() || 'Uncategorized',
      description: row[3]?.trim() || 'No description available',
      slug: this.createSlug(row[0]?.trim() || 'unnamed')
    }));

    // Filter out placeholder URLs
    const validWebsites = websites.filter(site => 
      site.url && 
      !site.url.includes('impossiblefoods.com') && 
      site.url.startsWith('http')
    );

    console.log(`📊 Loaded ${validWebsites.length} valid websites (${websites.length - validWebsites.length} placeholders skipped)\n`);
    return validWebsites;
  }

  createSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async detectHeroSection(page) {
    console.log('🔍 Detecting hero section...');

    for (const strategy of HERO_DETECTION_STRATEGIES) {
      try {
        if (strategy.strategy === 'viewport') {
          // Capture viewport-based hero section
          const viewport = await page.viewport();
          const heroHeight = Math.min(strategy.viewportHeight, viewport.height);
          
          console.log(`✅ Using viewport strategy (${heroHeight}px height)`);
          return {
            type: 'viewport',
            height: heroHeight,
            width: viewport.width
          };
        } else {
          // Try element-based detection
          for (const selector of strategy.selectors) {
            const element = await page.$(selector);
            if (element) {
              const boundingBox = await element.boundingBox();
              if (boundingBox && boundingBox.height > 100) {
                console.log(`✅ Found hero element: ${selector} (${strategy.name})`);
                return {
                  type: 'element',
                  selector: selector,
                  boundingBox: boundingBox
                };
              }
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Strategy ${strategy.name} failed:`, error.message);
        continue;
      }
    }

    // Fallback to full page
    console.log('⚠️ No hero section detected, using full page fallback');
    return { type: 'fullpage' };
  }

  async captureScreenshot(page, website, heroConfig) {
    const outputPath = path.join(CONFIG.OUTPUT_DIR, `${website.slug}.${CONFIG.FORMAT}`);
    
    try {
      let screenshot;
      
      switch (heroConfig.type) {
        case 'viewport':
          screenshot = await page.screenshot({
            clip: {
              x: 0,
              y: 0,
              width: heroConfig.width,
              height: heroConfig.height
            },
            type: 'png'
          });
          break;
          
        case 'element':
          screenshot = await page.screenshot({
            clip: heroConfig.boundingBox,
            type: 'png'
          });
          break;
          
        case 'fullpage':
        default:
          screenshot = await page.screenshot({
            fullPage: false,
            type: 'png'
          });
          break;
      }

      // Optimize and convert to WebP
      const optimizedBuffer = await sharp(screenshot)
        .resize(1280, 720, { 
          fit: 'cover',
          position: 'top'
        })
        .webp({ quality: CONFIG.QUALITY })
        .toBuffer();

      // Save optimized image
      fs.writeFileSync(outputPath, optimizedBuffer);
      
      console.log(`✅ Screenshot captured: ${website.name}`);
      return { success: true, path: outputPath };
      
    } catch (error) {
      console.log(`❌ Screenshot failed: ${website.name} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async processWebsite(website) {
    const page = await this.browser.newPage();
    
    try {
      // Set up page with optimizations
      await page.setCacheEnabled(false);
      await page.setJavaScriptEnabled(true);
      
      // Block unnecessary resources for faster loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'media', 'other'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`🌐 Loading: ${website.name} (${website.url})`);
      
      // Navigate with timeout
      await page.goto(website.url, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.TIMEOUT_MS
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Detect hero section
      const heroConfig = await this.detectHeroSection(page);
      
      // Capture screenshot
      const result = await this.captureScreenshot(page, website, heroConfig);
      
      if (result.success) {
        this.stats.successful++;
        console.log(`✅ Success: ${website.name}\n`);
      } else {
        this.stats.failed++;
        console.log(`❌ Failed: ${website.name} - ${result.error}\n`);
      }
      
      return result;
      
    } catch (error) {
      this.stats.failed++;
      console.log(`❌ Error processing ${website.name}: ${error.message}\n`);
      return { success: false, error: error.message };
    } finally {
      await page.close();
    }
  }

  async processBatch(websites, batchSize = CONFIG.MAX_CONCURRENT) {
    const results = [];
    
    for (let i = 0; i < websites.length; i += batchSize) {
      const batch = websites.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(websites.length / batchSize)}`);
      console.log(`Processing ${batch.length} websites...\n`);
      
      const batchPromises = batch.map(async (website) => {
        this.stats.processed++;
        return await this.processWebsite(website);
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }));
      
      // Progress update
      const progress = ((i + batch.length) / websites.length * 100).toFixed(1);
      console.log(`\n📊 Progress: ${i + batch.length}/${websites.length} (${progress}%)\n`);
      
      // Small delay between batches
      if (i + batchSize < websites.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  async generateFallback(website) {
    const categoryColors = {
      'SaaS': '#004F3B',
      'Agency/Studio': '#DD1E52',
      'Portfolio': '#E8D8CC',
      'Fintech': '#004F3B',
      'E-commerce': '#DD1E52',
      'Developer': '#ADADAD',
      'AI': '#004F3B',
      'Crypto/Web3': '#DD1E52',
      'Health': '#E8D8CC',
      'Education': '#004F3B',
      'Template': '#ADADAD',
      'Other': '#ADADAD'
    };

    const color = categoryColors[website.category.split('/')[0].trim()] || '#ADADAD';
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="100%" stop-color="#1F2937" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="45%" text-anchor="middle" fill="#FFFFFF" font-size="56" font-weight="700" font-family="Inter, Arial, sans-serif">${this.escapeXml(website.name)}</text>
      <text x="50%" y="55%" text-anchor="middle" fill="#E5E7EB" font-size="28" font-family="Inter, Arial, sans-serif">${this.escapeXml(website.category)}</text>
    </svg>`;

    const outputPath = path.join(CONFIG.OUTPUT_DIR, `${website.slug}.${CONFIG.FORMAT}`);
    const webpBuffer = await sharp(Buffer.from(svg))
      .webp({ quality: CONFIG.QUALITY })
      .toBuffer();
    
    fs.writeFileSync(outputPath, webpBuffer);
    console.log(`🎨 Generated fallback: ${website.name}`);
    return { success: true, path: outputPath, fallback: true };
  }

  escapeXml(value = '') {
    return value.replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }

  async run() {
    try {
      await this.initialize();
      
      const websites = await this.loadWebsiteData();
      
      // Filter to only process websites that need screenshots
      const maxSites = parseInt(process.env.MAX_SITES || '0', 10);
      const sitesToProcess = maxSites > 0 ? websites.slice(0, maxSites) : websites;
      
      console.log(`🎯 Processing ${sitesToProcess.length} websites with advanced hero detection...\n`);
      
      const results = await this.processBatch(sitesToProcess);
      
      // Generate fallbacks for failed screenshots
      const failedWebsites = sitesToProcess.filter((_, index) => !results[index]?.success);
      console.log(`\n🎨 Generating ${failedWebsites.length} fallback images...\n`);
      
      for (const website of failedWebsites) {
        await this.generateFallback(website);
      }
      
      // Final statistics
      console.log('\n' + '='.repeat(60));
      console.log('📊 FINAL STATISTICS');
      console.log('='.repeat(60));
      console.log(`✅ Successful screenshots: ${this.stats.successful}`);
      console.log(`❌ Failed screenshots: ${this.stats.failed}`);
      console.log(`🎨 Fallback images: ${failedWebsites.length}`);
      console.log(`📈 Success rate: ${((this.stats.successful / this.stats.processed) * 100).toFixed(1)}%`);
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('\n🔚 Browser closed');
      }
    }
  }
}

// Run the system
if (require.main === module) {
  const system = new AdvancedScreenshotSystem();
  system.run().catch(console.error);
}

module.exports = AdvancedScreenshotSystem;
