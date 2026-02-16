/**
 * SETE ECOS - Coach API Endpoint
 * Uses service role key to bypass RLS for coach operations
 *
 * Actions: gerar-plano, aprovar-plano, apagar-cliente, activar-subscricao, set-tester
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const COACH_EMAILS = [
  'viv.saraiva@gmail.com',
  'vivnasc@gmail.com',
  'vivianne.saraiva@outlook.com'
];

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const coach = await verifyCoach(req);
  if (!coach) return res.status(403).json({ error: 'Acesso negado. Apenas coaches autorizadas.' });

  const { action, ...params } = req.body || {};

  try {
    switch (action) {
      case 'listar-clientes':
        return await listarClientes(res);
      case 'coach-notificacoes':
        return await coachNotificacoes(res);
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
      .select('user_id, tipo_refeicao, data, created_at')
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
