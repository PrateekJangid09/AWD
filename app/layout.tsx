import type { Metadata } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ConsentScripts from "@/components/ConsentScripts";
import JsonLd from "@/components/JsonLd";
import MotionProvider from "@/components/motion/MotionProvider";
import WaveField from "@/components/motion/WaveField";
import { liveCategories } from "@/lib/canonical";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  globalGraph,
} from "@/lib/seo";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const hand = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
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

// Runs before first paint so the page never flashes the wrong theme.
// Saved choice wins, then the OS preference, then light.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('awd-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navCategories = liveCategories().filter((category) => category.count > 0);
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${hand.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <meta name="theme-color" content="#F7F3EC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111210" media="(prefers-color-scheme: dark)" />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="relative min-h-screen text-ink antialiased">
        <JsonLd data={globalGraph()} />
        <ConsentScripts />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[6px] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to content
        </a>
        <MotionProvider>
          <WaveField />
          <Nav categories={navCategories} />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </MotionProvider>
      </body>
    </html>
  );
}
