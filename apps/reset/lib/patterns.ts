'use client'

import { getTodosDias, getAlcoolRegistos, type DiaLog } from './storage'
import { fromIso } from './dates'

export type Padrao = {
  id: string
  titulo: string
  descricao: string
  forca: 'fraco' | 'moderado' | 'forte'
  icone: 'sleep' | 'alcohol' | 'energy' | 'streak' | 'mood'
}

function correlacao(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 4) return 0
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    dx += (xs[i] - mx) ** 2
    dy += (ys[i] - my) ** 2
  }
  if (dx === 0 || dy === 0) return 0
  return num / Math.sqrt(dx * dy)
}

export function detectarPadroes(): Padrao[] {
  const dias = getTodosDias()
  const alcool = getAlcoolRegistos()
  const padroes: Padrao[] = []

  if (dias.length < 5) return padroes

  // Sleep vs energy
  const comSono = dias.filter(d => d.sonoHoras !== null && d.energia !== null)
  if (comSono.length >= 4) {
    const r = correlacao(
      comSono.map(d => d.sonoHoras as number),
      comSono.map(d => d.energia as number)
    )
    if (Math.abs(r) > 0.4) {
      padroes.push({
        id: 'sono-energia',
        titulo: 'Sono e energia andam juntos',
        descricao: r > 0
          ? `nos teus dados, mais sono = mais energia. correlação ${Math.round(r * 100)}%.`
          : `os teus dados sugerem que sono mais longo nem sempre traz energia. avaliar qualidade do sono.`,
        forca: Math.abs(r) > 0.7 ? 'forte' : 'moderado',
        icone: 'sleep'
      })
    }
  }

  // Sleep < 6h on alcohol days
  const comSonoAlc = dias.filter(d => d.sonoHoras !== null)
  if (comSonoAlc.length >= 5 && alcool.length >= 3) {
    const diasComAlc = new Set(
      alcool.filter(a => a.decidiuBeber).map(a => a.timestamp.slice(0, 10))
    )
    const sonoComAlc = comSonoAlc.filter(d => diasComAlc.has(d.date)).map(d => d.sonoHoras as number)
    const sonoSemAlc = comSonoAlc.filter(d => !diasComAlc.has(d.date)).map(d => d.sonoHoras as number)
    if (sonoComAlc.length >= 2 && sonoSemAlc.length >= 2) {
      const mediaComAlc = sonoComAlc.reduce((a, b) => a + b, 0) / sonoComAlc.length
      const mediaSemAlc = sonoSemAlc.reduce((a, b) => a + b, 0) / sonoSemAlc.length
      const diff = mediaSemAlc - mediaComAlc
      if (Math.abs(diff) > 0.5) {
        padroes.push({
          id: 'alcool-sono',
          titulo: diff > 0 ? 'Beber custa-te sono' : 'Beber não muda o teu sono',
          descricao: diff > 0
            ? `dormes em média ${diff.toFixed(1)}h menos nos dias em que bebes. ${sonoComAlc.length} dias com álcool, ${sonoSemAlc.length} sem.`
            : `os teus dados não mostram diferença clara no sono.`,
          forca: Math.abs(diff) > 1 ? 'forte' : 'moderado',
          icone: 'alcohol'
        })
      }
    }
  }

  // Alcohol triggers
  if (alcool.length >= 5) {
    const cont: Record<string, number> = {}
    alcool.forEach(a => {
      if (a.emocao) cont[a.emocao] = (cont[a.emocao] ?? 0) + 1
    })
    const top = Object.entries(cont).sort(([, a], [, b]) => b - a)
    if (top.length > 0 && top[0][1] >= 3) {
      padroes.push({
        id: 'gatilhos-alcool',
        titulo: `O teu gatilho principal: ${top[0][0]}`,
        descricao: `${top[0][1]} dos últimos ${alcool.length} registos. quando o sentires, abre primeiro o caderno.`,
        forca: top[0][1] >= 5 ? 'forte' : 'moderado',
        icone: 'alcohol'
      })
    }
  }

  // Day-of-week pattern for alcohol
  if (alcool.length >= 7) {
    const porDia: Record<number, number> = {}
    alcool.filter(a => a.decidiuBeber).forEach(a => {
      const dow = new Date(a.timestamp).getDay()
      porDia[dow] = (porDia[dow] ?? 0) + 1
    })
    const top = Object.entries(porDia).sort(([, a], [, b]) => b - a)
    const nomesDias = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados']
    if (top.length > 0 && top[0][1] >= 3) {
      padroes.push({
        id: 'dia-alcool',
        titulo: `${nomesDias[Number(top[0][0])]} são o teu dia mais difícil`,
        descricao: `${top[0][1]} de ${alcool.filter(a => a.decidiuBeber).length} vezes. preparar o dia ajuda.`,
        forca: 'moderado',
        icone: 'alcohol'
      })
    }
  }

  // Anchor consistency
  const ultimos7 = dias.slice(-7)
  if (ultimos7.length === 7) {
    const taxas = ultimos7.map(d => Object.values(d.ancoras).filter(Boolean).length / 7)
    const media = taxas.reduce((a, b) => a + b, 0) / 7
    if (media >= 0.7) {
      padroes.push({
        id: 'consistencia',
        titulo: 'Consistência alta',
        descricao: `cumpriste ${Math.round(media * 7)}/7 âncoras em média nos últimos 7 dias. continua.`,
        forca: 'forte',
        icone: 'streak'
      })
    } else if (media < 0.3) {
      padroes.push({
        id: 'consistencia-baixa',
        titulo: 'Semana difícil',
        descricao: `apenas ${Math.round(media * 7)}/7 âncoras em média. amanhã, escolhe duas. só duas.`,
        forca: 'moderado',
        icone: 'streak'
      })
    }
  }

  // Mood trend
  const comHumor = dias.slice(-14).filter(d => d.humor !== null)
  if (comHumor.length >= 7) {
    const primeiraMetade = comHumor.slice(0, Math.floor(comHumor.length / 2))
    const segundaMetade = comHumor.slice(Math.floor(comHumor.length / 2))
    const m1 = primeiraMetade.reduce((a, d) => a + (d.humor as number), 0) / primeiraMetade.length
    const m2 = segundaMetade.reduce((a, d) => a + (d.humor as number), 0) / segundaMetade.length
    const diff = m2 - m1
    if (Math.abs(diff) >= 0.5) {
      padroes.push({
        id: 'humor-trend',
        titulo: diff > 0 ? 'O teu humor está a subir' : 'O teu humor está a descer',
        descricao: `nos últimos ${comHumor.length} dias, ${diff > 0 ? 'subiu' : 'desceu'} ${Math.abs(diff).toFixed(1)} pontos.`,
        forca: Math.abs(diff) > 1 ? 'forte' : 'moderado',
        icone: 'mood'
      })
    }
  }

  return padroes
}

export function diasComDados(): { total: number; comAncoras: number; comSono: number } {
  const dias = getTodosDias()
  return {
    total: dias.length,
    comAncoras: dias.filter(d => Object.values(d.ancoras).some(Boolean)).length,
    comSono: dias.filter(d => d.sonoHoras !== null).length
  }
}
