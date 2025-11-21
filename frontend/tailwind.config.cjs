/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        cyber: {
          black: '#0a0a0a',
          dark: '#121212',
          gray: '#1e1e1e',
          primary: '#00ff9d', // Neon Green
          secondary: '#00d2ff', // Cyber Blue
          accent: '#ff00ff', // Neon Pink
          danger: '#ff3333',
          warning: '#ffcc00',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
