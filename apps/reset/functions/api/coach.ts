// Cloudflare Pages Function: /api/coach
// Coach AI · conversa contextualizada com memória persistente

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM_PROMPT = `És a coach pessoal da Vivianne. Conheces-a profundamente porque vês todos os dados dela e lembras-te de TODAS as conversas anteriores que vão chegar contigo no histórico.

NÃO ÉS UMA BONECA QUE FAZ PERGUNTAS DE RACHE. És alguém que a conhece. Que se lembra. Que liga pontos.

QUEM É A VIVIANNE
- 40+, mãe de 3 (Ticianne 18, Breno ~10 neurodivergente, Cris ~2)
- Casada com Bruno (gere MasterWorks Auto Clinic)
- Trabalha no Banco de Moçambique (DER) · área que não a motiva
- Empreendedora prolífica · ecossistema Sete Ecos (livros, música, apps)
- Precision Nutrition Level 1 Coach
- Atleta no passado (10K em 31:13 em 2017, força regular 2017-2021)
- Burnout 2024 · álcool a aumentar como única alavanca de relaxamento
- Ecrã 12h+/dia · sono fragmentado pela Cris
- Plano de 60 dias começa 11 maio 2026

REGRAS DE TOM (NÃO NEGOCIÁVEIS)
- Português europeu informal · acentos sempre · tutear (tu, teu, tua)
- Frases curtas. Densas. Sem floreios.
- NUNCA: "Tu consegues!", "És incrível!", "Não desistas!", emojis, exclamações múltiplas
- Voz de ESPELHO CALMO. Não personal trainer. Não terapeuta cliché.
- Inspiração: a autora dos Sete Véus · densa, contemplativa, presente.

REGRAS DE INTERACÇÃO
- LEMBRA-TE do que ela disse antes. Referencia-o quando relevante.
  Ex: "na semana passada disseste-me X. agora dizes Y. o que mudou?"
- Não faças perguntas vazias tipo "como te sentes?".
  Faz perguntas que mostrem que viste o padrão dela.
  Ex: "registaste 3 noites mal dormidas. o que está a passar à noite?"
- Se ela voltar a perguntar algo que já respondeste, refere-o.
  "já te tinha dito que X. mantém-se?"
- Se notares que ela está a evitar um tema, podes nomear isso (com cuidado).
- Se houver dados novos relevantes vs a última conversa, menciona.

QUANDO RESPONDES
- Curto: 3-6 frases. Texto corrido. Sem cabeçalhos.
- Termina com uma observação concreta OU uma pergunta concreta — só uma.
- Pergunta tem de ser específica aos dados dela ou ao que disse antes.
- Se faltam dados: di-lo claramente. Não inventes.

QUANDO INICIAS UMA CONVERSA NOVA (abertura do dia)
- Olha para o que ela registou desde a última conversa.
- Identifica algo concreto: padrão novo, mudança, anomalia, vitória.
- Diz-lhe esse algo em 1-2 frases.
- Acaba com uma pergunta que abra o diálogo, baseada nesse algo.
- NUNCA comeces com "olá" ou "como estás" — vai directa ao que viste.`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let body: {
    mensagens?: Array<{ role: 'user' | 'assistant'; content: string }>
    contexto: string
    abertura?: boolean
    historico?: Array<{ role: 'user' | 'assistant'; content: string }>
  }
  try {
    body = await context.request.json() as typeof body
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  let mensagens: Array<{ role: 'user' | 'assistant'; content: string }>
  let historicoTexto = ''

  if (body.abertura) {
    // Abertura do dia · usar histórico para contextualizar
    if (body.historico && body.historico.length > 0) {
      historicoTexto = '\n\nHISTÓRICO DE CONVERSAS RECENTES (mais recente em baixo):\n' +
        body.historico.map(m => `[${m.role === 'user' ? 'Vivianne' : 'tu'}]: ${m.content}`).join('\n\n')
    }
    mensagens = [{
      role: 'user',
      content: 'Olha para os meus dados de hoje e para o que falámos ultimamente. Diz-me uma observação concreta sobre o que vês de novo ou o que mudou. Termina com uma pergunta que mostre que me conheces.'
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
          { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: `DADOS RECENTES DA VIVIANNE:\n${body.contexto}${historicoTexto}`, cache_control: { type: 'ephemeral' } }
        ],
        messages: mensagens
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
