/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Sophisticated color palette inspired by marbled textures
        'deep-pink': '#DD1E52',
        'warm-beige': '#E8D8CC', 
        'dark-teal': '#004F3B',
        'light-gray': '#ADADAD',
        // Semantic color mappings
        primary: '#004F3B', // Dark teal
        secondary: '#DD1E52', // Deep pink
        accent: '#E8D8CC', // Warm beige
        neutral: '#ADADAD', // Light gray
        // Text colors
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'text-muted': '#8A8A8A',
      },
      fontFamily: {
        'sans': ['var(--font-sora)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-geist)', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-geist)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 300ms ease-in',
        slideUp: 'slideUp 200ms ease-out',
        scaleIn: 'scaleIn 150ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'colored': '0 4px 16px rgba(221, 30, 82, 0.2)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [],
};

