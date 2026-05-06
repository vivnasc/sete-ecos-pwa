'use client'

import { getSupabase } from './supabase'
import { getUser } from './auth'
import type { DiaLog, AlcoolRegisto, MedidaRegisto, DesabafoEntry, InsightCache } from './storage'

const PREFIX = 'fenixfit:'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('fenixfit:storage', { detail: { key } }))
}

// ----- HIDRATAR LOCAL A PARTIR DO SUPABASE -----

export async function hidratarTudo(): Promise<{ ok: boolean; erro?: string }> {
  const sb = getSupabase()
  if (!sb) return { ok: false, erro: 'sb não configurado' }
  const user = await getUser()
  if (!user) return { ok: false, erro: 'sem sessão' }

  try {
    const [diasR, alcoolR, medidasR, desabafoR, insightsR] = await Promise.all([
      sb.from('fenixfit_dias').select('*').eq('user_id', user.id),
      sb.from('fenixfit_alcool').select('*').eq('user_id', user.id),
      sb.from('fenixfit_medidas').select('*').eq('user_id', user.id),
      sb.from('fenixfit_desabafo').select('*').eq('user_id', user.id),
      sb.from('fenixfit_insights').select('*').eq('user_id', user.id)
    ])

    if (diasR.error) throw diasR.error

    const diasMap: Record<string, DiaLog> = {}
    diasR.data?.forEach(d => {
      diasMap[d.date] = {
        date: d.date,
        ancoras: d.ancoras ?? {},
        treinoFeito: d.treino_feito,
        caminhadaMin: d.caminhada_min,
        sonoHoras: d.sono_horas !== null ? Number(d.sono_horas) : null,
        energia: d.energia,
        humor: d.humor,
        notas: d.notas ?? ''
      }
    })
    write('dias', diasMap)

    const alcoolList: AlcoolRegisto[] = (alcoolR.data ?? []).map(a => ({
      id: a.id,
      timestamp: a.timestamp,
      unidades: a.unidades,
      emocao: a.emocao,
      gatilho: a.gatilho,
      decidiuBeber: a.decidiu_beber
    }))
    write('alcool', alcoolList)

    const medidasList: MedidaRegisto[] = (medidasR.data ?? []).map(m => ({
      id: m.id,
      date: m.date,
      cintura: m.cintura !== null ? Number(m.cintura) : null,
      ancas: m.ancas !== null ? Number(m.ancas) : null,
      coxa: m.coxa !== null ? Number(m.coxa) : null,
      braco: m.braco !== null ? Number(m.braco) : null,
      peso: m.peso !== null ? Number(m.peso) : null,
      sentir: m.sentir ?? '',
      mudou: m.mudou ?? ''
    }))
    write('medidas', medidasList)

    const desabafoList: DesabafoEntry[] = (desabafoR.data ?? []).map(d => ({
      id: d.id,
      timestamp: d.timestamp,
      texto: d.texto,
      emocao: d.emocao ?? ''
    }))
    write('desabafo', desabafoList)

    const insightsMap: Record<string, InsightCache> = {}
    insightsR.data?.forEach(i => {
      insightsMap[i.week_start] = {
        weekStart: i.week_start,
        texto: i.texto,
        geradoEm: i.gerado_em
      }
    })
    write('insights', insightsMap)

    localStorage.setItem('fenixfit:lastSync', new Date().toISOString())

    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro' }
  }
}

// ----- SYNC INDIVIDUAIS -----

export async function syncDia(log: DiaLog): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  await sb.from('fenixfit_dias').upsert(
    {
      user_id: user.id,
      date: log.date,
      ancoras: log.ancoras,
      treino_feito: log.treinoFeito,
      caminhada_min: log.caminhadaMin,
      sono_horas: log.sonoHoras,
      energia: log.energia,
      humor: log.humor,
      notas: log.notas
    },
    { onConflict: 'user_id,date' }
  )
}

export async function syncAlcool(r: AlcoolRegisto): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  await sb.from('fenixfit_alcool').insert({
    id: r.id,
    user_id: user.id,
    timestamp: r.timestamp,
    unidades: r.unidades,
    emocao: r.emocao,
    gatilho: r.gatilho,
    decidiu_beber: r.decidiuBeber
  })
}

export async function syncMedida(m: MedidaRegisto): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  await sb.from('fenixfit_medidas').insert({
    id: m.id,
    user_id: user.id,
    date: m.date,
    cintura: m.cintura,
    ancas: m.ancas,
    coxa: m.coxa,
    braco: m.braco,
    peso: m.peso,
    sentir: m.sentir,
    mudou: m.mudou
  })
}

export async function syncDesabafo(d: DesabafoEntry): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  await sb.from('fenixfit_desabafo').insert({
    id: d.id,
    user_id: user.id,
    timestamp: d.timestamp,
    texto: d.texto,
    emocao: d.emocao
  })
}

export async function syncInsight(c: InsightCache): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  await sb.from('fenixfit_insights').upsert(
    {
      user_id: user.id,
      week_start: c.weekStart,
      texto: c.texto,
      gerado_em: c.geradoEm
    },
    { onConflict: 'user_id,week_start' }
  )
}

export async function syncProfile(p: Record<string, unknown>): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  await sb.from('fenixfit_profile').upsert({
    user_id: user.id,
    nome: p.nome,
    sexo: p.sexo,
    peso_inicial: p.pesoInicial,
    cintura_inicial: p.cinturaInicial,
    acorda_tipico: p.acordaTipico,
    deita_tipico: p.deitaTipico,
    treino_preferido: p.treinoPreferido,
    gatilhos_alcool: p.gatilhosAlcool,
    notificacoes_ativas: p.notificacoesAtivas,
    onboarding_completo: p.onboardingCompleto,
    inicio_plano: p.inicioPlano,
    duracao_plano: p.duracaoPlano
  })
}

export function lastSyncTime(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('fenixfit:lastSync')
}
