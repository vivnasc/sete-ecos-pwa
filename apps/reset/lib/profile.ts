'use client'

export type Profile = {
  nome: string
  sexo: 'F' | 'M' | 'O'
  pesoInicial: number | null
  cinturaInicial: number | null
  acordaTipico: string // HH:MM
  deitaTipico: string // HH:MM
  treinoPreferido: 'manhã' | 'tarde' | 'noite' | 'flexível'
  gatilhosAlcool: string[]
  notificacoesAtivas: boolean
  onboardingCompleto: boolean
  inicioPlano: string // ISO date
  duracaoPlano: number
  syncSupabase: boolean
  emailSync: string
}

const KEY = 'fenixfit:profile'

const DEFAULT_PROFILE: Profile = {
  nome: 'Vivianne',
  sexo: 'F',
  pesoInicial: null,
  cinturaInicial: null,
  acordaTipico: '06:30',
  deitaTipico: '22:30',
  treinoPreferido: 'manhã',
  gatilhosAlcool: [],
  notificacoesAtivas: false,
  onboardingCompleto: false,
  inicioPlano: '2026-05-11',
  duracaoPlano: 60,
  syncSupabase: false,
  emailSync: ''
}

export function getProfile(): Profile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PROFILE
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(p: Partial<Profile>): Profile {
  const novo = { ...getProfile(), ...p }
  localStorage.setItem(KEY, JSON.stringify(novo))
  window.dispatchEvent(new CustomEvent('fenixfit:profile', { detail: novo }))
  return novo
}

export function resetProfile(): void {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('fenixfit:profile', { detail: DEFAULT_PROFILE }))
}
