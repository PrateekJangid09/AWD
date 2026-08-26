/**
 * DP: Tech stack ("How it's built")
 * =================================
 * An evidence-weighted detector, in the spirit of the DTC tech engine but
 * rebuilt to be broader and more precise for a design directory. It answers:
 *
 *   Builder / CMS   Wix, WordPress, Framer, Webflow, Squarespace, Ghost, ...
 *   Framework       Next.js, Nuxt, Astro, SvelteKit, Remix, Gatsby, Angular...
 *   Language        PHP, Ruby, Python, JavaScript/Node, ASP.NET, Java, Go,
 *                   static HTML, and a best-effort TypeScript signal
 *   Frontend        React, Vue, Svelte, jQuery, Alpine, htmx ...
 *   Web server      nginx, Apache, IIS, LiteSpeed, Caddy ...
 *   Hosting         Vercel, Netlify, Cloudflare Pages, GitHub Pages, AWS,
 *                   Google Cloud/Firebase, Azure, Render, Fly.io ...
 *   CDN             Cloudflare, Fastly, Akamai, CloudFront, Bunny, jsDelivr ...
 *   Storage / media AWS S3, Google Cloud Storage, Azure Blob, Cloudinary,
 *                   imgix, ImageKit, Uploadcare, Supabase, Mux ...
 *
 * Evidence classes (each match adds weight; a signature fires when the summed
 * weight clears its threshold, so a plain-text brand mention alone never
 * triggers a detection):
 *   header      0.55   vendor-specific response header
 *   cookie      0.50   vendor-specific Set-Cookie name
 *   asset       0.55   vendor-hosted script / style / image / network URL
 *   dom         0.45   vendor-specific DOM id / attribute / inline global
 *   generator   0.65   <meta name="generator"> (very strong for builders)
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";

export const TECHSTACK_VERSION = "awd-tech-2026.08.13-a";

const W = { header: 0.55, cookie: 0.5, asset: 0.55, dom: 0.45, generator: 0.65 };

/* sig(id, name, category, { hd, hv, sv, ck, as, dm, gn, th, lang, managedHost })
 *   hd  header-key exists (definitive vendor header)
 *   hv  [ [keyRegex, valueRegex] ] header key AND value match
 *   sv  Server-header value regex (shorthand for hv on "server")
 */
const S = (id, name, category, o = {}) => ({
  id, name, category,
  hd: o.hd || [], hv: o.hv || [], sv: o.sv || null,
  ck: o.ck || [], as: o.as || [], dm: o.dm || [], gn: o.gn || [],
  th: o.th ?? 0.5, lang: o.lang || null, managedHost: o.managedHost || null
});

export const SIGNATURES = [
  /* ---------- Site builders & CMS ---------- */
  S("wordpress", "WordPress", "Builder/CMS", { as: [/\/wp-content\//i, /\/wp-includes\//i], ck: [/^wordpress_/i, /^wp-settings/i], gn: [/wordpress/i], lang: "PHP", th: 0.5 }),
  S("wix", "Wix", "Builder/CMS", { as: [/static\.parastorage\.com/i, /static\.wixstatic\.com/i], ck: [/^svSession$/i, /^XSRF-TOKEN$/i], hd: [/^x-wix-/i], gn: [/wix\.com|wix website builder/i], dm: [/wix-warmup-data|window\.wixEmbedsAPI|__WIX__/i], lang: "JavaScript (managed)", managedHost: "Wix (managed)", th: 0.4 }),
  S("squarespace", "Squarespace", "Builder/CMS", { as: [/static1?\.squarespace\.com/i, /assets\.squarespace\.com/i, /images\.squarespace-cdn\.com/i], ck: [/^crumb$/i, /^ss_/i], gn: [/squarespace/i], dm: [/Static\.SQUARESPACE_CONTEXT|squarespace-headers/i], lang: "JavaScript (managed)", managedHost: "Squarespace (managed)", th: 0.4 }),
  S("webflow", "Webflow", "Builder/CMS", { as: [/(?:cdn\.prod\.)?website-files\.com/i, /assets\.website-files\.com/i, /webflow\.(?:js|com)/i], dm: [/data-wf-site=|data-wf-page=|Webflow\.require/i], gn: [/webflow/i], lang: "JavaScript (managed)", managedHost: "Webflow (managed)", th: 0.4 }),
  S("framer", "Framer", "Builder/CMS", { as: [/framerusercontent\.com/i, /events\.framer\.com/i, /framer\.com\/m\//i], dm: [/data-framer-[a-z-]+|class=["'][^"']*framer-[a-zA-Z0-9]{5,}|__framer|window\.__framer_/i], gn: [/framer/i], lang: "JavaScript (managed)", managedHost: "Framer (managed)", th: 0.35 }),
  S("ghost", "Ghost", "Builder/CMS", { as: [/\/ghost\/assets\//i], gn: [/ghost/i], dm: [/ghost-url|data-ghost/i], lang: "JavaScript / Node.js", th: 0.5 }),
  S("duda", "Duda", "Builder/CMS", { as: [/cdn\.multiscreensite\.com/i, /irp-cdn\.multiscreensite\.com/i], dm: [/dmBody|window\.Parameters\s*=/i], gn: [/duda/i], lang: "JavaScript (managed)", managedHost: "Duda (managed)", th: 0.5 }),
  S("weebly", "Weebly", "Builder/CMS", { as: [/cdn\d*\.editmysite\.com/i], ck: [/^wsm-/i], gn: [/weebly/i], lang: "JavaScript (managed)", managedHost: "Weebly (managed)", th: 0.5 }),
  S("carrd", "Carrd", "Builder/CMS", { as: [/carrd\.co\//i], dm: [/data-carrd|powered by carrd/i], gn: [/carrd/i], managedHost: "Carrd (managed)", th: 0.5 }),
  S("bubble", "Bubble", "Builder/CMS", { as: [/\/package\/current\/[a-f0-9]+\/js/i, /bubble\.io/i], dm: [/data-bubble|window\.bubble/i], gn: [/bubble/i], lang: "JavaScript (managed)", managedHost: "Bubble (managed)", th: 0.5 }),
  S("drupal", "Drupal", "Builder/CMS", { as: [/\/sites\/(?:all|default)\/(?:themes|modules)\//i, /drupal\.js/i], ck: [/^SESS[a-f0-9]{32}$/i], gn: [/drupal/i], dm: [/Drupal\.settings|data-drupal/i], lang: "PHP", th: 0.5 }),
  S("joomla", "Joomla", "Builder/CMS", { as: [/\/media\/jui\/|\/media\/system\/js\//i], gn: [/joomla/i], dm: [/\/administrator\//i], lang: "PHP", th: 0.5 }),
  S("hubspot", "HubSpot CMS", "Builder/CMS", { as: [/\/hs-fs\/hubfs\//i, /\/_hcms\//i, /js\.hs-scripts\.com/i], gn: [/hubspot/i], lang: "HubL (managed)", managedHost: "HubSpot (managed)", th: 0.5 }),
  S("blogger", "Blogger", "Builder/CMS", { as: [/blogblog\.com|bp\.blogspot\.com/i], gn: [/blogger/i], managedHost: "Google Blogger (managed)", th: 0.5 }),
  S("super", "Super.so (Notion)", "Builder/CMS", { as: [/super\.so\//i, /notion-static\.com/i], dm: [/data-super-/i], managedHost: "Super.so (managed)", th: 0.5 }),

  /* ---------- Headless CMS ---------- */
  S("contentful", "Contentful", "Headless CMS", { as: [/ctfassets\.net/i], th: 0.55 }),
  S("sanity", "Sanity", "Headless CMS", { as: [/cdn\.sanity\.io/i], th: 0.55 }),
  S("prismic", "Prismic", "Headless CMS", { as: [/images\.prismic\.io|\.cdn\.prismic\.io/i], th: 0.55 }),
  S("storyblok", "Storyblok", "Headless CMS", { as: [/a\.storyblok\.com|img2?\.storyblok\.com/i], th: 0.55 }),
  S("datocms", "DatoCMS", "Headless CMS", { as: [/\.datocms-assets\.com/i], th: 0.55 }),
  S("strapi", "Strapi", "Headless CMS", { as: [/\/uploads\/.*strapi|strapi/i], hd: [/^strapi/i], th: 0.6 }),

  /* ---------- Commerce platforms ---------- */
  S("shopify", "Shopify", "Ecommerce", { as: [/cdn\.shopify\.com/i, /shopifycloud|shopifysvc/i], ck: [/^_shopify_/i, /^cart_currency$/i], hd: [/^x-shopid$/i, /^x-shopify-stage$/i], dm: [/Shopify\.theme|shopify-section|window\.Shopify/i], lang: "Ruby", managedHost: "Shopify (managed)", th: 0.5 }),
  S("woocommerce", "WooCommerce", "Ecommerce", { as: [/\/plugins\/woocommerce\//i], ck: [/^woocommerce_/i, /^wo0?_/i], dm: [/class=["'][^"']*woocommerce/i], lang: "PHP", th: 0.55 }),
  S("magento", "Adobe Commerce (Magento)", "Ecommerce", { as: [/\/static\/version\d+\/frontend\//i, /mage\/requirejs/i], ck: [/^mage-/i, /^form_key$/i], dm: [/Magento_|var BASE_URL/i], lang: "PHP", th: 0.55 }),
  S("bigcommerce", "BigCommerce", "Ecommerce", { as: [/cdn\d*\.bigcommerce\.com/i], ck: [/^SHOP_SESSION_TOKEN$/i], lang: "managed", managedHost: "BigCommerce (managed)", th: 0.55 }),
  S("prestashop", "PrestaShop", "Ecommerce", { as: [/\/themes\/.*prestashop/i], ck: [/^PrestaShop-/i], gn: [/prestashop/i], lang: "PHP", th: 0.5 }),

  /* ---------- Web frameworks / SSG ---------- */
  S("nextjs", "Next.js", "Framework", { as: [/\/_next\/static\//i], hd: [/^x-nextjs-/i], dm: [/id=["']__next["']|__NEXT_DATA__/], gn: [/next\.js/i], lang: "JavaScript / Node.js", th: 0.4 }),
  S("nuxt", "Nuxt", "Framework", { as: [/\/_nuxt\//i], dm: [/id=["']__nuxt["']|window\.__NUXT__/], gn: [/nuxt/i], lang: "JavaScript / Node.js", th: 0.4 }),
  S("gatsby", "Gatsby", "Framework", { as: [/\/page-data\/(?:app-data\.json|sq\/)/i], dm: [/id=["']___gatsby["']|___loader/], gn: [/gatsby/i], lang: "JavaScript / Node.js", th: 0.4 }),
  S("remix", "Remix", "Framework", { dm: [/window\.__remixContext|window\.__remixManifest/i], lang: "JavaScript / Node.js", th: 0.45 }),
  S("astro", "Astro", "Framework", { dm: [/astro-island|astro-slot/i, /class=["'][^"']*astro-[a-z0-9]{6,}/i], gn: [/astro/i], lang: "JavaScript / Node.js", th: 0.4 }),
  S("sveltekit", "SvelteKit", "Framework", { dm: [/data-sveltekit-|__sveltekit_/i], lang: "JavaScript / Node.js", th: 0.45 }),
  S("angular", "Angular", "Framework", { dm: [/\bng-version=|ng-app=|\bng-controller=/i, /angular(?:\.min)?\.js/i], lang: "JavaScript / TypeScript", th: 0.45 }),
  S("hugo", "Hugo", "Framework", { gn: [/hugo/i], th: 0.6, lang: "Static HTML (Go SSG)" }),
  S("jekyll", "Jekyll", "Framework", { gn: [/jekyll/i], th: 0.6, lang: "Static HTML (Ruby SSG)" }),
  S("eleventy", "Eleventy", "Framework", { gn: [/eleventy/i], th: 0.6, lang: "Static HTML (JS SSG)" }),
  S("docusaurus", "Docusaurus", "Framework", { gn: [/docusaurus/i], dm: [/data-theme|docusaurus/i], lang: "JavaScript / Node.js", th: 0.5 }),

  /* ---------- Frontend libraries ---------- */
  S("react", "React", "Frontend", { as: [/react(?:-dom)?(?:\.production)?(?:\.min)?\.js(?:[?#]|$)/i], dm: [/data-reactroot|__REACT_DEVTOOLS_GLOBAL_HOOK__/i], lang: "JavaScript", th: 0.4 }),
  S("vue", "Vue.js", "Frontend", { as: [/vue(?:\.runtime)?(?:\.global)?(?:\.prod)?(?:\.min)?\.js(?:[?#]|$)/i], dm: [/data-v-app|__VUE__|__VUE_DEVTOOLS/i], lang: "JavaScript", th: 0.4 }),
  S("svelte", "Svelte", "Frontend", { dm: [/svelte-[a-z0-9]{6}\b/i], lang: "JavaScript", th: 0.45 }),
  S("preact", "Preact", "Frontend", { as: [/preact(?:\.min)?\.js/i], dm: [/__PREACT_DEVTOOLS__/i], lang: "JavaScript", th: 0.5 }),
  S("jquery", "jQuery", "Frontend", { as: [/jquery(?:-[0-9.]+)?(?:\.min|\.slim)?\.js(?:[?#]|$)|code\.jquery\.com/i], dm: [/jQuery\.fn\.jquery/i], lang: "JavaScript", th: 0.4 }),
  S("alpine", "Alpine.js", "Frontend", { as: [/alpinejs|alpine(?:\.min)?\.js/i], dm: [/\bx-data=|\bx-init=|Alpine\.start/i], lang: "JavaScript", th: 0.45 }),
  S("htmx", "htmx", "Frontend", { as: [/htmx(?:\.min)?\.js/i], dm: [/\bhx-(?:get|post|target|swap)=/i], th: 0.45 }),

  /* ---------- Web servers ---------- */
  S("nginx", "nginx", "Server", { sv: /nginx/i, th: 0.5 }),
  S("apache", "Apache", "Server", { sv: /apache/i, th: 0.5 }),
  S("iis", "Microsoft IIS", "Server", { sv: /iis|microsoft-httpapi/i, th: 0.5, lang: "ASP.NET / C#" }),
  S("litespeed", "LiteSpeed", "Server", { sv: /litespeed/i, th: 0.5 }),
  S("caddy", "Caddy", "Server", { sv: /caddy/i, th: 0.5 }),
  S("openresty", "OpenResty", "Server", { sv: /openresty/i, th: 0.5 }),

  /* ---------- Hosting / PaaS ---------- */
  S("vercel", "Vercel", "Hosting", { hd: [/^x-vercel-id$/i, /^x-vercel-cache$/i], th: 0.5 }),
  S("netlify", "Netlify", "Hosting", { hd: [/^x-nf-request-id$/i], th: 0.5 }),
  S("cloudflare_pages", "Cloudflare Pages", "Hosting", { hd: [/^cf-pages$/i], th: 0.5 }),
  S("github_pages", "GitHub Pages", "Hosting", { hd: [/^x-github-request-id$/i], sv: /github\.com/i, th: 0.5 }),
  S("gitlab_pages", "GitLab Pages", "Hosting", { sv: /gitlab pages/i, th: 0.5 }),
  S("render", "Render", "Hosting", { hd: [/^x-render-origin-server$/i], th: 0.5 }),
  S("fly", "Fly.io", "Hosting", { hd: [/^fly-request-id$/i], th: 0.5 }),
  S("heroku", "Heroku", "Hosting", { hv: [[/^via$/i, /vegur/i]], sv: /cowboy/i, th: 0.5 }),
  S("aws", "AWS", "Hosting", { hd: [/^x-amz-request-id$/i, /^x-amz-cf-pop$/i], sv: /awselb|amazons3/i, th: 0.5 }),
  S("gcp", "Google Cloud", "Hosting", { sv: /gws|gse|google frontend/i, th: 0.5 }),
  S("firebase", "Firebase Hosting", "Hosting", { as: [/firebaseapp\.com|web\.app/i], th: 0.55 }),
  S("azure", "Azure", "Hosting", { hd: [/^x-azure-ref$/i, /^x-msedge-ref$/i], th: 0.5 }),
  S("wpengine", "WP Engine", "Hosting", { hd: [/^x-wpe-/i], th: 0.5 }),
  S("kinsta", "Kinsta", "Hosting", { hd: [/^x-kinsta-cache$/i], th: 0.5 }),

  /* ---------- CDN & edge ---------- */
  S("cloudflare", "Cloudflare", "CDN", { hd: [/^cf-ray$/i, /^cf-cache-status$/i], ck: [/^__cf[bl]b|^cf_clearance$/i], as: [/\/cdn-cgi\//i], th: 0.5 }),
  S("fastly", "Fastly", "CDN", { hd: [/^x-fastly-|^x-served-by$/i, /^fastly-/i], th: 0.55 }),
  S("akamai", "Akamai", "CDN", { hd: [/^x-akamai-|^akamai-/i], ck: [/^ak_bmsc$|^bm_sv$/i], th: 0.55 }),
  S("cloudfront", "AWS CloudFront", "CDN", { as: [/\.cloudfront\.net\//i], hd: [/^x-amz-cf-id$/i], th: 0.5 }),
  S("bunny", "Bunny CDN", "CDN", { as: [/[\w-]+\.b-cdn\.net/i], th: 0.55 }),
  S("jsdelivr", "jsDelivr", "CDN", { as: [/cdn\.jsdelivr\.net\//i], th: 0.55 }),
  S("unpkg", "UNPKG", "CDN", { as: [/unpkg\.com\//i], th: 0.55 }),
  S("cdnjs", "cdnjs", "CDN", { as: [/cdnjs\.cloudflare\.com\//i], th: 0.55 }),

  /* ---------- Storage & media ---------- */
  S("s3", "AWS S3", "Storage", { as: [/[\w.-]+\.s3[.-][\w-]*\.amazonaws\.com|s3\.amazonaws\.com/i], th: 0.55 }),
  S("gcs", "Google Cloud Storage", "Storage", { as: [/storage\.googleapis\.com/i], th: 0.55 }),
  S("azure_blob", "Azure Blob Storage", "Storage", { as: [/\.blob\.core\.windows\.net/i], th: 0.55 }),
  S("cloudinary", "Cloudinary", "Storage", { as: [/res\.cloudinary\.com/i], th: 0.55 }),
  S("imgix", "imgix", "Storage", { as: [/[\w-]+\.imgix\.net/i], th: 0.55 }),
  S("imagekit", "ImageKit", "Storage", { as: [/ik\.imagekit\.io/i], th: 0.55 }),
  S("uploadcare", "Uploadcare", "Storage", { as: [/ucarecdn\.com/i], th: 0.55 }),
  S("supabase", "Supabase", "Storage", { as: [/[\w-]+\.supabase\.(?:co|in)/i], th: 0.55 }),
  S("firebase_storage", "Firebase Storage", "Storage", { as: [/firebasestorage\.googleapis\.com/i], th: 0.55 }),
  S("mux", "Mux (video)", "Storage", { as: [/[\w-]+\.mux\.com|stream\.mux\.com/i], th: 0.55 }),
  S("vimeo", "Vimeo (video)", "Storage", { as: [/player\.vimeo\.com|vimeocdn\.com/i], th: 0.55 }),
  S("shopify_cdn", "Shopify CDN", "Storage", { as: [/cdn\.shopify\.com/i], th: 0.55 })
];

/* header language inference (from Server / X-Powered-By / X-Generator) */
const HEADER_LANGUAGE = [
  [/php/i, "PHP"],
  [/asp\.net|aspnet/i, "ASP.NET / C#"],
  [/express|node/i, "JavaScript / Node.js"],
  [/rails|ruby|phusion|passenger/i, "Ruby"],
  [/django|python|wsgi|gunicorn|werkzeug|uvicorn/i, "Python"],
  [/java|jsp|servlet|tomcat|jetty|coyote/i, "Java"],
  [/golang|\bgo\/\d|\bgo\b\s+\d/i, "Go"],
  [/laravel/i, "PHP (Laravel)"]
];

/**
 * @param {string} html
 * @param {object} headers  lower/any-case response headers
 * @param {string[]} setCookies  raw Set-Cookie strings
 */
export function detectTechStack(html, headers = {}, setCookies = [], pageUrl = "") {
  const hay = String(html || "").slice(0, 400000);
  const $ = safeLoad(hay);
  const now = new Date().toISOString();

  // normalize headers
  const H = {};
  for (const [k, v] of Object.entries(headers || {})) H[k.toLowerCase()] = String(v);
  const cookieNames = (setCookies || []).map((c) => String(c).split("=")[0].trim());

  // asset URL corpus: script/link/img/source srcs + any absolute urls in html
  const assets = [];
  $("script[src]").each((_, e) => assets.push($(e).attr("src")));
  $("link[href]").each((_, e) => assets.push($(e).attr("href")));
  $("img[src], source[src], source[srcset], img[srcset]").each((_, e) => { assets.push($(e).attr("src")); assets.push($(e).attr("srcset")); });
  const assetBlob = assets.filter(Boolean).join(" ") + " " + (hay.match(/https?:\/\/[^\s"'<>]+/g) || []).slice(0, 800).join(" ");

  const generator = ($('meta[name="generator"]').attr("content") || "").trim();

  const detections = [];
  for (const sig of SIGNATURES) {
    let weight = 0;
    const why = [];

    for (const re of sig.hd) {
      for (const hk of Object.keys(H)) {
        if (re.test(hk)) { weight += W.header; why.push(`header ${hk}`); break; }
      }
    }
    if (sig.sv && H["server"] && sig.sv.test(H["server"])) { weight += W.header; why.push(`server: ${clip(H["server"])}`); }
    for (const [kre, vre] of sig.hv) {
      for (const [hk, hv] of Object.entries(H)) {
        if (kre.test(hk) && vre.test(hv)) { weight += W.header; why.push(`header ${hk}: ${clip(hv)}`); break; }
      }
    }
    for (const re of sig.ck) for (const cn of cookieNames) if (re.test(cn)) { weight += W.cookie; why.push(`cookie ${cn}`); break; }
    for (const re of sig.as) if (re.test(assetBlob)) { weight += W.asset; why.push("asset host"); break; }
    for (const re of sig.dm) if (re.test(hay)) { weight += W.dom; why.push("dom marker"); break; }
    for (const re of sig.gn) if (generator && re.test(generator)) { weight += W.generator; why.push(`generator: ${clip(generator)}`); break; }

    if (weight >= sig.th) {
      detections.push({
        id: sig.id, name: sig.name, category: sig.category,
        confidence: Math.min(0.98, 0.35 + weight),
        lang: sig.lang, managedHost: sig.managedHost, why: why.slice(0, 3)
      });
    }
  }

  return assemble(detections, H, hay, pageUrl, now, generator);
}

function assemble(detections, H, hay, pageUrl, now, generator) {
  const byCat = (c) => detections.filter((d) => d.category === c).sort((a, b) => b.confidence - a.confidence);
  const names = (arr) => arr.map((d) => ({ name: d.name, confidence: round2(d.confidence) }));

  const builder = byCat("Builder/CMS");
  const headless = byCat("Headless CMS");
  const ecommerce = byCat("Ecommerce");
  const framework = byCat("Framework").filter((d) => !["react", "vue", "svelte"].includes(d.id));
  const frontend = byCat("Frontend");
  const server = byCat("Server");
  const hosting = byCat("Hosting");
  const cdn = byCat("CDN");
  const storage = byCat("Storage");

  /* ---- programming language inference (precedence) ---- */
  let language = null, langConf = 0, langWhy = null;
  const poweredBy = [H["x-powered-by"], H["server"], H["x-generator"]].filter(Boolean).join(" ");
  for (const [re, lang] of HEADER_LANGUAGE) if (re.test(poweredBy)) { language = lang; langConf = 0.9; langWhy = "response header"; break; }
  if (!language) {
    const src = [...builder, ...ecommerce, ...framework].find((d) => d.lang);
    if (src) { language = src.lang; langConf = 0.75; langWhy = `implied by ${src.name}`; }
  }
  if (!language && frontend.length) { language = "JavaScript"; langConf = 0.6; langWhy = `implied by ${frontend[0].name}`; }
  if (!language) {
    // no framework, no dynamic markers, real HTML => static site
    const dynamic = /__NEXT_DATA__|__NUXT__|wp-content|data-reactroot|<\?php/i.test(hay);
    if (!dynamic && /<html/i.test(hay)) { language = "Static HTML / CSS / JS"; langConf = 0.5; langWhy = "no server framework detected"; }
  }
  // best-effort TypeScript signal from sourcemaps (compiled TS still leaks .ts refs)
  const tsHint = /sourceMappingURL=[^\s"']+\.js\.map/i.test(hay) && /\.tsx?["'\)]|"\.\.\/src\/[^"']+\.tsx?"/i.test(hay);
  if (tsHint && language && /JavaScript/.test(language)) { language = language.replace("JavaScript", "TypeScript / JavaScript"); langWhy = (langWhy || "") + " + .ts sourcemap refs"; }

  /* ---- hosting inference fallbacks ---- */
  const hostingList = names(hosting);
  if (!hostingList.length) {
    const managed = [...builder, ...ecommerce].find((d) => d.managedHost);
    if (managed) hostingList.push({ name: managed.managedHost, confidence: 0.6, inferred: true });
  }

  /* ---- headline summary ---- */
  const primaryBuild = builder[0] || ecommerce[0] || framework[0] || null;
  const summaryBits = [];
  if (primaryBuild) summaryBits.push(primaryBuild.name);
  else if (language) summaryBits.push(language.split(" / ")[0]);
  if (framework[0] && (!primaryBuild || primaryBuild.category !== "Framework") && !summaryBits.includes(framework[0].name)) summaryBits.push(framework[0].name);
  if (hostingList[0]) summaryBits.push("on " + hostingList[0].name);
  const summary = summaryBits.join(" ") || "Undetermined";

  const value = {
    summary,
    builder_cms: names([...builder, ...headless]),
    framework: names(framework),
    language: language ? [{ name: language, confidence: round2(langConf), inferred: true, why: langWhy }] : [],
    frontend: names(frontend),
    web_server: names(server),
    hosting: hostingList,
    cdn: names(cdn),
    storage: names(storage),
    ecommerce: names(ecommerce)
  };

  const anything = detections.length > 0 || !!language;
  if (!anything) {
    return { dp_tech_stack: envelope(null, "unmeasured", 0, [], { reason: "no technology signals found", techstack_version: TECHSTACK_VERSION }) };
  }

  const evList = detections.slice(0, 8).map((d) => evidence("signature", pageUrl, `${d.name}: ${d.why.join("; ")}`, now));
  if (language) evList.push(evidence("language_inference", pageUrl, `${language} (${langWhy})`, now));

  // overall confidence: driven by how much of the stack we pinned down
  const filledSlots = ["builder_cms", "framework", "language", "hosting", "cdn", "storage", "web_server"].filter((k) => value[k].length).length;
  const conf = Math.min(0.95, 0.4 + filledSlots * 0.08 + (primaryBuild ? 0.1 : 0));

  return {
    dp_tech_stack: envelope(value, conf >= 0.7 ? "verified" : "probable", conf, evList,
      { techstack_version: TECHSTACK_VERSION, detected_count: detections.length })
  };
}

function safeLoad(html) { try { return cheerio.load(html || ""); } catch { return cheerio.load(""); } }
function clip(s) { return String(s || "").slice(0, 40); }
function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }
