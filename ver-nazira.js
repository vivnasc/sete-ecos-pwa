#!/usr/bin/env node
// VER DADOS DA NAZIRA - EXECUÇÃO DIRETA

const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';

async function verNazira(anonKey) {
  if (!anonKey) {
    console.log('\n❌ ERRO: Precisa da chave Supabase!\n');
    console.log('📋 COMO OBTER:');
    console.log('1. https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/settings/api');
    console.log('2. Copiar "anon public" key');
    console.log('3. Executar: node ver-nazira.js SUA_CHAVE\n');
    process.exit(1);
  }

  console.log('\n🔍 BUSCANDO DADOS DA NAZIRA...\n');

  try {
    // 1. BUSCAR NAZIRA
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?nome=ilike.*nazira*&select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const users = await usersRes.json();

    if (!users || users.length === 0) {
      console.log('❌ NAZIRA NÃO ENCONTRADA!\n');
      process.exit(1);
    }

    const nazira = users[0];
    console.log('✅ NAZIRA ENCONTRADA:');
    console.log(`   Nome: ${nazira.nome}`);
    console.log(`   Email: ${nazira.email}`);
    console.log(`   ID: ${nazira.id}\n`);

    // 2. BUSCAR INTAKE
    const intakeRes = await fetch(`${SUPABASE_URL}/rest/v1/vitalis_intake?user_id=eq.${nazira.id}&select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const intake = await intakeRes.json();

    console.log('📝 INTAKE:');
    if (intake && intake.length > 0) {
      const i = intake[0];
      console.log(`   ✅ Nome: ${i.nome || 'N/A'}`);
      console.log(`   ${i.altura_cm ? '✅' : '❌'} Altura: ${i.altura_cm || 'FALTANDO!'}`);
      console.log(`   ${i.peso_actual ? '✅' : '❌'} Peso: ${i.peso_actual || 'FALTANDO!'}`);
      console.log(`   ${i.idade ? '✅' : '❌'} Idade: ${i.idade || 'FALTANDO!'}`);
      console.log(`   ${i.sexo ? '✅' : '❌'} Sexo: ${i.sexo || 'FALTANDO!'}\n`);

      if (!i.altura_cm || !i.peso_actual || !i.idade) {
        console.log('⚠️  INTAKE INCOMPLETO - FALTA DADOS!\n');
      }
    } else {
      console.log('   ❌ SEM INTAKE!\n');
    }

    // 3. BUSCAR SUBSCRIPTION
    const clientRes = await fetch(`${SUPABASE_URL}/rest/v1/vitalis_clients?user_id=eq.${nazira.id}&select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const clients = await clientRes.json();

    console.log('💳 SUBSCRIPTION:');
    if (clients && clients.length > 0) {
      const c = clients[0];
      console.log(`   Status: ${c.subscription_status}`);
      console.log(`   Peso Actual: ${c.peso_actual || 'N/A'}\n`);
    } else {
      console.log('   ❌ SEM REGISTO!\n');
    }

    // 4. BUSCAR PLANO
    const planoRes = await fetch(`${SUPABASE_URL}/rest/v1/vitalis_meal_plans?user_id=eq.${nazira.id}&select=*&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const planos = await planoRes.json();

    console.log('📋 PLANO ALIMENTAR:');
    if (planos && planos.length > 0) {
      console.log(`   ✅ TEM PLANO (${planos[0].status})\n`);
    } else {
      console.log('   ❌ SEM PLANO GERADO!\n');
    }

    // 5. RESUMO
    console.log('═══════════════════════════════════');
    console.log('🎯 DIAGNÓSTICO:');
    const temIntake = intake && intake.length > 0;
    const intakeCompleto = temIntake && intake[0].altura_cm && intake[0].peso_actual && intake[0].idade;
    const temPlano = planos && planos.length > 0;

    if (!temIntake) {
      console.log('❌ PROBLEMA: Sem intake');
    } else if (!intakeCompleto) {
      console.log('❌ PROBLEMA: Intake INCOMPLETO');
      console.log(`   Falta: ${!intake[0].altura_cm ? 'altura ' : ''}${!intake[0].peso_actual ? 'peso ' : ''}${!intake[0].idade ? 'idade' : ''}`);
    } else if (!temPlano) {
      console.log('❌ PROBLEMA: Intake OK mas SEM PLANO');
    } else {
      console.log('✅ TUDO OK!');
    }
    console.log('═══════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message, '\n');
  }
}

// Executar
const key = process.argv[2];
verNazira(key);
