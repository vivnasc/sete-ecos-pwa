#!/usr/bin/env node

/**
 * DIAGNÓSTICO URGENTE - NAZIRA (versão com fetch puro)
 * Script alternativo sem dependência do @supabase/supabase-js
 * 
 * USO: node diagnostico-nazira-fetch.js <SUPABASE_ANON_KEY>
 */

const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';
const SUPABASE_KEY = process.argv[2] || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ ERRO: Chave Supabase não fornecida!');
  console.error('\nUSO: node diagnostico-nazira-fetch.js <SUPABASE_ANON_KEY>');
  process.exit(1);
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function query(table, filters = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  
  for (const [key, value] of Object.entries(filters)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

async function diagnosticar() {
  try {
    section('🔍 DIAGNÓSTICO COMPLETO - CLIENTE NAZIRA');
    log(`Conectando ao Supabase: ${SUPABASE_URL}`, 'blue');
    
    // 1. BUSCAR USUÁRIA
    subsection('1. BUSCAR USUÁRIA');
    
    let users = await query('users', { 'nome': 'ilike.*nazira*' });
    
    if (!users || users.length === 0) {
      // Tentar por email
      users = await query('users', { 'email': 'ilike.*nazira*' });
    }
    
    if (!users || users.length === 0) {
      log('❌ Nenhuma usuária "Nazira" encontrada', 'red');
      log('Buscando últimas 10 usuárias...', 'yellow');
      
      const allUsers = await query('users', { 'order': 'created_at.desc', 'limit': '10' });
      log('\n📋 Últimas 10 usuárias:', 'blue');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.nome || 'Sem nome'} (${u.email}) - ID: ${u.id}`);
      });
      return;
    }
    
    log(`✅ Encontrada(s) ${users.length} usuária(s)`, 'green');
    
    for (const user of users) {
      await diagnosticarUsuaria(user);
    }
    
  } catch (error) {
    log(`❌ ERRO: ${error.message}`, 'red');
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
    created_at: user.created_at
  }, null, 2));
  
  // 2. VITALIS INTAKE
  subsection('2. VITALIS INTAKE');
  
  try {
    const intake = await query('vitalis_intake', { 'user_id': `eq.${userId}` });
    
    if (!intake || intake.length === 0) {
      log('❌ NENHUM INTAKE ENCONTRADO', 'red');
    } else {
      log(`✅ Encontrado(s) ${intake.length} registo(s)`, 'green');
      intake.forEach((int, idx) => {
        console.log(`\n--- Registo ${idx + 1} ---`);
        console.log(JSON.stringify({
          nome: int.nome,
          idade: int.idade,
          altura_cm: int.altura_cm,
          peso_actual: int.peso_actual,
          peso_desejado: int.peso_desejado,
          nivel_atividade: int.nivel_atividade,
          objetivo: int.objetivo
        }, null, 2));
        
        const faltando = [];
        if (!int.nome) faltando.push('nome');
        if (!int.idade) faltando.push('idade');
        if (!int.altura_cm) faltando.push('altura_cm');
        if (!int.peso_actual) faltando.push('peso_actual');
        
        if (faltando.length > 0) {
          log(`\n⚠️  FALTANDO: ${faltando.join(', ')}`, 'yellow');
        } else {
          log('\n✅ COMPLETO', 'green');
        }
      });
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
  
  // 3. VITALIS CLIENTS
  subsection('3. VITALIS CLIENTS (Subscrição)');
  
  try {
    const clients = await query('vitalis_clients', { 'user_id': `eq.${userId}` });
    
    if (!clients || clients.length === 0) {
      log('❌ NENHUMA SUBSCRIÇÃO', 'red');
    } else {
      log(`✅ ${clients.length} subscrição(ões)`, 'green');
      clients.forEach((c, idx) => {
        console.log(`\n--- Subscrição ${idx + 1} ---`);
        console.log(JSON.stringify({
          status: c.subscription_status,
          type: c.subscription_type,
          start: c.subscription_start,
          end: c.subscription_expires
        }, null, 2));
        
        if (c.subscription_status === 'active') {
          log('\n✅ ATIVA!', 'green');
        }
      });
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
  
  // 4. MEAL PLANS
  subsection('4. VITALIS MEAL PLANS');
  
  try {
    const plans = await query('vitalis_meal_plans', { 'user_id': `eq.${userId}` });
    
    if (!plans || plans.length === 0) {
      log('❌ NENHUM PLANO GERADO', 'red');
    } else {
      log(`✅ ${plans.length} plano(s)`, 'green');
      plans.forEach((p, idx) => {
        console.log(`\n--- Plano ${idx + 1} ---`);
        console.log(JSON.stringify({
          start_date: p.start_date,
          end_date: p.end_date,
          status: p.status,
          total_days: p.total_days
        }, null, 2));
      });
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
  
  // 5. PAYMENTS
  subsection('5. VITALIS PAYMENT SUBMISSIONS');
  
  try {
    const payments = await query('vitalis_payment_submissions', { 'user_id': `eq.${userId}` });
    
    if (!payments || payments.length === 0) {
      log('⚠️  Nenhum pagamento registado', 'yellow');
    } else {
      log(`✅ ${payments.length} pagamento(s)`, 'green');
      payments.forEach((p, idx) => {
        console.log(`\n--- Pagamento ${idx + 1} ---`);
        console.log(JSON.stringify({
          type: p.subscription_type,
          method: p.payment_method,
          status: p.status,
          created: p.created_at
        }, null, 2));
      });
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

diagnosticar();
