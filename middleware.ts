import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  if (host.startsWith("www.") && !host.includes("localhost")) {
    const url = request.nextUrl.clone();
    url.host = host.replace(/^www\./i, "");
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  // Only page routes need the apex redirect. The archive serves 300+ generated
  // screenshots straight from /sites/, and running an edge function on each one
  // just to inspect a Host header costs an invocation and adds latency to every
  // image on the page. Static assets are skipped by path and by extension.
  matcher: [
    "/((?!_next/static|_next/image|sites/|tools/previews/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|txt|xml|json|woff|woff2|ttf|otf|map)$).*)",
  ],
};
