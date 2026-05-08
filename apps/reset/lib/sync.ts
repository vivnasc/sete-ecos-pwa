'use client'

import { getSupabase } from './supabase'
import { getUser } from './auth'
import type { DiaLog, AlcoolRegisto, MedidaRegisto, DesabafoEntry, InsightCache, PesoLog, JejumLog, CicloLog, CoachMensagem, Refeicao } from './storage'

const PREFIX = 'fenixfit:'
const SYNC_ERR_KEY = 'fenixfit:lastSyncError'

function registarErroSync(area: string, err: unknown): void {
  if (typeof window === 'undefined') return
  const msg = err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : 'erro desconhecido'
  const data = { area, msg, at: new Date().toISOString() }
  try {
    localStorage.setItem(SYNC_ERR_KEY, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent('fenixfit:syncError', { detail: data }))
  } catch {}
  // eslint-disable-next-line no-console
  console.warn(`[fenixfit sync ${area}]`, msg)
}

function limparErroSync(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SYNC_ERR_KEY)
  window.dispatchEvent(new CustomEvent('fenixfit:syncError', { detail: null }))
}

export function getUltimoErroSync(): { area: string; msg: string; at: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SYNC_ERR_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

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
    const [diasR, alcoolR, medidasR, desabafoR, insightsR, pesoR, jejumR, cicloR, profileR, coachR, refeicoesR] = await Promise.all([
      sb.from('fenixfit_dias').select('*').eq('user_id', user.id),
      sb.from('fenixfit_alcool').select('*').eq('user_id', user.id),
      sb.from('fenixfit_medidas').select('*').eq('user_id', user.id),
      sb.from('fenixfit_desabafo').select('*').eq('user_id', user.id),
      sb.from('fenixfit_insights').select('*').eq('user_id', user.id),
      sb.from('fenixfit_peso').select('*').eq('user_id', user.id),
      sb.from('fenixfit_jejum').select('*').eq('user_id', user.id),
      sb.from('fenixfit_ciclo').select('*').eq('user_id', user.id),
      sb.from('fenixfit_profile').select('*').eq('user_id', user.id).maybeSingle(),
      sb.from('fenixfit_coach_chat').select('*').eq('user_id', user.id).order('timestamp', { ascending: true }).limit(500),
      sb.from('fenixfit_refeicoes').select('*').eq('user_id', user.id).order('timestamp', { ascending: true }).limit(1000)
    ])

    if (diasR.error) throw diasR.error

    // Profile · primeira coisa para garantir onboarding state
    if (profileR.data) {
      const p = profileR.data
      const profile = {
        nome: p.nome ?? '',
        sexo: p.sexo ?? 'F',
        pesoInicial: p.peso_inicial !== null ? Number(p.peso_inicial) : null,
        cinturaInicial: p.cintura_inicial !== null ? Number(p.cintura_inicial) : null,
        acordaTipico: p.acorda_tipico ?? '06:30',
        deitaTipico: p.deita_tipico ?? '22:30',
        treinoPreferido: p.treino_preferido ?? 'manhã',
        gatilhosAlcool: p.gatilhos_alcool ?? [],
        notificacoesAtivas: p.notificacoes_ativas ?? false,
        onboardingCompleto: p.onboarding_completo ?? false,
        inicioPlano: p.inicio_plano ?? '2026-05-11',
        duracaoPlano: p.duracao_plano ?? 60,
        syncSupabase: true,
        emailSync: user.email ?? '',
        ancorasActivas: p.ancoras_activas ?? undefined,
        ancorasCustom: p.ancoras_custom ?? [],
        metas: p.metas ?? { calorias: null, proteinaG: null, carboG: null, gorduraG: null },
        modoViagem: p.modo_viagem ?? false,
        objectivos: p.objectivos ?? [],
        alturaCm: p.altura_cm ?? null,
        idade: p.idade ?? null,
        nivelActividade: p.nivel_actividade ?? null
      }
      localStorage.setItem('fenixfit:profile', JSON.stringify(profile))
      window.dispatchEvent(new CustomEvent('fenixfit:profile', { detail: profile }))
    }

    const diasServidor: Record<string, DiaLog> = {}
    diasR.data?.forEach(d => {
      diasServidor[d.date] = {
        date: d.date,
        ancoras: d.ancoras ?? {},
        treinoFeito: d.treino_feito,
        caminhadaMin: d.caminhada_min,
        sonoHoras: d.sono_horas !== null ? Number(d.sono_horas) : null,
        energia: d.energia,
        humor: d.humor,
        notas: d.notas ?? '',
        aguaCopos: d.agua_copos ?? 0,
        suplementos: d.suplementos ?? [],
        transitoIntestinal: d.transito_intestinal ?? null,
        horaDeitar: d.hora_deitar ?? null,
        qualidadeSono: d.qualidade_sono ?? null,
        acordouVezes: d.acordou_vezes ?? null,
        sintomasPeri: d.sintomas_peri ?? [],
        steps: d.steps ?? null,
        rhr: d.rhr ?? null
      }
    })
    // MERGE: servidor wins, mas datas só locais ficam preservadas
    const diasLocais = read<Record<string, DiaLog>>('dias', {})
    const diasMerge: Record<string, DiaLog> = { ...diasLocais, ...diasServidor }
    write('dias', diasMerge)
    // Push para servidor as datas que estavam só locais
    for (const data of Object.keys(diasLocais)) {
      if (!diasServidor[data]) {
        void syncDia(diasLocais[data]).catch(() => {})
      }
    }

    const alcoolList: AlcoolRegisto[] = (alcoolR.data ?? []).map(a => ({
      id: a.id,
      timestamp: a.timestamp,
      unidades: a.unidades,
      emocao: a.emocao,
      gatilho: a.gatilho,
      decidiuBeber: a.decidiu_beber
    }))
    {
      const local = read<AlcoolRegisto[]>('alcool', [])
      const idsServidor = new Set(alcoolList.map(x => x.id))
      const apenasLocal = local.filter(x => !idsServidor.has(x.id))
      write('alcool', [...alcoolList, ...apenasLocal])
      for (const x of apenasLocal) void syncAlcool(x).catch(() => {})
    }

    const medidasList: MedidaRegisto[] = (medidasR.data ?? []).map(m => ({
      id: m.id,
      date: m.date,
      cintura: m.cintura !== null ? Number(m.cintura) : null,
      ancas: m.ancas !== null ? Number(m.ancas) : null,
      coxa: m.coxa !== null ? Number(m.coxa) : null,
      braco: m.braco !== null ? Number(m.braco) : null,
      peso: m.peso !== null ? Number(m.peso) : null,
      sentir: m.sentir ?? '',
      mudou: m.mudou ?? '',
      fotoUrl: m.foto_frente_url ?? null
    }))
    {
      const local = read<MedidaRegisto[]>('medidas', [])
      const idsServidor = new Set(medidasList.map(x => x.id))
      const apenasLocal = local.filter(x => !idsServidor.has(x.id))
      write('medidas', [...medidasList, ...apenasLocal])
      for (const x of apenasLocal) void syncMedida(x).catch(() => {})
    }

    const desabafoList: DesabafoEntry[] = (desabafoR.data ?? []).map(d => ({
      id: d.id,
      timestamp: d.timestamp,
      texto: d.texto,
      emocao: d.emocao ?? ''
    }))
    {
      const local = read<DesabafoEntry[]>('desabafo', [])
      const idsServidor = new Set(desabafoList.map(x => x.id))
      const apenasLocal = local.filter(x => !idsServidor.has(x.id))
      write('desabafo', [...desabafoList, ...apenasLocal])
      for (const x of apenasLocal) void syncDesabafo(x).catch(() => {})
    }

    const insightsMap: Record<string, InsightCache> = {}
    insightsR.data?.forEach(i => {
      insightsMap[i.week_start] = {
        weekStart: i.week_start,
        texto: i.texto,
        geradoEm: i.gerado_em
      }
    })
    write('insights', insightsMap)

    const pesoList: PesoLog[] = (pesoR.data ?? []).map(p => ({
      id: p.id,
      date: p.date,
      peso: Number(p.peso),
      cintura: p.cintura !== null && p.cintura !== undefined ? Number(p.cintura) : null,
      hora: p.hora ?? '',
      notas: p.notas ?? ''
    }))
    {
      const local = read<PesoLog[]>('peso', [])
      const datasServidor = new Set(pesoList.map(x => x.date))
      const apenasLocal = local.filter(x => !datasServidor.has(x.date))
      write('peso', [...pesoList, ...apenasLocal])
      for (const x of apenasLocal) void syncPeso(x).catch(() => {})
    }

    const jejumList: JejumLog[] = (jejumR.data ?? []).map(j => ({
      id: j.id,
      date: j.date,
      ultimaRefeicao: j.ultima_refeicao,
      primeiraRefeicao: j.primeira_refeicao,
      duracaoHoras: j.duracao_horas !== null ? Number(j.duracao_horas) : null,
      meta: j.meta ?? 14,
      completou: j.completou ?? false
    }))
    {
      const local = read<JejumLog[]>('jejum', [])
      const datasServidor = new Set(jejumList.map(x => x.date))
      const apenasLocal = local.filter(x => !datasServidor.has(x.date))
      write('jejum', [...jejumList, ...apenasLocal])
      for (const x of apenasLocal) void syncJejum(x).catch(() => {})
    }

    const cicloList: CicloLog[] = (cicloR.data ?? []).map(c => ({
      id: c.id,
      dataInicio: c.data_inicio,
      duracaoCiclo: c.duracao_ciclo,
      duracaoMenstruacao: c.duracao_menstruacao,
      fluxo: c.fluxo,
      sintomas: c.sintomas ?? [],
      cravings: c.cravings ?? [],
      notas: c.notas ?? ''
    }))
    {
      const local = read<CicloLog[]>('ciclo', [])
      const datasServidor = new Set(cicloList.map(x => x.dataInicio))
      const apenasLocal = local.filter(x => !datasServidor.has(x.dataInicio))
      write('ciclo', [...cicloList, ...apenasLocal])
      for (const x of apenasLocal) void syncCiclo(x).catch(() => {})
    }

    const coachList: CoachMensagem[] = (coachR.data ?? []).map(m => ({
      id: m.id,
      timestamp: m.timestamp,
      role: m.role,
      content: m.content
    }))
    write('coach-chat', coachList)

    // Tombstones · IDs apagados localmente que não devem voltar do servidor
    const tombstones = new Set(read<string[]>('tombstones-refeicoes', []))
    const refeicoesList: Refeicao[] = (refeicoesR.data ?? [])
      .filter(r => !tombstones.has(r.id))
      .map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        tipo: r.tipo,
        descricao: r.descricao,
        proteinaG: r.proteina_g !== null && r.proteina_g !== undefined ? Number(r.proteina_g) : null,
        carboG: r.carbo_g !== null && r.carbo_g !== undefined ? Number(r.carbo_g) : null,
        gorduraG: r.gordura_g !== null && r.gordura_g !== undefined ? Number(r.gordura_g) : null,
        calorias: r.calorias !== null && r.calorias !== undefined ? Number(r.calorias) : null,
        contexto: r.contexto ?? '',
        sentir: r.sentir ?? ''
      }))
    // MERGE com o que já estava local · não destruir registos offline
    const localRef = read<Refeicao[]>('refeicoes', [])
    const idsServidor = new Set(refeicoesList.map(r => r.id))
    const apenasLocal = localRef.filter(r => !idsServidor.has(r.id) && !tombstones.has(r.id))
    write('refeicoes', [...refeicoesList, ...apenasLocal])
    // Empurra para o servidor o que não estava lá
    for (const r of apenasLocal) {
      void syncRefeicao(r).catch(() => {})
    }
    // Re-tenta deletar no servidor os que estão em tombstones
    // (caso delete inicial tenha falhado, ex: offline)
    const tombsArray = [...tombstones]
    const idsServerActuais = new Set((refeicoesR.data ?? []).map(r => r.id))
    for (const tombId of tombsArray) {
      if (idsServerActuais.has(tombId)) {
        // ainda existe no servidor · re-tenta delete
        void removeRefeicaoSync(tombId).catch(() => {})
      } else {
        // já não existe no servidor · podemos limpar o tombstone
        const novo = read<string[]>('tombstones-refeicoes', []).filter(t => t !== tombId)
        write('tombstones-refeicoes', novo)
      }
    }

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
  const { error } = await sb.from('fenixfit_dias').upsert(
    {
      user_id: user.id,
      date: log.date,
      ancoras: log.ancoras,
      treino_feito: log.treinoFeito,
      caminhada_min: log.caminhadaMin,
      sono_horas: log.sonoHoras,
      energia: log.energia,
      humor: log.humor,
      notas: log.notas,
      agua_copos: log.aguaCopos,
      suplementos: log.suplementos,
      transito_intestinal: log.transitoIntestinal,
      hora_deitar: log.horaDeitar,
      qualidade_sono: log.qualidadeSono,
      acordou_vezes: log.acordouVezes,
      sintomas_peri: log.sintomasPeri,
      steps: log.steps,
      rhr: log.rhr
    },
    { onConflict: 'user_id,date' }
  )
  if (error) registarErroSync('dia', error)
  else limparErroSync()
}

export async function syncAlcool(r: AlcoolRegisto): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_alcool').insert({
    id: r.id,
    user_id: user.id,
    timestamp: r.timestamp,
    unidades: r.unidades,
    emocao: r.emocao,
    gatilho: r.gatilho,
    decidiu_beber: r.decidiuBeber
  })
  if (error) registarErroSync('alcool', error)
}

export async function syncMedida(m: MedidaRegisto): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_medidas').insert({
    id: m.id,
    user_id: user.id,
    date: m.date,
    cintura: m.cintura,
    ancas: m.ancas,
    coxa: m.coxa,
    braco: m.braco,
    peso: m.peso,
    sentir: m.sentir,
    mudou: m.mudou,
    foto_frente_url: m.fotoUrl
  })
  if (error) registarErroSync('medida', error)
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

export async function syncPeso(p: PesoLog): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_peso').upsert(
    {
      id: p.id,
      user_id: user.id,
      date: p.date,
      peso: p.peso,
      cintura: p.cintura,
      hora: p.hora,
      notas: p.notas
    },
    { onConflict: 'user_id,date' }
  )
  if (error) registarErroSync('peso', error)
}

export async function syncJejum(j: JejumLog): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_jejum').upsert(
    {
      id: j.id,
      user_id: user.id,
      date: j.date,
      ultima_refeicao: j.ultimaRefeicao,
      primeira_refeicao: j.primeiraRefeicao,
      duracao_horas: j.duracaoHoras,
      meta: j.meta,
      completou: j.completou
    },
    { onConflict: 'user_id,date' }
  )
  if (error) registarErroSync('jejum', error)
}

export async function syncCiclo(c: CicloLog): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_ciclo').upsert(
    {
      id: c.id,
      user_id: user.id,
      data_inicio: c.dataInicio,
      duracao_ciclo: c.duracaoCiclo,
      duracao_menstruacao: c.duracaoMenstruacao,
      fluxo: c.fluxo,
      sintomas: c.sintomas,
      cravings: c.cravings,
      notas: c.notas
    },
    { onConflict: 'user_id,data_inicio' }
  )
  if (error) registarErroSync('ciclo', error)
}

export async function syncCoachMensagem(m: CoachMensagem): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_coach_chat').insert({
    id: m.id,
    user_id: user.id,
    timestamp: m.timestamp,
    role: m.role,
    content: m.content
  })
  if (error) registarErroSync('coach', error)
}

export async function syncRefeicao(r: Refeicao): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_refeicoes').upsert({
    id: r.id,
    user_id: user.id,
    timestamp: r.timestamp,
    tipo: r.tipo,
    descricao: r.descricao,
    proteina_g: r.proteinaG,
    carbo_g: r.carboG,
    gordura_g: r.gorduraG,
    calorias: r.calorias,
    contexto: r.contexto,
    sentir: r.sentir
  })
  if (error) registarErroSync('refeicao', error)
}

export async function removeRefeicaoSync(id: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_refeicoes').delete().eq('id', id).eq('user_id', user.id)
  if (error) registarErroSync('refeicao-delete', error)
}

// Encontra refeições duplicadas (mesmo dia, mesmo tipo, descrição similar).
// Não apaga · só agrupa para a UI mostrar.
export type GrupoDuplicado = {
  date: string
  tipo: string
  descricao: string
  ids: string[]      // todos os IDs do grupo (incluindo o "original" no início)
  manter: string     // ID a manter (o primeiro, mais antigo)
  apagar: string[]   // IDs a apagar (os duplicados)
}

export function detectarDuplicadosRefeicoes(): GrupoDuplicado[] {
  if (typeof window === 'undefined') return []
  let lista: { id: string; timestamp: string; tipo: string; descricao: string }[]
  try {
    lista = JSON.parse(localStorage.getItem(PREFIX + 'refeicoes') ?? '[]')
  } catch { return [] }

  // Normaliza descrição: lowercase, sem acentos, sem palavras curtas
  const normalizar = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .sort()
    .join(' ')

  const grupos = new Map<string, { id: string; timestamp: string }[]>()
  lista.forEach(r => {
    const date = r.timestamp.slice(0, 10)
    const chave = `${date}|${r.tipo}|${normalizar(r.descricao)}`
    const arr = grupos.get(chave) ?? []
    arr.push({ id: r.id, timestamp: r.timestamp })
    grupos.set(chave, arr)
  })

  const resultado: GrupoDuplicado[] = []
  grupos.forEach((items, chave) => {
    if (items.length < 2) return
    const sorted = [...items].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    const [date, tipo, descNorm] = chave.split('|')
    // Recupera descrição original do primeiro
    const original = lista.find(r => r.id === sorted[0].id)
    resultado.push({
      date,
      tipo,
      descricao: original?.descricao ?? descNorm,
      ids: sorted.map(s => s.id),
      manter: sorted[0].id,
      apagar: sorted.slice(1).map(s => s.id)
    })
  })
  return resultado
}

export async function syncProfile(p: Record<string, unknown>): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const user = await getUser()
  if (!user) return
  const { error } = await sb.from('fenixfit_profile').upsert({
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
    duracao_plano: p.duracaoPlano,
    ancoras_activas: p.ancorasActivas,
    ancoras_custom: p.ancorasCustom,
    metas: p.metas ?? null,
    modo_viagem: p.modoViagem ?? false,
    objectivos: p.objectivos ?? [],
    altura_cm: p.alturaCm ?? null,
    idade: p.idade ?? null,
    nivel_actividade: p.nivelActividade ?? null
  })
  if (error) registarErroSync('profile', error)
}

export function lastSyncTime(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('fenixfit:lastSync')
}
