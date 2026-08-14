import type { Config } from "tailwindcss"

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': { 100: '#E8F5E9', 300: '#A5D6A7', 500: '#4CAF50', 700: '#2E7D32', 900: '#1B5E20' },
        'brand-forest': { 500: '#0b2118', 600: '#081711', 700: '#050c09' }, // Deep luxury green
        'brand-pearl': '#f7f6f2', // Soft, luxurious off-white background
        'brand-gold': '#c9a76a',  // Luxury accent
        'brand-dark': '#111111',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config

export default config
