import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: 'AllWebsites.Design — Website Design Inspiration',
  description: 'A curated archive of website design inspiration across SaaS, AI, agencies, portfolios, commerce, and more.',
  metadataBase: new URL(SITE_URL), alternates: { canonical: '/' },
  verification: { google: 'Rya537NqhNiUvRDcCE4XNLwGj4cY6TR7JfbPBmkRttU' },
  icons: { icon: '/Vector.png', shortcut: '/Vector.png', apple: '/Vector.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ backgroundColor: '#FAFAFA' }}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-3ERMWX5HNN" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-3ERMWX5HNN');`}</Script>
        <div id="app-root" className="transition-colors duration-300">{children}</div>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('theme-light')}catch(e){}})()` }} />
        <Analytics /><SpeedInsights />
      </body>
    </html>
  );
}
