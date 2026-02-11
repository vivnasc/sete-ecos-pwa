/**
 * MIGRAÇÃO: Corrige todos os vitalis_clients com status null/novo
 * que já têm intake e/ou meal_plan
 *
 * Uso: https://app.seteecos.com/api/fix-clients-status
 * Executa UMA VEZ após deploy
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Buscar TODOS os vitalis_clients com status null ou 'novo'
    const { data: broken, error: fetchError } = await supabase
      .from('vitalis_clients')
      .select('id, user_id, status, subscription_status')
      .or('status.is.null,status.eq.novo');

    if (fetchError) throw fetchError;

    if (!broken || broken.length === 0) {
      return res.status(200).json({ mensagem: 'Nenhum registo para corrigir. Tudo OK.', corrigidos: 0 });
    }

    const resultados = [];

    for (const client of broken) {
      // Corrigir status para 'activo'
      const { error: updateError } = await supabase
        .from('vitalis_clients')
        .update({ status: 'activo' })
        .eq('id', client.id);

      resultados.push({
        client_id: client.id,
        user_id: client.user_id,
        status_antigo: client.status,
        subscription_status: client.subscription_status,
        corrigido: !updateError,
        erro: updateError?.message || null
      });
    }

    const corrigidos = resultados.filter(r => r.corrigido).length;

    return res.status(200).json({
      mensagem: `${corrigidos}/${broken.length} registos corrigidos com sucesso.`,
      corrigidos,
      total: broken.length,
      detalhes: resultados
    });

  } catch (err) {
    console.error('Erro na migração:', err);
    return res.status(500).json({ erro: err.message });
  }
}
