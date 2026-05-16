// Cloudflare Pages Function: /api/insights
// Edge runtime nativo · sem next-on-pages

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM_PROMPT = `És analista de dados em diálogo com a Vivianne · Precision Nutrition L1.

O QUE ELA QUER (literal, dito por ela):
"o foco dela n devia ser no resultado · falou muito e n disse nada · me senti
vazia depois de uma semana super dedicada"

Significado prático: ela trabalhou a semana toda e quer ler em 60 segundos
O QUE MUDOU, O QUE FUNCIONOU, O QUE FALHOU, O QUE AJUSTAR. Sem prosa
descritiva. Sem narrativa lirica. Cada frase tem de pagar pelo seu espaço.

ESTRUTURA OBRIGATÓRIA · 5 micro-blocos · 1-2 frases cada:

NÚMEROS (o que mudou esta semana)
- Peso/cintura/composição/sono médio/álcool · só os deltas que existem.
- Ex: "peso -0.4kg · cintura -1cm · sono 7.1h média (vs 6.4h anterior se houver)"
- Se faltar dado · ignora a métrica · NÃO digas 'sem dados'.

VITÓRIA (o que correu bem · uma só · concreta)
- Identifica o melhor padrão. Ex: "6 dias sem álcool incluindo o jantar X
  (notas literais)" · "jejum 14h cumprido 5 vezes" · etc.

RISCO (o que merece atenção · um só · com dado)
- O padrão que ameaça resultados. Ex: "sono caiu para 6h em 3 dias · energia
  segue · isso compromete recuperação keto" · "0 treinos marcados · se foi
  intencional ignora · se não, é o gap"

AJUSTE (1 acção concreta para semana seguinte)
- Específico, mensurável, alcançável. Ex: "marca 2 treinos esta semana ·
  ter ou seg-qua-sex às 7h" · NÃO "tenta dormir mais"
- Se metas (kcal/macros) parecem desalinhadas com resultado, propõe ajuste
  numérico.

CONTEXTO ÚNICO (opcional · só se relevante)
- Uma frase única que liga a fisiologia/perimenopausa/keto/medicação ao
  que viste. Ex: "fase pós-Mounjaro · apetite a regressar é esperado · não
  é falha"

REGRAS DE TOM:
- Português europeu informal · acentos · tutear sempre
- Frases curtas · denso · zero floreios
- NUNCA: 'tu consegues', 'incrível', emojis, exclamações
- NÃO inventes contexto. Notas literais podes citar entre aspas.
- 'âncora treino_feito sem marca' NÃO é 'não treinou' · diz no máximo
  'sem registo de treino marcado · se treinaste, vale marcar'

FORMATO FINAL:
- Cabeçalhos curtos em maiúsculas (NÚMEROS / VITÓRIA / RISCO / AJUSTE)
- Cada bloco 1-2 frases · total <100 palavras
- Pode falhar um bloco se faltar dado · não inventes para encher`

type DadosSemana = {
  weekStart: string
  perfil?: {
    idade: number | null
    sexo: string
    alturaCm: number | null
    historicoClinico: string
    preferenciasAlimentares: string
    metas: { calorias: number | null; proteinaG: number | null; carboG: number | null; gorduraG: number | null }
  }
  dias: Array<{
    date: string
    ancorasCumpridas: number
    treinoFeito: boolean
    sonoHoras: number | null
    energia: number | null
    humor: number | null
    notas: string
    macros?: { kcal: number; p: number; c: number; g: number; n: number } | null
  }>
  alcool: Array<{ timestamp: string; unidades: number; emocao: string; gatilho: string; decidiuBeber: boolean }>
  medidas: Array<{ date: string; cintura: number | null; peso: number | null }>
  pesos?: Array<{ date: string; peso: number; cintura: number | null }>
  jejuns?: Array<{ date: string; duracaoHoras: number | null; completou: boolean; meta: number }>
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let dados: DadosSemana
  try {
    dados = (await context.request.json()) as DadosSemana
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!dados.dias || dados.dias.length === 0) {
    return Response.json({ error: 'Sem dados da semana' }, { status: 400 })
  }

  const userContent = construirContexto(dados)

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: [
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
        ],
        messages: [{ role: 'user', content: userContent }]
      })
    })

    if (!r.ok) {
      const errBody = await r.text()
      return Response.json({ error: `anthropic ${r.status}: ${errBody.slice(0, 200)}` }, { status: 500 })
    }

    const json = (await r.json()) as { content: Array<{ type: string; text?: string }>; usage: unknown }
    const texto = json.content
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('\n')
      .trim()

    return Response.json({ texto, usage: json.usage })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'erro' }, { status: 500 })
  }
}

function construirContexto(d: DadosSemana): string {
  const linhas: string[] = []
  linhas.push(`Semana com início em ${d.weekStart}.`)

  // PERFIL · ela quer leitura contextualizada
  if (d.perfil) {
    linhas.push('', 'PERFIL DA VIVIANNE:')
    if (d.perfil.idade) linhas.push(`· ${d.perfil.idade} anos · ${d.perfil.sexo}`)
    if (d.perfil.alturaCm) linhas.push(`· altura ${d.perfil.alturaCm}cm`)
    if (d.perfil.metas?.calorias) linhas.push(`· metas: ${d.perfil.metas.calorias}kcal · ${d.perfil.metas.proteinaG ?? '?'}gP · ${d.perfil.metas.carboG ?? '?'}gC · ${d.perfil.metas.gorduraG ?? '?'}gG`)
    if (d.perfil.historicoClinico?.trim()) linhas.push(`· HISTÓRICO CLÍNICO (factor-iza na leitura):\n  ${d.perfil.historicoClinico.trim()}`)
    if (d.perfil.preferenciasAlimentares?.trim()) linhas.push(`· PROTOCOLO ALIMENTAR (adapta recomendações):\n  ${d.perfil.preferenciasAlimentares.trim()}`)
  }

  // PESO · deltas (esta semana vs anterior)
  if (d.pesos && d.pesos.length > 0) {
    linhas.push('', 'PESO (esta semana + anterior · para deltas):')
    d.pesos.forEach(p => {
      linhas.push(`· ${p.date}: ${p.peso}kg${p.cintura ? ` · cintura ${p.cintura}cm` : ''}`)
    })
  }

  // MACROS por dia
  const diasComMacros = d.dias.filter(x => x.macros && x.macros.n > 0)
  if (diasComMacros.length > 0) {
    linhas.push('', 'MACROS POR DIA (kcal · P · C · G · refeicoes):')
    diasComMacros.forEach(dia => {
      const m = dia.macros!
      linhas.push(`· ${dia.date}: ${m.kcal}kcal · ${Math.round(m.p)}gP · ${Math.round(m.c)}gC · ${Math.round(m.g)}gG · ${m.n} ref`)
    })
    // Médias
    const tot = diasComMacros.reduce((a, x) => ({ kcal: a.kcal + x.macros!.kcal, p: a.p + x.macros!.p, c: a.c + x.macros!.c, g: a.g + x.macros!.g }), { kcal: 0, p: 0, c: 0, g: 0 })
    const n = diasComMacros.length
    linhas.push(`· MÉDIA: ${Math.round(tot.kcal / n)}kcal · ${Math.round(tot.p / n)}gP · ${Math.round(tot.c / n)}gC · ${Math.round(tot.g / n)}gG`)
  }

  // JEJUM
  if (d.jejuns && d.jejuns.length > 0) {
    linhas.push('', 'JEJUM:')
    d.jejuns.forEach(j => {
      linhas.push(`· ${j.date}: ${j.duracaoHoras ?? '?'}h · meta ${j.meta}h · ${j.completou ? 'cumprido' : 'não cumprido'}`)
    })
  }

  linhas.push('', 'DIAS · ÂNCORAS + SONO + HUMOR + NOTAS:')
  d.dias.forEach(dia => {
    const partes = [
      `${dia.date}:`,
      `âncoras ${dia.ancorasCumpridas}/7`,
      dia.treinoFeito ? 'âncora treino marcada' : 'âncora treino sem marca',
      dia.sonoHoras !== null ? `sono ${dia.sonoHoras}h` : 'sono sem registo',
      dia.energia !== null ? `energia ${dia.energia}/5` : 'energia sem registo',
      dia.humor !== null ? `humor ${dia.humor}/5` : 'humor sem registo'
    ].filter(Boolean)
    linhas.push('· ' + partes.join(' · '))
    if (dia.notas) linhas.push(`  notas (literal · podes citar): "${dia.notas.slice(0, 200)}"`)
  })

  if (d.alcool.length > 0) {
    linhas.push('', 'ÁLCOOL:')
    d.alcool.forEach(a => {
      linhas.push(`· ${a.timestamp.slice(0, 10)} ${a.timestamp.slice(11, 16)} · ${a.decidiuBeber ? `${a.unidades}u` : 'não bebeu'} · ${a.emocao}${a.gatilho ? ` · gatilho literal: "${a.gatilho.slice(0, 100)}"` : ''}`)
    })
  } else {
    linhas.push('', 'ÁLCOOL: nenhum registo esta semana.')
  }

  if (d.medidas.length > 0) {
    linhas.push('', 'MEDIDAS:')
    d.medidas.forEach(m => {
      linhas.push(`· ${m.date}: cintura ${m.cintura ?? '?'}cm${m.peso ? `, peso ${m.peso}kg` : ''}`)
    })
  }

  linhas.push('', 'GERA AGORA · 5 BLOCOS · NÚMEROS / VITÓRIA / RISCO / AJUSTE / CONTEXTO ÚNICO.')
  linhas.push('Cada bloco 1-2 frases. Total <100 palavras. Cabeçalhos em MAIÚSCULAS.')
  linhas.push('Pode faltar um bloco se faltar dado · NÃO inventes para encher.')
  return linhas.join('\n')
}
