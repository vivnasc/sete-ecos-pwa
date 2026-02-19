/**
 * WhatsApp Sequência Automática — Cron Diário
 *
 * Espelha a sequência de emails (email-sequencia.js) mas via WhatsApp.
 * Para cada lead da waitlist que tenha telefone, envia a mensagem
 * correspondente ao dia desde registo via Meta Template.
 *
 * Sequência (= emails):
 *   Dia 0  — Boas-vindas + Lumina
 *   Dia 3  — Convite Lumina
 *   Dia 7  — 3 Sinais
 *   Dia 10 — Segredo (emoção vs fome)
 *   Dia 14 — Convite VITALIS + VEMVITALIS20
 *   Dia 21 — Testemunho + código
 *   Dia 30 — Última chance + código
 *
 * Corre diariamente às 11h (1h depois dos emails das 10h).
 * Limite: 20 mensagens por execução (rate limit Meta + timeout Vercel).
 */

import { createClient } from '@supabase/supabase-js';
import { enviarMensagemWA } from './whatsapp-broadcast.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Mapeamento: dia → template Meta
const SEQUENCIA_WA = [
  { dia: 0,  template: 'boas_vindas' },
  { dia: 3,  template: 'convite_lumina' },
  { dia: 7,  template: 'tres_sinais' },
  { dia: 10, template: 'segredo' },
  { dia: 14, template: 'convite_trial' },
  { dia: 21, template: 'testemunho' },
  { dia: 30, template: 'ultima_chance' },
];

export async function waSequenciaCron(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resultados = { enviados: 0, ignorados: 0, erros: [], detalhes: [] };

  try {
    // 1. Buscar leads da waitlist que tenham telefone
    const { data: waitlist, error: wlError } = await supabase
      .from('waitlist')
      .select('id, nome, email, telefone, created_at');

    if (wlError) {
      return res.status(200).json({
        message: 'Tabela waitlist não disponível: ' + wlError.message,
        ...resultados,
      });
    }

    // Filtrar só quem tem telefone
    const leadsComTel = (waitlist || []).filter(l => l.telefone && l.telefone.trim());

    if (leadsComTel.length === 0) {
      return res.status(200).json({
        message: 'Nenhum lead com telefone na waitlist',
        ...resultados,
      });
    }

    const hoje = new Date();
    let enviosPendentes = [];

    // 2. Para cada lead, verificar se há mensagem para enviar hoje
    for (const lead of leadsComTel) {
      const diasDesdeRegisto = Math.floor(
        (hoje - new Date(lead.created_at)) / (1000 * 60 * 60 * 24)
      );

      const passo = SEQUENCIA_WA.find(s => s.dia === diasDesdeRegisto);
      if (!passo) continue;

      // Verificar se já foi enviado (deduplicação)
      let jaEnviado = false;
      try {
        const { data: logs } = await supabase
          .from('whatsapp_broadcast_log')
          .select('id')
          .eq('telefone', lead.telefone.replace(/[^0-9]/g, ''))
          .eq('tipo', 'cron-wa-sequencia')
          .like('mensagem', `%dia:${passo.dia}%`)
          .limit(1);

        jaEnviado = logs && logs.length > 0;
      } catch (_) {
        // Tabela pode não existir — continuar sem deduplicação
      }

      if (jaEnviado) {
        resultados.ignorados++;
        continue;
      }

      enviosPendentes.push({ lead, passo });
    }

    // 3. Limitar a 20 por execução
    enviosPendentes = enviosPendentes.slice(0, 20);

    if (enviosPendentes.length === 0) {
      return res.status(200).json({
        message: 'Nenhuma mensagem WA para enviar hoje',
        total_leads_com_tel: leadsComTel.length,
        ignorados: resultados.ignorados,
      });
    }

    // 4. Enviar
    for (let i = 0; i < enviosPendentes.length; i++) {
      const { lead, passo } = enviosPendentes[i];
      const nome = lead.nome || '';

      const result = await enviarMensagemWA(lead.telefone, '', {
        template: passo.template,
        nome,
      });

      const detalhe = {
        telefone: lead.telefone.replace(/[^0-9]/g, ''),
        nome,
        dia: passo.dia,
        template: passo.template,
        ok: result.ok,
      };

      if (result.ok) {
        resultados.enviados++;
      } else {
        detalhe.erro = result.error;
        resultados.erros.push({ numero: lead.telefone, dia: passo.dia, erro: result.error });
      }

      resultados.detalhes.push(detalhe);

      // Log no Supabase
      try {
        await supabase.from('whatsapp_broadcast_log').insert({
          telefone: lead.telefone.replace(/[^0-9]/g, ''),
          mensagem: `[cron:wa-sequencia][dia:${passo.dia}][template:${passo.template}]`,
          tipo: 'cron-wa-sequencia',
          status: result.ok ? 'enviado' : 'erro',
          erro: result.ok ? null : result.error,
          message_id: result.messageId || null,
        });
      } catch (_) { /* tabela pode não existir */ }

      // Rate limit: 3s entre mensagens
      if (i < enviosPendentes.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    console.log(`[wa-sequencia] ${resultados.enviados}/${enviosPendentes.length} enviados`);

    return res.status(200).json({
      message: `Sequência WA: ${resultados.enviados}/${enviosPendentes.length} enviados`,
      total_leads_com_tel: leadsComTel.length,
      ...resultados,
    });

  } catch (error) {
    console.error('[wa-sequencia] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
