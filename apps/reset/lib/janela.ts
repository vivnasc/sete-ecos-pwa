'use client'

import { getJejuns } from './storage'
import { getProfile } from './profile'

export type Janela = {
  inicioH: number // hora decimal (ex: 9.5)
  fimH: number // hora decimal (ex: 19.5)
  inicio: string // "9h00"
  fim: string // "19h00"
  metaJejum: number // 14 ou 16
  duracaoComer: number // 10 ou 8 horas
  fonte: 'ultima_refeicao' | 'perfil' | 'default'
  proximaInicio: Date | null // datetime quando abre a janela hoje (ou amanhã se já passou)
}

function formatarHora(h: number): string {
  const horas = Math.floor(h)
  const min = Math.round((h - horas) * 60)
  return `${horas}h${String(min).padStart(2, '0')}`
}

export function janelaRecomendada(): Janela {
  const perfil = getProfile()
  const meta = 14 // default; podemos fazer configurável depois
  const duracaoComer = 24 - meta

  // 1. Tentar usar última refeição registada (mais preciso)
  const jejuns = getJejuns()
  const ultimaRef = [...jejuns].reverse().find(j => j.ultimaRefeicao)?.ultimaRefeicao

  if (ultimaRef) {
    const ultRef = new Date(ultimaRef)
    const inicio = new Date(ultRef.getTime() + meta * 3600 * 1000)
    const inicioH = inicio.getHours() + inicio.getMinutes() / 60
    const fimH = inicioH + duracaoComer
    return {
      inicioH,
      fimH: fimH > 24 ? fimH - 24 : fimH,
      inicio: formatarHora(inicioH),
      fim: formatarHora(fimH > 24 ? fimH - 24 : fimH),
      metaJejum: meta,
      duracaoComer,
      fonte: 'ultima_refeicao',
      proximaInicio: inicio
    }
  }

  // 2. Usar perfil acordaTipico (acordar + ~2.5h)
  const [hAcorda, mAcorda] = perfil.acordaTipico.split(':').map(Number)
  if (!isNaN(hAcorda)) {
    const acordaH = hAcorda + (mAcorda || 0) / 60
    const inicioH = Math.max(9, acordaH + 2.5) // mínimo 9h
    const fimH = inicioH + duracaoComer
    return {
      inicioH,
      fimH: fimH > 24 ? fimH - 24 : fimH,
      inicio: formatarHora(inicioH),
      fim: formatarHora(fimH > 24 ? fimH - 24 : fimH),
      metaJejum: meta,
      duracaoComer,
      fonte: 'perfil',
      proximaInicio: null
    }
  }

  // 3. Default 9h-19h
  return {
    inicioH: 9,
    fimH: 19,
    inicio: '9h',
    fim: '19h',
    metaJejum: meta,
    duracaoComer,
    fonte: 'default',
    proximaInicio: null
  }
}

export function janelaAbertaAgora(): boolean {
  const j = janelaRecomendada()
  const agora = new Date()
  const horaAgora = agora.getHours() + agora.getMinutes() / 60
  if (j.fimH > j.inicioH) {
    return horaAgora >= j.inicioH && horaAgora <= j.fimH
  }
  // Janela atravessa meia-noite (raro mas possível)
  return horaAgora >= j.inicioH || horaAgora <= j.fimH
}

export function tempoAteJanelaAbrir(): { ms: number; horas: number; minutos: number } | null {
  if (janelaAbertaAgora()) return null
  const j = janelaRecomendada()
  const agora = new Date()
  const proxima = new Date(agora)
  proxima.setHours(Math.floor(j.inicioH), Math.round((j.inicioH % 1) * 60), 0, 0)
  if (proxima.getTime() <= agora.getTime()) {
    proxima.setDate(proxima.getDate() + 1)
  }
  const ms = proxima.getTime() - agora.getTime()
  return {
    ms,
    horas: Math.floor(ms / 3600000),
    minutos: Math.floor((ms % 3600000) / 60000)
  }
}

export function tempoAteJanelaFechar(): { ms: number; horas: number; minutos: number } | null {
  if (!janelaAbertaAgora()) return null
  const j = janelaRecomendada()
  const agora = new Date()
  const fim = new Date(agora)
  fim.setHours(Math.floor(j.fimH), Math.round((j.fimH % 1) * 60), 0, 0)
  if (fim.getTime() <= agora.getTime()) {
    fim.setDate(fim.getDate() + 1)
  }
  const ms = fim.getTime() - agora.getTime()
  return {
    ms,
    horas: Math.floor(ms / 3600000),
    minutos: Math.floor((ms % 3600000) / 60000)
  }
}
