// Cloudflare Pages Function: /api/foto-refeicao
// Recebe foto da refeição, devolve descrição + macros estimados via Claude Vision.

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM = `És uma nutricionista a olhar para uma foto de uma refeição em Moçambique/Portugal.
Identifica o que vês e estima macros razoáveis. Cozinha mediterrânica/mocambicana é típica:
matapa, xima, arroz, frango, peixe, ovos, abacate, folhas verdes.

Responde SEMPRE em JSON puro, sem markdown, sem comentários:
{
  "tipo": "pa" | "almoco" | "snack" | "jantar",
  "descricao": "string curta e descritiva",
  "proteina_g": number,
  "carbo_g": number,
  "gordura_g": number,
  "calorias": number,
  "observacao": "string opcional · contexto útil"
}

Regras:
- Estima conservadoramente. Porções razoáveis.
- "tipo" infere pela hora (passada no contexto) ou por composição típica.
- Se foto não for clara, faz a melhor estimativa e mete "observacao" a explicar.
- Calorias = proteína×4 + carbo×4 + gordura×9 (verifica matemática).`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'sem ANTHROPIC_API_KEY' }, { status: 500 })

  let body: { image: string; mime?: string; hora?: string }
  try {
    body = await context.request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!body.image) return Response.json({ error: 'sem imagem' }, { status: 400 })

  // image vem como data URL ou base64 puro
  const mime = body.mime ?? 'image/jpeg'
  const base64 = body.image.startsWith('data:')
    ? body.image.split(',')[1] ?? ''
    : body.image

  if (!base64) return Response.json({ error: 'imagem inválida' }, { status: 400 })

  const hora = body.hora ?? new Date().toTimeString().slice(0, 5)
  const userText = `Hora actual: ${hora}. Identifica e estima macros desta refeição.`

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
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
            { type: 'text', text: userText }
          ]
        }]
      })
    })

    if (!r.ok) {
      const errBody = await r.text()
      return Response.json({ error: `anthropic ${r.status}: ${errBody.slice(0, 300)}` }, { status: 500 })
    }

    const json = (await r.json()) as { content: Array<{ type: string; text?: string }> }
    const texto = json.content
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('')
      .trim()

    // Extrai JSON do texto (Claude às vezes mete texto à volta)
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'resposta sem JSON', raw: texto }, { status: 500 })

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({ error: 'JSON inválido', raw: texto }, { status: 500 })
    }

    return Response.json({
      tipo: parsed.tipo ?? 'almoco',
      descricao: parsed.descricao ?? 'refeição',
      proteinaG: typeof parsed.proteina_g === 'number' ? parsed.proteina_g : null,
      carboG: typeof parsed.carbo_g === 'number' ? parsed.carbo_g : null,
      gorduraG: typeof parsed.gordura_g === 'number' ? parsed.gordura_g : null,
      calorias: typeof parsed.calorias === 'number' ? parsed.calorias : null,
      observacao: parsed.observacao ?? ''
    })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'erro' }, { status: 500 })
  }
}
