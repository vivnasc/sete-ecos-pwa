/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vitalis colors
        'vitalis': {
          50: '#F5F2ED',
          100: '#E8E2D9',
          200: '#D4C9B9',
          300: '#9CAF88',
          400: '#7C8B6F',
          500: '#6B7A5D',
          600: '#5A6B4D',
          700: '#4A4035',
          800: '#6B5C4C',
          900: '#4A4035',
        },
      },
      fontFamily: {
        'cormorant': ['Cormorant Garamond', 'serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
