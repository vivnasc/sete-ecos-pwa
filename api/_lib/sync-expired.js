/**
 * SYNC EXPIRED — Marca subscrições expiradas automaticamente
 *
 * Cron diário (7h GMT / 9h CAT): percorre TODAS as tabelas de clientes
 * e actualiza subscription_status para 'expired' quando:
 *   - status = 'active' e subscription_expires < agora
 *   - status = 'trial' e subscription_expires < agora (ou trial_started + 7 dias < agora)
 *
 * Isto garante que o painel da coach mostra o status correcto
 * mesmo que o cliente não faça login (onde checkEcoAccess faria a verificação).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ECO_TABLES = [
  'vitalis_clients',
  'aurea_clients',
  'serena_clients',
  'ignis_clients',
  'ventis_clients',
  'ecoa_clients',
  'imago_clients',
];

async function syncExpiredSubscriptions() {
  const agora = new Date().toISOString();
  const resultados = {};

  for (const table of ECO_TABLES) {
    let expirados = 0;

    // 1. Active com subscription_expires no passado
    const { data: activeExpired, error: err1 } = await supabase
      .from(table)
      .select('id, user_id, subscription_status, subscription_expires')
      .eq('subscription_status', 'active')
      .not('subscription_expires', 'is', null)
      .lt('subscription_expires', agora);

    if (!err1 && activeExpired?.length > 0) {
      const ids = activeExpired.map(c => c.id);
      const { error: updateErr } = await supabase
        .from(table)
        .update({
          subscription_status: 'expired',
          subscription_updated: agora
        })
        .in('id', ids);

      if (!updateErr) {
        expirados += ids.length;
        console.log(`✅ ${table}: ${ids.length} active → expired`);
      } else {
        console.error(`❌ ${table} update active:`, updateErr.message);
      }
    }

    // 2. Trial com subscription_expires no passado
    const { data: trialExpired, error: err2 } = await supabase
      .from(table)
      .select('id, user_id, subscription_status, subscription_expires, trial_started')
      .eq('subscription_status', 'trial')
      .not('subscription_expires', 'is', null)
      .lt('subscription_expires', agora);

    if (!err2 && trialExpired?.length > 0) {
      const ids = trialExpired.map(c => c.id);
      const { error: updateErr } = await supabase
        .from(table)
        .update({
          subscription_status: 'expired',
          subscription_updated: agora
        })
        .in('id', ids);

      if (!updateErr) {
        expirados += ids.length;
        console.log(`✅ ${table}: ${ids.length} trial → expired (via subscription_expires)`);
      } else {
        console.error(`❌ ${table} update trial:`, updateErr.message);
      }
    }

    // 3. Trial sem subscription_expires mas com trial_started > 7 dias atrás
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trialOld, error: err3 } = await supabase
      .from(table)
      .select('id, user_id, subscription_status, trial_started')
      .eq('subscription_status', 'trial')
      .is('subscription_expires', null)
      .not('trial_started', 'is', null)
      .lt('trial_started', seteDiasAtras);

    if (!err3 && trialOld?.length > 0) {
      const ids = trialOld.map(c => c.id);
      const { error: updateErr } = await supabase
        .from(table)
        .update({
          subscription_status: 'expired',
          subscription_updated: agora
        })
        .in('id', ids);

      if (!updateErr) {
        expirados += ids.length;
        console.log(`✅ ${table}: ${ids.length} trial → expired (via trial_started + 7d)`);
      } else {
        console.error(`❌ ${table} update old trial:`, updateErr.message);
      }
    }

    resultados[table] = expirados;
  }

  return resultados;
}

export default async function handler(req, res) {
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  try {
    console.log('🔄 Sync expired: iniciando...');
    const resultados = await syncExpiredSubscriptions();
    const total = Object.values(resultados).reduce((a, b) => a + b, 0);

    console.log(`🔄 Sync expired: ${total} subscrições marcadas como expiradas`);

    res.status(200).json({
      success: true,
      message: `${total} subscrições actualizadas para expired`,
      resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Sync expired erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
