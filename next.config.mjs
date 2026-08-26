/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
