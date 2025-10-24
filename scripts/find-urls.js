const fs = require('fs');
const path = require('path');

// This script helps identify websites with placeholder URLs
// Manual URL finding is recommended for accuracy

const csvPath = path.join(__dirname, '../Website Data - Final Batch.csv');
const outputPath = path.join(__dirname, '../data/missing-urls.json');

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const websites = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    if (values.length >= 4) {
      websites.push({
        name: values[0]?.trim(),
        url: values[1]?.trim(),
        category: values[2]?.trim(),
        description: values[3]?.trim()
      });
    }
  }
  
  return websites;
}

function findPlaceholderURLs() {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const websites = parseCSV(csvContent);
  
  const placeholders = websites.filter(site => 
    site.url && site.url.includes('impossiblefoods.com')
  );
  
  console.log(`\n📊 Found ${placeholders.length} websites with placeholder URLs\n`);
  console.log('🔍 Websites needing real URLs:\n');
  
  const missing = placeholders.map((site, index) => ({
    index: index + 1,
    name: site.name,
    category: site.category,
    currentURL: site.url,
    suggestedSearch: `${site.name} official website`,
    // You'll need to manually fill these in
    realURL: ''
  }));
  
  missing.forEach(site => {
    console.log(`${site.index}. ${site.name} (${site.category})`);
    console.log(`   Search: "${site.suggestedSearch}"`);
    console.log('');
  });
  
  // Save to JSON for manual editing
  fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));
  
  console.log(`\n✅ List saved to: ${outputPath}`);
  console.log('📝 Please manually research and fill in the "realURL" field for each entry\n');
  console.log('💡 Tip: Search Google for "{site name} official website" or check LinkedIn, Crunchbase\n');
}

findPlaceholderURLs();

