const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Normalize URL for comparison
function normalizeUrl(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    let normalized = urlObj.hostname.toLowerCase();
    // Remove www prefix
    if (normalized.startsWith('www.')) {
      normalized = normalized.substring(4);
    }
    // Remove trailing slash from pathname
    let pathname = urlObj.pathname.replace(/\/$/, '') || '/';
    return normalized + pathname;
  } catch (e) {
    // If URL parsing fails, try basic normalization
    return url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('?')[0]
      .split('#')[0];
  }
}

// Normalize name for comparison
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim();
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname.toLowerCase();
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (e) {
    return normalizeUrl(url).split('/')[0];
  }
}

// Parse CSV file
function parseCSVFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const websites = [];
  for (const row of data) {
    const name = row['text-size-regular']?.trim();
    const url = row['external-link href']?.trim();
    
    if (name && url) {
      websites.push({
        name,
        url,
        normalizedName: normalizeName(name),
        normalizedUrl: normalizeUrl(url),
        domain: extractDomain(url),
      });
    }
  }

  return websites;
}

// Load current database
function loadCurrentDatabase() {
  const csvPath = path.join(process.cwd(), 'data', 'websites.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  const { data } = Papa.parse(fileContent, {
    header: false,
    skipEmptyLines: true,
  });

  const websites = [];
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = row[0]?.trim();
    const url = row[1]?.trim();

    if (name && url) {
      websites.push({
        name,
        url,
        normalizedName: normalizeName(name),
        normalizedUrl: normalizeUrl(url),
        domain: extractDomain(url),
      });
    }
  }

  return websites;
}

// Compare websites
function compareWebsites(csvWebsites, dbWebsites) {
  const matches = [];
  const missing = [];
  const dbUrlMap = new Map();
  const dbNameMap = new Map();
  const dbDomainMap = new Map();

  // Build lookup maps from database
  for (const dbSite of dbWebsites) {
    dbUrlMap.set(dbSite.normalizedUrl, dbSite);
    dbNameMap.set(dbSite.normalizedName, dbSite);
    
    // Also index by domain for fuzzy matching
    if (!dbDomainMap.has(dbSite.domain)) {
      dbDomainMap.set(dbSite.domain, []);
    }
    dbDomainMap.get(dbSite.domain).push(dbSite);
  }

  // Check each CSV website
  for (const csvSite of csvWebsites) {
    let found = false;
    let matchType = '';

    // Try exact URL match first
    if (dbUrlMap.has(csvSite.normalizedUrl)) {
      matches.push({
        csv: csvSite,
        db: dbUrlMap.get(csvSite.normalizedUrl),
        matchType: 'url',
      });
      found = true;
    }
    // Try exact name match
    else if (dbNameMap.has(csvSite.normalizedName)) {
      const dbMatch = dbNameMap.get(csvSite.normalizedName);
      // Verify domain is similar
      if (dbMatch.domain === csvSite.domain || 
          dbMatch.domain.replace(/^www\./, '') === csvSite.domain.replace(/^www\./, '')) {
        matches.push({
          csv: csvSite,
          db: dbMatch,
          matchType: 'name',
        });
        found = true;
      }
    }
    // Try domain-based fuzzy match
    else if (dbDomainMap.has(csvSite.domain)) {
      const domainMatches = dbDomainMap.get(csvSite.domain);
      // Check if any domain match has similar name
      for (const dbMatch of domainMatches) {
        if (dbMatch.normalizedName.includes(csvSite.normalizedName) ||
            csvSite.normalizedName.includes(dbMatch.normalizedName)) {
          matches.push({
            csv: csvSite,
            db: dbMatch,
            matchType: 'domain+name',
          });
          found = true;
          break;
        }
      }
    }

    if (!found) {
      missing.push(csvSite);
    }
  }

  return { matches, missing };
}

// Main execution
function main() {
  console.log('Starting verification...\n');

  // Parse CSV file
  const csvPath = 'c:/Users/prate/Downloads/a1 - a1.csv.csv';
  console.log(`Parsing CSV file: ${csvPath}`);
  const csvWebsites = parseCSVFile(csvPath);
  console.log(`Found ${csvWebsites.length} websites in CSV\n`);

  // Load current database
  console.log('Loading current database...');
  const dbWebsites = loadCurrentDatabase();
  console.log(`Found ${dbWebsites.length} websites in database\n`);

  // Compare
  console.log('Comparing websites...');
  const { matches, missing } = compareWebsites(csvWebsites, dbWebsites);
  console.log(`Found ${matches.length} matches`);
  console.log(`Found ${missing.length} missing websites\n`);

  // Generate report
  console.log('='.repeat(80));
  console.log('VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log(`Total websites in CSV: ${csvWebsites.length}`);
  console.log(`Total websites in database: ${dbWebsites.length}`);
  console.log(`Matches found: ${matches.length} (${((matches.length / csvWebsites.length) * 100).toFixed(1)}%)`);
  console.log(`Missing websites: ${missing.length} (${((missing.length / csvWebsites.length) * 100).toFixed(1)}%)\n`);

  if (missing.length > 0) {
    console.log('MISSING WEBSITES:');
    console.log('-'.repeat(80));
    missing.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name}`);
      console.log(`   URL: ${site.url}`);
      console.log(`   Domain: ${site.domain}`);
      console.log('');
    });

    // Save missing websites to file
    const missingPath = path.join(process.cwd(), 'scripts', 'missing-websites.json');
    fs.writeFileSync(missingPath, JSON.stringify(missing, null, 2));
    console.log(`\nMissing websites saved to: ${missingPath}`);
  } else {
    console.log('✓ All websites from CSV are already in the database!');
  }

  // Show some match examples
  if (matches.length > 0) {
    console.log('\nSAMPLE MATCHES:');
    console.log('-'.repeat(80));
    matches.slice(0, 5).forEach((match, index) => {
      console.log(`${index + 1}. ${match.csv.name}`);
      console.log(`   CSV URL: ${match.csv.url}`);
      console.log(`   DB URL: ${match.db.url}`);
      console.log(`   Match Type: ${match.matchType}`);
      console.log('');
    });
  }
}

main();
