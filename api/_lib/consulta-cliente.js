/**
 * SETE ECOS - Consulta Rápida de Cliente (para acompanhamento via Claude Code)
 *
 * Uso:
 *   GET /api/consulta-cliente?secret=vivnasc2026&action=listar
 *   GET /api/consulta-cliente?secret=vivnasc2026&action=resumo&nome=vanessa
 *   GET /api/consulta-cliente?secret=vivnasc2026&action=detalhe&userId=xxx
 *   GET /api/consulta-cliente?secret=vivnasc2026&action=alertas
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SECRET = process.env.COACH_QUERY_SECRET || 'vivnasc2026';

export default async function handler(req, res) {
  const params = { ...req.query, ...(req.body || {}) };

  if (params.secret !== SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const action = params.action || 'listar';

  try {
    if (action === 'listar') return await listarTodos(res);
    if (action === 'resumo') return await resumoCliente(params.nome, params.userId, res);
    if (action === 'detalhe') return await detalheCliente(params.userId, res);
    if (action === 'alertas') return await alertasActivos(res);
    return res.status(400).json({ error: 'Acção inválida. Use: listar, resumo, detalhe, alertas' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── LISTAR: lista compacta de todos os clientes Vitalis ───
async function listarTodos(res) {
  const { data: clients, error } = await supabase
    .from('vitalis_clients')
    .select('user_id, subscription_status, subscription_expires, trial_started, fase_actual, peso_inicial, peso_actual, peso_meta, created_at, users!inner(id, nome, email)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const agora = new Date();
  const lista = (clients || []).map(c => {
    let status = c.subscription_status;
    if ((status === 'active' || status === 'trial') && c.subscription_expires && new Date(c.subscription_expires) < agora) {
      status = 'expired';
    }
    return {
      userId: c.user_id,
      nome: c.users?.nome || 'Sem nome',
      email: c.users?.email || '',
      status,
      fase: c.fase_actual,
      pesoInicial: c.peso_inicial,
      pesoActual: c.peso_actual,
      pesoMeta: c.peso_meta,
      desde: c.created_at,
    };
  });

  return res.status(200).json({ total: lista.length, clientes: lista });
}

// ─── RESUMO: resumo semanal de um cliente (por nome ou userId) ───
async function resumoCliente(nome, userId, res) {
  // Encontrar userId se só temos nome
  if (!userId && nome) {
    const { data: users } = await supabase
      .from('users')
      .select('id, nome')
      .ilike('nome', `%${nome}%`);
    if (!users || users.length === 0) return res.status(404).json({ error: `Nenhum cliente encontrado com nome "${nome}"` });
    if (users.length > 1) {
      return res.status(200).json({
        multiplos: true,
        msg: `Encontrei ${users.length} utilizadores com "${nome}". Especifica o userId.`,
        resultados: users.map(u => ({ userId: u.id, nome: u.nome }))
      });
    }
    userId = users[0].id;
  }

  if (!userId) return res.status(400).json({ error: 'Indica nome ou userId' });

  // Buscar tudo em paralelo
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const [userRes, clientRes, intakeRes, planoRes, checkinsRes, registosRes, aguaRes, mealsRes, treinosRes, sonoRes, medidasRes] = await Promise.all([
    supabase.from('users').select('id, nome, email, genero, created_at').eq('id', userId).single(),
    supabase.from('vitalis_clients').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('vitalis_intake').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('vitalis_meal_plans').select('id, status, calorias_alvo, proteina_g, carboidratos_g, gordura_g, fase, abordagem, versao, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
    supabase.from('vitalis_checkins').select('*').eq('user_id', userId).gte('data', trintaDiasAtras.toISOString().split('T')[0]).order('data', { ascending: false }),
    supabase.from('vitalis_registos').select('*').eq('user_id', userId).gte('data', trintaDiasAtras.toISOString().split('T')[0]).order('data', { ascending: false }),
    supabase.from('vitalis_agua_log').select('*').eq('user_id', userId).gte('data', trintaDiasAtras.toISOString().split('T')[0]).order('data', { ascending: false }),
    supabase.from('vitalis_meals_log').select('*').eq('user_id', userId).gte('data', trintaDiasAtras.toISOString().split('T')[0]).order('data', { ascending: false }),
    supabase.from('vitalis_workouts_log').select('*').eq('user_id', userId).gte('data', trintaDiasAtras.toISOString().split('T')[0]).order('data', { ascending: false }),
    supabase.from('vitalis_sono_log').select('*').eq('user_id', userId).gte('data', trintaDiasAtras.toISOString().split('T')[0]).order('data', { ascending: false }),
    supabase.from('vitalis_medidas_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(5),
  ]);

  if (userRes.error) return res.status(404).json({ error: 'Cliente não encontrado' });

  const user = userRes.data;
  const client = clientRes.data;
  const intake = intakeRes.data;
  const planos = planoRes.data || [];
  const checkins = checkinsRes.data || [];
  const registos = registosRes.data || [];
  const agua = aguaRes.data || [];
  const meals = mealsRes.data || [];
  const treinos = treinosRes.data || [];
  const sono = sonoRes.data || [];
  const medidas = medidasRes.data || [];

  // Calcular métricas da semana
  const checkinsSemana = checkins.filter(c => new Date(c.data) >= seteDiasAtras);
  const registosSemana = registos.filter(r => new Date(r.data) >= seteDiasAtras);
  const aguaSemana = agua.filter(a => new Date(a.data) >= seteDiasAtras);
  const mealsSemana = meals.filter(m => new Date(m.data) >= seteDiasAtras);
  const treinosSemana = treinos.filter(t => new Date(t.data) >= seteDiasAtras);
  const sonoSemana = sono.filter(s => new Date(s.data) >= seteDiasAtras);

  // Médias da semana
  const avg = (arr, field) => {
    const vals = arr.map(x => x[field]).filter(v => v != null && v !== 0);
    return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  };

  // Último peso e tendência
  const pesosRecentes = [...checkins, ...registos]
    .filter(x => x.peso)
    .sort((a, b) => new Date(b.data) - new Date(a.data));
  const ultimoPeso = pesosRecentes[0]?.peso || client?.peso_actual;
  const pesoAnterior = pesosRecentes.length >= 2 ? pesosRecentes[1]?.peso : client?.peso_inicial;
  const deltaPeso = ultimoPeso && pesoAnterior ? +(ultimoPeso - pesoAnterior).toFixed(1) : null;

  // Dias sem check-in
  const ultimoCheckin = checkins[0]?.data || registos[0]?.data;
  const diasSemCheckin = ultimoCheckin
    ? Math.floor((new Date() - new Date(ultimoCheckin)) / (1000 * 60 * 60 * 24))
    : null;

  // Status da subscrição
  let subStatus = client?.subscription_status;
  if ((subStatus === 'active' || subStatus === 'trial') && client?.subscription_expires) {
    if (new Date(client.subscription_expires) < new Date()) subStatus = 'expired';
  }
  const diasRestantes = client?.subscription_expires
    ? Math.ceil((new Date(client.subscription_expires) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const resumo = {
    // Perfil
    nome: user.nome,
    email: user.email,
    genero: user.genero || intake?.sexo,
    userId: user.id,
    desde: client?.created_at,

    // Subscrição
    subscricao: {
      status: subStatus,
      expira: client?.subscription_expires,
      diasRestantes,
      pacote: client?.pacote,
    },

    // Intake resumido
    intake: intake ? {
      idade: intake.idade,
      altura: intake.altura_cm,
      pesoInicial: intake.peso_actual,
      objectivo: intake.objectivo_principal || client?.objectivo_principal,
      abordagem: intake.abordagem,
      restricoes: intake.restricoes_alimentares,
      actividade: intake.nivel_actividade,
      saude: intake.condicoes_saude,
    } : null,

    // Plano activo
    planoActivo: planos[0] ? {
      id: planos[0].id,
      status: planos[0].status,
      fase: planos[0].fase,
      abordagem: planos[0].abordagem,
      calorias: planos[0].calorias_alvo,
      proteina: planos[0].proteina_g,
      carboidratos: planos[0].carboidratos_g,
      gordura: planos[0].gordura_g,
      versao: planos[0].versao,
      criado: planos[0].created_at,
    } : null,

    // Progresso
    progresso: {
      fase: client?.fase_actual,
      pesoInicial: client?.peso_inicial,
      pesoActual: ultimoPeso,
      pesoMeta: client?.peso_meta,
      deltaPesoRecente: deltaPeso,
      imcInicial: client?.imc_inicial,
      imcActual: client?.imc_actual,
    },

    // Semana actual
    semana: {
      checkins: checkinsSemana.length,
      registos: registosSemana.length,
      refeicoes: mealsSemana.length,
      treinos: treinosSemana.length,
      aguaMedia: avg(aguaSemana, 'litros'),
      energiaMedia: avg([...checkinsSemana, ...registosSemana], 'energia_1a5') || avg([...checkinsSemana, ...registosSemana], 'energia_nivel'),
      humorMedia: avg([...checkinsSemana, ...registosSemana], 'humor_nivel') || avg([...checkinsSemana, ...registosSemana], 'humor'),
      sonoMedia: avg(sonoSemana, 'horas'),
      aderenciaMedia: avg(registosSemana, 'aderencia_1a10'),
    },

    // Alertas
    alertas: {
      diasSemCheckin,
      inactivo: diasSemCheckin > 3,
      critico: diasSemCheckin > 7,
      subscricaoAExpirar: diasRestantes != null && diasRestantes <= 5 && diasRestantes > 0,
    },

    // Últimos 5 check-ins detalhados
    ultimosCheckins: [...checkins, ...registos]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5)
      .map(c => ({
        data: c.data,
        peso: c.peso,
        energia: c.energia_1a5 || c.energia_nivel,
        humor: c.humor_nivel || c.humor,
        aderencia: c.aderencia_1a10,
        agua: c.agua_litros,
        seguiuPlano: c.seguiu_plano,
        exercicio: c.fez_exercicio,
        notas: c.notas,
      })),

    // Medidas corporais
    ultimasMedidas: medidas.slice(0, 3).map(m => ({
      data: m.data,
      cintura: m.cintura_cm,
      anca: m.anca_cm,
    })),
  };

  return res.status(200).json(resumo);
}

// ─── DETALHE: dados completos do cliente (como buscarDadosCliente) ───
async function detalheCliente(userId, res) {
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

  const [userRes, clientRes, intakeRes, planoRes, registosRes, aguaRes, mealsRes, habitosRes, medidasRes, checkinsRes, treinosRes, sonoRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('vitalis_clients').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('vitalis_intake').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('vitalis_meal_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('vitalis_registos').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(90),
    supabase.from('vitalis_agua_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(90),
    supabase.from('vitalis_meals_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(120),
    supabase.from('vitalis_habitos').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase.from('vitalis_medidas_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(20),
    supabase.from('vitalis_checkins').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(90),
    supabase.from('vitalis_workouts_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(90),
    supabase.from('vitalis_sono_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(90),
  ]);

  if (userRes.error) return res.status(404).json({ error: 'Cliente não encontrado' });

  return res.status(200).json({
    user: userRes.data,
    client: clientRes.data,
    intake: intakeRes.data,
    planos: planoRes.data || [],
    registos: registosRes.data || [],
    aguaLogs: aguaRes.data || [],
    mealsLogs: mealsRes.data || [],
    habitos: habitosRes.data || [],
    medidas: medidasRes.data || [],
    checkins: checkinsRes.data || [],
    treinos: treinosRes.data || [],
    sonoLogs: sonoRes.data || [],
  });
}

// ─── ALERTAS: clientes que precisam de atenção ───
async function alertasActivos(res) {
  const { data: clients } = await supabase
    .from('vitalis_clients')
    .select('user_id, subscription_status, subscription_expires, trial_started, created_at, users!inner(nome, email)')
    .in('subscription_status', ['active', 'trial', 'tester'])
    .order('created_at', { ascending: false });

  if (!clients || clients.length === 0) return res.status(200).json({ alertas: [] });

  const userIds = clients.map(c => c.user_id);

  // Último check-in/registo de cada cliente
  const { data: registos } = await supabase
    .from('vitalis_registos')
    .select('user_id, data, energia_1a5, aderencia_1a10, humor')
    .in('user_id', userIds)
    .order('data', { ascending: false });

  const { data: checkins } = await supabase
    .from('vitalis_checkins')
    .select('user_id, data, energia_nivel, humor_nivel')
    .in('user_id', userIds)
    .order('data', { ascending: false });

  // Último registo por cliente
  const ultimoRegisto = {};
  for (const r of (registos || [])) {
    if (!ultimoRegisto[r.user_id]) ultimoRegisto[r.user_id] = r;
  }
  for (const c of (checkins || [])) {
    if (!ultimoRegisto[c.user_id] || new Date(c.data) > new Date(ultimoRegisto[c.user_id].data)) {
      ultimoRegisto[c.user_id] = c;
    }
  }

  const agora = new Date();
  const alertas = [];

  for (const client of clients) {
    const nome = client.users?.nome || 'Sem nome';
    const ultimo = ultimoRegisto[client.user_id];
    const diasSemCheckin = ultimo
      ? Math.floor((agora - new Date(ultimo.data)) / (1000 * 60 * 60 * 24))
      : Math.floor((agora - new Date(client.created_at)) / (1000 * 60 * 60 * 24));

    // Subscrição a expirar
    let diasRestantes = null;
    if (client.subscription_expires) {
      diasRestantes = Math.ceil((new Date(client.subscription_expires) - agora) / (1000 * 60 * 60 * 24));
    } else if (client.subscription_status === 'trial' && client.trial_started) {
      const trialEnd = new Date(client.trial_started);
      trialEnd.setDate(trialEnd.getDate() + 7);
      diasRestantes = Math.ceil((trialEnd - agora) / (1000 * 60 * 60 * 24));
    }

    const problemas = [];
    if (diasSemCheckin >= 7) problemas.push(`⚠️ ${diasSemCheckin} dias sem check-in (CRÍTICO)`);
    else if (diasSemCheckin >= 3) problemas.push(`⏰ ${diasSemCheckin} dias sem check-in`);
    if (diasRestantes != null && diasRestantes <= 3 && diasRestantes > 0) problemas.push(`💳 Subscrição expira em ${diasRestantes} dia(s)`);
    if (diasRestantes != null && diasRestantes <= 0) problemas.push(`🔴 Subscrição expirada`);
    if (ultimo?.aderencia_1a10 && ultimo.aderencia_1a10 <= 4) problemas.push(`📉 Aderência baixa: ${ultimo.aderencia_1a10}/10`);
    if (ultimo?.energia_1a5 && ultimo.energia_1a5 <= 2) problemas.push(`😴 Energia baixa: ${ultimo.energia_1a5}/5`);

    if (problemas.length > 0) {
      alertas.push({
        userId: client.user_id,
        nome,
        email: client.users?.email,
        status: client.subscription_status,
        diasSemCheckin,
        diasRestantes,
        ultimoCheckin: ultimo?.data || null,
        problemas,
      });
    }
  }

  // Ordenar por severidade (mais críticos primeiro)
  alertas.sort((a, b) => (b.problemas.length - a.problemas.length) || (b.diasSemCheckin - a.diasSemCheckin));

  return res.status(200).json({ total: alertas.length, alertas });
}
