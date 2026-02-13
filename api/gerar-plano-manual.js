// API para gerar plano manualmente para cliente específica
// Uso: GET /api/gerar-plano-manual?secret=SEU_SECRET

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Função auxiliar
function calcularIMC(peso, altura) {
  if (!altura || altura <= 0 || !peso || peso <= 0) return 0;
  const alturaM = altura / 100;
  return parseFloat((peso / (alturaM * alturaM)).toFixed(1));
}

async function gerarPlano(userId, supabase) {
  // 1. Buscar intake
  const { data: intake, error: intakeError } = await supabase
    .from('vitalis_intake')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (intakeError || !intake) {
    throw new Error('Intake não encontrado');
  }

  // 2. Dados
  const altura = parseFloat(intake.altura_cm) || 165;
  const peso = parseFloat(intake.peso_actual);
  const idade = parseInt(intake.idade, 10);
  const sexo = intake.sexo;

  if (!peso || !idade || !sexo) {
    throw new Error('Dados incompletos no intake');
  }

  // 3. TMB (Mifflin-St Jeor)
  let tmb;
  if (sexo === 'masculino') {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
  } else {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
  }

  // 4. TDEE
  const factoresActividade = {
    'sedentaria': 1.2,
    'leve': 1.375,
    'moderada': 1.55,
    'intensa': 1.725
  };
  const factor = factoresActividade[intake.nivel_actividade] || 1.2;
  const tdee = tmb * factor;

  // 5. Calorias alvo
  let caloriasAlvo;
  const objectivo = intake.objectivo_principal;

  if (objectivo === 'perder_peso' || objectivo === 'emagrecer') {
    caloriasAlvo = Math.round(tdee * 0.75);
  } else if (objectivo === 'ganhar_massa') {
    caloriasAlvo = Math.round(tdee * 1.1);
  } else {
    caloriasAlvo = Math.round(tdee);
  }

  if (caloriasAlvo < 1200) caloriasAlvo = 1200;
  if (caloriasAlvo > 4000) caloriasAlvo = 4000;

  // 6. Macros
  let proteinaG, carboidratosG, gorduraG;
  const abordagem = intake.abordagem_preferida || 'equilibrado';

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

  // 7. Porções
  const porcoesProteina = Math.round(proteinaG / 25);
  const porcoesLegumes = 4;
  const porcoesHidratos = Math.round(carboidratosG / 30);
  const porcoesGordura = Math.round(gorduraG / 10);

  // 8. Refeições
  let numRefeicoes;
  if (intake.aceita_jejum && abordagem === 'keto_if') {
    numRefeicoes = 2;
  } else if (intake.refeicoes_dia) {
    const parsed = parseInt(intake.refeicoes_dia, 10);
    numRefeicoes = (parsed && !isNaN(parsed) && parsed > 0) ? parsed : 3;
  } else {
    numRefeicoes = 3;
  }

  // 9. Distribuição
  const porcoesPorRefeicao = {
    proteina: Math.ceil(porcoesProteina / numRefeicoes),
    legumes: Math.ceil(porcoesLegumes / numRefeicoes),
    hidratos: Math.ceil(porcoesHidratos / numRefeicoes),
    gordura: Math.ceil(porcoesGordura / numRefeicoes)
  };

  // 10. Horários
  let horariosRefeicoes;
  if (intake.aceita_jejum) {
    horariosRefeicoes = ['12:00', '16:00', '20:00'].slice(0, numRefeicoes);
  } else if (intake.pequeno_almoco === 'Não faz') {
    horariosRefeicoes = ['13:00', '17:00', '20:00'].slice(0, numRefeicoes);
  } else {
    horariosRefeicoes = ['08:00', '13:00', '19:00'].slice(0, numRefeicoes);
  }

  const faseInicial = 'inducao';

  // 11. UPSERT vitalis_clients
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
      imc_inicial: calcularIMC(intake.peso_actual, altura),
      imc_actual: calcularIMC(intake.peso_actual, altura),
      emocao_dominante: intake.emocao_dominante,
      prontidao_1a10: intake.prontidao_1a10
    }, { onConflict: 'user_id' });

  if (clientError) throw clientError;

  // 12. Desativar planos antigos
  await supabase
    .from('vitalis_meal_plans')
    .update({ status: 'inactivo' })
    .eq('user_id', userId)
    .eq('status', 'activo');

  // 13. Criar plano novo
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

  // 14. Hábitos
  const habitosInducao = [
    { habito: 'Beber 2L de água por dia', categoria: 'hidratacao', fase: 'inducao', dias_total: 14 },
    { habito: 'Fazer 3 refeições dentro da janela alimentar', categoria: 'nutricao', fase: 'inducao', dias_total: 14 },
    { habito: 'Dormir 7-8 horas por noite', categoria: 'sono', fase: 'inducao', dias_total: 14 },
    { habito: 'Check-in diário na app', categoria: 'mindset', fase: 'inducao', dias_total: 14 }
  ];

  const habitosComUserId = habitosInducao.map(h => ({
    ...h,
    user_id: userId,
    data_inicio: new Date().toISOString().split('T')[0]
  }));

  await supabase.from('vitalis_habitos').insert(habitosComUserId);

  return {
    plano_id: plano.id,
    calorias: caloriasAlvo,
    proteina_g: proteinaG,
    carboidratos_g: carboidratosG,
    gordura_g: gorduraG,
    num_refeicoes: numRefeicoes,
    horarios: horariosRefeicoes,
    fase: faseInicial,
    abordagem: abordagem
  };
}

export default async function handler(req, res) {
  try {
    // Segurança básica
    const { secret, user_id, email } = req.query;
    if (secret !== 'vivnasc2026') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (!supabaseKey) {
      return res.status(500).json({ error: 'VITE_SUPABASE_ANON_KEY não configurada' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let targetUserId = user_id;

    // Se passou email, buscar user_id
    if (!targetUserId && email) {
      const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
      if (!authError && authUser?.users) {
        const user = authUser.users.find(u => u.email === email);
        if (user) {
          targetUserId = user.id;
        }
      }

      // Fallback: buscar em vitalis_clients via perfil
      if (!targetUserId) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (userData) {
          targetUserId = userData.id;
        }
      }
    }

    // Se ainda não tem user_id, buscar a única cliente ativa (fallback)
    if (!targetUserId) {
      const { data: cliente, error: clienteError } = await supabase
        .from('vitalis_clients')
        .select('user_id, subscription_status')
        .eq('subscription_status', 'active')
        .single();

      if (clienteError || !cliente) {
        return res.status(404).json({
          error: 'Nenhuma cliente encontrada. Passe user_id ou email como parâmetro.',
          details: clienteError?.message
        });
      }

      targetUserId = cliente.user_id;
    }

    console.log('🎯 Gerando plano para userId:', targetUserId);

    const resultado = await gerarPlano(targetUserId, supabase);

    return res.status(200).json({
      success: true,
      message: 'Plano gerado com sucesso!',
      user_id: targetUserId,
      plano: resultado
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
