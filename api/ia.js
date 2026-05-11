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
      default:
        return res.status(400).json({ error: `action desconhecida: ${action}. Use: estimar-macros, insights-semanal` });
    }
    return res.status(resultado.status).json(resultado.body);
  } catch (error) {
    console.error(`Erro /api/ia [${action}]:`, error);
    return res.status(500).json({ error: 'Erro interno', detalhe: error.message });
  }
}
