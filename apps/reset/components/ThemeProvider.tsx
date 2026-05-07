'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { aplicarPaleta, type PaletaId } from '@/lib/palettes'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  effective: 'light' | 'dark'
  paleta: PaletaId
  setPaleta: (p: PaletaId) => void
}>({
  theme: 'system',
  setTheme: () => {},
  effective: 'light',
  paleta: 'classica',
  setPaleta: () => {}
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
  const [paleta, setPaletaState] = useState<PaletaId>('classica')
  const [effective, setEffective] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem('fenixfit:theme') as Theme | null) ?? 'system'
    const savedPaleta = (localStorage.getItem('fenixfit:paleta') as PaletaId | null) ?? 'classica'
    setThemeState(savedTheme)
    setPaletaState(savedPaleta)
    const eff = resolveEffective(savedTheme)
    setEffective(eff)
    aplicarPaleta(savedPaleta, eff === 'dark')
    document.documentElement.classList.toggle('dark', eff === 'dark')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const eff = resolveEffective(theme)
    setEffective(eff)
    document.documentElement.classList.toggle('dark', eff === 'dark')
    aplicarPaleta(paleta, eff === 'dark')
    localStorage.setItem('fenixfit:theme', theme)
    localStorage.setItem('fenixfit:paleta', paleta)
  }, [theme, paleta, mounted])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const eff = mq.matches ? 'dark' : 'light'
      setEffective(eff)
      aplicarPaleta(paleta, eff === 'dark')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme, paleta])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, effective, paleta, setPaleta: setPaletaState }}>
      {children}
    </ThemeContext.Provider>
  )
}
