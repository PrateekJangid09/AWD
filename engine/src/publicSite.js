/**
 * Public allowlist serializers.
 *
 * Every public HTTP response and every export for page templates MUST go through
 * these helpers. Never serialize a raw database row or evidence envelope.
 */

const TECH_CATEGORIES = [
  "builder_cms",
  "framework",
  "language",
  "frontend",
  "web_server",
  "hosting",
  "cdn",
  "storage",
  "ecommerce"
];

/** Gallery / list cards — compact public fields only. */
export function toPublicListItem(site) {
  if (!site) return null;
  return {
    domain: site.domain || null,
    url: site.url || null,
    name: site.name || null,
    description: site.description || null,
    category: site.category || null,
    subcategory: site.subcategory || null,
    website_type: site.website_type || null,
    audience: asStringArray(site.audience),
    style: asStringArray(site.style),
    palette: publicPalette(site.palette, site.profile),
    fonts: publicFonts(site.fonts, site.profile),
    tech_summary: site.tech_summary || null,
    favicon: site.favicon || null,
    screenshot: site.screenshot || null,
    contact_email: site.contact_email || null,
    contact_address: site.contact_address || null,
    linkedin: site.linkedin || null,
    x: site.x || null,
    date_added: site.date_added || null,
    last_checked: site.last_checked || null
  };
}

/** Full public template payload for one website page. */
export function toPublicSite(site) {
  if (!site) return null;
  const profile = site.profile && typeof site.profile === "object" ? site.profile : {};
  const tech = publicTechStack(val(profile.dp_tech_stack));
  const pages = publicKeyPages(val(profile.dp_key_pages));
  const pageShots = publicPageShots(val(profile.dp_page_shots));

  return {
    domain: site.domain || null,
    url: site.url || null,
    name: site.name || null,
    description: site.description || null,
    category: site.category || null,
    subcategory: site.subcategory || null,
    website_type: site.website_type || null,
    audience: asStringArray(site.audience),
    palette: publicPalette(site.palette, profile),
    fonts: publicFonts(site.fonts, profile),
    style: asStringArray(site.style),
    favicon: site.favicon || null,
    screenshot: site.screenshot || null,
    linkedin: site.linkedin || null,
    x: site.x || null,
    contact_email: site.contact_email || null,
    contact_address: site.contact_address || null,
    date_added: site.date_added || null,
    last_checked: site.last_checked || null,
    tech_summary: site.tech_summary || (tech && tech.summary) || null,
    tech: tech,
    key_pages: pages,
    page_shots: pageShots
  };
}

/** Admin-only: full stored row including private profile envelopes. */
export function toInternalSite(site) {
  if (!site) return null;
  return {
    domain: site.domain,
    url: site.url,
    name: site.name,
    description: site.description,
    category: site.category,
    subcategory: site.subcategory,
    website_type: site.website_type,
    audience: site.audience,
    style: site.style,
    palette: site.palette,
    fonts: site.fonts,
    linkedin: site.linkedin,
    x: site.x,
    contact_email: site.contact_email,
    contact_address: site.contact_address,
    tech_summary: site.tech_summary,
    favicon: site.favicon,
    screenshot: site.screenshot,
    date_added: site.date_added,
    last_checked: site.last_checked,
    profile: site.profile || {}
  };
}

function val(env) {
  if (!env || typeof env !== "object") return null;
  return env.value !== undefined ? env.value : null;
}

function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x : x && x.name ? String(x.name) : null)).filter(Boolean);
}

function publicPalette(columnPalette, profile) {
  const fromProfile = val(profile && profile.dp_palette);
  const raw = Array.isArray(fromProfile) && fromProfile.length ? fromProfile : columnPalette;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      if (typeof p === "string") return { hex: p, role: null };
      if (!p || typeof p !== "object") return null;
      const hex = p.hex || null;
      if (!hex) return null;
      return { hex: String(hex), role: p.role ? String(p.role) : null };
    })
    .filter(Boolean);
}

function publicFonts(columnFonts, profile) {
  const fromProfile = val(profile && profile.dp_fonts);
  const raw = Array.isArray(fromProfile) && fromProfile.length ? fromProfile : columnFonts;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      if (typeof f === "string") return { name: f, role: null };
      if (!f || typeof f !== "object") return null;
      const name = f.name || f.family || null;
      if (!name) return null;
      const out = { name: String(name), role: f.role ? String(f.role) : null };
      if (Array.isArray(f.weights) && f.weights.length) {
        out.weights = f.weights.map(Number).filter((n) => !Number.isNaN(n));
      }
      return out;
    })
    .filter(Boolean);
}

function publicTechStack(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = { summary: raw.summary ? String(raw.summary) : null };
  for (const key of TECH_CATEGORIES) {
    out[key] = namesOnly(raw[key]);
  }
  return out;
}

function namesOnly(arr) {
  if (!Array.isArray(arr)) return [];
  const names = [];
  for (const item of arr) {
    if (typeof item === "string" && item) names.push(item);
    else if (item && typeof item === "object" && item.name) names.push(String(item.name));
  }
  return [...new Set(names)];
}

function publicKeyPages(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [label, page] of Object.entries(raw)) {
    if (!page || typeof page !== "object") continue;
    if (!page.url) continue;
    out[label] = { url: String(page.url) };
  }
  return out;
}

function publicPageShots(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((ps) => {
      if (!ps || typeof ps !== "object") return null;
      return {
        label: ps.label ? String(ps.label) : null,
        url: ps.url ? String(ps.url) : null,
        path: ps.path ? String(ps.path) : null
      };
    })
    .filter((ps) => ps && (ps.path || ps.url));
}
