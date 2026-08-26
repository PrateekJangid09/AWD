/**
 * Website-type classifier.
 *
 * The taxonomy exposes many more website shapes than the first prototype was
 * able to recognise. This classifier gives every declared type its own signal
 * set, combines copy and DOM structure, and refuses to manufacture a default
 * when the page contains no supporting evidence.
 */

const RULES = {
  "Ecommerce Store": { p: ["add to cart", "add to bag", "shopping cart", "checkout", "shop now", "free shipping"], s: ['a[href*="/cart"]', 'a[href*="/products/"]', 'a[href*="/collections/"]'] },
  "Marketplace": { p: ["marketplace", "become a seller", "start selling", "buyers and sellers", "browse listings"], s: ['a[href*="seller"]', 'a[href*="listing"]'] },
  "B2B Marketplace": { p: ["b2b marketplace", "wholesale marketplace", "suppliers", "request a quote", "bulk orders", "trade buyers"] },
  "Web Application": { p: ["dashboard", "your workspace", "open the app", "web application", "my account"], s: ['a[href*="/dashboard"]', 'a[href*="app."]', '#root:empty', '#app:empty'] },
  "Documentation Website": { p: ["documentation", "api reference", "developer docs", "read the docs", "on this page"], s: ['nav a[href^="#"]', 'code', 'pre'] },
  "Waitlist Page": { p: ["join the waitlist", "early access", "coming soon", "be the first", "request access", "get on the list"], s: ['input[type="email"]'] },
  "SaaS Landing Page": { p: ["start free trial", "book a demo", "get started free", "per month", "integrations", "use cases"] },
  "SaaS Website": { p: ["software as a service", "saas", "start free", "book a demo", "integrations", "platform for teams"] },
  "Product Website": { p: ["product", "features", "how it works", "see it in action", "product tour", "get started"] },
  "Mobile App Website": { p: ["download on the app store", "get it on google play", "mobile app", "ios app", "android app"], s: ['a[href*="apps.apple.com"]', 'a[href*="play.google.com"]'] },
  "Comparison Website": { p: ["compare", "versus", "best alternatives", "comparison", "reviews and ratings"], s: ['table'] },
  "Brand Website": { p: ["our brand", "our story", "collections", "stockists", "where to buy", "made with"] },
  "Agency Website": { p: ["our work", "our services", "our clients", "case studies", "start a project", "we help"] },
  "Studio Website": { p: ["creative studio", "design studio", "production studio", "our work", "selected projects"] },
  "Portfolio": { p: ["portfolio", "selected work", "projects", "case studies"] },
  "Personal Portfolio": { p: ["hi, i'm", "i am a", "my work", "selected work", "about me", "freelance", "get in touch"] },
  "Personal Website": { p: ["about me", "my writing", "my projects", "speaking", "newsletter"] },
  "Resume Website": { p: ["experience", "education", "skills", "download resume", "download cv", "work history"] },
  "Case Study Website": { p: ["case study", "the challenge", "the solution", "the outcome", "results"] },
  "Service Website": { p: ["our services", "services we offer", "get a quote", "request a quote", "book a consultation"] },
  "Corporate Website": { p: ["about us", "our company", "leadership", "investors", "press", "careers"] },
  "Company Website": { p: ["our company", "about us", "our team", "our mission", "careers"] },
  "Investor Website": { p: ["investor relations", "annual report", "financial results", "shareholders", "earnings"] },
  "Healthcare Website": { p: ["healthcare", "medical care", "patients", "providers", "treatments", "find a doctor"] },
  "Education Website": { p: ["education", "students", "teachers", "learning", "admissions", "curriculum"] },
  "Course Platform": { p: ["browse courses", "online courses", "enroll now", "lessons", "curriculum", "instructors"] },
  "School Website": { p: ["school", "admissions", "students", "faculty", "academic year", "campus"] },
  "Membership Website": { p: ["become a member", "membership", "member benefits", "join our community", "members only"] },
  "Property Website": { p: ["property", "properties", "homes for sale", "real estate", "floor plans", "schedule a tour"] },
  "Listing Website": { p: ["browse listings", "featured listings", "search listings", "list your", "results found"], s: ['[class*="listing"]'] },
  "Hotel Website": { p: ["rooms and suites", "book your stay", "check availability", "guests", "amenities"] },
  "Restaurant Website": { p: ["our menu", "reserve a table", "book a table", "opening hours", "order online"] },
  "Travel Blog": { p: ["travel guide", "destinations", "travel stories", "things to do", "where to stay"], s: ['article'] },
  "Media Website": { p: ["latest news", "stories", "breaking news", "watch", "listen", "subscribe"] },
  "Magazine": { p: ["magazine", "latest issue", "features", "editorial", "subscribe"] },
  "Streaming Platform": { p: ["stream now", "watch now", "listen now", "episodes", "shows", "subscription"] },
  "Entertainment Portal": { p: ["entertainment", "celebrities", "movies", "tv shows", "trailers"] },
  "Blog": { p: ["latest posts", "read more", "min read", "published", "articles"], s: ['article'] },
  "Community Website": { p: ["join the community", "community", "members", "discussions", "forum"] },
  "Social Platform": { p: ["connect with", "follow people", "create a profile", "social network", "feed"] },
  "Newsletter Website": { p: ["subscribe to the newsletter", "join readers", "delivered to your inbox", "latest edition"], s: ['input[type="email"]'] },
  "Delivery Platform": { p: ["delivery", "deliver to", "track your order", "order now", "delivery partners"] },
  "Recipe Blog": { p: ["recipes", "ingredients", "prep time", "cook time", "servings"], s: ['[itemtype*="Recipe"]'] },
  "Lookbook": { p: ["lookbook", "collection", "shop the look", "season", "editorial"] },
  "Automotive Website": { p: ["vehicles", "cars", "book a test drive", "find a dealer", "models"] },
  "Booking Platform": { p: ["book now", "check availability", "choose a date", "reservation", "booking"] },
  "Booking Website": { p: ["book now", "book an appointment", "reserve", "check availability", "schedule"] },
  "Product Catalogue": { p: ["product catalogue", "product catalog", "browse products", "download catalogue", "specifications"] },
  "Government Portal": { p: ["government", "public services", "citizen services", "departments", "official website"] },
  "Legal Website": { p: ["law firm", "legal services", "attorneys", "lawyers", "practice areas", "legal advice"] },
  "Information Portal": { p: ["information portal", "resources", "guides", "public information", "knowledge base"] },
  "Nonprofit Website": { p: ["nonprofit", "our cause", "our mission", "make a difference", "get involved"] },
  "Donation Website": { p: ["donate now", "make a donation", "your gift", "fundraise", "support our work"] },
  "Campaign Website": { p: ["campaign", "take action", "sign the petition", "join the movement", "our pledge"] },
  "Local Business Website": { p: ["locally owned", "serving", "service area", "get directions", "opening hours", "call us"] },
  "Lead-Generation Landing Page": { p: ["get a free quote", "request a quote", "free estimate", "contact us today", "schedule a consultation"], s: ['form'] },
  "Landing Page": { p: ["get started", "sign up", "request access", "learn more", "join now"] },
  "Directory": { p: ["directory", "browse categories", "discover", "submit a listing", "featured listings"] },
  "Job Board": { p: ["find jobs", "search jobs", "job board", "open positions", "post a job"] },
  "Review Website": { p: ["reviews", "ratings", "write a review", "top rated", "verified reviews"] },
  "Search Engine": { p: ["search the web", "search engine", "search results", "advanced search"], s: ['form[role="search"]', 'input[type="search"]'] },
  "Sports Website": { p: ["fixtures", "live scores", "league standings", "match results", "sports news", "season schedule"] },
  "Club Website": { p: ["club", "fixtures", "membership", "join the club", "our teams"] },
  "Pricing Website": { p: ["pricing", "plans", "per month", "compare plans", "free plan"], s: ['[class*="pricing"]'] },
  "Customer Portal": { p: ["customer portal", "sign in to your account", "manage your account", "support tickets"] },
  "Recruitment Website": { p: ["recruitment", "talent", "hire", "candidates", "employers", "staffing"] },
  "Career Portal": { p: ["careers", "open roles", "join our team", "job openings", "search jobs"] },
  "Resource Website": { p: ["resources", "templates", "guides", "downloads", "toolkit", "library"] }
};

const GENERIC = new Set(["website", "platform", "product", "portal", "page"]);

export function classifyWebsiteTypeAdvanced(zones, allowedTypes = null) {
  const allowed = new Set(allowedTypes || []);
  const candidates = [];
  for (const [type, rule] of Object.entries(RULES)) {
    let score = allowed.has(type) ? 0.8 : 0;
    const why = [];
    for (const [zone, weight] of [["title", 3], ["meta", 2.8], ["headings", 2.5], ["nav", 1.6], ["slugs", 1.4], ["body", 1]]) {
      const text = zones[zone] || "";
      for (const phrase of rule.p || []) {
        if (!contains(text, phrase)) continue;
        const words = phrase.split(/\s+/).filter((w) => !GENERIC.has(w));
        const specificity = Math.min(1.45, 0.75 + words.length * 0.18);
        score += weight * specificity;
        why.push(`${phrase}@${zone}`);
      }
    }
    for (const selector of rule.s || []) {
      try {
        const n = zones.$(selector).length;
        if (n) { score += Math.min(4, 1.5 + Math.log2(n + 1)); why.push(`${selector}×${n}`); }
      } catch { /* invalid selector should never fail classification */ }
    }
    if (score >= 2.5 && why.length) candidates.push({ type, score, why, allowed: allowed.has(type) });
  }

  candidates.sort((a, b) => b.score - a.score || Number(b.allowed) - Number(a.allowed));
  if (!candidates.length) return { type: null, confidence: 0, why: "no structural evidence", constrained: false, candidates: [] };

  let chosen = candidates[0];
  const allowedCandidate = candidates.find((c) => c.allowed);
  if (allowedCandidate && allowedCandidate.score >= chosen.score * 0.7) chosen = allowedCandidate;

  const runnerUp = candidates.find((c) => c.type !== chosen.type);
  const margin = runnerUp ? Math.max(0, (chosen.score - runnerUp.score) / Math.max(chosen.score, 1)) : 1;
  const confidence = Math.min(0.94, 0.45 + Math.min(chosen.score / 18, 0.32) + margin * 0.16);
  return {
    type: chosen.type,
    confidence,
    why: chosen.why.slice(0, 6).join(", "),
    constrained: Boolean(allowed.size && !chosen.allowed),
    candidates: candidates.slice(0, 5).map((c) => ({ type: c.type, score: Math.round(c.score * 10) / 10 }))
  };
}

export function supportedWebsiteTypes() {
  return Object.keys(RULES);
}

function contains(text, phrase) {
  if (!text || !phrase) return false;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}
