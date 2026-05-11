'use client'

// Calcula progresso de um objectivo estruturado contra os dados actuais.
// Devolve: trajectória alvo, valor actual, status (no caminho/atrasado/à frente).

import {
  getPesos,
  getMedidas,
  getTodosDias,
  getRefeicoes,
  getAlcoolRegistos
} from './storage'
import type { Objectivo } from './profile'
import { isoDate } from './dates'

export type ProgressoObjectivo = {
  diasDecorridos: number
  diasTotais: number
  diasRestantes: number
  pctTempo: number          // 0-100 · quanto do prazo passou
  valorAlvoHoje: number | null    // onde devias estar HOJE para chegar a tempo
  valorActual: number | null      // onde estás agora
  valorInicial: number | null
  valorAlvoFinal: number | null
  delta: number | null            // diferença entre actual e alvo de hoje
  status: 'no_caminho' | 'atrasada' | 'a_frente' | 'sem_dados'
  ritmoActual: number | null      // mudança por dia média
  ritmoNecessario: number | null  // ritmo/dia para chegar ao alvo
  projeccao: number | null        // valor projectado no prazo se mantém ritmo actual
  serie: { date: string; valor: number }[]   // pontos para gráfico
  trajectoria: { date: string; valor: number }[] // linha alvo do início ao fim
  unidade: string
}

function getValorHoje(o: Objectivo): { actual: number | null; serie: { date: string; valor: number }[] } {
  const tipo = o.tipo
  if (!tipo) return { actual: null, serie: [] }
  const desde = new Date(o.criadoEm).toISOString().slice(0, 10)
  const hoje = isoDate()

  if (tipo === 'peso') {
    const ps = getPesos().filter(p => p.date >= desde)
    const ult = ps[ps.length - 1]
    return {
      actual: ult?.peso ?? null,
      serie: ps.map(p => ({ date: p.date, valor: p.peso }))
    }
  }
  if (tipo === 'cintura') {
    const ms = getMedidas().filter(m => m.date >= desde && m.cintura !== null)
    const ult = ms[ms.length - 1]
    return {
      actual: ult?.cintura ?? null,
      serie: ms.map(m => ({ date: m.date, valor: m.cintura ?? 0 }))
    }
  }
  if (tipo === 'sono') {
    // média móvel 7d para "valor actual"
    const ds = getTodosDias().filter(d => d.date >= desde && d.sonoHoras !== null)
    const ultimos7 = ds.slice(-7)
    const med = ultimos7.length > 0
      ? ultimos7.reduce((s, d) => s + (d.sonoHoras ?? 0), 0) / ultimos7.length
      : null
    return {
      actual: med,
      serie: ds.map(d => ({ date: d.date, valor: d.sonoHoras ?? 0 }))
    }
  }
  if (tipo === 'proteina') {
    // média móvel 7d de proteína diária
    const refs = getRefeicoes().filter(r => r.timestamp.slice(0, 10) >= desde && r.proteinaG !== null)
    const porDia = new Map<string, number>()
    refs.forEach(r => {
      const d = r.timestamp.slice(0, 10)
      porDia.set(d, (porDia.get(d) ?? 0) + (r.proteinaG ?? 0))
    })
    const serie = [...porDia.entries()].sort().map(([date, valor]) => ({ date, valor }))
    const ultimos7 = serie.slice(-7)
    const med = ultimos7.length > 0 ? ultimos7.reduce((s, p) => s + p.valor, 0) / ultimos7.length : null
    return { actual: med, serie }
  }
  if (tipo === 'agua') {
    const ds = getTodosDias().filter(d => d.date >= desde)
    return {
      actual: ds.length > 0 ? ds[ds.length - 1].aguaCopos : null,
      serie: ds.map(d => ({ date: d.date, valor: d.aguaCopos }))
    }
  }
  if (tipo === 'alcool') {
    // unidades por semana · pega últimos 7 dias
    const al = getAlcoolRegistos().filter(a => a.timestamp.slice(0, 10) >= desde && a.decidiuBeber)
    // Agregar por dia
    const porDia = new Map<string, number>()
    al.forEach(a => {
      const d = a.timestamp.slice(0, 10)
      porDia.set(d, (porDia.get(d) ?? 0) + a.unidades)
    })
    const serie = [...porDia.entries()].sort().map(([date, valor]) => ({ date, valor }))
    // soma últimos 7 dias para "actual"
    const seteDiasAtras = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10) })()
    const semanaActual = serie.filter(p => p.date >= seteDiasAtras).reduce((s, p) => s + p.valor, 0)
    return { actual: semanaActual, serie }
  }
  if (tipo === 'treino') {
    // contar treinos (ancora 'treino_feito' ou treinoFeito) últimos 7d
    const ds = getTodosDias().filter(d => d.date >= desde)
    const seteDiasAtras = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10) })()
    const ultimosDias = ds.filter(d => d.date >= seteDiasAtras)
    const treinos = ultimosDias.filter(d => d.treinoFeito || !!d.ancoras['treino_feito']).length
    const serie = ds.map(d => ({ date: d.date, valor: (d.treinoFeito || !!d.ancoras['treino_feito']) ? 1 : 0 }))
    return { actual: treinos, serie }
  }
  return { actual: null, serie: [] }
}

export function calcularProgresso(o: Objectivo): ProgressoObjectivo | null {
  if (!o.tipo || o.tipo === 'custom') return null
  if (o.valorInicial === undefined || o.valorAlvo === undefined || !o.prazoDias) return null

  const inicio = new Date(o.criadoEm)
  const fim = new Date(inicio); fim.setDate(fim.getDate() + o.prazoDias)
  const agora = new Date()
  const totalMs = fim.getTime() - inicio.getTime()
  const decorridoMs = Math.max(0, agora.getTime() - inicio.getTime())
  const diasDecorridos = Math.max(0, Math.floor(decorridoMs / 86400000))
  const diasTotais = o.prazoDias
  const diasRestantes = Math.max(0, diasTotais - diasDecorridos)
  const pctTempo = totalMs > 0 ? Math.min(100, (decorridoMs / totalMs) * 100) : 100

  // Valor alvo HOJE: linear entre inicial e alvo final
  const fraccaoTempo = totalMs > 0 ? Math.min(1, decorridoMs / totalMs) : 1
  const valorAlvoHoje = o.valorInicial + (o.valorAlvo - o.valorInicial) * fraccaoTempo

  // Valor actual
  const dadosActuais = getValorHoje(o)
  const valorActual = dadosActuais.actual

  // Trajectória ideal · 1 ponto por dia
  const trajectoria: { date: string; valor: number }[] = []
  for (let i = 0; i <= diasTotais; i++) {
    const d = new Date(inicio)
    d.setDate(d.getDate() + i)
    const frac = diasTotais > 0 ? i / diasTotais : 1
    trajectoria.push({
      date: d.toISOString().slice(0, 10),
      valor: o.valorInicial + (o.valorAlvo - o.valorInicial) * frac
    })
  }

  // Status · está no caminho?
  let status: ProgressoObjectivo['status'] = 'sem_dados'
  let delta: number | null = null
  let projeccao: number | null = null
  let ritmoActual: number | null = null
  const ritmoNecessario = diasTotais > 0 ? (o.valorAlvo - o.valorInicial) / diasTotais : 0

  if (valorActual !== null) {
    delta = valorActual - valorAlvoHoje
    // Ritmo actual com base nos dados
    if (dadosActuais.serie.length >= 2 && diasDecorridos > 0) {
      const primeiro = dadosActuais.serie[0]
      const ultimo = dadosActuais.serie[dadosActuais.serie.length - 1]
      const diasEntre = Math.max(1, Math.floor(
        (new Date(ultimo.date).getTime() - new Date(primeiro.date).getTime()) / 86400000
      ))
      ritmoActual = (ultimo.valor - primeiro.valor) / diasEntre
      // Projecção · onde acaba se mantiver ritmo
      projeccao = valorActual + ritmoActual * diasRestantes
    }
    // Direcção: se valorAlvo < valorInicial (descer · ex peso), atrasada quando actual > alvoHoje
    const querDescer = o.valorAlvo < o.valorInicial
    if (querDescer) {
      if (valorActual <= valorAlvoHoje + 0.05 * Math.abs(o.valorAlvo - o.valorInicial)) status = 'no_caminho'
      else if (valorActual > valorAlvoHoje + 0.15 * Math.abs(o.valorAlvo - o.valorInicial)) status = 'atrasada'
      else status = 'no_caminho'
      if (valorActual <= valorAlvoHoje - 0.1 * Math.abs(o.valorAlvo - o.valorInicial)) status = 'a_frente'
    } else {
      if (valorActual >= valorAlvoHoje - 0.05 * Math.abs(o.valorAlvo - o.valorInicial)) status = 'no_caminho'
      else if (valorActual < valorAlvoHoje - 0.15 * Math.abs(o.valorAlvo - o.valorInicial)) status = 'atrasada'
      else status = 'no_caminho'
      if (valorActual >= valorAlvoHoje + 0.1 * Math.abs(o.valorAlvo - o.valorInicial)) status = 'a_frente'
    }
  }

  const unidade = o.tipo === 'peso' ? 'kg'
    : o.tipo === 'cintura' ? 'cm'
    : o.tipo === 'sono' ? 'h'
    : o.tipo === 'proteina' ? 'g'
    : o.tipo === 'agua' ? 'copos'
    : o.tipo === 'alcool' ? 'u/sem'
    : o.tipo === 'treino' ? '×/sem'
    : ''

  return {
    diasDecorridos,
    diasTotais,
    diasRestantes,
    pctTempo,
    valorAlvoHoje,
    valorActual,
    valorInicial: o.valorInicial,
    valorAlvoFinal: o.valorAlvo,
    delta,
    status,
    ritmoActual,
    ritmoNecessario,
    projeccao,
    serie: dadosActuais.serie,
    trajectoria,
    unidade
  }
}
