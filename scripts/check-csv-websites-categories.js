const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Load the verification report to get all websites we checked
const reportPath = path.join(__dirname, 'verification-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Load the database
const csvPath = path.join(__dirname, '..', 'data', 'websites.csv');
const csv = fs.readFileSync(csvPath, 'utf-8');
const parsed = Papa.parse(csv, { header: false, skipEmptyLines: true });
const dbData = parsed.data.slice(1);

// Create lookup maps for database
const dbByName = new Map();
const dbByUrl = new Map();

dbData.forEach(row => {
  const name = row[0]?.trim().toLowerCase();
  const url = row[1]?.trim().toLowerCase();
  const category = row[2]?.trim();
  
  if (name) dbByName.set(name, { name: row[0], url: row[1], category });
  if (url) dbByUrl.set(url, { name: row[0], url: row[1], category });
});

// Collect all websites from CSV files
const allCsvWebsites = [];
let totalChecked = 0;

Object.keys(report).forEach(source => {
  if (report[source].websites) {
    totalChecked += report[source].total || 0;
    report[source].websites.forEach(website => {
      allCsvWebsites.push({
        name: website.name,
        url: website.url,
        source: website.source || source
      });
    });
  }
});

console.log('=== CSV FILES ANALYSIS ===');
console.log(`Total websites checked across all CSV files: ${totalChecked}`);
console.log(`Unique websites from CSVs: ${allCsvWebsites.length}`);
console.log('');

// Check which CSV websites are in database
const normalizeName = (name) => name?.toLowerCase().trim() || '';
const normalizeUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
};

let inDatabase = 0;
let inDatabaseWithCategory = 0;
let inDatabaseWithoutCategory = 0;
let notInDatabase = 0;

const inDbList = [];
const notInDbList = [];

allCsvWebsites.forEach(csvWebsite => {
  const csvName = normalizeName(csvWebsite.name);
  const csvUrl = normalizeUrl(csvWebsite.url);
  
  // Try to find in database
  let dbWebsite = dbByName.get(csvName) || dbByUrl.get(csvUrl);
  
  // Try fuzzy matching
  if (!dbWebsite) {
    for (const [dbName, dbSite] of dbByName.entries()) {
      if (dbName.includes(csvName) || csvName.includes(dbName)) {
        dbWebsite = dbSite;
        break;
      }
    }
  }
  
  if (dbWebsite) {
    inDatabase++;
    const category = dbWebsite.category?.trim();
    if (category && category !== 'Uncategorized' && category !== '') {
      inDatabaseWithCategory++;
      inDbList.push({ name: csvWebsite.name, category, inDb: true });
    } else {
      inDatabaseWithoutCategory++;
      inDbList.push({ name: csvWebsite.name, category: category || 'None', inDb: true });
    }
  } else {
    notInDatabase++;
    notInDbList.push({ name: csvWebsite.name, source: csvWebsite.source });
  }
});

console.log('=== DATABASE STATUS FOR CSV WEBSITES ===');
console.log(`Websites from CSVs that are in database: ${inDatabase} (${((inDatabase / allCsvWebsites.length) * 100).toFixed(1)}%)`);
console.log(`  - With category: ${inDatabaseWithCategory} (${((inDatabaseWithCategory / inDatabase) * 100).toFixed(1)}%)`);
console.log(`  - Without category: ${inDatabaseWithoutCategory} (${((inDatabaseWithoutCategory / inDatabase) * 100).toFixed(1)}%)`);
console.log(`Websites from CSVs NOT in database: ${notInDatabase} (${((notInDatabase / allCsvWebsites.length) * 100).toFixed(1)}%)`);
console.log('');

console.log('=== SUMMARY ===');
console.log(`Out of ${totalChecked} websites checked from CSV files:`);
console.log(`  ✅ In database: ${inDatabase} (${((inDatabase / totalChecked) * 100).toFixed(1)}%)`);
console.log(`  ❌ Not in database: ${notInDatabase} (${((notInDatabase / totalChecked) * 100).toFixed(1)}%)`);
console.log('');
console.log(`Of the ${inDatabase} websites that ARE in the database:`);
console.log(`  ✅ With category: ${inDatabaseWithCategory} (${((inDatabaseWithCategory / inDatabase) * 100).toFixed(1)}%)`);
console.log(`  ❌ Without category: ${inDatabaseWithoutCategory} (${((inDatabaseWithoutCategory / inDatabase) * 100).toFixed(1)}%)`);
