const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(process.cwd(), 'data', 'websites.csv');

async function countLiveWebsites() {
  console.log('📝 Loading websites CSV...\n');
  
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const { data } = Papa.parse(fileContent, {
    header: false,
    skipEmptyLines: true,
  });

  const websites = data.slice(1); // Skip header
  
  let totalCount = 0;
  let hiddenCount = 0;
  let visibleCount = 0;
  
  websites.forEach((row) => {
    const name = row[0]?.trim() || '';
    const hidden = row[5]?.trim() || 'false';
    
    if (name) {
      totalCount++;
      if (hidden === 'true') {
        hiddenCount++;
      } else {
        visibleCount++;
      }
    }
  });
  
  console.log('📊 Website Statistics:\n');
  console.log(`   Total websites in database: ${totalCount.toLocaleString()}`);
  console.log(`   Hidden websites: ${hiddenCount.toLocaleString()}`);
  console.log(`   Live/Visible websites: ${visibleCount.toLocaleString()}\n`);
  console.log(`   Percentage visible: ${((visibleCount / totalCount) * 100).toFixed(2)}%\n`);
}

countLiveWebsites().catch(console.error);
