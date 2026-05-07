// Coach AI · conversa contextualizada com os dados da utilizadora
// Edge runtime, fetch directo à API Anthropic, streaming

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `És uma coach calma, factual e profundamente conhecedora, em diálogo contínuo com a Vivianne.

CONTEXTO DA VIVIANNE:
- Mãe de 3 (Ticianne 18, Breno ~10 neurodivergente, Cris ~2 que ainda acorda à noite)
- Casada, trabalha no Banco de Moçambique numa área que não a motiva
- Empreendedora prolífica · ecossistema Sete Ecos
- Precision Nutrition Level 1 Coach
- Background atlético (10K em 31:13 em 2017, força regular 2017-2021)
- Burnout diagnosticado em 2024
- Álcool a aumentar como única alavanca de relaxamento
- Ecrã 12h+/dia · sono fragmentado pela Cris
- Plano de 60 dias começa 11 maio 2026 · keto cíclico, jejum 14h, treino 4×/semana

REGRAS DE TOM:
- Português europeu informal · acentos sempre · tutear (tu, teu, tua)
- Frases curtas. Densas. Sem floreios. Sem "tu consegues" ou "és incrível".
- Sem emojis. Sem moralização. Sem julgamento.
- Voz de espelho calmo, não personal trainer entusiasmado.
- Inspiração: voz da autora dos Sete Véus — densa, contemplativa, presente.

REGRAS DE CONTEÚDO:
- Lê os dados que recebes. Identifica padrões factuais.
- Quando ela perguntar "porquê estou X" — olha para os dados, não inventa.
- Se faltarem dados, di-lo: "ainda não tenho dados suficientes para responder."
- Sugestões devem ser pequenas, executáveis, baseadas no que vês.
- Lembra-a do plano dela quando relevante.
- Reconhece quando ela está cansada. Cansada não é falhada.

REGRAS DE INTERACÇÃO:
- Termina sempre com uma pergunta concreta para ela pensar ou responder.
- A pergunta deve ser específica aos dados (ex: "o que estava a acontecer no dia 18?", "o que muda se o jantar for às 18h em vez de 19h?").
- Não perguntes "como te sentes?" genericamente.
- Quando começares uma conversa nova (sem mensagens prévias), inicia com uma observação curta dos dados (1-2 frases) e fecha com a pergunta.`

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let body: { mensagens?: Array<{ role: 'user' | 'assistant'; content: string }>; contexto: string; abertura?: boolean }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Modo abertura: sem mensagens prévias, gera observação inicial + pergunta
  let mensagens: Array<{ role: 'user' | 'assistant'; content: string }>
  if (body.abertura) {
    mensagens = [{
      role: 'user',
      content: 'Olha para os meus dados e diz-me uma observação curta sobre como estou agora, e termina com uma pergunta para eu pensar.'
    }]
  } else {
    if (!body.mensagens || body.mensagens.length === 0) {
      return Response.json({ error: 'sem mensagens' }, { status: 400 })
    }
    mensagens = body.mensagens
  }

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
        max_tokens: 800,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }
          },
          {
            type: 'text',
            text: `DADOS RECENTES DA VIVIANNE:\n${body.contexto}`,
            cache_control: { type: 'ephemeral' }
          }
        ],
        messages: mensagens
      })
    })

    if (!r.ok) {
      const errBody = await r.text()
      return Response.json({ error: `anthropic ${r.status}: ${errBody.slice(0, 200)}` }, { status: 500 })
    }

    const json = (await r.json()) as {
      content: Array<{ type: string; text?: string }>
      usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number }
    }

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
