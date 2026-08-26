/**
 * Public API leakage + admin auth separation tests.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { toPublicSite, toPublicListItem } from "../src/publicSite.js";
import { mintSessionToken, verifySessionToken } from "../src/auth.js";
import { upsertSite } from "../src/db.js";

const FORBIDDEN_KEYS = new Set([
  "profile",
  "evidence",
  "method_version",
  "source_class",
  "taxonomy_version",
  "techstack_version",
  "runner_up",
  "candidates",
  "ranked",
  "structured_signals",
  "documents_analyzed",
  "_debug",
  "classification_documents",
  "scores",
  "why",
  "detected_count",
  "confidence",
  "confidence_band",
  "computed_at",
  "status"
]);

function assertNoForbiddenKeys(value, path = "$") {
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoForbiddenKeys(v, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      assert.equal(FORBIDDEN_KEYS.has(k), false, `forbidden key ${k} at ${path}`);
      assertNoForbiddenKeys(v, `${path}.${k}`);
    }
  }
}

function samplePrivateSite() {
  return {
    domain: "example.com",
    url: "https://example.com/",
    name: "Example",
    description: "Demo site",
    category: "SaaS",
    subcategory: "Productivity",
    website_type: "SaaS Marketing Site",
    audience: ["B2B"],
    style: ["Minimal"],
    palette: ["#111111", "#ffffff"],
    fonts: [{ name: "Inter", role: "body", weights: [400, 700], area: 999 }],
    linkedin: "https://linkedin.com/company/example",
    x: "https://x.com/example",
    contact_email: "hello@example.com",
    contact_address: "1 Main St",
    tech_summary: "Next.js on Vercel",
    favicon: "/shots/example.com__favicon.png",
    screenshot: "/shots/example.com.png",
    date_added: "2026-01-01T00:00:00.000Z",
    last_checked: "2026-01-02T00:00:00.000Z",
    profile: {
      dp_category: {
        value: "SaaS",
        status: "verified",
        confidence: 0.91,
        confidence_band: "verified",
        evidence: [{ method: "keyword", snippet: "saas platform" }],
        method_version: "awd-test",
        source_class: "first_party",
        runner_up: { category: "Marketing", score: 0.4 },
        taxonomy_version: "tax-test",
        candidates: [{ category: "SaaS", scores: 12 }],
        structured_signals: ["SoftwareApplication"],
        documents_analyzed: 2,
        _debug: { zones: [] }
      },
      dp_palette: {
        value: [{ hex: "#0F2044", role: "primary", area: 1200 }],
        status: "probable",
        confidence: 0.8,
        evidence: []
      },
      dp_fonts: {
        value: [{ name: "Satoshi", role: "display", weights: [700] }],
        status: "probable",
        confidence: 0.7,
        evidence: []
      },
      dp_tech_stack: {
        value: {
          summary: "Next.js on Vercel",
          framework: [{ name: "Next.js", confidence: 0.93, why: ["/_next/"], signature: "next" }],
          hosting: [{ name: "Vercel", confidence: 0.9, why: ["server: vercel"] }],
          cdn: [{ name: "Cloudflare", confidence: 0.5 }],
          builder_cms: [],
          language: [{ name: "JavaScript", confidence: 0.6, inferred: true, why: "bundler" }],
          frontend: [],
          web_server: [],
          storage: [],
          ecommerce: []
        },
        status: "verified",
        confidence: 0.9,
        techstack_version: "tech-test",
        evidence: [{ method: "signature", snippet: "Next.js" }]
      },
      dp_key_pages: {
        value: {
          Homepage: { url: "https://example.com/", method: "homepage_root", confidence: 1 },
          About: { url: "https://example.com/about", method: "nav", confidence: 0.8 }
        },
        status: "probable",
        confidence: 0.75,
        evidence: []
      },
      dp_page_shots: {
        value: [{ label: "Homepage", url: "https://example.com/", path: "/shots/example.com.png", debug: true }],
        status: "verified",
        confidence: 0.9
      },
      dp_contact: {
        value: {
          email: "hello@example.com",
          address: "1 Main St",
          other_emails: ["sales@example.com"],
          on_official_domain: true
        },
        status: "verified",
        confidence: 0.95,
        evidence: []
      },
      _internal: { date_added: "2026-01-01T00:00:00.000Z", last_checked: "2026-01-02T00:00:00.000Z" }
    }
  };
}

describe("toPublicSite allowlist", () => {
  it("strips private intelligence from detail DTO", () => {
    const pub = toPublicSite(samplePrivateSite());
    assert.equal(pub.name, "Example");
    assert.equal(pub.category, "SaaS");
    assert.deepEqual(pub.tech.framework, ["Next.js"]);
    assert.deepEqual(pub.tech.hosting, ["Vercel"]);
    assert.equal(pub.key_pages.Homepage.url, "https://example.com/");
    assert.equal(pub.key_pages.Homepage.method, undefined);
    assert.equal(pub.contact_email, "hello@example.com");
    assert.equal(pub.profile, undefined);
    assertNoForbiddenKeys(pub);
  });

  it("strips private intelligence from list DTO", () => {
    const pub = toPublicListItem(samplePrivateSite());
    assert.equal(pub.domain, "example.com");
    assert.equal(pub.profile, undefined);
    assertNoForbiddenKeys(pub);
  });
});

describe("session tokens", () => {
  it("mints and verifies with SESSION_SECRET", () => {
    process.env.ADMIN_SECRET = "test-admin-secret-value";
    process.env.SESSION_SECRET = "test-session-secret-value";
    const token = mintSessionToken(60_000);
    assert.equal(verifySessionToken(token), true);
    assert.equal(verifySessionToken(token + "x"), false);
  });
});

describe("HTTP public vs admin", () => {
  let server;
  let base;

  before(async () => {
    process.env.ADMIN_SECRET = "test-admin-secret-value";
    process.env.SESSION_SECRET = "test-session-secret-value";
    process.env.COOKIE_SECURE = "0";

    const { app, runner } = await import("../src/server.js");

    // Seed one private-rich site into the runner DB used by the server.
    const fields = {
      dp_name: { value: "Leak Test", status: "verified", confidence: 0.9, evidence: [{ method: "t" }], method_version: "x", source_class: "first_party" },
      dp_description: { value: "Private-rich fixture", status: "verified", confidence: 0.9, evidence: [], method_version: "x", source_class: "first_party" },
      dp_official_link: {
        value: { url: "https://leak-test.example/", registrable_domain: "leak-test.example", canonical_origin: "https://leak-test.example" },
        status: "verified",
        confidence: 1,
        evidence: [],
        method_version: "x",
        source_class: "first_party"
      },
      dp_category: {
        value: "SaaS",
        status: "verified",
        confidence: 0.9,
        evidence: [{ method: "kw", snippet: "saas" }],
        method_version: "x",
        source_class: "first_party",
        runner_up: { category: "Other" },
        taxonomy_version: "tax",
        candidates: [],
        _debug: { hi: true }
      },
      dp_subcategory: { value: "Tools", status: "probable", confidence: 0.7, evidence: [], method_version: "x", source_class: "first_party" },
      dp_website_type: { value: "Marketing Site", status: "probable", confidence: 0.7, evidence: [], method_version: "x", source_class: "first_party" },
      dp_audience: { value: ["B2B"], status: "probable", confidence: 0.7, evidence: [], method_version: "x", source_class: "first_party" },
      dp_style: { value: ["Minimal"], status: "probable", confidence: 0.6, evidence: [], method_version: "x", source_class: "first_party" },
      dp_palette: { value: [{ hex: "#000000", role: "primary" }], status: "probable", confidence: 0.6, evidence: [], method_version: "x", source_class: "first_party" },
      dp_fonts: { value: [{ name: "Inter", role: "body" }], status: "probable", confidence: 0.6, evidence: [], method_version: "x", source_class: "first_party" },
      dp_tech_stack: {
        value: {
          summary: "Next.js",
          framework: [{ name: "Next.js", confidence: 0.9, why: ["x"], signature: "y" }],
          hosting: [],
          cdn: [],
          builder_cms: [],
          language: [],
          frontend: [],
          web_server: [],
          storage: [],
          ecommerce: []
        },
        status: "verified",
        confidence: 0.9,
        evidence: [],
        method_version: "x",
        source_class: "first_party",
        techstack_version: "t"
      },
      dp_key_pages: { value: { Homepage: { url: "https://leak-test.example/", method: "root" } }, status: "probable", confidence: 0.7, evidence: [], method_version: "x", source_class: "first_party" },
      dp_page_shots: { value: [], status: "unmeasured", confidence: 0, evidence: [], method_version: "x", source_class: "first_party" },
      dp_contact: { value: { email: "a@leak-test.example", other_emails: ["b@x.com"] }, status: "probable", confidence: 0.7, evidence: [], method_version: "x", source_class: "first_party" },
      dp_social: { value: { linkedin: null, x: null }, status: "unmeasured", confidence: 0, evidence: [], method_version: "x", source_class: "first_party" },
      dp_favicon: { value: { path: null }, status: "unmeasured", confidence: 0, evidence: [], method_version: "x", source_class: "first_party" },
      dp_screenshot: { value: { path: null }, status: "unmeasured", confidence: 0, evidence: [], method_version: "x", source_class: "first_party" },
      _internal: { date_added: new Date().toISOString(), last_checked: new Date().toISOString() }
    };
    upsertSite(runner.db, fields);

    server = await new Promise((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const { port } = server.address();
    base = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) await new Promise((r) => server.close(r));
  });

  it("allows anonymous public listing and detail without forbidden keys", async () => {
    const list = await fetch(`${base}/api/sites`).then((r) => r.json());
    assert.ok(Array.isArray(list));
    assertNoForbiddenKeys(list);

    const site = await fetch(`${base}/api/sites/leak-test.example`).then((r) => r.json());
    assert.equal(site.domain, "leak-test.example");
    assert.deepEqual(site.tech.framework, ["Next.js"]);
    assertNoForbiddenKeys(site);

    const alias = await fetch(`${base}/api/site/leak-test.example`).then((r) => r.json());
    assert.equal(alias.profile, undefined);
    assertNoForbiddenKeys(alias);

    const facets = await fetch(`${base}/api/facets`).then((r) => r.json());
    assert.ok(typeof facets.total === "number");
  });

  it("denies anonymous analysis, jobs, batch, and internal profile", async () => {
    const analyze = await fetch(`${base}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" })
    });
    assert.equal(analyze.status, 404);

    const adminAnalyze = await fetch(`${base}/api/admin/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" })
    });
    assert.equal(adminAnalyze.status, 401);

    const job = await fetch(`${base}/api/admin/job/nope`);
    assert.equal(job.status, 401);

    const batch = await fetch(`${base}/api/admin/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: ["https://example.com"] })
    });
    assert.equal(batch.status, 401);

    const internal = await fetch(`${base}/api/admin/site/leak-test.example/internal`);
    assert.equal(internal.status, 401);

    const legacyJob = await fetch(`${base}/api/job/x`);
    assert.equal(legacyJob.status, 404);
  });

  it("allows bearer admin access to internal profile", async () => {
    const res = await fetch(`${base}/api/admin/site/leak-test.example/internal`, {
      headers: { Authorization: "Bearer test-admin-secret-value" }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.profile);
    assert.ok(body.profile.dp_category);
    assert.ok(body.profile.dp_category.evidence);
  });
});
