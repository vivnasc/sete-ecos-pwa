'use client'

import { ANCORAS_DEFAULT_IDS, ANCORAS_POOL, type Ancora } from './data'

export type Metas = {
  calorias: number | null
  proteinaG: number | null
  carboG: number | null
  gorduraG: number | null
}

// Objectivos pessoais · com tracking estruturado quando possível.
// A coach preenche os campos estruturados a partir do que ela disser.
export type ObjectivoTipo =
  | 'peso'        // peso corporal · valorInicial → valorAlvo em prazoDias
  | 'cintura'     // cintura · cm
  | 'sono'        // sono médio · horas
  | 'proteina'    // proteína média/dia · g
  | 'agua'        // copos água/dia
  | 'alcool'      // unidades álcool/sem · alvo descer
  | 'treino'      // treinos por semana
  | 'custom'      // sem tracking automático · só texto

export type Objectivo = {
  id: string
  texto: string             // como ela disse
  criadoEm: string          // ISO
  tipo?: ObjectivoTipo
  valorInicial?: number     // valor quando começou (peso 83, sono 5h, etc)
  valorAlvo?: number        // alvo (peso 70, sono 7h, álcool 0)
  prazoDias?: number        // dias para atingir o alvo desde criadoEm
}

export type Profile = {
  nome: string
  sexo: 'F' | 'M' | 'O'
  pesoInicial: number | null
  cinturaInicial: number | null
  alturaCm: number | null      // cm · necessária para Mifflin-St Jeor
  idade: number | null          // anos · necessária para Mifflin-St Jeor
  acordaTipico: string // HH:MM
  deitaTipico: string // HH:MM
  treinoPreferido: 'manhã' | 'tarde' | 'noite' | 'flexível'
  nivelActividade: 'sedentaria' | 'leve' | 'moderada' | 'activa' | null
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
  alturaCm: null,
  idade: null,
  acordaTipico: '06:30',
  deitaTipico: '22:30',
  treinoPreferido: 'manhã',
  nivelActividade: null,
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

// Mifflin-St Jeor TMB (kcal/dia em repouso)
// F: 10×peso + 6.25×altura - 5×idade - 161
// M: 10×peso + 6.25×altura - 5×idade + 5
export function calcularTMB(opcoes: { pesoKg: number; alturaCm: number; idade: number; sexo: 'F' | 'M' | 'O' }): number {
  const { pesoKg, alturaCm, idade, sexo } = opcoes
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade
  return Math.round(sexo === 'M' ? base + 5 : base - 161)
}

const FACTOR_ACTIVIDADE: Record<string, number> = {
  sedentaria: 1.2,
  leve: 1.375,
  moderada: 1.55,
  activa: 1.725
}

const AJUSTE_OBJECTIVO: Record<string, number> = {
  manter: 0,
  perder_devagar: -250,
  perder: -500,
  ganhar: +300
}

// Sugestão de metas · usa Mifflin-St Jeor se houver altura+idade, senão heurística kcal/kg
// Proteína mais alta em déficit (preserva massa magra) · floor mínimo de calorias
export function sugerirMetas(opcoes: {
  pesoKg: number
  objectivo: 'manter' | 'perder_devagar' | 'perder' | 'ganhar'
  actividade?: 'sedentaria' | 'leve' | 'moderada' | 'activa'
  alturaCm?: number | null
  idade?: number | null
  sexo?: 'F' | 'M' | 'O'
}): Metas & { metodo: string; tmb?: number; tdee?: number; aviso?: string } {
  const { pesoKg, objectivo, actividade = 'leve', alturaCm, idade, sexo = 'F' } = opcoes
  const factor = FACTOR_ACTIVIDADE[actividade] ?? 1.375
  const ajuste = AJUSTE_OBJECTIVO[objectivo] ?? 0

  let calorias: number
  let metodo: string
  let tmb: number | undefined
  let tdee: number | undefined
  let aviso: string | undefined

  if (alturaCm && idade) {
    tmb = calcularTMB({ pesoKg, alturaCm, idade, sexo })
    tdee = Math.round(tmb * factor)
    calorias = Math.round((tdee + ajuste) / 50) * 50
    metodo = 'Mifflin-St Jeor'
  } else {
    const baseKcalPorKg: Record<string, number> = {
      manter: actividade === 'activa' || actividade === 'moderada' ? 30 : actividade === 'sedentaria' ? 26 : 28,
      perder_devagar: actividade === 'activa' || actividade === 'moderada' ? 26 : actividade === 'sedentaria' ? 22 : 24,
      perder: actividade === 'activa' || actividade === 'moderada' ? 24 : actividade === 'sedentaria' ? 20 : 22,
      ganhar: actividade === 'activa' || actividade === 'moderada' ? 34 : actividade === 'sedentaria' ? 30 : 32
    }
    calorias = Math.round((pesoKg * baseKcalPorKg[objectivo]) / 50) * 50
    metodo = 'heurística kcal/kg (sem altura+idade)'
  }

  // FLOOR de calorias · não permitimos abaixo destes valores (saúde · perda muscular · BMR-supressão)
  const FLOOR = sexo === 'M' ? 1500 : 1300
  if (calorias < FLOOR) {
    aviso = `kcal calculadas (${calorias}) abaixo do mínimo seguro (${FLOOR}) · ajustadas para ${FLOOR}. déficit grande de mais perde massa muscular e suprime metabolismo. preferir ritmo mais lento.`
    calorias = FLOOR
  }

  // PROTEÍNA · mais alta em déficit para preservar massa magra
  // perder: 2.2g/kg · perder_devagar: 2.0g/kg · manter: 1.6g/kg · ganhar: 1.8g/kg
  const protGperKg = objectivo === 'perder' ? 2.2 : objectivo === 'perder_devagar' ? 2.0 : objectivo === 'ganhar' ? 1.8 : 1.6
  const proteinaG = Math.round(pesoKg * protGperKg / 5) * 5
  // Gordura · 0.8g/kg em déficit (manter hormonas), 1.0g/kg manter/ganhar
  const gordGperKg = (objectivo === 'perder' || objectivo === 'perder_devagar') ? 0.8 : 1.0
  const gorduraG = Math.round(pesoKg * gordGperKg / 5) * 5
  const restoKcal = calorias - (proteinaG * 4 + gorduraG * 9)
  const carboG = Math.max(20, Math.round(restoKcal / 4 / 5) * 5)
  return { calorias, proteinaG, carboG, gorduraG, metodo, tmb, tdee, aviso }
}

export function getMetasActivas(): Metas | null {
  const p = getProfile()
  if (p.metas.calorias === null && p.metas.proteinaG === null) return null
  return p.metas
}

export function getObjectivos(): Objectivo[] {
  return getProfile().objectivos ?? []
}

export function adicionarObjectivo(
  texto: string,
  estrutura?: { tipo?: ObjectivoTipo; valorInicial?: number; valorAlvo?: number; prazoDias?: number }
): Objectivo {
  const novo: Objectivo = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    texto: texto.trim(),
    criadoEm: new Date().toISOString(),
    ...estrutura
  }
  const lista = [...getObjectivos(), novo]
  saveProfile({ objectivos: lista })
  return novo
}

export function removerObjectivo(id: string): void {
  const lista = getObjectivos().filter(o => o.id !== id)
  saveProfile({ objectivos: lista })
}

export function actualizarObjectivo(id: string, patch: Partial<Omit<Objectivo, 'id' | 'criadoEm'>>): Objectivo | null {
  const lista = getObjectivos()
  const idx = lista.findIndex(o => o.id === id)
  if (idx < 0) return null
  const actualizado: Objectivo = { ...lista[idx], ...patch }
  const nova = [...lista]
  nova[idx] = actualizado
  saveProfile({ objectivos: nova })
  return actualizado
}
