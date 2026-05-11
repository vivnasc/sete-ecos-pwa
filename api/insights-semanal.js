/**
 * /api/insights-semanal — gera leitura editorial semanal por IA
 * (Claude Sonnet 4.6), com tom educativo+acolhedor para clientes
 * em jornada de aprendizagem alimentar.
 *
 * POST {
 *   nome: string,
 *   dataInicio: string ISO,
 *   semana: { refeicoes, registos, pesos, jejuns, aguas, sonos },
 *   sexo?: 'M'|'F'|'O'
 * }
 *
 * Devolve:
 * {
 *   leitura: string (4-7 frases em PT-PT informal, tom acolhedor),
 *   destaques: string[] (3-5 bullets curtos),
 *   sugestao_proxima_semana: string (1 frase),
 *   semana_iso: 'YYYY-MM-DD' (segunda da semana analisada)
 * }
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODELO = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `Tu és a Vivianne — coach de nutrição e bem-estar moçambicana. Escreves cartas semanais às tuas clientes em jornada de aprendizagem alimentar.

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

function semanaSegunda(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 dom, 1 seg, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });

  const { nome, dataInicio, semana, sexo = 'F' } = req.body || {};
  if (!semana || typeof semana !== 'object') {
    return res.status(400).json({ error: 'semana é obrigatória' });
  }

  // Construir contexto factual para o modelo
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

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Anthropic error:', response.status, errText);
      return res.status(502).json({ error: 'Falha a gerar insights' });
    }

    const data = await response.json();
    const texto = data?.content?.[0]?.text || '';
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'Resposta inválida' });

    let resultado;
    try {
      resultado = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(502).json({ error: 'JSON malformado' });
    }

    return res.status(200).json({
      leitura: typeof resultado.leitura === 'string' ? resultado.leitura.slice(0, 800) : '',
      destaques: Array.isArray(resultado.destaques) ? resultado.destaques.slice(0, 5).map(d => String(d).slice(0, 60)) : [],
      sugestao_proxima_semana: typeof resultado.sugestao_proxima_semana === 'string'
        ? resultado.sugestao_proxima_semana.slice(0, 140)
        : '',
      semana_iso: semanaSegunda()
    });
  } catch (error) {
    console.error('Erro insights-semanal:', error);
    return res.status(500).json({ error: 'Erro interno', detalhe: error.message });
  }
}

// helpers ---------------------------------------------------------

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
