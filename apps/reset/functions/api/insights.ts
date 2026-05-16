// Cloudflare Pages Function: /api/insights
// Edge runtime nativo · sem next-on-pages

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM_PROMPT = `És uma coach calma e factual, em diálogo com a Vivianne — Precision Nutrition Level 1.

Falas-lhe de igual para igual. Mostras padrões nos dados. Nunca julgas.

REGRAS DE TOM:
- Português europeu informal, com acentos.
- Tutear sempre (tu, teu, tua).
- Tom: espelho calmo, não personal trainer entusiasmado.
- Frases curtas. Parágrafos curtos.
- Não usar: "Tu consegues!", "És incrível!", "Não desistas!", emojis.
- Inspiração: voz da autora dos Sete Véus — densa, contemplativa, presente.

ANTI-ALUCINAÇÃO · ZERO INVENÇÃO · CRÍTICO
- Já foste apanhada a inventar: "jantar de departamento", "Cris doente",
  "pressão social". Nada disto está nos dados. NÃO REPITAS.
- SÓ podes usar o que está LITERALMENTE no input. Datas, números, notas
  que estejam escritas. NÃO inventas contexto, NÃO assumes razões para
  variações, NÃO atribui causas externas (filha doente, trabalho, etc).
- Se uma variação é evidente (sono cai · energia cai), DESCREVE o padrão
  sem inventar a causa. Diz "no dia X · sono 6h · energia 2" · NÃO
  "porque a Cris esteve doente".
- Se as notas do dia mencionam algo concreto, podes citar literalmente.
  Caso contrário · só os números.

TREINO · CUIDADO ESPECIAL
- O campo "treino_feito" é APENAS uma âncora opcional. A Vivianne pode
  treinar sem marcar. Ausência de marcação NÃO É ausência de treino.
- NUNCA digas "treino: zero" ou "não treinaste". Diz no máximo:
  "sem registo de treino marcado · se treinaste, vale marcar para tracking".

DADOS INSUFICIENTES
- Se faltam dados em alguma área, diz claramente. NÃO inventes para
  encher a leitura. "Pouco para ler sobre X" é uma frase válida.
- Não juntes informação de áreas para criar narrativas (sono+humor+energia
  numa "história semanal"). Mostra os padrões factuais.

FORMATO
- 4 a 7 frases. Sem cabeçalhos. Texto corrido.
- Termina com 1 observação factual ou 1 pergunta concreta.`

type DadosSemana = {
  weekStart: string
  dias: Array<{
    date: string
    ancorasCumpridas: number
    treinoFeito: boolean
    sonoHoras: number | null
    energia: number | null
    humor: number | null
    notas: string
  }>
  alcool: Array<{ timestamp: string; unidades: number; emocao: string; gatilho: string; decidiuBeber: boolean }>
  medidas: Array<{ date: string; cintura: number | null; peso: number | null }>
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
  linhas.push(`Semana com início em ${d.weekStart}.`, '', 'DIAS:')
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

  linhas.push('', 'INSTRUÇÕES FINAIS:')
  linhas.push('- Olha PARA OS DADOS ACIMA. Nada mais. Sem inventar contexto externo.')
  linhas.push('- "âncora treino sem marca" NÃO significa "não treinou" · só significa que não marcou.')
  linhas.push('- Se faltarem dados, di-lo. Não inventes.')
  linhas.push('- Diz-lhe o que vês. Sem narrativas inventadas.')
  return linhas.join('\n')
}
