import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  // Temporarily disabled to fix React module resolution issue
  // experimental: {
  //   optimizePackageImports: ['@/components', '@/lib'],
  // },

  // Generate ETags for caching
  generateEtags: true,

  // Compress responses
  compress: true,

  // Power optimizations
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
