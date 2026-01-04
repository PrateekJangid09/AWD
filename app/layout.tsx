import type { Metadata } from "next";
import { Geist, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "AllWebsites.Design - Design Inspiration & Resources",
  description: "A curated directory of 800+ landing pages from SaaS, Fintech, E-commerce, and more. Find inspiration for your next project.",
  keywords: ["landing pages", "design inspiration", "SaaS", "Fintech", "E-commerce", "web design"],
  metadataBase: new URL("https://allwebsites.design"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.className} ${geist.variable} ${sora.variable}`}>
        {/* theme container; toggled by Header */}
        <div id="app-root" className="transition-colors duration-300">{children}</div>
        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            try {
              var stored = localStorage.getItem('theme');
              var root = document.documentElement; // <html>
              if (stored === 'light') { root.classList.add('theme-light'); }
            } catch(e) {}
          })();
        `}} />
        <Analytics />
      </body>
    </html>
  );
}
