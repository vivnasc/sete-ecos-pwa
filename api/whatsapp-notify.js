/**
 * API: Enviar notificação WhatsApp via CallMeBot
 *
 * CallMeBot é gratuito e não requer conta business.
 *
 * CONFIGURAÇÃO:
 * 1. A coach adiciona +34 644 51 95 23 aos contactos
 * 2. Envia "I allow callmebot to send me messages"
 * 3. Recebe API Key
 * 4. Adiciona CALLMEBOT_API_KEY e CALLMEBOT_PHONE no Vercel
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY;
  const CALLMEBOT_PHONE = process.env.CALLMEBOT_PHONE || '258851006473';

  if (!CALLMEBOT_API_KEY) {
    console.warn('CALLMEBOT_API_KEY não configurada - WhatsApp desactivado');
    // Não falhar, apenas registar
    return res.status(200).json({
      success: false,
      reason: 'WhatsApp não configurado'
    });
  }

  try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Codificar mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);

    // Chamar API do CallMeBot
    const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${mensagemCodificada}&apikey=${CALLMEBOT_API_KEY}`;

    const response = await fetch(url);
    const text = await response.text();

    if (response.ok && text.includes('Message queued')) {
      return res.status(200).json({ success: true });
    } else {
      console.error('CallMeBot error:', text);
      return res.status(200).json({
        success: false,
        reason: 'Erro ao enviar mensagem'
      });
    }

  } catch (error) {
    console.error('Erro WhatsApp notify:', error);
    return res.status(500).json({
      error: 'Erro interno',
      details: error.message
    });
  }
}
