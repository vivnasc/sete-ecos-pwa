/**
 * WhatsApp Chatbot via Twilio — Sete Ecos
 *
 * Webhook endpoint para receber e responder mensagens WhatsApp via Twilio.
 * Responde via TwiML directo (sem chamada REST API extra).
 *
 * Configuração no Twilio Console:
 * 1. Ir a Messaging > Try it out > Send a WhatsApp message (Sandbox)
 * 2. Webhook URL: https://app.seteecos.com/api/whatsapp-chatbot
 * 3. Method: POST
 *
 * Variáveis de ambiente (Vercel):
 * - TWILIO_ACCOUNT_SID: Account SID do Twilio (para notificações à coach)
 * - TWILIO_AUTH_TOKEN: Auth Token do Twilio
 * - TWILIO_WHATSAPP_NUMBER: Número WhatsApp Twilio (ex: whatsapp:+14155238886)
 */

import { gerarResposta, COACH_NUMERO } from './_lib/chatbot-respostas.js';

const TWILIO_AUTH_TOKEN = () => process.env.TWILIO_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = () => process.env.TWILIO_ACCOUNT_SID;
const TWILIO_WHATSAPP_NUMBER = () => process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// ===== ESCAPAR XML =====

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== ENVIAR MENSAGEM VIA TWILIO REST API (para notificações) =====

async function enviarMensagemTwilio(para, texto) {
  const accountSid = TWILIO_ACCOUNT_SID();
  const authToken = TWILIO_AUTH_TOKEN();
  const fromNumber = TWILIO_WHATSAPP_NUMBER();

  if (!accountSid || !authToken) {
    console.error('Twilio não configurado');
    return;
  }

  const destinatario = para.startsWith('whatsapp:') ? para : `whatsapp:+${para}`;

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
    console.error('Erro Twilio enviar:', err);
  }

  return response.ok;
}

// ===== NOTIFICAR COACH =====

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const msg = `*Nova mensagem Sete Ecos*\n\n${clienteNome || 'Contacto novo'}\n${clienteNumero}\n${contexto}\n\nResponde directamente à cliente no WhatsApp.`;
  await enviarMensagemTwilio(`whatsapp:+${COACH_NUMERO}`, msg);
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // GET = teste rápido no browser para verificar se o endpoint existe
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      endpoint: 'whatsapp-chatbot',
      method: 'Configure Twilio webhook como POST',
      timestamp: new Date().toISOString()
    });
  }

  // Twilio envia POST com form-urlencoded
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Helper para enviar TwiML
  function sendTwiML(message) {
    const twiml = message
      ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
      : '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    console.log('TwiML resposta (primeiros 200 chars):', twiml.substring(0, 200));
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200);
    res.end(twiml);
  }

  try {
    const body = req.body || {};
    console.log('WhatsApp chatbot recebeu:', JSON.stringify({ From: body.From, Body: body.Body, NumMedia: body.NumMedia, ProfileName: body.ProfileName }));

    // Campos Twilio standard
    const from = body.From || '';
    const msgBody = (body.Body || '').trim();
    const profileName = body.ProfileName || '';
    const numMedia = parseInt(body.NumMedia || '0', 10);

    // Ignorar mensagens vazias
    if (!msgBody && numMedia === 0) {
      return sendTwiML('');
    }

    // Extrair número limpo
    const numeroLimpo = from.replace('whatsapp:', '').replace('+', '');

    // Se a mensagem é media (comprovativo de pagamento, etc.)
    if (numMedia > 0 && !msgBody) {
      const mediaMsg = 'Recebemos a tua imagem! Se é um comprovativo de pagamento, a Vivianne vai verificar e activar o teu acesso em menos de 1 hora.\n\nSe precisas de mais ajuda, responde com um número:\n1 VITALIS  2 LUMINA  3 ÁUREA  4 Preços  5 Pagamento  7 Falar com Vivianne';

      // Notificar coach (não bloqueia a resposta)
      notificarVivianne(
        numeroLimpo,
        profileName,
        `Enviou ${numMedia} imagem(s) — possivelmente comprovativo de pagamento`
      ).catch(err => console.error('Erro notificar:', err));

      return sendTwiML(mediaMsg);
    }

    // Gerar resposta do chatbot
    const { resposta, notificarCoach } = gerarResposta(msgBody, profileName);

    // Notificar coach se necessário (não bloqueia)
    if (notificarCoach) {
      const contexto = msgBody === '7'
        ? 'Cliente pediu para falar com a Vivianne'
        : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(numeroLimpo, profileName, contexto).catch(err => {
        console.error('Erro ao notificar coach:', err);
      });
    }

    console.log('Resposta gerada para:', msgBody, '-> chave detectada, tamanho:', resposta.length);
    return sendTwiML(resposta);

  } catch (error) {
    console.error('Erro no webhook Twilio WhatsApp:', error);
    return sendTwiML('Desculpa, ocorreu um erro. Tenta novamente ou responde 7 para falar com a Vivianne.');
  }
}
