import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dmR0b2d2bHV0cnlidWx0ZmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MDAzNTksImV4cCI6MjA1NDE3NjM1OX0.bZPLSLkJ0IgwCOuPWS3zz51rJNJYbWMJB4QI9fW1Ilk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Emails de teste para limpar TODOS os dados
const EMAILS_PARA_LIMPAR = [
  'vivianne.saraiva@bancomoc.mz',
  'vivianne-nascimento@outlook.com'
];

// Todas as tabelas associadas ao Vitalis (ordem importa - FK dependencies)
const TABELAS_VITALIS = [
  'vitalis_meal_plan',
  'vitalis_intake',
  'vitalis_checkins',
  'vitalis_registos',
  'vitalis_alerts',
  'vitalis_agua_log',
  'vitalis_espaco_retorno',
  'vitalis_subscription_log',
  'vitalis_email_log',
  'vitalis_fotos_progresso',
  'vitalis_conquistas',
];

// Tabelas Aurea
const TABELAS_AUREA = [
  'aurea_clients',
];

// Tabelas gerais
const TABELAS_GERAIS = [
  'lumina_checkins',
  'email_log',
];

async function limparDadosTeste() {
  console.log('='.repeat(60));
  console.log('  LIMPEZA COMPLETA DE CONTAS DE TESTE');
  console.log('  Sete Ecos PWA');
  console.log('='.repeat(60));

  let totalApagados = 0;

  for (const email of EMAILS_PARA_LIMPAR) {
    console.log(`\n  Processando: ${email}`);
    console.log('-'.repeat(60));

    // Buscar user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, nome, email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error(`  ERRO ao buscar user: ${userError.message}`);
      continue;
    }

    if (!user) {
      console.log(`  User nao encontrado`);
      continue;
    }

    console.log(`  User: ${user.nome} (ID: ${user.id})`);
    const userId = user.id;

    // Limpar todas as tabelas Vitalis
    for (const tabela of TABELAS_VITALIS) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .delete()
          .eq('user_id', userId)
          .select('id');

        if (error) {
          // Tabela pode nao existir - ignorar
          if (!error.message.includes('does not exist')) {
            console.log(`  ${tabela}: ERRO - ${error.message}`);
          }
        } else {
          const count = data?.length || 0;
          if (count > 0) {
            console.log(`  ${tabela}: ${count} registos apagados`);
            totalApagados += count;
          }
        }
      } catch {
        // Ignorar tabelas que nao existem
      }
    }

    // Limpar tabelas Aurea
    for (const tabela of TABELAS_AUREA) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .delete()
          .eq('user_id', userId)
          .select('id');

        if (!error && data?.length > 0) {
          console.log(`  ${tabela}: ${data.length} registos apagados`);
          totalApagados += data.length;
        }
      } catch {
        // Ignorar
      }
    }

    // Limpar tabelas gerais
    for (const tabela of TABELAS_GERAIS) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .delete()
          .eq('user_id', userId)
          .select('id');

        if (!error && data?.length > 0) {
          console.log(`  ${tabela}: ${data.length} registos apagados`);
          totalApagados += data.length;
        }
      } catch {
        // Ignorar
      }
    }

    // Limpar email logs por email (nao por user_id)
    try {
      const { data } = await supabase
        .from('waitlist_email_log')
        .delete()
        .eq('email', email)
        .select('id');

      if (data?.length > 0) {
        console.log(`  waitlist_email_log: ${data.length} registos apagados`);
        totalApagados += data.length;
      }
    } catch {
      // Ignorar
    }

    // ULTIMO: Apagar vitalis_clients (tem FK)
    try {
      const { data, error } = await supabase
        .from('vitalis_clients')
        .delete()
        .eq('user_id', userId)
        .select('subscription_status');

      if (!error && data?.length > 0) {
        console.log(`  vitalis_clients: Apagado (status: ${data[0]?.subscription_status})`);
        totalApagados += data.length;
      }
    } catch {
      // Ignorar
    }

    console.log(`  Limpeza completa para ${email}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  TOTAL: ${totalApagados} registos apagados`);
  console.log('  Auth accounts mantidos (podem re-testar)');
  console.log('='.repeat(60) + '\n');
}

limparDadosTeste().catch(console.error);
