import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        creme: '#F8F4EC',
        'creme-escuro': '#EFE7D6',
        ouro: '#C9A961',
        'ouro-claro': '#D9BD7A',
        oliva: '#7A8450',
        'oliva-claro': '#9CA76E',
        terracota: '#B8704A',
        castanho: '#3D2817',
        'castanho-suave': '#5A3D2A',
        cinza: '#8a7a6a'
      },
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'breathe': 'breathe 4s ease-in-out infinite'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        breathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}

export default config
