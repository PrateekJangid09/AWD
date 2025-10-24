const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Read CSV
const csvPath = path.join(process.cwd(), 'data', 'websites.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');
const { data } = Papa.parse(fileContent, { header: false, skipEmptyLines: true });

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Check all websites
const websites = data.slice(1).map(row => ({
  name: row[0]?.trim() || 'Unnamed',
  url: row[1]?.trim() || '',
  category: row[2]?.trim() || 'Uncategorized',
  slug: createSlug(row[0]?.trim() || 'unnamed')
}));

console.log('🔍 SCREENSHOT AUDIT REPORT');
console.log('========================\n');

let totalWebsites = websites.length;
let screenshotsExist = 0;
let screenshotsMissing = 0;
let placeholderUrls = 0;

const missingScreenshots = [];
const existingScreenshots = [];

websites.forEach(w => {
  const expectedPath = path.join('public', 'screenshots', `${w.slug}.webp`);
  const exists = fs.existsSync(expectedPath);
  
  if (w.url.includes('impossiblefoods.com')) {
    placeholderUrls++;
  }
  
  if (exists) {
    screenshotsExist++;
    existingScreenshots.push(w.name);
  } else {
    screenshotsMissing++;
    missingScreenshots.push({
      name: w.name,
      slug: w.slug,
      url: w.url,
      category: w.category
    });
  }
});

console.log(`📊 SUMMARY:`);
console.log(`Total websites: ${totalWebsites}`);
console.log(`Screenshots exist: ${screenshotsExist} (${Math.round(screenshotsExist/totalWebsites*100)}%)`);
console.log(`Screenshots missing: ${screenshotsMissing} (${Math.round(screenshotsMissing/totalWebsites*100)}%)`);
console.log(`Placeholder URLs: ${placeholderUrls}`);

console.log(`\n❌ MISSING SCREENSHOTS (First 20):`);
missingScreenshots.slice(0, 20).forEach(w => {
  console.log(`- ${w.name} (${w.slug}.webp) - ${w.category}`);
});

if (missingScreenshots.length > 20) {
  console.log(`... and ${missingScreenshots.length - 20} more`);
}

console.log(`\n✅ SAMPLE EXISTING SCREENSHOTS:`);
existingScreenshots.slice(0, 10).forEach(name => {
  console.log(`- ${name}`);
});

// Check for potential slug mismatches
console.log(`\n🔍 CHECKING FOR SLUG MISMATCHES:`);
const screenshotFiles = fs.readdirSync('public/screenshots').filter(f => f.endsWith('.webp'));
const screenshotSlugs = screenshotFiles.map(f => f.replace('.webp', ''));

let potentialMismatches = 0;
websites.slice(0, 50).forEach(w => {
  if (!screenshotSlugs.includes(w.slug) && !w.url.includes('impossiblefoods.com')) {
    console.log(`Potential mismatch: ${w.name} -> ${w.slug}.webp (not found)`);
    potentialMismatches++;
  }
});

if (potentialMismatches === 0) {
  console.log('No obvious slug mismatches found in first 50 websites');
}
