import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Answer engines can only cite what they are allowed to fetch, so the
// search-and-cite crawlers are named explicitly rather than left to inherit
// the wildcard rule.
const ANSWER_ENGINE_BOTS = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "meta-externalagent",
  "Amazonbot",
  "YouBot",
];

const PRIVATE_PATHS = ["/access-denied", "/maintenance", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      ...ANSWER_ENGINE_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
