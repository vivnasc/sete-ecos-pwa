/**
 * WhatsApp Business API — Webhook Meta Cloud API
 *
 * Versão Meta Cloud API do chatbot Sete Ecos.
 * Usa o módulo partilhado chatbot-respostas.js para respostas e detecção.
 *
 * Variáveis de ambiente:
 * - WHATSAPP_VERIFY_TOKEN: Token de verificação (ex: "seteecos2026")
 * - WHATSAPP_ACCESS_TOKEN: Token da Meta Cloud API
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número no Meta Business
 */

import { gerarResposta, COACH_NUMERO } from './_lib/chatbot-respostas.js';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'seteecos2026';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // GET = verificação do webhook pela Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook WhatsApp verificado');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Token inválido');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body;
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      return res.status(200).send('OK');
    }

    const message = value.messages[0];
    const from = message.from;
    const nome = value.contacts?.[0]?.profile?.name || '';
    const msgBody = (message.text?.body || '').trim();

    // Ignorar mensagens vazias
    if (!msgBody) return res.status(200).send('OK');

    // Gerar resposta usando módulo partilhado
    const { resposta, notificarCoach, chave } = gerarResposta(msgBody, nome);

    // Enviar resposta
    await enviarMensagem(from, resposta);

    // Notificar coach se necessário
    if (notificarCoach) {
      const contexto = chave === '7'
        ? `Cliente pediu para falar com a Vivianne`
        : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(from, nome, contexto).catch(() => {});
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return res.status(200).send('OK');
  }
}

// ===== ENVIAR MENSAGEM =====

async function enviarMensagem(para, texto) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp API não configurada');
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
    const err = await response.text();
    console.error('Erro ao enviar WhatsApp:', err);
  }
}

// ===== NOTIFICAR COACH =====

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const msg = `*Nova mensagem Sete Ecos*

${clienteNome || 'Contacto novo'}
+${clienteNumero}
${contexto}

Responde directamente à cliente no WhatsApp.`;

  await enviarMensagem(COACH_NUMERO, msg);
}
