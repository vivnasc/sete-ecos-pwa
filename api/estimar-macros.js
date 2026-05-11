/**
 * /api/estimar-macros — recebe uma descrição em texto da refeição
 * (ex: "comi xima com matapa e bocadinho de frango") e devolve uma
 * estimativa de macros (proteína / hidratos / gordura) + kcal.
 *
 * Usa Claude Haiku 4.5 (rápido, barato, suficiente). Conhece comida
 * moçambicana e portuguesa.
 *
 * POST { descricao: string, tipo?: 'pa'|'almoco'|'lanche'|'jantar' }
 * → { proteina_g, hidratos_g, gordura_g, kcal, porcoes:{proteina, hidratos, gordura}, alimentos_detectados, confianca: 'alta'|'media'|'baixa' }
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODELO = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Tu és uma nutricionista que estima macros de refeições descritas em português (PT-PT e PT-MZ). Conheces comida moçambicana (xima/matapa/feijão nhemba/caril/cacana/peixe seco/galinha à zambeziana), portuguesa (bacalhau/grelhados/sopa/arroz), e típicas de pequeno-almoço (pão/ovos/iogurte/papas).

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

Sê conservadora — prefere subestimar a sobrestimar. Nota tom: directo, sem juízos. Devolve APENAS o JSON.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });
  }

  const { descricao, tipo } = req.body || {};
  if (!descricao || typeof descricao !== 'string' || descricao.trim().length < 3) {
    return res.status(400).json({ error: 'Descrição muito curta ou inválida' });
  }

  const contexto = tipo ? `Refeição: ${tipo}. ` : '';
  const userMessage = `${contexto}Descrição: ${descricao.trim().slice(0, 500)}`;

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
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Anthropic error:', response.status, errText);
      return res.status(502).json({ error: 'Falha a chamar o estimador' });
    }

    const data = await response.json();
    const texto = data?.content?.[0]?.text || '';

    // Extrair JSON (defensivo — model às vezes inclui blocos markdown)
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: 'Resposta inválida do estimador', raw: texto });
    }

    let estimativa;
    try {
      estimativa = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(502).json({ error: 'JSON malformado', raw: texto });
    }

    // Sanitizar campos
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

    // Recalcular kcal se o modelo não soube (evita inconsistências)
    if (sanitizado.kcal === 0) {
      sanitizado.kcal = Math.round(
        sanitizado.proteina_g * 4 + sanitizado.hidratos_g * 4 + sanitizado.gordura_g * 9
      );
    }

    return res.status(200).json(sanitizado);
  } catch (error) {
    console.error('Erro estimar-macros:', error);
    return res.status(500).json({ error: 'Erro interno', detalhe: error.message });
  }
}
