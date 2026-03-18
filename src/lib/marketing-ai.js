/**
 * Marketing AI - Cliente para geração híbrida de conteúdo
 * Usa hooks existentes como sementes + Claude API para variações contextuais.
 * Suporta: posts, stories, reels/vídeo, WhatsApp, carrosséis.
 */

import { getHooksEco, getTodosHooksMultiEco } from './marketing-engine';

const API_URL = '/api/marketing-ai';

// ─── API Calls ───

async function callMarketingAI(action, params) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
    throw new Error(err.error || `Erro ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Erro desconhecido');
  return data.result;
}

/**
 * Gera hooks novos baseados nos existentes.
 * @param {Object} opts
 * @param {string} [opts.eco] - Eco específico (vitalis, serena, etc.) ou null para geral
 * @param {number} [opts.quantidade=5] - Quantos hooks gerar
 * @param {string} [opts.formato] - Formato alvo (post, story, reels, whatsapp)
 * @param {string} [opts.genero] - M, F, ou null
 * @returns {Promise<string[]>} Array de hooks gerados
 */
export async function gerarHooksIA(opts = {}) {
  const { eco, quantidade = 5, formato, genero } = opts;

  // Buscar sementes dos hooks existentes (até 5 como referência)
  let sementes;
  if (eco) {
    sementes = getHooksEco(eco);
  }
  if (!sementes || !sementes.length) {
    // Fallback: todos os hooks multi-eco
    sementes = getTodosHooksMultiEco().map(h => h.hook);
  }
  // Escolher 5 aleatórios como referência
  const shuffled = [...sementes].sort(() => 0.5 - Math.random()).slice(0, 5);

  return callMarketingAI('gerar-hooks', {
    eco,
    sementes: shuffled,
    quantidade,
    formato,
    genero,
  });
}

/**
 * Gera conteúdo completo para uma plataforma.
 * @param {Object} opts
 * @param {string} opts.hook - Hook de partida
 * @param {string} [opts.eco] - Eco em foco
 * @param {string} [opts.plataforma='instagram'] - instagram, story, whatsapp, facebook, reels, carrossel
 * @param {string} [opts.genero] - M, F, ou null
 * @returns {Promise<{hook, corpo, cta, hashtags, slides}>}
 */
export async function gerarConteudoIA(opts = {}) {
  const { hook, eco, plataforma = 'instagram', genero } = opts;
  if (!hook) throw new Error('Hook é obrigatório');

  return callMarketingAI('gerar-conteudo', {
    hook,
    eco,
    plataforma,
    genero,
  });
}

/**
 * Gera roteiro de vídeo (Reels/TikTok).
 * @param {Object} opts
 * @param {string} [opts.hook] - Hook de partida (ou gera um novo)
 * @param {string} [opts.eco] - Eco em foco
 * @param {string} [opts.duracao='15-30s'] - Duração alvo
 * @param {string} [opts.estilo='talking-head'] - talking-head, text-overlay, pov, antes-depois, tutorial
 * @param {string} [opts.genero] - M, F, ou null
 * @returns {Promise<{titulo, hook_visual, roteiro, caption, hashtags, dica_gravacao}>}
 */
export async function gerarVideoScriptIA(opts = {}) {
  const { hook, eco, duracao = '15-30s', estilo = 'talking-head', genero } = opts;

  return callMarketingAI('gerar-video-script', {
    hook,
    eco,
    duracao,
    estilo,
    genero,
  });
}

// ─── Suno AI (Música) ───

/**
 * Gera música via Suno AI (AIMLAPI).
 * @param {Object} opts
 * @param {string} [opts.eco] - Eco para mood musical
 * @param {string} [opts.tipo='reels'] - jingle, fundo, reels, meditacao
 * @param {string} [opts.titulo] - Título da música
 * @param {string} [opts.prompt] - Letra/prompt personalizado (opcional)
 * @param {boolean} [opts.instrumental=false] - Só instrumental, sem voz
 * @returns {Promise<{clip_ids: string[], message: string}>}
 */
export async function gerarMusicaIA(opts = {}) {
  const { eco, tipo = 'reels', titulo, prompt, instrumental = false } = opts;

  return callMarketingAI('gerar-musica', {
    eco: eco || undefined,
    tipo,
    titulo,
    prompt: prompt || undefined,
    instrumental,
  });
}

/**
 * Verifica o status de clips de música em geração.
 * @param {string[]} clipIds - IDs dos clips a verificar
 * @returns {Promise<Object>} Dados dos clips (com audio_url quando pronto)
 */
export async function statusMusicaIA(clipIds) {
  if (!clipIds?.length) throw new Error('clipIds é obrigatório');

  const params = clipIds.map(id => `clip_ids[]=${encodeURIComponent(id)}`).join('&');
  const res = await fetch(`${API_URL}?action=status-musica&${params}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
    throw new Error(err.error || `Erro ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Erro desconhecido');
  return data.result;
}

/**
 * Tipos de música disponíveis.
 */
export const TIPOS_MUSICA = [
  { id: 'jingle', nome: 'Jingle', desc: 'Curto e memorável (5-15s)', icon: '🎵' },
  { id: 'fundo', nome: 'Fundo', desc: 'Música ambiente para conteúdo', icon: '🎶' },
  { id: 'reels', nome: 'Reels/Shorts', desc: 'Energético e viral', icon: '🎬' },
  { id: 'meditacao', nome: 'Meditação', desc: 'Calmo e contemplativo', icon: '🧘' },
];

/**
 * Plataformas suportadas com metadata.
 */
export const PLATAFORMAS = [
  { id: 'instagram', nome: 'Instagram Post', icon: '📱', desc: 'Caption + hashtags' },
  { id: 'story', nome: 'Instagram Story', icon: '📲', desc: '3-5 slides curtos' },
  { id: 'reels', nome: 'Reels / TikTok', icon: '🎬', desc: 'Script de vídeo com timing' },
  { id: 'whatsapp', nome: 'WhatsApp', icon: '💬', desc: 'Mensagem directa e pessoal' },
  { id: 'facebook', nome: 'Facebook', icon: '📘', desc: 'Post conversacional' },
  { id: 'carrossel', nome: 'Carrossel', icon: '📑', desc: '5-7 slides educativos' },
];

/**
 * Estilos de vídeo disponíveis.
 */
export const ESTILOS_VIDEO = [
  { id: 'talking-head', nome: 'Vivianne a Falar', desc: 'Directa para a câmara' },
  { id: 'text-overlay', nome: 'Texto + Música', desc: 'Sem narração, só visual' },
  { id: 'pov', nome: 'POV Trending', desc: 'Cenário relatable' },
  { id: 'antes-depois', nome: 'Antes / Depois', desc: 'Contraste visual' },
  { id: 'tutorial', nome: 'Mini-Tutorial', desc: 'Mostrando a app' },
];

/**
 * Ecos disponíveis para selecção.
 */
export const ECOS_OPCOES = [
  { id: '', nome: 'Geral (Sete Ecos)', emoji: '🌿' },
  { id: 'vitalis', nome: 'VITALIS', emoji: '🌿' },
  { id: 'aurea', nome: 'ÁUREA', emoji: '✨' },
  { id: 'serena', nome: 'SERENA', emoji: '💧' },
  { id: 'ignis', nome: 'IGNIS', emoji: '🔥' },
  { id: 'ventis', nome: 'VENTIS', emoji: '🍃' },
  { id: 'ecoa', nome: 'ECOA', emoji: '🔊' },
  { id: 'imago', nome: 'IMAGO', emoji: '⭐' },
];
