import { classifyToEnvelopes } from "../src/pipeline/taxonomy.js";
import { extractIdentity } from "../src/pipeline/identity.js";
import { extractPalette } from "../src/pipeline/palette.js";
import { extractFonts } from "../src/pipeline/fonts.js";
import { classifyStyle } from "../src/pipeline/style.js";
import { extractSocial } from "../src/pipeline/social.js";

const resolved = { resolved_url: "https://example.com/", canonical_origin: "https://example.com", registrable_domain: "example.com" };

const fixtures = {
  "SaaS product (expect Technology & SaaS / SaaS / SaaS Landing Page / B2B)": `
    <html><head>
      <title>Linearly - Project tracking for modern software teams</title>
      <meta name="description" content="The issue tracker built for high-performing teams. Start free trial. Book a demo.">
      <meta property="og:site_name" content="Linearly">
      <meta name="theme-color" content="#5E6AD2">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>:root{--brand-primary:#5E6AD2;--bg:#08090A}body{font-family:'Inter',sans-serif}.btn{border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.1)}</style>
    </head><body>
      <nav><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/integrations">Integrations</a><a href="/docs">Docs</a><a href="/login">Log in</a></nav>
      <h1>Project tracking for modern software teams</h1>
      <p>The SaaS platform teams use to plan, track and ship. Start free trial or book a demo. Trusted by teams. API and SDK included.</p>
      <a href="https://x.com/linearly">Twitter</a><a href="https://linkedin.com/company/linearly">LinkedIn</a>
    </body></html>`,

  "Design agency (expect Agency & Studio / Design / Agency Website / B2B)": `
    <html><head>
      <title>Studio Meridian | Brand & Digital Design Studio</title>
      <meta name="description" content="We craft brand identities and digital products for ambitious companies. See our work.">
      <style>body{font-family:'Playfair Display',serif}a{border:1px solid #000;text-transform:uppercase}h1{color:#111}</style>
    </head><body>
      <nav><a href="/work">Work</a><a href="/services">Services</a><a href="/about">About</a><a href="/contact">Contact</a></nav>
      <h1>We craft brand identities and digital products</h1>
      <p>Studio Meridian is a creative studio. Our work spans branding, visual design and art direction for clients worldwide. Start a project with us.</p>
      <a href="/case-studies">Case studies</a>
    </body></html>`,

  "Personal portfolio (expect Portfolio / Developer / Personal Portfolio)": `
    <html><head><title>Ava Chen - Product Designer</title>
      <meta name="description" content="Hi, I'm Ava. Selected work, about me, and how to get in touch.">
      <style>body{font-family:'Space Mono',monospace}*{border-radius:0}</style>
    </head><body>
      <nav><a href="/">Home</a><a href="/about">About me</a></nav>
      <h1>Hi, I'm Ava. I'm a product designer and developer.</h1>
      <p>My work and selected projects. Freelance and open to opportunities. Get in touch.</p>
    </body></html>`,

  "Ecommerce store (expect Ecommerce & Retail / Ecommerce Store / Consumers)": `
    <html><head><title>NORD - Minimalist Everyday Carry</title>
      <meta name="description" content="Shop our collection of everyday essentials. Free shipping.">
      <meta name="theme-color" content="#1a1a1a">
    </head><body>
      <nav><a href="/collections/all">Shop</a><a href="/pages/about">About</a></nav>
      <h1>Everyday essentials</h1>
      <p>Add to cart and enjoy free shipping. Browse the collection. $48 each.</p>
      <a href="/cart">Cart</a><a href="/products/wallet">Wallet</a>
    </body></html>`
};

for (const [label, html] of Object.entries(fixtures)) {
  console.log("\n=== " + label + " ===");
  const cls = classifyToEnvelopes(html, resolved.resolved_url);
  const id = extractIdentity(html, resolved);
  const pal = extractPalette(html, resolved);
  const fon = extractFonts(html, resolved);
  const sty = classifyStyle(html, resolved, { palette: pal.dp_palette.value || [], fonts: fon.dp_fonts.value || [] });
  const soc = extractSocial(html, resolved);
  console.log("name        :", id.dp_name.value, `(${id.dp_name.confidence})`);
  console.log("category    :", cls.dp_category.value, `(${cls.dp_category.confidence})`, "| runner-up:", cls.dp_category.runner_up);
  console.log("subcategory :", cls.dp_subcategory.value);
  console.log("website type:", cls.dp_website_type.value, `(${cls.dp_website_type.confidence})`, cls.dp_website_type.note || "");
  console.log("audience    :", cls.dp_audience.value, `(${cls.dp_audience.confidence})`);
  console.log("palette     :", (pal.dp_palette.value || []).map(p => p.hex).join(" "));
  console.log("fonts       :", fon.dp_fonts.value);
  console.log("style       :", sty.dp_style.value, `(${sty.dp_style.confidence})`);
  console.log("social      :", soc.dp_social.value);
  console.log("top scores  :", JSON.stringify(cls._debug.topScores));
}
