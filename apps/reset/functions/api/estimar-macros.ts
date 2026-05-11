// Cloudflare Pages Function: /api/estimar-macros
// Recebe { descricao, tipo? } e devolve { proteinaG, carboG, gorduraG, calorias }
// Estima com Claude Haiku via tool use (structured output garantido).
// Suporte a fotos é tratado pela outra branche · este endpoint é só texto.

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM = `Estimas macros de uma refeição em Português europeu.
Conheces comida portuguesa e moçambicana (matapa, xima, frango zambeziano, etc).
Em keto: ovos+abacate ~28gP/30gG/4gC; frango+brócolos ~40gP/20gG/6gC; nozes mão ~6gP/14gG/4gC.
Sê realista. Quantidades médias para um adulto se não especificadas.
Se a descrição for vaga ou não-comida, devolve zeros.`

const TOOL = {
  name: 'macros',
  description: 'Devolve macros estimados da refeição.',
  input_schema: {
    type: 'object',
    properties: {
      proteina_g: { type: 'number', description: 'Proteína em gramas' },
      carbo_g: { type: 'number', description: 'Hidratos em gramas' },
      gordura_g: { type: 'number', description: 'Gordura em gramas' },
      calorias: { type: 'number', description: 'Calorias kcal' }
    },
    required: ['proteina_g', 'carbo_g', 'gordura_g', 'calorias']
  }
}

interface ContentBlock {
  type: string
  input?: Record<string, unknown>
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let body: { descricao?: string; tipo?: string }
  try {
    body = await context.request.json() as typeof body
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const descricao = (body.descricao ?? '').trim()
  if (!descricao) {
    return Response.json({ error: 'descrição vazia' }, { status: 400 })
  }
  const tipo = (body.tipo ?? '').trim()

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'macros' },
        messages: [{
          role: 'user',
          content: tipo ? `${tipo}: ${descricao}` : descricao
        }]
      })
    })

    if (!r.ok) {
      const errBody = await r.text()
      return Response.json({ error: `anthropic ${r.status}: ${errBody.slice(0, 200)}` }, { status: 500 })
    }

    const json = (await r.json()) as { content: ContentBlock[] }
    const tool = json.content.find(b => b.type === 'tool_use')
    if (!tool || !tool.input) {
      return Response.json({ error: 'sem tool_use na resposta' }, { status: 500 })
    }

    const input = tool.input as Record<string, unknown>
    return Response.json({
      proteinaG: typeof input.proteina_g === 'number' ? Math.round(input.proteina_g * 10) / 10 : null,
      carboG: typeof input.carbo_g === 'number' ? Math.round(input.carbo_g * 10) / 10 : null,
      gorduraG: typeof input.gordura_g === 'number' ? Math.round(input.gordura_g * 10) / 10 : null,
      calorias: typeof input.calorias === 'number' ? Math.round(input.calorias) : null
    })
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'erro' }, { status: 500 })
  }
}
