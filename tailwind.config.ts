import rtl from 'tailwindcss-rtl';
import animate from 'tailwindcss-animate';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          50: '#eef7ff',
          100: '#d6ebff',
          200: '#add6ff',
          300: '#7bbcff',
          400: '#4a9dff',
          500: '#1f7fff',
          600: '#1765d6',
          700: '#124fac',
          800: '#0d3b82',
          900: '#0a2c63',
        },
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 8px 24px -20px rgb(0 0 0 / 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [rtl, animate],
};
