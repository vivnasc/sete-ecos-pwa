/**
 * API Endpoint: Enviar WhatsApp via Twilio
 *
 * Configuração no Vercel:
 * - TWILIO_ACCOUNT_SID: Account SID do Twilio
 * - TWILIO_AUTH_TOKEN: Auth Token do Twilio
 * - TWILIO_WHATSAPP_NUMBER: Número WhatsApp do Twilio (formato: whatsapp:+14155238886)
 * - COACH_WHATSAPP_NUMBER: Número da Vivianne (formato: whatsapp:+258851006473)
 */

export default async function handler(req, res) {
  // CORS - Restrito ao domínio da app
  const allowedOrigins = [
    'https://app.seteecos.com',
    'https://seteecos.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  // Prioridade: VIVIANNE_PERSONAL_NUMBER > COACH_WHATSAPP_NUMBER > default
  const personalNumber = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
  const COACH_WHATSAPP_NUMBER = personalNumber
    ? `whatsapp:+${personalNumber.replace(/^\+/, '')}`
    : (process.env.COACH_WHATSAPP_NUMBER || 'whatsapp:+258851006473');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('Twilio não configurado');
    return res.status(500).json({ error: 'Twilio não configurado. Adiciona TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN no Vercel.' });
  }

  try {
    const { mensagem, para } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Destino: coach por defeito, ou número específico
    const destinatario = para || COACH_WHATSAPP_NUMBER;

    // Twilio API URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Autenticação Basic
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: destinatario,
        Body: mensagem
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro Twilio:', result);
      return res.status(response.status).json({
        error: result.message || 'Erro ao enviar WhatsApp',
        code: result.code
      });
    }

    console.log('WhatsApp enviado:', result.sid);
    return res.status(200).json({ success: true, sid: result.sid });

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return res.status(500).json({ error: 'Erro interno ao enviar WhatsApp' });
  }
}
