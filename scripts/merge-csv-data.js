const fs = require('fs');
const path = require('path');

// Helper function to create slug
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to clean URL
function cleanUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
}

// Parse Sheet5.csv
function parseSheet5(filePath) {
  console.log('Parsing Sheet5.csv...');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const websites = [];
  
  for (const line of lines) {
    // Format: 1. **headroom.com** - Description | Category: AI Tool/SaaS
    const match = line.match(/^\d+\.\s+\*\*([^\*]+)\*\*\s+-\s+([^|]+)\|\s*Category:\s*(.+)$/);
    
    if (match) {
      const url = match[1].trim();
      const description = match[2].trim();
      const category = match[3].trim();
      
      // Extract name from URL
      let name = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      
      websites.push({
        name,
        url: cleanUrl(url),
        category,
        description
      });
    }
  }
  
  console.log(`Parsed ${websites.length} websites from Sheet5.csv`);
  return websites;
}

// Parse Final Batch CSV
function parseFinalBatch(filePath) {
  console.log('Parsing Final Batch CSV...');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const websites = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse CSV line (handle quoted fields)
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add last field
    
    if (fields.length >= 4) {
      const name = fields[0].trim();
      const url = fields[1].trim();
      const category = fields[2].trim();
      const description = fields[3].trim();
      
      if (name && url) {
        websites.push({
          name,
          url: cleanUrl(url),
          category,
          description
        });
      }
    }
  }
  
  console.log(`Parsed ${websites.length} websites from Final Batch`);
  return websites;
}

// Read existing websites.csv
function readExistingWebsites(filePath) {
  console.log('Reading existing websites.csv...');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const websites = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse CSV line (handle quoted fields)
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.replace(/^"|"$/g, ''));
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.replace(/^"|"$/g, '')); // Add last field
    
    if (fields.length >= 4) {
      websites.push({
        name: fields[0].trim(),
        url: fields[1].trim(),
        category: fields[2].trim(),
        description: fields[3].trim()
      });
    }
  }
  
  console.log(`Read ${websites.length} existing websites`);
  return websites;
}

// Merge and deduplicate websites
function mergeWebsites(existing, sheet5, finalBatch) {
  console.log('Merging websites...');
  
  const urlSet = new Set();
  const nameSet = new Set();
  const merged = [];
  
  // Add existing websites first
  for (const website of existing) {
    const url = website.url.toLowerCase();
    const name = website.name.toLowerCase();
    
    if (!urlSet.has(url) && !nameSet.has(name)) {
      urlSet.add(url);
      nameSet.add(name);
      merged.push(website);
    }
  }
  
  // Add websites from Sheet5
  for (const website of sheet5) {
    const url = website.url.toLowerCase();
    const name = website.name.toLowerCase();
    
    if (!urlSet.has(url) && !nameSet.has(name)) {
      urlSet.add(url);
      nameSet.add(name);
      merged.push(website);
    }
  }
  
  // Add websites from Final Batch
  for (const website of finalBatch) {
    const url = website.url.toLowerCase();
    const name = website.name.toLowerCase();
    
    if (!urlSet.has(url) && !nameSet.has(name)) {
      urlSet.add(url);
      nameSet.add(name);
      merged.push(website);
    }
  }
  
  console.log(`Total merged: ${merged.length} websites (${merged.length - existing.length} new)`);
  return merged;
}

// Write to CSV
function writeWebsitesCSV(websites, outputPath) {
  console.log('Writing to websites.csv...');
  
  // CSV header
  let csv = 'name,url,category,description\n';
  
  // Add each website
  for (const website of websites) {
    // Escape quotes and wrap fields in quotes
    const name = `"${website.name.replace(/"/g, '""')}"`;
    const url = `"${website.url.replace(/"/g, '""')}"`;
    const category = `"${website.category.replace(/"/g, '""')}"`;
    const description = `"${website.description.replace(/"/g, '""')}"`;
    
    csv += `${name},${url},${category},${description}\n`;
  }
  
  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`Written ${websites.length} websites to ${outputPath}`);
}

// Main execution
try {
  const rootDir = path.join(__dirname, '..');
  const sheet5Path = path.join(rootDir, 'Website Data - Sheet5.csv');
  const finalBatchPath = path.join(rootDir, 'Website Data - Final Batch (1).csv');
  const existingPath = path.join(rootDir, 'landing-directory', 'data', 'websites.csv');
  const outputPath = path.join(rootDir, 'landing-directory', 'data', 'websites.csv');
  
  // Parse both source files
  const sheet5Websites = parseSheet5(sheet5Path);
  const finalBatchWebsites = parseFinalBatch(finalBatchPath);
  const existingWebsites = readExistingWebsites(existingPath);
  
  // Merge all websites
  const mergedWebsites = mergeWebsites(existingWebsites, sheet5Websites, finalBatchWebsites);
  
  // Write to output
  writeWebsitesCSV(mergedWebsites, outputPath);
  
  console.log('\n✅ Successfully merged all CSV files!');
  console.log(`Total websites: ${mergedWebsites.length}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

