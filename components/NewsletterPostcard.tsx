'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

interface NewsletterPostcardProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  accentColor?: string;
}

export default function NewsletterPostcard({
  title = 'The Monday Dispatch',
  subtitle = 'A weekly collection of the finest pixels on the internet. No spam, just raw design inspiration.',
  placeholder = 'your@email.com',
  buttonText = 'Subscribe',
  accentColor = '#FF4D00',
}: NewsletterPostcardProps) {
  const [focused, setFocused] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription here
    console.log('Subscribe:', email);
    // You can add your newsletter API call here
  };

  return (
    <section
      style={{
        width: '100%',
        backgroundColor: '#F5F5F5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '120px 20px',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(#D1D1D1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* THE POSTCARD CONTAINER */}
      <motion.div
        initial={{ rotate: 1, y: 20, opacity: 0 }}
        whileInView={{ rotate: -1, y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '700px',
          backgroundColor: '#FFFFFF',
          aspectRatio: '1.6/1',
          minHeight: '400px',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15)',
          position: 'relative',
          display: 'flex',
          padding: '40px',
          border: '1px solid #E5E5E5',
        }}
      >
        {/* --- DECORATION: The Divider Line --- */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            bottom: '40px',
            left: '50%',
            width: '2px',
            backgroundColor: '#F0F0F0',
          }}
        />

        {/* --- LEFT SIDE: The Pitch --- */}
        <div
          style={{
            flex: 1,
            paddingRight: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(24px, 4vw, 36px)',
              color: '#111',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#666',
            }}
          >
            {subtitle}
          </p>

          {/* Handwriting Arrow pointing to input */}
          <div
            style={{
              marginTop: 'auto',
              color: accentColor,
              fontWeight: 700,
              fontFamily: 'cursive',
              transform: 'rotate(-5deg)',
            }}
          >
            Join the club ⤵
          </div>
        </div>

        {/* --- RIGHT SIDE: The Form --- */}
        <div
          style={{
            flex: 1,
            paddingLeft: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* The Stamp (Top Right) */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '80px',
              height: '90px',
              backgroundColor: '#F5F5F5',
              border: '4px dotted #DDD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: accentColor,
                opacity: 0.2,
                borderRadius: '50%',
              }}
            />
          </div>

          {/* The "Postmark" (SVG) */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '60px',
              width: '100px',
              height: '100px',
              opacity: 0.4,
              pointerEvents: 'none',
              transform: 'rotate(-15deg)',
            }}
          >
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#000"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M10,50 L90,50 M10,60 L90,60 M10,40 L90,40"
                stroke="#000"
                strokeWidth="2"
              />
              <text
                x="50"
                y="55"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                AIR MAIL
              </text>
            </svg>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* INPUT FIELD (The "Line") */}
            <div style={{ marginTop: '60px' }}>
              <input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: focused
                    ? `2px solid ${accentColor}`
                    : '2px solid #DDD',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  padding: '12px 0',
                  outline: 'none',
                  background: 'transparent',
                  color: '#111',
                  transition: 'border-color 0.3s',
                }}
              />
            </div>

            {/* SUBMIT BUTTON (Sticker) */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: '30px',
                padding: '12px 24px',
                backgroundColor: '#111',
                color: '#FFF',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                width: 'fit-content',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
              }}
            >
              {buttonText}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
