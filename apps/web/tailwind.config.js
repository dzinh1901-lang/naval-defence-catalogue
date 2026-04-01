/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Engineering workspace dark palette
        canvas: {
          DEFAULT: '#0b0d11',
          surface: '#13151c',
          raised: '#1a1d27',
          overlay: '#20243a',
        },
        accent: {
          DEFAULT: '#3b82f6',   // primary blue
          hover: '#2563eb',
          muted: '#1e3a5f',
          dim: '#172d4a',
        },
        naval: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
          indigo: '#6366f1',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#22c55e',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
          dim: '#475569',
        },
        surface: {
          0: '#0b0d11',
          1: '#13151c',
          2: '#1a1d27',
          3: '#20243a',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
