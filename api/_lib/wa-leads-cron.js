/**
 * WhatsApp Leads Follow-Up — Cron Semanal
 *
 * Envia mensagem automática de follow-up a leads que:
 * 1. Contactaram via WhatsApp (chatbot_mensagens)
 * 2. Não são clientes activos
 * 3. Não receberam follow-up nos últimos 7 dias
 *
 * Usa Meta Template "sete_ecos_follow_up" para funcionar fora das 24h.
 *
 * Configurar no vercel.json:
 * { "path": "/api/cron?task=wa-leads", "schedule": "0 10 * * 1" }  // Segunda 10h
 */

import { createClient } from '@supabase/supabase-js';
import { enviarMensagemWA, listarContactosWA } from './whatsapp-broadcast.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export async function waLeadsFollowUp(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Buscar contactos
    const { contactos } = await listarContactosWA(supabase);

    // Filtrar: leads que mostraram interesse mas não converteram
    const leads = contactos.filter(c => c.tipo === 'lead');

    // Verificar quais já receberam follow-up nos últimos 7 dias
    const seteDisAtras = new Date();
    seteDisAtras.setDate(seteDisAtras.getDate() - 7);

    let leadsParaContactar = [];

    for (const lead of leads) {
      // Verificar log de broadcast
      let jaContactado = false;
      try {
        const { data: logs } = await supabase
          .from('whatsapp_broadcast_log')
          .select('id')
          .eq('telefone', lead.telefone.replace(/[^0-9]/g, ''))
          .gte('created_at', seteDisAtras.toISOString())
          .limit(1);

        jaContactado = logs && logs.length > 0;
      } catch (_) {
        // Tabela pode não existir — enviar para todos
      }

      if (!jaContactado) {
        leadsParaContactar.push(lead);
      }
    }

    // Limitar a 20 leads por execução (evitar timeout de 10s do Vercel)
    leadsParaContactar = leadsParaContactar.slice(0, 20);

    if (leadsParaContactar.length === 0) {
      return res.status(200).json({
        message: 'Nenhum lead novo para contactar esta semana',
        total_leads: leads.length,
        filtrados: 0,
      });
    }

    const resultados = { enviados: 0, erros: [], total: leadsParaContactar.length };

    for (let i = 0; i < leadsParaContactar.length; i++) {
      const lead = leadsParaContactar[i];

      // Escolher template baseado no interesse do lead
      let template = 'follow_up';
      if (lead.interessou_precos) template = 'promo';
      else if (lead.interessou_vitalis) template = 'convite_trial';

      const result = await enviarMensagemWA(lead.telefone, '', {
        template,
        nome: lead.nome || '',
      });

      if (result.ok) {
        resultados.enviados++;
      } else {
        resultados.erros.push({ numero: lead.telefone, erro: result.error });
      }

      // Log
      try {
        await supabase.from('whatsapp_broadcast_log').insert({
          telefone: lead.telefone.replace(/[^0-9]/g, ''),
          mensagem: `[cron:wa-leads][template:${template}]`,
          tipo: 'cron-wa-leads',
          status: result.ok ? 'enviado' : 'erro',
          erro: result.ok ? null : result.error,
          message_id: result.messageId || null,
        });
      } catch (_) { /* tabela pode não existir */ }

      // Rate limit
      if (i < leadsParaContactar.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    console.log(`[wa-leads] Follow-up: ${resultados.enviados}/${resultados.total} enviados`);

    return res.status(200).json({
      message: `Follow-up semanal: ${resultados.enviados}/${resultados.total} leads contactados`,
      ...resultados,
      total_leads: leads.length,
    });

  } catch (error) {
    console.error('[wa-leads] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
