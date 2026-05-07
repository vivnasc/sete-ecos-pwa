'use client'

import { ANCORAS_DEFAULT_IDS, ANCORAS_POOL, type Ancora } from './data'

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
  ancorasActivas: string[]
  ancorasCustom: Ancora[]
}

const KEY = 'fenixfit:profile'

const DEFAULT_PROFILE: Profile = {
  nome: '',
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
  emailSync: '',
  ancorasActivas: ANCORAS_DEFAULT_IDS,
  ancorasCustom: []
}

// Devolve as âncoras realmente activas (combina pool + custom, filtra por IDs activos)
export function getAncorasActivas(): Ancora[] {
  const p = getProfile()
  const ids = (p.ancorasActivas?.length ? p.ancorasActivas : ANCORAS_DEFAULT_IDS)
  const todas = [...ANCORAS_POOL, ...(p.ancorasCustom ?? [])]
  return ids.map(id => todas.find(a => a.id === id)).filter((a): a is Ancora => !!a)
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
