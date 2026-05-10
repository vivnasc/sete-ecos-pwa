'use client'

import { isoDate } from './dates'
import { syncDia, syncAlcool, syncMedida, syncDesabafo, syncInsight, syncPeso, syncJejum, syncCiclo, syncCoachMensagem, syncRefeicao, removeRefeicaoSync, removeJejumSync } from './sync'

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
  aguaCopos: number
  suplementos: string[]
  transitoIntestinal: 'sim' | 'nao' | null
  horaDeitar: string | null
  qualidadeSono: number | null
  acordouVezes: number | null
  sintomasPeri: string[]
  steps: number | null
  rhr: number | null
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
  fotoUrl: string | null
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

export type RefeicaoTipo = 'pa' | 'almoco' | 'snack' | 'jantar'

export type Refeicao = {
  id: string
  timestamp: string
  tipo: RefeicaoTipo
  descricao: string
  proteinaG: number | null
  carboG: number | null
  gorduraG: number | null
  calorias: number | null
  contexto: string
  sentir: string
}

export type CoachMensagem = {
  id: string
  timestamp: string
  role: 'user' | 'assistant'
  content: string
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
  const existing = all[date]
  if (existing) {
    // backfill defaults para registos antigos
    return {
      ...existing,
      aguaCopos: existing.aguaCopos ?? 0,
      suplementos: existing.suplementos ?? [],
      transitoIntestinal: existing.transitoIntestinal ?? null,
      horaDeitar: existing.horaDeitar ?? null,
      qualidadeSono: existing.qualidadeSono ?? null,
      acordouVezes: existing.acordouVezes ?? null,
      sintomasPeri: existing.sintomasPeri ?? [],
      steps: existing.steps ?? null,
      rhr: existing.rhr ?? null
    }
  }
  return {
    date,
    ancoras: {},
    treinoFeito: false,
    caminhadaMin: null,
    sonoHoras: null,
    energia: null,
    humor: null,
    notas: '',
    aguaCopos: 0,
    suplementos: [],
    transitoIntestinal: null,
    horaDeitar: null,
    qualidadeSono: null,
    acordouVezes: null,
    sintomasPeri: [],
    steps: null,
    rhr: null
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

export function addAlcoolRegisto(r: Omit<AlcoolRegisto, 'id' | 'timestamp'> & { timestamp?: string }): AlcoolRegisto {
  const novo: AlcoolRegisto = {
    ...r,
    id: crypto.randomUUID(),
    timestamp: r.timestamp ?? new Date().toISOString()
  }
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

// ----- REFEICOES -----

export function getRefeicoes(): Refeicao[] {
  return read<Refeicao[]>('refeicoes', []).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function getRefeicoesDoDia(date = isoDate()): Refeicao[] {
  return getRefeicoes().filter(r => r.timestamp.slice(0, 10) === date)
}

export function addRefeicao(r: Omit<Refeicao, 'id' | 'timestamp'> & { timestamp?: string }): Refeicao {
  const nova: Refeicao = {
    ...r,
    id: crypto.randomUUID(),
    timestamp: r.timestamp ?? new Date().toISOString()
  }
  const all = read<Refeicao[]>('refeicoes', [])
  all.push(nova)
  write('refeicoes', all)
  void syncRefeicao(nova).catch(() => {})
  return nova
}

export function removeRefeicao(id: string): void {
  const all = read<Refeicao[]>('refeicoes', [])
  const filtradas = all.filter(r => r.id !== id)
  // SEMPRE adiciona ao tombstone, mesmo se já não estava local · pode estar no servidor
  const tombs = read<string[]>('tombstones-refeicoes', [])
  if (!tombs.includes(id)) {
    tombs.push(id)
    write('tombstones-refeicoes', tombs)
  }
  if (filtradas.length !== all.length) write('refeicoes', filtradas)
  void removeRefeicaoSync(id).catch(() => {})
}

export function getTombstonesRefeicoes(): string[] {
  return read<string[]>('tombstones-refeicoes', [])
}

export function limparTombstone(id: string): void {
  const tombs = read<string[]>('tombstones-refeicoes', [])
  const novo = tombs.filter(t => t !== id)
  if (novo.length !== tombs.length) write('tombstones-refeicoes', novo)
}

export function updateRefeicao(id: string, patch: Partial<Omit<Refeicao, 'id'>>): Refeicao | null {
  const all = read<Refeicao[]>('refeicoes', [])
  const i = all.findIndex(r => r.id === id)
  if (i === -1) return null
  const actualizada: Refeicao = { ...all[i], ...patch, id }
  all[i] = actualizada
  write('refeicoes', all)
  void syncRefeicao(actualizada).catch(() => {})
  return actualizada
}

export function macrosDoDia(date = isoDate()): { proteina: number; carbo: number; gordura: number; calorias: number; refeicoes: number } {
  const lista = getRefeicoesDoDia(date)
  return {
    proteina: lista.reduce((s, r) => s + (r.proteinaG ?? 0), 0),
    carbo: lista.reduce((s, r) => s + (r.carboG ?? 0), 0),
    gordura: lista.reduce((s, r) => s + (r.gorduraG ?? 0), 0),
    calorias: lista.reduce((s, r) => s + (r.calorias ?? 0), 0),
    refeicoes: lista.length
  }
}

// ----- COACH CHAT (memória persistente) -----

export function getCoachMensagens(limite = 200): CoachMensagem[] {
  const all = read<CoachMensagem[]>('coach-chat', [])
  // Limpa mensagens [auto] (toast antigo · estavam a poluir a conversa)
  const limpas = all.filter(m => !(m.role === 'user' && typeof m.content === 'string' && m.content.startsWith('[auto]')))
  // Limpa também as respostas do assistant que vieram logo a seguir a um [auto] (heurística simples)
  const filtradas: CoachMensagem[] = []
  for (let i = 0; i < limpas.length; i++) {
    const cur = limpas[i]
    const prev = filtradas[filtradas.length - 1]
    // Se foi uma resposta a [auto] removido, pode ser orphan — mantém na mesma se faz sentido
    filtradas.push(cur)
  }
  // Persistir versão limpa se houve filtragem
  if (filtradas.length !== all.length) {
    write('coach-chat', filtradas)
  }
  return filtradas.slice(-limite).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function saveCoachMensagem(role: 'user' | 'assistant', content: string): CoachMensagem {
  const novo: CoachMensagem = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    role,
    content
  }
  const all = read<CoachMensagem[]>('coach-chat', [])
  all.push(novo)
  // Manter os últimos 500 (não inflar localStorage)
  const truncated = all.slice(-500)
  write('coach-chat', truncated)
  void syncCoachMensagem(novo).catch(() => {})
  return novo
}

export function limparCoachChat(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PREFIX + 'coach-chat')
  window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key: 'coach-chat' } }))
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

  // Auto-corrigir: se primeira < ultima, a ultima deve ser do dia anterior.
  // Acontece quando edita só a hora sem mexer na data.
  let ultimaCorr = j.ultimaRefeicao
  if (j.ultimaRefeicao && j.primeiraRefeicao) {
    let tU = new Date(j.ultimaRefeicao).getTime()
    const tP = new Date(j.primeiraRefeicao).getTime()
    while (tU > tP) tU -= 24 * 60 * 60 * 1000
    if (tU !== new Date(j.ultimaRefeicao).getTime()) {
      ultimaCorr = new Date(tU).toISOString()
    }
  }

  // calcular duração se ambos definidos
  let duracaoHoras: number | null = null
  if (ultimaCorr && j.primeiraRefeicao) {
    const ms = new Date(j.primeiraRefeicao).getTime() - new Date(ultimaCorr).getTime()
    duracaoHoras = Math.round((ms / (1000 * 60 * 60)) * 10) / 10
  }
  const completou = duracaoHoras !== null && duracaoHoras >= j.meta
  const novo: JejumLog = {
    ...j,
    ultimaRefeicao: ultimaCorr,
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

// Cura todos os jejuns gravados: corrige durações negativas / impossíveis
// (ex: ultima=09/05 20:00, primeira=09/05 09:00 → ultima vira 08/05 20:00)
export function curarJejuns(): number {
  const all = read<JejumLog[]>('jejum', [])
  let alterados = 0
  for (const j of all) {
    if (!j.ultimaRefeicao || !j.primeiraRefeicao) continue
    let tU = new Date(j.ultimaRefeicao).getTime()
    const tP = new Date(j.primeiraRefeicao).getTime()
    if (tU <= tP) continue // já está OK
    while (tU > tP) tU -= 24 * 60 * 60 * 1000
    j.ultimaRefeicao = new Date(tU).toISOString()
    const ms = tP - tU
    j.duracaoHoras = Math.round((ms / (1000 * 60 * 60)) * 10) / 10
    j.completou = j.duracaoHoras >= j.meta
    alterados++
    void syncJejum(j).catch(() => {})
  }
  if (alterados > 0) write('jejum', all)
  return alterados
}

export function removeJejum(id: string): void {
  const all = read<JejumLog[]>('jejum', [])
  const filtrado = all.filter(j => j.id !== id)
  if (filtrado.length === all.length) return
  write('jejum', filtrado)
  void removeJejumSync(id).catch(() => {})
}

export function anularPrimeiraRefeicao(date: string): JejumLog | null {
  const all = read<JejumLog[]>('jejum', [])
  const idx = all.findIndex(j => j.date === date)
  if (idx < 0) return null
  const j = all[idx]
  const novo: JejumLog = {
    ...j,
    primeiraRefeicao: null,
    duracaoHoras: null,
    completou: false
  }
  all[idx] = novo
  write('jejum', all)
  void syncJejum(novo).catch(() => {})
  return novo
}

export function streakJejum(): number {
  const js = getJejuns()
  let streak = 0
  // Saltar entradas em curso (primeira null) no fim · não quebram streak
  for (let i = js.length - 1; i >= 0; i--) {
    const j = js[i]
    if (!j.primeiraRefeicao) continue // ainda em curso · ignora
    if (j.completou) streak++
    else break
  }
  return streak
}

// Estatísticas resumo · usadas no /jejum
export function estatisticasJejum(): {
  media7d: number | null
  media30d: number | null
  media90d: number | null
  totalRegistos: number
  taxaSucesso30d: number | null  // % cumpridos sobre registados nos últimos 30d
  diasJejumPorPesoCorrelacao: { peso: number; horas: number }[]
} {
  const js = getJejuns().filter(j => j.duracaoHoras !== null)
  const hoje = Date.now()
  const dia = 86400000
  const filtrar = (n: number) => js.filter(j => hoje - new Date(j.date).getTime() <= n * dia)
  const media = (arr: JejumLog[]) => arr.length === 0 ? null
    : Math.round((arr.reduce((s, j) => s + (j.duracaoHoras ?? 0), 0) / arr.length) * 10) / 10
  const ult30 = filtrar(30)
  const taxa = ult30.length === 0 ? null : Math.round((ult30.filter(j => j.completou).length / ult30.length) * 100)
  // Correlação · juntar peso do dia em que jejum terminou (ou mais próximo)
  const pesos = getPesos()
  const pares: { peso: number; horas: number }[] = []
  for (const j of js) {
    if (j.duracaoHoras === null) continue
    const p = pesos.find(p => p.date === j.date) ?? pesos.find(p => Math.abs(new Date(p.date).getTime() - new Date(j.date).getTime()) < 2 * dia)
    if (p) pares.push({ peso: p.peso, horas: j.duracaoHoras })
  }
  return {
    media7d: media(filtrar(7)),
    media30d: media(filtrar(30)),
    media90d: media(filtrar(90)),
    totalRegistos: js.length,
    taxaSucesso30d: taxa,
    diasJejumPorPesoCorrelacao: pares
  }
}

export function jejumActualHoras(): { horas: number; ultimaRef: string } | null {
  // Procura QUALQUER jejum em curso (ultima sem primeira) em qualquer data.
  // Permite começar fast à noite (date=amanhã) sem conflitar com fast de hoje fechado.
  const all = getJejuns()
  const candidatos = all
    .filter(j => j.ultimaRefeicao && !j.primeiraRefeicao)
    .map(j => {
      let t = new Date(j.ultimaRefeicao!).getTime()
      // se a hora guardada está no futuro, puxa 24h para trás (segurança)
      while (t > Date.now()) t -= 24 * 60 * 60 * 1000
      return { iso: new Date(t).toISOString(), t }
    })
    .sort((a, b) => b.t - a.t)
  if (candidatos.length === 0) return null
  const escolhido = candidatos[0]
  const ms = Date.now() - escolhido.t
  const horas = Math.round((ms / (1000 * 60 * 60)) * 10) / 10
  return { horas, ultimaRef: escolhido.iso }
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
  const todos = getAlcoolRegistos()
  if (todos.length === 0) return 0
  // getAlcoolRegistos devolve em ordem decrescente (mais recente primeiro)
  const drinks = todos.filter(r => r.decidiuBeber)
  if (drinks.length === 0) {
    // Nunca bebeu (registou) · conta desde o registo mais antigo (último na lista)
    const maisAntigo = todos[todos.length - 1]
    const ms = Date.now() - new Date(maisAntigo.timestamp).getTime()
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
  }
  const ultimoDrink = new Date(drinks[0].timestamp)
  return Math.max(0, Math.floor((Date.now() - ultimoDrink.getTime()) / (1000 * 60 * 60 * 24)))
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
