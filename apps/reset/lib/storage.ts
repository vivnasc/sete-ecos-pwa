'use client'

import { isoDate } from './dates'
import { syncDia, syncAlcool, syncMedida, syncDesabafo, syncInsight, syncPeso, syncJejum, syncCiclo } from './sync'

const PREFIX = 'fenixfit:'

export type DiaLog = {
  date: string
  ancoras: Record<string, boolean>
  treinoFeito: boolean
  caminhadaMin: number | null
  sonoHoras: number | null
  energia: number | null
  humor: number | null
  notas: string
}

export type AlcoolRegisto = {
  id: string
  timestamp: string
  unidades: number
  emocao: string
  gatilho: string
  decidiuBeber: boolean
}

export type MedidaRegisto = {
  id: string
  date: string
  cintura: number | null
  ancas: number | null
  coxa: number | null
  braco: number | null
  peso: number | null
  sentir: string
  mudou: string
}

export type DesabafoEntry = {
  id: string
  timestamp: string
  texto: string
  emocao: string
}

export type InsightCache = {
  weekStart: string
  texto: string
  geradoEm: string
}

export type PesoLog = {
  id: string
  date: string // YYYY-MM-DD (única por dia)
  peso: number
  cintura: number | null
  hora: string // HH:MM
  notas: string
}

export type JejumLog = {
  id: string
  date: string // YYYY-MM-DD (data em que o jejum termina)
  ultimaRefeicao: string | null // ISO timestamp - última refeição da véspera
  primeiraRefeicao: string | null // ISO timestamp - primeira refeição de hoje
  duracaoHoras: number | null // calculado
  meta: number // 14 ou 16
  completou: boolean
}

export type CicloLog = {
  id: string
  dataInicio: string // YYYY-MM-DD - primeiro dia do período
  duracaoCiclo: number | null // duração total até próximo período (calc auto)
  duracaoMenstruacao: number | null // dias com fluxo
  fluxo: 'leve' | 'moderado' | 'intenso' | null
  sintomas: string[]
  cravings: string[]
  notas: string
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  return safeParse(localStorage.getItem(PREFIX + key), fallback)
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key } }))
}

// ----- DIA LOG -----

export function getDia(date = isoDate()): DiaLog {
  const all = read<Record<string, DiaLog>>('dias', {})
  return all[date] ?? {
    date,
    ancoras: {},
    treinoFeito: false,
    caminhadaMin: null,
    sonoHoras: null,
    energia: null,
    humor: null,
    notas: ''
  }
}

export function saveDia(log: DiaLog): void {
  const all = read<Record<string, DiaLog>>('dias', {})
  all[log.date] = log
  write('dias', all)
  void syncDia(log).catch(() => {})
}

export function getTodosDias(): DiaLog[] {
  const all = read<Record<string, DiaLog>>('dias', {})
  return Object.values(all).sort((a, b) => a.date.localeCompare(b.date))
}

export function toggleAncora(date: string, id: string): DiaLog {
  const log = getDia(date)
  log.ancoras[id] = !log.ancoras[id]
  saveDia(log)
  return log
}

// ----- ALCOOL -----

export function getAlcoolRegistos(): AlcoolRegisto[] {
  return read<AlcoolRegisto[]>('alcool', []).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function addAlcoolRegisto(r: Omit<AlcoolRegisto, 'id' | 'timestamp'>): AlcoolRegisto {
  const novo: AlcoolRegisto = { ...r, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
  const all = read<AlcoolRegisto[]>('alcool', [])
  all.push(novo)
  write('alcool', all)
  void syncAlcool(novo).catch(() => {})
  return novo
}

// ----- MEDIDAS -----

export function getMedidas(): MedidaRegisto[] {
  return read<MedidaRegisto[]>('medidas', []).sort((a, b) => a.date.localeCompare(b.date))
}

export function addMedida(m: Omit<MedidaRegisto, 'id'>): MedidaRegisto {
  const novo: MedidaRegisto = { ...m, id: crypto.randomUUID() }
  const all = read<MedidaRegisto[]>('medidas', [])
  all.push(novo)
  write('medidas', all)
  void syncMedida(novo).catch(() => {})
  return novo
}

// ----- DESABAFO -----

export function getDesabafos(): DesabafoEntry[] {
  return read<DesabafoEntry[]>('desabafo', []).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function addDesabafo(d: Omit<DesabafoEntry, 'id' | 'timestamp'>): DesabafoEntry {
  const novo: DesabafoEntry = { ...d, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
  const all = read<DesabafoEntry[]>('desabafo', [])
  all.push(novo)
  write('desabafo', all)
  void syncDesabafo(novo).catch(() => {})
  return novo
}

// ----- INSIGHTS CACHE -----

export function getInsightCache(weekStart: string): InsightCache | null {
  const all = read<Record<string, InsightCache>>('insights', {})
  return all[weekStart] ?? null
}

export function saveInsightCache(c: InsightCache): void {
  const all = read<Record<string, InsightCache>>('insights', {})
  all[c.weekStart] = c
  write('insights', all)
  void syncInsight(c).catch(() => {})
}

// ----- PESO (peso diário) -----

export function getPesos(): PesoLog[] {
  return read<PesoLog[]>('peso', []).sort((a, b) => a.date.localeCompare(b.date))
}

export function getPesoHoje(): PesoLog | null {
  const hoje = isoDate()
  return getPesos().find(p => p.date === hoje) ?? null
}

export function savePeso(p: Omit<PesoLog, 'id'>): PesoLog {
  const all = read<PesoLog[]>('peso', [])
  const existing = all.findIndex(x => x.date === p.date)
  let novo: PesoLog
  if (existing >= 0) {
    novo = { ...all[existing], ...p }
    all[existing] = novo
  } else {
    novo = { ...p, id: crypto.randomUUID() }
    all.push(novo)
  }
  write('peso', all)
  void syncPeso(novo).catch(() => {})
  return novo
}

export function pesoUltimo(): number | null {
  const ps = getPesos()
  return ps.length > 0 ? ps[ps.length - 1].peso : null
}

export function pesoMediaMovel(dias = 7, atePosicao?: number): number | null {
  const ps = getPesos()
  const ate = atePosicao ?? ps.length
  const slice = ps.slice(Math.max(0, ate - dias), ate)
  if (slice.length === 0) return null
  const soma = slice.reduce((acc, p) => acc + p.peso, 0)
  return Math.round((soma / slice.length) * 10) / 10
}

export function variacaoPeso(): { ultima: number | null; semana: number | null; mes: number | null; total: number | null } {
  const ps = getPesos()
  if (ps.length < 2) return { ultima: null, semana: null, mes: null, total: null }
  const ultimo = ps[ps.length - 1].peso
  const ontem = ps.length >= 2 ? ps[ps.length - 2].peso : null
  const ha7 = ps.length > 7 ? ps[ps.length - 8].peso : null
  const ha30 = ps.length > 30 ? ps[ps.length - 31].peso : null
  const inicial = ps[0].peso
  const r = (a: number | null, b: number | null) =>
    a === null || b === null ? null : Math.round((a - b) * 10) / 10
  return {
    ultima: r(ultimo, ontem),
    semana: r(ultimo, ha7),
    mes: r(ultimo, ha30),
    total: r(ultimo, inicial)
  }
}

// ----- JEJUM -----

export function getJejuns(): JejumLog[] {
  return read<JejumLog[]>('jejum', []).sort((a, b) => a.date.localeCompare(b.date))
}

export function getJejumHoje(): JejumLog | null {
  const hoje = isoDate()
  return getJejuns().find(j => j.date === hoje) ?? null
}

export function saveJejum(j: Omit<JejumLog, 'id'>): JejumLog {
  const all = read<JejumLog[]>('jejum', [])
  const existing = all.findIndex(x => x.date === j.date)
  // calcular duração se ambos definidos
  let duracaoHoras: number | null = null
  if (j.ultimaRefeicao && j.primeiraRefeicao) {
    const ms = new Date(j.primeiraRefeicao).getTime() - new Date(j.ultimaRefeicao).getTime()
    duracaoHoras = Math.round((ms / (1000 * 60 * 60)) * 10) / 10
  }
  const completou = duracaoHoras !== null && duracaoHoras >= j.meta
  const novo: JejumLog = {
    ...j,
    duracaoHoras,
    completou,
    id: existing >= 0 ? all[existing].id : crypto.randomUUID()
  }
  if (existing >= 0) all[existing] = novo
  else all.push(novo)
  write('jejum', all)
  void syncJejum(novo).catch(() => {})
  return novo
}

export function streakJejum(): number {
  const js = getJejuns()
  let streak = 0
  for (let i = js.length - 1; i >= 0; i--) {
    if (js[i].completou) streak++
    else break
  }
  return streak
}

export function jejumActualHoras(): { horas: number; ultimaRef: string } | null {
  // Calcula o jejum em curso desde a última refeição registada
  const hoje = isoDate()
  const ontem = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return isoDate(d)
  })()
  const all = getJejuns()
  const hojeJ = all.find(j => j.date === hoje)
  const ontemJ = all.find(j => j.date === ontem)

  // se já comeu hoje, jejum acabou
  if (hojeJ?.primeiraRefeicao) return null

  // procurar última refeição: hoje (se registada) ou ontem
  const ultimaRef = hojeJ?.ultimaRefeicao ?? ontemJ?.ultimaRefeicao
  if (!ultimaRef) return null

  const ms = Date.now() - new Date(ultimaRef).getTime()
  const horas = Math.round((ms / (1000 * 60 * 60)) * 10) / 10
  return { horas, ultimaRef }
}

// ----- CICLO -----

export function getCiclos(): CicloLog[] {
  return read<CicloLog[]>('ciclo', []).sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
}

export function saveCiclo(c: Omit<CicloLog, 'id'>): CicloLog {
  const all = read<CicloLog[]>('ciclo', [])
  const existing = all.findIndex(x => x.dataInicio === c.dataInicio)
  let novo: CicloLog
  if (existing >= 0) {
    novo = { ...all[existing], ...c }
    all[existing] = novo
  } else {
    novo = { ...c, id: crypto.randomUUID() }
    all.push(novo)
  }
  // recalcular duracaoCiclo do anterior (entre inicios)
  all.sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
  for (let i = 0; i < all.length - 1; i++) {
    const inicio = new Date(all[i].dataInicio)
    const proximo = new Date(all[i + 1].dataInicio)
    const dias = Math.round((proximo.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
    all[i] = { ...all[i], duracaoCiclo: dias }
  }
  write('ciclo', all)
  void syncCiclo(novo).catch(() => {})
  return novo
}

export type CicloFase = 'menstruacao' | 'folicular' | 'ovulacao' | 'lutea' | null

export function diaActualCiclo(): number | null {
  const ciclos = getCiclos()
  if (ciclos.length === 0) return null
  const ultimo = ciclos[ciclos.length - 1]
  const hoje = new Date()
  const inicio = new Date(ultimo.dataInicio)
  const dias = Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return dias > 0 ? dias : null
}

export function faseActualCiclo(): CicloFase {
  const dia = diaActualCiclo()
  if (dia === null) return null
  const ciclos = getCiclos()
  const duracoes = ciclos.map(c => c.duracaoCiclo).filter((d): d is number => d !== null)
  const duracaoMedia = duracoes.length > 0 ? duracoes.reduce((a, b) => a + b, 0) / duracoes.length : 28
  const ovulacao = Math.round(duracaoMedia - 14)
  const ultMens = ciclos[ciclos.length - 1]?.duracaoMenstruacao ?? 5

  if (dia <= ultMens) return 'menstruacao'
  if (dia < ovulacao - 1) return 'folicular'
  if (dia <= ovulacao + 2) return 'ovulacao'
  if (dia <= duracaoMedia) return 'lutea'
  return null // ciclo deveria ter recomeçado
}

export function nomeFase(fase: CicloFase): string {
  if (fase === null) return '—'
  const nomes = {
    menstruacao: 'menstruação',
    folicular: 'folicular',
    ovulacao: 'ovulação',
    lutea: 'lútea'
  }
  return nomes[fase]
}

// ----- METRICAS DERIVADAS -----

export function streakAncoras(minPorDia = 5): number {
  const dias = getTodosDias()
  let streak = 0
  for (let i = dias.length - 1; i >= 0; i--) {
    const cumpridas = Object.values(dias[i].ancoras).filter(Boolean).length
    if (cumpridas >= minPorDia) streak++
    else break
  }
  return streak
}

export function diasSemAlcool(): number {
  const registos = getAlcoolRegistos().filter(r => r.decidiuBeber)
  if (registos.length === 0) return 0
  const ultimo = new Date(registos[0].timestamp)
  const agora = new Date()
  return Math.floor((agora.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24))
}

export function complianceAncora(id: string, ultimosNDias = 14): { feitos: number; total: number } {
  const dias = getTodosDias().slice(-ultimosNDias)
  const feitos = dias.filter(d => d.ancoras[id]).length
  return { feitos, total: dias.length }
}

export function sonoMedio(ultimosNDias = 7): number | null {
  const dias = getTodosDias().slice(-ultimosNDias).filter(d => d.sonoHoras !== null)
  if (dias.length === 0) return null
  const soma = dias.reduce((acc, d) => acc + (d.sonoHoras ?? 0), 0)
  return Math.round((soma / dias.length) * 10) / 10
}

export function variacaoCintura(): number | null {
  const medidas = getMedidas().filter(m => m.cintura !== null)
  if (medidas.length < 2) return null
  return Math.round(((medidas[medidas.length - 1].cintura ?? 0) - (medidas[0].cintura ?? 0)) * 10) / 10
}

export function exportarTudo(): string {
  const data = {
    dias: read('dias', {}),
    alcool: read('alcool', []),
    medidas: read('medidas', []),
    desabafo: read('desabafo', []),
    insights: read('insights', {}),
    profile: read('profile', {}),
    exportadoEm: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

export function importarTudo(json: string): boolean {
  try {
    const data = JSON.parse(json)
    if (data.dias) write('dias', data.dias)
    if (data.alcool) write('alcool', data.alcool)
    if (data.medidas) write('medidas', data.medidas)
    if (data.desabafo) write('desabafo', data.desabafo)
    if (data.insights) write('insights', data.insights)
    if (data.profile) write('profile', data.profile)
    return true
  } catch { return false }
}

export function limparTudoLocal(): void {
  if (typeof window === 'undefined') return
  ;['dias', 'alcool', 'medidas', 'desabafo', 'insights'].forEach(k => {
    localStorage.removeItem(PREFIX + k)
  })
  window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key: 'all' } }))
}
