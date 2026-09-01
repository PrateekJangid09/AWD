import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import AdSense from "@/components/AdSense";
import JsonLd from "@/components/JsonLd";
import { GtmNoscript, GTM_HEAD_SCRIPT, GA_HEAD_SCRIPT, GA_ID } from "@/components/Tracking";
import { liveCategories } from "@/lib/canonical";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  globalGraph,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  icons: { icon: "/logo.png" },
  other: {
    "google-adsense-account": "ca-pub-9336436557815535",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navCategories = liveCategories().filter((category) => category.count > 0);
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: GTM_HEAD_SCRIPT }} />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: GA_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <GtmNoscript />
        <JsonLd data={globalGraph()} />
        <AdSense />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-white"
        >
          Skip to content
        </a>
        <Nav categories={navCategories} />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
