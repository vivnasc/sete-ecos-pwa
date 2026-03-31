/**
 * Marketing AI - Cliente para geração híbrida de conteúdo
 * Usa hooks existentes como sementes + Claude API para variações contextuais.
 * Suporta: posts, stories, reels/vídeo, WhatsApp, carrosséis.
 */

import { getHooksEco, getTodosHooksMultiEco } from './marketing-engine';

const API_URL = '/api/marketing-ai';

// ─── API Calls ───

async function callMarketingAI(subAction, params) {
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'marketing-ai', subAction, ...params }),
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
 * Letras pré-escritas por eco (estilo Vivianne — corpo-centrado, poético, sem terapia-fala).
 * Voz: urbana, íntima, arquitectural. Metáforas do corpo, da casa, do espelho.
 * Sem folclore estereotipado. Sem exotismo. Sem tribalismo.
 * Podem ser editadas antes de gerar. O backend tem as mesmas como fallback.
 */
export const ECO_LETRAS = {
  vitalis: `[Verse 1]
O corpo fala antes da mente acordar
A fome não é fraqueza, é mapa
Cada refeição que escolho com presença
É um tijolo na casa que habito

[Verse 2]
Não é regime, não é punição
É voltar a ouvir o que o estômago diz
A mesa posta com intenção
É o primeiro acto de respeito

[Chorus]
Volta ao corpo, volta ao centro
Não é melhorar, é lembrar
O que as mãos já sabem fazer
Quando a cabeça pára de mandar

[Bridge]
O corpo não mente
Mesmo quando a mente mente

[Outro]
Volta ao corpo
Volta ao centro`,

  aurea: `[Verse 1]
Havia um espelho na casa da minha mãe
Que só reflectia o que faltava
Passei anos a medir-me por ele
A minha sombra nunca era bastante

[Verse 2]
Hoje entro numa sala sem me encolher
As jóias não estão no pescoço
Estão na forma como ocupo o espaço
Sem pedir desculpa pelo meu tamanho

[Chorus]
O ouro que procuras já eras tu
Antes de te dizerem que não bastava
Não é valor que se compra ou se ganha
É o peso exacto do teu nome

[Bridge]
Tira o casaco do desconto
Larga o preço que te puseram
Tu não estás em promoção

[Outro]
O ouro que procuras
Já eras tu`,

  serena: `[Verse 1]
Há uma maré dentro do peito
Que sobe e desce sem pedir licença
Aprendi a chamar-lhe fraqueza
Quando sempre foi inteligência

[Verse 2]
O corpo sabe antes da palavra
A garganta aperta, o olho molha
Não é perder o controlo
É a água a encontrar a margem

[Chorus]
Deixa correr, não segures o rio
A emoção não é o inimigo
É o mapa que o corpo desenha
Quando a mente esqueceu o caminho

[Bridge]
Respira fundo, quatro tempos
Segura sete, solta oito
O corpo lembra o que a pressa esqueceu

[Outro]
A água sente
O que a mente nega`,

  ignis: `[Verse 1]
Não me peças para ser morna
Passei anos a baixar a chama
A caber no molde dos outros
A aquecer planos que não eram meus

[Verse 2]
O fogo não é raiva
É a vontade que se recusou a morrer
É o "não" que ficou preso na garganta
E hoje sai como decisão

[Chorus]
Acende o que apagaram
O fogo de dentro não se negocia
Não é agressão, não é descontrolo
É a coragem de escolher o teu caminho

[Bridge]
Corta o que não serve
Não com violência
Com a precisão de quem sabe o que quer

[Outro]
Arde
Mas arde por escolha`,

  ventis: `[Verse 1]
A árvore não pede desculpa por descansar
Perde as folhas e não chama fracasso
O vento passa e ela dobra
Mas nunca se parte por orgulho

[Verse 2]
Há um ritmo debaixo do ritmo
O coração sabe a cadência
Não é fazer mais, é fazer certo
O corpo tem a sua ciência

[Chorus]
Pára, respira, sente o vento
Nem tudo que é lento está parado
A pausa não é o oposto de avançar
É a raiz que segura o passo

[Bridge]
Manhã de sol, tarde de chuva
O corpo não quer constância
Quer verdade

[Outro]
O vento leva
O que não é teu`,

  ecoa: `[Verse 1]
Engoliram-me as palavras tão cedo
Que achei que o silêncio era a minha língua
A voz ficou guardada entre os ossos
Como uma carta que nunca foi enviada

[Verse 2]
Primeiro veio um sussurro
Depois uma frase inteira sem pedir desculpa
A garganta lembrou-se do que era
Antes de aprenderem a calá-la

[Chorus]
Ecoa, ecoa, a voz que voltou
Não pede licença, não pede perdão
Cada palavra é um tijolo
Na casa que nunca te deixaram construir

[Bridge]
Diz o que precisas
Sem embrulhar em desculpas
A tua voz não é barulho
É arquitectura

[Outro]
Ecoa
Dentro e fora de ti`,

  imago: `[Verse 1]
Fui tantas versões de mim
Que perdi a original no caminho
A filha exemplar, a mãe perfeita
A mulher que sorria de encomenda

[Verse 2]
Hoje olho o espelho sem maquilhagem
Sem o filtro que os outros me ensinaram
E vejo alguém que conheço
De um tempo antes de ter nome

[Chorus]
Não preciso de me encontrar
Nunca estive perdida
Preciso de parar de me esconder
Debaixo de quem me disseram que devia ser

[Bridge]
A criança sabia
O adolescente duvidou
A mulher esqueceu
Hoje lembro

[Outro]
Eu sou o espelho inteiro
Não só o reflexo`,

  '': `[Verse 1]
Sete camadas, sete conversas
Sete formas de voltar a casa
O corpo fala, a emoção traduz
A voz levanta o que a vergonha arrasa

[Verse 2]
Não é um sistema para te melhorar
É um espelho para te inteirar
As peças já estavam todas lá
Só faltava aprender a conversar

[Chorus]
Sete Ecos, um só centro
Corpo, valor, emoção
Vontade, energia, voz
E no espelho, o teu nome — inteiro

[Bridge]
Da raiz ao topo
Do silêncio ao som
Cada eco é uma conversa
Contigo, em ti, por ti

[Outro]
Sete Ecos
Um só tu`,
};

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
