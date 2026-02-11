/**
 * WhatsApp Chatbot via Twilio — Sete Ecos
 *
 * Webhook endpoint para receber e responder mensagens WhatsApp via Twilio.
 * Reutiliza a mesma lógica do chatbot (respostas, menus, detecção de intenção).
 *
 * Configuração no Twilio Console:
 * 1. Ir a Messaging > Try it out > Send a WhatsApp message (Sandbox)
 *    OU Messaging > Senders > WhatsApp senders (Business)
 * 2. Webhook URL: https://app.seteecos.com/api/whatsapp-chatbot
 * 3. Method: POST
 *
 * Variáveis de ambiente (Vercel):
 * - TWILIO_ACCOUNT_SID: Account SID do Twilio
 * - TWILIO_AUTH_TOKEN: Auth Token do Twilio (usado para validação de assinatura)
 * - TWILIO_WHATSAPP_NUMBER: Número WhatsApp Twilio (ex: whatsapp:+14155238886)
 */

import { gerarResposta, COACH_NUMERO } from './_lib/chatbot-respostas.js';
import { createHmac } from 'crypto';

const TWILIO_AUTH_TOKEN = () => process.env.TWILIO_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = () => process.env.TWILIO_ACCOUNT_SID;
const TWILIO_WHATSAPP_NUMBER = () => process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// ===== VALIDAÇÃO DE ASSINATURA TWILIO =====

function validarAssinaturaTwilio(req) {
  const authToken = TWILIO_AUTH_TOKEN();
  if (!authToken) return false;

  const signature = req.headers['x-twilio-signature'];
  if (!signature) return false;

  // Construir URL completa
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const url = `${protocol}://${host}${req.url}`;

  // Ordenar parâmetros POST e concatenar
  const params = req.body || {};
  const sortedKeys = Object.keys(params).sort();
  let dataString = url;
  for (const key of sortedKeys) {
    dataString += key + params[key];
  }

  // HMAC-SHA1
  const hmac = createHmac('sha1', authToken);
  hmac.update(dataString);
  const expectedSignature = hmac.digest('base64');

  // Comparação constante para evitar timing attacks
  if (signature.length !== expectedSignature.length) return false;

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

// ===== ENVIAR MENSAGEM VIA TWILIO REST API =====

async function enviarMensagemTwilio(para, texto) {
  const accountSid = TWILIO_ACCOUNT_SID();
  const authToken = TWILIO_AUTH_TOKEN();
  const fromNumber = TWILIO_WHATSAPP_NUMBER();

  if (!accountSid || !authToken) {
    console.error('Twilio não configurado');
    return;
  }

  // Garantir formato whatsapp:+XXXXXXXXX
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
  const msg = `*Nova mensagem Sete Ecos*

${clienteNome || 'Contacto novo'}
${clienteNumero}
${contexto}

Responde directamente à cliente no WhatsApp.`;

  await enviarMensagemTwilio(`whatsapp:+${COACH_NUMERO}`, msg);
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // Twilio envia POST com form-urlencoded
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Configura o webhook Twilio como POST.' });
  }

  // Validar assinatura Twilio (segurança)
  const skipValidation = process.env.TWILIO_SKIP_SIGNATURE_VALIDATION === 'true';
  if (!skipValidation && TWILIO_AUTH_TOKEN()) {
    const isValid = validarAssinaturaTwilio(req);
    if (!isValid) {
      console.warn('Assinatura Twilio inválida — pedido rejeitado');
      return res.status(403).json({ error: 'Assinatura inválida' });
    }
  }

  try {
    const body = req.body;

    // Campos Twilio standard
    const from = body.From || '';          // whatsapp:+258XXXXXXXXX
    const msgBody = (body.Body || '').trim();
    const profileName = body.ProfileName || '';
    const messageSid = body.MessageSid || '';
    const numMedia = parseInt(body.NumMedia || '0', 10);

    // Ignorar mensagens vazias
    if (!msgBody && numMedia === 0) {
      return res.status(200).type('text/xml').send('<Response></Response>');
    }

    // Extrair número limpo (sem prefixo whatsapp:+)
    const numeroLimpo = from.replace('whatsapp:', '').replace('+', '');

    // Se a mensagem é media (comprovativo de pagamento, etc.)
    if (numMedia > 0 && !msgBody) {
      const mediaMsg = `Recebemos a tua imagem! Se é um comprovativo de pagamento, a Vivianne vai verificar e activar o teu acesso em menos de 1 hora.\n\nSe precisas de mais ajuda, responde com um número:\n1 VITALIS  2 LUMINA  3 ÁUREA  4 Preços  5 Pagamento  7 Falar com Vivianne`;

      await enviarMensagemTwilio(from, mediaMsg);

      // Notificar coach sobre media recebida
      await notificarVivianne(
        numeroLimpo,
        profileName,
        `Enviou ${numMedia} imagem(s) — possivelmente comprovativo de pagamento`
      );

      return res.status(200).type('text/xml').send('<Response></Response>');
    }

    // Gerar resposta do chatbot
    const { resposta, notificarCoach } = gerarResposta(msgBody, profileName);

    // Enviar resposta via REST API (mais fiável que TwiML para mensagens longas)
    await enviarMensagemTwilio(from, resposta);

    // Notificar coach se necessário
    if (notificarCoach) {
      const contexto = msgBody === '7'
        ? 'Cliente pediu para falar com a Vivianne'
        : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(numeroLimpo, profileName, contexto).catch(err => {
        console.error('Erro ao notificar coach:', err);
      });
    }

    // Responder 200 com TwiML vazio (já enviámos via REST API)
    return res.status(200).type('text/xml').send('<Response></Response>');

  } catch (error) {
    console.error('Erro no webhook Twilio WhatsApp:', error);
    // Retornar 200 para o Twilio não reenviar
    return res.status(200).type('text/xml').send('<Response></Response>');
  }
}
