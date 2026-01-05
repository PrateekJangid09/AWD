const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hasSpecificCategory(category) {
  const cat = category?.trim() || '';
  return cat !== '' && 
         cat !== 'Uncategorized' && 
         cat !== 'Other' &&
         cat.toLowerCase() !== 'other';
}

function isValidOfficialUrl(url, name) {
  if (!url || !url.trim()) return false;
  
  const urlLower = url.toLowerCase().trim();
  
  if (!urlLower.startsWith('http://') && !urlLower.startsWith('https://')) {
    return false;
  }
  
  const platformDomains = [
    'land-book.com',
    'saaslandingpage.com',
    'onepagelove.com',
    'webflow.com/made-in-webflow',
    'webflow.com/@',
    'a1.gallery',
  ];
  
  for (const platform of platformDomains) {
    if (urlLower.includes(platform)) {
      return false;
    }
  }
  
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    const domainWithoutTld = domain.split('.')[0];
    
    if (domainWithoutTld.length > 30) {
      return false;
    }
    
    const nameSlug = createSlug(name);
    if (nameSlug.length > 15 && domainWithoutTld.length > 20) {
      const nameSlugStart = nameSlug.substring(0, Math.min(20, nameSlug.length));
      if (domainWithoutTld.includes(nameSlugStart) && domainWithoutTld.length > 25) {
        return false;
      }
    }
    
    const hyphenCount = (domainWithoutTld.match(/-/g) || []).length;
    if (domainWithoutTld.length > 25 && hyphenCount > 3) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

const csvPath = path.join(__dirname, '..', 'data', 'websites.csv');
const csv = fs.readFileSync(csvPath, 'utf-8');
const parsed = Papa.parse(csv, { header: false, skipEmptyLines: true });
const data = parsed.data.slice(1);

const valid = data.filter(row => {
  const name = row[0]?.trim() || '';
  const url = row[1]?.trim() || '';
  const category = row[2]?.trim() || '';
  const hidden = row[5]?.trim().toLowerCase() === 'true';
  
  if (hidden) return false;
  if (!name || name === 'Unnamed') return false;
  if (!hasSpecificCategory(category)) return false;
  if (!isValidOfficialUrl(url, name)) return false;
  
  return true;
});

console.log('=== FILTERING RESULTS ===');
console.log('Total websites:', data.length);
console.log('Valid websites (after filtering):', valid.length);
console.log('Filtered out:', data.length - valid.length);
console.log('');
console.log('Sample valid websites:');
valid.slice(0, 15).forEach((row, i) => {
  console.log(`${i + 1}. ${row[0]} | ${row[2]} | ${row[1]}`);
});
