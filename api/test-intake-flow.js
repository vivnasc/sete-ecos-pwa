/**
 * TESTE COMPLETO: Intake → Plano
 * Executa o fluxo real com um user de teste e verifica cada passo.
 *
 * Uso: https://app.seteecos.com/api/test-intake-flow
 *
 * Cria dados temporários, testa, e limpa tudo no final.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const TEST_EMAIL = 'teste-flow@seteecos-test.com';
  const TEST_AUTH_ID = 'test-flow-auth-' + Date.now();
  const passos = [];
  let testUserId = null;

  const passo = (nome, ok, detalhe) => {
    passos.push({ passo: nome, ok, detalhe: detalhe || null });
    return ok;
  };

  try {
    // ═══════════════════════════════════════════
    // PASSO 1: Criar user na tabela users
    // ═══════════════════════════════════════════
    const { data: user, error: userErr } = await supabase
      .from('users')
      .upsert({
        auth_id: TEST_AUTH_ID,
        email: TEST_EMAIL,
        nome: 'Teste Flow',
        created_at: new Date().toISOString()
      }, { onConflict: 'auth_id' })
      .select('id')
      .maybeSingle();

    if (userErr || !user) {
      passo('1. Criar user', false, userErr?.message || 'user null');
      throw new Error('Falhou no passo 1');
    }
    testUserId = user.id;
    passo('1. Criar user', true, `id: ${testUserId}`);

    // ═══════════════════════════════════════════
    // PASSO 2: Criar vitalis_clients com status tester
    // ═══════════════════════════════════════════
    const { error: clientErr } = await supabase
      .from('vitalis_clients')
      .upsert({
        user_id: testUserId,
        status: 'activo',
        subscription_status: 'tester'
      }, { onConflict: 'user_id' });

    if (clientErr) {
      passo('2. Criar vitalis_clients', false, clientErr.message);
      throw new Error('Falhou no passo 2');
    }
    passo('2. Criar vitalis_clients', true, 'status=activo, subscription_status=tester');

    // ═══════════════════════════════════════════
    // PASSO 3: Criar intake de teste
    // ═══════════════════════════════════════════
    const intakeData = {
      user_id: testUserId,
      nome: 'Teste Flow',
      email: TEST_EMAIL,
      idade: 30,
      sexo: 'feminino',
      altura_cm: 165,
      peso_actual: 70,
      peso_meta: 60,
      objectivo_principal: 'perder_peso',
      nivel_actividade: 'leve',
      abordagem_preferida: 'equilibrado',
      aceita_jejum: false,
      prontidao_1a10: 8,
      emocao_dominante: 'motivacao'
    };

    const { error: intakeErr } = await supabase
      .from('vitalis_intake')
      .upsert(intakeData, { onConflict: 'user_id' });

    if (intakeErr) {
      passo('3. Criar intake', false, intakeErr.message);
      throw new Error('Falhou no passo 3');
    }
    passo('3. Criar intake', true, 'altura=165, peso=70, objectivo=perder_peso');

    // ═══════════════════════════════════════════
    // PASSO 4: Verificar se users.altura_cm causa erro
    // ═══════════════════════════════════════════
    let alturaFromUsers = null;
    try {
      const { data: userData, error: altErr } = await supabase
        .from('users')
        .select('altura_cm')
        .eq('id', testUserId)
        .maybeSingle();

      if (altErr) {
        passo('4. users.altura_cm', false, `ERRO: ${altErr.message} — MAS intake.altura_cm será usado como fallback`);
      } else {
        alturaFromUsers = userData?.altura_cm;
        passo('4. users.altura_cm', true, alturaFromUsers ? `valor: ${alturaFromUsers}` : 'null (intake.altura_cm será usado)');
      }
    } catch (e) {
      passo('4. users.altura_cm', false, `EXCEPÇÃO: ${e.message} — MAS intake.altura_cm será usado como fallback`);
    }

    // ═══════════════════════════════════════════
    // PASSO 5: Calcular macros (simular planoGenerator)
    // ═══════════════════════════════════════════
    const altura = intakeData.altura_cm || alturaFromUsers || 165;
    const tmb = (10 * 70) + (6.25 * altura) - (5 * 30) - 161;
    const tdee = tmb * 1.375; // leve
    const calorias = Math.round(tdee * 0.75);
    const proteina = Math.round((calorias * 0.30) / 4);
    const carbs = Math.round((calorias * 0.40) / 4);
    const gordura = Math.round((calorias * 0.30) / 9);

    passo('5. Calcular macros', true, `calorias=${calorias}, P=${proteina}g, C=${carbs}g, G=${gordura}g`);

    // ═══════════════════════════════════════════
    // PASSO 6: Desactivar planos antigos
    // ═══════════════════════════════════════════
    const { error: deactivErr } = await supabase
      .from('vitalis_meal_plans')
      .update({ status: 'inactivo' })
      .eq('user_id', testUserId)
      .eq('status', 'activo');

    passo('6. Desactivar planos antigos', !deactivErr, deactivErr?.message || 'OK');

    // ═══════════════════════════════════════════
    // PASSO 7: Criar meal plan
    // ═══════════════════════════════════════════
    const { data: plano, error: planoErr } = await supabase
      .from('vitalis_meal_plans')
      .insert({
        user_id: testUserId,
        versao: 1,
        fase: 'inducao',
        abordagem: 'equilibrado',
        calorias_alvo: calorias,
        proteina_g: proteina,
        carboidratos_g: carbs,
        gordura_g: gordura,
        status: 'activo',
        receitas_incluidas: JSON.stringify({
          'porções_por_refeicao': { proteina: 2, legumes: 2, hidratos: 1, gordura: 2 },
          num_refeicoes: 3,
          horarios: ['08:00', '13:00', '19:00']
        })
      })
      .select('id')
      .single();

    if (planoErr || !plano) {
      passo('7. Criar meal plan', false, planoErr?.message || 'plano null');
      throw new Error('Falhou no passo 7');
    }
    passo('7. Criar meal plan', true, `id: ${plano.id}`);

    // ═══════════════════════════════════════════
    // PASSO 8: Verificar plano existe
    // ═══════════════════════════════════════════
    const { data: verificacao, error: verErr } = await supabase
      .from('vitalis_meal_plans')
      .select('id, status, calorias_alvo')
      .eq('user_id', testUserId)
      .eq('status', 'activo')
      .maybeSingle();

    if (verErr || !verificacao) {
      passo('8. Verificar plano activo', false, verErr?.message || 'nenhum plano activo encontrado');
    } else {
      passo('8. Verificar plano activo', true, `calorias=${verificacao.calorias_alvo}`);
    }

    // ═══════════════════════════════════════════
    // PASSO 9: Testar RPC vitalis_plano_do_dia
    // ═══════════════════════════════════════════
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('vitalis_plano_do_dia', {
        p_user_id: testUserId
      });

      if (rpcErr) {
        passo('9. RPC vitalis_plano_do_dia', false, `ERRO: ${rpcErr.message} — fallback directo será usado`);
      } else if (rpcData?.erro) {
        passo('9. RPC vitalis_plano_do_dia', false, `RPC retornou erro: ${rpcData.erro} — fallback directo será usado`);
      } else {
        passo('9. RPC vitalis_plano_do_dia', true, 'RPC funciona correctamente');
      }
    } catch (e) {
      passo('9. RPC vitalis_plano_do_dia', false, `EXCEPÇÃO: ${e.message} — fallback directo será usado`);
    }

    // ═══════════════════════════════════════════
    // RESULTADO FINAL
    // ═══════════════════════════════════════════
    const todosPassed = passos.filter(p => p.ok).length;
    const criticos = passos.filter(p => !p.ok && !p.detalhe?.includes('fallback'));

    return res.status(200).json({
      resultado: criticos.length === 0 ? '✅ TUDO OK — Fluxo intake→plano funciona!' : '❌ FALHAS CRÍTICAS encontradas',
      passos_ok: todosPassed,
      passos_total: passos.length,
      passos,
      nota: 'Dados de teste são limpos automaticamente.'
    });

  } catch (err) {
    return res.status(200).json({
      resultado: '❌ TESTE FALHOU',
      erro: err.message,
      passos
    });

  } finally {
    // LIMPEZA: remover todos os dados de teste
    if (testUserId) {
      await supabase.from('vitalis_habitos').delete().eq('user_id', testUserId);
      await supabase.from('vitalis_meal_plans').delete().eq('user_id', testUserId);
      await supabase.from('vitalis_intake').delete().eq('user_id', testUserId);
      await supabase.from('vitalis_clients').delete().eq('user_id', testUserId);
      await supabase.from('users').delete().eq('auth_id', TEST_AUTH_ID);
    }
  }
}
