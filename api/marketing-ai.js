/**
 * SETE ECOS - Marketing AI Endpoint
 * Gera variações de hooks e conteúdo marketing usando Claude API.
 * Abordagem híbrida: usa hooks existentes como sementes + IA para variação contextual.
 *
 * Actions: gerar-hooks, gerar-conteudo, gerar-video-script, gerar-musica, status-musica
 * Requires: ANTHROPIC_API_KEY env var, AIMLAPI_KEY env var (for Suno music)
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const COACH_EMAILS = [
  'viv.saraiva@gmail.com',
  'vivnasc@gmail.com',
  'vivianne.saraiva@outlook.com',
  ...(process.env.VITE_COACH_EMAILS ? process.env.VITE_COACH_EMAILS.split(',') : []),
];

// ─── Tom da Vivianne (system prompt) ───
const SYSTEM_PROMPT = `Tens um papel: és a Vivianne Saraiva, coach de nutrição e bem-estar, criadora do sistema Sete Ecos.

Tom de voz (OBRIGATÓRIO):
- Directo, inteligente, denso. Frases curtas.
- Tutear sempre (tu, teu, tua — NUNCA você/seu/sua).
- Sem slogans motivacionais vazios. Sem positividade tóxica.
- Máximo 1-2 emojis por mensagem.
- Máximo 1 exclamação por parágrafo.
- Assinar: "— Vivianne" (só no CTA final).
- Português de Portugal/Moçambique com acentos SEMPRE.

Filosofia Sete Ecos:
- "Não nasceu para te melhorar. Nasceu para integrar o que já és."
- 7 dimensões (Ecos): Corpo (Vitalis), Valor (Áurea), Emoção (Serena), Vontade (Ignis), Energia (Ventis), Voz (Ecoa), Identidade (Imago).
- Eixo: fragmentação → integração → coerência.
- Criar respeito antes de empatia.
- Não vender esperança. Oferecer coerência.
- Não é wellness estético. É arquitectura de integração.

Regras de género:
- Se o sexo é conhecido, usar a forma correcta (Bem-vindo/Bem-vinda).
- Se desconhecido, usar linguagem neutra: "pessoas", "Bem-vindo(a)".

Referências culturais moçambicanas quando relevante: matapa, xima, nhemba, mercados, capulana.`;

// ─── Eco metadata ───
const ECOS = {
  vitalis: { nome: 'VITALIS', foco: 'Corpo & Nutrição', emoji: '🌿' },
  aurea: { nome: 'ÁUREA', foco: 'Valor & Presença', emoji: '✨' },
  serena: { nome: 'SERENA', foco: 'Emoção & Fluidez', emoji: '💧' },
  ignis: { nome: 'IGNIS', foco: 'Vontade & Foco', emoji: '🔥' },
  ventis: { nome: 'VENTIS', foco: 'Energia & Ritmo', emoji: '🍃' },
  ecoa: { nome: 'ECOA', foco: 'Expressão & Voz', emoji: '🔊' },
  imago: { nome: 'IMAGO', foco: 'Identidade & Essência', emoji: '⭐' },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function callClaude(userPrompt, maxTokens = 1024) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada. Adiciona nas variáveis de ambiente do Vercel.');
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API erro ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ─── Action: gerar-hooks ───
async function gerarHooks({ eco, sementes, quantidade, formato, genero }) {
  const ecoInfo = eco ? ECOS[eco] : null;
  const ecoCtx = ecoInfo
    ? `\nEco em foco: ${ecoInfo.nome} (${ecoInfo.foco}) ${ecoInfo.emoji}`
    : '\nContexto geral da Sete Ecos (todos os Ecos).';

  const generoCtx = genero
    ? `\nGénero do público: ${genero === 'M' ? 'masculino' : genero === 'F' ? 'feminino' : 'neutro/misto'}.`
    : '\nGénero: desconhecido — usar linguagem neutra.';

  const formatoCtx = formato
    ? `\nFormato: ${formato} (adapta o comprimento e estrutura).`
    : '';

  const sementesTexto = sementes?.length
    ? `\nHooks existentes como referência de tom e estilo (NÃO repitas, cria VARIAÇÕES novas):\n${sementes.map((s, i) => `${i + 1}. "${s}"`).join('\n')}`
    : '';

  const prompt = `Gera ${quantidade || 5} hooks de marketing para redes sociais.
${ecoCtx}${generoCtx}${formatoCtx}${sementesTexto}

Cada hook deve:
- Parar o scroll nos primeiros 3 segundos
- Ser uma observação inteligente, NÃO motivação barata
- Máximo 120 caracteres
- Em português de Portugal com acentos

Responde APENAS com um array JSON de strings. Sem explicação.
Exemplo: ["hook 1", "hook 2", "hook 3"]`;

  const result = await callClaude(prompt, 512);
  try {
    // Extrair JSON do resultado
    const match = result.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [result.trim()];
  }
}

// ─── Action: gerar-conteudo ───
async function gerarConteudo({ eco, hook, formato, genero, plataforma }) {
  const ecoInfo = eco ? ECOS[eco] : null;
  const ecoCtx = ecoInfo
    ? `Eco: ${ecoInfo.nome} (${ecoInfo.foco}) ${ecoInfo.emoji}`
    : 'Sete Ecos geral';

  const generoCtx = genero
    ? `Género: ${genero === 'M' ? 'masculino' : genero === 'F' ? 'feminino' : 'neutro'}.`
    : 'Género: desconhecido — linguagem neutra.';

  const plataformaRules = {
    instagram: 'Instagram post: caption com hashtags, max 2200 chars. Estrutura: hook → corpo → CTA → hashtags.',
    story: 'Instagram story: texto curto (max 100 chars por slide), 3-5 slides. Cada slide é directo e impactante.',
    whatsapp: 'WhatsApp: texto puro, *negrito* e _itálico_ permitidos. Curto, pessoal, como se a Vivianne estivesse a falar directamente.',
    facebook: 'Facebook: tom conversacional, sem hashtags pesados. Mais longo que WhatsApp, mais curto que Instagram.',
    reels: 'Instagram Reels / TikTok: script de vídeo com timing. Formato: HOOK (0-3s) → DESENVOLVIMENTO (3-15s) → CTA (15-20s). Incluir indicações visuais entre parêntesis.',
    carrossel: 'Instagram carrossel: 5-7 slides. Slide 1 = hook forte (título). Slides 2-5 = pontos chave (1 ideia por slide, max 40 palavras). Slide final = CTA.',
  };

  const plat = plataformaRules[plataforma] || plataformaRules.instagram;

  const prompt = `Gera conteúdo de marketing completo.

${ecoCtx}
${generoCtx}
Hook de partida: "${hook}"
Plataforma: ${plat}

Responde em JSON com esta estrutura EXACTA:
{
  "hook": "o hook (pode ser o original ou melhorado)",
  "corpo": "corpo do conteúdo",
  "cta": "call to action final com — Vivianne",
  "hashtags": ["#tag1", "#tag2"],
  "slides": ["slide 1", "slide 2"]
}

Para "slides": só preenche se for carrossel ou story. Caso contrário, array vazio.
Para reels: coloca o script completo no "corpo" com timings.`;

  const result = await callClaude(prompt, 1024);
  try {
    const match = result.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { hook, corpo: result, cta: '— Vivianne', hashtags: [], slides: [] };
  } catch {
    return { hook, corpo: result, cta: '— Vivianne', hashtags: [], slides: [] };
  }
}

// ─── Action: gerar-video-script ───
async function gerarVideoScript({ eco, hook, duracao, estilo, genero }) {
  const ecoInfo = eco ? ECOS[eco] : null;
  const ecoCtx = ecoInfo
    ? `Eco: ${ecoInfo.nome} (${ecoInfo.foco})`
    : 'Sete Ecos geral';

  const dur = duracao || '15-30s';
  const est = estilo || 'talking-head';

  const estilos = {
    'talking-head': 'Vivianne a falar directamente para a câmara. Pessoal e directo.',
    'text-overlay': 'Texto em ecrã com transições. Sem narração, só visual + música.',
    'pov': 'POV trending: cenário relatable do dia-a-dia.',
    'antes-depois': 'Contraste visual antes/depois de usar Sete Ecos.',
    'tutorial': 'Mini-tutorial mostrando a app. Prático e demonstrativo.',
  };

  const prompt = `Cria um roteiro de vídeo para Reels/TikTok.

${ecoCtx}
Hook de partida: "${hook || 'gera um hook novo'}"
Duração: ${dur}
Estilo: ${estilos[est] || est}
Género público: ${genero || 'neutro'}

Responde em JSON:
{
  "titulo": "título curto do vídeo",
  "hook_visual": "o que aparece nos primeiros 3 segundos (texto em ecrã ou fala)",
  "roteiro": [
    { "tempo": "0-3s", "visual": "descrição visual", "texto": "texto/fala", "musica": "sugestão" },
    { "tempo": "3-10s", "visual": "...", "texto": "...", "musica": "..." },
    { "tempo": "10-15s", "visual": "...", "texto": "CTA", "musica": "..." }
  ],
  "caption": "caption para publicação",
  "hashtags": ["#tag1", "#tag2"],
  "dica_gravacao": "dica prática para gravar este vídeo"
}`;

  const result = await callClaude(prompt, 1024);
  try {
    const match = result.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { titulo: 'Vídeo', roteiro: [], caption: result };
  } catch {
    return { titulo: 'Vídeo', roteiro: [], caption: result };
  }
}

// ─── Suno AI via AIMLAPI ───

const AIMLAPI_BASE = 'https://api.aimlapi.com/v2/generate/audio/suno-ai';

// Moods por eco para prompts musicais
const ECO_MOODS = {
  vitalis: { tags: 'ambient electronic calm organic', desc: 'natureza, corpo, nutrição' },
  aurea: { tags: 'elegant piano warm cinematic', desc: 'valor próprio, presença, ouro' },
  serena: { tags: 'ambient water flowing peaceful meditation', desc: 'emoção, fluidez, água' },
  ignis: { tags: 'energetic percussion tribal fire drums', desc: 'fogo, vontade, determinação' },
  ventis: { tags: 'airy flute nature breeze gentle folk', desc: 'vento, energia, natureza' },
  ecoa: { tags: 'vocal choral echo resonant ethereal', desc: 'voz, expressão, eco' },
  imago: { tags: 'cinematic orchestral deep introspective', desc: 'identidade, essência, profundidade' },
};

async function gerarMusica({ eco, tipo, titulo, prompt, duracao, instrumental }) {
  const apiKey = process.env.AIMLAPI_KEY;
  if (!apiKey) {
    throw new Error('AIMLAPI_KEY não configurada. Adiciona nas variáveis de ambiente do Vercel.');
  }

  const ecoMood = eco ? ECO_MOODS[eco] : null;

  // Construir tags baseadas no eco e tipo
  let tags = '';
  if (tipo === 'jingle') {
    tags = `short jingle catchy ${ecoMood?.tags || 'ambient modern'}`;
  } else if (tipo === 'fundo') {
    tags = `background ambient instrumental ${ecoMood?.tags || 'calm modern'}`;
  } else if (tipo === 'reels') {
    tags = `energetic short hook viral trending ${ecoMood?.tags || 'pop electronic'}`;
  } else if (tipo === 'meditacao') {
    tags = `meditation ambient slow peaceful healing ${ecoMood?.tags || 'ambient'}`;
  } else {
    tags = ecoMood?.tags || 'ambient modern wellness';
  }

  // Construir prompt musical
  let musicPrompt = prompt;
  if (!musicPrompt) {
    const ecoDesc = ecoMood?.desc || 'bem-estar holístico, integração, coerência';
    if (instrumental) {
      musicPrompt = `Instrumental music for a wellness brand called Sete Ecos. Theme: ${ecoDesc}. Mood: sophisticated, deep, not generic. Portuguese/African influence.`;
    } else {
      musicPrompt = `[Verse]\nSete Ecos, sete dimensões\nCorpo, emoção, voz e visões\nNão é melhorar, é integrar\nO que já és, deixa brilhar\n\n[Chorus]\nSete Ecos, um só sistema\nAs partes conversam, sem enigma\nCoerência é o caminho\nNão estás sozinha neste ninho`;
    }
  }

  const body = {
    prompt: musicPrompt,
    tags,
    title: titulo || `Sete Ecos${eco ? ' - ' + (ECOS[eco]?.nome || eco) : ''}`,
  };

  // Se é instrumental, adicionar flag
  if (instrumental) {
    body.make_instrumental = true;
  }

  const res = await fetch(`${AIMLAPI_BASE}/clip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Suno API erro ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    clip_ids: data.clip_ids || [],
    message: 'Música a ser gerada. Usa status-musica para verificar o progresso.',
  };
}

async function statusMusica({ clip_ids }) {
  const apiKey = process.env.AIMLAPI_KEY;
  if (!apiKey) {
    throw new Error('AIMLAPI_KEY não configurada.');
  }

  if (!clip_ids?.length) {
    throw new Error('clip_ids é obrigatório');
  }

  // Buscar múltiplos clips
  const params = clip_ids.map(id => `clip_ids[]=${encodeURIComponent(id)}`).join('&');
  const url = `${AIMLAPI_BASE}/clips?${params}&status=complete`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Suno API erro ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data;
}

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // GET requests use query params, POST uses body
    const rawParams = req.method === 'GET' ? req.query : (req.body || {});
    const { action, ...params } = rawParams;
    // Parse clip_ids from query string if needed
    if (params['clip_ids[]']) {
      params.clip_ids = Array.isArray(params['clip_ids[]']) ? params['clip_ids[]'] : [params['clip_ids[]']];
      delete params['clip_ids[]'];
    }

    if (!action) {
      return res.status(400).json({ error: 'Falta parâmetro "action"' });
    }

    let result;

    switch (action) {
      case 'gerar-hooks':
        result = await gerarHooks(params);
        break;
      case 'gerar-conteudo':
        result = await gerarConteudo(params);
        break;
      case 'gerar-video-script':
        result = await gerarVideoScript(params);
        break;
      case 'gerar-musica':
        result = await gerarMusica(params);
        break;
      case 'status-musica':
        result = await statusMusica(params);
        break;
      default:
        return res.status(400).json({ error: `Acção desconhecida: ${action}` });
    }

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('[marketing-ai] Erro:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
