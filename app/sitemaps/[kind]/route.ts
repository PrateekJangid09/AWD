import { notFound } from "next/navigation";
import {
  SITEMAP_KINDS,
  sitemapEntries,
  sitemapUrlsetXml,
  type SitemapKind,
} from "@/lib/sitemaps";

export function generateStaticParams() {
  return SITEMAP_KINDS.map((kind) => ({ kind: `${kind}.xml` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  const name = kind.replace(/\.xml$/, "") as SitemapKind;
  if (!SITEMAP_KINDS.includes(name)) notFound();
  return new Response(sitemapUrlsetXml(sitemapEntries(name)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
