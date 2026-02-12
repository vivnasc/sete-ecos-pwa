#!/usr/bin/env node

/**
 * SCRIPT DE AJUDA - Diagnóstico Nazira
 * Mostra instruções e exemplos de uso
 */

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
  console.log('\n' + '='.repeat(70));
  log(title, 'bold');
  console.log('='.repeat(70));
}

section('🚨 DIAGNÓSTICO URGENTE - CLIENTE NAZIRA');

log('\n📋 SITUAÇÃO:', 'cyan');
console.log('  • Cliente PAGOU pela subscrição');
console.log('  • Preencheu intake mas deu erro');
console.log('  • Sistema pede intake de novo = DESMORALIZANTE');
console.log('  • Plano NÃO foi gerado');

section('🔧 FERRAMENTAS DISPONÍVEIS');

log('\n1. diagnostico-nazira-fetch.js (RECOMENDADO)', 'green');
console.log('   Diagnóstico completo usando fetch puro');
console.log('   Uso: node diagnostico-nazira-fetch.js <CHAVE_SUPABASE>');

log('\n2. diagnostico-nazira.js', 'green');
console.log('   Diagnóstico completo usando SDK Supabase');
console.log('   Uso: node diagnostico-nazira.js <CHAVE_SUPABASE>');

log('\n3. corrigir-intake.js', 'green');
console.log('   Corrige dados faltando no intake');
console.log('   Uso: node corrigir-intake.js <CHAVE> <USER_ID> <idade> <altura>');

section('📖 DOCUMENTAÇÃO');

console.log('\n  • URGENTE-NAZIRA.md       - Resumo executivo');
console.log('  • COMO-EXECUTAR.md        - Guia passo a passo');
console.log('  • DIAGNOSTICO-README.md   - Documentação técnica');

section('🚀 INÍCIO RÁPIDO');

log('\nPASSO 1: Obter chave Supabase', 'yellow');
console.log('  1. Acesse: https://supabase.com/dashboard');
console.log('  2. Projeto: vvvdtogvlutrybultffx');
console.log('  3. Settings → API');
console.log('  4. Copie a chave "anon public"');

log('\nPASSO 2: Executar diagnóstico', 'yellow');
console.log('  $ node diagnostico-nazira-fetch.js SUA_CHAVE_AQUI');

log('\nPASSO 3: Analisar output', 'yellow');
console.log('  Procure por:');
console.log('  ✅ Intake completo: SIM/NÃO');
console.log('  ✅ Subscrição ativa: SIM/NÃO');
console.log('  ❌ Plano gerado: SIM/NÃO');

section('💡 EXEMPLOS');

log('\n# Diagnóstico:', 'cyan');
console.log('node diagnostico-nazira-fetch.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

log('\n# Correção (se precisar):', 'cyan');
console.log('node corrigir-intake.js CHAVE 123e4567-e89b 30 165');
console.log('                        ^     ^              ^  ^');
console.log('                        |     |              |  altura (cm)');
console.log('                        |     |              idade (anos)');
console.log('                        |     user_id (do diagnóstico)');
console.log('                        chave Supabase');

section('⚠️  IMPORTANTE');

log('\nTempo estimado: 10 minutos', 'green');
log('Prioridade: URGENTE - Cliente pagante esperando!', 'red');

console.log('\n📞 Após resolver:');
console.log('  1. Notificar Vivianne (owner)');
console.log('  2. Notificar Nazira (cliente)');
console.log('  3. Testar acesso dela');

section('📂 ARQUIVOS CRIADOS');

console.log(`
  /home/user/sete-ecos-pwa/
  ├── diagnostico-nazira-fetch.js  ⭐ Execute este
  ├── diagnostico-nazira.js
  ├── corrigir-intake.js
  ├── ajuda.js                     ← Você está aqui
  ├── URGENTE-NAZIRA.md
  ├── COMO-EXECUTAR.md
  └── DIAGNOSTICO-README.md
`);

section('🎯 PRÓXIMA AÇÃO');

log('\nExecute AGORA:', 'bold');
log('node diagnostico-nazira-fetch.js <SUA_CHAVE_SUPABASE>', 'green');

console.log('\n');
