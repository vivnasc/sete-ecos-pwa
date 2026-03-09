/**
 * SETE ECOS - Coach API Endpoint
 * Uses service role key to bypass RLS for coach operations
 *
 * Actions: gerar-plano, aprovar-plano, apagar-cliente, activar-subscricao, set-tester
 */

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { listarContactosWA, enviarMensagemWA, broadcastWA, broadcastGrupoWA } from './_lib/whatsapp-broadcast.js';
import broadcastInteressados from './_lib/broadcast-interessados.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const COACH_EMAILS = [
  'viv.saraiva@gmail.com',
  'vivnasc@gmail.com',
  'vivianne.saraiva@outlook.com'
];

// ─── Push notification helper (server-side) ───
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:viv.saraiva@gmail.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try { webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE); } catch (e) { /* ok */ }
}

async function pushCoachNotification({ title, body, url, tag }) {
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .in('user_email', COACH_EMAILS.map(e => e.toLowerCase()));
    if (!subs || subs.length === 0) return;
    const payload = JSON.stringify({ title, body, url: url || '/coach', tag: tag || 'coach', requireInteraction: true, vibrate: [200, 100, 200] });
    for (const sub of subs) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } }, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
    }
  } catch (e) { console.error('[Push] Erro:', e.message); }
}

// ─── Fire-and-forget Telegram notification (no res needed) ───
// Tenta com Markdown, faz retry sem formatação se falhar (nomes com _ ou * crasham)
async function enviarTelegramCoach(mensagem) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    // 1. Tentar com Markdown
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: mensagem, parse_mode: 'Markdown' }),
    });
    if (resp.ok) return true;
    // 2. Se Markdown falhar (caracteres especiais), retry sem formatação
    const err = await resp.json().catch(() => ({}));
    console.warn('[Telegram] Markdown falhou:', err?.description, '— retry sem formatação');
    const resp2 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: mensagem }),
    });
    if (resp2.ok) return true;
    console.error('[Telegram] Falhou mesmo sem Markdown:', (await resp2.json().catch(() => ({}))).description);
    return false;
  } catch (err) {
    console.error('[Telegram coach.js] Erro de rede:', err.message);
    return false;
  }
}

// Env override for coach emails
if (process.env.VITE_COACH_EMAILS) {
  const envEmails = process.env.VITE_COACH_EMAILS.split(',').map(e => e.trim().toLowerCase());
  COACH_EMAILS.length = 0;
  COACH_EMAILS.push(...envEmails);
}

async function verifyCoach(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  if (!COACH_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}

// ─── Verify any authenticated user ───
async function verifyUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, ...params } = req.body || {};

  try {
    // ── Push actions (own auth logic, no coach verification required) ──
    if (action === 'push-notify') return await pushNotify(params, res);
    if (action === 'push-vapid-public') return res.status(200).json({ key: VAPID_PUBLIC });
    if (action === 'push-subscribe') return await pushSubscribe(req, params, res);
    if (action === 'push-unsubscribe') return await pushUnsubscribe(req, params, res);
    if (action === 'push-save-prefs') return await pushSavePrefs(req, params, res);
    if (action === 'push-get-prefs') return await pushGetPrefs(req, res);

    // ── Telegram ──
    if (action === 'telegram-send') return await telegramSend(params, res);

    // ── All other actions require coach auth ──
    const coach = await verifyCoach(req);
    if (!coach) return res.status(403).json({ error: 'Acesso negado. Apenas coaches autorizadas.' });

    switch (action) {
      case 'test-notificacoes':
        return await testNotificacoes(res);
      case 'listar-clientes':
        return await listarClientes(res);
      case 'coach-notificacoes':
        return await coachNotificacoes(res);
      case 'coach-alertas-rt':
        return await coachAlertasRT(params.desde, res);
      case 'buscar-dados-cliente':
        return await buscarDadosCliente(params.userId, res);
      case 'buscar-plano-pdf':
        return await buscarPlanoPdf(params.planId, params.userId, res);
      case 'gerar-plano':
        return await gerarPlano(params.userId, res);
      case 'aprovar-plano':
        return await aprovarPlano(params.userId, params.planId, res);
      case 'apagar-cliente':
        return await apagarCliente(params.userId, res);
      case 'activar-subscricao':
        return await activarSubscricao(params.userId, params.planKey, res);
      case 'set-tester':
        return await setTester(params.userId, res);

      // ── WhatsApp Broadcast ──
      case 'wa-contactos':
        return res.status(200).json(await listarContactosWA(supabase));
      case 'wa-enviar': {
        if (!params.para || (!params.mensagem && !params.template)) return res.status(400).json({ error: '"para" e "mensagem" (ou "template") obrigatórios' });
        const waOpts = params.template ? { template: params.template, nome: params.nome } : {};
        const waResult = await enviarMensagemWA(params.para, params.mensagem || '', waOpts);
        try {
          await supabase.from('whatsapp_broadcast_log').insert({
            telefone: params.para.replace(/[^0-9]/g, ''),
            mensagem: params.template ? `[template:${params.template}]` : params.mensagem.slice(0, 2000),
            tipo: 'individual', status: waResult.ok ? 'enviado' : 'erro',
            erro: waResult.ok ? null : waResult.error,
            message_id: waResult.messageId || null,
          });
        } catch (_) { /* tabela pode não existir */ }
        return res.status(waResult.ok ? 200 : 500).json(waResult);
      }
      case 'wa-broadcast': {
        if (!params.numeros?.length || (!params.mensagem && !params.template)) return res.status(400).json({ error: '"numeros" e "mensagem" (ou "template") obrigatórios' });
        const bOpts = params.template ? { template: params.template, nome: params.nome } : {};
        const bResult = await broadcastWA(supabase, params.numeros, params.mensagem || '', bOpts);
        bResult.message = `Broadcast: ${bResult.enviados}/${bResult.total} enviados`;
        return res.status(200).json(bResult);
      }
      case 'wa-broadcast-grupo': {
        if (!params.grupo || (!params.mensagem && !params.template)) return res.status(400).json({ error: '"grupo" e "mensagem" (ou "template") obrigatórios' });
        const gOpts = params.template ? { template: params.template, nome: params.nome } : {};
        const gResult = await broadcastGrupoWA(supabase, params.grupo, params.mensagem || '', gOpts);
        return res.status(200).json(gResult);
      }

      // ── Historico de Broadcasts ──
      case 'wa-historico': {
        const limite = params.limite || 50;
        try {
          const { data, error } = await supabase
            .from('whatsapp_broadcast_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limite);
          if (error) return res.status(200).json({ logs: [], error: error.message });
          return res.status(200).json({ logs: data || [] });
        } catch (_) {
          return res.status(200).json({ logs: [], nota: 'Tabela whatsapp_broadcast_log ainda não existe' });
        }
      }

      // ── Email Broadcast ──
      case 'email-broadcast': {
        const fakeReq = {
          method: 'POST',
          headers: req.headers,
          query: { tipo: params.tipo || 'catalogo', audiencia: params.audiencia || 'todos' },
          body: { tipo: params.tipo || 'catalogo', audiencia: params.audiencia || 'todos' },
        };
        return await broadcastInteressados(fakeReq, res);
      }

      // ── Histórico de notificações por cliente ──
      case 'historico-notificacoes': {
        return await historicoNotificacoes(params.userId, res);
      }

      default:
        return res.status(400).json({ error: 'Accao desconhecida: ' + action });
    }
  } catch (err) {
    console.error(`[Coach API] Erro em ${action}:`, err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}

// ==========================================
// GERAR PLANO - Full planoGenerator logic
// ==========================================
async function gerarPlano(userId, res) {
  if (!userId) return res.status(400).json({ error: 'userId obrigatorio' });

  // Helper: log error for coach dashboard visibility
  // NOTE: We no longer insert an error row into vitalis_meal_plans because it violates
  // constraints (missing fase NOT NULL, calorias_alvo < 1200, invalid status 'erro').
  // Instead, log the error for debugging.
  const saveError = async (errorMsg) => {
    console.error(`[Coach API] Erro ao gerar plano para ${userId}: ${errorMsg}`);
    // Push + Telegram notification para coach
    const { data: userData } = await supabase.from('users').select('nome').eq('id', userId).maybeSingle();
    const nomeCliente = userData?.nome || 'Cliente';
    pushCoachNotification({
      title: '❌ Erro ao gerar plano',
      body: `${nomeCliente}: ${errorMsg.slice(0, 80)}`,
      url: `/coach/cliente/${userId}`,
      tag: 'plano-erro',
    }).catch(() => {});
    enviarTelegramCoach(`❌ *ERRO AO GERAR PLANO*\n\n👤 ${nomeCliente}\n📋 ${errorMsg.slice(0, 200)}`).catch(() => {});
  };

  // 1. Fetch intake
  const { data: intake, error: intakeError } = await supabase
    .from('vitalis_intake')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (intakeError || !intake) {
    await saveError('Intake nao encontrado. Cliente precisa preencher o questionario.');
    return res.status(400).json({ error: 'Intake nao encontrado. Cliente precisa preencher o questionario.' });
  }

  // 2. Get height
  let alturaFromUsers = null;
  try {
    const { data: user } = await supabase
      .from('users')
      .select('altura_cm')
      .eq('id', userId)
      .maybeSingle();
    alturaFromUsers = user?.altura_cm;
  } catch (e) { /* column may not exist */ }

  // 3. Calculate TMB (Mifflin-St Jeor)
  const altura = parseFloat(intake.altura_cm) || parseFloat(alturaFromUsers) || 165;
  const peso = parseFloat(intake.peso_actual);
  const idade = parseInt(intake.idade, 10);
  const sexo = intake.sexo;

  if (!peso || isNaN(peso) || !idade || isNaN(idade) || !sexo) {
    const campos = [];
    if (!peso || isNaN(peso)) campos.push('peso');
    if (!idade || isNaN(idade)) campos.push('idade');
    if (!sexo) campos.push('sexo');
    const erroMsg = `Dados do intake incompletos: ${campos.join(', ')}`;
    await saveError(erroMsg);
    return res.status(400).json({ error: erroMsg });
  }

  if (peso < 30 || peso > 300) { await saveError(`Peso invalido (${peso}kg)`); return res.status(400).json({ error: `Peso invalido (${peso}kg)` }); }
  if (idade < 15 || idade > 100) { await saveError(`Idade invalida (${idade})`); return res.status(400).json({ error: `Idade invalida (${idade})` }); }
  if (altura < 120 || altura > 250) { await saveError(`Altura invalida (${altura}cm)`); return res.status(400).json({ error: `Altura invalida (${altura}cm)` }); }

  let tmb;
  if (sexo === 'masculino') {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
  } else {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
  }

  // 4. Activity factor
  const factoresActividade = {
    'sedentaria': 1.2,
    'leve': 1.375,
    'moderada': 1.55,
    'intensa': 1.725
  };
  const factor = factoresActividade[intake.nivel_actividade] || 1.2;
  const tdee = tmb * factor;

  // 5. Calorie target based on goal
  let caloriasAlvo;
  const objectivo = intake.objectivo_principal;

  if (objectivo === 'perder_peso' || objectivo === 'emagrecer') {
    caloriasAlvo = Math.round(tdee * 0.75);
  } else if (objectivo === 'ganhar_massa') {
    caloriasAlvo = Math.round(tdee * 1.1);
  } else {
    caloriasAlvo = Math.round(tdee);
  }

  if (caloriasAlvo < 1000) caloriasAlvo = 1200;
  if (caloriasAlvo > 5000) caloriasAlvo = 4000;

  // 6. Macros based on approach
  let proteinaG, carboidratosG, gorduraG;
  // Normalizar abordagem: 'nao_sei' e valores inesperados → 'equilibrado'
  const ABORDAGENS_VALIDAS = ['keto_if', 'low_carb', 'equilibrado'];
  const abordagemRaw = intake.abordagem_preferida || 'equilibrado';
  const abordagem = ABORDAGENS_VALIDAS.includes(abordagemRaw) ? abordagemRaw : 'equilibrado';

  if (abordagem === 'keto_if') {
    proteinaG = Math.round((caloriasAlvo * 0.25) / 4);
    carboidratosG = Math.round((caloriasAlvo * 0.05) / 4);
    gorduraG = Math.round((caloriasAlvo * 0.70) / 9);
  } else if (abordagem === 'low_carb') {
    proteinaG = Math.round((caloriasAlvo * 0.40) / 4);
    carboidratosG = Math.round((caloriasAlvo * 0.30) / 4);
    gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
  } else {
    proteinaG = Math.round((caloriasAlvo * 0.30) / 4);
    carboidratosG = Math.round((caloriasAlvo * 0.40) / 4);
    gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
  }

  proteinaG = Math.min(proteinaG, 400);
  carboidratosG = Math.min(carboidratosG, 600);
  gorduraG = Math.min(gorduraG, 250);

  // 7. Portions (hand method)
  const porcoesProteina = Math.round(proteinaG / 25);
  const porcoesLegumes = 4;
  const porcoesHidratos = Math.round(carboidratosG / 30);
  const porcoesGordura = Math.round(gorduraG / 10);

  // 8. Number of meals
  let numRefeicoes;
  if (intake.aceita_jejum && abordagem === 'keto_if') {
    numRefeicoes = 2;
  } else if (intake.num_refeicoes_dia) {
    const parsed = parseInt(intake.num_refeicoes_dia.toString().split('-')[0], 10);
    numRefeicoes = (parsed && !isNaN(parsed) && parsed > 0) ? parsed : 3;
  } else {
    numRefeicoes = 3;
  }

  // 9. Portions per meal
  const porcoesPorRefeicao = {
    proteina: Math.ceil(porcoesProteina / numRefeicoes),
    legumes: Math.ceil(porcoesLegumes / numRefeicoes),
    hidratos: Math.ceil(porcoesHidratos / numRefeicoes),
    gordura: Math.ceil(porcoesGordura / numRefeicoes)
  };

  // 10. Meal times
  let horariosRefeicoes;
  if (intake.aceita_jejum) {
    horariosRefeicoes = ['12:00', '16:00', '20:00'].slice(0, numRefeicoes);
  } else if (intake.pequeno_almoco === 'nunca') {
    horariosRefeicoes = ['13:00', '17:00', '20:00'].slice(0, numRefeicoes);
  } else {
    horariosRefeicoes = ['08:00', '13:00', '19:00'].slice(0, numRefeicoes);
  }

  const faseInicial = 'inducao';

  // 11. IMC helper
  const calcularIMC = (p, a) => {
    if (!a || a <= 0 || !p || p <= 0) return 0;
    const alturaM = a / 100;
    return parseFloat((p / (alturaM * alturaM)).toFixed(1));
  };

  // 12. Upsert vitalis_clients
  const { error: clientError } = await supabase
    .from('vitalis_clients')
    .upsert({
      user_id: userId,
      status: 'activo',
      pacote: intake.pacote_escolhido || 'essencial',
      data_inicio: new Date().toISOString().split('T')[0],
      duracao_programa: intake.duracao || '6_meses',
      fase_actual: faseInicial,
      objectivo_principal: intake.objectivo_principal,
      peso_inicial: intake.peso_actual,
      peso_actual: intake.peso_actual,
      peso_meta: intake.peso_meta,
      imc_inicial: calcularIMC(intake.peso_actual, altura),
      imc_actual: calcularIMC(intake.peso_actual, altura),
      emocao_dominante: intake.emocao_dominante,
      prontidao_1a10: intake.prontidao_1a10
    }, { onConflict: 'user_id' });

  if (clientError) throw clientError;

  // 12a. Deactivate old plans
  await supabase.from('vitalis_meal_plans').update({ status: 'inactivo' }).eq('user_id', userId).eq('status', 'activo');

  // 13. Insert new plan
  const planoData = {
    user_id: userId,
    versao: 1,
    fase: faseInicial,
    abordagem: abordagem,
    calorias_alvo: caloriasAlvo,
    proteina_g: proteinaG,
    carboidratos_g: carboidratosG,
    gordura_g: gorduraG,
    status: 'activo',
    receitas_incluidas: JSON.stringify({
      'porções_por_refeicao': porcoesPorRefeicao,
      num_refeicoes: numRefeicoes,
      horarios: horariosRefeicoes
    })
  };

  const { data: plano, error: planoError } = await supabase
    .from('vitalis_meal_plans')
    .insert([planoData])
    .select()
    .single();

  if (planoError) throw planoError;

  // 14. Create initial habits
  const habitosInducao = [
    { habito: 'Beber 2L de agua por dia', categoria: 'hidratacao', fase: 'inducao', dias_total: 14 },
    { habito: 'Fazer 3 refeicoes dentro da janela alimentar', categoria: 'nutricao', fase: 'inducao', dias_total: 14 },
    { habito: 'Dormir 7-8 horas por noite', categoria: 'sono', fase: 'inducao', dias_total: 14 },
    { habito: 'Check-in diario na app', categoria: 'mindset', fase: 'inducao', dias_total: 14 }
  ];

  await supabase.from('vitalis_habitos').insert(
    habitosInducao.map(h => ({
      ...h,
      user_id: userId,
      data_inicio: new Date().toISOString().split('T')[0]
    }))
  );

  return res.status(200).json({
    success: true,
    plano: {
      id: plano.id,
      calorias: caloriasAlvo,
      macros: { proteina: proteinaG, carboidratos: carboidratosG, gordura: gorduraG },
      fase: faseInicial,
      abordagem: abordagem
    }
  });
}

// ==========================================
// APROVAR PLANO
// ==========================================
async function aprovarPlano(userId, planId, res) {
  if (!userId || !planId) return res.status(400).json({ error: 'userId e planId obrigatorios' });

  // Deactivate other plans
  await supabase
    .from('vitalis_meal_plans')
    .update({ status: 'inactivo' })
    .eq('user_id', userId)
    .neq('id', planId)
    .eq('status', 'activo');

  // Approve this plan
  const { error } = await supabase
    .from('vitalis_meal_plans')
    .update({ status: 'activo' })
    .eq('id', planId);

  if (error) throw error;

  return res.status(200).json({ success: true });
}

// ==========================================
// APAGAR CLIENTE
// ==========================================
async function apagarCliente(userId, res) {
  if (!userId) return res.status(400).json({ error: 'userId obrigatorio' });

  const tables = [
    'vitalis_habitos',
    'vitalis_meal_plans',
    'vitalis_intake',
    'vitalis_registos',
    'vitalis_agua_log',
    'vitalis_workouts_log',
    'vitalis_sono_log',
    'vitalis_fasting_log',
    'vitalis_meals_log',
    'vitalis_alerts',
    'vitalis_subscription_log',
    'vitalis_clients'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.warn(`[Coach API] Erro ao apagar ${table}:`, error.message);
      // Continue — some tables may not have rows
    }
  }

  return res.status(200).json({ success: true });
}

// ==========================================
// ACTIVAR SUBSCRICAO
// ==========================================
async function activarSubscricao(userId, planKey, res) {
  if (!userId || !planKey) return res.status(400).json({ error: 'userId e planKey obrigatorios' });

  const PLANS = {
    MONTHLY: { id: 'monthly', name: 'Mensal', duration: 1, price_usd: 38 },
    SEMESTRAL: { id: 'semestral', name: 'Semestral', duration: 6, price_usd: 190 },
    ANNUAL: { id: 'annual', name: 'Anual', duration: 12, price_usd: 320 }
  };

  const plan = PLANS[planKey];
  if (!plan) return res.status(400).json({ error: 'Plano desconhecido: ' + planKey });

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + plan.duration);

  const { error } = await supabase
    .from('vitalis_clients')
    .update({
      subscription_status: 'active',
      subscription_expires: expiresAt.toISOString(),
      subscription_plan: plan.id,
      payment_method: 'manual',
      payment_reference: `Coach-${Date.now()}`,
      payment_amount: plan.price_usd,
      payment_currency: 'USD',
      subscription_updated: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;

  // Log
  await supabase.from('vitalis_subscription_log').insert({
    user_id: userId,
    new_status: 'active',
    details: JSON.stringify({ action: 'payment_confirmed', plan: plan.id, duration: plan.duration }),
    created_at: new Date().toISOString()
  }).then(() => {}).catch(() => {});

  return res.status(200).json({ success: true, expiresAt: expiresAt.toISOString(), plan });
}

// ==========================================
// SET TESTER
// ==========================================
async function setTester(userId, res) {
  if (!userId) return res.status(400).json({ error: 'userId obrigatorio' });

  const { error } = await supabase
    .from('vitalis_clients')
    .upsert({
      user_id: userId,
      subscription_status: 'tester',
      subscription_updated: new Date().toISOString(),
      status: 'novo',
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw error;

  // Log
  await supabase.from('vitalis_subscription_log').insert({
    user_id: userId,
    new_status: 'tester',
    details: JSON.stringify({ action: 'set_as_tester', notes: 'Via coach dashboard' }),
    created_at: new Date().toISOString()
  }).then(() => {}).catch(() => {});

  return res.status(200).json({ success: true });
}

// ==========================================
// LISTAR CLIENTES (server-side, bypasses RLS)
// ==========================================
async function listarClientes(res) {
  // Fetch all vitalis clients with user info
  const { data: clientsData, error } = await supabase
    .from('vitalis_clients')
    .select('*, users!inner(id, nome, email, created_at)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Erro ao carregar clientes: ' + error.message });
  if (!clientsData || clientsData.length === 0) return res.status(200).json({ clients: [] });

  const userIds = clientsData.map(c => c.user_id);

  // Batch fetch intakes, plans, last activity — all server-side
  const [intakesRes, plansRes, registosRes] = await Promise.all([
    supabase.from('vitalis_intake').select('user_id, altura_cm, peso_actual, idade, sexo').in('user_id', userIds),
    supabase.from('vitalis_meal_plans').select('user_id, id, status, calorias_alvo, receitas_incluidas, created_at').in('user_id', userIds).order('created_at', { ascending: false }),
    supabase.from('vitalis_registos').select('user_id, created_at').in('user_id', userIds).order('created_at', { ascending: false }),
  ]);

  // Build lookup maps
  const intakeMap = {};
  (intakesRes.data || []).forEach(i => { intakeMap[i.user_id] = i; });

  // Build plan map — prefer active/pendente_revisao over error plans
  const planMap = {};
  const errorPlanMap = {};
  (plansRes.data || []).forEach(p => {
    if (p.status === 'erro') {
      if (!errorPlanMap[p.user_id]) errorPlanMap[p.user_id] = p;
    } else {
      if (!planMap[p.user_id]) planMap[p.user_id] = p;
    }
  });

  const lastActivityMap = {};
  (registosRes.data || []).forEach(r => {
    if (!lastActivityMap[r.user_id]) lastActivityMap[r.user_id] = r.created_at;
  });

  // Enrich clients
  const clients = clientsData.map(client => {
    const intake = intakeMap[client.user_id];
    const plan = planMap[client.user_id];
    const errorPlan = errorPlanMap[client.user_id];
    const hasIntake = !!(intake && intake.altura_cm && intake.peso_actual && intake.idade);
    const hasPlan = !!plan;

    // Extract error message if there's an error plan
    let planErro = null;
    if (errorPlan?.receitas_incluidas) {
      try {
        const parsed = typeof errorPlan.receitas_incluidas === 'string'
          ? JSON.parse(errorPlan.receitas_incluidas)
          : errorPlan.receitas_incluidas;
        planErro = parsed.erro || null;
      } catch (e) { /* ignore */ }
    }

    return {
      ...client,
      nome: client.users?.nome || 'Sem nome',
      email: client.users?.email || '',
      userCreatedAt: client.users?.created_at,
      hasIntake,
      hasPlan,
      sexo: intake?.sexo || null,
      planStatus: plan?.status || (errorPlan ? 'erro' : null),
      planCalorias: plan?.calorias_alvo || null,
      planErro,
      lastActivity: lastActivityMap[client.user_id] || null,
    };
  });

  return res.status(200).json({ clients });
}

// ==========================================
// BUSCAR PLANO PDF (server-side, all data for PDF render)
// ==========================================
async function buscarPlanoPdf(planId, userId, res) {
  if (!planId) return res.status(400).json({ error: 'planId obrigatorio' });

  // Fetch plan
  let plano = null;
  const { data: planoView } = await supabase.from('vitalis_meal_plans').select('*').eq('id', planId).maybeSingle();
  plano = planoView;

  if (!plano) return res.status(404).json({ error: 'Plano nao encontrado' });

  const planoUserId = plano.user_id || userId;

  // Fetch client, intake, user name — all in parallel
  const [clienteRes, intakeRes, userRes] = await Promise.all([
    planoUserId
      ? supabase.from('vitalis_clients').select('*').eq('user_id', planoUserId).maybeSingle()
      : { data: null },
    planoUserId
      ? supabase.from('vitalis_intake').select('*').eq('user_id', planoUserId).order('created_at', { ascending: false }).limit(1).maybeSingle()
      : { data: null },
    planoUserId
      ? supabase.from('users').select('nome').eq('id', planoUserId).maybeSingle()
      : { data: null },
  ]);

  return res.status(200).json({
    plano,
    cliente: clienteRes.data,
    intake: intakeRes.data,
    userName: userRes.data?.nome || null,
  });
}

// ==========================================
// BUSCAR DADOS CLIENTE (server-side, bypasses RLS)
// ==========================================
async function buscarDadosCliente(userId, res) {
  if (!userId) return res.status(400).json({ error: 'userId obrigatorio' });

  const [userRes, clientRes, intakeRes, planoRes, registosRes, aguaRes, mealsRes, habitosRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('vitalis_clients').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('vitalis_intake').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('vitalis_meal_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('vitalis_registos').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
    supabase.from('vitalis_agua_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
    supabase.from('vitalis_meals_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
    supabase.from('vitalis_habitos').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ]);

  if (userRes.error) return res.status(404).json({ error: 'Cliente nao encontrado' });

  return res.status(200).json({
    user: userRes.data,
    client: clientRes.data,
    intake: intakeRes.data,
    planos: planoRes.data || [],
    registos: registosRes.data || [],
    aguaLogs: aguaRes.data || [],
    mealsLogs: mealsRes.data || [],
    habitos: habitosRes.data || [],
  });
}

// ==========================================
// COACH NOTIFICACOES - Activity feed dos clientes
// ==========================================
async function coachNotificacoes(res) {
  const desde = new Date();
  desde.setDate(desde.getDate() - 7);
  const desdeISO = desde.toISOString();

  // Fetch clients + user info for name lookup
  const { data: clientsData } = await supabase
    .from('vitalis_clients')
    .select('user_id, subscription_status, data_fim, users!inner(id, nome)')
    .order('created_at', { ascending: false });

  if (!clientsData || clientsData.length === 0) {
    return res.status(200).json({ notificacoes: [] });
  }

  const userIds = clientsData.map(c => c.user_id);
  const nomeMap = {};
  clientsData.forEach(c => { nomeMap[c.user_id] = c.users?.nome || 'Sem nome'; });

  // Parallel queries for recent activity
  const [registosRes, mealsRes, espacoRes, newClientsRes] = await Promise.all([
    // Check-ins (last 7 days)
    supabase.from('vitalis_registos')
      .select('user_id, data, peso, energia_1a5, humor, aderencia_1a10, created_at')
      .in('user_id', userIds)
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false })
      .limit(50),
    // Meals logged (last 7 days)
    supabase.from('vitalis_meals_log')
      .select('user_id, refeicao, data, created_at')
      .in('user_id', userIds)
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false })
      .limit(50),
    // Espaco de Retorno (last 7 days)
    supabase.from('vitalis_espaco_retorno')
      .select('user_id, emocao, created_at')
      .in('user_id', userIds)
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false })
      .limit(20),
    // New clients (last 7 days)
    supabase.from('vitalis_clients')
      .select('user_id, created_at, subscription_status, users!inner(nome)')
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false }),
  ]);

  const notificacoes = [];

  // Check-ins
  for (const r of (registosRes.data || [])) {
    const nome = nomeMap[r.user_id] || 'Cliente';
    let detalhe = '';
    if (r.peso) detalhe += `${r.peso}kg`;
    if (r.energia_1a5) detalhe += `${detalhe ? ' · ' : ''}energia ${r.energia_1a5}/5`;
    if (r.aderencia_1a10) detalhe += `${detalhe ? ' · ' : ''}aderencia ${r.aderencia_1a10}/10`;

    notificacoes.push({
      id: `checkin_${r.user_id}_${r.created_at}`,
      tipo: 'checkin',
      emoji: '📊',
      titulo: `${nome} fez check-in`,
      detalhe: detalhe || null,
      user_id: r.user_id,
      created_at: r.created_at,
      prioridade: r.aderencia_1a10 && r.aderencia_1a10 <= 4 ? 'alta' : 'normal',
    });
  }

  // Meals logged (aggregate per user per day)
  const mealsGrouped = {};
  for (const m of (mealsRes.data || [])) {
    const key = `${m.user_id}_${m.data}`;
    if (!mealsGrouped[key]) {
      mealsGrouped[key] = { user_id: m.user_id, data: m.data, count: 0, created_at: m.created_at };
    }
    mealsGrouped[key].count++;
  }
  for (const key of Object.keys(mealsGrouped)) {
    const g = mealsGrouped[key];
    const nome = nomeMap[g.user_id] || 'Cliente';
    notificacoes.push({
      id: `meals_${key}`,
      tipo: 'refeicao',
      emoji: '🍽️',
      titulo: `${nome} registou ${g.count} refeicao${g.count > 1 ? 'es' : ''}`,
      detalhe: null,
      user_id: g.user_id,
      created_at: g.created_at,
      prioridade: 'normal',
    });
  }

  // Espaco de Retorno (CRITICAL)
  for (const e of (espacoRes.data || [])) {
    const nome = nomeMap[e.user_id] || 'Cliente';
    notificacoes.push({
      id: `espaco_${e.user_id}_${e.created_at}`,
      tipo: 'espaco_retorno',
      emoji: '🆘',
      titulo: `${nome} usou Espaco de Retorno`,
      detalhe: e.emocao ? `Emocao: ${e.emocao}` : null,
      user_id: e.user_id,
      created_at: e.created_at,
      prioridade: 'critica',
    });
  }

  // New clients
  for (const c of (newClientsRes.data || [])) {
    const nome = c.users?.nome || 'Sem nome';
    notificacoes.push({
      id: `novo_${c.user_id}_${c.created_at}`,
      tipo: 'nova_cliente',
      emoji: '🌟',
      titulo: `${nome} registou-se`,
      detalhe: c.subscription_status === 'pending' ? 'Pagamento pendente' : c.subscription_status,
      user_id: c.user_id,
      created_at: c.created_at,
      prioridade: 'alta',
    });
  }

  // Inactive clients (5+ days)
  for (const c of clientsData) {
    if (!['active', 'trial', 'tester'].includes(c.subscription_status)) continue;
    // Check for last activity
    const { data: lastReg } = await supabase
      .from('vitalis_registos')
      .select('created_at')
      .eq('user_id', c.user_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastDate = lastReg?.[0]?.created_at;
    if (lastDate) {
      const dias = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
      if (dias >= 5) {
        notificacoes.push({
          id: `inactivo_${c.user_id}`,
          tipo: 'inactividade',
          emoji: '⚠️',
          titulo: `${nomeMap[c.user_id]} inactiva ha ${dias} dias`,
          detalhe: c.subscription_status === 'trial' ? 'Em trial — risco de perda' : null,
          user_id: c.user_id,
          created_at: lastDate,
          prioridade: dias >= 10 ? 'critica' : 'alta',
        });
      }
    }
  }

  // Subscriptions expiring in next 5 days
  const em5dias = new Date();
  em5dias.setDate(em5dias.getDate() + 5);
  for (const c of clientsData) {
    if (!c.data_fim || !['active', 'trial'].includes(c.subscription_status)) continue;
    const expira = new Date(c.data_fim);
    if (expira <= em5dias && expira >= new Date()) {
      const diasRestantes = Math.ceil((expira - Date.now()) / 86400000);
      notificacoes.push({
        id: `expira_${c.user_id}`,
        tipo: 'expiracao',
        emoji: '⏰',
        titulo: `Subscricao de ${nomeMap[c.user_id]} expira em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`,
        detalhe: null,
        user_id: c.user_id,
        created_at: new Date().toISOString(),
        prioridade: diasRestantes <= 2 ? 'critica' : 'alta',
      });
    }
  }

  // Sort: critical first, then by date
  const prioridadeOrdem = { critica: 0, alta: 1, normal: 2 };
  notificacoes.sort((a, b) => {
    const pa = prioridadeOrdem[a.prioridade] ?? 2;
    const pb = prioridadeOrdem[b.prioridade] ?? 2;
    if (pa !== pb) return pa - pb;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return res.status(200).json({ notificacoes: notificacoes.slice(0, 100) });
}

// ==========================================
// COACH ALERTAS REAL-TIME (lightweight polling)
// Só tabelas críticas, últimos N minutos. Chamado a cada 30s.
// ==========================================
async function coachAlertasRT(desde, res) {
  // Default: últimos 2 minutos
  const desdeISO = desde || new Date(Date.now() - 2 * 60 * 1000).toISOString();

  // Nome lookup — cached per request, only fetched if needed
  const nomeCache = {};
  const getNome = async (userId) => {
    if (nomeCache[userId]) return nomeCache[userId];
    const { data } = await supabase.from('users').select('nome').eq('id', userId).maybeSingle();
    nomeCache[userId] = data?.nome || 'Cliente';
    return nomeCache[userId];
  };

  // Parallel: query only critical tables for very recent events
  const [newClientsRes, paymentsRes, espacoRes, planoErrosRes, registosRes] = await Promise.all([
    // New registrations
    supabase.from('vitalis_clients')
      .select('user_id, created_at, subscription_status')
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false })
      .limit(10),
    // Payment submissions (pending status set recently)
    supabase.from('vitalis_clients')
      .select('user_id, payment_reference, payment_amount, payment_currency, payment_method, updated_at')
      .eq('subscription_status', 'pending')
      .not('payment_reference', 'is', null)
      .gte('updated_at', desdeISO)
      .limit(10),
    // Espaco de Retorno (emotional crisis)
    supabase.from('vitalis_espaco_retorno')
      .select('user_id, emocao, created_at')
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false })
      .limit(10),
    // Plan generation errors
    supabase.from('vitalis_meal_plans')
      .select('user_id, status, created_at')
      .eq('status', 'erro')
      .gte('created_at', desdeISO)
      .limit(10),
    // New check-ins (less critical but coaches want to see)
    supabase.from('vitalis_registos')
      .select('user_id, peso, energia_1a5, aderencia_1a10, created_at')
      .gte('created_at', desdeISO)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const alertas = [];

  // New registrations
  for (const c of (newClientsRes.data || [])) {
    const nome = await getNome(c.user_id);
    alertas.push({
      id: `rt_novo_${c.user_id}_${c.created_at}`,
      tipo: 'nova_cliente',
      emoji: '🌟',
      titulo: `Nova cliente: ${nome}`,
      detalhe: c.subscription_status === 'pending' ? 'Pagamento pendente' : null,
      user_id: c.user_id,
      created_at: c.created_at,
      prioridade: 'critica',
      som: true,
    });
  }

  // Payments pending
  for (const p of (paymentsRes.data || [])) {
    const nome = await getNome(p.user_id);
    alertas.push({
      id: `rt_pag_${p.user_id}_${p.updated_at}`,
      tipo: 'pagamento',
      emoji: '💰',
      titulo: `${nome} submeteu pagamento`,
      detalhe: `${p.payment_method || 'M-Pesa'} · Ref: ${p.payment_reference}${p.payment_amount ? ` · ${Number(p.payment_amount).toLocaleString('pt-MZ')} ${p.payment_currency || 'MZN'}` : ''}`,
      user_id: p.user_id,
      created_at: p.updated_at,
      prioridade: 'critica',
      som: true,
    });
  }

  // Espaco de Retorno
  for (const e of (espacoRes.data || [])) {
    const nome = await getNome(e.user_id);
    alertas.push({
      id: `rt_espaco_${e.user_id}_${e.created_at}`,
      tipo: 'espaco_retorno',
      emoji: '🆘',
      titulo: `${nome} activou Espaco de Retorno`,
      detalhe: e.emocao ? `Emocao: ${e.emocao}` : 'Precisa de atencao',
      user_id: e.user_id,
      created_at: e.created_at,
      prioridade: 'critica',
      som: true,
    });
  }

  // Plan errors
  for (const p of (planoErrosRes.data || [])) {
    const nome = await getNome(p.user_id);
    alertas.push({
      id: `rt_planerro_${p.user_id}_${p.created_at}`,
      tipo: 'plano_erro',
      emoji: '❌',
      titulo: `Erro ao gerar plano de ${nome}`,
      detalhe: 'Verificar e tentar novamente',
      user_id: p.user_id,
      created_at: p.created_at,
      prioridade: 'critica',
      som: true,
    });
  }

  // Check-ins (important but not critical)
  for (const r of (registosRes.data || [])) {
    const nome = await getNome(r.user_id);
    let detalhe = '';
    if (r.peso) detalhe += `${r.peso}kg`;
    if (r.aderencia_1a10) detalhe += `${detalhe ? ' · ' : ''}aderencia ${r.aderencia_1a10}/10`;
    const isCritical = r.aderencia_1a10 && r.aderencia_1a10 <= 3;
    alertas.push({
      id: `rt_checkin_${r.user_id}_${r.created_at}`,
      tipo: 'checkin',
      emoji: isCritical ? '⚠️' : '📊',
      titulo: `${nome} fez check-in`,
      detalhe: detalhe || null,
      user_id: r.user_id,
      created_at: r.created_at,
      prioridade: isCritical ? 'alta' : 'normal',
      som: isCritical,
    });
  }

  alertas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Enviar alertas críticos via Telegram (fire-and-forget, não bloqueia resposta)
  const alertasCriticos = alertas.filter(a => a.prioridade === 'critica');
  if (alertasCriticos.length > 0) {
    // Deduplicação: só alertar se criados nos últimos 60s (evita re-alertar em polls seguintes)
    const agora = Date.now();
    const novos = alertasCriticos.filter(a => (agora - new Date(a.created_at).getTime()) < 60000);
    for (const alerta of novos) {
      const emoji = alerta.emoji || '🔔';
      const msg = `${emoji} *${alerta.titulo}*${alerta.detalhe ? `\n${alerta.detalhe}` : ''}`;
      enviarTelegramCoach(msg).catch(() => {});
    }
  }

  return res.status(200).json({ alertas });
}

// ==========================================
// PUSH NOTIFICATIONS — Subscribe / Unsubscribe / Notify
// (merged from push-coach.js to stay within Vercel Hobby 12-function limit)
// ==========================================

async function pushSubscribe(req, params, res) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Nao autenticado' });

  const isCoachUser = COACH_EMAILS.includes(user.email.toLowerCase());
  const role = isCoachUser ? 'coach' : 'client';

  const { subscription } = params;
  if (!subscription?.endpoint || !subscription?.keys) {
    return res.status(400).json({ error: 'Subscription invalida' });
  }

  // Buscar user_id na tabela users
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_email: user.email.toLowerCase(),
      user_id: userData?.id?.toString() || user.id,
      role,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' });

  if (error) {
    console.error('[Push] Erro ao guardar subscription:', error);
    return res.status(500).json({ error: 'Erro ao guardar. Tabela push_subscriptions existe?' });
  }

  return res.status(200).json({ ok: true, role });
}

async function pushUnsubscribe(req, params, res) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Nao autenticado' });

  if (params.endpoint) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', params.endpoint);
  }
  return res.status(200).json({ ok: true });
}

async function pushNotify(params, res) {
  const { title, body, url, tag, requireInteraction } = params;
  if (!title) return res.status(400).json({ error: 'Title obrigatorio' });

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .in('user_email', COACH_EMAILS);

  if (error || !subs || subs.length === 0) {
    return res.status(200).json({ sent: 0, error: error?.message || 'Sem subscriptions' });
  }

  const payload = JSON.stringify({
    title,
    body: body || '',
    url: url || '/coach',
    tag: tag || 'coach-alert',
    requireInteraction: requireInteraction || false,
    vibrate: [200, 100, 200],
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
      }, payload);
      sent++;
    } catch (err) {
      console.error('[Push] Falha ao enviar:', err.statusCode, sub.endpoint.slice(0, 50));
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      }
      failed++;
    }
  }

  return res.status(200).json({ sent, failed });
}

// ==========================================
// PUSH PREFERENCES — Save / Get user notification preferences
// ==========================================

async function pushSavePrefs(req, params, res) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Nao autenticado' });

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  const userId = userData?.id?.toString() || user.id;
  const { lembretes, timezone } = params;

  const { error } = await supabase
    .from('push_preferences')
    .upsert({
      user_id: userId,
      lembretes: lembretes || [],
      timezone: timezone || 'Africa/Maputo',
      activo: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('[Push] Erro ao guardar preferências:', error);
    return res.status(500).json({ error: 'Erro ao guardar preferências' });
  }

  return res.status(200).json({ ok: true });
}

async function pushGetPrefs(req, res) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Nao autenticado' });

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  const userId = userData?.id?.toString() || user.id;

  const { data, error } = await supabase
    .from('push_preferences')
    .select('lembretes, timezone, activo')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Push] Erro ao buscar preferências:', error);
    return res.status(500).json({ error: 'Erro ao buscar preferências' });
  }

  return res.status(200).json({ prefs: data || null });
}

// ==========================================
// PUSH TO USER — Send push notification to a specific user
// Used by cron and internal functions
// ==========================================

export async function sendPushToUser(userId, { title, body, url, tag }) {
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('user_id', userId.toString());

    if (!subs || subs.length === 0) return 0;

    const payload = JSON.stringify({
      title,
      body: body || '',
      url: url || '/',
      tag: tag || 'sete-ecos',
      vibrate: [200, 100, 200],
    });

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          payload
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
    }
    return sent;
  } catch (e) {
    console.error('[Push] Erro ao enviar para user:', e.message);
    return 0;
  }
}

// ==========================================
// HISTÓRICO DE NOTIFICAÇÕES POR CLIENTE
// ==========================================

async function historicoNotificacoes(userId, res) {
  try {
    // Buscar emails enviados ao cliente
    const { data: emails } = await supabase
      .from('vitalis_email_log')
      .select('tipo, destinatario, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    // Buscar WhatsApp enviados (via intake para obter telefone)
    let waLogs = [];
    try {
      const { data: intake } = await supabase
        .from('vitalis_intake')
        .select('whatsapp')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (intake?.whatsapp) {
        const tel = intake.whatsapp.replace(/[^0-9]/g, '');
        const { data: waData } = await supabase
          .from('whatsapp_broadcast_log')
          .select('tipo, mensagem, status, created_at')
          .eq('telefone', tel)
          .order('created_at', { ascending: false })
          .limit(20);
        waLogs = waData || [];
      }
    } catch (_) { /* tabela pode não existir */ }

    // Mapear tipos para labels legíveis
    const tipoLabels = {
      'lembrete-checkin': '📧 Lembrete check-in (2-4d)',
      'motivacao-intensa': '📧 Motivação intensa (5-6d)',
      'inactividade-7d': '📧 Marco 7 dias',
      'inactividade-14d': '📧 Marco 14 dias',
      'inactividade-30d': '📧 Marco 30 dias',
      'expiracao-aviso': '📧 Aviso expiração',
      'curiosidade-insana': '📧 Curiosidade (marketing)',
      'winback': '📧 Win-back',
      'coach-resumo-diario': '📧 Resumo coach',
    };

    const notificacoes = [
      ...(emails || []).map(e => ({
        canal: 'email',
        tipo: e.tipo,
        label: tipoLabels[e.tipo] || `📧 ${e.tipo}`,
        data: e.created_at,
      })),
      ...waLogs.map(w => ({
        canal: 'whatsapp',
        tipo: w.tipo,
        label: `💬 ${w.tipo?.replace('cron-cliente-', '') || 'WA'}`,
        status: w.status,
        data: w.created_at,
      })),
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 30);

    return res.status(200).json({ notificacoes });
  } catch (err) {
    return res.status(200).json({ notificacoes: [], erro: err.message });
  }
}

// ==========================================
// TEST NOTIFICAÇÕES — testa todos os canais de notificação da coach
// ==========================================

async function testNotificacoes(res) {
  const resultados = {
    telegram: { configurado: false, enviado: false, erro: null },
    push: { configurado: false, enviado: false, subscricoes: 0, erro: null },
    whatsapp: { configurado: false, enviado: false, erro: null },
    email: { configurado: false, erro: null },
  };

  const agora = new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' });

  // 1. TELEGRAM — diagnóstico completo
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  resultados.telegram.configurado = !!(BOT_TOKEN && CHAT_ID);
  resultados.telegram.chat_id_configurado = CHAT_ID || 'N/A';
  resultados.telegram.token_preview = BOT_TOKEN ? `${BOT_TOKEN.slice(0, 8)}...${BOT_TOKEN.slice(-4)}` : 'N/A';

  if (BOT_TOKEN && CHAT_ID) {
    // 1a. Verificar se o token é válido (getMe)
    try {
      const meResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const meData = await meResp.json();
      if (meData.ok) {
        resultados.telegram.bot_nome = `@${meData.result.username}`;
        resultados.telegram.bot_valido = true;
      } else {
        resultados.telegram.bot_valido = false;
        resultados.telegram.erro = `Token inválido: ${meData.description}`;
      }
    } catch (err) {
      resultados.telegram.bot_valido = false;
      resultados.telegram.erro = `Erro de rede ao validar token: ${err.message}`;
    }

    // 1b. Verificar updates recentes (para descobrir chat_id correcto)
    if (resultados.telegram.bot_valido) {
      try {
        const updResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=5`);
        const updData = await updResp.json();
        if (updData.ok && updData.result.length > 0) {
          const chatIds = [...new Set(updData.result.map(u => u.message?.chat?.id).filter(Boolean))];
          resultados.telegram.chats_encontrados = chatIds;
          if (chatIds.length > 0 && !chatIds.includes(Number(CHAT_ID))) {
            resultados.telegram.aviso = `CHAT_ID ${CHAT_ID} não corresponde aos chats encontrados: ${chatIds.join(', ')}. Actualiza TELEGRAM_CHAT_ID no Vercel!`;
          }
        } else {
          resultados.telegram.chats_encontrados = [];
          resultados.telegram.aviso = 'Nenhuma conversa encontrada. Envia /start ao bot e tenta outra vez.';
        }
      } catch (_) {}

      // 1c. Tentar enviar mensagem
      try {
        const msg = `🧪 TESTE DE NOTIFICAÇÕES\n\n✅ Telegram está a funcionar!\n🕐 ${agora} (CAT)\n\nSe estás a ver esta mensagem, o canal Telegram está OK.`;
        const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg }),
        });
        const data = await resp.json();
        if (data.ok) {
          resultados.telegram.enviado = true;
        } else {
          resultados.telegram.enviado = false;
          resultados.telegram.erro = data.description;
          // Se falhou com o CHAT_ID configurado, tentar com o primeiro chat encontrado
          const chatIds = resultados.telegram.chats_encontrados || [];
          if (chatIds.length > 0 && !chatIds.includes(Number(CHAT_ID))) {
            resultados.telegram.sugestao = `Experimenta mudar TELEGRAM_CHAT_ID para: ${chatIds[0]}`;
          }
        }
      } catch (err) {
        resultados.telegram.erro = `Erro de rede: ${err.message}`;
      }
    }
  }

  // 2. PUSH
  resultados.push.configurado = !!(VAPID_PUBLIC && VAPID_PRIVATE);
  if (VAPID_PUBLIC && VAPID_PRIVATE) {
    try {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, keys_p256dh, keys_auth')
        .in('user_email', COACH_EMAILS.map(e => e.toLowerCase()));
      resultados.push.subscricoes = subs?.length || 0;
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: '🧪 Teste Push',
          body: `Push funciona! ${agora} CAT`,
          url: '/coach',
          tag: 'test-notificacoes',
          requireInteraction: true,
        });
        let sent = 0;
        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
              payload
            );
            sent++;
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            }
            resultados.push.erro = `${err.statusCode || err.message}`;
          }
        }
        resultados.push.enviado = sent > 0;
      } else {
        resultados.push.erro = 'Sem subscriptions. Vai ao /coach e clica "Activar Notificações".';
      }
    } catch (err) {
      resultados.push.erro = err.message;
    }
  }

  // 3. WHATSAPP
  const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WA_PHONE = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const VIV_NUM = (process.env.VIVIANNE_PERSONAL_NUMBER || '').replace(/[^0-9]/g, '');
  resultados.whatsapp.configurado = !!(WA_TOKEN && WA_PHONE && VIV_NUM);
  resultados.whatsapp.numero_destino = VIV_NUM ? `${VIV_NUM.slice(0, 3)}***${VIV_NUM.slice(-3)}` : 'N/A';
  // WhatsApp requer janela de 24h para texto livre — não testamos para não falhar

  // 4. EMAIL
  resultados.email.configurado = !!process.env.RESEND_API_KEY;

  // Resumo
  const canais_ok = [
    resultados.telegram.enviado && 'Telegram',
    resultados.push.enviado && 'Push',
  ].filter(Boolean);

  return res.status(200).json({
    ok: canais_ok.length > 0,
    canais_funcionando: canais_ok,
    resultados,
    dica: canais_ok.length === 0
      ? 'Nenhum canal funcionou. Verifica: 1) Telegram: enviaste /start ao bot? 2) Push: activaste no /coach?'
      : null,
  });
}

// ==========================================
// TELEGRAM — notificações para a coach
// ==========================================

async function telegramSend(params, res) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(200).json({ ok: false, error: 'Telegram não configurado. Adiciona TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no Vercel.' });
  }

  const { mensagem } = params;
  if (!mensagem) {
    return res.status(400).json({ ok: false, error: 'Mensagem obrigatória' });
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    // Tentar com Markdown
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();

    if (result.ok) {
      return res.status(200).json({ ok: true, messageId: result.result?.message_id });
    }

    // Markdown falhou — retry sem formatação
    console.warn('[Telegram] Markdown falhou:', result.description, '— retry sem formatação');
    const resp2 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: mensagem }),
    });
    const result2 = await resp2.json();

    if (result2.ok) {
      return res.status(200).json({ ok: true, messageId: result2.result?.message_id, note: 'Enviado sem Markdown' });
    }

    console.error('[Telegram] Falhou mesmo sem Markdown:', result2.description);
    return res.status(200).json({ ok: false, error: result2.description });
  } catch (err) {
    console.error('[Telegram] Erro de rede:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
