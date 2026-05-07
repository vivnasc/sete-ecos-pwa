'use client'

import { ANCORAS_DEFAULT_IDS, ANCORAS_POOL, type Ancora } from './data'

export type Metas = {
  calorias: number | null
  proteinaG: number | null
  carboG: number | null
  gorduraG: number | null
}

// Objectivos pessoais · texto livre que a coach lê e usa para te orientar.
// Ex: "perder 3kg em 60 dias", "dormir 7h em média", "reduzir álcool a 1×/sem".
export type Objectivo = {
  id: string
  texto: string
  criadoEm: string // ISO
}

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
  metas: Metas
  modoViagem: boolean
  objectivos: Objectivo[]
}

const KEY = 'fenixfit:profile'

const DEFAULT_METAS: Metas = {
  calorias: null,
  proteinaG: null,
  carboG: null,
  gorduraG: null
}

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
  ancorasCustom: [],
  metas: DEFAULT_METAS,
  modoViagem: false,
  objectivos: []
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
    const parsed = JSON.parse(raw) as Partial<Profile>
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      metas: { ...DEFAULT_METAS, ...(parsed.metas ?? {}) }
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(p: Partial<Profile>): Profile {
  const novo = { ...getProfile(), ...p }
  if (p.metas) novo.metas = { ...DEFAULT_METAS, ...p.metas }
  localStorage.setItem(KEY, JSON.stringify(novo))
  window.dispatchEvent(new CustomEvent('fenixfit:profile', { detail: novo }))
  return novo
}

export function resetProfile(): void {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('fenixfit:profile', { detail: DEFAULT_PROFILE }))
}

// Sugestão simples de metas com base no peso e objectivo
export function sugerirMetas(opcoes: {
  pesoKg: number
  objectivo: 'manter' | 'perder_devagar' | 'perder' | 'ganhar'
  actividade?: 'sedentaria' | 'leve' | 'activa'
}): Metas {
  const { pesoKg, objectivo, actividade = 'leve' } = opcoes
  const baseKcalPorKg: Record<string, number> = {
    manter: actividade === 'activa' ? 30 : actividade === 'sedentaria' ? 26 : 28,
    perder_devagar: actividade === 'activa' ? 26 : actividade === 'sedentaria' ? 22 : 24,
    perder: actividade === 'activa' ? 24 : actividade === 'sedentaria' ? 20 : 22,
    ganhar: actividade === 'activa' ? 34 : actividade === 'sedentaria' ? 30 : 32
  }
  const calorias = Math.round((pesoKg * baseKcalPorKg[objectivo]) / 50) * 50
  const proteinaG = Math.round(pesoKg * 1.6 / 5) * 5
  const gorduraG = Math.round(pesoKg * 0.9 / 5) * 5
  const restoKcal = calorias - (proteinaG * 4 + gorduraG * 9)
  const carboG = Math.max(20, Math.round(restoKcal / 4 / 5) * 5)
  return { calorias, proteinaG, carboG, gorduraG }
}

export function getMetasActivas(): Metas | null {
  const p = getProfile()
  if (p.metas.calorias === null && p.metas.proteinaG === null) return null
  return p.metas
}

export function getObjectivos(): Objectivo[] {
  return getProfile().objectivos ?? []
}

export function adicionarObjectivo(texto: string): Objectivo {
  const novo: Objectivo = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    texto: texto.trim(),
    criadoEm: new Date().toISOString()
  }
  const lista = [...getObjectivos(), novo]
  saveProfile({ objectivos: lista })
  return novo
}

export function removerObjectivo(id: string): void {
  const lista = getObjectivos().filter(o => o.id !== id)
  saveProfile({ objectivos: lista })
}
