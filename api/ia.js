/**
 * /api/ia — endpoint consolidado para funções de IA do Vitalis.
 * Dispatch por { action } no body. Mantém o número de funções
 * serverless dentro do limite do Vercel Hobby (12).
 *
 * Actions:
 *   - "estimar-macros" → estima macros a partir de descrição
 *   - "insights-semanal" → leitura editorial da semana
 *
 * POST /api/ia { action: 'estimar-macros', ...payload }
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// ─── Helpers ──────────────────────────────────────────────────────

function ymd(d) {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  return isNaN(dt.getTime()) ? null : dt.toISOString().split('T')[0];
}

function agregarPorDia(arr, campoTimestamp = 'created_at') {
  const m = new Map();
  for (const r of arr) {
    const dia = ymd(r[campoTimestamp] || r.data);
    if (!dia) continue;
    m.set(dia, (m.get(dia) || 0) + 1);
  }
  return Object.fromEntries(m);
}

function mediaCampo(arr, ...campos) {
  const vals = [];
  for (const r of arr) {
    for (const c of campos) {
      const v = parseFloat(r[c]);
      if (!isNaN(v)) { vals.push(v); break; }
    }
  }
  if (vals.length === 0) return null;
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function semanaSegundaIso(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

async function callClaude(apiKey, model, systemPrompt, userMessage, maxTokens) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('Anthropic error:', response.status, errText);
    throw new Error(`Anthropic ${response.status}`);
  }
  const data = await response.json();
  return data?.content?.[0]?.text || '';
}

// ─── Action: estimar-macros ───────────────────────────────────────

const SYSTEM_ESTIMAR = `Tu és uma nutricionista que estima macros de refeições descritas em português (PT-PT e PT-MZ). Conheces comida moçambicana (xima/matapa/feijão nhemba/caril/cacana/peixe seco/galinha à zambeziana), portuguesa (bacalhau/grelhados/sopa/arroz), e típicas de pequeno-almoço (pão/ovos/iogurte/papas).

Recebes uma descrição livre em português. Devolves SÓ JSON válido, sem markdown, sem texto antes/depois:

{
  "alimentos": ["array de alimentos detectados em minúsculas"],
  "proteina_g": número,
  "hidratos_g": número,
  "gordura_g": número,
  "kcal": número,
  "porcoes": { "proteina": número, "hidratos": número, "gordura": número },
  "confianca": "alta" | "media" | "baixa",
  "nota": "frase curta opcional em PT-PT informal, max 80 chars"
}

Porções: cada "1 porção" ≈ 20g proteína / 30g hidrato / 7g gordura (método da mão).

kcal = (proteina_g × 4) + (hidratos_g × 4) + (gordura_g × 9).

Confiança:
- "alta" se a descrição é específica (ex: "150g de frango grelhado com 1 chávena de arroz")
- "media" se aproximação razoável ("um prato de matapa com peixe")
- "baixa" se vago ("comi qualquer coisa", "um bocado de tudo")

Sê conservadora — prefere subestimar a sobrestimar. Tom: directo, sem juízos. Devolve APENAS o JSON.`;

async function actionEstimarMacros(apiKey, body) {
  const { descricao, tipo } = body || {};
  if (!descricao || typeof descricao !== 'string' || descricao.trim().length < 3) {
    return { status: 400, body: { error: 'Descrição muito curta ou inválida' } };
  }

  const contexto = tipo ? `Refeição: ${tipo}. ` : '';
  const userMessage = `${contexto}Descrição: ${descricao.trim().slice(0, 500)}`;

  const texto = await callClaude(apiKey, 'claude-haiku-4-5-20251001', SYSTEM_ESTIMAR, userMessage, 400);
  const jsonMatch = texto.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { status: 502, body: { error: 'Resposta inválida do estimador', raw: texto } };
  }

  let estimativa;
  try {
    estimativa = JSON.parse(jsonMatch[0]);
  } catch {
    return { status: 502, body: { error: 'JSON malformado' } };
  }

  const sanitizado = {
    alimentos: Array.isArray(estimativa.alimentos) ? estimativa.alimentos.slice(0, 10) : [],
    proteina_g: Math.max(0, Math.round(parseFloat(estimativa.proteina_g) || 0)),
    hidratos_g: Math.max(0, Math.round(parseFloat(estimativa.hidratos_g) || 0)),
    gordura_g: Math.max(0, Math.round(parseFloat(estimativa.gordura_g) || 0)),
    kcal: Math.max(0, Math.round(parseFloat(estimativa.kcal) || 0)),
    porcoes: {
      proteina: parseFloat(estimativa?.porcoes?.proteina) || 0,
      hidratos: parseFloat(estimativa?.porcoes?.hidratos) || 0,
      gordura: parseFloat(estimativa?.porcoes?.gordura) || 0
    },
    confianca: ['alta', 'media', 'baixa'].includes(estimativa.confianca) ? estimativa.confianca : 'media',
    nota: typeof estimativa.nota === 'string' ? estimativa.nota.slice(0, 120) : ''
  };

  if (sanitizado.kcal === 0) {
    sanitizado.kcal = Math.round(
      sanitizado.proteina_g * 4 + sanitizado.hidratos_g * 4 + sanitizado.gordura_g * 9
    );
  }

  return { status: 200, body: sanitizado };
}

// ─── Action: insights-semanal ─────────────────────────────────────

const SYSTEM_INSIGHTS = `Tu és a Vivianne — coach de nutrição e bem-estar moçambicana. Escreves cartas semanais às tuas clientes em jornada de aprendizagem alimentar.

Tom:
- Acolhedor, directo, educativo (não terapêutico nem analítico frio)
- Português de Portugal/Moçambique informal
- Tuteia sempre (tu, teu, tua)
- Frases curtas
- Mostra causa→efeito (educa)
- Sem clichés motivacionais ("acredita em ti", "tu consegues")
- Sem julgamentos. Sem culpa.
- Conhece comida moçambicana: matapa, xima, feijão nhemba, frango à zambeziana
- Em minúsculas editoriais excepto nomes próprios

Recebes dados da semana de uma cliente:
- Refeições registadas (com macros)
- Check-ins diários (peso, energia, humor)
- Pesos
- Jejuns cumpridos
- Água
- Sono

Devolves SÓ JSON válido (sem markdown):

{
  "leitura": "4-7 frases em prosa contínua. começa com o que se viu factualmente. depois mostra UMA correlação ou causa→efeito educativa. fecha com um reforço breve. max 600 chars.",
  "destaques": ["3 a 5 bullets MUITO curtos (max 40 chars cada) em minúsculas. tipo 'sono subiu 0.7h em média' ou 'peso desceu 0.4kg'"],
  "sugestao_proxima_semana": "1 frase concreta e accionável. max 100 chars. tipo 'esta semana experimenta jantar até às 19h'."
}

Se os dados forem escassos (cliente registou pouco), escreves uma leitura mais curta convidando a registar mais. Sem culpa.`;

async function actionInsightsSemanal(apiKey, body) {
  const { nome, dataInicio, semana, sexo = 'F' } = body || {};
  if (!semana || typeof semana !== 'object') {
    return { status: 400, body: { error: 'semana é obrigatória' } };
  }

  const sumario = {
    nome: nome || 'cliente',
    sexo,
    diasNaJornada: dataInicio
      ? Math.max(1, Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86_400_000) + 1)
      : null,
    refeicoes_total: (semana.refeicoes || []).length,
    refeicoes_por_dia: agregarPorDia(semana.refeicoes || [], 'created_at'),
    pesos: (semana.pesos || []).map(p => ({
      data: ymd(p.data || p.created_at),
      peso: parseFloat(p.peso_kg || p.peso)
    })).filter(p => p.peso && p.data),
    aguas_total_litros: ((semana.aguas || []).reduce((a, b) => a + parseFloat(b.ml || b.quantidade || 0), 0) / 1000).toFixed(1),
    sono_horas_media: mediaCampo(semana.sonos || [], 'horas', 'duracao_h'),
    energia_media: mediaCampo(semana.registos || [], 'energia_1a10', 'energia'),
    humor_medio: mediaCampo(semana.registos || [], 'humor_1a10', 'humor'),
    jejuns_cumpridos: (semana.jejuns || []).filter(j => j.completou).length,
    check_ins: (semana.registos || []).length
  };

  const userMessage = `dados da semana de ${sumario.nome}:\n\n${JSON.stringify(sumario, null, 2)}\n\nresponde com o JSON.`;

  const texto = await callClaude(apiKey, 'claude-sonnet-4-6', SYSTEM_INSIGHTS, userMessage, 800);
  const jsonMatch = texto.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { status: 502, body: { error: 'Resposta inválida' } };

  let resultado;
  try {
    resultado = JSON.parse(jsonMatch[0]);
  } catch {
    return { status: 502, body: { error: 'JSON malformado' } };
  }

  return {
    status: 200,
    body: {
      leitura: typeof resultado.leitura === 'string' ? resultado.leitura.slice(0, 800) : '',
      destaques: Array.isArray(resultado.destaques) ? resultado.destaques.slice(0, 5).map(d => String(d).slice(0, 60)) : [],
      sugestao_proxima_semana: typeof resultado.sugestao_proxima_semana === 'string'
        ? resultado.sugestao_proxima_semana.slice(0, 140)
        : '',
      semana_iso: semanaSegundaIso()
    }
  };
}

// ─── Action: foto-refeicao (Claude Vision) ────────────────────────

const SYSTEM_FOTO = `Tu és uma nutricionista que descreve e estima macros de fotografias de refeições em português moçambicano/portugues.

Conheces comida moçambicana (xima/matapa/feijão nhemba/caril/cacana/peixe seco/galinha à zambeziana/frango piri-piri/camarão/coco/pão de cacau), portuguesa (bacalhau/grelhados/sopa/arroz/leite-creme/queijo/azeitonas/pão), e ingredientes universais.

Vais receber uma imagem de uma refeição. Devolves SÓ JSON válido (sem markdown):

{
  "alimentos": ["array de alimentos detectados na imagem em minúsculas"],
  "descricao": "1 frase curta em PT-PT informal descrevendo o prato. max 80 chars.",
  "proteina_g": número,
  "hidratos_g": número,
  "gordura_g": número,
  "kcal": número,
  "porcoes": { "proteina": número, "hidratos": número, "gordura": número },
  "confianca": "alta" | "media" | "baixa",
  "nota": "frase curta opcional sobre o que vês, max 80 chars"
}

Porções: cada "1 porção" ≈ 20g proteína / 30g hidrato / 7g gordura.
kcal = (proteina_g × 4) + (hidratos_g × 4) + (gordura_g × 9).

Confiança:
- "alta" se foto clara, prato bem identificável
- "media" se vários elementos ambíguos
- "baixa" se foto má, prato parcial, ou pouca certeza

Sê conservadora — prefere subestimar. Sem juízos. Sem comentários sobre saúde ou peso. Descreve o que vês.`;

async function actionFotoRefeicao(apiKey, body) {
  const { imagem, tipo } = body || {};
  if (!imagem || typeof imagem !== 'string') {
    return { status: 400, body: { error: 'imagem (base64 data URL) é obrigatória' } };
  }

  // Extrair media_type e dados base64 do data URL
  const match = imagem.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
  if (!match) {
    return { status: 400, body: { error: 'formato inválido. Esperado data URL: data:image/jpeg;base64,...' } };
  }
  const mediaType = match[1];
  const base64 = match[2];

  // Validar tamanho (max ~4MB base64)
  if (base64.length > 6_000_000) {
    return { status: 413, body: { error: 'imagem muito grande (max ~4MB)' } };
  }

  const userMessage = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: base64
      }
    },
    {
      type: 'text',
      text: `Refeição: ${tipo || 'não especificada'}. Descreve e estima macros.`
    }
  ];

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_FOTO,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Anthropic vision error:', response.status, errText);
      return { status: 502, body: { error: 'falha ao analisar imagem' } };
    }

    const data = await response.json();
    const texto = data?.content?.[0]?.text || '';
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { status: 502, body: { error: 'resposta inválida' } };

    let resultado;
    try {
      resultado = JSON.parse(jsonMatch[0]);
    } catch {
      return { status: 502, body: { error: 'JSON malformado' } };
    }

    const sanitizado = {
      alimentos: Array.isArray(resultado.alimentos) ? resultado.alimentos.slice(0, 10) : [],
      descricao: typeof resultado.descricao === 'string' ? resultado.descricao.slice(0, 120) : '',
      proteina_g: Math.max(0, Math.round(parseFloat(resultado.proteina_g) || 0)),
      hidratos_g: Math.max(0, Math.round(parseFloat(resultado.hidratos_g) || 0)),
      gordura_g: Math.max(0, Math.round(parseFloat(resultado.gordura_g) || 0)),
      kcal: Math.max(0, Math.round(parseFloat(resultado.kcal) || 0)),
      porcoes: {
        proteina: parseFloat(resultado?.porcoes?.proteina) || 0,
        hidratos: parseFloat(resultado?.porcoes?.hidratos) || 0,
        gordura: parseFloat(resultado?.porcoes?.gordura) || 0
      },
      confianca: ['alta', 'media', 'baixa'].includes(resultado.confianca) ? resultado.confianca : 'media',
      nota: typeof resultado.nota === 'string' ? resultado.nota.slice(0, 120) : ''
    };

    if (sanitizado.kcal === 0) {
      sanitizado.kcal = Math.round(
        sanitizado.proteina_g * 4 + sanitizado.hidratos_g * 4 + sanitizado.gordura_g * 9
      );
    }

    return { status: 200, body: sanitizado };
  } catch (error) {
    console.error('actionFotoRefeicao erro:', error);
    return { status: 500, body: { error: 'erro interno', detalhe: error.message } };
  }
}

// ─── Action: coach-chat (com tool use) ────────────────────────────

const SYSTEM_COACH = `Tu és a Vivianne — coach de nutrição e bem-estar moçambicana. Estás a conversar com uma cliente em jornada de aprendizagem alimentar.

Tom:
- Acolhedor, directo, educativo (não terapêutico)
- Português PT-PT/PT-MZ informal, tuteia
- Frases curtas. Sem clichés motivacionais.
- Conhece comida moçambicana (matapa, xima, feijão nhemba, frango piri-piri, caril, peixe seco, abacate, banana, papaia) e portuguesa
- Sem julgamentos, sem culpa
- Educa: explica o porquê em vez de só dizer o quê
- Lower-case editorial excepto nomes próprios

Tens 3 ferramentas (tools) para registar dados pela cliente. Usa-as sem pedir confirmação quando ela te disser claramente o que fez. Depois confirma em 1 frase amigável.

EXEMPLOS:
Cliente: "comi xima com matapa ao almoço"
→ chama registar_refeicao(descricao: "xima com matapa", tipo: "almoco")
→ responde: "registado · prato típico, equilibrado. tens proteína vegetal e folha verde. e vegetais à parte?"

Cliente: "estou a pesar 73kg hoje"
→ chama registar_peso(peso_kg: 73)
→ responde: "registado · 73kg. consistência das pesagens conta mais do que o número em si."

Cliente: "bebi 2 copos de água"
→ chama registar_agua(ml: 500)
→ responde: "registado · 500ml. um copo grande de cada vez funciona melhor que ir bebendo aos poucos."

NÃO inventes registos. Se a cliente faz pergunta geral ou conversa, responde sem usar tools.

NUNCA dês conselhos médicos, sobre medicamentos, ou cálculos calóricos rígidos. Para isso, recomenda falar com a coach (tu, em pessoa) por WhatsApp.`;

const COACH_TOOLS = [
  {
    name: 'registar_refeicao',
    description: 'Regista uma refeição da cliente quando ela descreve o que comeu. Usa também os dados retornados por /api/ia action estimar-macros para porções.',
    input_schema: {
      type: 'object',
      properties: {
        descricao: { type: 'string', description: 'descrição do que a cliente comeu, em palavras simples' },
        tipo: {
          type: 'string',
          enum: ['pa', 'lanche-manha', 'almoco', 'lanche-tarde', 'jantar', 'ceia'],
          description: 'tipo de refeição'
        }
      },
      required: ['descricao']
    }
  },
  {
    name: 'registar_peso',
    description: 'Regista o peso actual da cliente quando ela te disser que se pesou.',
    input_schema: {
      type: 'object',
      properties: {
        peso_kg: { type: 'number', description: 'peso em kg' }
      },
      required: ['peso_kg']
    }
  },
  {
    name: 'registar_agua',
    description: 'Regista um copo ou volume de água que a cliente bebeu.',
    input_schema: {
      type: 'object',
      properties: {
        ml: { type: 'number', description: 'volume em ml (250ml = 1 copo padrão; 500ml = 2 copos grandes)' }
      },
      required: ['ml']
    }
  }
];

async function actionCoachChat(apiKey, body) {
  const { mensagens, contexto } = body || {};
  if (!Array.isArray(mensagens) || mensagens.length === 0) {
    return { status: 400, body: { error: 'mensagens (array) é obrigatório' } };
  }

  // Construir contexto da cliente para prefixar a primeira mensagem
  let systemPromptCompleto = SYSTEM_COACH;
  if (contexto) {
    const parts = [];
    if (contexto.nome) parts.push(`nome: ${contexto.nome}`);
    if (contexto.diaJornada) parts.push(`dia ${contexto.diaJornada} da jornada`);
    if (contexto.pesoActual) parts.push(`peso actual: ${contexto.pesoActual}kg`);
    if (contexto.pesoMeta) parts.push(`peso meta: ${contexto.pesoMeta}kg`);
    if (contexto.refeicoesHoje !== undefined) parts.push(`refeições registadas hoje: ${contexto.refeicoesHoje}`);
    if (parts.length > 0) {
      systemPromptCompleto += `\n\n[contexto da cliente]\n${parts.join(' · ')}`;
    }
  }

  // Filtrar/sanitizar mensagens
  const messagesSanitized = mensagens.slice(-20).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: typeof m.content === 'string' ? m.content.slice(0, 2000) : ''
  })).filter(m => m.content);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: systemPromptCompleto,
        tools: COACH_TOOLS,
        messages: messagesSanitized
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Anthropic coach error:', response.status, errText);
      return { status: 502, body: { error: 'falha ao consultar coach' } };
    }

    const data = await response.json();
    const content = data?.content || [];

    // Extrair texto e tool calls
    let texto = '';
    const toolCalls = [];
    for (const block of content) {
      if (block.type === 'text') texto += block.text;
      if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input || {}
        });
      }
    }

    return {
      status: 200,
      body: {
        texto: texto.trim(),
        toolCalls,
        stopReason: data.stop_reason || 'end_turn'
      }
    };
  } catch (error) {
    console.error('actionCoachChat erro:', error);
    return { status: 500, body: { error: 'erro interno', detalhe: error.message } };
  }
}

// ─── Handler principal ────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });
  }

  const { action, ...payload } = req.body || {};

  try {
    let resultado;
    switch (action) {
      case 'estimar-macros':
        resultado = await actionEstimarMacros(apiKey, payload);
        break;
      case 'insights-semanal':
        resultado = await actionInsightsSemanal(apiKey, payload);
        break;
      case 'foto-refeicao':
        resultado = await actionFotoRefeicao(apiKey, payload);
        break;
      case 'coach-chat':
        resultado = await actionCoachChat(apiKey, payload);
        break;
      default:
        return res.status(400).json({ error: `action desconhecida: ${action}. Use: estimar-macros, insights-semanal, foto-refeicao, coach-chat` });
    }
    return res.status(resultado.status).json(resultado.body);
  } catch (error) {
    console.error(`Erro /api/ia [${action}]:`, error);
    return res.status(500).json({ error: 'Erro interno', detalhe: error.message });
  }
}
