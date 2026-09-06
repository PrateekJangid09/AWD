import { sitemapEntries, sitemapUrlsetXml } from "@/lib/sitemaps";

export function GET() {
  return new Response(sitemapUrlsetXml(sitemapEntries("palettes")), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
