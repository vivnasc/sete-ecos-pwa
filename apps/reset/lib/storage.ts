'use client'

import { isoDate } from './dates'
import { syncDia, syncAlcool, syncMedida, syncDesabafo, syncInsight } from './sync'

const PREFIX = 'reset:'

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
  window.dispatchEvent(new CustomEvent('reset:storage', { detail: { key } }))
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
  window.dispatchEvent(new CustomEvent('reset:storage', { detail: { key: 'all' } }))
}
