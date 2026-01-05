const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Extract actual website URL from platform links
function extractActualUrl(website) {
  const url = website.url || '';
  const name = website.name || '';
  
  // If it's already a direct URL (not a platform link), return it
  if (url && !url.includes('land-book.com') && !url.includes('saaslandingpage.com') && 
      !url.includes('onepagelove.com') && !url.includes('webflow.com/made-in-webflow')) {
    // Check if it's a valid URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's just a domain, add https://
    if (url.includes('.') && !url.includes(' ')) {
      return `https://${url}`;
    }
  }
  
  // Try to extract domain from domainHint
  if (website.domainHint && website.domainHint !== 'book.com') {
    return `https://${website.domainHint}`;
  }
  
  // For platform links, try to infer URL from name
  const nameLower = name.toLowerCase();
  
  // Common patterns: "name.com", "name.io", "getname.com", "tryname.com", etc.
  const domainPatterns = [
    /^([a-z0-9-]+)\.(com|io|co|ai|app|dev|net|org)$/i,
    /^get([a-z0-9-]+)\.(com|io|co|ai|app)$/i,
    /^try([a-z0-9-]+)\.(com|io|co|ai|app)$/i,
    /^([a-z0-9-]+)\.(studio|design|agency)$/i,
  ];
  
  for (const pattern of domainPatterns) {
    const match = name.match(pattern);
    if (match) {
      return `https://${match[0]}`;
    }
  }
  
  // Try to create URL from slugified name
  const slug = nameLower
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Common TLDs to try
  const tlds = ['com', 'io', 'co', 'ai', 'app', 'dev'];
  for (const tld of tlds) {
    const potentialUrl = `https://${slug}.${tld}`;
    // Return first reasonable guess
    return potentialUrl;
  }
  
  // Fallback: return name as-is (will need manual review)
  return name;
}

// Categorize website based on name and URL
function categorizeWebsite(name, url) {
  const nameLower = name.toLowerCase();
  const urlLower = url.toLowerCase();
  const combined = `${nameLower} ${urlLower}`;
  
  // AI Agents and AI (check before SaaS)
  if (combined.includes('ai agent') || (combined.includes('agent') && combined.includes('ai'))) {
    return 'AI Agent';
  }
  if (combined.includes(' ai') || combined.includes('artificial intelligence') || 
      nameLower.endsWith('ai') || urlLower.includes('.ai')) {
    return 'AI Tool/SaaS';
  }
  
  // SaaS/Software
  if (combined.includes('saas') || combined.includes('software') || 
      combined.includes('platform') || combined.includes('tool') ||
      combined.includes('app') || combined.includes('dashboard')) {
    return 'SaaS';
  }
  
  // Fintech
  if (combined.includes('fintech') || combined.includes('finance') || 
      combined.includes('payment') || combined.includes('bank') ||
      combined.includes('crypto') || combined.includes('wallet') ||
      combined.includes('invest') || combined.includes('trading')) {
    return 'Fintech';
  }
  
  // E-commerce
  if (combined.includes('ecommerce') || combined.includes('e-commerce') ||
      combined.includes('shop') || combined.includes('store') ||
      combined.includes('marketplace') || combined.includes('buy')) {
    return 'E-commerce';
  }
  
  // Agency/Studio
  if (combined.includes('agency') || combined.includes('studio') ||
      combined.includes('design') || combined.includes('creative') ||
      nameLower.endsWith('studio') || nameLower.endsWith('agency')) {
    return 'Agency/Studio';
  }
  
  // Portfolio
  if (combined.includes('portfolio') || nameLower.includes('portfolio')) {
    return 'Portfolio';
  }
  
  // Developer tools
  if (combined.includes('dev') || combined.includes('developer') ||
      combined.includes('api') || combined.includes('sdk') ||
      combined.includes('library') || combined.includes('framework')) {
    return 'Developer';
  }
  
  // Health
  if (combined.includes('health') || combined.includes('wellness') ||
      combined.includes('fitness') || combined.includes('medical') ||
      combined.includes('therapy') || combined.includes('care')) {
    return 'Health';
  }
  
  // Education
  if (combined.includes('education') || combined.includes('course') ||
      combined.includes('learn') || combined.includes('school') ||
      combined.includes('academy') || combined.includes('university')) {
    return 'Education';
  }
  
  // Template
  if (combined.includes('template') || nameLower.includes('template')) {
    return 'Template';
  }
  
  // Default
  return 'Other';
}

// Generate description based on name and category
function generateDescription(name, category) {
  const nameLower = name.toLowerCase();
  
  // Try to infer what the website does from the name
  if (nameLower.includes('ai') || nameLower.includes('artificial')) {
    return `AI-powered ${category.toLowerCase()} solution`;
  }
  if (nameLower.includes('design') || nameLower.includes('studio')) {
    return `Creative design ${category.toLowerCase()}`;
  }
  if (nameLower.includes('app') || nameLower.includes('platform')) {
    return `${category} platform and application`;
  }
  
  // Generic description based on category
  const descriptions = {
    'SaaS': 'Software as a service platform',
    'AI Tool/SaaS': 'AI-powered software tool',
    'AI Agent': 'AI agent platform',
    'Fintech': 'Financial technology platform',
    'E-commerce': 'E-commerce and online store',
    'Agency/Studio': 'Creative agency and design studio',
    'Portfolio': 'Portfolio and showcase website',
    'Developer': 'Developer tools and resources',
    'Health': 'Health and wellness platform',
    'Education': 'Educational platform and courses',
    'Template': 'Website template and design',
    'Other': 'Online platform and service'
  };
  
  return descriptions[category] || 'Online platform and service';
}

// Main function
function addAllCsvWebsites() {
  const reportPath = path.join(__dirname, 'verification-report.json');
  const csvPath = path.join(__dirname, '..', 'data', 'websites.csv');
  
  console.log('Loading verification report...');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  
  console.log('Loading existing database...');
  const existingCsv = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(existingCsv, { header: false, skipEmptyLines: true });
  const existingWebsites = parsed.data.slice(1);
  
  console.log(`Current database has ${existingWebsites.length} websites\n`);
  
  // Create lookup sets
  const existingUrls = new Set();
  const existingNames = new Set();
  
  existingWebsites.forEach(row => {
    const url = row[1]?.trim().toLowerCase();
    const name = row[0]?.trim().toLowerCase();
    if (url) existingUrls.add(url);
    if (name) existingNames.add(name);
  });
  
  // Collect all websites from CSV files
  const allCsvWebsites = [];
  Object.keys(report).forEach(source => {
    if (report[source].websites) {
      report[source].websites.forEach(website => {
        allCsvWebsites.push(website);
      });
    }
  });
  
  console.log(`Found ${allCsvWebsites.length} websites in CSV files\n`);
  console.log('Processing websites...');
  
  const newWebsites = [];
  let skipped = 0;
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
  
  for (const website of allCsvWebsites) {
    const name = website.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }
    
    // Extract actual URL
    let actualUrl = extractActualUrl(website);
    
    // Normalize for comparison
    const normalizedUrl = normalizeUrl(actualUrl);
    const normalizedName = normalizeName(name);
    
    // Skip if already exists
    if (existingUrls.has(normalizedUrl) || existingNames.has(normalizedName)) {
      skipped++;
      continue;
    }
    
    // Check fuzzy match
    let found = false;
    for (const existingName of existingNames) {
      if (existingName.includes(normalizedName) || normalizedName.includes(existingName)) {
        if (existingName.length > 3 && normalizedName.length > 3) {
          found = true;
          break;
        }
      }
    }
    
    if (found) {
      skipped++;
      continue;
    }
    
    // Categorize
    const category = categorizeWebsite(name, actualUrl);
    
    // Generate description
    const description = generateDescription(name, category);
    
    // Create CSV row
    newWebsites.push([
      name,
      actualUrl,
      category,
      description,
      '', // featured
      ''  // hidden
    ]);
  }
  
  console.log(`\nProcessed ${allCsvWebsites.length} websites:`);
  console.log(`  ✅ New websites to add: ${newWebsites.length}`);
  console.log(`  ⏭️  Skipped (duplicates): ${skipped}\n`);
  
  if (newWebsites.length === 0) {
    console.log('No new websites to add!');
    return;
  }
  
  // Append to CSV
  const csvContent = Papa.unparse(newWebsites, {
    header: false,
    quotes: true
  });
  
  // Backup original file
  const backupPath = csvPath.replace('.csv', `.backup.${Date.now()}.csv`);
  fs.writeFileSync(backupPath, existingCsv);
  console.log(`📦 Backup created: ${backupPath}\n`);
  
  // Append new websites
  const newContent = existingCsv + '\n' + csvContent;
  fs.writeFileSync(csvPath, newContent);
  console.log(`✅ Added ${newWebsites.length} websites to ${csvPath}`);
  console.log(`\nNew total: ${existingWebsites.length + newWebsites.length} websites`);
  
  // Show category breakdown
  const categoryCount = {};
  newWebsites.forEach(row => {
    const cat = row[2];
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  
  console.log('\nCategory breakdown:');
  Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a]).forEach(cat => {
    console.log(`  ${cat}: ${categoryCount[cat]}`);
  });
  
  console.log('\n⚠️  Note: Some URLs may need manual verification, especially for platform links.');
  console.log('Please review the added websites and update URLs/descriptions as needed.');
}

// Run
addAllCsvWebsites();
