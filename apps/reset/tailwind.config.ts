import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        creme: '#F6F1E8',
        'creme-claro': '#FBF7EE',
        'creme-escuro': '#EDE5D2',
        ouro: '#B8924A',
        'ouro-claro': '#C9A961',
        'ouro-suave': '#D8B97A',
        oliva: '#6B7445',
        'oliva-claro': '#8A9560',
        terracota: '#9B5D3E',
        tinta: '#1F1814',
        'tinta-claro': '#2C231D',
        graphite: '#3A3128',
        cinza: '#7A6E5F',
        'cinza-claro': '#A89C8C',
        castanho: '#1F1814'
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontVariationSettings: {
        soft: '"opsz" 24, "SOFT" 100',
        editorial: '"opsz" 144, "SOFT" 30'
      },
      letterSpacing: {
        editorial: '-0.02em',
        cap: '0.18em',
        capWide: '0.24em'
      },
      boxShadow: {
        hair: '0 0 0 1px rgba(184, 146, 74, 0.18)',
        'hair-strong': '0 0 0 1px rgba(184, 146, 74, 0.32)',
        soft: '0 1px 2px rgba(31, 24, 20, 0.04), 0 4px 16px rgba(31, 24, 20, 0.04)',
        ink: '0 8px 32px rgba(31, 24, 20, 0.12)'
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        breathe: 'breathe 6s ease-in-out infinite'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        breathe: { '0%, 100%': { opacity: '0.5' }, '50%': { opacity: '1' } }
      }
    }
  },
  plugins: []
}

export default config
