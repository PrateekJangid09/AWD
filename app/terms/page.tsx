import type { Metadata } from 'next';
import Header from '@/components/HeaderFramer';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - AllWebsites.Design',
  description: 'Terms of Service for AllWebsites.Design. Read our terms and conditions for using our website.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
            <p className="text-sm text-foreground/60">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using AllWebsites.Design (&quot;the Website&quot;), you accept and agree to be bound
                by the terms and provision of this agreement. If you do not agree to abide by the above,
                please do not use this service.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily access the materials on AllWebsites.Design for personal,
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title,
                and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                3. Disclaimer
              </h2>
              <p>
                The materials on AllWebsites.Design are provided on an &quot;as is&quot; basis. AllWebsites.Design
                makes no warranties, expressed or implied, and hereby disclaims and negates all other
                warranties including, without limitation, implied warranties or conditions of merchantability,
                fitness for a particular purpose, or non-infringement of intellectual property or other
                violation of rights.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                4. Limitations
              </h2>
              <p>
                In no event shall AllWebsites.Design or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business interruption)
                arising out of the use or inability to use the materials on AllWebsites.Design, even if
                AllWebsites.Design or an authorized representative has been notified orally or in writing
                of the possibility of such damage.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                5. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on AllWebsites.Design could include technical, typographical, or
                photographic errors. AllWebsites.Design does not warrant that any of the materials on its
                website are accurate, complete, or current. AllWebsites.Design may make changes to the
                materials contained on its website at any time without notice.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                6. Links
              </h2>
              <p>
                AllWebsites.Design has not reviewed all of the sites linked to our website and is not
                responsible for the contents of any such linked site. The inclusion of any link does not
                imply endorsement by AllWebsites.Design of the site. Use of any such linked website is
                at the user&apos;s own risk.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                7. Modifications
              </h2>
              <p>
                AllWebsites.Design may revise these terms of service for its website at any time without
                notice. By using this website you are agreeing to be bound by the then current version
                of these terms of service.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                8. Governing Law
              </h2>
              <p>
                These terms and conditions are governed by and construed in accordance with applicable
                laws and you irrevocably submit to the exclusive jurisdiction of the courts in that
                location.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                9. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through our
                website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
