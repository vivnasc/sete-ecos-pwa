/**
 * API Endpoint: Enviar WhatsApp via Meta Cloud API
 *
 * Configuração no Vercel:
 * - WHATSAPP_ACCESS_TOKEN: Token de acesso Meta Business
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número WhatsApp Business
 * - VIVIANNE_PERSONAL_NUMBER: Número pessoal da coach (ex: 258851006473)
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

  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const personalNumber = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
  const COACH_NUMBER = personalNumber
    ? personalNumber.replace(/[^0-9]/g, '')
    : '258851006473';

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('Meta WhatsApp API não configurada');
    return res.status(500).json({ error: 'Meta WhatsApp API não configurada. Adiciona WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID no Vercel.' });
  }

  try {
    const { mensagem, para } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Destino: coach por defeito, ou número específico (só dígitos)
    const destinatario = para
      ? para.replace(/[^0-9]/g, '')
      : COACH_NUMBER;

    const url = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: destinatario,
        type: 'text',
        text: { body: mensagem },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro Meta API:', result?.error?.message || JSON.stringify(result));
      return res.status(response.status).json({
        error: result?.error?.message || 'Erro ao enviar WhatsApp',
        code: result?.error?.code
      });
    }

    const msgId = result.messages?.[0]?.id;
    console.log('WhatsApp enviado via Meta:', msgId);
    return res.status(200).json({ success: true, messageId: msgId });

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return res.status(500).json({ error: 'Erro interno ao enviar WhatsApp' });
  }
}
