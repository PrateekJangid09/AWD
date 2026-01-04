import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getWebsiteBySlug, getAllSlugs, getRelatedWebsites } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WebsiteInfoCard from '@/components/WebsiteInfoCard';
import RelatedWebsites from '@/components/RelatedWebsites';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// Generate static params for all websites
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = (params instanceof Promise) ? await params : params;
  const website = await getWebsiteBySlug(p.slug);

  if (!website) {
    return {
      title: 'Website Not Found',
    };
  }

  return {
    title: `${website.name} - AllWebsites.Design`,
    description: website.description,
    openGraph: {
      title: website.name,
      description: website.description,
      images: [website.screenshotUrl],
      type: 'website',
      url: `https://allwebsites.design/sites/${p.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: website.name,
      description: website.description,
      images: [website.screenshotUrl],
    },
    alternates: {
      canonical: `/sites/${p.slug}`,
    },
  };
}

export default async function WebsiteDetailPage({ params }: PageProps) {
  const p = (params instanceof Promise) ? await params : params;
  const website = await getWebsiteBySlug(p.slug);

  if (!website) {
    notFound();
  }

  const relatedWebsites = await getRelatedWebsites(website, 6);
  const displayCategory = website.displayCategory || website.category;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero Section with Large Screenshot */}
        <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }} />
          </div>

          {/* Screenshot */}
          <div className="relative h-full w-full">
            <Image
              src={website.screenshotUrl}
              alt={`${website.name} screenshot`}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </div>

          {/* Back Button Overlay */}
            <div className="absolute top-6 left-0 right-0 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#FFFFFF'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Directory</span>
              </Link>
            </div>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                  {website.name}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed drop-shadow-lg">
                  {website.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: displayCategory, href: `/?category=${encodeURIComponent(displayCategory)}` },
                { label: website.name },
              ]}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Website Info */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <WebsiteInfoCard website={website} />
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Full Page Capture Section */}
                <div id="full-page-capture" className="relative overflow-hidden rounded-3xl p-0 bg-foreground/5 border border-white/20 shadow-soft">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
                    <h2 className="text-2xl font-bold text-foreground">Full Page Capture</h2>
                    {website.fullScreenshotUrl && (
                      <Link href={website.fullScreenshotUrl} target="_blank" className="text-sm text-foreground/80 hover:text-foreground font-semibold">
                        Open original
                      </Link>
                    )}
                  </div>
                  {website.fullScreenshotUrl ? (
                    <div className="max-h-[70vh] overflow-auto">
                      <Image
                        src={website.fullScreenshotUrl}
                        alt={`${website.name} full page capture`}
                        width={1280}
                        height={2000}
                        className="w-full h-auto"
                        unoptimized
                        priority={false}
                      />
                    </div>
                  ) : (
                    <div className="p-6 text-text-secondary">Full page capture not available yet.</div>
                  )}
                </div>
                {/* About Section */}
                <div className="relative overflow-hidden rounded-3xl p-8 bg-foreground/5 border border-white/20 shadow-soft">
                  <h2 className="text-2xl font-bold text-foreground mb-4">About This Website</h2>
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    {website.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-sm text-foreground/60 font-medium mb-1">Category</p>
                      <Link
                        href={`/?category=${encodeURIComponent(displayCategory)}`}
                        className="text-base font-semibold text-foreground hover:opacity-90 transition-colors duration-200"
                      >
                        {displayCategory}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60 font-medium mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-base font-semibold text-foreground">Live</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features/Highlights Section */}
                <div className="relative overflow-hidden rounded-3xl p-8 bg-foreground/5 border border-white/20">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Why Visit This Site?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Modern Design</h3>
                        <p className="text-sm text-foreground/80">Clean and contemporary interface</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Great UX</h3>
                        <p className="text-sm text-foreground/80">Intuitive user experience</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Responsive</h3>
                        <p className="text-sm text-foreground/80">Works on all devices</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Inspiring</h3>
                        <p className="text-sm text-foreground/80">Great design inspiration</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Websites Section */}
        {relatedWebsites.length > 0 && (
          <RelatedWebsites
            websites={relatedWebsites}
            currentCategory={displayCategory}
          />
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Ready to explore more?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Discover 750+ curated landing pages from top companies and creators
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              style={{ background: 'linear-gradient(135deg, #4600BE 0%, #FF3E6C 100%)' }}
            >
              <span>Browse All Websites</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
