/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Traditional Betting Platform Colors
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Main green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        betting: {
          // Win/Success
          win: '#22c55e',
          'win-dark': '#16a34a',
          
          // Loss/Danger
          loss: '#ef4444',
          'loss-dark': '#dc2626',
          
          // Hot/Live
          hot: '#ea580c',
          'hot-light': '#fb923c',
          
          // Premium/VIP
          premium: '#fbbf24',
          'premium-dark': '#f59e0b',
          
          // Neutral
          neutral: '#64748b',
          'neutral-light': '#94a3b8',
        },
        // Team Colors
        team: {
          home: '#3b82f6',    // Blue
          away: '#ef4444',     // Red
          draw: '#64748b',     // Gray
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-betting': 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        'gradient-hot': 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      boxShadow: {
        'betting': '0 4px 14px 0 rgba(34, 197, 94, 0.2)',
        'betting-lg': '0 8px 24px 0 rgba(34, 197, 94, 0.3)',
        'hot': '0 4px 14px 0 rgba(234, 88, 12, 0.3)',
        'card-hover': '0 12px 32px 0 rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
