/**
 * WhatsApp Broadcast API — Mensagens Proativas
 *
 * Endpoint para enviar mensagens WhatsApp proativas via Meta Cloud API.
 * Permite enviar para contactos individuais, grupos de clientes ou leads.
 *
 * Acções:
 * GET  ?action=contactos     — Lista todos os contactos WhatsApp (de chatbot_mensagens)
 * POST ?action=enviar        — Envia mensagem individual { para, mensagem }
 * POST ?action=broadcast     — Envia para lista { numeros[], mensagem }
 * POST ?action=broadcast-grupo — Envia para grupo predefinido { grupo, mensagem }
 *
 * Autenticação: CRON_SECRET via header ou query param
 */

import { createClient } from '@supabase/supabase-js';

const ACCESS_TOKEN = () => (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
const PHONE_NUMBER_ID = () => (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
const CRON_SECRET = process.env.CRON_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const COACH_EMAILS = ['viv.saraiva@gmail.com', 'vivnasc@gmail.com', 'vivianne.saraiva@outlook.com'];

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

function setCorsHeaders(req, res) {
  const origin = req.headers?.origin || '';
  const allowed = ['https://app.seteecos.com', 'https://seteecos.com', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function verificarAuth(req) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${CRON_SECRET}`) return true;
  if (req.query?.secret === CRON_SECRET) return true;
  // Coach auth via Supabase session token
  if (authHeader?.startsWith('Bearer ') && authHeader.length > 30) return true;
  return false;
}

// ===== ENVIAR MENSAGEM VIA META CLOUD API =====

async function enviarMensagem(para, texto) {
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

// ===== LISTAR CONTACTOS =====

async function listarContactos(supabase) {
  // Buscar todos os contactos únicos do chatbot
  const { data: mensagens, error } = await supabase
    .from('chatbot_mensagens')
    .select('telefone, nome, chave_detectada, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar contactos: ${error.message}`);

  // Agrupar por telefone
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
    c.primeira_mensagem = msg.created_at; // como está ordenado DESC, a última é a mais antiga
    if (msg.chave_detectada) c.chaves_detectadas.add(msg.chave_detectada);
  }

  // Buscar clientes activos para marcar quem é cliente
  const { data: clientes } = await supabase
    .from('vitalis_clients')
    .select('user_id, subscription_status, users!inner(email, nome)')
    .in('subscription_status', ['active', 'trial', 'tester']);

  const clienteEmails = new Set((clientes || []).map(c => c.users?.email?.toLowerCase()));

  // Converter para array
  const contactos = [];
  for (const [tel, c] of contactosMap) {
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
      tipo: 'lead', // default — será atualizado se for cliente
    });
  }

  // Ordenar por última mensagem (mais recentes primeiro)
  contactos.sort((a, b) => new Date(b.ultima_mensagem) - new Date(a.ultima_mensagem));

  return {
    contactos,
    total: contactos.length,
    total_clientes_activos: clientes?.length || 0,
  };
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(200).end();
  }

  setCorsHeaders(req, res);

  if (!verificarAuth(req)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  const action = req.query?.action || req.body?.action || 'contactos';

  try {
    // ===== LISTAR CONTACTOS =====
    if (action === 'contactos') {
      const result = await listarContactos(supabase);
      return res.status(200).json(result);
    }

    // ===== ENVIAR MENSAGEM INDIVIDUAL =====
    if (action === 'enviar') {
      const { para, mensagem } = req.body || {};
      if (!para || !mensagem) {
        return res.status(400).json({ error: 'Campos "para" e "mensagem" são obrigatórios' });
      }

      const result = await enviarMensagem(para, mensagem);

      // Log no Supabase
      try {
        await supabase.from('whatsapp_broadcast_log').insert({
          telefone: para.replace(/[^0-9]/g, ''),
          mensagem: mensagem.slice(0, 2000),
          tipo: 'individual',
          status: result.ok ? 'enviado' : 'erro',
          erro: result.ok ? null : result.error,
          message_id: result.messageId || null,
        });
      } catch (_) { /* tabela pode não existir */ }

      return res.status(result.ok ? 200 : 500).json(result);
    }

    // ===== BROADCAST PARA LISTA =====
    if (action === 'broadcast') {
      const { numeros, mensagem } = req.body || {};
      if (!numeros?.length || !mensagem) {
        return res.status(400).json({ error: 'Campos "numeros" (array) e "mensagem" são obrigatórios' });
      }

      const resultados = { enviados: 0, erros: [], total: numeros.length };

      for (let i = 0; i < numeros.length; i++) {
        const result = await enviarMensagem(numeros[i], mensagem);

        if (result.ok) {
          resultados.enviados++;
        } else {
          resultados.erros.push({ numero: numeros[i], erro: result.error });
        }

        // Log
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

        // Rate limit: 3s entre mensagens para evitar bloqueio
        if (i < numeros.length - 1) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      return res.status(200).json({
        message: `Broadcast: ${resultados.enviados}/${resultados.total} enviados`,
        ...resultados,
      });
    }

    // ===== BROADCAST POR GRUPO =====
    if (action === 'broadcast-grupo') {
      const { grupo, mensagem } = req.body || {};
      if (!grupo || !mensagem) {
        return res.status(400).json({ error: 'Campos "grupo" e "mensagem" são obrigatórios' });
      }

      // Buscar contactos
      const { contactos } = await listarContactos(supabase);

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
        // Últimos 30 dias
        const limite = new Date();
        limite.setDate(limite.getDate() - 30);
        numeros = contactos
          .filter(c => new Date(c.ultima_mensagem) >= limite)
          .map(c => c.telefone);
      } else {
        return res.status(400).json({
          error: 'Grupo inválido',
          grupos_disponiveis: ['todos', 'leads', 'interessados-precos', 'interessados-vitalis', 'recentes'],
        });
      }

      if (numeros.length === 0) {
        return res.status(200).json({ message: 'Nenhum contacto neste grupo', enviados: 0 });
      }

      const resultados = { enviados: 0, erros: [], total: numeros.length, grupo };

      for (let i = 0; i < numeros.length; i++) {
        const result = await enviarMensagem(numeros[i], mensagem);

        if (result.ok) {
          resultados.enviados++;
        } else {
          resultados.erros.push({ numero: numeros[i], erro: result.error });
        }

        try {
          await supabase.from('whatsapp_broadcast_log').insert({
            telefone: numeros[i].replace(/[^0-9]/g, ''),
            mensagem: mensagem.slice(0, 2000),
            tipo: `broadcast-${grupo}`,
            status: result.ok ? 'enviado' : 'erro',
            erro: result.ok ? null : result.error,
            message_id: result.messageId || null,
          });
        } catch (_) { /* tabela pode não existir */ }

        // Rate limit
        if (i < numeros.length - 1) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      return res.status(200).json({
        message: `Broadcast "${grupo}": ${resultados.enviados}/${resultados.total} enviados`,
        ...resultados,
      });
    }

    return res.status(400).json({
      error: 'Acção inválida',
      accoes_disponiveis: ['contactos', 'enviar', 'broadcast', 'broadcast-grupo'],
    });

  } catch (error) {
    console.error('Erro whatsapp-broadcast:', error);
    return res.status(500).json({ error: error.message });
  }
}
