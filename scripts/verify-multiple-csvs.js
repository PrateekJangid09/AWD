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
  return name.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
    .replace(/\s+/g, ' '); // Normalize whitespace
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

// Parse land-book CSV
function parseLandBook(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const websites = [];
  const seen = new Set();
  
  // Valid categories to include
  const validCategories = ['Landing Page', 'Portfolio', 'Ecommerce', 'Template', 'Other', 'Blog'];
  
  for (const row of parsed.data) {
    const name = row['d-block']?.trim(); // Website name is in d-block column
    const category = row['text-muted']?.trim(); // Category is in text-muted column
    const linkHref = row['website-item-link href']?.trim();
    
    // Include if we have a name, a valid category, and a link
    if (name && linkHref && validCategories.includes(category) &&
        !name.includes('https://') && !name.includes('http://') &&
        linkHref.includes('land-book.com/websites/')) {
      
      // Create unique key to avoid duplicates
      const key = normalizeName(name);
      if (!seen.has(key)) {
        seen.add(key);
        
        // Extract domain from image URL if available to help with matching
        const imgSrc = row['img-fluid src']?.trim();
        let domainHint = '';
        if (imgSrc) {
          const domainMatch = imgSrc.match(/-([a-z0-9-]+\.(?:com|io|co|ai|app|dev|net|org))/i);
          if (domainMatch) {
            domainHint = domainMatch[1];
          }
        }
        
        websites.push({
          name: name,
          url: linkHref, // Use land-book link
          domainHint: domainHint,
          source: 'land-book'
        });
      }
    }
  }
  
  return websites;
}

// Parse saaslandingpage CSV
function parseSaaSLandingPage(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const websites = [];
  
  for (const row of parsed.data) {
    const name = row['text-zinc-800']?.trim();
    const href = row['h-full href']?.trim();
    
    if (name) {
      websites.push({
        name: name,
        url: href || name, // saaslandingpage.com links, will match by name
        source: 'saaslandingpage'
      });
    }
  }
  
  return websites;
}

// Parse onepagelove CSV
function parseOnePageLove(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const websites = [];
  const seen = new Set();
  
  // Category names to exclude
  const categoryNames = [
    'Landing Page', 'Portfolio', 'SaaS', 'App', 'Ecommerce', 'Template', 'Other', 'Blog',
    'Digital Product', 'Physical Product', 'Service', 'Personal', 'Game', 'Experimental',
    'Long-form Journalism', 'Event', 'Launching Soon', 'Single Serving', 'Accommodation',
    'Resume', 'Startup', 'Informational', 'Photography', 'Sport', 'Announcement',
    'Non-profit', 'Music-related', 'Newsletters', 'Case Study', 'Restaurant',
    'One Page Blog', 'Competition', 'Movie', 'Wedding', 'Annual Report', 'Finance'
  ];
  
  for (const row of parsed.data) {
    // The link-image-short href contains actual website pages (not category pages)
    const linkHref = row['link-image-short href']?.trim();
    
    // Only process if it's a website page (not /inspiration/ category pages)
    if (linkHref && 
        linkHref.includes('onepagelove.com/') && 
        !linkHref.includes('/inspiration/')) {
      
      // Extract website slug from URL
      const urlParts = linkHref.split('/');
      const slug = urlParts[urlParts.length - 1];
      
      if (slug && slug.length > 2 && !seen.has(slug)) {
        // Skip if slug looks like a category
        if (categoryNames.some(cat => slug.toLowerCase().includes(cat.toLowerCase().replace(/\s+/g, '-')))) {
          continue;
        }
        
        seen.add(slug);
        
        // Try to find actual website name - look for non-category, non-URL values
        let name = slug;
        for (const [key, value] of Object.entries(row)) {
          if (value && typeof value === 'string' && 
              !value.includes('onepagelove.com') && 
              !value.includes('http') &&
              !value.includes('assets.onepagelove.com') &&
              value.length > 2 && value.length < 100 &&
              !value.match(/^\d+$/) && // Not just numbers
              !categoryNames.includes(value) &&
              !value.match(/^https?:\/\//)) {
            // Found a potential name
            name = value.trim();
            // Don't use category names as website names
            if (!categoryNames.some(cat => name.toLowerCase() === cat.toLowerCase())) {
              break;
            }
          }
        }
        
        // Use slug if name is still a category
        if (categoryNames.some(cat => name.toLowerCase() === cat.toLowerCase())) {
          name = slug;
        }
        
        websites.push({
          name: name || slug,
          url: linkHref, // onepagelove.com link, will match by name
          source: 'onepagelove'
        });
      }
    }
  }
  
  return websites;
}

// Parse a1 CSV (already verified before)
function parseA1(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const websites = [];
  
  for (const row of parsed.data) {
    const name = row['text-size-regular']?.trim();
    const url = row['external-link href']?.trim();
    
    if (name && url) {
      websites.push({
        name: name,
        url: url,
        source: 'a1'
      });
    }
  }
  
  return websites;
}

// Parse webflow CSV
function parseWebflow(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const websites = [];
  
  for (const row of parsed.data) {
    const name = row['wf-1rzwxxs 2']?.trim();
    const webflowLink = row['wf-1rzwxxs href']?.trim();
    
    if (name) {
      websites.push({
        name: name,
        url: webflowLink || name, // webflow.com link, will match by name
        source: 'webflow'
      });
    }
  }
  
  return websites;
}

// Load current database
function loadDatabase() {
  const csvPath = path.join(__dirname, '..', 'data', 'websites.csv');
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csv, { header: false, skipEmptyLines: true });
  
  const websites = [];
  const nameMap = new Map();
  const urlMap = new Map();
  
  // Skip header row
  for (let i = 1; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const name = row[0]?.trim();
    const url = row[1]?.trim();
    
    if (name && url) {
      const normalizedName = normalizeName(name);
      const normalizedUrl = normalizeUrl(url);
      
      websites.push({ name, url });
      
      // Create lookup maps
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, []);
      }
      nameMap.get(normalizedName).push({ name, url });
      
      if (!urlMap.has(normalizedUrl)) {
        urlMap.set(normalizedUrl, []);
      }
      urlMap.get(normalizedUrl).push({ name, url });
    }
  }
  
  return { websites, nameMap, urlMap };
}

// Find match in database
function findMatch(csvWebsite, nameMap, urlMap) {
  const normalizedName = normalizeName(csvWebsite.name);
  const normalizedUrl = normalizeUrl(csvWebsite.url);
  
  // Try URL match first
  if (normalizedUrl && urlMap.has(normalizedUrl)) {
    return { matched: true, by: 'url', match: urlMap.get(normalizedUrl)[0] };
  }
  
  // Try domain match
  const domain = extractDomain(csvWebsite.url);
  if (domain && domain !== normalizeName(csvWebsite.name)) {
    for (const [dbUrl, dbWebsites] of urlMap.entries()) {
      if (dbUrl.startsWith(domain)) {
        return { matched: true, by: 'domain', match: dbWebsites[0] };
      }
    }
  }
  
  // Try name match
  if (nameMap.has(normalizedName)) {
    const candidates = nameMap.get(normalizedName);
    // Check if any candidate URL domain matches
    for (const candidate of candidates) {
      const candidateDomain = extractDomain(candidate.url);
      const csvDomain = extractDomain(csvWebsite.url);
      if (candidateDomain && csvDomain && candidateDomain === csvDomain) {
        return { matched: true, by: 'name+domain', match: candidate };
      }
    }
    // If no domain match, use first candidate
    return { matched: true, by: 'name', match: candidates[0] };
  }
  
  // Try fuzzy name match (contains)
  for (const [dbName, dbWebsites] of nameMap.entries()) {
    if (dbName.includes(normalizedName) || normalizedName.includes(dbName)) {
      if (dbName.length > 3 && normalizedName.length > 3) {
        return { matched: true, by: 'fuzzy-name', match: dbWebsites[0] };
      }
    }
  }
  
  return { matched: false };
}

// Main verification function
function verifyCSVs() {
  const downloadsPath = path.join('C:', 'Users', 'prate', 'Downloads');
  const csvFiles = [
    { path: path.join(downloadsPath, 'land-book-2026-01-05.csv'), parser: parseLandBook, name: 'land-book' },
    { path: path.join(downloadsPath, 'saaslandingpage-2026-01-05.csv'), parser: parseSaaSLandingPage, name: 'saaslandingpage' },
    { path: path.join(downloadsPath, 'onepagelove-2026-01-05.csv'), parser: parseOnePageLove, name: 'onepagelove' },
    { path: path.join(downloadsPath, 'a1 - a1.csv.csv'), parser: parseA1, name: 'a1' },
    { path: path.join(downloadsPath, 'webflow.csv'), parser: parseWebflow, name: 'webflow' },
    { path: path.join(downloadsPath, 'webflow (1).csv'), parser: parseWebflow, name: 'webflow-duplicate' },
  ];
  
  console.log('Loading database...');
  const { nameMap, urlMap } = loadDatabase();
  console.log(`Database loaded: ${nameMap.size} unique names, ${urlMap.size} unique URLs\n`);
  
  const allResults = {};
  const allMissing = [];
  const allMatches = [];
  const uniqueWebsites = new Map(); // Track unique websites across all CSVs
  
  for (const csvFile of csvFiles) {
    if (!fs.existsSync(csvFile.path)) {
      console.log(`⚠️  File not found: ${csvFile.path}`);
      continue;
    }
    
    console.log(`Processing ${csvFile.name}...`);
    
    try {
      const csvWebsites = csvFile.parser(csvFile.path);
      console.log(`  Found ${csvWebsites.length} websites`);
      
      const matches = [];
      const missing = [];
      
      for (const csvWebsite of csvWebsites) {
        const match = findMatch(csvWebsite, nameMap, urlMap);
        
        // Create unique key for deduplication
        const uniqueKey = `${normalizeName(csvWebsite.name)}|${csvFile.name}`;
        
        if (match.matched) {
          matches.push({
            csv: csvWebsite,
            db: match.match,
            matchedBy: match.by
          });
          allMatches.push({ ...csvWebsite, source: csvFile.name, matchedBy: match.by });
        } else {
          missing.push(csvWebsite);
          allMissing.push({ ...csvWebsite, source: csvFile.name });
          
          // Track unique missing websites
          if (!uniqueWebsites.has(uniqueKey)) {
            uniqueWebsites.set(uniqueKey, csvWebsite);
          }
        }
      }
      
      const matchCount = matches.length;
      const missingCount = missing.length;
      const matchPercentage = csvWebsites.length > 0 
        ? ((matchCount / csvWebsites.length) * 100).toFixed(1)
        : 0;
      
      allResults[csvFile.name] = {
        total: csvWebsites.length,
        matches: matchCount,
        missing: missingCount,
        matchPercentage: parseFloat(matchPercentage),
        websites: csvWebsites,
        missingWebsites: missing
      };
      
      console.log(`  ✅ Matches: ${matchCount} (${matchPercentage}%)`);
      console.log(`  ❌ Missing: ${missingCount} (${(100 - parseFloat(matchPercentage)).toFixed(1)}%)\n`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${csvFile.name}:`, error.message);
      allResults[csvFile.name] = {
        error: error.message
      };
    }
  }
  
  // Generate summary
  const totalWebsites = Object.values(allResults).reduce((sum, r) => sum + (r.total || 0), 0);
  const totalMatches = Object.values(allResults).reduce((sum, r) => sum + (r.matches || 0), 0);
  const totalMissing = Object.values(allResults).reduce((sum, r) => sum + (r.missing || 0), 0);
  const uniqueMissingCount = uniqueWebsites.size;
  
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total websites across all CSVs: ${totalWebsites}`);
  console.log(`Total matches: ${totalMatches} (${((totalMatches / totalWebsites) * 100).toFixed(1)}%)`);
  console.log(`Total missing: ${totalMissing} (${((totalMissing / totalWebsites) * 100).toFixed(1)}%)`);
  console.log(`Unique missing websites: ${uniqueMissingCount}`);
  console.log('='.repeat(60));
  
  // Save results
  const outputDir = path.join(__dirname);
  
  // Complete report
  fs.writeFileSync(
    path.join(outputDir, 'verification-report.json'),
    JSON.stringify(allResults, null, 2)
  );
  
  // Missing websites grouped by source
  const missingBySource = {};
  for (const missing of allMissing) {
    if (!missingBySource[missing.source]) {
      missingBySource[missing.source] = [];
    }
    missingBySource[missing.source].push(missing);
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'missing-by-source.json'),
    JSON.stringify(missingBySource, null, 2)
  );
  
  // All unique missing websites
  const uniqueMissingArray = Array.from(uniqueWebsites.values());
  fs.writeFileSync(
    path.join(outputDir, 'unique-missing-websites.json'),
    JSON.stringify(uniqueMissingArray, null, 2)
  );
  
  console.log('\n📄 Reports saved:');
  console.log(`  - verification-report.json`);
  console.log(`  - missing-by-source.json`);
  console.log(`  - unique-missing-websites.json`);
}

// Run verification
verifyCSVs();
