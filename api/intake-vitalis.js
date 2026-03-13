/**
 * SETE ECOS - Vitalis Intake API
 * Grava intake, cria/atualiza client, e gera plano nutricional
 * Usa service role key para bypasaar RLS
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const token = authHeader.replace('Bearer ', '');

    // Verificar token com Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, nome')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (userError || !userData) {
      return res.status(400).json({ error: 'Perfil de utilizador não encontrado. Faz logout e login novamente.' });
    }

    const userId = userData.id;
    const { intakeData: clientIntake, formData } = req.body;

    if (!clientIntake || !formData) {
      return res.status(400).json({ error: 'Dados do intake em falta' });
    }

    // ── 1. GRAVAR INTAKE ──
    const intakePayload = {
      ...clientIntake,
      user_id: userId
    };

    console.log('📝 [API-INTAKE] A gravar intake para user_id:', userId);
    const { data: intakeResult, error: intakeError } = await supabase
      .from('vitalis_intake')
      .upsert(intakePayload, { onConflict: 'user_id' })
      .select('id');

    if (intakeError) {
      console.error('❌ [API-INTAKE] Erro no upsert:', intakeError);
      return res.status(500).json({ error: `Erro ao gravar questionário: ${intakeError.message}` });
    }

    console.log('✅ [API-INTAKE] Intake gravado:', intakeResult?.[0]?.id || 'upsert ok');

    // ── 2. VERIFICAR/CRIAR VITALIS_CLIENTS ──
    const { data: existingClient } = await supabase
      .from('vitalis_clients')
      .select('id, subscription_status, status')
      .eq('user_id', userId)
      .maybeSingle();

    const clientFields = {
      user_id: userId,
      objectivo_principal: formData.objectivo_principal,
      peso_inicial: parseFloat(formData.peso_actual),
      peso_actual: parseFloat(formData.peso_actual),
      peso_meta: parseFloat(formData.peso_meta),
      emocao_dominante: formData.emocao_dominante,
      prontidao_1a10: parseInt(formData.prontidao_1a10)
    };

    if (existingClient) {
      // Atualizar sem sobrescrever subscription_status
      const { error: clientError } = await supabase
        .from('vitalis_clients')
        .update(clientFields)
        .eq('user_id', userId);
      if (clientError) {
        console.error('❌ [API-INTAKE] Erro ao atualizar client:', clientError);
        return res.status(500).json({ error: clientError.message });
      }
    } else {
      const { error: clientError } = await supabase
        .from('vitalis_clients')
        .insert({
          ...clientFields,
          status: 'activo',
          subscription_status: 'pending',
          created_at: new Date().toISOString()
        });
      if (clientError) {
        console.error('❌ [API-INTAKE] Erro ao inserir client:', clientError);
        return res.status(500).json({ error: clientError.message });
      }
    }

    // ── 3. VERIFICAR STATUS PARA GERAÇÃO DE PLANO ──
    const { data: currentClient } = await supabase
      .from('vitalis_clients')
      .select('subscription_status, status')
      .eq('user_id', userId)
      .maybeSingle();

    const statusComPlano = ['tester', 'active'];
    const temPlano = currentClient && statusComPlano.includes(currentClient.subscription_status);
    const statusComAcessoBasico = ['trial', 'pending'];
    const temAcessoBasico = currentClient && statusComAcessoBasico.includes(currentClient.subscription_status);

    console.log('🎯 [API-INTAKE] Status:', currentClient?.subscription_status, '→', temPlano ? 'GERAR PLANO' : temAcessoBasico ? 'ACESSO BÁSICO' : 'PAGAMENTO');

    let planoResult = null;

    if (temPlano) {
      // ── 4. GERAR PLANO NUTRICIONAL ──
      try {
        planoResult = await gerarPlano(supabase, userId, intakePayload);
        console.log('✅ [API-INTAKE] Plano gerado!', planoResult?.calorias);
      } catch (planoErr) {
        console.error('❌ [API-INTAKE] Erro ao gerar plano:', planoErr);
        // Plano falhou mas intake foi gravado — não é fatal
        planoResult = { error: planoErr.message };
      }
    }

    return res.status(200).json({
      success: true,
      userId,
      temPlano,
      temAcessoBasico,
      plano: planoResult,
      redirect: temPlano ? '/vitalis/dashboard' : temAcessoBasico ? '/vitalis/dashboard' : '/vitalis/pagamento'
    });

  } catch (err) {
    console.error('❌ [API-INTAKE] Erro geral:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}

// ── GERAÇÃO DE PLANO (lógica copiada de planoGenerator) ──
async function gerarPlano(supabase, userId, intake) {
  const altura = parseFloat(intake.altura_cm) || 165;
  const peso = parseFloat(intake.peso_actual);
  const idade = parseInt(intake.idade, 10);
  const sexo = intake.sexo;

  if (!peso || isNaN(peso) || !idade || isNaN(idade) || !sexo) {
    throw new Error('Dados do intake incompletos para gerar plano');
  }

  // TMB (Mifflin-St Jeor)
  let tmb;
  if (sexo === 'masculino') {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
  } else {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
  }

  // TDEE
  const factoresActividade = {
    'sedentaria': 1.2, 'leve': 1.375, 'moderada': 1.55, 'intensa': 1.725
  };
  const factor = factoresActividade[intake.nivel_actividade] || 1.2;
  const tdee = tmb * factor;

  // Calorias alvo
  const prontidao = parseInt(intake.prontidao_1a10, 10) || 5;
  const objectivo = intake.objectivo_principal;
  let caloriasAlvo;

  if (objectivo === 'perder_peso' || objectivo === 'emagrecer') {
    let deficitFactor;
    if (prontidao <= 4) deficitFactor = 0.87;
    else if (prontidao <= 7) deficitFactor = 0.82;
    else deficitFactor = 0.75;
    caloriasAlvo = Math.round(tdee * deficitFactor);
  } else if (objectivo === 'ganhar_massa') {
    caloriasAlvo = Math.round(tdee * 1.1);
  } else {
    caloriasAlvo = Math.round(tdee);
  }

  caloriasAlvo = Math.max(1200, Math.min(caloriasAlvo, 4000));

  // Macros
  const ABORDAGENS_VALIDAS = ['keto_if', 'low_carb', 'equilibrado'];
  const abordagem = ABORDAGENS_VALIDAS.includes(intake.abordagem_preferida) ? intake.abordagem_preferida : 'equilibrado';

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

  proteinaG = Math.min(proteinaG, 400);
  carboidratosG = Math.min(carboidratosG, 600);
  gorduraG = Math.min(gorduraG, 250);

  // Porções
  const porcoesProteina = Math.round(proteinaG / 25);
  const porcoesLegumes = 4;
  const porcoesHidratos = Math.round(carboidratosG / 30);
  const porcoesGordura = Math.round(gorduraG / 10);

  // Refeições
  const aceita_jejum = intake.aceita_jejum || intake.abordagem_preferida === 'keto_if';
  let numRefeicoes;
  if (aceita_jejum && abordagem === 'keto_if') {
    numRefeicoes = 2;
  } else if (intake.refeicoes_dia) {
    const parsed = parseInt(intake.refeicoes_dia, 10);
    numRefeicoes = (parsed && !isNaN(parsed) && parsed > 0) ? parsed : 3;
  } else {
    numRefeicoes = 3;
  }

  const porcoesPorRefeicao = {
    proteina: Math.ceil(porcoesProteina / numRefeicoes),
    legumes: Math.ceil(porcoesLegumes / numRefeicoes),
    hidratos: Math.ceil(porcoesHidratos / numRefeicoes),
    gordura: Math.ceil(porcoesGordura / numRefeicoes)
  };

  let horariosRefeicoes;
  if (aceita_jejum) {
    horariosRefeicoes = ['12:00', '16:00', '20:00'].slice(0, numRefeicoes);
  } else if (intake.pequeno_almoco === 'Não faz') {
    horariosRefeicoes = ['13:00', '17:00', '20:00'].slice(0, numRefeicoes);
  } else {
    horariosRefeicoes = ['08:00', '13:00', '19:00'].slice(0, numRefeicoes);
  }

  const faseInicial = 'inducao';

  // IMC
  const alturaM = altura / 100;
  const imc = (altura > 0 && peso > 0) ? parseFloat((peso / (alturaM * alturaM)).toFixed(1)) : 0;

  // Atualizar vitalis_clients
  const { error: clientError } = await supabase
    .from('vitalis_clients')
    .upsert({
      user_id: userId,
      status: 'activo',
      data_inicio: new Date().toISOString().split('T')[0],
      fase_actual: faseInicial,
      objectivo_principal: intake.objectivo_principal,
      peso_inicial: intake.peso_actual,
      peso_actual: intake.peso_actual,
      peso_meta: intake.peso_meta,
      imc_inicial: imc,
      imc_actual: imc,
      emocao_dominante: intake.emocao_dominante,
      prontidao_1a10: intake.prontidao_1a10
    }, { onConflict: 'user_id' });

  if (clientError) throw clientError;

  // Desativar planos antigos
  await supabase
    .from('vitalis_meal_plans')
    .update({ status: 'inactivo' })
    .eq('user_id', userId)
    .eq('status', 'activo');

  // Criar plano
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
      porcoes_diarias: {
        proteina: porcoesProteina,
        legumes: porcoesLegumes,
        hidratos: porcoesHidratos,
        gordura: porcoesGordura
      },
      porções_por_refeicao: porcoesPorRefeicao,
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

  // Criar hábitos iniciais
  const prontidaoNum = parseInt(intake.prontidao_1a10, 10) || 5;
  let habitosInducao;
  if (prontidaoNum <= 4) {
    habitosInducao = [
      { habito: 'Beber 1 copo de água ao acordar', categoria: 'hidratacao', fase: 'inducao', dias_total: 7 },
      { habito: 'Fazer 1 refeição consciente por dia', categoria: 'nutricao', fase: 'inducao', dias_total: 7 },
      { habito: 'Abrir a app e registar como te sentes', categoria: 'mindset', fase: 'inducao', dias_total: 7 }
    ];
  } else {
    habitosInducao = [
      { habito: 'Beber 2L de água por dia', categoria: 'hidratacao', fase: 'inducao', dias_total: 14 },
      { habito: 'Fazer 3 refeições dentro da janela alimentar', categoria: 'nutricao', fase: 'inducao', dias_total: 14 },
      { habito: 'Dormir 7-8 horas por noite', categoria: 'sono', fase: 'inducao', dias_total: 14 },
      { habito: 'Check-in diário na app', categoria: 'mindset', fase: 'inducao', dias_total: 14 }
    ];
  }

  await supabase.from('vitalis_habitos').insert(
    habitosInducao.map(h => ({ ...h, user_id: userId, data_inicio: new Date().toISOString().split('T')[0] }))
  );

  return {
    success: true,
    calorias: caloriasAlvo,
    macros: { proteina: proteinaG, carboidratos: carboidratosG, gordura: gorduraG },
    fase: faseInicial,
    abordagem
  };
}
