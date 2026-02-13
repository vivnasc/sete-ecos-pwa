/**
 * Endpoint de teste do chatbot WhatsApp — NÃO usa Twilio
 *
 * Simula o que aconteceria se alguém enviasse uma mensagem pelo WhatsApp.
 * Retorna a resposta do bot sem gastar créditos.
 *
 * POST /api/whatsapp-test
 * Body: { mensagem: "olá", nome: "Teste" }
 * Returns: { resposta, notificarCoach, input }
 */

import { gerarResposta } from './_lib/chatbot-respostas.js';
import { logMensagem } from './_lib/chatbot-log.js';

export default async function handler(req, res) {
  // CORS
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

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const { mensagem, nome } = req.body || {};

    if (!mensagem) {
      return res.status(400).json({ error: 'mensagem é obrigatória' });
    }

    const { resposta, chave, notificarCoach } = gerarResposta(mensagem, nome || 'Teste');

    // Registar no Supabase como teste (não bloqueia)
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro no teste chatbot:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
