const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(process.cwd(), 'data', 'websites.csv');

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function hideMarqueeWebsites() {
  console.log('📝 Loading websites CSV...\n');
  
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const { data } = Papa.parse(fileContent, {
    header: false,
    skipEmptyLines: true,
  });

  const header = data[0];
  const websites = data.slice(1);
  
  console.log(`Total websites: ${websites.length}\n`);
  
  // Process websites to identify visible ones
  const processedWebsites = websites.map((row, index) => {
    const name = row[0]?.trim() || '';
    const url = row[1]?.trim() || '';
    const category = row[2]?.trim() || '';
    const description = row[3]?.trim() || '';
    const featured = row[4]?.trim() || 'false';
    const hidden = row[5]?.trim() || 'false';
    
    return {
      index,
      name,
      url,
      category,
      description,
      featured,
      hidden,
      row: [name, url, category, description, featured, hidden]
    };
  });
  
  // Filter out already hidden websites
  const visibleWebsites = processedWebsites.filter(w => w.hidden !== 'true');
  
  // Get first 80 visible websites (those shown in marquee)
  const websitesToHide = visibleWebsites.slice(0, 80);
  
  console.log(`\n📋 Found ${websitesToHide.length} websites to hide (first 80 visible websites):\n`);
  
  // Create list for output
  const websiteList = websitesToHide.map((w, i) => ({
    index: i + 1,
    name: w.name,
    url: w.url,
    category: w.category,
    slug: createSlug(w.name)
  }));
  
  // Display the list
  websiteList.forEach((w, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')}. ${w.name} (${w.url}) [${w.category}]`);
  });
  
  // Save list to JSON file
  const listPath = path.join(__dirname, 'about-marquee-websites-to-hide.json');
  fs.writeFileSync(listPath, JSON.stringify(websiteList, null, 2), 'utf-8');
  console.log(`\n💾 Website list saved to: ${listPath}\n`);
  
  // Update CSV to mark these as hidden
  const websiteNamesToHide = new Set(websitesToHide.map(w => w.name.toLowerCase().trim()));
  
  let hiddenCount = 0;
  const updatedWebsites = processedWebsites.map((website) => {
    const normalizedName = website.name.toLowerCase().trim();
    
    if (websiteNamesToHide.has(normalizedName) && website.hidden !== 'true') {
      hiddenCount++;
      return [website.name, website.url, website.category, website.description, website.featured, 'true'];
    }
    
    return website.row;
  });
  
  // Create backup
  const backupPath = CSV_PATH.replace('.csv', `.backup.${Date.now()}.csv`);
  fs.writeFileSync(backupPath, fileContent, 'utf-8');
  console.log(`💾 Backup created: ${backupPath}\n`);
  
  // Write updated CSV
  const updatedData = [header, ...updatedWebsites];
  const csvContent = Papa.unparse(updatedData, {
    header: false,
  });
  
  fs.writeFileSync(CSV_PATH, csvContent, 'utf-8');
  
  console.log(`\n✅ Successfully hidden ${hiddenCount} website(s) from the product`);
  console.log(`📄 List saved to: ${listPath}\n`);
}

// Run the script
if (require.main === module) {
  hideMarqueeWebsites().catch(console.error);
}

module.exports = { hideMarqueeWebsites };
