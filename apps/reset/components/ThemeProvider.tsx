'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void; effective: 'light' | 'dark' }>({
  theme: 'system',
  setTheme: () => {},
  effective: 'light'
})

export function useTheme() {
  return useContext(ThemeContext)
}

function resolveEffective(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [effective, setEffective] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('fenixfit:theme') as Theme | null) ?? 'system'
    setThemeState(saved)
    setEffective(resolveEffective(saved))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const eff = resolveEffective(theme)
    setEffective(eff)
    document.documentElement.classList.toggle('dark', eff === 'dark')
    localStorage.setItem('fenixfit:theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', eff === 'dark' ? '#1a1410' : '#F8F4EC')
  }, [theme, mounted])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setEffective(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return <ThemeContext.Provider value={{ theme, setTheme, effective }}>{children}</ThemeContext.Provider>
}
