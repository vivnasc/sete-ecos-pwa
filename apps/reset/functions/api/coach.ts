// Cloudflare Pages Function: /api/coach
// Coach AI · conversa contextualizada + tool use
// Os schemas das tools são duplicados aqui (executores estão em lib/coachTools.ts).
// Mantém em sincronia se acrescentares/alterares tools.

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
- Se ela voltar a perguntar algo que já respondeste, refere-o.

REGISTAR POR ELA · MUITO IMPORTANTE
- A Vivianne fala contigo em vez de preencher formulários. Tu registas por ela.
- Tens estas tools: registar_peso, registar_refeicao, registar_alcool, registar_dia,
  registar_jejum, registar_ciclo, marcar_ancora, consultar_dados.
- Quando ela disser algo registável, USA a tool. Não confirmes antes ("queres que registe?").
  Regista, depois confirma curto: "registado. peso 72.4. -0.3 desde ontem."
- Se faltar info, infere razoável (hora=agora, data=hoje). Só pergunta se for ambíguo.
- registar_refeicao: estima macros pela descrição. Em keto, descrições típicas:
  · 3 ovos mexidos + abacate + folhas → ~28g P, 30g G, 4g C
  · frango grelhado + brócolos + azeite → ~40g P, 20g G, 6g C
  · frutos secos mão fechada → ~6g P, 14g G, 4g C
- Quando ela mencionar vontade de beber, usa registar_alcool com decidiu_beber=false
  (caderno antes do copo) · só usa decidiu_beber=true se ela confirmar que bebeu.
- Múltiplas tools por turno são bem-vindas (ex: "comi PA e treinei" → registar_refeicao + marcar_ancora).
- Após registar, faz uma observação curta (3-6 frases) ou pergunta concreta. Uma só.

QUANDO RESPONDES SEM REGISTAR
- Curto: 3-6 frases. Texto corrido. Sem cabeçalhos.
- Termina com observação concreta OU pergunta concreta — só uma.
- Pergunta tem de ser específica aos dados dela.

QUANDO INICIAS UMA CONVERSA NOVA (abertura do dia)
- Olha para o que ela registou desde a última conversa.
- Identifica algo concreto: padrão novo, mudança, anomalia, vitória.
- Diz-lhe esse algo em 1-2 frases.
- Acaba com uma pergunta que abra o diálogo, baseada nesse algo.
- NUNCA comeces com "olá" ou "como estás" — vai directa ao que viste.`

const COACH_TOOLS = [
  {
    name: 'registar_peso',
    description: 'Regista a pesagem da Vivianne. Usa quando ela disser o peso (ex: "pesei 72.4", "estou com 73 hoje"). Cintura é opcional, só nas sextas.',
    input_schema: {
      type: 'object',
      properties: {
        peso: { type: 'number', description: 'Peso em kg, ex: 72.4' },
        cintura: { type: 'number', description: 'Cintura em cm, opcional' },
        hora: { type: 'string', description: 'Hora HH:MM, opcional · default agora' },
        notas: { type: 'string', description: 'Nota opcional' }
      },
      required: ['peso']
    }
  },
  {
    name: 'registar_refeicao',
    description: 'Regista uma refeição que ela comeu. Tipo: pa (pequeno-almoço), almoco, snack, jantar. Estima macros se possível com base na descrição (keto: alta gordura, proteína moderada, carbo baixo).',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'], description: 'Tipo de refeição' },
        descricao: { type: 'string', description: 'O que comeu, ex: "3 ovos mexidos com abacate e folhas"' },
        hora: { type: 'string', description: 'Hora ISO ou HH:MM, opcional · default agora' },
        proteina_g: { type: 'number', description: 'Proteína estimada em gramas' },
        carbo_g: { type: 'number', description: 'Hidratos estimados em gramas' },
        gordura_g: { type: 'number', description: 'Gordura estimada em gramas' },
        calorias: { type: 'number', description: 'Calorias estimadas' },
        contexto: { type: 'string', description: 'Contexto: em casa, fora, viagem, etc' },
        sentir: { type: 'string', description: 'Como se sentiu depois' }
      },
      required: ['tipo', 'descricao']
    }
  },
  {
    name: 'registar_alcool',
    description: 'Caderno antes do copo. Usa quando ela mencionar vontade de beber ou que bebeu. Regista emoção e gatilho.',
    input_schema: {
      type: 'object',
      properties: {
        decidiu_beber: { type: 'boolean', description: 'true se bebeu, false se decidiu não beber' },
        emocao: { type: 'string', description: 'Emoção dominante' },
        gatilho: { type: 'string', description: 'O que despoletou o impulso, opcional' },
        unidades: { type: 'number', description: 'Unidades bebidas, opcional' }
      },
      required: ['decidiu_beber', 'emocao']
    }
  },
  {
    name: 'registar_dia',
    description: 'Regista métricas do dia: sono, energia (1-5), humor (1-5), notas. Faz merge com o que já está registado.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Data YYYY-MM-DD, default hoje' },
        sono_horas: { type: 'number', description: 'Horas dormidas' },
        energia: { type: 'integer', description: 'Energia 1-5' },
        humor: { type: 'integer', description: 'Humor 1-5' },
        notas: { type: 'string', description: 'Nota livre' }
      },
      required: []
    }
  },
  {
    name: 'registar_jejum',
    description: 'Marca início do jejum (última refeição da véspera) ou fim (primeira refeição de hoje).',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['inicio', 'fim'] },
        timestamp: { type: 'string', description: 'ISO timestamp ou HH:MM. Default agora.' }
      },
      required: ['tipo']
    }
  },
  {
    name: 'registar_ciclo',
    description: 'Regista início de período menstrual.',
    input_schema: {
      type: 'object',
      properties: {
        data_inicio: { type: 'string', description: 'Data YYYY-MM-DD do primeiro dia, default hoje' },
        fluxo: { type: 'string', enum: ['leve', 'moderado', 'intenso'] },
        sintomas: { type: 'array', items: { type: 'string' } },
        cravings: { type: 'array', items: { type: 'string' } },
        notas: { type: 'string' }
      },
      required: []
    }
  },
  {
    name: 'marcar_ancora',
    description: 'Marca uma das 7 âncoras do dia. IDs disponíveis: ecra_21h, pa_proteina, janela_9_19, carbos_zero, eletrolitos, treino_feito, caderno_copo.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        feita: { type: 'boolean' }
      },
      required: ['id', 'feita']
    }
  },
  {
    name: 'consultar_dados',
    description: 'Consulta dados específicos. Áreas: peso, jejum, ciclo, alcool, refeicoes_hoje, macros_hoje, ancoras_hoje, resumo.',
    input_schema: {
      type: 'object',
      properties: {
        area: { type: 'string', enum: ['peso', 'jejum', 'ciclo', 'alcool', 'refeicoes_hoje', 'macros_hoje', 'ancoras_hoje', 'resumo'] },
        dias: { type: 'integer', description: 'Quantos dias para trás, default 7' }
      },
      required: ['area']
    }
  }
]

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

type Mensagem = { role: 'user' | 'assistant'; content: string | ContentBlock[] }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let body: {
    mensagens?: Mensagem[]
    contexto: string
    abertura?: boolean
    historico?: Array<{ role: 'user' | 'assistant'; content: string }>
    tools_enabled?: boolean
  }
  try {
    body = await context.request.json() as typeof body
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  let mensagens: Mensagem[]
  let historicoTexto = ''

  if (body.abertura) {
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

  const useTools = body.tools_enabled !== false && !body.abertura

  try {
    const reqBody: Record<string, unknown> = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `DADOS RECENTES DA VIVIANNE:\n${body.contexto}${historicoTexto}`, cache_control: { type: 'ephemeral' } }
      ],
      messages: mensagens
    }
    if (useTools) reqBody.tools = COACH_TOOLS

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(reqBody)
    })

    if (!r.ok) {
      const errBody = await r.text()
      return Response.json({ error: `anthropic ${r.status}: ${errBody.slice(0, 400)}` }, { status: 500 })
    }

    const json = (await r.json()) as {
      content: ContentBlock[]
      stop_reason: string
      usage: unknown
    }

    // Extracção de texto: junta todos os blocos type=text
    const texto = json.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map(b => b.text ?? '')
      .join('\n')
      .trim()

    return Response.json({
      content: json.content,
      stop_reason: json.stop_reason,
      texto,
      usage: json.usage
    })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'erro' }, { status: 500 })
  }
}
