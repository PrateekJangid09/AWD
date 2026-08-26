import test from "node:test";
import assert from "node:assert/strict";
import { classifyToEnvelopes } from "../src/pipeline/taxonomy.js";

const CASES = [
  ["Technology & SaaS", "Cloud workflow software", "A SaaS automation platform with API integrations, dashboards and a free trial for software teams."],
  ["Finance", "Modern business banking", "A fintech bank account with payments, lending, credit and financial services for companies."],
  ["Ecommerce & Retail", "Shop everyday essentials", "Browse our online store, add products to cart, checkout securely and get free shipping."],
  ["Agency & Studio", "Independent brand design studio", "Our creative agency provides branding, visual design and digital services. View client case studies."],
  ["Portfolio", "Product designer portfolio", "Selected work, design projects and case studies from an independent product designer available for freelance work."],
  ["Business & Corporate", "Global logistics company", "Our company provides enterprise supply-chain, warehousing and corporate logistics solutions worldwide."],
  ["Marketing & Sales", "SEO and growth marketing", "A marketing platform for campaigns, lead generation, conversions, search rankings and sales outreach."],
  ["Healthcare & Wellness", "Patient-centred medical care", "Healthcare services from physicians, clinics and wellness professionals. Book an appointment for treatment."],
  ["Education", "Online learning for students", "Enroll in courses with teachers, lessons, curriculum and educational certificates."],
  ["Real Estate & Construction", "Homes and property listings", "Search real estate, apartments and properties for sale or rent with local agents and builders."],
  ["Travel & Hospitality", "Plan and book your trip", "Discover hotels, destinations, flights and travel experiences. Reserve your stay."],
  ["Media & Entertainment", "Stories, films and podcasts", "Watch videos, listen to podcast episodes and read the latest entertainment news."],
  ["Creator & Community", "Community for independent creators", "Creators can publish, grow an audience, join members and monetize newsletters."],
  ["Food & Agriculture", "Farm-to-table food platform", "Recipes, agriculture, farmers, food delivery and restaurant produce from local farms."],
  ["Fashion & Beauty", "Contemporary fashion and skincare", "Shop clothing collections, beauty products, cosmetics and sustainable apparel."],
  ["Automotive & Mobility", "Electric vehicles and mobility", "Explore cars, EV charging, transportation, fleet and automotive services. Book a test drive."],
  ["Home & Lifestyle", "Furniture for modern homes", "Interior design, home decor, furniture, gardening and lifestyle products for homeowners."],
  ["Industrial & Energy", "Renewable energy infrastructure", "Industrial manufacturing, solar energy, engineering, machinery and clean-power solutions."],
  ["Legal & Government", "Legal services and public policy", "Lawyers provide legal advice across practice areas, regulation and government compliance."],
  ["Nonprofit & Social Impact", "Support our social mission", "A nonprofit charity creating social impact through donations, volunteers and community programs."],
  ["Local Services", "Local plumbing and pest control", "Book trusted plumbers, electricians, cleaners and pest-control professionals near you."],
  ["Directories & Discovery", "Discover the best tools", "Browse a curated directory, compare listings and reviews, and submit a website."],
  ["Sports & Recreation", "Live sports scores", "Follow teams, fixtures, matches, athletes, league standings and outdoor recreation."],
  ["Telecommunications", "Connectivity for everyone", "Telecom broadband, mobile network, internet, fibre and wireless communication services."],
  ["Recruitment & HR", "Recruit and manage talent", "HR software for hiring, job boards, candidates, payroll, employee benefits and recruitment."],
  ["Design & Creative Tools", "Collaborative design editor", "A UI and graphic design tool for prototyping, vector editing, templates and creative teams."]
];

for (const [expected, title, copy] of CASES) {
  test(`benchmark category: ${expected}`, () => {
    const html = `<html><head><title>${title}</title><meta name="description" content="${copy}"></head><body><h1>${title}</h1><p>${copy}</p></body></html>`;
    const result = classifyToEnvelopes(html, "https://benchmark.example/");
    assert.equal(result.dp_category.value, expected, JSON.stringify(result._debug.topScores));
  });
}
