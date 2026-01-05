import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - AllWebsites.Design',
  description: 'Learn about AllWebsites.Design, a curated directory of 954+ website designs for designers and developers seeking inspiration.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
            About AllWebsites.Design
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
            <p>
              AllWebsites.Design is a curated directory of 954+ website designs from top companies
              across various industries. Our mission is to provide designers and developers with a
              comprehensive resource for design inspiration and best practices.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
              What We Do
            </h2>
            <p>
              We carefully curate and catalog landing pages, hero sections, and website designs
              from SaaS companies, agencies, fintech platforms, e-commerce sites, and more. Each
              website is categorized and tagged to help you quickly find inspiration for your next
              project.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
              Our Categories
            </h2>
            <p>
              We organize websites into 13+ categories including SaaS, AI, Agency/Studio, Portfolio,
              Fintech, E-commerce, Developer Tools, Crypto/Web3, Health, Education, Templates, and more.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
              For Designers & Developers
            </h2>
            <p>
              Whether you're building a new landing page, redesigning an existing site, or simply
              looking for inspiration, AllWebsites.Design helps you discover the latest trends and
              best practices in web design.
            </p>
            
            <div className="mt-12 pt-8 border-t border-foreground/20">
              <p className="text-foreground/60 text-sm">
                Have questions or suggestions?{' '}
                <Link href="/" className="text-foreground hover:underline">
                  Visit our homepage
                </Link>{' '}
                to explore our collection.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
