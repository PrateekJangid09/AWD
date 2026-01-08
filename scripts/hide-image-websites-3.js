const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(process.cwd(), 'data', 'websites.csv');

// Websites extracted from the new images
const websitesToHide = [
  'ilya-medvedev',
  'inside-marketing-design',
  'inspire-fitness',
  'indiecoin',
  'indinero.com',
  'intrinsic-studio',
  'invision-studio',
  'jbstudioweb',
  'jlern-design',
  'jlern-design-2',
  'jmore-design',
  'jn-mediendesign',
  'jon-wallace-design-it',
  'june.so',
  'jrk-design',
  'Karumi AI',
  'kahuna-webstudio',
  'kairn.app',
  'Keith Greenbaum',
  'kepler.app',
  'kinsta.com',
  'kiwihr.com',
  'koma-studio',
  'lattice.com',
  'lawrenceville-vision-care',
  'lean-analytics-workshop',
  'legwork-studio',
  'less-framework-2',
  'letter-learner',
  'Litebox',
  'logodesign',
  'logojoy.com',
  'looka.com',
  'logopony.com',
  'Lowell Design Co',
  'Lukas Rudrof Portfolio',
  'love-money-agency',
  'lunchmoney.app',
  'Macaspac Studio Portfolio',
  'lukas-designs',
  'macpaw.com',
  'madly-creative',
  'Maggie App',
  'Made With Gsap',
  'magician.design',
  'mainly.design',
  'make-design-not-war',
  'Maniv - Venture Capital',
  'manufacture-dessai',
  'mark-uraine-design',
  'marko-gole-portfolio',
  'mary-daniel-portfolio',
  'MasterClass',
  'meridian-design-group',
  'mememorph.com',
  'Merus',
  'messagebird.com',
  'mention.com',
  'metroline-design',
  'mike-designs-things',
  'miles-anderson-design',
  'ministrydesign',
  'miro.com',
  'Mission Squad',
  'mix.com',
  'mm-photodesign',
  'mn-development',
  'Mo.design',
  'mollie.com',
  'moksha-design-studio',
  'moosedesign',
  'mooze-design',
  'Moris Design Co.',
  'morphix-design-studio',
  'montero-design',
  'Musho.ai',
  'myfront.page',
  'mythia.com',
  'narrative.bi',
  'Nate Ward Portfolio Site',
  'Nate Fussner Portfolio',
  'Native',
  'nestle-shop-wien',
  'Never too late Studio',
  'neverbounce.com',
  'nicolas-rochon-agency',
  'Noomo Agency',
  'niice.co',
  'nordic-design',
  'Nothing',
  'OO Design',
  'oddworks.studio',
  'OFFF 2025',
  'officialiqtests.com',
  'olga-designs',
  'ondesign',
  'olmo.io',
  'one-day-for-design',
  'onroadmap.com',
  'Operate',
  'ops-studio',
  'orchect.io',
  'osk-studio',
  'Optimal Workshop',
  'oupas-design',
  'Overthought Studio',
  'p-studio',
  'Pace | Outsource to AI',
  'pasteapp.me',
  'Payman',
  'Pedro Matos Chaves • Design',
  'Pepperclip Studio',
  'Personal 2023 Portfolio',
  'Personal Portfolio',
  'Portfolio Website',
  'Portfolio Website - LaOlu',
  'Peec AI',
  'petex-studio',
  'Phunk Creative',
  'pink-pepper.showit.site',
  'pixelfly-design',
  'pixelhub-creative',
  'pline-studios',
  'pixelworkshop',
  'Please Call Me Champ',
  'podia.com',
  'Poison Studio',
  'pooliestudios-2',
  'pqina.nl',
  'Pretty Useful Co. Studio',
  'Prevalent AI',
  'prismic.io',
  'privacy.com',
  'produx-design-website',
  'profitwell.com',
  'Profluent',
  'Programmai',
  'psynai-design',
  'purenine-studios-inc',
  'quanti-studios',
  'quibi.com',
  'decathlon.co.uk',
  'Ragged Edge',
  'rarible.com',
  'refold.co',
  'Redo Media',
  'Refresh Studio',
  'Relume Library',
  'Replit',
  'respiro-design',
  'relevel.com',
  'rev.webkul.design',
  'Reveal Studio portfolio',
  'rillusion-school-of-media',
  'robyn-chell-design',
  'roger.ai',
  'romain-granai',
  'sagapixel',
  'Saket\'s Portfolio',
  'salad-design',
  'sam-williams-studio',
  'shelly-cooper-design',
  'sgustok-studio',
  'shall-i-buy',
  'shapist',
  'Serge Cote — Designer',
  'sensitive-designs',
  'Shirakaba Studio',
  'shopaddict.cmsmasters.net',
  'Shopify',
  'siebstudio',
  'simon-coudeville',
  'sirulian-design-studios',
  'sigstr.com',
  'sitefloat-creative',
  'slack.com',
  'slimes.world',
  'Snowhouse Studio v3',
  'socket-studios',
  'Solflare',
  'Sonder Studio',
  'songes-studio',
  'Solarisbank',
  'socket-studios-2012',
  'sounds-of-mumbai',
  'soup-agency',
  'Speakeasy',
  'specialist-design',
  'Spline AI',
  'squaredacademy.com',
  'Spencer Lowell',
  'squareup.com',
  'stackers.app',
  'startupstofund.com',
  'Static.app',
  'stockpile.com',
  'Stökt Creative Co.',
  'storesletter',
  'Storetasker',
  'Streamtime',
  'STUDIO AI',
  'studio-adam',
  'studio-bjork',
  'studio-creme',
  'studio-della-rosa',
  'studio-dunn',
  'studio-graphic-99',
  'studio-jubilee',
  'studio-jvckson',
  'studio-lin',
  'studio-meta',
  'studio-nudge',
  'studio-pda',
  'Studio Juicebox',
  'Studio B',
  'studio-ping-pong',
  'studio-ultra',
  'studio-up',
  'studio-vedet',
  'studiomakgill',
  'studiozo',
  'sumdesign',
  'sumithegde.com',
  'super-devsigner-friends',
  'supereight-studio-Ltd',
  'suttna.com',
  'superpeer.com'
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

async function hideImageWebsites3() {
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
             targetSlug.includes(slug) ||
             url.toLowerCase().includes(normalizedTarget);
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
  const listPath = path.join(__dirname, 'image-websites-to-hide-3.json');
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
  hideImageWebsites3().catch(console.error);
}

module.exports = { hideImageWebsites3 };
