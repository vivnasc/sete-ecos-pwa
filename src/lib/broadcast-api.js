/**
 * Broadcast API Client
 *
 * Cliente frontend para as APIs de broadcast via /api/coach:
 * - WhatsApp Broadcast (proativo via Meta Cloud API)
 * - Email Broadcast (via Resend)
 */

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

async function coachPost(token, action, params = {}) {
  const res = await fetch(`${API_BASE}/api/coach`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...params }),
  });
  return res.json();
}

// ===== WHATSAPP =====

/**
 * Listar todos os contactos WhatsApp (do chatbot)
 */
export async function listarContactosWhatsApp(token) {
  return coachPost(token, 'wa-contactos');
}

/**
 * Enviar mensagem WhatsApp individual
 */
export async function enviarWhatsApp(token, para, mensagem) {
  return coachPost(token, 'wa-enviar', { para, mensagem });
}

/**
 * Broadcast WhatsApp para lista de números
 */
export async function broadcastWhatsApp(token, numeros, mensagem) {
  return coachPost(token, 'wa-broadcast', { numeros, mensagem });
}

/**
 * Broadcast WhatsApp por grupo predefinido
 */
export async function broadcastWhatsAppGrupo(token, grupo, mensagem) {
  return coachPost(token, 'wa-broadcast-grupo', { grupo, mensagem });
}

// ===== EMAIL =====

/**
 * Enviar broadcast de email
 */
export async function broadcastEmail(token, tipo, audiencia) {
  return coachPost(token, 'email-broadcast', { tipo, audiencia });
}
