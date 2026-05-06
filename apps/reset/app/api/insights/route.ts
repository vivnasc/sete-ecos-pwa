import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `És uma coach calma e factual, em diálogo com a Vivianne — Precision Nutrition Level 1.

Falas-lhe de igual para igual. Mostras padrões nos dados. Nunca julgas.

REGRAS:
- Português europeu informal, com acentos.
- Tutear sempre (tu, teu, tua).
- Tom: espelho calmo, não personal trainer entusiasmado.
- Frases curtas. Parágrafos curtos.
- Não usar: "Tu consegues!", "És incrível!", "Não desistas!", emojis.
- Usar: factos, padrões, observações neutras.
- Inspiração: voz da autora dos Sete Véus — densa, contemplativa, presente.
- Identifica padrões reais. Se não houver dados suficientes, di-lo.
- Sublinha o que está a funcionar. Aponta o que merece atenção.
- Resposta curta: 4 a 7 frases. Sem cabeçalhos. Texto corrido.`

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

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let dados: DadosSemana
  try {
    dados = (await request.json()) as DadosSemana
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!dados.dias || dados.dias.length === 0) {
    return NextResponse.json({ error: 'Sem dados da semana' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })

  const userContent = construirContexto(dados)

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: userContent
        }
      ]
    })

    const texto = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { text: string }).text)
      .join('\n')
      .trim()

    return NextResponse.json({
      texto,
      usage: response.usage
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function construirContexto(d: DadosSemana): string {
  const linhas: string[] = []
  linhas.push(`Semana com início em ${d.weekStart}.`)
  linhas.push('')
  linhas.push('DIAS:')
  d.dias.forEach(dia => {
    const partes = [
      `${dia.date}:`,
      `âncoras ${dia.ancorasCumpridas}/7`,
      dia.treinoFeito ? 'treino ✓' : 'treino —',
      dia.sonoHoras !== null ? `sono ${dia.sonoHoras}h` : 'sono ?',
      dia.energia !== null ? `energia ${dia.energia}/5` : '',
      dia.humor !== null ? `humor ${dia.humor}/5` : ''
    ].filter(Boolean)
    linhas.push('· ' + partes.join(' · '))
    if (dia.notas) linhas.push(`  notas: ${dia.notas.slice(0, 200)}`)
  })

  if (d.alcool.length > 0) {
    linhas.push('')
    linhas.push('ÁLCOOL:')
    d.alcool.forEach(a => {
      linhas.push(`· ${a.timestamp.slice(0, 10)} ${a.timestamp.slice(11, 16)} · ${a.decidiuBeber ? `${a.unidades}u` : 'não bebeu'} · ${a.emocao}${a.gatilho ? ` · "${a.gatilho.slice(0, 100)}"` : ''}`)
    })
  } else {
    linhas.push('')
    linhas.push('ÁLCOOL: nenhum registo esta semana.')
  }

  if (d.medidas.length > 0) {
    linhas.push('')
    linhas.push('MEDIDAS:')
    d.medidas.forEach(m => {
      linhas.push(`· ${m.date}: cintura ${m.cintura ?? '?'}cm${m.peso ? `, peso ${m.peso}kg` : ''}`)
    })
  }

  linhas.push('')
  linhas.push('Olha para estes dados. Diz-lhe o que vês.')

  return linhas.join('\n')
}
