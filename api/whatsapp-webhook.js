/**
 * WhatsApp Business API — Webhook Meta Cloud API
 *
 * Webhook para receber e responder mensagens WhatsApp via Meta Cloud API.
 * Usa o módulo partilhado chatbot-respostas.js para respostas e detecção.
 *
 * Configuração no Meta Business:
 * 1. Ir a developers.facebook.com > App > WhatsApp > Configuration
 * 2. Callback URL: https://app.seteecos.com/api/whatsapp-webhook
 * 3. Verify Token: o valor de WHATSAPP_VERIFY_TOKEN (ex: "seteecos2026")
 * 4. Webhook fields: messages
 *
 * Variáveis de ambiente (Vercel):
 * - WHATSAPP_VERIFY_TOKEN: Token de verificação (ex: "seteecos2026")
 * - WHATSAPP_ACCESS_TOKEN: Token permanente da Meta Cloud API
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número no Meta Business
 */

import { gerarResposta, COACH_NUMERO, NOMES_CHAVES, getSessao, atualizarSessao } from './_lib/chatbot-respostas.js';
import { logMensagem } from './_lib/chatbot-log.js';
import {
  lookupUserByPhone,
  atualizarPeso,
  atualizarRestricoes, parseRestricoes,
  atualizarActividade, parseActividade,
  atualizarRefeicoes, parseRefeicoes,
  atualizarObjetivo, parseObjetivo,
} from './_lib/wa-plano-update.js';

const VERIFY_TOKEN = (process.env.WHATSAPP_VERIFY_TOKEN || 'seteecos2026').trim();
const ACCESS_TOKEN = () => (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
const PHONE_NUMBER_ID = () => (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

// ===== LOG DE ACTIVIDADE (in-memory para diagnóstico) =====
const activityLog = [];
const MAX_LOG = 50;

function logActivity(type, data) {
  activityLog.unshift({ type, ...data, ts: new Date().toISOString() });
  if (activityLog.length > MAX_LOG) activityLog.length = MAX_LOG;
}

// ===== DEDUPLICAÇÃO DE MENSAGENS =====
// Meta pode reenviar webhooks se o processamento demora >5s
const mensagensProcessadas = new Set();
const MAX_CACHE = 500;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cacheTimestamps = new Map();

function jaProcessada(messageId) {
  if (!messageId) return false;
  if (mensagensProcessadas.has(messageId)) return true;

  // Limpar cache se muito grande
  if (mensagensProcessadas.size > MAX_CACHE) {
    const agora = Date.now();
    for (const [id, ts] of cacheTimestamps) {
      if (agora - ts > CACHE_TTL) {
        mensagensProcessadas.delete(id);
        cacheTimestamps.delete(id);
      }
    }
  }

  mensagensProcessadas.add(messageId);
  cacheTimestamps.set(messageId, Date.now());
  return false;
}

// ===== ANTI-LOOP: Rate limiting por número =====
// Máximo de respostas por número num intervalo curto
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 5; // máx 5 respostas por minuto por número

function verificarRateLimit(telefone) {
  if (!telefone) return true; // permitir se sem número

  const agora = Date.now();
  const registo = rateLimitMap.get(telefone);

  if (!registo || agora - registo.inicio > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(telefone, { inicio: agora, count: 1 });
    return true;
  }

  registo.count++;
  if (registo.count > RATE_LIMIT_MAX) {
    console.warn('RATE LIMIT atingido para:', telefone, '| msgs:', registo.count);
    logActivity('rate_limited', { telefone, count: registo.count });
    return false;
  }

  return true;
}

// ===== ANTI-LOOP: IDs de mensagens enviadas pelo bot =====
// Se a Meta reenvia a nossa própria mensagem como echo, ignoramos
const mensagensEnviadas = new Set();
const MAX_SENT_CACHE = 200;

function registarMensagemEnviada(msgId) {
  if (!msgId) return;
  mensagensEnviadas.add(msgId);
  if (mensagensEnviadas.size > MAX_SENT_CACHE) {
    const iter = mensagensEnviadas.values();
    for (let i = 0; i < 50; i++) mensagensEnviadas.delete(iter.next().value);
  }
}

function eMensagemPropria(msgId) {
  return msgId && mensagensEnviadas.has(msgId);
}

// ===== ENVIAR MENSAGEM VIA META CLOUD API =====

async function enviarMensagem(para, texto) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    console.error('WhatsApp Meta API não configurada — WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID em falta');
    return { ok: false, error: 'not_configured' };
  }

  // Limpar número: só dígitos, sem +, sem espaços
  const paraLimpo = para.replace(/[^0-9]/g, '');

  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: paraLimpo,
    type: 'text',
    text: { body: texto },
  };

  console.log('enviarMensagem →', { para: paraLimpo, phoneId, urlBase: `v22.0/${phoneId}/messages`, textoLen: texto.length });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errData;
      try { errData = await response.json(); } catch (_) { errData = await response.text(); }
      console.error('Erro Meta API:', response.status, JSON.stringify(errData));
      logActivity('send_error', { para: paraLimpo, status: response.status, error: errData?.error?.message || 'unknown' });
      return { ok: false, error: 'api_error', status: response.status, metaError: errData };
    }

    const result = await response.json();
    const msgId = result.messages?.[0]?.id;
    console.log('Meta API sucesso:', msgId);
    logActivity('send_ok', { para: paraLimpo, messageId: msgId });
    // ANTI-LOOP: registar ID da mensagem enviada para ignorar echos
    registarMensagemEnviada(msgId);
    return { ok: true, messageId: msgId };
  } catch (err) {
    console.error('Erro ao enviar mensagem Meta:', err.message);
    logActivity('send_exception', { para: paraLimpo, error: err.message });
    return { ok: false, error: 'network_error' };
  }
}

// ===== MARCAR COMO LIDA =====

async function marcarComoLida(messageId) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();
  if (!token || !phoneId) return;

  try {
    await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (_) {
    // Não bloqueia — apenas cosmético (ticks azuis)
  }
}

// ===== NOTIFICAR COACH =====
// Nota: COACH_NUMERO é o mesmo que o número do negócio WhatsApp,
// portanto NÃO podemos enviar mensagem de si para si.
// Se VIVIANNE_PERSONAL_NUMBER estiver configurado no Vercel, envia para lá.
// Caso contrário, registamos no log de actividade e no Supabase (que já é feito).

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const personalNumber = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();

  logActivity('coach_notify', { cliente: clienteNumero, nome: clienteNome, contexto });

  if (personalNumber && personalNumber !== COACH_NUMERO) {
    const msg = `*Nova mensagem Sete Ecos*\n\n${clienteNome || 'Contacto novo'}\n+${clienteNumero}\n${contexto}\n\nResponde directamente à cliente no WhatsApp.`;
    await enviarMensagem(personalNumber, msg);
  } else {
    // Sem número pessoal configurado — log apenas (Supabase já regista)
    console.log('Coach notify (sem envio — mesmo número):', clienteNumero, clienteNome, contexto);
  }
}

// ===== ATUALIZAÇÃO DE PLANO VIA WHATSAPP =====

const NIVEIS_NOMES = {
  'sedentaria': 'Sedentária',
  'leve': 'Leve (1-3x/semana)',
  'moderada': 'Moderada (3-5x/semana)',
  'intensa': 'Intensa (5+x/semana)',
};

const RESTRICOES_NOMES = {
  'halal': 'Halal',
  'sem_lactose': 'Sem lactose',
  'sem_gluten': 'Sem glúten',
  'vegetariano': 'Vegetariano',
  'vegano': 'Vegano',
};

const OBJETIVOS_NOMES = {
  'emagrecer': 'Emagrecer',
  'ganhar_massa': 'Ganhar massa muscular',
  'melhorar_saude': 'Melhorar saúde',
  'ganhar_energia': 'Ganhar energia',
};

async function handlePlanoUpdate(telefone, nome, chave, dados, msgBody) {
  // Confirmação: sim
  if (chave === 'confirmar_plano_sim') {
    const sessao = getSessao(telefone);
    if (!sessao?.acaoPendente) {
      return 'Não há nenhuma atualização pendente. Escreve o que queres mudar (ex: "peso 72kg", "sem glúten", "4 refeições").';
    }

    const { tipo, userId, valor } = sessao.acaoPendente;

    // Executar a atualização dos dados (sem regenerar plano — a coach decide quando)
    let resultado;
    let descricao = '';
    if (tipo === 'peso') {
      resultado = await atualizarPeso(userId, valor);
      descricao = `Peso atualizado para *${valor}kg*`;
    } else if (tipo === 'restricoes') {
      resultado = await atualizarRestricoes(userId, valor.restricoes, valor.remover);
      descricao = `Restrições ${valor.remover ? 'removidas' : 'adicionadas'}`;
    } else if (tipo === 'actividade') {
      resultado = await atualizarActividade(userId, valor);
      descricao = `Atividade atualizada para *${NIVEIS_NOMES[valor] || valor}*`;
    } else if (tipo === 'refeicoes') {
      resultado = await atualizarRefeicoes(userId, valor);
      descricao = `Refeições atualizadas para *${valor}x/dia*`;
    } else if (tipo === 'objetivo') {
      resultado = await atualizarObjetivo(userId, valor);
      descricao = `Objetivo atualizado para *${OBJETIVOS_NOMES[valor] || valor}*`;
    }

    if (!resultado?.ok) {
      sessao.acaoPendente = null;
      return `Houve um erro ao atualizar: ${resultado?.error || 'erro desconhecido'}.\n\nTenta de novo ou escreve *vivianne*.`;
    }

    // Limpar ação pendente
    sessao.acaoPendente = null;

    return `${descricao} ✅\n\nOs teus dados foram guardados. A Vivianne vai rever e atualizar o teu plano em breve.\n\nSe precisares de mais alguma coisa, escreve aqui!`;
  }

  // Confirmação: não
  if (chave === 'confirmar_plano_nao') {
    const sessao = getSessao(telefone);
    if (sessao) sessao.acaoPendente = null;
    return 'Cancelado! Nada foi alterado no teu plano.\n\nSe precisares de ajuda, escreve *vivianne*.';
  }

  // ===== NOVAS ATUALIZAÇÕES — primeiro fazer lookup =====

  const lookup = await lookupUserByPhone(telefone);

  if (!lookup.found) {
    return `Não encontrei um perfil VITALIS associado a este número de WhatsApp.

Para que eu possa atualizar o teu plano, precisas de:
1. Ter uma conta em app.seteecos.com
2. Ter preenchido o questionário VITALIS
3. Ter o teu número de WhatsApp no perfil

Se já tens conta, diz-me o teu email que eu procuro manualmente. Ou escreve *vivianne* para falar comigo.`;
  }

  const primeiroNome = (lookup.nome || nome || '').split(' ')[0] || '';

  // ===== ATUALIZAR PESO =====
  if (chave === 'atualizar_peso') {
    const novoPeso = dados.peso;
    const pesoAtual = parseFloat(lookup.intake.peso_actual) || 0;
    const diff = Math.abs(novoPeso - pesoAtual);

    // Guardar ação pendente na sessão
    const sessao = getSessao(telefone) || {};
    sessao.acaoPendente = { tipo: 'peso', userId: lookup.userId, valor: novoPeso };
    atualizarSessao(telefone, msgBody, chave);
    const s = getSessao(telefone);
    if (s) s.acaoPendente = sessao.acaoPendente;

    let msg = `${primeiroNome ? primeiroNome + ', ' : ''}vou atualizar o teu peso de *${pesoAtual}kg* para *${novoPeso}kg*`;
    if (diff > 0) msg += ` (${novoPeso > pesoAtual ? '+' : ''}${(novoPeso - pesoAtual).toFixed(1)}kg)`;
    msg += `.\n\nA Vivianne vai usar estes dados quando atualizar o teu plano.\n\n*Confirmas?* (sim/não)`;

    return msg;
  }

  // ===== ATUALIZAR RESTRIÇÕES =====
  if (chave === 'atualizar_restricoes') {
    const { restricoes, remover } = parseRestricoes(dados.textoOriginal);

    if (restricoes.length === 0) {
      return `Não percebi que restrição queres ${remover ? 'remover' : 'adicionar'}.\n\nOpções disponíveis:\n- *sem glúten*\n- *sem lactose*\n- *halal*\n- *vegetariano*\n- *vegano*\n\nExemplo: "sem glúten" ou "tirar lactose"`;
    }

    const nomes = restricoes.map(r => RESTRICOES_NOMES[r] || r).join(', ');
    const atualStr = (lookup.intake.restricoes_alimentares || []).map(r => RESTRICOES_NOMES[r] || r).join(', ') || 'nenhuma';

    const sessao = getSessao(telefone) || {};
    sessao.acaoPendente = { tipo: 'restricoes', userId: lookup.userId, valor: { restricoes, remover } };
    atualizarSessao(telefone, msgBody, chave);
    const s = getSessao(telefone);
    if (s) s.acaoPendente = sessao.acaoPendente;

    return `${primeiroNome ? primeiroNome + ', ' : ''}vou *${remover ? 'remover' : 'adicionar'}*: ${nomes}\n\nRestrições atuais: ${atualStr}\n\nA Vivianne vai usar estes dados quando atualizar o teu plano.\n\n*Confirmas?* (sim/não)`;
  }

  // ===== ATUALIZAR ATIVIDADE =====
  if (chave === 'atualizar_actividade') {
    const nivel = parseActividade(dados.textoOriginal);

    if (!nivel) {
      return `Não percebi o nível de atividade.\n\nOpções:\n- *sedentária* (sem exercício)\n- *leve* (1-3x/semana)\n- *moderada* (3-5x/semana)\n- *intensa* (5+x/semana)\n\nOu diz quantas vezes treinas: "3x semana"`;
    }

    const atualNivel = NIVEIS_NOMES[lookup.intake.nivel_actividade] || lookup.intake.nivel_actividade || 'não definida';

    const sessao = getSessao(telefone) || {};
    sessao.acaoPendente = { tipo: 'actividade', userId: lookup.userId, valor: nivel };
    atualizarSessao(telefone, msgBody, chave);
    const s = getSessao(telefone);
    if (s) s.acaoPendente = sessao.acaoPendente;

    return `${primeiroNome ? primeiroNome + ', ' : ''}vou mudar o teu nível de atividade de *${atualNivel}* para *${NIVEIS_NOMES[nivel]}*.\n\nA Vivianne vai usar estes dados quando atualizar o teu plano.\n\n*Confirmas?* (sim/não)`;
  }

  // ===== ATUALIZAR REFEIÇÕES =====
  if (chave === 'atualizar_refeicoes') {
    const num = parseRefeicoes(dados.textoOriginal);

    if (!num || num < 2 || num > 6) {
      return 'Quantas refeições por dia queres? (entre 2 e 6)\n\nExemplo: "4 refeições"';
    }

    const atualRef = lookup.intake.refeicoes_dia || 3;

    const sessao = getSessao(telefone) || {};
    sessao.acaoPendente = { tipo: 'refeicoes', userId: lookup.userId, valor: num };
    atualizarSessao(telefone, msgBody, chave);
    const s = getSessao(telefone);
    if (s) s.acaoPendente = sessao.acaoPendente;

    return `${primeiroNome ? primeiroNome + ', ' : ''}vou mudar de *${atualRef} refeições* para *${num} refeições* por dia.\n\nA Vivianne vai usar estes dados quando atualizar o teu plano.\n\n*Confirmas?* (sim/não)`;
  }

  // ===== ATUALIZAR OBJETIVO =====
  if (chave === 'atualizar_objetivo') {
    const objetivo = parseObjetivo(dados.textoOriginal);

    if (!objetivo) {
      return `Qual é o teu novo objetivo?\n\nOpções:\n- *emagrecer* (perder peso)\n- *ganhar massa* (muscular)\n- *melhorar saúde*\n- *mais energia*\n\nExemplo: "quero emagrecer"`;
    }

    const atualObj = OBJETIVOS_NOMES[lookup.intake.objectivo_principal] || lookup.intake.objectivo_principal || 'não definido';

    const sessao = getSessao(telefone) || {};
    sessao.acaoPendente = { tipo: 'objetivo', userId: lookup.userId, valor: objetivo };
    atualizarSessao(telefone, msgBody, chave);
    const s = getSessao(telefone);
    if (s) s.acaoPendente = sessao.acaoPendente;

    return `${primeiroNome ? primeiroNome + ', ' : ''}vou mudar o teu objetivo de *${atualObj}* para *${OBJETIVOS_NOMES[objetivo]}*.\n\nA Vivianne vai usar estes dados quando atualizar o teu plano.\n\n*Confirmas?* (sim/não)`;
  }

  return 'Não percebi o que queres atualizar. Escreve *vivianne* para falar comigo directamente.';
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // ===== OPTIONS = preflight CORS (para simulador) =====
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(200).end();
  }

  // ===== GET = verificação do webhook pela Meta =====
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verificação Meta
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook WhatsApp Meta verificado');
      return res.status(200).send(challenge);
    }

    // ===== SETUP: ?action=setup — diagnosticar e subscrever WABA =====
    if (req.query.action === 'setup') {
      return handleSetup(req, res);
    }

    // ===== STATUS: ?action=status — ver actividade recente =====
    if (req.query.action === 'status') {
      return res.status(200).json({
        status: 'ok',
        endpoint: 'whatsapp-webhook (Meta Cloud API)',
        config: {
          hasAccessToken: !!ACCESS_TOKEN(),
          hasPhoneNumberId: !!PHONE_NUMBER_ID(),
          phoneNumberId: PHONE_NUMBER_ID() ? `${PHONE_NUMBER_ID().slice(0, 4)}...${PHONE_NUMBER_ID().slice(-4)}` : 'N/A',
          tokenPreview: ACCESS_TOKEN() ? `${ACCESS_TOKEN().slice(0, 8)}...` : 'N/A',
          verifyToken: VERIFY_TOKEN,
          apiVersion: 'v22.0',
        },
        actividade: activityLog,
        deduplicacao: {
          mensagensEmCache: mensagensProcessadas.size,
        },
        timestamp: new Date().toISOString(),
        nota: 'Se "actividade" está vazio e enviaste mensagens, o webhook NÃO está a receber POSTs da Meta. Verifica a configuração do webhook em developers.facebook.com → App → WhatsApp → Configuration.',
      });
    }

    // Diagnóstico rápido no browser
    const hasToken = !!ACCESS_TOKEN();
    const hasPhoneId = !!PHONE_NUMBER_ID();
    return res.status(200).json({
      status: 'ok',
      endpoint: 'whatsapp-webhook (Meta Cloud API)',
      config: {
        hasAccessToken: hasToken,
        hasPhoneNumberId: hasPhoneId,
        verifyToken: VERIFY_TOKEN ? 'configurado' : 'NÃO CONFIGURADO',
        apiVersion: 'v22.0',
      },
      urls: {
        status: '/api/whatsapp-webhook?action=status',
        setup: '/api/whatsapp-webhook?action=setup',
      },
      timestamp: new Date().toISOString()
    });
  }

  // ===== POST com action=setup — subscrever app ao WABA =====
  if (req.query?.action === 'setup') {
    return handleSetup(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // ===== MODO TESTE (simulador sem Meta API) =====
  const isTest = req.query?.mode === 'test' || req.body?.mode === 'test';
  if (isTest) {
    setCorsHeaders(req, res);

    try {
      const { mensagem, nome } = req.body || {};
      if (!mensagem) return res.status(400).json({ error: 'mensagem é obrigatória' });

      const { resposta, chave, notificarCoach } = gerarResposta(mensagem, nome || 'Teste', 'teste-simulador');

      logMensagem({
        telefone: 'teste-simulador',
        nome: nome || 'Teste',
        mensagemIn: mensagem,
        mensagemOut: resposta,
        chave,
        notificouCoach: notificarCoach,
        canal: 'simulador',
      }).catch(() => {});

      return res.status(200).json({
        resposta,
        chave,
        notificarCoach,
        input: mensagem,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro no teste chatbot:', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  // ===== WEBHOOK META (mensagens reais) =====
  try {
    const body = req.body;

    // Log de TUDO que chega por POST — crucial para diagnóstico
    console.log('WEBHOOK POST recebido:', JSON.stringify({
      hasBody: !!body,
      object: body?.object,
      entryCount: body?.entry?.length,
      firstEntry: body?.entry?.[0] ? {
        id: body.entry[0].id,
        changesCount: body.entry[0].changes?.length,
        field: body.entry[0].changes?.[0]?.field,
        hasMessages: !!body.entry[0].changes?.[0]?.value?.messages,
        hasStatuses: !!body.entry[0].changes?.[0]?.value?.statuses,
      } : 'N/A',
    }));

    logActivity('webhook_post', {
      object: body?.object,
      hasMessages: !!body?.entry?.[0]?.changes?.[0]?.value?.messages,
      hasStatuses: !!body?.entry?.[0]?.changes?.[0]?.value?.statuses,
      entryId: body?.entry?.[0]?.id,
    });

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Sem mensagens — pode ser status update, etc.
    if (!value?.messages?.[0]) {
      console.log('POST sem mensagens — provavelmente status update');
      logActivity('webhook_no_msg', { field: changes?.field, statuses: value?.statuses?.length });
      return res.status(200).send('OK');
    }

    const message = value.messages[0];
    const from = message.from; // número sem +
    const nome = value.contacts?.[0]?.profile?.name || '';
    const messageId = message.id;
    const messageType = message.type; // text, image, document, etc.

    // Número do negócio (extraído do payload Meta)
    const businessPhone = value.metadata?.display_phone_number?.replace(/[^0-9]/g, '') || '';

    console.log('WhatsApp Meta recebeu:', JSON.stringify({
      from, nome, type: messageType,
      body: message.text?.body?.slice(0, 100),
      messageId,
      businessPhone,
    }));

    logActivity('msg_received', { from, nome, type: messageType, body: message.text?.body?.slice(0, 50), messageId });

    // ANTI-LOOP 1: Ignorar mensagens enviadas pelo próprio bot (echos)
    if (eMensagemPropria(messageId)) {
      console.log('ANTI-LOOP: Mensagem própria (echo) ignorada:', messageId);
      logActivity('echo_blocked', { messageId, from });
      return res.status(200).send('OK');
    }

    // Deduplicação: ignorar mensagens já processadas (Meta pode reenviar)
    if (jaProcessada(messageId)) {
      console.log('Mensagem duplicada ignorada:', messageId);
      return res.status(200).send('OK');
    }

    // ANTI-LOOP 2: Detectar se a mensagem é do número do negócio ou da coach
    // COACH_NUMERO é o mesmo que o número do negócio WhatsApp (258851006473)
    // Se a mensagem vem desse número, é a Vivianne a responder manualmente
    // NÃO devemos processar automaticamente — senão cria loop
    const isCoachMsg = from === COACH_NUMERO || (businessPhone && from === businessPhone);

    if (isCoachMsg) {
      console.log('ANTI-LOOP: Mensagem da coach/número do negócio — ignorar processamento automático');
      logActivity('coach_msg_skipped', { from, nome, body: message.text?.body?.slice(0, 50) });

      // Registar no Supabase para histórico mas NÃO responder
      logMensagem({
        telefone: from,
        nome,
        mensagemIn: message.text?.body || `[${messageType}]`,
        mensagemOut: '[coach — sem resposta automática]',
        chave: 'coach_manual',
        notificouCoach: false,
        canal: 'whatsapp-meta',
      }).catch(() => {});

      // Marcar como lida para mostrar ticks azuis
      marcarComoLida(messageId).catch(() => {});
      return res.status(200).send('OK');
    }

    // ANTI-LOOP 3: Rate limiting — máx 5 respostas por minuto por número
    if (!verificarRateLimit(from)) {
      console.log('ANTI-LOOP: Rate limit atingido para', from);
      marcarComoLida(messageId).catch(() => {});
      return res.status(200).send('OK');
    }

    // Marcar como lida (ticks azuis)
    marcarComoLida(messageId).catch(() => {});

    // ===== MEDIA (imagem/documento = comprovativo) =====
    if (['image', 'document'].includes(messageType) && !message.text?.body) {
      const mediaMsg = 'Recebemos a tua imagem! Se é um comprovativo de pagamento, vou verificar e activar o teu acesso em menos de 1 hora.\n\nSe precisas de mais ajuda, escreve:\n*preços* · *trial* · *pagar* · *vivianne*\nOu o número de um Eco (1-7)';

      logMensagem({
        telefone: from,
        nome,
        mensagemIn: `[${messageType}]`,
        mensagemOut: mediaMsg,
        chave: 'media',
        notificouCoach: true,
        canal: 'whatsapp-meta',
      }).catch(() => {});

      await enviarMensagem(from, mediaMsg);

      // Notificar coach (mensagens da coach já foram filtradas acima)
      notificarVivianne(from, nome, `Enviou ${messageType} — possivelmente comprovativo de pagamento`).catch(() => {});

      return res.status(200).send('OK');
    }

    // ===== TEXTO =====
    const msgBody = (message.text?.body || '').trim();
    if (!msgBody) return res.status(200).send('OK');

    // Gerar resposta usando módulo partilhado (com telefone para sessões)
    const { resposta, chave, notificarCoach, asyncHandler, dados } = gerarResposta(msgBody, nome, from);

    // ===== ATUALIZAÇÃO DE PLANO VIA WHATSAPP (async) =====
    if (asyncHandler) {
      try {
        const respostaAsync = await handlePlanoUpdate(from, nome, chave, dados, msgBody);

        logMensagem({
          telefone: from, nome,
          mensagemIn: msgBody,
          mensagemOut: respostaAsync,
          chave,
          notificouCoach: true,
          canal: 'whatsapp-meta',
        }).catch(() => {});

        await enviarMensagem(from, respostaAsync);

        // Notificar coach de atualizações de plano
        const tema = NOMES_CHAVES[chave] || 'Atualização de plano';
        notificarVivianne(from, nome, `*${tema}*\nMensagem: "${msgBody}"`).catch(() => {});

        return res.status(200).send('OK');
      } catch (err) {
        console.error('Erro no handlePlanoUpdate:', err);
        const errMsg = 'Desculpa, houve um erro ao processar o teu pedido. Tenta de novo ou escreve *vivianne* para falar comigo directamente.';
        await enviarMensagem(from, errMsg);
        return res.status(200).send('OK');
      }
    }

    console.log('Resposta gerada para:', msgBody, '| chave:', chave, '| tamanho:', resposta.length);

    // Registar no Supabase (não bloqueia)
    logMensagem({
      telefone: from,
      nome,
      mensagemIn: msgBody,
      mensagemOut: resposta,
      chave,
      notificouCoach: !!notificarCoach,
      canal: 'whatsapp-meta',
    }).catch(err => console.error('Log erro:', err.message));

    // Enviar resposta
    const result = await enviarMensagem(from, resposta);

    if (!result.ok) {
      console.error('Falha ao enviar resposta Meta:', result.error);
    }

    // Notificar coach de TODAS as interações (mensagens da coach já filtradas acima)
    if (notificarCoach) {
      const tema = NOMES_CHAVES[chave] || null;
      const contexto = chave === 'vivianne_contacto'
        ? `Pediu para falar contigo!\nMensagem: "${msgBody}"`
        : tema
          ? `Perguntou sobre *${tema}*\nMensagem: "${msgBody}"`
          : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(from, nome, contexto).catch(err => {
        console.error('Erro ao notificar coach:', err);
      });
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook WhatsApp Meta:', error);
    // Meta espera sempre 200 — senão tenta reenviar
    return res.status(200).send('OK');
  }
}

// ===== SETUP: Diagnosticar, descobrir WABA, testar envio =====

const API_VERSION = 'v22.0';
const GRAPH_BASE = `https://graph.facebook.com/${API_VERSION}`;

async function graphGet(path, token) {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ok: res.ok, data: await res.json() };
}

async function graphPost(path, token, body = {}) {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json() };
}

async function handleSetup(req, res) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    return res.status(200).json({
      erro: 'Variáveis em falta no Vercel',
      WHATSAPP_ACCESS_TOKEN: token ? 'OK' : 'EM FALTA',
      WHATSAPP_PHONE_NUMBER_ID: phoneId ? 'OK' : 'EM FALTA',
      instrucoes: 'Vai a vercel.com > Settings > Environment Variables e adiciona as que faltam.',
    });
  }

  // ===== ?action=setup&test=true → envia mensagem de teste =====
  if (req.query.test === 'true') {
    return handleTestSend(req, res, token, phoneId);
  }

  const baseUrl = `${req.headers?.['x-forwarded-proto'] || 'https'}://${req.headers?.host || 'app.seteecos.com'}`;
  const result = {
    timestamp: new Date().toISOString(),
    phoneNumberId: phoneId,
    resumo: {},
    passos: [],
  };

  try {
    // ── Passo 1: Verificar número ──
    const phone = await graphGet(`${phoneId}?fields=display_phone_number,verified_name,quality_rating,id`, token);
    result.passos.push({
      passo: '1. Número de telefone',
      ok: phone.ok,
      resultado: phone.ok
        ? `${phone.data.verified_name} (${phone.data.display_phone_number})`
        : 'FALHOU — Phone Number ID pode estar errado',
      dados: phone.data,
    });
    result.resumo.numero = phone.ok ? 'OK' : 'FALHOU';

    // ── Passo 2: Descobrir WABA ID (múltiplos métodos) ──
    let wabaId = null;
    let appId = null;
    const wabaAttempts = [];

    // Método 0: URL param ?waba=XXXXX (input manual directo)
    if (req.query.waba) {
      const manualWaba = req.query.waba.trim();
      const check = await graphGet(`${manualWaba}?fields=id,name,currency,message_template_namespace`, token);
      if (check.ok && check.data?.id) {
        wabaId = check.data.id;
        wabaAttempts.push({ metodo: '0: URL param ?waba (manual)', ok: true, wabaId, nome: check.data.name });
      } else {
        wabaAttempts.push({ metodo: '0: URL param ?waba (manual)', ok: false, wabaTestado: manualWaba, resposta: check.data });
      }
    }

    // Método A: Campo whatsapp_business_account no phone number
    if (!wabaId) {
      const wabaA = await graphGet(`${phoneId}?fields=whatsapp_business_account`, token);
      if (wabaA.data?.whatsapp_business_account?.id) {
        wabaId = wabaA.data.whatsapp_business_account.id;
        wabaAttempts.push({ metodo: 'A: phone_number → waba', ok: true, wabaId });
      } else {
        wabaAttempts.push({ metodo: 'A: phone_number → waba', ok: false, resposta: wabaA.data });
      }
    }

    // Método B: GET /debug_token para ver app ID e permissões
    const debug = await graphGet(`debug_token?input_token=${token}`, token);
    appId = debug.data?.data?.app_id;
    const scopes = debug.data?.data?.scopes || [];
    wabaAttempts.push({
      metodo: 'B: debug_token',
      ok: !!appId,
      appId,
      permissoes: scopes,
    });

    // Método C: Listar WABAs do business que criou o token
    if (!wabaId && appId) {
      // Tentar via o owner business do token
      const meInfo = await graphGet(`me?fields=id,name`, token);
      if (meInfo.ok && meInfo.data?.id) {
        // O "me" com system user token retorna o system user
        const systemUserId = meInfo.data.id;

        // Tentar buscar assigned_pages ou assigned assets
        const assignedWabas = await graphGet(`${systemUserId}/assigned_whatsapp_business_accounts?fields=id,name`, token);
        if (assignedWabas.ok && assignedWabas.data?.data?.length > 0) {
          wabaId = assignedWabas.data.data[0].id;
          wabaAttempts.push({
            metodo: `C: system_user → assigned WABAs`,
            ok: true,
            wabaId,
            todosWabas: assignedWabas.data.data,
          });
        } else {
          wabaAttempts.push({
            metodo: `C: system_user (${meInfo.data.name || systemUserId})`,
            ok: false,
            resposta: assignedWabas.data,
          });
        }
      }
    }

    // Método D: Buscar businesses do utilizador do token
    if (!wabaId) {
      const biz = await graphGet(`me/businesses?fields=id,name`, token);
      if (biz.data?.data?.length > 0) {
        for (const business of biz.data.data.slice(0, 3)) {
          const wabas = await graphGet(`${business.id}/owned_whatsapp_business_accounts?fields=id,name`, token);
          if (wabas.data?.data?.length > 0) {
            wabaId = wabas.data.data[0].id;
            wabaAttempts.push({
              metodo: `D: business ${business.name} → WABAs`,
              ok: true,
              wabaId,
              todosWabas: wabas.data.data,
            });
            break;
          } else {
            wabaAttempts.push({
              metodo: `D: business ${business.name}`,
              ok: false,
              resposta: wabas.data,
            });
          }
        }
      } else {
        wabaAttempts.push({ metodo: 'D: me/businesses', ok: false, resposta: biz.data });
      }
    }

    // Método F: Business ID directo (conhecido ou via URL param ?business=XXXX)
    if (!wabaId) {
      const businessIds = [
        req.query.business,                                        // URL param
        (process.env.META_BUSINESS_ID || '').trim(),               // Env var
        '955492164319345',                                         // Business ID conhecido (Sete Ecos)
      ].filter(Boolean);

      for (const bizId of businessIds) {
        const wabas = await graphGet(`${bizId}/owned_whatsapp_business_accounts?fields=id,name,currency`, token);
        if (wabas.ok && wabas.data?.data?.length > 0) {
          wabaId = wabas.data.data[0].id;
          wabaAttempts.push({
            metodo: `F: business_id ${bizId} → WABAs`,
            ok: true,
            wabaId,
            wabaName: wabas.data.data[0].name,
            todosWabas: wabas.data.data,
          });
          break;
        } else {
          wabaAttempts.push({
            metodo: `F: business_id ${bizId}`,
            ok: false,
            resposta: wabas.data,
          });
        }
      }
    }

    // Método E: Env var WHATSAPP_BUSINESS_ACCOUNT_ID
    if (!wabaId && process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      const envWaba = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '').trim();
      const check = await graphGet(`${envWaba}?fields=id,name`, token);
      if (check.ok && check.data?.id) {
        wabaId = envWaba;
        wabaAttempts.push({ metodo: 'E: env var WHATSAPP_BUSINESS_ACCOUNT_ID', ok: true, wabaId });
      } else {
        wabaAttempts.push({ metodo: 'E: env var WHATSAPP_BUSINESS_ACCOUNT_ID', ok: false, nota: `ID ${envWaba} é INVÁLIDO — actualiza no Vercel!`, resposta: check.data });
      }
    }

    result.passos.push({
      passo: '2. Descobrir WABA ID',
      ok: !!wabaId,
      wabaId: wabaId || 'NÃO ENCONTRADO',
      tentativas: wabaAttempts,
      comoTestar: !wabaId ? `Tenta com o WABA ID manual: ${baseUrl}/api/whatsapp-webhook?action=setup&waba=COLOCA_WABA_ID_AQUI` : undefined,
    });
    result.resumo.wabaId = wabaId ? `OK (${wabaId})` : 'NÃO ENCONTRADO';

    // ── Passo 2B: Listar Phone Numbers do WABA (descobrir o correcto) ──
    if (wabaId) {
      const phoneNumbers = await graphGet(`${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`, token);
      if (phoneNumbers.ok && phoneNumbers.data?.data?.length > 0) {
        const numeros = phoneNumbers.data.data;
        const phoneIdActual = PHONE_NUMBER_ID();
        const phoneIdCorreto = numeros[0]?.id;
        const phoneIdErrado = phoneIdActual && !numeros.some(n => n.id === phoneIdActual);

        result.passos.push({
          passo: '2B. Números de telefone do WABA',
          ok: true,
          numerosEncontrados: numeros.map(n => ({
            phoneNumberId: n.id,
            numero: n.display_phone_number,
            nome: n.verified_name,
            qualidade: n.quality_rating,
          })),
          phoneIdActual: phoneIdActual || 'NÃO CONFIGURADO',
          phoneIdCorreto: phoneIdCorreto,
          phoneIdErrado,
          accao: phoneIdErrado
            ? `PHONE NUMBER ID ERRADO! O correcto é: ${phoneIdCorreto}. Actualiza WHATSAPP_PHONE_NUMBER_ID no Vercel para: ${phoneIdCorreto}`
            : phoneIdActual === phoneIdCorreto
              ? 'Phone Number ID está CORRECTO!'
              : `Configura WHATSAPP_PHONE_NUMBER_ID no Vercel para: ${phoneIdCorreto}`,
        });
        result.resumo.phoneNumberId = phoneIdErrado
          ? `ERRADO — usar ${phoneIdCorreto}`
          : 'OK';
      } else {
        result.passos.push({
          passo: '2B. Números de telefone do WABA',
          ok: false,
          resultado: 'Não consegui listar os números — permissão pode faltar',
          dados: phoneNumbers.data,
        });
      }
    }

    // ── Passo 3: Webhook subscription ──
    let webhookOk = false;

    // 3A: Subscrição ao nível do WABA (se temos WABA ID)
    if (wabaId) {
      const subs = await graphGet(`${wabaId}/subscribed_apps`, token);
      const isSubscribed = subs.ok && subs.data?.data?.length > 0;

      if (req.query.subscribe !== 'false' && (!isSubscribed || req.query.subscribe === 'true')) {
        const sub = await graphPost(`${wabaId}/subscribed_apps`, token);
        webhookOk = sub.ok;
        result.passos.push({
          passo: '3A. Subscrição WABA',
          ok: sub.ok,
          accao: 'Subscrevemos o app ao WABA',
          resultado: sub.ok ? 'SUBSCRITO COM SUCESSO!' : 'FALHOU',
          dados: sub.data,
        });
      } else {
        webhookOk = isSubscribed;
        result.passos.push({
          passo: '3A. Subscrição WABA',
          ok: isSubscribed,
          resultado: isSubscribed ? 'JÁ SUBSCRITO' : 'NÃO SUBSCRITO',
          dados: subs.data,
        });
      }
    }

    // 3B: Subscrição ao nível da App (fallback — requer App Secret)
    const appSecret = (process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || '').trim();
    if (!webhookOk && appId && appSecret) {
      const appToken = `${appId}|${appSecret}`;
      const callbackUrl = `${baseUrl}/api/whatsapp-webhook`;

      // Primeiro verificar subscrições existentes
      const existingSubs = await graphGet(`${appId}/subscriptions`, appToken);

      // Subscrever a app para receber webhooks WhatsApp
      const subResult = await fetch(`${GRAPH_BASE}/${appId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          callback_url: callbackUrl,
          verify_token: VERIFY_TOKEN,
          fields: 'messages',
          access_token: appToken,
        }),
      });
      const subData = await subResult.json();
      webhookOk = subResult.ok && subData.success;

      result.passos.push({
        passo: '3B. Subscrição App-Level',
        ok: webhookOk,
        accao: `Subscrição ao nível da App (${appId})`,
        callbackUrl,
        resultado: webhookOk ? 'SUBSCRITO COM SUCESSO!' : 'FALHOU',
        dados: subData,
        subscricoesExistentes: existingSubs.data,
      });
    } else if (!webhookOk && !appSecret) {
      result.passos.push({
        passo: '3B. Subscrição App-Level (alternativa)',
        ok: false,
        resultado: 'App Secret não disponível',
        instrucoes: [
          'Para subscrever automaticamente sem WABA ID, adiciona ao Vercel:',
          'WHATSAPP_APP_SECRET = (App Secret de developers.facebook.com → App → Settings → Basic)',
          'Depois volta a correr este setup.',
        ],
      });
    }

    // Se nenhum método funcinou, instruções manuais
    if (!webhookOk) {
      result.passos.push({
        passo: '3C. Configuração Manual',
        ok: false,
        resultado: 'NECESSÁRIA — os métodos automáticos falharam',
        instrucoes: [
          '━━━ OPÇÃO 1: Encontrar o WABA ID ━━━',
          '1. Abre business.facebook.com',
          '2. No menu esquerdo: Business Settings → Accounts → WhatsApp Accounts',
          '3. Seleciona a conta "Sete Ecos"',
          '4. O WABA ID aparece no URL: business.facebook.com/settings/whatsapp-accounts/XXXXXXXXXX/',
          `5. Copia esse número e abre: ${baseUrl}/api/whatsapp-webhook?action=setup&waba=COLOCA_AQUI`,
          '',
          '━━━ OPÇÃO 2: Configurar webhook manualmente ━━━',
          '1. Abre developers.facebook.com',
          `2. Seleciona a App (ID: ${appId || 'desconhecido'})`,
          '3. Menu esquerdo: WhatsApp → Configuration',
          `4. Callback URL: ${baseUrl}/api/whatsapp-webhook`,
          `5. Verify Token: ${VERIFY_TOKEN}`,
          '6. Clica "Verify and Save"',
          '7. Abaixo, em Webhook Fields, activa "messages"',
          '',
          '━━━ OPÇÃO 3: Adicionar App Secret ━━━',
          `1. Abre developers.facebook.com → App (ID: ${appId || 'desconhecido'}) → Settings → Basic`,
          '2. Copia o "App Secret"',
          '3. Adiciona no Vercel: WHATSAPP_APP_SECRET = (o valor copiado)',
          '4. Volta a correr este setup',
        ],
      });
      result.resumo.webhook = 'FALHOU — ver instruções em 3C';
    } else {
      result.resumo.webhook = 'OK';
    }

    // ── Passo 4: Resumo e próximos passos ──
    const allOk = result.resumo.numero === 'OK' && webhookOk;
    result.resumo.estado = allOk ? 'PRONTO — o chatbot deve funcionar!' : 'INCOMPLETO — ver passos acima';

    result.urlsUteis = {
      testarEnvio: `${baseUrl}/api/whatsapp-webhook?action=setup&test=true`,
      verActividade: `${baseUrl}/api/whatsapp-webhook?action=status`,
      setupComWaba: `${baseUrl}/api/whatsapp-webhook?action=setup&waba=COLOCA_WABA_ID_AQUI`,
    };

  } catch (err) {
    result.erro = err.message;
    result.stack = err.stack?.split('\n').slice(0, 3);
  }

  return res.status(200).json(result);
}

// ===== TESTE DE ENVIO =====
async function handleTestSend(req, res, token, phoneId) {
  const destino = req.query.para || COACH_NUMERO;
  const texto = 'Teste Sete Ecos — se recebes esta mensagem, o chatbot WhatsApp está a funcionar correctamente! 🌿';

  // Primeiro, verificar o token
  const tokenCheck = await graphGet(`debug_token?input_token=${token}`, token);
  const tokenInfo = tokenCheck.data?.data || {};

  try {
    const sendResult = await enviarMensagem(destino, texto);

    // Diagnóstico baseado no tipo de erro
    let diagnostico = '';
    if (!sendResult.ok) {
      const metaErr = sendResult.metaError?.error || sendResult.metaError || {};
      const code = metaErr.code;
      const subcode = metaErr.error_subcode;
      const msg = metaErr.message || '';

      if (code === 190) {
        diagnostico = 'TOKEN EXPIRADO ou INVÁLIDO. Vai a developers.facebook.com → Tua App → WhatsApp → API Setup → gera um novo token permanente e actualiza WHATSAPP_ACCESS_TOKEN no Vercel.';
      } else if (code === 131030 || msg.includes('pair')) {
        diagnostico = 'O número de destino não tem conversa activa. Para enviar mensagem fora da janela de 24h, precisas de um Message Template aprovado pela Meta. Tenta mandar uma mensagem PRIMEIRO ao número Sete Ecos, e depois o bot responde.';
      } else if (code === 131047 || msg.includes('re-engage')) {
        diagnostico = 'Janela de 24h expirada. O contacto precisa mandar mensagem primeiro. Isto é normal — o chatbot SÓ responde a mensagens recebidas, não inicia conversas.';
      } else if (code === 100) {
        diagnostico = 'Parâmetro inválido. Verifica se o WHATSAPP_PHONE_NUMBER_ID está correcto no Vercel.';
      } else if (sendResult.status === 401) {
        diagnostico = 'Não autorizado. O token não tem permissão. Gera um novo System User Token com permissão whatsapp_business_messaging.';
      } else {
        diagnostico = `Erro Meta código ${code || sendResult.status}: ${msg}`;
      }
    }

    return res.status(200).json({
      teste: 'envio de mensagem',
      destino: `+${destino}`,
      sucesso: sendResult.ok,
      resultado: sendResult.ok
        ? 'MENSAGEM ENVIADA! Verifica o teu WhatsApp.'
        : 'FALHOU — ver diagnóstico abaixo',
      diagnostico: diagnostico || undefined,
      erroMeta: !sendResult.ok ? sendResult.metaError : undefined,
      tokenInfo: {
        valido: tokenInfo.is_valid,
        expira: tokenInfo.expires_at === 0 ? 'nunca (permanente)' : new Date((tokenInfo.expires_at || 0) * 1000).toISOString(),
        permissoes: tokenInfo.scopes,
        appId: tokenInfo.app_id,
      },
      proximoPasso: sendResult.ok
        ? 'O envio funciona! Manda uma mensagem ao número Sete Ecos no WhatsApp e vê se aparece resposta automática.'
        : 'Lê o diagnóstico acima. Se o erro é sobre janela 24h, isso é NORMAL — o chatbot responde a mensagens, não inicia conversas. Testa mandando uma mensagem ao número Sete Ecos.',
    });
  } catch (err) {
    return res.status(200).json({
      teste: 'envio de mensagem',
      sucesso: false,
      erro: err.message,
    });
  }
}

// ===== CORS HELPER =====

function setCorsHeaders(req, res) {
  const allowedOrigins = ['https://app.seteecos.com', 'https://seteecos.com', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
