import type { Metadata } from "next";
import { Geist, Sora } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "AllWebsites.Design - Design Inspiration & Resources",
  description: "A curated directory of 800+ landing pages from SaaS, Fintech, E-commerce, and more. Find inspiration for your next project.",
  keywords: ["landing pages", "design inspiration", "SaaS", "Fintech", "E-commerce", "web design"],
  metadataBase: new URL("https://allwebsites.design"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "Rya537NqhNiUvRDcCE4XNLwGj4cY6TR7JfbPBmkRttU",
  },
  icons: {
    icon: "/Vector.png",
    shortcut: "/Vector.png",
    apple: "/Vector.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.className} ${geist.variable} ${sora.variable}`}
        style={{ backgroundColor: '#FAFAFA' }}
      >
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3ERMWX5HNN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3ERMWX5HNN');
          `}
        </Script>
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
        <SpeedInsights />
      </body>
    </html>
  );
}
