/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cafe-brown': {
          50: '#FAF6F1',
          100: '#EBE0D1',
          200: '#D4B79B',
          300: '#B69072',
          400: '#8C6851',
          500: '#634B3B',
          600: '#4A382C',
          700: '#32251D',
          800: '#1A130F',
          900: '#0D0907',
        },
      },
    },
  },
  plugins: [],
} 