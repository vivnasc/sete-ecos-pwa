/**
 * Script para debugar o problema da Nazira
 *
 * COMO USAR:
 * 1. Cria ficheiro .env com:
 *    VITE_SUPABASE_URL=https://vvvdtogvlutrybultffx.supabase.co
 *    VITE_SUPABASE_ANON_KEY=<tua_key>
 *
 * 2. Executa: node debug-nazira.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Falta VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugNazira() {
  console.log('\n🔍 A procurar Nazira no Supabase...\n');

  // 1. Procurar na tabela users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .ilike('nome', '%nazira%')
    .or('email.ilike.%nazira%');

  if (usersError) {
    console.error('❌ Erro ao buscar users:', usersError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️ Nenhum user encontrado com nome "Nazira"');
    console.log('\n📋 Vou listar TODOS os users para ver quem existe:\n');

    const { data: allUsers } = await supabase
      .from('users')
      .select('id, nome, email, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    console.table(allUsers);
    return;
  }

  console.log('✅ User(s) encontrado(s):');
  console.table(users);

  // Para cada user, verificar vitalis_clients
  for (const user of users) {
    console.log(`\n🔍 Verificando vitalis_clients para user_id: ${user.id} (${user.nome})\n`);

    const { data: client, error: clientError } = await supabase
      .from('vitalis_clients')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (clientError) {
      console.error('❌ Erro ao buscar vitalis_clients:', clientError);
      continue;
    }

    if (!client) {
      console.log('⚠️ NÃO TEM vitalis_clients! (não completou intake ou houve erro)');
      continue;
    }

    console.log('📊 Dados do vitalis_clients:');
    console.table([client]);

    // Verificar se tem intake
    const { data: intake, error: intakeError } = await supabase
      .from('vitalis_intake')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (intakeError) {
      console.error('❌ Erro ao buscar vitalis_intake:', intakeError);
      continue;
    }

    if (!intake) {
      console.log('⚠️ NÃO TEM vitalis_intake! (não completou questionário)');
    } else {
      console.log('✅ TEM vitalis_intake (completou questionário)');
    }

    // Verificar se tem plano
    const { data: plano, error: planoError } = await supabase
      .from('vitalis_planos')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (planoError) {
      console.error('❌ Erro ao buscar vitalis_planos:', planoError);
      continue;
    }

    if (!plano) {
      console.log('❌ NÃO TEM vitalis_planos! (plano não foi gerado)');
    } else {
      console.log('✅ TEM vitalis_planos:');
      console.log(`   - Fase: ${plano.fase_atual}`);
      console.log(`   - Status: ${plano.status}`);
      console.log(`   - Criado: ${plano.created_at}`);
    }

    // Resumo final
    console.log('\n📋 RESUMO:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Subscription Status: ${client.subscription_status || 'null'}`);
    console.log(`   Tem Intake: ${intake ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Tem Plano: ${plano ? '✅ SIM' : '❌ NÃO'}`);
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Executar
debugNazira().catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
