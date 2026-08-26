/**
 * DP: Category / Subcategory / Website Type / Audience
 * =====================================================
 * A dedicated micro-algorithm, in the same spirit as the DTC taxonomy engine,
 * but rebuilt around the 26-row taxonomy in Website_Datapoints.pdf. This is a
 * GENERAL web taxonomy (SaaS, agencies, portfolios, media, nonprofits...),
 * not a commerce-only one, so it runs three coupled classifiers instead of
 * one:
 *
 *   1. classifyCategory()  weighted keyword scoring across DOM zones, picks the
 *                          top-level Category and its best Subcategory.
 *   2. classifyWebsiteType() STRUCTURAL, not keyword: what SHAPE is this site?
 *                          (ecommerce store vs portfolio vs blog vs web app vs
 *                          docs vs landing/waitlist). Then constrained to the
 *                          website types the PDF allows for the chosen category.
 *   3. classifyAudience()  intent signals (B2B "book a demo / enterprise",
 *                          Developers "npm / API / SDK", Students "enroll",
 *                          Consumers "add to cart"...) constrained to the
 *                          category's allowed audiences.
 *
 * Each returns its own evidence envelope so the UI can show confidence and
 * evidence per field, exactly like every other data point.
 */

import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";
import { classifyWebsiteTypeAdvanced } from "./websiteType.js";

export const TAXONOMY_VERSION = "awd-tax-2026.08.16-a";

/* -------------------------------------------------------------------------
 * The taxonomy, transcribed from the PDF. Each node carries:
 *   kw     : category-level keywords
 *   subs   : { SubName: [keywords...] }
 *   types  : website types the PDF lists as valid for this category
 *   aud    : audiences the PDF lists as valid for this category
 * ---------------------------------------------------------------------- */
export const TAXONOMY = {
  "Technology & SaaS": {
    kw: ["saas", "software", "platform", "api", "cloud", "developer", "app", "integration", "dashboard", "automation", "workflow", "infrastructure"],
    subs: {
      "SaaS": ["saas", "software as a service", "subscription software", "web app", "start free trial"],
      "AI": ["artificial intelligence", "machine learning", "ai model", "llm", "neural", "generative ai", "gpt"],
      "AI Agents": ["ai agent", "autonomous agent", "agentic", "copilot", "assistant", "agent workflow"],
      "Developer Tools": ["developer tools", "sdk", "cli", "api reference", "open source", "devtools", "ci/cd", "npm"],
      "Cybersecurity": ["cybersecurity", "security", "threat", "encryption", "vulnerability", "soc 2", "zero trust", "firewall"],
      "Cloud": ["cloud", "serverless", "kubernetes", "hosting", "compute", "data center", "cdn"],
      "Analytics": ["analytics", "metrics", "insights", "reporting", "data visualization", "bi", "dashboards"],
      "Automation": ["automation", "workflow", "no-code automation", "zapier", "orchestration", "rpa"],
      "No-Code": ["no-code", "no code", "low-code", "drag and drop builder", "visual builder"],
      "Productivity": ["productivity", "task management", "notes", "collaboration", "team workspace"],
      "CRM": ["crm", "customer relationship", "sales pipeline", "contact management", "deals"]
    },
    types: ["SaaS Landing Page", "Product Website", "Web Application", "Documentation Website", "Waitlist Page"],
    aud: ["B2B", "B2C", "Developers", "Startups", "Enterprises"]
  },
  "Finance": {
    kw: ["finance", "financial", "bank", "payment", "money", "invest", "capital", "loan", "credit", "wealth"],
    subs: {
      "Fintech": ["fintech", "financial technology", "neobank", "open banking"],
      "Banking": ["bank", "banking", "checking account", "savings", "debit"],
      "Payments": ["payments", "payment processing", "checkout", "pos", "money transfer", "remittance"],
      "Lending": ["lending", "loan", "mortgage", "financing", "bnpl", "credit line"],
      "Investing": ["investing", "brokerage", "stocks", "trading", "portfolio", "etf", "securities"],
      "Accounting": ["accounting", "bookkeeping", "invoicing", "expenses", "tax", "payroll"],
      "Insurance": ["insurance", "insurtech", "coverage", "policy", "premium", "claims"],
      "Crypto": ["crypto", "cryptocurrency", "bitcoin", "ethereum", "web3", "defi", "wallet", "blockchain"],
      "Wealth Management": ["wealth management", "financial advisor", "retirement", "asset management"]
    },
    types: ["Product Website", "Corporate Website", "Web Application", "Mobile App Website", "Comparison Website"],
    aud: ["B2B", "B2C", "Enterprises", "Investors", "Small Businesses"]
  },
  "Ecommerce & Retail": {
    kw: ["shop", "store", "buy", "cart", "product", "collection", "retail", "checkout", "order", "shipping"],
    subs: {
      "Ecommerce": ["ecommerce", "online shop", "add to cart", "free shipping", "checkout"],
      "D2C": ["direct to consumer", "d2c", "dtc", "our brand"],
      "Online Store": ["online store", "shop now", "storefront"],
      "Marketplace": ["marketplace", "sellers", "buyers", "vendors", "listings"],
      "RetailTech": ["retailtech", "retail technology", "inventory", "omnichannel", "point of sale"],
      "Subscription Commerce": ["subscription", "subscribe and save", "recurring order", "replenish"]
    },
    types: ["Ecommerce Store", "Marketplace", "Product Website", "Brand Website", "Mobile App Website"],
    aud: ["B2C", "D2C", "B2B", "Retailers", "Consumers"]
  },
  "Agency & Studio": {
    kw: ["agency", "studio", "we craft", "we build", "our work", "clients", "case study", "services", "creative studio"],
    subs: {
      "Design": ["design agency", "design studio", "ui design", "product design", "visual design"],
      "Creative": ["creative agency", "creative studio", "art direction"],
      "Branding": ["branding", "brand identity", "brand strategy", "rebrand", "logo design"],
      "Marketing": ["marketing agency", "growth agency", "performance marketing", "campaigns"],
      "Development": ["development agency", "web development", "software agency", "we develop"],
      "Architecture": ["architecture studio", "architectural", "architects"],
      "Photography": ["photography studio", "photographer", "photo studio"],
      "Production": ["production studio", "film production", "video production", "post-production"]
    },
    types: ["Agency Website", "Studio Website", "Portfolio", "Service Website", "Case Study Website"],
    aud: ["B2B", "Startups", "Enterprises", "Small Businesses", "Creators"]
  },
  "Portfolio": {
    kw: ["portfolio", "my work", "selected work", "about me", "get in touch", "hi, i'm", "i am a", "freelance"],
    subs: {
      "Designer": ["product designer", "ux designer", "graphic designer", "designer portfolio"],
      "Developer": ["developer", "software engineer", "full stack", "frontend developer", "my projects"],
      "Photographer": ["photographer", "photography portfolio", "my photos"],
      "Artist": ["artist", "artwork", "paintings", "gallery of work"],
      "Illustrator": ["illustrator", "illustration", "my illustrations"],
      "Architect": ["architect", "architectural portfolio"],
      "Writer": ["writer", "author", "my writing", "published work", "copywriter"]
    },
    types: ["Personal Portfolio", "Personal Website", "Resume Website", "Case Study Website"],
    aud: ["Recruiters", "Clients", "Agencies", "Creative Professionals"]
  },
  "Business & Corporate": {
    kw: ["company", "corporate", "enterprise", "solutions", "our mission", "leadership", "about us", "global", "industries"],
    subs: {
      "Startup": ["startup", "we're building", "backed by", "series a", "our team is"],
      "Enterprise": ["enterprise", "fortune 500", "global leader", "at scale"],
      "Consulting": ["consulting", "consultancy", "advisory", "consultants", "strategy firm"],
      "Professional Services": ["professional services", "expertise", "our practice"],
      "Outsourcing": ["outsourcing", "bpo", "offshore", "dedicated team"],
      "Logistics": ["logistics", "freight", "shipping solutions", "warehousing", "fulfillment"],
      "Supply Chain": ["supply chain", "procurement", "distribution", "sourcing"]
    },
    types: ["Corporate Website", "Company Website", "Service Website", "Investor Website", "Landing Page"],
    aud: ["B2B", "Enterprises", "Investors", "Small Businesses"]
  },
  "Marketing & Sales": {
    kw: ["marketing", "sales", "leads", "campaign", "conversion", "audience", "outreach", "funnel", "engagement"],
    subs: {
      "MarTech": ["martech", "marketing platform", "marketing automation", "marketing stack"],
      "AdTech": ["adtech", "ad platform", "programmatic", "ad campaigns", "dsp"],
      "SEO": ["seo", "search engine optimization", "keyword", "rankings", "backlinks", "serp"],
      "Email Marketing": ["email marketing", "newsletters", "email campaigns", "drip", "esp"],
      "Social Media": ["social media", "social scheduling", "content calendar", "community management"],
      "SalesTech": ["salestech", "sales engagement", "sales enablement", "outbound"],
      "Lead Generation": ["lead generation", "lead gen", "capture leads", "prospecting"],
      "Customer Success": ["customer success", "retention", "onboarding", "churn"]
    },
    types: ["SaaS Website", "Product Website", "Agency Website", "Web Application", "Landing Page"],
    aud: ["Marketers", "Sales Teams", "Agencies", "B2B Companies"]
  },
  "Healthcare & Wellness": {
    kw: ["health", "healthcare", "patient", "medical", "clinic", "wellness", "care", "doctor", "treatment", "therapy"],
    subs: {
      "HealthTech": ["healthtech", "digital health", "health platform", "ehr", "emr"],
      "Medical": ["medical", "hospital", "physician", "diagnosis", "clinical"],
      "Dental": ["dental", "dentist", "orthodontics", "teeth"],
      "Mental Health": ["mental health", "therapy", "counseling", "psychology", "meditation", "anxiety"],
      "Fitness": ["fitness", "workout", "gym", "training", "coach"],
      "Wellness": ["wellness", "self-care", "holistic", "mindfulness"],
      "Pharmacy": ["pharmacy", "prescription", "medication", "rx"],
      "Telehealth": ["telehealth", "telemedicine", "virtual visit", "online doctor"],
      "Medical Devices": ["medical device", "diagnostics", "wearable health"]
    },
    types: ["Healthcare Website", "Booking Website", "Web Application", "Mobile App Website", "Service Website"],
    aud: ["B2C", "Patients", "Healthcare Professionals", "Clinics", "Enterprises"]
  },
  "Education": {
    kw: ["learn", "course", "education", "student", "teach", "training", "curriculum", "class", "lesson", "enroll"],
    subs: {
      "EdTech": ["edtech", "education technology", "learning platform", "lms"],
      "Online Courses": ["online course", "courses", "enroll now", "video lessons", "curriculum"],
      "Schools": ["school", "k-12", "academy", "admissions"],
      "Universities": ["university", "college", "degree", "campus", "faculty"],
      "Learning Platforms": ["learning platform", "e-learning", "self-paced"],
      "Coaching": ["coaching", "mentorship", "1:1 coaching", "bootcamp"],
      "Training": ["corporate training", "upskilling", "certification", "workshops"],
      "Language Learning": ["language learning", "learn spanish", "fluency", "vocabulary"]
    },
    types: ["Education Website", "Course Platform", "School Website", "Web Application", "Membership Website"],
    aud: ["Students", "Teachers", "Parents", "Professionals", "Institutions"]
  },
  "Real Estate & Construction": {
    kw: ["property", "real estate", "home", "listing", "rent", "buy home", "construction", "building", "square feet"],
    subs: {
      "PropTech": ["proptech", "property technology", "real estate platform"],
      "Property Marketplace": ["property marketplace", "homes for sale", "listings", "browse properties"],
      "Property Management": ["property management", "tenants", "landlord", "lease management"],
      "Architecture": ["architecture", "architectural design", "building design"],
      "Interior Design": ["interior design", "interiors", "home staging", "decor"],
      "Construction": ["construction", "contractor", "general contractor", "build", "renovation"]
    },
    types: ["Property Website", "Marketplace", "Listing Website", "Corporate Website", "Portfolio"],
    aud: ["B2C", "Buyers", "Renters", "Property Owners", "Businesses"]
  },
  "Travel & Hospitality": {
    kw: ["travel", "hotel", "book", "stay", "destination", "trip", "resort", "restaurant", "reservation", "tourism"],
    subs: {
      "TravelTech": ["traveltech", "travel platform", "trip planner", "itinerary"],
      "Hotels": ["hotel", "rooms", "suite", "check-in", "amenities"],
      "Resorts": ["resort", "spa resort", "all-inclusive", "beachfront"],
      "Restaurants": ["restaurant", "menu", "reservations", "dine", "cuisine"],
      "Cafes": ["cafe", "coffee shop", "espresso bar"],
      "Tourism": ["tourism", "tours", "sightseeing", "guided tour", "attractions"],
      "Booking": ["booking", "book now", "availability", "reserve"],
      "Vacation Rentals": ["vacation rental", "short-term rental", "holiday home", "airbnb"],
      "Events": ["events", "event venue", "conference", "weddings venue"]
    },
    types: ["Booking Website", "Hotel Website", "Restaurant Website", "Marketplace", "Travel Blog"],
    aud: ["Travellers", "Guests", "B2C", "Businesses", "Event Attendees"]
  },
  "Media & Entertainment": {
    kw: ["news", "watch", "stream", "listen", "read", "story", "article", "episode", "entertainment", "video"],
    subs: {
      "News": ["news", "breaking news", "headlines", "journalism", "reporter"],
      "Magazines": ["magazine", "issue", "editorial", "features"],
      "Blogs": ["blog", "posts", "read more", "latest posts"],
      "Streaming": ["streaming", "watch now", "stream", "on demand", "episodes"],
      "Music": ["music", "songs", "albums", "artists", "playlist", "listen"],
      "Podcasts": ["podcast", "episodes", "listen now", "subscribe podcast"],
      "Film": ["film", "movie", "cinema", "screening", "trailer"],
      "Gaming": ["gaming", "game", "play now", "esports", "gamers"]
    },
    types: ["Media Website", "Blog", "Magazine", "Streaming Platform", "Entertainment Portal"],
    aud: ["B2C", "Readers", "Viewers", "Listeners", "Gamers"]
  },
  "Creator & Community": {
    kw: ["community", "creators", "members", "join", "newsletter", "forum", "audience", "followers", "support us"],
    subs: {
      "Creator Platforms": ["creator platform", "for creators", "monetize", "your audience"],
      "Social Networks": ["social network", "connect", "profiles", "feed", "follow"],
      "Communities": ["community", "join the community", "members only", "discord", "slack community"],
      "Memberships": ["membership", "members", "become a member", "tiers"],
      "Newsletters": ["newsletter", "subscribe", "inbox", "weekly email"],
      "Forums": ["forum", "discussion", "threads", "topics"],
      "Crowdfunding": ["crowdfunding", "back this project", "pledge", "campaign goal", "backers"]
    },
    types: ["Community Website", "Membership Website", "Social Platform", "Newsletter Website", "Marketplace"],
    aud: ["Creators", "Fans", "Professionals", "Members", "B2C"]
  },
  "Food & Agriculture": {
    kw: ["food", "recipe", "delivery", "grocery", "farm", "organic", "fresh", "ingredients", "eat", "meal"],
    subs: {
      "FoodTech": ["foodtech", "food technology", "ghost kitchen", "food platform"],
      "Restaurants": ["restaurant", "menu", "dine in", "takeout"],
      "Delivery": ["food delivery", "order online", "delivered to your door"],
      "Food Brands": ["food brand", "our products", "snacks", "pantry"],
      "Grocery": ["grocery", "groceries", "supermarket", "produce"],
      "AgriTech": ["agritech", "agriculture technology", "smart farming", "crop"],
      "Farming": ["farming", "farm", "farmers", "harvest", "livestock"],
      "Beverages": ["beverage", "drinks", "juice", "coffee", "tea"],
      "Recipes": ["recipes", "how to cook", "ingredients", "cooking"]
    },
    types: ["Restaurant Website", "Ecommerce Store", "Delivery Platform", "Brand Website", "Recipe Blog"],
    aud: ["Consumers", "Farmers", "Restaurants", "Retailers", "B2B"]
  },
  "Fashion & Beauty": {
    kw: ["fashion", "clothing", "beauty", "style", "wear", "apparel", "cosmetics", "skincare", "makeup", "collection"],
    subs: {
      "Clothing": ["clothing", "apparel", "wear", "outfits", "garments"],
      "Footwear": ["footwear", "shoes", "sneakers", "boots"],
      "Jewellery": ["jewellery", "jewelry", "necklace", "ring", "earrings", "gold", "diamond"],
      "Cosmetics": ["cosmetics", "makeup", "lipstick", "foundation"],
      "Skincare": ["skincare", "serum", "moisturizer", "cleanser"],
      "Salons": ["salon", "hair salon", "book appointment", "stylist"],
      "Personal Care": ["personal care", "grooming", "hygiene"]
    },
    types: ["Ecommerce Store", "Brand Website", "Booking Website", "Lookbook", "Marketplace"],
    aud: ["B2C", "D2C", "Consumers", "Retailers", "Beauty Professionals"]
  },
  "Automotive & Mobility": {
    kw: ["car", "vehicle", "auto", "drive", "electric vehicle", "mobility", "transport", "fleet", "ride"],
    subs: {
      "Automotive": ["automotive", "car", "vehicle", "dealership", "models"],
      "Electric Vehicles": ["electric vehicle", "ev", "electric car", "charging", "battery range"],
      "Transportation": ["transportation", "transit", "logistics transport"],
      "Ride Sharing": ["ride sharing", "rideshare", "book a ride", "drivers"],
      "Vehicle Marketplace": ["vehicle marketplace", "used cars", "buy a car", "car listings"],
      "Fleet Management": ["fleet management", "fleet", "telematics", "fleet operators"]
    },
    types: ["Automotive Website", "Marketplace", "Product Website", "Booking Platform", "Mobile App Website"],
    aud: ["B2C", "B2B", "Drivers", "Fleet Operators", "Vehicle Buyers"]
  },
  "Home & Lifestyle": {
    kw: ["home", "lifestyle", "decor", "furniture", "garden", "pets", "wedding", "hobby", "family"],
    subs: {
      "Home Decor": ["home decor", "decor", "interior", "wall art"],
      "Furniture": ["furniture", "sofa", "table", "chair", "bedroom"],
      "Gardening": ["gardening", "garden", "plants", "outdoor"],
      "Pets": ["pets", "dog", "cat", "pet supplies"],
      "Parenting": ["parenting", "baby", "toddler", "nursery", "kids"],
      "Hobbies": ["hobby", "hobbies", "diy", "crafts"],
      "Dating": ["dating", "match", "singles", "find love"],
      "Weddings": ["wedding", "bride", "groom", "wedding planning"]
    },
    types: ["Ecommerce Store", "Blog", "Service Website", "Marketplace", "Community Website"],
    aud: ["Consumers", "Families", "Homeowners", "Hobbyists", "Couples"]
  },
  "Industrial & Energy": {
    kw: ["manufacturing", "industrial", "engineering", "energy", "power", "factory", "machinery", "robotics", "solar"],
    subs: {
      "Manufacturing": ["manufacturing", "factory", "production line", "fabrication"],
      "Engineering": ["engineering", "engineers", "mechanical", "civil engineering"],
      "Robotics": ["robotics", "robots", "automation systems", "cobots"],
      "Aerospace": ["aerospace", "aviation", "satellite", "spacecraft"],
      "Energy": ["energy", "power", "utilities", "grid", "oil and gas"],
      "Renewable Energy": ["renewable energy", "solar", "wind power", "clean energy"],
      "ClimateTech": ["climatetech", "carbon", "sustainability tech", "net zero"],
      "IoT": ["iot", "internet of things", "connected devices", "sensors"]
    },
    types: ["Corporate Website", "Product Catalogue", "B2B Marketplace", "Service Website", "Investor Website"],
    aud: ["B2B", "Enterprises", "Engineers", "Governments", "Investors"]
  },
  "Legal & Government": {
    kw: ["legal", "law", "attorney", "government", "compliance", "regulation", "policy", "public", "civic"],
    subs: {
      "Legal Services": ["legal services", "law firm", "attorney", "lawyer", "counsel"],
      "LegalTech": ["legaltech", "legal technology", "contract management", "e-discovery"],
      "Government": ["government", "gov", "public sector", "ministry", "agency"],
      "Compliance": ["compliance", "regulatory", "audit", "governance"],
      "RegTech": ["regtech", "regulatory technology", "kyc", "aml"],
      "Civic Technology": ["civic technology", "civic tech", "public services", "citizens"]
    },
    types: ["Government Portal", "Legal Website", "Service Website", "Web Application", "Information Portal"],
    aud: ["Citizens", "Businesses", "Legal Professionals", "Government Agencies"]
  },
  "Nonprofit & Social Impact": {
    kw: ["nonprofit", "charity", "donate", "cause", "impact", "volunteer", "mission", "foundation", "give"],
    subs: {
      "Charity": ["charity", "donate", "donation", "charitable"],
      "Sustainability": ["sustainability", "sustainable", "eco", "green"],
      "Social Impact": ["social impact", "for good", "changemakers", "communities we serve"],
      "Environment": ["environment", "conservation", "climate", "wildlife", "ocean"],
      "Fundraising": ["fundraising", "fundraiser", "raise money", "campaign goal"],
      "Religious Organisations": ["church", "ministry", "faith", "congregation", "worship"]
    },
    types: ["Nonprofit Website", "Donation Website", "Campaign Website", "Community Website", "Information Portal"],
    aud: ["Donors", "Volunteers", "Communities", "Organisations"]
  },
  "Local Services": {
    kw: ["local", "service area", "book a service", "free quote", "request a quote", "licensed", "insured", "near you", "same day", "pest control", "bed bug", "bed bugs", "exterminator", "locally owned", "family-owned"],
    subs: {
      "Home Services": ["home services", "handyman", "home repair"],
      "Pest Control": ["pest control", "bed bug", "bed bugs", "bed bug treatment", "bed bug control", "exterminator", "extermination", "termite", "rodent", "infestation", "pesticide", "cockroach", "ants", "wasp", "spider", "fleas", "mites"],
      "Lawn Care": ["lawn care", "landscaping", "mowing", "yard"],
      "Cleaning": ["cleaning", "house cleaning", "maid service", "janitorial"],
      "Plumbing": ["plumbing", "plumber", "drain", "leak"],
      "HVAC": ["hvac", "heating", "air conditioning", "furnace"],
      "Roofing": ["roofing", "roofer", "roof repair", "shingles"],
      "Repairs": ["repair", "fix", "maintenance", "installation"]
    },
    types: ["Local Business Website", "Service Website", "Booking Website", "Lead-Generation Landing Page"],
    aud: ["B2C", "Homeowners", "Local Consumers", "Property Managers", "Small Businesses"]
  },
  "Directories & Discovery": {
    kw: ["directory", "browse", "search", "compare", "reviews", "listings", "find the best", "top", "database of"],
    subs: {
      "Business Directory": ["business directory", "listings", "find businesses"],
      "Product Directory": ["product directory", "tools directory", "browse products"],
      "Job Board": ["job board", "jobs", "hiring", "browse jobs", "post a job"],
      "Resource Library": ["resource library", "resources", "templates", "guides"],
      "Reviews": ["reviews", "ratings", "verified reviews", "user reviews"],
      "Comparisons": ["compare", "comparison", "vs", "alternatives", "best of"],
      "Search": ["search engine", "search", "discover"]
    },
    types: ["Directory", "Job Board", "Review Website", "Comparison Website", "Search Engine"],
    aud: ["Consumers", "Professionals", "Job Seekers", "Businesses"]
  },
  "Sports & Recreation": {
    kw: ["sports", "team", "club", "athletes", "outdoor", "fitness", "league", "match", "recreation", "esports"],
    subs: {
      "SportsTech": ["sportstech", "sports technology", "athlete data", "performance tracking"],
      "Teams": ["team", "roster", "fixtures", "our club"],
      "Clubs": ["club", "membership", "join the club", "facilities"],
      "Outdoor Activities": ["outdoor", "hiking", "climbing", "adventure"],
      "Esports": ["esports", "gaming team", "tournament", "competitive gaming"],
      "Sporting Goods": ["sporting goods", "equipment", "gear", "apparel"]
    },
    types: ["Sports Website", "Club Website", "Ecommerce Store", "Community Website", "Booking Website"],
    aud: ["Fans", "Athletes", "Gamers", "Clubs", "Consumers"]
  },
  "Telecommunications": {
    kw: ["telecom", "internet", "network", "broadband", "mobile plan", "coverage", "voip", "connectivity", "5g"],
    subs: {
      "Telecom": ["telecom", "telecommunications", "carrier", "mobile network"],
      "Internet Providers": ["internet provider", "isp", "broadband", "fiber"],
      "VoIP": ["voip", "voice over ip", "business phone", "cloud phone"],
      "Messaging": ["messaging", "sms api", "chat api", "communications api"],
      "Network Infrastructure": ["network infrastructure", "routers", "backbone", "data center"]
    },
    types: ["Corporate Website", "Product Website", "Service Website", "Pricing Website", "Customer Portal"],
    aud: ["B2C", "B2B", "Enterprises", "Consumers"]
  },
  "Recruitment & HR": {
    kw: ["hiring", "recruitment", "jobs", "candidates", "hr", "payroll", "employees", "talent", "applicant"],
    subs: {
      "HR Tech": ["hr tech", "hris", "people platform", "hr software"],
      "Recruitment": ["recruitment", "recruiting", "hire", "staffing", "headhunting"],
      "Job Platforms": ["job platform", "job board", "find jobs", "post jobs"],
      "Applicant Tracking": ["applicant tracking", "ats", "candidate pipeline"],
      "Payroll": ["payroll", "pay employees", "salary", "compensation"],
      "Benefits": ["benefits", "employee benefits", "health benefits", "perks"],
      "Remote Work": ["remote work", "distributed team", "work from anywhere", "remote hiring"]
    },
    types: ["Job Board", "Recruitment Website", "SaaS Website", "Career Portal", "Web Application"],
    aud: ["Employers", "Recruiters", "Employees", "Job Seekers"]
  },
  "Design & Creative Tools": {
    kw: ["design tool", "prototype", "editor", "canvas", "templates", "create", "vector", "creative tool", "figma"],
    subs: {
      "Graphic Design": ["graphic design", "design tool", "templates", "graphics"],
      "UI/UX": ["ui/ux", "ui design tool", "prototyping", "wireframe", "design system"],
      "Website Builders": ["website builder", "build a website", "no-code website", "drag and drop"],
      "Prototyping": ["prototyping", "prototype", "interactive prototype", "mockup"],
      "Image Editing": ["image editing", "photo editor", "background remover", "retouch"],
      "Video Editing": ["video editing", "video editor", "timeline", "clips"],
      "Animation": ["animation", "motion design", "animate", "keyframes"]
    },
    types: ["Product Website", "SaaS Landing Page", "Web Application", "Resource Website", "Community Website"],
    aud: ["Designers", "Creators", "Agencies", "Marketers", "Developers"]
  }
};

/* -------------------------------------------------------------------------
 * Structured signals: many sites declare what they are via og:type and
 * schema.org @type. These are high-precision, so they get a strong boost.
 * ---------------------------------------------------------------------- */
const SCHEMA_TO_CATEGORY = {
  softwareapplication: "Technology & SaaS", webapplication: "Technology & SaaS", mobileapplication: "Technology & SaaS",
  product: "Ecommerce & Retail", productgroup: "Ecommerce & Retail", offer: "Ecommerce & Retail", aggregateoffer: "Ecommerce & Retail", onlinestore: "Ecommerce & Retail",
  article: "Media & Entertainment", newsarticle: "Media & Entertainment", blogposting: "Media & Entertainment", blog: "Media & Entertainment", liveblogposting: "Media & Entertainment",
  videoobject: "Media & Entertainment", movie: "Media & Entertainment", musicgroup: "Media & Entertainment", musicalbum: "Media & Entertainment", podcastseries: "Media & Entertainment", tvseries: "Media & Entertainment", radiostation: "Media & Entertainment",
  jobposting: "Recruitment & HR",
  course: "Education", educationalorganization: "Education", school: "Education", collegeoruniversity: "Education", elementaryschool: "Education", highschool: "Education",
  recipe: "Food & Agriculture", restaurant: "Travel & Hospitality", cafeorcoffeeshop: "Travel & Hospitality", foodestablishment: "Food & Agriculture", bakery: "Food & Agriculture",
  hotel: "Travel & Hospitality", lodgingbusiness: "Travel & Hospitality", resort: "Travel & Hospitality", touristattraction: "Travel & Hospitality", travelagency: "Travel & Hospitality",
  medicalorganization: "Healthcare & Wellness", hospital: "Healthcare & Wellness", physician: "Healthcare & Wellness", dentist: "Healthcare & Wellness", medicalclinic: "Healthcare & Wellness", pharmacy: "Healthcare & Wellness",
  realestateagent: "Real Estate & Construction", realestatelisting: "Real Estate & Construction", residence: "Real Estate & Construction", apartment: "Real Estate & Construction", singlefamilyresidence: "Real Estate & Construction",
  financialservice: "Finance", bankorcreditunion: "Finance", insuranceagency: "Finance", accountingservice: "Finance",
  ngo: "Nonprofit & Social Impact", nonprofit: "Nonprofit & Social Impact",
  governmentorganization: "Legal & Government", governmentoffice: "Legal & Government", attorney: "Legal & Government", legalservice: "Legal & Government",
  sportsorganization: "Sports & Recreation", sportsteam: "Sports & Recreation", sportsclub: "Sports & Recreation", exercisegym: "Sports & Recreation",
  autodealer: "Automotive & Mobility", automotivebusiness: "Automotive & Mobility", car: "Automotive & Mobility", vehicle: "Automotive & Mobility",
  plumber: "Local Services", electrician: "Local Services", hvacbusiness: "Local Services", roofingcontractor: "Local Services", housepainter: "Local Services", locksmith: "Local Services", movingcompany: "Local Services", homeandconstructionbusiness: "Local Services", generalcontractor: "Local Services", cleaningservice: "Local Services", pestcontrol: "Local Services"
};
const OGTYPE_TO_CATEGORY = {
  article: "Media & Entertainment", product: "Ecommerce & Retail", "product.item": "Ecommerce & Retail",
  profile: "Portfolio", "music.song": "Media & Entertainment", "music.album": "Media & Entertainment",
  "video.movie": "Media & Entertainment", "video.episode": "Media & Entertainment", "video.tv_show": "Media & Entertainment", "business.business": "Business & Corporate"
};

export function structuredSignals(html) {
  const $ = cheerio.load(html || "");
  const boosts = {};
  const evidenceBits = [];
  const bump = (cat, w, why) => { if (!cat) return; boosts[cat] = (boosts[cat] || 0) + w; evidenceBits.push(why); };

  const og = ($('meta[property="og:type"]').attr("content") || "").toLowerCase().trim();
  if (og && OGTYPE_TO_CATEGORY[og]) bump(OGTYPE_TO_CATEGORY[og], 8, `og:type=${og}`);

  const types = new Set();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).contents().text());
      const arr = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
      for (const node of arr) {
        if (!node) continue;
        const t = node["@type"];
        if (Array.isArray(t)) t.forEach((x) => types.add(String(x).toLowerCase()));
        else if (t) types.add(String(t).toLowerCase());
      }
    } catch { /* ignore */ }
  });
  for (const t of types) if (SCHEMA_TO_CATEGORY[t]) bump(SCHEMA_TO_CATEGORY[t], 10, `schema:${t}`);
  return { boosts, evidence: evidenceBits };
}

/* Word-sense guard: ambiguous tokens only count with confirming context, so
 * "we make your phone ring" does not classify a telecom marketing site as
 * Jewellery. Mirrors the DTC v8 fix. */
const AMBIGUOUS = {
  "ring": ["gold", "diamond", "silver", "engagement", "wedding band", "jewel"],
  "watch": ["chronograph", "timepiece", "wrist", "strap", "dial"],
  "match": ["dating", "singles", "profile", "swipe"],
  "drive": ["car", "vehicle", "road", "engine", "ev"],
  // "Our team" is ordinary company language. It is a sports signal only when
  // the page also contains an unmistakable sporting concept.
  "team": ["sports", "sporting", "league", "fixtures", "roster", "athlete", "tournament", "esports", "football", "soccer", "basketball", "baseball", "hockey", "rugby", "cricket"]
};

const ZONES = [
  ["title", 3.0],
  ["meta", 3.0],
  ["headings", 3.0],
  ["slugs", 2.5],
  ["nav", 2.0],
  ["body", 1.0]
];

/* ---- zone extraction ---- */
export function buildZones(html, supplementalHtml = []) {
  const primary = readZones(html, { bodyCap: 24000, headingCap: 30, linkCap: 240 });
  const extras = (supplementalHtml || [])
    .filter(Boolean)
    .slice(0, 4)
    .map((doc) => readZones(doc, { bodyCap: 10000, headingCap: 18, linkCap: 100 }));

  // Supplemental About/Product/Pricing copy is useful but should never
  // overpower the homepage. Repeating the homepage zones and appending capped
  // extra-page evidence creates that weighting without losing provenance.
  const join = (key) => [primary[key], ...extras.map((e) => e[key])].filter(Boolean).join(" ");
  return {
    $: primary.$,
    title: join("title"),
    meta: join("meta"),
    headings: join("headings"),
    nav: primary.nav,
    slugs: join("slugs"),
    body: join("body"),
    raw: [primary.raw, ...extras.map((e) => e.raw)].join("\n").slice(0, 280000),
    document_count: 1 + extras.length
  };
}

function readZones(html, { bodyCap, headingCap, linkCap }) {
  const source = html || "";
  const $ = cheerio.load(source);
  const title = ($("title").first().text() + " " + ($('meta[property="og:site_name"]').attr("content") || "")).trim();
  const meta = [
    $('meta[name="description"]').attr("content") || "",
    $('meta[property="og:description"]').attr("content") || "",
    $('meta[name="keywords"]').attr("content") || ""
  ].join(" ");
  const headings = $("h1, h2, h3").slice(0, headingCap).map((_, el) => $(el).text().trim()).get().join(" ");
  const nav = $("nav a, header a, footer a").slice(0, 100).map((_, el) => $(el).text().trim()).get().join(" ");
  const slugs = $('a[href]').slice(0, linkCap).map((_, el) => {
    try { return new URL($(el).attr("href"), "https://x.example").pathname.replace(/[-_/]/g, " "); }
    catch { return ""; }
  }).get().join(" ");
  $("script, style, noscript, template").remove();
  const body = $("body").text().replace(/\s+/g, " ").trim().slice(0, bodyCap);
  return {
    $, title: title.toLowerCase(), meta: meta.toLowerCase(), headings: headings.toLowerCase(),
    nav: nav.toLowerCase(), slugs: slugs.toLowerCase(), body: body.toLowerCase(),
    raw: source.slice(0, 140000)
  };
}

function countHits(text, keyword, fullContext) {
  if (!text) return 0;
  const kw = keyword.toLowerCase();
  // Word-boundary-ish match; keep multi-word phrases intact.
  const re = new RegExp(`(^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "gi");
  const matches = (text.match(re) || []).length;
  if (!matches) return 0;
  if (AMBIGUOUS[kw]) {
    const ok = AMBIGUOUS[kw].some((ctx) => fullContext.includes(ctx));
    if (!ok) return 0;
  }
  return matches;
}

const LOW_SIGNAL_KEYWORDS = new Set([
  "app", "platform", "product", "solution", "services", "company", "business",
  "community", "support", "design", "media", "digital", "online", "global",
  "industry", "professional", "your", "create", "content"
]);

function keywordStrength(keyword) {
  const kw = String(keyword || "").toLowerCase();
  if (LOW_SIGNAL_KEYWORDS.has(kw)) return 0.32;
  const words = kw.split(/\s+/).filter(Boolean).length;
  return words >= 3 ? 1.35 : words === 2 ? 1.15 : 0.82;
}

/* High-precision vertical evidence should beat repeated generic language.
 * This guard is deliberately domain-independent: it recognizes a pest-control
 * business from multiple service terms plus a local/commercial conversion cue.
 * A single word such as "treatment" or "team" can never activate it. */
function applyVerticalDominance(scores, fullContext) {
  const pestPatterns = [
    /\bbed bugs?\b/,
    /\bpest control\b/,
    /\bexterminat(?:or|ion)\b/,
    /\btermites?\b/,
    /\brodents?\b/,
    /\binfestation\b/,
    /\bpesticides?\b/,
    /\bcockroaches?\b/
  ];
  const pestHits = pestPatterns.filter((pattern) => pattern.test(fullContext)).length;
  const localCommercialCue = /\b(?:request (?:a )?quote|free quote|call us|service areas?|locally owned|family-owned|licensed(?:,| and)? insured|residential (?:pest|bed bug|service|treatment|control)|commercial (?:pest|bed bug|service|treatment|control))\b/.test(fullContext);

  if (pestHits < 2 || !localCommercialCue || !scores["Local Services"]) return;

  const local = scores["Local Services"];
  const boost = 14 + pestHits * 2;
  local.score += boost;
  local.subScores["Pest Control"] = (local.subScores["Pest Control"] || 0) + boost * 0.75;
  (local.subEvidence["Pest Control"] || (local.subEvidence["Pest Control"] = [])).push("vertical:pest-control");
  local.hits.push("vertical:pest-control", `pest_cues:${pestHits}`, "local_conversion_cue");
  local.hitZones = [...new Set([...local.hitZones, "vertical_guard"])];
}

/* ---- 1. category + subcategory ---- */
export function classifyCategory(zones, boosts = {}) {
  const fullContext = ZONES.map(([z]) => zones[z] || "").join(" ");
  const scores = {};
  for (const [cat, node] of Object.entries(TAXONOMY)) {
    let score = boosts[cat] || 0; // high-precision structured signals start us off
    const hits = [];
    const hitZones = new Set();
    const subScores = {};
    const subEvidence = {};
    for (const [zone, weight] of ZONES) {
      const text = zones[zone];
      for (const kw of node.kw) {
        const n = countHits(text, kw, fullContext);
        if (n) {
          score += Math.min(n, 3) * weight * keywordStrength(kw);
          hits.push(`${kw}@${zone}`);
          hitZones.add(zone);
        }
      }
      for (const [sub, subKw] of Object.entries(node.subs)) {
        for (const kw of subKw) {
          const n = countHits(text, kw, fullContext);
          if (n) {
            const pts = Math.min(n, 3) * weight * keywordStrength(kw);
            subScores[sub] = (subScores[sub] || 0) + pts;
            (subEvidence[sub] || (subEvidence[sub] = [])).push(`${kw}@${zone}`);
            score += pts * 0.9; // sub evidence also lifts the parent
            hits.push(`${kw}@${zone}`);
            hitZones.add(zone);
          }
        }
      }
    }
    scores[cat] = { score, subScores, subEvidence, hits, hitZones: [...hitZones], structuredBoost: boosts[cat] || 0 };
  }

  applyVerticalDominance(scores, fullContext);

  const ranked = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  let [topCat, top] = ranked[0];

  // ---- disambiguation for commonly-confused pairs ----
  // An AI image / canvas / design tool often mentions "video"/"image" and gets
  // pulled toward Media; redirect to Design & Creative Tools when tool-language
  // is present.
  if (topCat === "Media & Entertainment") {
    const ctx = fullContext;
    const toolCues = ["generate", "create", "canvas", "editor", "edit ", "design tool", "ai image", "text to image", "prototype", "template", "render", "no-code", "drag and drop", "export"];
    const toolHits = toolCues.filter((c) => ctx.includes(c)).length;
    const dct = scores["Design & Creative Tools"];
    if (toolHits >= 2 && dct && dct.score >= top.score * 0.5) { topCat = "Design & Creative Tools"; top = dct; }
  }
  // Ecommerce vs Business/SaaS: strong storefront signals win.
  if ((topCat === "Business & Corporate" || topCat === "Technology & SaaS")) {
    const ctx = fullContext;
    if (/add to cart|add to bag|shopping cart|checkout|\/collections\/|\/products\//.test(ctx) && scores["Ecommerce & Retail"]?.score >= top.score * 0.5) {
      topCat = "Ecommerce & Retail"; top = scores["Ecommerce & Retail"];
    }
  }
  const reRanked = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  const runnerUp = reRanked.find(([c]) => c !== topCat) ? { category: reRanked.find(([c]) => c !== topCat)[0], score: Math.round(reRanked.find(([c]) => c !== topCat)[1].score) } : null;

  const evidenceDiversity = top?.hitZones?.length || 0;
  if (!top || top.score < 7 || (evidenceDiversity < 2 && !top.structuredBoost)) {
    return { category: null, subcategory: null, confidence: 0, hits: [], runnerUp, scores };
  }

  // Subcategory keywords are inherently sparser than category keywords, so the
  // bar is an ABSOLUTE floor (keyword genuinely present), not a fraction of the
  // often-large parent score. A dominant sub that clears the floor wins.
  const subRanked = Object.entries(top.subScores).sort((a, b) => b[1] - a[1]);
  const SUB_FLOOR = 2; // e.g. one heading/title/meta hit, or two body hits
  const subcategory = subRanked[0] && subRanked[0][1] >= SUB_FLOOR ? subRanked[0][0] : null;

  const margin = runnerUp ? Math.max(0, (top.score - runnerUp.score) / top.score) : 1;
  const diversityBoost = Math.min(0.14, evidenceDiversity * 0.035);
  const confidence = Math.min(0.95, 0.36 + Math.min(top.score / 70, 0.3) + margin * 0.18 + diversityBoost + (top.structuredBoost ? 0.08 : 0));

  return {
    category: topCat,
    subcategory,
    confidence,
    hits: [...new Set(top.hits)].slice(0, 12),
    subKeywordsHit: subcategory ? [...new Set(top.subEvidence?.[subcategory] || [])].slice(0, 8) : [],
    subCandidates: subRanked.slice(0, 5).map(([s, score]) => ({ subcategory: s, score: Math.round(score * 10) / 10 })),
    structuredBoost: top.structuredBoost,
    evidenceDiversity,
    runnerUp,
    scores
  };
}

/* ---- 2. website type (STRUCTURAL) ---- */
const TYPE_SIGNALS = [
  // [Website Type, test(zones,$) -> {score, why}]
  ["Ecommerce Store", (z, $) => {
    let s = 0; const why = [];
    if (/add to cart|add to bag|shopping cart|checkout|shop now/.test(z.body)) { s += 4; why.push("cart/checkout language"); }
    if ($('a[href*="/cart"], a[href*="/products/"], a[href*="/collections/"]').length) { s += 3; why.push("product/collection links"); }
    if (/\$\d|£\d|€\d|₹\d|price/.test(z.body) && s) { s += 1; why.push("prices"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Marketplace", (z, $) => {
    let s = 0; const why = [];
    if (/marketplace|sellers|vendors|buyers|browse listings|thousands of/.test(z.body)) { s += 4; why.push("marketplace language"); }
    if (/list your|become a seller|start selling/.test(z.body)) { s += 2; why.push("two-sided CTA"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Web Application", (z, $) => {
    let s = 0; const why = [];
    // "dashboard / my account" in the body is a stronger app signal than a
    // lone "log in" link, which nearly every marketing site also has.
    if (/dashboard|my account|your workspace|app\.[a-z]/.test(z.body)) { s += 3; why.push("in-app language"); }
    if (/log ?in|sign ?in/.test(z.nav)) { s += 1; why.push("login link"); }
    if ($('a[href*="app."], a[href*="/dashboard"]').length) { s += 2; why.push("app subdomain/dashboard link"); }
    if (/<div id="root"><\/div>|<div id="app"><\/div>/.test(z.raw)) { s += 2; why.push("empty SPA shell"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Documentation Website", (z, $) => {
    let s = 0; const why = [];
    // The PAGE must be docs, not merely link to docs. Title/heading ownership
    // or a docs framework counts; a lone nav link does not.
    if (/documentation|api reference|read the docs|developer docs/.test(z.title + " " + z.headings)) { s += 4; why.push("docs in title/heading"); }
    if (/docusaurus|gitbook|mkdocs|readme\.io|nextra|docsify/.test(z.raw.toLowerCase())) { s += 4; why.push("docs framework"); }
    if (/on this page|table of contents|\bapi\b.*\breference\b/.test(z.body) && $('nav a[href*="#"]').length > 5) { s += 2; why.push("in-page doc anchors"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Waitlist Page", (z, $) => {
    let s = 0; const why = [];
    if (/join the waitlist|join waitlist|early access|coming soon|be the first|request access|get on the list/.test(z.body)) { s += 5; why.push("waitlist language"); }
    if ($("a, button").length < 15 && $('input[type="email"]').length) { s += 2; why.push("single email capture"); }
    return { score: s, why: why.join(", ") };
  }],
  ["SaaS Landing Page", (z, $) => {
    let s = 0; const why = [];
    if (/start free trial|book a demo|get started free|pricing|per month|\/mo\b/.test(z.body)) { s += 3; why.push("SaaS CTAs/pricing"); }
    if (/integrations|features|how it works|use cases/.test(z.nav)) { s += 1; why.push("SaaS nav"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Personal Portfolio", (z, $) => {
    let s = 0; const why = [];
    if (/i'?m a|hi, i'?m|my work|selected work|about me|get in touch|freelance/.test(z.body)) { s += 4; why.push("first-person portfolio voice"); }
    if (/portfolio/.test(z.title + z.nav)) { s += 2; why.push("portfolio label"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Blog", (z, $) => {
    let s = 0; const why = [];
    if ($("article").length >= 3 || /latest posts|read more|by [a-z]+ on|min read|published/.test(z.body)) { s += 3; why.push("article list"); }
    if (/\/blog|\/posts|\/articles/.test(z.slugs)) { s += 2; why.push("blog routes"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Booking Website", (z, $) => {
    let s = 0; const why = [];
    if (/book now|book a|reserve|reservation|check availability|appointment/.test(z.body)) { s += 4; why.push("booking CTA"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Donation Website", (z, $) => {
    let s = 0; const why = [];
    if (/donate|donation|give now|support our|fundraise/.test(z.body)) { s += 4; why.push("donation CTA"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Agency Website", (z, $) => {
    let s = 0; const why = [];
    if (/our (work|services|clients)|we (help|craft|build|design)|case stud|get in touch|start a project/.test(z.body)) { s += 3; why.push("agency voice"); }
    if (/clients|case studies|services|work/.test(z.nav)) { s += 1; why.push("agency nav"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Corporate Website", (z, $) => {
    let s = 0; const why = [];
    if (/about us|our (company|mission|leadership)|careers|investor|press/.test(z.nav + " " + z.body)) { s += 2; why.push("corporate sections"); }
    return { score: s, why: why.join(", ") };
  }],
  ["Landing Page", (z, $) => {
    let s = 0; const why = [];
    const links = $("nav a, header a").length;
    if (links > 0 && links < 6 && /get started|sign up|request|contact/.test(z.body)) { s += 2; why.push("single-goal landing"); }
    return { score: s, why: why.join(", ") };
  }]
];

export function classifyWebsiteType(zones, category) {
  const allowed = category && TAXONOMY[category] ? TAXONOMY[category].types : null;
  return classifyWebsiteTypeAdvanced(zones, allowed);
}

/* ---- 3. audience (INTENT) ---- */
const AUDIENCE_SIGNALS = {
  "B2B": ["book a demo", "request a demo", "contact sales", "for teams", "for business", "enterprise-grade", "trusted by teams", "roi"],
  "B2C": ["add to cart", "shop now", "for you", "your family", "your home", "your house", "residential", "homeowners", "free shipping", "download the app"],
  "Enterprises": ["enterprise", "fortune 500", "sso", "soc 2", "compliance", "for large teams", "at scale"],
  "Startups": ["for startups", "early-stage", "founders", "ship faster", "backed by"],
  "Developers": ["npm install", "api", "sdk", "documentation", "github", "for developers", "cli", "webhooks"],
  "Investors": ["investors", "investor relations", "returns", "portfolio", "raise capital"],
  "Small Businesses": ["small business", "smb", "for freelancers", "sole trader", "self-employed"],
  "Consumers": ["for you", "everyday use", "at home", "personal use", "shop now", "free shipping"],
  "Retailers": ["retailers", "wholesale", "stockists", "bulk orders"],
  "D2C": ["direct to consumer", "our brand", "d2c", "dtc"],
  "Marketers": ["marketers", "for marketing teams", "campaigns", "growth teams"],
  "Sales Teams": ["sales teams", "for sales", "reps", "pipeline"],
  "Agencies": ["agencies", "for agencies", "white label", "client work"],
  "Patients": ["patients", "your health", "book an appointment", "your care"],
  "Healthcare Professionals": ["clinicians", "providers", "for practices", "physicians"],
  "Clinics": ["clinics", "practices", "for your clinic"],
  "Students": ["students", "learners", "enroll", "for students"],
  "Teachers": ["teachers", "educators", "for schools", "classrooms"],
  "Parents": ["parents", "for your child", "families"],
  "Institutions": ["institutions", "universities", "for campuses"],
  "Buyers": ["buyers", "for buyers", "find your home", "purchase"],
  "Renters": ["renters", "for rent", "tenants"],
  "Property Owners": ["property owners", "landlords", "list your property"],
  "Travellers": ["travellers", "travelers", "plan your trip", "explore"],
  "Guests": ["guests", "your stay", "check in"],
  "Event Attendees": ["attendees", "register for the event", "tickets"],
  "Readers": ["readers", "subscribe to read", "latest stories"],
  "Viewers": ["viewers", "watch now", "stream"],
  "Listeners": ["listeners", "listen now", "tune in"],
  "Gamers": ["gamers", "players", "play now"],
  "Creators": ["creators", "for creators", "monetize your"],
  "Fans": ["fans", "supporters", "follow"],
  "Members": ["members", "become a member", "membership"],
  "Farmers": ["farmers", "growers", "for farms"],
  "Restaurants": ["restaurants", "for restaurants", "menus"],
  "Drivers": ["drivers", "for drivers", "earn by driving"],
  "Fleet Operators": ["fleet operators", "manage your fleet"],
  "Vehicle Buyers": ["car buyers", "buy a car", "find a vehicle"],
  "Families": ["families", "for the whole family"],
  "Homeowners": ["homeowners", "for your home", "your home", "your house", "residential service", "residential pest", "residential bed bug"],
  "Hobbyists": ["hobbyists", "enthusiasts"],
  "Couples": ["couples", "your wedding", "engaged"],
  "Engineers": ["engineers", "for engineering teams"],
  "Governments": ["governments", "public sector", "agencies"],
  "Citizens": ["citizens", "residents", "public services"],
  "Legal Professionals": ["lawyers", "attorneys", "law firms"],
  "Government Agencies": ["agencies", "departments", "public bodies"],
  "Donors": ["donors", "donate", "your gift"],
  "Volunteers": ["volunteers", "get involved", "volunteer"],
  "Communities": ["communities", "community"],
  "Organisations": ["organisations", "organizations", "nonprofits"],
  "Local Consumers": ["in your area", "near you", "local", "service area", "service areas", "call us", "request a quote", "free quote", "locally owned", "family-owned"],
  "Property Managers": ["property managers", "manage properties"],
  "Job Seekers": ["job seekers", "find jobs", "your next role"],
  "Professionals": ["professionals", "for professionals"],
  "Businesses": ["businesses", "for business"],
  "Athletes": ["athletes", "for athletes", "train"],
  "Clubs": ["clubs", "for clubs"],
  "Employers": ["employers", "hire", "post a job"],
  "Recruiters": ["recruiters", "for recruiters", "source candidates"],
  "Employees": ["employees", "your team members"],
  "Designers": ["designers", "for designers"],
  "Beauty Professionals": ["stylists", "salons", "beauty pros"],
  "B2B Companies": ["b2b", "for b2b", "business customers"]
};

export function classifyAudience(zones, category) {
  const hay = [zones.title, zones.meta, zones.headings, zones.nav, zones.body].join(" ");
  const allowed = category && TAXONOMY[category] ? TAXONOMY[category].aud : null;
  const scored = [];
  const pool = allowed || Object.keys(AUDIENCE_SIGNALS);
  for (const aud of pool) {
    const signals = AUDIENCE_SIGNALS[aud] || [];
    let hits = 0; const found = [];
    for (const s of signals) if (hay.includes(s)) { hits++; found.push(s); }
    if (hits) scored.push({ audience: aud, hits, found });
  }
  scored.sort((a, b) => b.hits - a.hits);
  if (!scored.length) {
    // Precision beats completion: a category default is not evidence about
    // the actual audience and therefore must remain unmeasured.
    return { audiences: [], confidence: 0, why: "no signal", found: [] };
  }
  const audiences = scored.slice(0, 3).map((s) => s.audience);
  const confidence = Math.min(0.9, 0.45 + Math.min(scored[0].hits / 4, 0.3) + (scored.length > 1 ? 0.1 : 0));
  return { audiences, confidence, why: scored[0].found.slice(0, 3).join(", "), found: scored[0].found };
}

/* ---- public entry: produce the four envelopes ---- */
export function classifyToEnvelopes(html, pageUrl, { supplementalHtml = [] } = {}) {
  const zones = buildZones(html, supplementalHtml);
  const sig = structuredSignals([html, ...(supplementalHtml || [])].filter(Boolean).join("\n"));
  const cat = classifyCategory(zones, sig.boosts);
  const type = classifyWebsiteType(zones, cat.category);
  const aud = classifyAudience(zones, cat.category);
  const now = new Date().toISOString();

  const catEvidence = [...cat.hits];
  if (sig.evidence.length) catEvidence.unshift("signals: " + sig.evidence.join(", "));

  const categoryVerified = Boolean(cat.category && (sig.boosts[cat.category] || 0) >= 8 && cat.confidence >= 0.82);
  const categoryEnv = cat.category
    ? envelope(cat.category, categoryVerified ? "verified" : cat.confidence >= 0.65 ? "probable" : "inferred", cat.confidence,
        [evidence("taxonomy_zone_scoring", pageUrl, catEvidence.join(", "), now)],
        { runner_up: cat.runnerUp, taxonomy_version: TAXONOMY_VERSION, structured_signals: sig.evidence, documents_analyzed: zones.document_count })
    : envelope(null, "unmeasured", 0, [], { reason: "no category keywords matched" });

  const subEnv = cat.subcategory
    ? envelope(cat.subcategory, cat.confidence >= 0.7 ? "probable" : "inferred", Math.max(0.4, cat.confidence - 0.05),
        [evidence("subcategory_scoring", pageUrl, (cat.subKeywordsHit || []).join(", "), now)],
        { candidates: cat.subCandidates || [], documents_analyzed: zones.document_count })
    : envelope(null, "unmeasured", 0, [], { reason: "no dominant subcategory" });

  const typeEnv = type.type
    ? envelope(type.type, type.confidence >= 0.7 ? "probable" : "inferred", type.confidence,
        [evidence("structural_type_detection", pageUrl, type.why, now)],
        { category_constrained: !type.constrained, note: type.constrained ? "structural signal outside category's typical types" : null, candidates: type.candidates || [] })
    : envelope(null, "unmeasured", 0, [], { reason: "no structural type signal" });

  const audEnv = aud.audiences.length
    ? envelope(aud.audiences, aud.confidence >= 0.7 ? "probable" : "inferred", aud.confidence,
        [evidence("audience_intent_signals", pageUrl, aud.why, now)],
        { primary: aud.audiences[0] })
    : envelope(null, "unmeasured", 0, [], { reason: "no audience intent signals" });

  return {
    dp_category: categoryEnv,
    dp_subcategory: subEnv,
    dp_website_type: typeEnv,
    dp_audience: audEnv,
    _debug: { topScores: Object.entries(cat.scores || {}).sort((a, b) => b[1].score - a[1].score).slice(0, 3).map(([c, s]) => [c, Math.round(s.score)]) }
  };
}
