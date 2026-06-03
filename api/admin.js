/**
 * /api/admin — ferramentas administrativas consolidadas (apenas Vivianne).
 * Substitui /api/diagnostico e /api/gerar-plano-manual para libertar
 * 1 função serverless no limite do Vercel Hobby.
 *
 * Uso:
 *   GET /api/admin?tool=diagnostico&email=cliente@x.com
 *   GET /api/admin?tool=gerar-plano&secret=vivnasc2026&email=cliente@x.com
 *   GET /api/admin?tool=gerar-plano&secret=vivnasc2026&user_id=UUID
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const supabaseService = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// ─── Tool: diagnostico ────────────────────────────────────────────

async function toolDiagnostico(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ erro: 'Parâmetro email é obrigatório. Uso: /api/admin?tool=diagnostico&email=xxx@yyy.com' });
  }

  const emailLower = email.toLowerCase().trim();
  const resultado = {
    email: emailLower,
    timestamp: new Date().toISOString(),
    auth: null,
    users: null,
    vitalis_clients: null,
    vitalis_intake: null,
    vitalis_meal_plans: null,
    diagnostico: []
  };

  // 1. auth.users
  const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers();
  if (authError) {
    resultado.auth = { erro: 'Sem permissão para consultar auth (precisa service role key)', detalhes: authError.message };
  } else {
    const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === emailLower);
    if (authUser) {
      resultado.auth = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        confirmed: !!authUser.email_confirmed_at
      };
    } else {
      resultado.auth = { encontrado: false };
      resultado.diagnostico.push('SEM REGISTO em auth.users - utilizador nunca fez login');
    }
  }

  // 2. users
  const { data: userData, error: userError } = await supabaseService
    .from('users')
    .select('id, auth_id, email, nome, created_at')
    .eq('email', emailLower)
    .maybeSingle();

  if (userError) {
    if (resultado.auth?.id) {
      const { data: userByAuth } = await supabaseService
        .from('users')
        .select('id, auth_id, email, nome, created_at')
        .eq('auth_id', resultado.auth.id)
        .maybeSingle();
      resultado.users = userByAuth || { encontrado: false, erro: userError.message };
    } else {
      resultado.users = { encontrado: false, erro: userError.message };
    }
  } else if (userData) {
    resultado.users = userData;
    if (resultado.auth?.id && userData.auth_id !== resultado.auth.id) {
      resultado.diagnostico.push(`INCONSISTÊNCIA: users.auth_id (${userData.auth_id}) != auth.id (${resultado.auth.id})`);
    }
  } else {
    if (resultado.auth?.id) {
      const { data: userByAuth } = await supabaseService
        .from('users')
        .select('id, auth_id, email, nome, created_at')
        .eq('auth_id', resultado.auth.id)
        .maybeSingle();
      if (userByAuth) {
        resultado.users = { ...userByAuth, nota: 'Encontrado por auth_id (email diferente na tabela users)' };
        resultado.diagnostico.push(`Email diferente: auth tem "${emailLower}" mas users tem "${userByAuth.email}"`);
      } else {
        resultado.users = { encontrado: false };
        resultado.diagnostico.push('SEM REGISTO em users - AuthContext não criou o registo');
      }
    } else {
      resultado.users = { encontrado: false };
      resultado.diagnostico.push('SEM REGISTO em users');
    }
  }

  const usersId = resultado.users?.id;
  if (!usersId) {
    resultado.diagnostico.push('Sem users.id - não é possível verificar vitalis_clients, intake ou meal_plans');
    return res.status(200).json(resultado);
  }

  // 3. vitalis_clients
  const { data: clientData, error: clientError } = await supabaseService
    .from('vitalis_clients')
    .select('id, user_id, status, subscription_status, fase_actual, peso_inicial, peso_actual, peso_meta, created_at, updated_at')
    .eq('user_id', usersId)
    .maybeSingle();

  if (clientError) resultado.vitalis_clients = { erro: clientError.message };
  else if (clientData) resultado.vitalis_clients = clientData;
  else {
    resultado.vitalis_clients = { encontrado: false };
    resultado.diagnostico.push('SEM REGISTO em vitalis_clients');
  }

  // 4. vitalis_intake
  const { data: intakeData, error: intakeError } = await supabaseService
    .from('vitalis_intake')
    .select('id, user_id, sexo, idade, peso, altura, objectivo, nivel_actividade, restricoes_alimentares, created_at, updated_at')
    .eq('user_id', usersId)
    .maybeSingle();

  if (intakeError) resultado.vitalis_intake = { erro: intakeError.message };
  else if (intakeData) resultado.vitalis_intake = intakeData;
  else {
    resultado.vitalis_intake = { encontrado: false };
    resultado.diagnostico.push('SEM REGISTO em vitalis_intake');
  }

  // 5. vitalis_meal_plans
  const { data: mealPlans, error: mealError } = await supabaseService
    .from('vitalis_meal_plans')
    .select('id, user_id, status, fase, abordagem, calorias_alvo, proteina_g, carboidratos_g, gordura_g, created_at, updated_at')
    .eq('user_id', usersId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (mealError) resultado.vitalis_meal_plans = { erro: mealError.message };
  else if (mealPlans && mealPlans.length > 0) {
    resultado.vitalis_meal_plans = mealPlans;
    if (!mealPlans.find(p => p.status === 'activo')) {
      resultado.diagnostico.push('NENHUM plano activo (todos inactivos ou expirados)');
    }
  } else {
    resultado.vitalis_meal_plans = { encontrado: false };
    resultado.diagnostico.push('SEM planos - plano nunca foi gerado');
  }

  if (resultado.diagnostico.length === 0) {
    resultado.diagnostico.push('Tudo OK - utilizador tem registos em todas as tabelas');
  }

  return res.status(200).json(resultado);
}

// ─── Tool: gerar-plano ────────────────────────────────────────────

function calcularIMC(peso, altura) {
  if (!altura || !peso) return null;
  if (altura <= 0 || peso <= 0) return null;
  if (altura < 100 || altura > 250) return null;
  if (peso < 20 || peso > 300) return null;
  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);
  if (imc < 10 || imc > 100) return null;
  return parseFloat(imc.toFixed(1));
}

async function gerarPlanoCore(userId, supabase) {
  const { data: intake, error: intakeError } = await supabase
    .from('vitalis_intake').select('*').eq('user_id', userId).single();
  if (intakeError || !intake) throw new Error('Intake não encontrado');

  const altura = parseFloat(intake.altura_cm) || 165;
  const peso = parseFloat(intake.peso_actual);
  const idade = parseInt(intake.idade, 10);
  const sexo = intake.sexo;
  if (!peso || !idade || !sexo) throw new Error('Dados incompletos no intake');

  let tmb = sexo === 'masculino'
    ? (10 * peso) + (6.25 * altura) - (5 * idade) + 5
    : (10 * peso) + (6.25 * altura) - (5 * idade) - 161;

  const factor = { sedentaria: 1.2, leve: 1.375, moderada: 1.55, intensa: 1.725 }[intake.nivel_actividade] || 1.2;
  const tdee = tmb * factor;

  let caloriasAlvo;
  const obj = intake.objectivo_principal;
  if (obj === 'perder_peso' || obj === 'emagrecer') caloriasAlvo = Math.round(tdee * 0.75);
  else if (obj === 'ganhar_massa') caloriasAlvo = Math.round(tdee * 1.1);
  else caloriasAlvo = Math.round(tdee);
  caloriasAlvo = Math.max(1200, Math.min(4000, caloriasAlvo));

  const ABORDAGENS_VALIDAS = ['keto_if', 'low_carb', 'equilibrado'];
  const abordagemRaw = intake.abordagem_preferida || 'equilibrado';
  const abordagem = ABORDAGENS_VALIDAS.includes(abordagemRaw) ? abordagemRaw : 'equilibrado';

  let proteinaG, carboidratosG, gorduraG;
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

  const porcoes = {
    proteina: Math.round(proteinaG / 25),
    legumes: 4,
    hidratos: Math.round(carboidratosG / 30),
    gordura: Math.round(gorduraG / 15)
  };

  let numRefeicoes;
  if (intake.aceita_jejum && abordagem === 'keto_if') numRefeicoes = 2;
  else if (intake.refeicoes_dia) {
    const p = parseInt(intake.refeicoes_dia, 10);
    numRefeicoes = (p && p > 0) ? p : 3;
  } else numRefeicoes = 3;

  const porcoesPorRefeicao = {
    proteina: Math.ceil(porcoes.proteina / numRefeicoes),
    legumes: Math.ceil(porcoes.legumes / numRefeicoes),
    hidratos: Math.ceil(porcoes.hidratos / numRefeicoes),
    gordura: Math.ceil(porcoes.gordura / numRefeicoes)
  };

  let horariosRefeicoes;
  if (intake.aceita_jejum) horariosRefeicoes = ['12:00', '16:00', '20:00'].slice(0, numRefeicoes);
  else if (intake.pequeno_almoco === 'Não faz') horariosRefeicoes = ['13:00', '17:00', '20:00'].slice(0, numRefeicoes);
  else horariosRefeicoes = ['08:00', '13:00', '19:00'].slice(0, numRefeicoes);

  const faseInicial = 'inducao';

  const { error: clientError } = await supabase.from('vitalis_clients').upsert({
    user_id: userId,
    status: 'activo',
    data_inicio: new Date().toISOString().split('T')[0],
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

  await supabase.from('vitalis_meal_plans')
    .update({ status: 'inactivo' })
    .eq('user_id', userId)
    .eq('status', 'activo');

  const { data: plano, error: planoError } = await supabase
    .from('vitalis_meal_plans')
    .insert([{
      user_id: userId,
      versao: 1,
      fase: faseInicial,
      abordagem,
      calorias_alvo: caloriasAlvo,
      proteina_g: proteinaG,
      carboidratos_g: carboidratosG,
      gordura_g: gorduraG,
      status: 'activo',
      receitas_incluidas: JSON.stringify({
        porções_por_refeicao: porcoesPorRefeicao,
        num_refeicoes: numRefeicoes,
        horarios: horariosRefeicoes
      })
    }])
    .select()
    .single();
  if (planoError) throw planoError;

  const habitos = [
    { habito: 'Beber 2L de água por dia', categoria: 'hidratacao', fase: 'inducao', dias_total: 14 },
    { habito: 'Fazer 3 refeições dentro da janela alimentar', categoria: 'nutricao', fase: 'inducao', dias_total: 14 },
    { habito: 'Dormir 7-8 horas por noite', categoria: 'sono', fase: 'inducao', dias_total: 14 },
    { habito: 'Check-in diário na app', categoria: 'mindset', fase: 'inducao', dias_total: 14 }
  ].map(h => ({ ...h, user_id: userId, data_inicio: new Date().toISOString().split('T')[0] }));
  await supabase.from('vitalis_habitos').insert(habitos);

  return {
    plano_id: plano.id,
    calorias: caloriasAlvo,
    proteina_g: proteinaG,
    carboidratos_g: carboidratosG,
    gordura_g: gorduraG,
    num_refeicoes: numRefeicoes,
    horarios: horariosRefeicoes,
    fase: faseInicial,
    abordagem
  };
}

async function toolGerarPlano(req, res) {
  const { secret, user_id, email } = req.query;
  if (secret !== 'vivnasc2026') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey) return res.status(500).json({ error: 'VITE_SUPABASE_ANON_KEY não configurada' });

  const supabase = createClient(supabaseUrl, supabaseKey);

  let targetUserId = user_id;
  if (!targetUserId && email) {
    const { data: authUser, error: authError } = await supabaseService.auth.admin.listUsers();
    if (!authError && authUser?.users) {
      const u = authUser.users.find(x => x.email === email);
      if (u) targetUserId = u.id;
    }
  }
  if (!targetUserId) {
    const { data: cliente } = await supabase
      .from('vitalis_clients')
      .select('user_id, subscription_status')
      .eq('subscription_status', 'active')
      .single();
    if (cliente) targetUserId = cliente.user_id;
  }
  if (!targetUserId) {
    return res.status(404).json({ error: 'Cliente não encontrado. Passe user_id ou email.' });
  }

  try {
    const resultado = await gerarPlanoCore(targetUserId, supabase);
    return res.status(200).json({ success: true, user_id: targetUserId, plano: resultado });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ─── Handler ──────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tool } = req.query;
  try {
    switch (tool) {
      case 'diagnostico':
        return await toolDiagnostico(req, res);
      case 'gerar-plano':
        return await toolGerarPlano(req, res);
      default:
        return res.status(400).json({
          error: 'tool desconhecido',
          uso: 'GET /api/admin?tool=diagnostico&email=X | /api/admin?tool=gerar-plano&secret=X&email=Y'
        });
    }
  } catch (err) {
    console.error('Erro /api/admin:', err);
    return res.status(500).json({ erro: 'Erro interno', detalhes: err.message });
  }
}
