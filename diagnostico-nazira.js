#!/usr/bin/env node

/**
 * DIAGNÓSTICO URGENTE - NAZIRA
 * Script para investigar estado completo do registo da cliente no Supabase
 * 
 * USO: node diagnostico-nazira.js <SUPABASE_ANON_KEY>
 * OU: VITE_SUPABASE_ANON_KEY=xxx node diagnostico-nazira.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co';
const SUPABASE_KEY = process.argv[2] || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ ERRO: Chave Supabase não fornecida!');
  console.error('\nUSO:');
  console.error('  node diagnostico-nazira.js <SUPABASE_ANON_KEY>');
  console.error('  OU');
  console.error('  VITE_SUPABASE_ANON_KEY=xxx node diagnostico-nazira.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bold');
  console.log('='.repeat(80));
}

function subsection(title) {
  console.log('\n' + '-'.repeat(60));
  log(title, 'cyan');
  console.log('-'.repeat(60));
}

async function diagnosticarNazira() {
  try {
    section('🔍 DIAGNÓSTICO COMPLETO - CLIENTE NAZIRA');
    log(`Conectando ao Supabase: ${SUPABASE_URL}`, 'blue');
    
    // 1. BUSCAR USUÁRIA POR EMAIL/NOME
    subsection('1. BUSCAR USUÁRIA');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .or('email.ilike.%nazira%,nome.ilike.%nazira%');
    
    if (userError) {
      log(`❌ Erro ao buscar usuária: ${userError.message}`, 'red');
      log('Tentando buscar todas as usuárias recentes...', 'yellow');
      
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (allError) {
        log(`❌ Erro ao buscar usuárias: ${allError.message}`, 'red');
        return;
      }
      
      if (allUsers && allUsers.length > 0) {
        log('\n📋 Últimas 10 usuárias registradas:', 'blue');
        allUsers.forEach((u, i) => {
          console.log(`${i + 1}. ${u.nome || 'Sem nome'} (${u.email}) - ID: ${u.id}`);
        });
      }
      return;
    }

    if (!users || users.length === 0) {
      log('❌ NENHUMA USUÁRIA ENCONTRADA COM "NAZIRA"', 'red');
      log('Tentando buscar todas as usuárias recentes...', 'yellow');
      
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (allUsers && allUsers.length > 0) {
        log('\n📋 Últimas 10 usuárias registradas:', 'blue');
        allUsers.forEach((u, i) => {
          console.log(`${i + 1}. ${u.nome || 'Sem nome'} (${u.email}) - ID: ${u.id}`);
        });
      }
      return;
    }

    log(`✅ Encontrada(s) ${users.length} usuária(s)`, 'green');
    
    // Para cada usuária encontrada, fazer diagnóstico completo
    for (const user of users) {
      await diagnosticarUsuaria(user);
    }

  } catch (error) {
    log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
    console.error(error);
  }
}

async function diagnosticarUsuaria(user) {
  const userId = user.id;
  
  subsection(`👤 USUÁRIA: ${user.nome || 'Sem nome'} (${user.email})`);
  
  log('\n📋 DADOS BÁSICOS:', 'blue');
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    nome: user.nome,
    genero: user.genero,
    created_at: user.created_at,
    updated_at: user.updated_at
  }, null, 2));

  // 2. VITALIS INTAKE
  subsection('2. VITALIS INTAKE (Dados Antropométricos)');
  
  const { data: intake, error: intakeError } = await supabase
    .from('vitalis_intake')
    .select('*')
    .eq('user_id', userId);
  
  if (intakeError) {
    log(`❌ Erro ao buscar intake: ${intakeError.message}`, 'red');
  } else if (!intake || intake.length === 0) {
    log('❌ NENHUM INTAKE ENCONTRADO', 'red');
  } else {
    log(`✅ Encontrado(s) ${intake.length} registo(s) de intake`, 'green');
    intake.forEach((int, idx) => {
      console.log(`\n--- Registo ${idx + 1} ---`);
      console.log(JSON.stringify({
        id: int.id,
        nome: int.nome,
        idade: int.idade,
        altura_cm: int.altura_cm,
        peso_actual: int.peso_actual,
        peso_desejado: int.peso_desejado,
        nivel_atividade: int.nivel_atividade,
        objetivo: int.objetivo,
        restricoes_alimentares: int.restricoes_alimentares,
        condicoes_saude: int.condicoes_saude,
        created_at: int.created_at,
        updated_at: int.updated_at
      }, null, 2));
      
      // Verificar campos obrigatórios
      const camposFaltando = [];
      if (!int.nome) camposFaltando.push('nome');
      if (!int.idade) camposFaltando.push('idade');
      if (!int.altura_cm) camposFaltando.push('altura_cm');
      if (!int.peso_actual) camposFaltando.push('peso_actual');
      
      if (camposFaltando.length > 0) {
        log(`\n⚠️  CAMPOS OBRIGATÓRIOS FALTANDO: ${camposFaltando.join(', ')}`, 'yellow');
      } else {
        log('\n✅ TODOS OS CAMPOS OBRIGATÓRIOS PREENCHIDOS', 'green');
      }
    });
  }

  // 3. VITALIS CLIENTS (Subscrição)
  subsection('3. VITALIS CLIENTS (Status Subscrição)');
  
  const { data: clients, error: clientsError } = await supabase
    .from('vitalis_clients')
    .select('*')
    .eq('user_id', userId);
  
  if (clientsError) {
    log(`❌ Erro ao buscar subscrição: ${clientsError.message}`, 'red');
  } else if (!clients || clients.length === 0) {
    log('❌ NENHUMA SUBSCRIÇÃO ENCONTRADA', 'red');
  } else {
    log(`✅ Encontrada(s) ${clients.length} subscrição(ões)`, 'green');
    clients.forEach((client, idx) => {
      console.log(`\n--- Subscrição ${idx + 1} ---`);
      console.log(JSON.stringify({
        id: client.id,
        subscription_status: client.subscription_status,
        subscription_type: client.subscription_type,
        subscription_start: client.subscription_start,
        subscription_end: client.subscription_end,
        payment_method: client.payment_method,
        created_at: client.created_at
      }, null, 2));
      
      if (client.subscription_status === 'active') {
        log('\n✅ SUBSCRIÇÃO ATIVA!', 'green');
      } else {
        log(`\n⚠️  Status: ${client.subscription_status}`, 'yellow');
      }
    });
  }

  // 4. VITALIS MEAL PLANS
  subsection('4. VITALIS MEAL PLANS (Plano Gerado?)');
  
  const { data: plans, error: plansError } = await supabase
    .from('vitalis_meal_plans')
    .select('*')
    .eq('user_id', userId);
  
  if (plansError) {
    log(`❌ Erro ao buscar planos: ${plansError.message}`, 'red');
  } else if (!plans || plans.length === 0) {
    log('❌ NENHUM PLANO ALIMENTAR GERADO', 'red');
  } else {
    log(`✅ Encontrado(s) ${plans.length} plano(s) alimentar(es)`, 'green');
    plans.forEach((plan, idx) => {
      console.log(`\n--- Plano ${idx + 1} ---`);
      console.log(JSON.stringify({
        id: plan.id,
        start_date: plan.start_date,
        end_date: plan.end_date,
        status: plan.status,
        total_days: plan.total_days,
        created_at: plan.created_at
      }, null, 2));
    });
  }

  // 5. VITALIS PAYMENT SUBMISSIONS
  subsection('5. VITALIS PAYMENT SUBMISSIONS (Confirmações de Pagamento)');
  
  const { data: payments, error: paymentsError } = await supabase
    .from('vitalis_payment_submissions')
    .select('*')
    .eq('user_id', userId);
  
  if (paymentsError) {
    log(`❌ Erro ao buscar pagamentos: ${paymentsError.message}`, 'red');
  } else if (!payments || payments.length === 0) {
    log('⚠️  Nenhuma submissão de pagamento encontrada', 'yellow');
  } else {
    log(`✅ Encontrada(s) ${payments.length} submissão(ões) de pagamento`, 'green');
    payments.forEach((payment, idx) => {
      console.log(`\n--- Pagamento ${idx + 1} ---`);
      console.log(JSON.stringify({
        id: payment.id,
        subscription_type: payment.subscription_type,
        payment_method: payment.payment_method,
        payment_proof_url: payment.payment_proof_url,
        status: payment.status,
        created_at: payment.created_at,
        approved_at: payment.approved_at
      }, null, 2));
    });
  }

  // 6. RESUMO E DIAGNÓSTICO
  section('📊 RESUMO DO DIAGNÓSTICO');
  
  const temIntake = intake && intake.length > 0;
  const intakeCompleto = temIntake && intake[0].nome && intake[0].idade && intake[0].altura_cm && intake[0].peso_actual;
  const temSubscricao = clients && clients.length > 0;
  const subscricaoAtiva = temSubscricao && clients[0].subscription_status === 'active';
  const temPlano = plans && plans.length > 0;
  const temPagamento = payments && payments.length > 0;
  
  console.log('\n');
  log(`Intake preenchido: ${temIntake ? '✅' : '❌'}`, temIntake ? 'green' : 'red');
  log(`Intake completo: ${intakeCompleto ? '✅' : '❌'}`, intakeCompleto ? 'green' : 'red');
  log(`Subscrição criada: ${temSubscricao ? '✅' : '❌'}`, temSubscricao ? 'green' : 'red');
  log(`Subscrição ativa: ${subscricaoAtiva ? '✅' : '❌'}`, subscricaoAtiva ? 'green' : 'red');
  log(`Plano gerado: ${temPlano ? '✅' : '❌'}`, temPlano ? 'green' : 'red');
  log(`Pagamento registado: ${temPagamento ? '✅' : '❌'}`, temPagamento ? 'green' : 'red');
  
  console.log('\n');
  
  if (!intakeCompleto && temSubscricao) {
    log('🚨 PROBLEMA IDENTIFICADO:', 'red');
    log('Cliente TEM subscrição mas intake está INCOMPLETO', 'red');
    log('Sistema vai pedir intake de novo → DESMORALIZANTE!', 'red');
    console.log('\nSOLUÇÃO NECESSÁRIA:');
    console.log('1. Completar dados do intake manualmente OU');
    console.log('2. Ajustar validação para aceitar dados parciais OU');
    console.log('3. Gerar plano com dados disponíveis');
  }
  
  if (subscricaoAtiva && !temPlano) {
    log('\n🚨 PROBLEMA CRÍTICO:', 'red');
    log('Cliente PAGOU (subscrição ativa) mas NÃO TEM PLANO!', 'red');
    console.log('\nAÇÃO URGENTE: Gerar plano alimentar imediatamente!');
  }
  
  if (temIntake && intakeCompleto && subscricaoAtiva && !temPlano) {
    log('\n✅ DADOS SUFICIENTES PARA GERAR PLANO', 'green');
    console.log('Pode proceder com geração do plano alimentar.');
  }
}

// Executar
diagnosticarNazira().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
