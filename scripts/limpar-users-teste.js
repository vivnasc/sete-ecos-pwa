import { createClient } from '@supabase/supabase-js';

// Hardcoded for quick cleanup (from Vercel env vars)
const SUPABASE_URL = 'https://vvvdtogvlutrybultffx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dmR0b2d2bHV0cnlidWx0ZmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MDAzNTksImV4cCI6MjA1NDE3NjM1OX0.bZPLSLkJ0IgwCOuPWS3zz51rJNJYbWMJB4QI9fW1Ilk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EMAILS_PARA_LIMPAR = [
  'vivianne.saraiva@bancomoc.mz',
  'vivianne-nascimento@outlook.com'
];

async function limparDadosVitalis() {
  console.log('🧹 Limpando dados de teste do Vitalis...\n');

  for (const email of EMAILS_PARA_LIMPAR) {
    console.log(`\n📧 Processando: ${email}`);
    console.log('='.repeat(60));

    // 1. Buscar user_id pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, nome, email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error(`❌ Erro ao buscar user:`, userError);
      continue;
    }

    if (!user) {
      console.log(`⚠️  User não encontrado na base de dados`);
      continue;
    }

    console.log(`✅ User encontrado: ${user.nome} (ID: ${user.id})`);
    const userId = user.id;

    // 2. Apagar vitalis_meal_plan
    const { data: planos, error: planosDeleteError } = await supabase
      .from('vitalis_meal_plan')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (planosDeleteError) {
      console.error(`❌ Erro ao apagar planos:`, planosDeleteError);
    } else {
      console.log(`  ✓ Apagados ${planos?.length || 0} planos alimentares`);
    }

    // 3. Apagar vitalis_intake
    const { data: intakes, error: intakeDeleteError } = await supabase
      .from('vitalis_intake')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (intakeDeleteError) {
      console.error(`❌ Erro ao apagar intake:`, intakeDeleteError);
    } else {
      console.log(`  ✓ Apagados ${intakes?.length || 0} registos de intake`);
    }

    // 4. Apagar vitalis_checkins
    const { data: checkins, error: checkinsDeleteError } = await supabase
      .from('vitalis_checkins')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (checkinsDeleteError) {
      console.error(`❌ Erro ao apagar checkins:`, checkinsDeleteError);
    } else {
      console.log(`  ✓ Apagados ${checkins?.length || 0} checkins`);
    }

    // 5. Apagar vitalis_alerts
    const { data: alerts, error: alertsDeleteError } = await supabase
      .from('vitalis_alerts')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (alertsDeleteError) {
      console.error(`❌ Erro ao apagar alertas:`, alertsDeleteError);
    } else {
      console.log(`  ✓ Apagados ${alerts?.length || 0} alertas`);
    }

    // 6. Apagar vitalis_subscription_log
    const { data: logs, error: logsDeleteError } = await supabase
      .from('vitalis_subscription_log')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (logsDeleteError) {
      console.error(`❌ Erro ao apagar logs:`, logsDeleteError);
    } else {
      console.log(`  ✓ Apagados ${logs?.length || 0} logs de subscription`);
    }

    // 7. Apagar vitalis_clients (ÚLTIMO - tem foreign keys)
    const { data: client, error: clientDeleteError } = await supabase
      .from('vitalis_clients')
      .delete()
      .eq('user_id', userId)
      .select('subscription_status');

    if (clientDeleteError) {
      console.error(`❌ Erro ao apagar vitalis_clients:`, clientDeleteError);
    } else {
      console.log(`  ✓ Apagado vitalis_clients (status: ${client?.[0]?.subscription_status || 'N/A'})`);
    }

    console.log(`\n✅ Limpeza completa para ${email}!`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Todos os users foram limpos!');
  console.log('💡 Os users ainda podem fazer login (auth não foi apagado)');
  console.log('💡 Podem agora testar como novos users do Vitalis\n');
}

// Executar
limparDadosVitalis().catch(console.error);
