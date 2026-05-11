import { createContext, useContext, useState, useEffect } from 'react'
import { PALETAS, PALETA_IDS, aplicarPaleta } from '../lib/paletas'

const ThemeContext = createContext()

const PALETA_STORAGE = 'vitalis-paleta'

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sete-ecos-theme')
      if (saved) return saved === 'dark'
    }
    return false
  })

  const [paleta, setPaletaState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PALETA_STORAGE)
      if (saved && PALETA_IDS.includes(saved)) return saved
    }
    return 'classica'
  })

  // Sync with system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('sete-ecos-theme')) {
        setIsDark(e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Apply dark class
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    localStorage.setItem('sete-ecos-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Apply paleta (override CSS vars on :root)
  useEffect(() => {
    aplicarPaleta(paleta, isDark)
    localStorage.setItem(PALETA_STORAGE, paleta)
  }, [paleta, isDark])

  const toggleTheme = () => setIsDark(prev => !prev)
  const setPaleta = (id) => {
    if (PALETA_IDS.includes(id)) setPaletaState(id)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, paleta, setPaleta, paletas: PALETAS, paletaIds: PALETA_IDS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}

/**
 * DarkModeToggle — Accessible toggle switch for dark/light mode
 * WCAG: role="switch", aria-checked, keyboard accessible
 */
export function DarkModeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
        isDark ? 'bg-indigo-600' : 'bg-gray-300'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        <span className="text-sm">{isDark ? '🌙' : '☀️'}</span>
      </span>
    </button>
  )
}

export default ThemeContext
