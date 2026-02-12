#!/usr/bin/env node

/**
 * TESTE DE CONEXÃO SUPABASE
 * Verifica se a chave e conexão estão funcionando
 * USO: node testar-conexao.js <CHAVE_SUPABASE>
 */

const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';
const SUPABASE_KEY = process.argv[2] || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ ERRO: Chave não fornecida!');
  console.error('USO: node testar-conexao.js <CHAVE>');
  process.exit(1);
}

console.log('🔌 TESTANDO CONEXÃO SUPABASE');
console.log('=============================\n');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Chave: ${SUPABASE_KEY.substring(0, 20)}...${SUPABASE_KEY.slice(-10)}\n`);

async function testar() {
  try {
    // Teste 1: Conexão básica
    console.log('Teste 1: Verificando conexão...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('✅ Conexão OK\n');
    
    // Teste 2: Acessar tabela users
    console.log('Teste 2: Consultando tabela users...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`HTTP ${usersResponse.status}: ${usersResponse.statusText}`);
    }
    
    const users = await usersResponse.json();
    console.log(`✅ Acesso à tabela users OK (${users.length} registro(s) retornado(s))\n`);
    
    // Teste 3: Contar usuárias
    console.log('Teste 3: Contando total de usuárias...');
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    const countHeader = countResponse.headers.get('content-range');
    const totalUsers = countHeader ? countHeader.split('/')[1] : 'desconhecido';
    console.log(`✅ Total de usuárias: ${totalUsers}\n`);
    
    // Resumo
    console.log('='.repeat(50));
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(50));
    console.log('\nVocê pode agora executar o diagnóstico:');
    console.log(`node diagnostico-nazira-fetch.js ${SUPABASE_KEY.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nVerifique:');
    console.error('1. A chave está correta e completa');
    console.error('2. Você tem conexão com a internet');
    console.error('3. O projeto Supabase está ativo');
    process.exit(1);
  }
}

testar();
