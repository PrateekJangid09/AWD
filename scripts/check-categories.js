const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvPath = path.join(__dirname, '..', 'data', 'websites.csv');
const csv = fs.readFileSync(csvPath, 'utf-8');
const parsed = Papa.parse(csv, { header: false, skipEmptyLines: true });
const data = parsed.data.slice(1); // Skip header

const withCategory = data.filter(row => {
  const cat = row[2]?.trim();
  return cat && cat !== 'Uncategorized' && cat !== '';
});

const withoutCategory = data.filter(row => {
  const cat = row[2]?.trim();
  return !cat || cat === 'Uncategorized' || cat === '';
});

const otherCategory = data.filter(row => row[2]?.trim() === 'Other');
const specificCategory = data.filter(row => row[2]?.trim() && row[2]?.trim() !== 'Other');

console.log('=== CATEGORY ANALYSIS ===');
console.log('Total websites:', data.length);
console.log('');
console.log('With category defined:', withCategory.length, `(${((withCategory.length / data.length) * 100).toFixed(1)}%)`);
console.log('Without category:', withoutCategory.length, `(${((withoutCategory.length / data.length) * 100).toFixed(1)}%)`);
console.log('');
console.log('=== CATEGORY QUALITY ===');
console.log('With "Other" category:', otherCategory.length, `(${((otherCategory.length / data.length) * 100).toFixed(1)}%)`);
console.log('With specific category:', specificCategory.length, `(${((specificCategory.length / data.length) * 100).toFixed(1)}%)`);
console.log('');
if (withoutCategory.length > 0) {
  console.log('Sample without category:');
  withoutCategory.slice(0, 10).forEach((row, i) => {
    console.log(`${i + 1}. ${row[0]} - Category: "${row[2] || 'empty'}"`);
  });
}
