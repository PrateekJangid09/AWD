const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(process.cwd(), 'data', 'websites.csv');

// Websites extracted from the images
const websitesToHide = [
  'broke-design',
  'Brooklyn Org',
  'brown-white-creative',
  'Bryn Taylor',
  'bucketlistly.com',
  'bucketlistly.blog',
  'Buy Me a Coffee',
  'calm.com',
  'cakeresume.com',
  'Canals and Windmills',
  'cambridge-healthcare',
  'capital-centric',
  'care-cards',
  'carel-piet-hein',
  'canny.io',
  'Capsule Design Studio',
  'careers-adlucent',
  'cartpops.com',
  'Casey Cam Creative',
  'CASSETTE',
  'carrot.io',
  'causal.app',
  'chai-studios',
  'cheap-design-contest',
  'chime.com',
  'chevychase-design-studio',
  'circle.so',
  'Citrona Studio',
  'chris-myers-designs',
  'civic.com',
  'clarityui.xyz',
  'cloud-studio',
  'codat.io',
  'cohere.so',
  'Cofound',
  'Coherene',
  'collage-creative',
  'coinbase.com',
  'coinfalcon.com',
  'Coherence',
  'commuter-creative',
  'complish.app',
  'coneapp.io',
  'Control',
  'Crayo AI',
  'creative-bacon',
  'creative-blacktie',
  'creative-glofish',
  'creative-lab-five',
  'creative-mints',
  'creative-nuta',
  'creative-promises',
  'creative-rocket',
  'creative-web-design',
  'creative9',
  'creativelove',
  'course',
  'craig-pinto-design',
  'creatively-wise',
  'creativepeople-2',
  'creativeswitch',
  'Cuántika Studio',
  'curiouser-creative-studio',
  'cv-designlab',
  'damidesign',
  'Fiverr'
];

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function hideImageWebsites() {
  console.log('📝 Loading websites CSV...\n');
  
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const { data } = Papa.parse(fileContent, {
    header: false,
    skipEmptyLines: true,
  });

  const header = data[0];
  const websites = data.slice(1);
  
  console.log(`Total websites: ${websites.length}\n`);
  console.log(`Looking for ${websitesToHide.length} websites to hide...\n`);
  
  // Normalize target names for matching
  const normalizedTargets = websitesToHide.map(name => normalizeName(name));
  
  // Process websites
  const foundWebsites = [];
  let hiddenCount = 0;
  
  const updatedWebsites = websites.map((row, index) => {
    const name = row[0]?.trim() || '';
    const url = row[1]?.trim() || '';
    const category = row[2]?.trim() || '';
    const description = row[3]?.trim() || '';
    const featured = row[4]?.trim() || 'false';
    const hidden = row[5]?.trim() || 'false';
    
    const normalizedName = normalizeName(name);
    const slug = createSlug(name);
    
    // Check if this website should be hidden
    const shouldHide = normalizedTargets.some(target => {
      const normalizedTarget = normalizeName(target);
      const targetSlug = createSlug(target);
      
      return normalizedName === normalizedTarget ||
             normalizedName.includes(normalizedTarget) ||
             normalizedTarget.includes(normalizedName) ||
             slug === targetSlug ||
             slug.includes(targetSlug) ||
             targetSlug.includes(slug);
    });
    
    if (shouldHide && hidden !== 'true') {
      hiddenCount++;
      foundWebsites.push({
        index: index + 1,
        name,
        url,
        category,
        slug
      });
      console.log(`  ✓ Found and hiding: ${name} (${url}) [${category}]`);
      return [name, url, category, description, featured, 'true'];
    }
    
    return [name, url, category, description, featured, hidden];
  });
  
  console.log(`\n📋 Found ${foundWebsites.length} matching websites:\n`);
  
  // Display the list
  foundWebsites.forEach((w, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')}. ${w.name} (${w.url}) [${w.category}]`);
  });
  
  // Save list to JSON file
  const listPath = path.join(__dirname, 'image-websites-to-hide.json');
  fs.writeFileSync(listPath, JSON.stringify(foundWebsites, null, 2), 'utf-8');
  console.log(`\n💾 Website list saved to: ${listPath}\n`);
  
  if (foundWebsites.length === 0) {
    console.log('⚠️  No matching websites found. They may already be hidden or not exist in the CSV.\n');
    return;
  }
  
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
  hideImageWebsites().catch(console.error);
}

module.exports = { hideImageWebsites };
