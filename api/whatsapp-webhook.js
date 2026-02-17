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

import { gerarResposta, COACH_NUMERO } from './_lib/chatbot-respostas.js';
import { logMensagem } from './_lib/chatbot-log.js';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'seteecos2026';
const ACCESS_TOKEN = () => process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = () => process.env.WHATSAPP_PHONE_NUMBER_ID;

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

// ===== ENVIAR MENSAGEM VIA META CLOUD API =====

async function enviarMensagem(para, texto) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    console.error('WhatsApp Meta API não configurada — WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID em falta');
    return { ok: false, error: 'not_configured' };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: para,
        type: 'text',
        text: { body: texto },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erro Meta API:', response.status, errText);
      return { ok: false, error: 'api_error', status: response.status };
    }

    const result = await response.json();
    console.log('Meta API sucesso:', result.messages?.[0]?.id);
    return { ok: true };
  } catch (err) {
    console.error('Erro ao enviar mensagem Meta:', err.message);
    return { ok: false, error: 'network_error' };
  }
}

// ===== MARCAR COMO LIDA =====

async function marcarComoLida(messageId) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();
  if (!token || !phoneId) return;

  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
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

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const msg = `*Nova mensagem Sete Ecos*\n\n${clienteNome || 'Contacto novo'}\n+${clienteNumero}\n${contexto}\n\nResponde directamente à cliente no WhatsApp.`;
  await enviarMensagem(COACH_NUMERO, msg);
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
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Sem mensagens — pode ser status update, etc.
    if (!value?.messages?.[0]) {
      return res.status(200).send('OK');
    }

    const message = value.messages[0];
    const from = message.from; // número sem +
    const nome = value.contacts?.[0]?.profile?.name || '';
    const messageId = message.id;
    const messageType = message.type; // text, image, document, etc.

    console.log('WhatsApp Meta recebeu:', JSON.stringify({
      from, nome, type: messageType,
      body: message.text?.body?.slice(0, 100),
    }));

    // Deduplicação: ignorar mensagens já processadas (Meta pode reenviar)
    if (jaProcessada(messageId)) {
      console.log('Mensagem duplicada ignorada:', messageId);
      return res.status(200).send('OK');
    }

    // ANTI-LOOP: Detectar se a mensagem é da coach (Vivianne)
    // Se for, NÃO notificar a coach sobre a própria mensagem
    const isCoachMsg = from === COACH_NUMERO;

    // Marcar como lida (ticks azuis)
    marcarComoLida(messageId).catch(() => {});

    // ===== MEDIA (imagem/documento = comprovativo) =====
    if (['image', 'document'].includes(messageType) && !message.text?.body) {
      const mediaMsg = 'Recebemos a tua imagem! Se é um comprovativo de pagamento, a Vivianne vai verificar e ativar o teu acesso em menos de 1 hora.\n\nSe precisas de mais ajuda, responde com um número:\n1 VITALIS  2 LUMINA  3 ÁUREA  4 Preços  5 Pagamento  7 Falar com Vivianne';

      logMensagem({
        telefone: from,
        nome,
        mensagemIn: `[${messageType}]`,
        mensagemOut: mediaMsg,
        chave: 'media',
        notificouCoach: !isCoachMsg,
        canal: 'whatsapp-meta',
      }).catch(() => {});

      await enviarMensagem(from, mediaMsg);

      // Notificar coach — MAS NUNCA se a mensagem é DA coach (evita loop)
      if (!isCoachMsg) {
        notificarVivianne(from, nome, `Enviou ${messageType} — possivelmente comprovativo de pagamento`).catch(() => {});
      }

      return res.status(200).send('OK');
    }

    // ===== TEXTO =====
    const msgBody = (message.text?.body || '').trim();
    if (!msgBody) return res.status(200).send('OK');

    // Gerar resposta usando módulo partilhado (com telefone para sessões)
    const { resposta, chave, notificarCoach } = gerarResposta(msgBody, nome, from);

    console.log('Resposta gerada para:', msgBody, '| chave:', chave, '| tamanho:', resposta.length, '| isCoach:', isCoachMsg);

    // Registar no Supabase (não bloqueia)
    logMensagem({
      telefone: from,
      nome,
      mensagemIn: msgBody,
      mensagemOut: resposta,
      chave,
      notificouCoach: notificarCoach && !isCoachMsg,
      canal: 'whatsapp-meta',
    }).catch(err => console.error('Log erro:', err.message));

    // Enviar resposta
    const result = await enviarMensagem(from, resposta);

    if (!result.ok) {
      console.error('Falha ao enviar resposta Meta:', result.error);
    }

    // Notificar coach se necessário — MAS NUNCA se a mensagem é DA coach (evita loop)
    if (notificarCoach && !isCoachMsg) {
      const contexto = chave === '7'
        ? 'Cliente pediu para falar com a Vivianne'
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

// ===== SETUP: Diagnosticar e subscrever WABA ao webhook =====

const API_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${API_VERSION}`;

async function handleSetup(req, res) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    return res.status(200).json({
      error: 'Variáveis em falta',
      hasAccessToken: !!token,
      hasPhoneNumberId: !!phoneId,
    });
  }

  const diagnostico = { timestamp: new Date().toISOString(), phoneNumberId: phoneId, steps: [] };

  try {
    // Step 1: Phone number info
    const phoneRes = await fetch(`${GRAPH_BASE}/${phoneId}?fields=display_phone_number,verified_name,quality_rating`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const phoneData = await phoneRes.json();
    diagnostico.steps.push({ step: '1. Phone Number Info', ok: phoneRes.ok, data: phoneData });

    // Step 2: Find WABA ID
    let wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null;

    if (!wabaId) {
      // Try to get WABA from phone number endpoint
      const wabaRes = await fetch(`${GRAPH_BASE}/${phoneId}?fields=id`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wabaData = await wabaRes.json();
      diagnostico.steps.push({ step: '2a. WABA via phone', ok: wabaRes.ok, data: wabaData });
    }

    if (!wabaId) {
      diagnostico.steps.push({
        step: '2. WABA ID',
        message: 'Não encontrado automaticamente. Adiciona WHATSAPP_BUSINESS_ACCOUNT_ID ao Vercel.',
        hint: 'Encontra o WABA ID em business.facebook.com > WhatsApp Accounts',
      });
    } else {
      diagnostico.steps.push({ step: '2. WABA ID', wabaId });
    }

    // Step 3: Listar TODOS os números do WABA
    if (wabaId) {
      const phonesRes = await fetch(`${GRAPH_BASE}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const phonesData = await phonesRes.json();
      diagnostico.steps.push({
        step: '3. Todos os números do WABA',
        ok: phonesRes.ok,
        hint: 'Copia o "id" do teu número real e mete em WHATSAPP_PHONE_NUMBER_ID no Vercel',
        data: phonesData,
      });

      // Step 4: Subscriptions
      const subsRes = await fetch(`${GRAPH_BASE}/${wabaId}/subscribed_apps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subsData = await subsRes.json();
      diagnostico.steps.push({ step: '4. Subscriptions', ok: subsRes.ok, data: subsData });

      // Step 5: Subscribe se pedido
      if (req.method === 'POST' || req.query.subscribe === 'true') {
        const subRes = await fetch(`${GRAPH_BASE}/${wabaId}/subscribed_apps`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        const subData = await subRes.json();
        diagnostico.steps.push({ step: '5. Subscribe App', ok: subRes.ok, data: subData });
      }
    }
  } catch (err) {
    diagnostico.error = err.message;
  }

  return res.status(200).json(diagnostico);
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
