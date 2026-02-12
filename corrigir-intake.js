#!/usr/bin/env node

/**
 * SCRIPT DE CORREÇÃO - Completar Intake da Nazira
 * USO: node corrigir-intake.js <SUPABASE_KEY> <USER_ID> <idade> <altura_cm>
 * Exemplo: node corrigir-intake.js eyJhbGc... uuid-aqui 30 165
 */

const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';
const [,, SUPABASE_KEY, USER_ID, IDADE, ALTURA] = process.argv;

if (!SUPABASE_KEY || !USER_ID || !IDADE || !ALTURA) {
  console.error('❌ ERRO: Parâmetros insuficientes!');
  console.error('\nUSO:');
  console.error('  node corrigir-intake.js <SUPABASE_KEY> <USER_ID> <idade> <altura_cm>');
  console.error('\nEXEMPLO:');
  console.error('  node corrigir-intake.js eyJhbGc... 123e4567-e89b-12d3 30 165');
  process.exit(1);
}

async function corrigirIntake() {
  try {
    console.log('🔧 CORREÇÃO DE INTAKE - NAZIRA');
    console.log('================================\n');
    console.log(`User ID: ${USER_ID}`);
    console.log(`Idade: ${IDADE} anos`);
    console.log(`Altura: ${ALTURA} cm\n`);
    
    // 1. Verificar se intake existe
    const checkUrl = `${SUPABASE_URL}/rest/v1/vitalis_intake?user_id=eq.${USER_ID}&select=*`;
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!checkResponse.ok) {
      throw new Error(`Erro ao verificar intake: ${checkResponse.statusText}`);
    }
    
    const existing = await checkResponse.json();
    
    if (!existing || existing.length === 0) {
      console.log('❌ ERRO: Nenhum intake encontrado para este user_id');
      console.log('Execute primeiro o script de diagnóstico para confirmar o user_id correto');
      process.exit(1);
    }
    
    console.log('✅ Intake encontrado');
    console.log(`ID do intake: ${existing[0].id}\n`);
    
    // 2. Atualizar intake
    console.log('Atualizando campos...');
    
    const updateUrl = `${SUPABASE_URL}/rest/v1/vitalis_intake?user_id=eq.${USER_ID}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        idade: parseInt(IDADE),
        altura_cm: parseFloat(ALTURA),
        updated_at: new Date().toISOString()
      })
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Erro ao atualizar: ${updateResponse.statusText}\n${error}`);
    }
    
    const updated = await updateResponse.json();
    
    console.log('\n✅ INTAKE ATUALIZADO COM SUCESSO!\n');
    console.log('Dados atualizados:');
    console.log(JSON.stringify(updated[0], null, 2));
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Execute novamente o diagnóstico para confirmar');
    console.log('2. Gere o plano alimentar para a cliente');
    console.log('3. Notifique a cliente que o problema foi resolvido');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    process.exit(1);
  }
}

corrigirIntake();
