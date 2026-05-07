export const RESET_START = new Date(2026, 4, 11) // 11 maio 2026
export const RESET_DAYS = 60
export const RESET_END = (() => {
  const d = new Date(RESET_START)
  d.setDate(d.getDate() + RESET_DAYS - 1)
  return d
})()

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const
const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] as const
const MESES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

export type DiaSemana = (typeof DIAS_SEMANA)[number]

export function diaSemana(d: Date): DiaSemana {
  return DIAS_SEMANA[d.getDay()]
}

export function diaSemanaCurto(d: Date): string {
  return DIAS_CURTO[d.getDay()]
}

export function mes(d: Date): string {
  return MESES[d.getMonth()]
}

export function mesCurto(d: Date): string {
  return MESES_CURTO[d.getMonth()]
}

// Hora local HH:MM a partir de timestamp ISO (UTC).
// Usar sempre isto em vez de iso.slice(11,16) — esse dá UTC e fica 2h atrasado em CAT.
export function horaLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Data local YYYY-MM-DD a partir de timestamp ISO.
export function dataLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return isoDate(d)
}

export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function diaDoPlano(d: Date = new Date()): number {
  const start = new Date(RESET_START)
  start.setHours(0, 0, 0, 0)
  const today = new Date(d)
  today.setHours(0, 0, 0, 0)
  const ms = today.getTime() - start.getTime()
  const dia = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1
  return dia
}

export function statusDoDia(d: Date = new Date()): 'antes' | 'durante' | 'depois' {
  const n = diaDoPlano(d)
  if (n < 1) return 'antes'
  if (n > RESET_DAYS) return 'depois'
  return 'durante'
}

export function diasAteInicio(d: Date = new Date()): number {
  const start = new Date(RESET_START)
  start.setHours(0, 0, 0, 0)
  const today = new Date(d)
  today.setHours(0, 0, 0, 0)
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatarData(d: Date, longo = false): string {
  if (longo) return `${d.getDate()} de ${mes(d)} de ${d.getFullYear()}`
  return `${d.getDate()} ${mesCurto(d)}`
}

export function todosOsDias(): Date[] {
  // Se hoje é antes do plano, inclui também os dias entre hoje e o início
  // (para poder registar durante a fase de pré-plano).
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const start = new Date(RESET_START)
  start.setHours(0, 0, 0, 0)
  const cursor = hoje < start ? new Date(hoje) : new Date(start)
  const end = new Date(start)
  end.setDate(end.getDate() + RESET_DAYS - 1)
  const dias: Date[] = []
  while (cursor <= end) {
    dias.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}
