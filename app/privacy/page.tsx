import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - AllWebsites.Design',
  description: 'Privacy Policy for AllWebsites.Design. Learn how we collect, use, and protect your data.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
            <p className="text-sm text-foreground/60">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                1. Introduction
              </h2>
              <p>
                AllWebsites.Design (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                2.1 Automatically Collected Information
              </h3>
              <p>
                When you visit our website, we may automatically collect certain information about your
                device, including information about your web browser, IP address, time zone, and some
                of the cookies that are installed on your device.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                2.2 Analytics
              </h3>
              <p>
                We use analytics services (such as Vercel Analytics) to collect information about how
                visitors interact with our website. This may include pages visited, time spent on pages,
                and other usage statistics.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Analyze usage patterns and trends</li>
                <li>Ensure website security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                4. Cookies and Tracking Technologies
              </h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and
                hold certain information. You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                5. Third-Party Services
              </h2>
              <p>
                Our website may contain links to third-party websites or services. We are not responsible
                for the privacy practices of these third parties. We encourage you to read their privacy
                policies.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                6. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information.
                However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                7. Your Rights
              </h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information,
                including the right to access, correct, or delete your data.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                9. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
