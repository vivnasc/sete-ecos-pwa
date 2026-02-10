/**
 * ENDPOINT DE EMERGÊNCIA
 * Regenera plano usando intake existente SEM preencher de novo
 *
 * Uso: https://app.seteecos.com/api/regenerar-plano-emergencia?email=SEU_EMAIL
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ erro: 'Parâmetro email é obrigatório' });
    }

    console.log('🔧 REGENERAÇÃO DE EMERGÊNCIA para:', email);

    // 1. Buscar user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, auth_id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ erro: 'Utilizador não encontrado' });
    }

    const userId = user.id;
    console.log('✅ User encontrado:', userId);

    // 2. Buscar intake existente
    const { data: intake, error: intakeError } = await supabase
      .from('vitalis_intake')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (intakeError || !intake) {
      return res.status(404).json({ erro: 'Intake não encontrado' });
    }

    console.log('✅ Intake encontrado');

    // 3. Calcular valores
    const altura = intake.altura_cm;
    const peso = intake.peso_actual;
    const idade = intake.idade;
    const sexo = intake.sexo;

    let tmb;
    if (sexo === 'masculino') {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }

    const factor = 1.2; // sedentário
    const tdee = tmb * factor;
    const caloriasAlvo = Math.round(tdee * 0.75); // deficit 25%

    const abordagem = intake.abordagem_preferida || 'keto_if';
    let proteinaG, carboidratosG, gorduraG;

    if (abordagem === 'keto_if') {
      proteinaG = Math.round((caloriasAlvo * 0.25) / 4);
      carboidratosG = Math.round((caloriasAlvo * 0.05) / 4);
      gorduraG = Math.round((caloriasAlvo * 0.70) / 9);
    } else {
      proteinaG = Math.round((caloriasAlvo * 0.30) / 4);
      carboidratosG = Math.round((caloriasAlvo * 0.40) / 4);
      gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
    }

    const calcularIMC = (peso, altura) => {
      const alturaM = altura / 100;
      return parseFloat((peso / (alturaM * alturaM)).toFixed(1));
    };

    // 4. Desativar planos antigos (NÃO apagar — preservar histórico)
    console.log('🧹 Desativando planos antigos...');

    await supabase
      .from('vitalis_meal_plans')
      .update({ status: 'inactivo' })
      .eq('user_id', userId)
      .eq('status', 'activo');

    console.log('✅ Planos antigos desativados');

    // 5. Atualizar vitalis_clients (UPSERT — preserva subscription_status)
    const { error: clientError } = await supabase
      .from('vitalis_clients')
      .upsert({
        user_id: userId,
        status: 'activo',
        pacote: 'essencial',
        data_inicio: new Date().toISOString().split('T')[0],
        duracao_programa: '6_meses',
        fase_actual: 'inducao',
        objectivo_principal: intake.objectivo_principal || 'emagrecer',
        peso_inicial: peso,
        peso_actual: peso,
        peso_meta: intake.peso_meta || peso - 10,
        imc_inicial: calcularIMC(peso, altura),
        imc_actual: calcularIMC(peso, altura),
        emocao_dominante: intake.emocao_dominante || 'ansiedade',
        prontidao_1a10: parseInt(intake.prontidao_1a10) || 5
      }, { onConflict: 'user_id' });

    if (clientError) {
      console.error('❌ Erro ao criar/atualizar cliente:', clientError);
      throw clientError;
    }

    console.log('✅ Cliente criado/atualizado');

    // 6. Criar plano
    const { data: plano, error: planoError } = await supabase
      .from('vitalis_meal_plans')
      .insert({
        user_id: userId,
        versao: 1,
        fase: 'inducao',
        abordagem: abordagem,
        calorias_alvo: caloriasAlvo,
        proteina_g: proteinaG,
        carboidratos_g: carboidratosG,
        gordura_g: gorduraG,
        status: 'activo',
        receitas_incluidas: JSON.stringify({
          porções_por_refeicao: {
            proteina: 2,
            legumes: 2,
            hidratos: 1,
            gordura: 2
          },
          num_refeicoes: 3,
          horarios: ['08:00', '13:00', '19:00']
        })
      })
      .select()
      .single();

    if (planoError) {
      console.error('❌ Erro ao criar plano:', planoError);
      throw planoError;
    }

    console.log('✅ Plano criado:', plano.id);

    return res.status(200).json({
      sucesso: true,
      mensagem: '🎉 PLANO REGENERADO COM SUCESSO!',
      plano_id: plano.id,
      calorias: caloriasAlvo,
      macros: {
        proteina: proteinaG,
        carboidratos: carboidratosG,
        gordura: gorduraG
      },
      proximos_passos: [
        '1. Vai para /vitalis/dashboard',
        '2. Clica em "Meu Plano"',
        '3. DEVE FUNCIONAR!'
      ]
    });

  } catch (error) {
    console.error('❌ ERRO FATAL:', error);
    return res.status(500).json({
      erro: 'Erro ao regenerar plano',
      detalhes: error.message
    });
  }
}
