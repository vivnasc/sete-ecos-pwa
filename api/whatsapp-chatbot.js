/**
 * WhatsApp Chatbot via Twilio — Sete Ecos
 *
 * Webhook endpoint para receber e responder mensagens WhatsApp via Twilio.
 * Responde via Twilio REST API (mais fiável que TwiML em serverless).
 *
 * Configuração no Twilio Console:
 * 1. Ir a Messaging > Try it out > Send a WhatsApp message (Sandbox)
 * 2. Webhook URL: https://app.seteecos.com/api/whatsapp-chatbot
 * 3. Method: POST
 *
 * Variáveis de ambiente (Vercel):
 * - TWILIO_ACCOUNT_SID: Account SID do Twilio
 * - TWILIO_AUTH_TOKEN: Auth Token do Twilio
 * - TWILIO_WHATSAPP_NUMBER: Número WhatsApp Twilio (ex: whatsapp:+14155238886)
 */

import { gerarResposta, COACH_NUMERO } from './_lib/chatbot-respostas.js';

const TWILIO_AUTH_TOKEN = () => process.env.TWILIO_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = () => process.env.TWILIO_ACCOUNT_SID;
const TWILIO_WHATSAPP_NUMBER = () => process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// ===== ENVIAR MENSAGEM VIA TWILIO REST API =====

async function enviarMensagemTwilio(para, texto) {
  const accountSid = TWILIO_ACCOUNT_SID();
  const authToken = TWILIO_AUTH_TOKEN();
  const fromNumber = TWILIO_WHATSAPP_NUMBER();

  if (!accountSid || !authToken) {
    console.error('Twilio não configurado — TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN em falta');
    return false;
  }

  const destinatario = para.startsWith('whatsapp:') ? para : `whatsapp:+${para}`;

  console.log('Twilio REST API: enviando para', destinatario, '| tamanho:', texto.length);

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: destinatario,
      Body: texto
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erro Twilio REST API:', response.status, err);
    return false;
  }

  const result = await response.json();
  console.log('Twilio REST API sucesso:', result.sid, result.status);
  return true;
}

// ===== NOTIFICAR COACH =====

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const msg = `*Nova mensagem Sete Ecos*\n\n${clienteNome || 'Contacto novo'}\n${clienteNumero}\n${contexto}\n\nResponde directamente à cliente no WhatsApp.`;
  await enviarMensagemTwilio(`whatsapp:+${COACH_NUMERO}`, msg);
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // GET = teste rápido no browser
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      endpoint: 'whatsapp-chatbot',
      method: 'Configure Twilio webhook como POST',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Sempre responder TwiML vazio para o Twilio não dar timeout
  // A resposta real vai via REST API
  function ackTwilio() {
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200);
    res.end('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }

  try {
    const body = req.body || {};
    console.log('WhatsApp chatbot recebeu:', JSON.stringify({
      From: body.From,
      Body: body.Body,
      NumMedia: body.NumMedia,
      ProfileName: body.ProfileName
    }));

    const from = body.From || '';
    const msgBody = (body.Body || '').trim();
    const profileName = body.ProfileName || '';
    const numMedia = parseInt(body.NumMedia || '0', 10);

    // Ignorar mensagens vazias
    if (!msgBody && numMedia === 0) {
      return ackTwilio();
    }

    const numeroLimpo = from.replace('whatsapp:', '').replace('+', '');

    // Media (comprovativo de pagamento, etc.)
    if (numMedia > 0 && !msgBody) {
      const mediaMsg = 'Recebemos a tua imagem! Se é um comprovativo de pagamento, a Vivianne vai verificar e activar o teu acesso em menos de 1 hora.\n\nSe precisas de mais ajuda, responde com um número:\n1 VITALIS  2 LUMINA  3 ÁUREA  4 Preços  5 Pagamento  7 Falar com Vivianne';

      // Enviar resposta via REST API e notificar coach em paralelo
      await Promise.all([
        enviarMensagemTwilio(from, mediaMsg),
        notificarVivianne(numeroLimpo, profileName, `Enviou ${numMedia} imagem(s) — possivelmente comprovativo de pagamento`)
      ]);

      return ackTwilio();
    }

    // Gerar resposta do chatbot
    const { resposta, notificarCoach } = gerarResposta(msgBody, profileName);
    console.log('Resposta gerada para:', msgBody, '| tamanho:', resposta.length);

    // Enviar resposta via REST API
    const enviado = await enviarMensagemTwilio(from, resposta);
    console.log('Resposta enviada via REST API:', enviado ? 'OK' : 'FALHOU');

    // Notificar coach se necessário (não bloqueia a resposta ao Twilio)
    if (notificarCoach) {
      const contexto = msgBody === '7'
        ? 'Cliente pediu para falar com a Vivianne'
        : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(numeroLimpo, profileName, contexto).catch(err => {
        console.error('Erro ao notificar coach:', err);
      });
    }

    return ackTwilio();

  } catch (error) {
    console.error('Erro no webhook Twilio WhatsApp:', error);

    // Tentar enviar mensagem de erro via REST API
    try {
      const from = req.body?.From;
      if (from) {
        await enviarMensagemTwilio(from, 'Desculpa, ocorreu um erro. Tenta novamente ou responde 7 para falar com a Vivianne.');
      }
    } catch (e) {
      console.error('Erro ao enviar mensagem de fallback:', e);
    }

    return ackTwilio();
  }
}
