import type { Metadata } from "next";
import { Anton, Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.allwebsites.design"),
  title: {
    default: "AllWebsites.Design — The Website Design Research Archive",
    template: "%s — AllWebsites.Design",
  },
  description:
    "Explore real websites by industry, style, color, typography, and technology. 5,896 curated, cleaned and deduplicated design references for designers, developers and founders.",
  keywords: [
    "website design inspiration",
    "web design archive",
    "design references",
    "UI inspiration",
    "website gallery",
  ],
  openGraph: {
    title: "AllWebsites.Design — The Website Design Research Archive",
    description:
      "Discover, compare and study how real websites are designed. Structured design intelligence, not just screenshots.",
    url: "https://www.allwebsites.design",
    siteName: "AllWebsites.Design",
    type: "website",
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${inter.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
