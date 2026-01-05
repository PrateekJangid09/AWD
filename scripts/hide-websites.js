const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(process.cwd(), 'data', 'websites.csv');

// Websites to hide (by name or URL)
const websitesToHide = [
  'sannewijbenga.com',
  'new.cauldron.app',
  'New Layer Capital',
  'new-the-uprising-creative',
  'mint-digital-new-designer',
  'The New Sweven.design',
  'newstream-design-2',
  'newinc.org',
];

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

function normalizeUrl(url) {
  return (url || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
}

async function hideWebsites() {
  console.log('📝 Loading websites CSV...\n');
  
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const { data } = Papa.parse(fileContent, {
    header: false,
    skipEmptyLines: true,
  });

  const header = data[0];
  const websites = data.slice(1);
  
  console.log(`Total websites: ${websites.length}\n`);
  
  let hiddenCount = 0;
  const updatedWebsites = websites.map((row, index) => {
    const name = row[0]?.trim() || '';
    const url = row[1]?.trim() || '';
    const category = row[2]?.trim() || '';
    const description = row[3]?.trim() || '';
    const featured = row[4]?.trim() || 'false';
    const hidden = row[5]?.trim() || 'false';
    
    // Check if this website should be hidden
    const normalizedName = normalizeName(name);
    const normalizedUrl = normalizeUrl(url);
    
    const shouldHide = websitesToHide.some(target => {
      const normalizedTarget = normalizeName(target);
      return normalizedName === normalizedTarget || 
             normalizedUrl === normalizeUrl(target) ||
             normalizedName.includes(normalizedTarget) ||
             normalizedUrl.includes(normalizeUrl(target));
    });
    
    if (shouldHide && hidden !== 'true') {
      hiddenCount++;
      console.log(`  ✓ Hiding: ${name} (${url})`);
      return [name, url, category, description, featured, 'true'];
    }
    
    return [name, url, category, description, featured, hidden];
  });
  
  // Create backup
  const backupPath = CSV_PATH.replace('.csv', `.backup.${Date.now()}.csv`);
  fs.writeFileSync(backupPath, fileContent, 'utf-8');
  console.log(`\n💾 Backup created: ${backupPath}\n`);
  
  // Write updated CSV
  const updatedData = [header, ...updatedWebsites];
  const csvContent = Papa.unparse(updatedData, {
    header: false,
  });
  
  fs.writeFileSync(CSV_PATH, csvContent, 'utf-8');
  
  console.log(`\n✅ Successfully hidden ${hiddenCount} website(s)`);
  console.log(`📊 Total websites: ${updatedWebsites.length}`);
  console.log(`\n🔄 Please restart your dev server to see the changes.`);
}

hideWebsites().catch(console.error);
