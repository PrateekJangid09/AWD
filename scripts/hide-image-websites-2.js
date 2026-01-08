const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(process.cwd(), 'data', 'websites.csv');

// Websites extracted from the new images
const websitesToHide = [
  'Data.to.design',
  'David AI',
  'degordian-academy',
  'de-de-design-develop',
  'design-census-2016',
  'design-embraced',
  'design-embraced-2',
  'design-leeds',
  'design-lots-creative',
  'design-oclock',
  'design-week-portland',
  'design-zoom',
  'designbeast',
  'designcub',
  'designdosage',
  'designembraced',
  'designer-childrens-books',
  'designforfounders.com',
  'designing-monsters',
  'designme',
  'designmodo.com',
  'designobjekt',
  'designproject.io',
  'deskpass.com',
  'Destello',
  'deth-design',
  'device-scout',
  'devin-washburn',
  'dico.app',
  'doug-muise-design',
  'dow-smith-studio-2',
  'dow-smith-studio',
  'div-studio',
  'dona.ai',
  'drift.com',
  'dropbox-design',
  'E&W Design Studio',
  'easy-rocket-studio',
  'eclectique-designs',
  'eduflow.com',
  'electric-design',
  'EloyB | 2022 Portfolio',
  'eligible.com',
  'estudio-vitamina',
  'ethics-for-design',
  'exactly.ai',
  'explodingkittens.com',
  'fabmedia-studios',
  'factor-d-studio',
  'expper.tech',
  'fanpage-design',
  'farmwise.io',
  'featurebase.app',
  'feedsauce.com',
  'feedly.com',
  'Figurative Design Studio',
  'Finvest',
  'flexboom.co',
  'FlowMapp',
  'fluger-design',
  'flycash.me',
  'free-range-designs',
  'fresh-design',
  'Fridas Portfolio',
  'frontdoor.im',
  'froket-creative',
  'fs-millbank',
  'galoper-design',
  'galshir.com',
  'freshdesk.com',
  'Gamma',
  'garnet.app',
  'gathercontent.com',
  'gdevelopment',
  'getastra.com',
  'getslash.co',
  'getslowly.com',
  'gibbard-web-design',
  'ghost.org',
  'getnodis.com',
  'girl-in-paris-design',
  'glue-design',
  'glyphfinder.com',
  'gower-designs',
  'GoDaddy Studio',
  'gower-designs-2',
  'grafomap.com',
  'grandleisure.org',
  'grav-design',
  'graph.cool',
  'gravitational.com',
  'grooow.io',
  'growthbeats.com',
  'growtheme.com',
  'Gusto Wallet',
  'haatch-creative-design',
  'Habitat',
  'Hallwil\'s Agency Website',
  'handshadow-studio',
  'happy.tools',
  'hagrid.io',
  'hairstyleai.com',
  'haloneuro.com',
  'headlime.com',
  'hello-studios',
  'Hen³ Portfolio',
  'heroku.com',
  'hers',
  'hex-color-tool',
  'hivyapp.com',
  'hoborg-design-studio',
  'historysearch.com',
  'Homy Studio',
  'hooray-design',
  'hoot-hoot-studio',
  'honey-grove-design',
  'hyperboledeslgn',
  'idea-design-studio',
  'hypersonic.run',
  'identix-design-co',
  'ig-design',
  'igloo-web-studio',
  'ilya-medvedev'
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

async function hideImageWebsites2() {
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
  const listPath = path.join(__dirname, 'image-websites-to-hide-2.json');
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
  hideImageWebsites2().catch(console.error);
}

module.exports = { hideImageWebsites2 };
