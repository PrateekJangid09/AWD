import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizePackageImports: ["framer-motion", "fuse.js"],
  },

  generateEtags: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["puppeteer", "puppeteer-core", "canvas"],

  async redirects() {
    return [
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/cookies", destination: "/cookie-preference", permanent: true },
      { source: "/c/e-commerce", destination: "/c/ecommerce", permanent: true },
      { source: "/sites/:slug", destination: "/archive/:slug", permanent: true },
    ];
  },

  async rewrites() {
    return [
      { source: "/tools/colorhyme", destination: "/tools/colorhyme.html" },
      { source: "/tools/mockupalettes", destination: "/tools/mockupalettes.html" },
      { source: "/tools/chromary", destination: "/tools/chromary.html" },
      { source: "/tools/truegradient", destination: "/tools/truegradient/index.html" },
      { source: "/tools/webpalette", destination: "/tools/webpalette/index.html" },
    ];
  },
};

export default nextConfig;
