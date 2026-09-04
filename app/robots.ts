import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Answer engines can only cite what they are allowed to fetch, so the
// search-and-cite crawlers are named explicitly rather than left to inherit
// the wildcard rule.
//
// Naming a bot opts it out of `User-Agent: *` entirely: a crawler obeys its own
// group and ignores the wildcard. Every group below is therefore generated from
// the same PRIVATE_PATHS list, so a path added there still applies to all of
// them. Never hand-edit a single group.
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
    // No `host` directive: it was only ever honoured by Yandex, and the apex
    // host is already enforced by the www redirect in middleware.ts.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
