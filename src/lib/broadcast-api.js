/**
 * Broadcast API Client
 *
 * Cliente frontend para as APIs de broadcast:
 * - WhatsApp Broadcast (proativo via Meta Cloud API)
 * - Email Broadcast (via Resend)
 */

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

// ===== WHATSAPP =====

/**
 * Listar todos os contactos WhatsApp (do chatbot)
 */
export async function listarContactosWhatsApp(token) {
  const res = await fetch(`${API_BASE}/api/whatsapp-broadcast?action=contactos`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erro ao listar contactos');
  return res.json();
}

/**
 * Enviar mensagem WhatsApp individual
 */
export async function enviarWhatsApp(token, para, mensagem) {
  const res = await fetch(`${API_BASE}/api/whatsapp-broadcast?action=enviar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ para, mensagem }),
  });
  return res.json();
}

/**
 * Broadcast WhatsApp para lista de números
 */
export async function broadcastWhatsApp(token, numeros, mensagem) {
  const res = await fetch(`${API_BASE}/api/whatsapp-broadcast?action=broadcast`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ numeros, mensagem }),
  });
  return res.json();
}

/**
 * Broadcast WhatsApp por grupo predefinido
 */
export async function broadcastWhatsAppGrupo(token, grupo, mensagem) {
  const res = await fetch(`${API_BASE}/api/whatsapp-broadcast?action=broadcast-grupo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grupo, mensagem }),
  });
  return res.json();
}

// ===== EMAIL =====

/**
 * Enviar broadcast de email
 */
export async function broadcastEmail(secret, tipo, audiencia) {
  const res = await fetch(`${API_BASE}/api/cron?task=broadcast&tipo=${tipo}&audiencia=${audiencia}`, {
    headers: { 'Authorization': `Bearer ${secret}` },
  });
  return res.json();
}
