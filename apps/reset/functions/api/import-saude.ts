// Cloudflare Pages Function: /api/import-saude
// Endpoint para Auto Health Export postar JSON directamente · sem app aberta.
//
// SETUP no Auto Health Export (iOS):
//   1. Definições > Automation > REST API
//   2. URL: https://sete-ecos-pwa.pages.dev/api/import-saude?token=SEGREDO
//   3. Method: POST · Body: JSON
//   4. Agenda: diário às 08:00 (ou quando preferires)
//
// Cloudflare Pages env vars necessárias (Settings > Environment variables):
//   FENIX_IMPORT_TOKEN · segredo aleatório · também na URL acima
//   SUPABASE_URL · ex: https://xxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY · service role key (NÃO a anon)
//   FENIX_USER_ID · user_id da Vivianne em auth.users (UUID)

interface Env {
  FENIX_IMPORT_TOKEN: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  FENIX_USER_ID: string
}

type EntradaPreview = {
  date: string
  steps?: number
  rhr?: number
  sonoHoras?: number
  treino?: boolean
  treinoTipo?: string
}

// Mesmo parser do cliente · server-side · aceita Auto Health Export e variantes
function parsearJson(json: unknown): EntradaPreview[] {
  const mapa = new Map<string, EntradaPreview>()
  const meter = (date: string, patch: Partial<EntradaPreview>) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
    const cur = mapa.get(date) ?? { date }
    if (patch.sonoHoras !== undefined && cur.sonoHoras !== undefined) {
      cur.sonoHoras = Math.round((cur.sonoHoras + patch.sonoHoras) * 10) / 10
    } else {
      Object.assign(cur, patch)
    }
    mapa.set(date, cur)
  }

  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const obj = json as Record<string, unknown>
    const dataRoot = (obj.data as { metrics?: Array<Record<string, unknown>>; workouts?: Array<Record<string, unknown>> } | undefined) ?? {}
    const metrics = dataRoot.metrics
    if (Array.isArray(metrics)) {
      metrics.forEach(m => {
        const nome = String(m.name ?? '').toLowerCase()
        const unidade = String(m.units ?? '').toLowerCase()
        const datapoints = Array.isArray(m.data) ? m.data : []
        datapoints.forEach((dp: unknown) => {
          const p = dp as Record<string, unknown>
          const rawData = String(p.date ?? p.startDate ?? p.start ?? '').slice(0, 10)
          if (!rawData) return
          const qty = Number(p.qty) || Number(p.value) || Number(p.asleep) || Number(p.inBed) || 0
          if (!qty) return
          if (nome.includes('step')) meter(rawData, { steps: qty })
          else if (nome.includes('sleep') || nome.includes('asleep') || nome === 'time_in_bed') {
            const asleep = Number(p.asleep) || Number(p.totalSleep) || 0
            const sleepValue = asleep || qty
            const horas = sleepValue > 16 ? sleepValue / 60 : sleepValue
            if (horas >= 2) meter(rawData, { sonoHoras: Math.round(horas * 10) / 10 })
          }
          else if ((nome.includes('resting') || nome.includes('rhr')) && (nome.includes('heart') || unidade.includes('bpm'))) {
            meter(rawData, { rhr: qty })
          }
        })
      })
    }
    const workouts = dataRoot.workouts
    if (Array.isArray(workouts)) {
      workouts.forEach(w => {
        const tipo = String(w.name ?? w.workoutType ?? 'Treino')
        const start = String(w.start ?? w.startDate ?? '').slice(0, 10)
        if (!start) return
        let durMin: number | null = null
        if (typeof w.duration === 'number') durMin = Math.round(w.duration / 60)
        else if (w.start && w.end) {
          const ms = new Date(String(w.end)).getTime() - new Date(String(w.start)).getTime()
          if (!Number.isNaN(ms)) durMin = Math.round(ms / 60000)
        }
        const desc = durMin ? `${tipo} ${durMin}min` : tipo
        meter(start, { treino: true, treinoTipo: desc })
      })
    }
  }

  return [...mapa.values()].sort((a, b) => a.date.localeCompare(b.date))
}

async function upsertDia(env: Env, entrada: EntradaPreview): Promise<{ ok: boolean; erro?: string }> {
  // 1. Lê o registo existente (precisa preservar âncoras já marcadas)
  const getRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/fenixfit_dias?user_id=eq.${env.FENIX_USER_ID}&date=eq.${entrada.date}&select=*`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  if (!getRes.ok) return { ok: false, erro: `get ${getRes.status}` }
  const existing = await getRes.json() as Array<Record<string, unknown>>
  const row = existing[0] ?? null

  // 2. Constrói o patch
  const ancoras = (row?.ancoras as Record<string, boolean>) ?? {}
  if (entrada.treino) ancoras.treino_feito = true

  const notas = (row?.notas as string) ?? ''
  const novaNota = entrada.treinoTipo && !notas.includes(entrada.treinoTipo)
    ? (notas ? `${notas}\n${entrada.treinoTipo}` : entrada.treinoTipo)
    : notas

  const payload: Record<string, unknown> = {
    user_id: env.FENIX_USER_ID,
    date: entrada.date,
    ancoras,
    notas: novaNota
  }
  if (entrada.steps !== undefined) payload.steps = Math.round(entrada.steps)
  if (entrada.rhr !== undefined) payload.rhr = Math.round(entrada.rhr)
  if (entrada.sonoHoras !== undefined) payload.sono_horas = entrada.sonoHoras

  // 3. Upsert
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/fenixfit_dias?on_conflict=user_id,date`,
    {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(payload)
    }
  )
  if (!res.ok) {
    const txt = await res.text()
    return { ok: false, erro: `upsert ${res.status}: ${txt.slice(0, 150)}` }
  }
  return { ok: true }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const token = url.searchParams.get('token')

  if (!context.env.FENIX_IMPORT_TOKEN || token !== context.env.FENIX_IMPORT_TOKEN) {
    return Response.json({ error: 'token inválido' }, { status: 401 })
  }
  if (!context.env.SUPABASE_URL || !context.env.SUPABASE_SERVICE_ROLE_KEY || !context.env.FENIX_USER_ID) {
    return Response.json({ error: 'env vars em falta · ver setup' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await context.request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const entradas = parsearJson(body)
  if (entradas.length === 0) {
    return Response.json({ ok: false, msg: 'nenhuma entrada reconhecida no JSON' })
  }

  const resultados = await Promise.all(entradas.map(e => upsertDia(context.env, e)))
  const sucessos = resultados.filter(r => r.ok).length
  const erros = resultados.filter(r => !r.ok).map(r => r.erro).slice(0, 5)

  return Response.json({
    ok: sucessos > 0,
    total: entradas.length,
    sucessos,
    falhas: entradas.length - sucessos,
    erros: erros.length > 0 ? erros : undefined,
    detalhe: {
      passos: entradas.filter(e => e.steps !== undefined).length,
      sono: entradas.filter(e => e.sonoHoras !== undefined).length,
      rhr: entradas.filter(e => e.rhr !== undefined).length,
      treinos: entradas.filter(e => e.treino).length
    }
  })
}

// GET para testar configuração rapidamente
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const token = url.searchParams.get('token')
  if (!context.env.FENIX_IMPORT_TOKEN || token !== context.env.FENIX_IMPORT_TOKEN) {
    return Response.json({ error: 'token inválido' }, { status: 401 })
  }
  const config = {
    SUPABASE_URL: context.env.SUPABASE_URL ? 'definido' : 'EM FALTA',
    SUPABASE_SERVICE_ROLE_KEY: context.env.SUPABASE_SERVICE_ROLE_KEY ? 'definido' : 'EM FALTA',
    FENIX_USER_ID: context.env.FENIX_USER_ID ? 'definido' : 'EM FALTA'
  }
  return Response.json({ ok: true, msg: 'endpoint vivo · usa POST com JSON do Auto Health Export', config })
}
