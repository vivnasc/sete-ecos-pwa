/**
 * WhatsApp Broadcast — Módulo partilhado
 *
 * Lógica de envio proativo de WhatsApp via Meta Cloud API.
 * Usado pelo coach.js como actions de broadcast.
 */

import { createClient } from '@supabase/supabase-js';

const ACCESS_TOKEN = () => (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
const PHONE_NUMBER_ID = () => (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

// ===== ENVIAR MENSAGEM VIA META CLOUD API =====

export async function enviarMensagemWA(para, texto) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    return { ok: false, error: 'Meta API não configurada' };
  }

  const paraLimpo = para.replace(/[^0-9]/g, '');
  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: paraLimpo,
        type: 'text',
        text: { body: texto },
      }),
    });

    if (!response.ok) {
      let errData;
      try { errData = await response.json(); } catch (_) { errData = await response.text(); }
      console.error('Erro Meta API broadcast:', response.status, JSON.stringify(errData));
      return { ok: false, error: errData?.error?.message || `HTTP ${response.status}`, numero: paraLimpo };
    }

    const result = await response.json();
    return { ok: true, messageId: result.messages?.[0]?.id, numero: paraLimpo };
  } catch (err) {
    return { ok: false, error: err.message, numero: paraLimpo };
  }
}

// ===== LISTAR CONTACTOS DO CHATBOT =====

export async function listarContactosWA(supabase) {
  const { data: mensagens, error } = await supabase
    .from('chatbot_mensagens')
    .select('telefone, nome, chave_detectada, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar contactos: ${error.message}`);

  const contactosMap = new Map();

  for (const msg of mensagens || []) {
    const tel = msg.telefone;
    if (!tel || tel === 'teste-simulador' || tel === 'desconhecido') continue;

    if (!contactosMap.has(tel)) {
      contactosMap.set(tel, {
        telefone: tel,
        nome: msg.nome || null,
        total_mensagens: 0,
        ultima_mensagem: msg.created_at,
        primeira_mensagem: msg.created_at,
        chaves_detectadas: new Set(),
      });
    }

    const c = contactosMap.get(tel);
    c.total_mensagens++;
    if (msg.nome && !c.nome) c.nome = msg.nome;
    c.primeira_mensagem = msg.created_at;
    if (msg.chave_detectada) c.chaves_detectadas.add(msg.chave_detectada);
  }

  const { data: clientes } = await supabase
    .from('vitalis_clients')
    .select('user_id, subscription_status, users!inner(email, nome)')
    .in('subscription_status', ['active', 'trial', 'tester']);

  const contactos = [];
  for (const [, c] of contactosMap) {
    const interesses = [...c.chaves_detectadas];
    const interessouPrecos = interesses.some(k => ['precos', 'pagar', 'trial'].includes(k));
    const interessouVitalis = interesses.some(k => ['1', 'vitalis'].includes(k));

    contactos.push({
      telefone: c.telefone,
      nome: c.nome,
      total_mensagens: c.total_mensagens,
      ultima_mensagem: c.ultima_mensagem,
      primeira_mensagem: c.primeira_mensagem,
      interesses,
      interessou_precos: interessouPrecos,
      interessou_vitalis: interessouVitalis,
      tipo: 'lead',
    });
  }

  contactos.sort((a, b) => new Date(b.ultima_mensagem) - new Date(a.ultima_mensagem));

  return {
    contactos,
    total: contactos.length,
    total_clientes_activos: clientes?.length || 0,
  };
}

// ===== BROADCAST PARA LISTA DE NÚMEROS =====

export async function broadcastWA(supabase, numeros, mensagem) {
  const resultados = { enviados: 0, erros: [], total: numeros.length };

  for (let i = 0; i < numeros.length; i++) {
    const result = await enviarMensagemWA(numeros[i], mensagem);

    if (result.ok) {
      resultados.enviados++;
    } else {
      resultados.erros.push({ numero: numeros[i], erro: result.error });
    }

    try {
      await supabase.from('whatsapp_broadcast_log').insert({
        telefone: numeros[i].replace(/[^0-9]/g, ''),
        mensagem: mensagem.slice(0, 2000),
        tipo: 'broadcast',
        status: result.ok ? 'enviado' : 'erro',
        erro: result.ok ? null : result.error,
        message_id: result.messageId || null,
      });
    } catch (_) { /* tabela pode não existir */ }

    // Rate limit: 3s entre mensagens
    if (i < numeros.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  return resultados;
}

// ===== BROADCAST POR GRUPO =====

export async function broadcastGrupoWA(supabase, grupo, mensagem) {
  const { contactos } = await listarContactosWA(supabase);

  let numeros = [];
  if (grupo === 'todos') {
    numeros = contactos.map(c => c.telefone);
  } else if (grupo === 'leads') {
    numeros = contactos.filter(c => c.tipo === 'lead').map(c => c.telefone);
  } else if (grupo === 'interessados-precos') {
    numeros = contactos.filter(c => c.interessou_precos).map(c => c.telefone);
  } else if (grupo === 'interessados-vitalis') {
    numeros = contactos.filter(c => c.interessou_vitalis).map(c => c.telefone);
  } else if (grupo === 'recentes') {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    numeros = contactos
      .filter(c => new Date(c.ultima_mensagem) >= limite)
      .map(c => c.telefone);
  } else {
    throw new Error(`Grupo inválido: ${grupo}. Disponíveis: todos, leads, interessados-precos, interessados-vitalis, recentes`);
  }

  if (numeros.length === 0) {
    return { message: 'Nenhum contacto neste grupo', enviados: 0, total: 0, grupo };
  }

  const resultados = await broadcastWA(supabase, numeros, mensagem);
  resultados.grupo = grupo;
  resultados.message = `Broadcast "${grupo}": ${resultados.enviados}/${resultados.total} enviados`;
  return resultados;
}
