'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ActionGridProps {
  title?: string;
  newsTitle?: string;
  newsDesc?: string;
  buttonText?: string;
  submitTitle?: string;
  submitDesc?: string;
  socialTitle?: string;
  socialLinks?: Array<{ label: string; url: string }>;
}

export default function ActionGrid({
  title = '// GET INVOLVED',
  newsTitle = 'Join 140k+ Designers',
  newsDesc = 'Get the best 5 websites of the week delivered to your inbox every Monday morning.',
  buttonText = 'Subscribe',
  submitTitle = 'Submit a Site',
  submitDesc = 'Built something great? We review every submission. Good luck.',
  socialTitle = 'Follow the Feed',
  socialLinks = [
    { label: 'Twitter / X', url: 'https://twitter.com' },
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
    { label: 'YouTube', url: 'https://youtube.com' },
  ],
}: ActionGridProps) {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const borderColor = '#222222';
  const bgColor = '#050505';
  const textColor = '#FFFFFF';
  const accentColor = '#CCFF00';

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // TODO: Replace with actual newsletter API endpoint
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For now, just log it
      console.log('Newsletter subscription:', email);
      setSubmitStatus('success');
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Sora", system-ui, sans-serif',
        color: '#FFFFFF',
        width: '100%',
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '100px 20px',
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          marginBottom: '40px',
          borderBottom: `1px solid ${borderColor}`,
          paddingBottom: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '14px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      <div
        className="action-grid w-full max-w-[1200px]"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: 'auto',
          border: `1px solid ${borderColor}`,
          backgroundColor: borderColor,
          gap: '1px',
        }}
      >
        {/* Desktop: 2-column grid with newsletter spanning 2 rows */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 768px) {
              .action-grid {
                grid-template-columns: 1.2fr 0.8fr !important;
                grid-template-rows: auto auto !important;
              }
              .news-cell {
                grid-row: 1 / span 2 !important;
              }
            }
          `
        }} />
        {/* 1. Newsletter (Left - spans 2 rows) */}
        <div
          className="news-cell flex flex-col justify-center gap-6 p-12 md:p-[60px]"
          style={{
            backgroundColor: bgColor,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: textColor,
                letterSpacing: '-0.5px',
                margin: '0 0 16px 0',
              }}
            >
              {newsTitle}
            </h3>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '400px',
                margin: 0,
              }}
            >
              {newsDesc}
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit}>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${borderColor}`,
                  color: '#fff',
                  fontSize: '16px',
                  borderRadius: '4px',
                  flex: 1,
                  minWidth: '200px',
                  outline: 'none',
                }}
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '16px 32px',
                  backgroundColor: accentColor,
                  color: bgColor,
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                whileHover={{ opacity: isSubmitting ? 0.7 : 0.9 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? '...' : buttonText}
              </motion.button>
            </div>
          </form>

          {submitStatus === 'success' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '13px',
                color: accentColor,
              }}
            >
              ✓ Subscribed! Check your email.
            </motion.span>
          )}

          {submitStatus === 'error' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '13px',
                color: '#EF4444',
              }}
            >
              Something went wrong. Please try again.
            </motion.span>
          )}

          {submitStatus === 'idle' && (
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              No spam. Unsubscribe anytime.
            </span>
          )}
        </div>

        {/* 2. Submit (Top Right) */}
        <Link href="#submit" style={{ textDecoration: 'none' }}>
          <motion.div
            className="submit-cell flex flex-col justify-center gap-4 p-10 md:p-[40px]"
            style={{
              backgroundColor: bgColor,
              cursor: 'pointer',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: textColor,
                  letterSpacing: '-0.5px',
                  margin: 0,
                }}
              >
                {submitTitle}
              </h3>
              <span style={{ fontSize: '24px', color: accentColor }}>↗</span>
            </div>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: 0,
              }}
            >
              {submitDesc}
            </p>
          </motion.div>
        </Link>

        {/* 3. Socials (Bottom Right) */}
        <div
          className="social-cell flex flex-col justify-center gap-6 p-10 md:p-[40px]"
          style={{
            backgroundColor: bgColor,
          }}
        >
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: textColor,
              letterSpacing: '-0.5px',
              margin: '0 0 8px 0',
            }}
          >
            {socialTitle}
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {socialLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: textColor,
                  textDecoration: 'none',
                }}
                whileHover={{ x: 4, color: accentColor }}
              >
                <span>{link.label}</span>
                <span style={{ fontSize: '12px', opacity: 0.5 }}>FOLLOW</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
