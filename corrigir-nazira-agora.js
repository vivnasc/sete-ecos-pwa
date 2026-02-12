#!/usr/bin/env node
// CORRIGIR NAZIRA E GERAR PLANO - EXECUÇÃO IMEDIATA

const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';
const NAZIRA_ID = '77442ec3-7905-4faf-b719-00faae084b3b';

async function corrigirNazira(anonKey, alturaCorreta) {
  if (!anonKey || !alturaCorreta) {
    console.log('\n❌ USO INCORRETO!\n');
    console.log('📋 Como executar:');
    console.log('node corrigir-nazira-agora.js <SUPABASE_KEY> <ALTURA_CM>\n');
    console.log('Exemplo:');
    console.log('node corrigir-nazira-agora.js eyJ... 165\n');
    process.exit(1);
  }

  const altura = parseInt(alturaCorreta);
  if (altura < 140 || altura > 200) {
    console.log('\n❌ ALTURA INVÁLIDA! Deve estar entre 140-200cm\n');
    process.exit(1);
  }

  console.log('\n🔧 CORRIGINDO DADOS DA NAZIRA...\n');
  console.log(`   User ID: ${NAZIRA_ID}`);
  console.log(`   Altura nova: ${altura}cm\n`);

  try {
    // 1. CORRIGIR ALTURA NO INTAKE
    console.log('📝 Atualizando vitalis_intake...');
    const intakeRes = await fetch(`${SUPABASE_URL}/rest/v1/vitalis_intake?user_id=eq.${NAZIRA_ID}`, {
      method: 'PATCH',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ altura_cm: altura })
    });

    if (!intakeRes.ok) {
      const error = await intakeRes.text();
      throw new Error(`Erro ao atualizar intake: ${error}`);
    }

    const intakeData = await intakeRes.json();
    console.log('   ✅ Intake atualizado!');
    console.log(`   Altura: 1 → ${altura}cm\n`);

    // 2. VERIFICAR SE JÁ TEM PLANO
    console.log('📋 Verificando plano existente...');
    const planoCheckRes = await fetch(`${SUPABASE_URL}/rest/v1/vitalis_meal_plans?user_id=eq.${NAZIRA_ID}&select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const planosExistentes = await planoCheckRes.json();

    if (planosExistentes && planosExistentes.length > 0) {
      console.log('   ⚠️  Já existe plano! (pode estar inativo)\n');
    } else {
      console.log('   ℹ️  Sem plano existente\n');
    }

    // 3. INSTRUÇÕES PARA GERAR PLANO
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALTURA CORRIGIDA COM SUCESSO!\n');
    console.log('🎯 PRÓXIMO PASSO - GERAR PLANO:');
    console.log('───────────────────────────────────────────────────────');
    console.log('OPÇÃO A: Via Coach Dashboard');
    console.log('   1. Aceder /vitalis/coach');
    console.log('   2. Procurar "Nazira"');
    console.log('   3. Clicar "Gerar Plano"\n');
    console.log('OPÇÃO B: Via Console do Browser');
    console.log('   1. Abrir /vitalis/dashboard');
    console.log('   2. Abrir Console (F12)');
    console.log('   3. Executar:');
    console.log(`      const { gerarPlanoAutomatico } = await import('./lib/vitalis/planoGenerator.js');`);
    console.log(`      await gerarPlanoAutomatico('${NAZIRA_ID}');\n`);
    console.log('OPÇÃO C: Pedir à Nazira para fazer logout/login');
    console.log('   (sistema vai detectar intake completo e gerar plano)');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message, '\n');
    process.exit(1);
  }
}

// Executar
const [,, key, altura] = process.argv;
corrigirNazira(key, altura);
