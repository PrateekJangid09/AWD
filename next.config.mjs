/** @type {import('next').NextConfig} */
const longCache = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      { source: "/sites/:path*", headers: longCache },
      { source: "/tools/previews/:path*", headers: longCache },
      { source: "/logo.png", headers: longCache },
      { source: "/logo-full.png", headers: longCache },
      { source: "/og.jpg", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
    ];
  },
  async redirects() {
    return [
      // Legal-page renames only. Website records live permanently at /archive/<slug>.
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/refunds", destination: "/refund-policy", permanent: true },
      { source: "/pay", destination: "/checkout", permanent: false },
      { source: "/cookies", destination: "/cookie-preference", permanent: true },
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
