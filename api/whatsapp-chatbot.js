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
import { logMensagem } from './_lib/chatbot-log.js';

const TWILIO_AUTH_TOKEN = () => process.env.TWILIO_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = () => process.env.TWILIO_ACCOUNT_SID;
const TWILIO_WHATSAPP_NUMBER = () => process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// ===== ENVIAR MENSAGEM VIA TWILIO REST API =====

async function enviarMensagemTwilio(para, texto) {
  const accountSid = TWILIO_ACCOUNT_SID();
  const authToken = TWILIO_AUTH_TOKEN();
  const rawFrom = TWILIO_WHATSAPP_NUMBER();
  const fromNumber = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;

  if (!accountSid || !authToken) {
    console.error('Twilio não configurado — TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN em falta');
    return { ok: false, error: 'not_configured' };
  }

  const destinatario = para.startsWith('whatsapp:') ? para : `whatsapp:${para}`;

  console.log('Twilio REST API: enviando para', destinatario, '| From:', fromNumber, '| tamanho:', texto.length);

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
    const errText = await response.text();
    let errCode = 0;
    try { errCode = JSON.parse(errText).code; } catch (_) {}
    console.error('Erro Twilio REST API:', response.status, errText);
    // 63007 = Channel not found (From number wrong or sandbox expired)
    return { ok: false, error: errCode === 63007 ? 'channel_not_found' : 'api_error', code: errCode };
  }

  const result = await response.json();
  console.log('Twilio REST API sucesso:', result.sid, result.status);
  return { ok: true };
}

// ===== NOTIFICAR COACH =====

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const msg = `*Nova mensagem Sete Ecos*\n\n${clienteNome || 'Contacto novo'}\n${clienteNumero}\n${contexto}\n\nResponde diretamente à cliente no WhatsApp.`;
  await enviarMensagemTwilio(`whatsapp:+${COACH_NUMERO}`, msg);
}

// ===== HELPERS: TwiML =====

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function respondTwiML(res, texto) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.status(200);
  res.end(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(texto)}</Message></Response>`);
}

function ackTwilio(res) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.status(200);
  res.end('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // OPTIONS = preflight CORS (para modo teste do simulador)
  if (req.method === 'OPTIONS') {
    const allowedOrigins = ['https://app.seteecos.com', 'https://seteecos.com', 'http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // GET = teste rápido / diagnóstico no browser
  if (req.method === 'GET') {
    const fromNum = TWILIO_WHATSAPP_NUMBER();
    const hasSid = !!TWILIO_ACCOUNT_SID();
    const hasToken = !!TWILIO_AUTH_TOKEN();
    return res.status(200).json({
      status: 'ok',
      endpoint: 'whatsapp-chatbot',
      config: {
        hasSid,
        hasToken,
        fromNumber: fromNum ? `${fromNum.slice(0, 12)}...` : 'NÃO CONFIGURADO',
      },
      method: 'Configure Twilio webhook como POST',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // ===== MODO TESTE (simulador sem Twilio) =====
  // POST com ?mode=test ou body.mode === 'test'
  const isTest = req.query?.mode === 'test' || req.body?.mode === 'test';
  if (isTest) {
    // CORS para o simulador
    const allowedOrigins = ['https://app.seteecos.com', 'https://seteecos.com', 'http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      const { mensagem, nome } = req.body || {};
      if (!mensagem) return res.status(400).json({ error: 'mensagem é obrigatória' });

      const { resposta, chave, notificarCoach } = gerarResposta(mensagem, nome || 'Teste');

      logMensagem({
        telefone: 'teste-simulador',
        nome: nome || 'Teste',
        mensagemIn: mensagem,
        mensagemOut: resposta,
        chave,
        notificouCoach: notificarCoach,
        canal: 'simulador',
      }).catch(() => {});

      return res.status(200).json({ resposta, chave, notificarCoach, input: mensagem, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Erro no teste chatbot:', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
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
      return ackTwilio(res);
    }

    const numeroLimpo = from.replace('whatsapp:', '').replace('+', '');

    // ANTI-LOOP: Detectar se a mensagem é da coach (Vivianne)
    const isCoach = numeroLimpo === COACH_NUMERO;

    // Media (comprovativo de pagamento, etc.)
    if (numMedia > 0 && !msgBody) {
      const mediaMsg = 'Recebemos a tua imagem! Se é um comprovativo de pagamento, a Vivianne vai verificar e ativar o teu acesso em menos de 1 hora.\n\nSe precisas de mais ajuda, responde com um número:\n1 VITALIS  2 LUMINA  3 ÁUREA  4 Preços  5 Pagamento  7 Falar com Vivianne';

      // Registar media no Supabase
      logMensagem({
        telefone: numeroLimpo,
        nome: profileName,
        mensagemIn: `[${numMedia} imagem(s)]`,
        mensagemOut: mediaMsg,
        chave: 'media',
        notificouCoach: !isCoach,
      }).catch(err => console.error('Log erro:', err.message));

      // Tentar REST API primeiro
      const result = await enviarMensagemTwilio(from, mediaMsg);

      // Notificar coach em paralelo — MAS NUNCA se a mensagem é DA coach (evita loop)
      if (!isCoach) {
        notificarVivianne(numeroLimpo, profileName, `Enviou ${numMedia} imagem(s) — possivelmente comprovativo de pagamento`).catch(err => {
          console.error('Erro ao notificar coach:', err);
        });
      }

      // Se REST falhou, usar TwiML como fallback
      if (!result.ok) {
        console.log('REST API falhou, usando TwiML fallback para media');
        return respondTwiML(res, mediaMsg);
      }

      return ackTwilio(res);
    }

    // Gerar resposta do chatbot
    const { resposta, chave, notificarCoach } = gerarResposta(msgBody, profileName, numeroLimpo);
    console.log('Resposta gerada para:', msgBody, '| chave:', chave, '| tamanho:', resposta.length, '| isCoach:', isCoach);

    // Registar no Supabase (não bloqueia)
    logMensagem({
      telefone: numeroLimpo,
      nome: profileName,
      mensagemIn: msgBody,
      mensagemOut: resposta,
      chave,
      notificouCoach: notificarCoach && !isCoach,
    }).catch(err => console.error('Log erro:', err.message));

    // Tentar enviar via REST API (permite mensagens mais longas)
    const result = await enviarMensagemTwilio(from, resposta);

    if (result.ok) {
      console.log('Resposta enviada via REST API: OK');
    } else {
      // REST API falhou — usar TwiML como fallback
      console.log('REST API falhou (erro:', result.error, ') — usando TwiML fallback');
      // TwiML tem limite de ~1600 chars, truncar se necessário
      const respostaTwiml = resposta.length > 1500
        ? resposta.slice(0, 1500) + '\n\n(mensagem truncada)'
        : resposta;

      // Notificar coach se necessário antes de responder (TwiML fecha a conexão)
      // ANTI-LOOP: nunca notificar se a mensagem é da própria coach
      if (notificarCoach && !isCoach) {
        const contexto = msgBody === '7'
          ? 'Cliente pediu para falar com a Vivianne'
          : `Mensagem não reconhecida: "${msgBody}"`;
        notificarVivianne(numeroLimpo, profileName, contexto).catch(err => {
          console.error('Erro ao notificar coach:', err);
        });
      }

      return respondTwiML(res, respostaTwiml);
    }

    // Notificar coach se necessário (não bloqueia)
    // ANTI-LOOP: nunca notificar se a mensagem é da própria coach
    if (notificarCoach && !isCoach) {
      const contexto = msgBody === '7'
        ? 'Cliente pediu para falar com a Vivianne'
        : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(numeroLimpo, profileName, contexto).catch(err => {
        console.error('Erro ao notificar coach:', err);
      });
    }

    return ackTwilio(res);

  } catch (error) {
    console.error('Erro no webhook Twilio WhatsApp:', error);

    // Responder via TwiML com mensagem de erro (sempre funciona)
    return respondTwiML(res, 'Desculpa, ocorreu um erro. Tenta novamente ou responde 7 para falar com a Vivianne.');
  }
}
