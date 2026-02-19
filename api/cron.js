/**
 * Cron Dispatcher — Endpoint único para todas as tarefas agendadas
 *
 * Consolida cron jobs num único endpoint para respeitar o limite de
 * serverless functions do plano Hobby do Vercel.
 *
 * Uso via vercel.json crons:
 *   /api/cron?task=tarefas         → Lembretes + curiosidade + expiração + resumo coach
 *   /api/cron?task=trial-emails    → Emails de trial expirando
 *   /api/cron?task=email-sequencia → Sequência de nurturing (waitlist) c/ VEMVITALIS20
 *   /api/cron?task=instagram       → Publicações agendadas Instagram
 *   /api/cron?task=broadcast       → Broadcast para interessados (catálogo, promo, whatsapp)
 *   /api/cron?task=wa-leads        → WhatsApp follow-up semanal a leads não convertidos
 *   /api/cron?task=wa-sequencia    → Sequência WA automática (dia 0,3,7,10,14,21,30)
 */

import tarefasAgendadas from './_lib/tarefas-agendadas.js';
import trialExpiringEmails from './_lib/trial-expiring-emails.js';
import emailSequencia from './_lib/email-sequencia.js';
import instagramSchedule from './_lib/instagram-schedule.js';
import broadcastInteressados from './_lib/broadcast-interessados.js';
import { waLeadsFollowUp } from './_lib/wa-leads-cron.js';
import { waSequenciaCron } from './_lib/wa-sequencia-cron.js';

export default async function handler(req, res) {
  // Verificar autorização (cron jobs do Vercel)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (!req.headers['x-vercel-cron']) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }

  const task = req.query?.task;

  if (!task) {
    return res.status(400).json({
      error: 'Parâmetro task obrigatório',
      opcoes: ['tarefas', 'trial-emails', 'email-sequencia', 'instagram', 'broadcast']
    });
  }

  try {
    switch (task) {
      case 'tarefas':
        return await tarefasAgendadas(req, res);
      case 'trial-emails':
        return await trialExpiringEmails(req, res);
      case 'email-sequencia':
        return await emailSequencia(req, res);
      case 'instagram':
        return await instagramSchedule(req, res);
      case 'broadcast':
        return await broadcastInteressados(req, res);
      case 'wa-leads':
        return await waLeadsFollowUp(req, res);
      case 'wa-sequencia':
        return await waSequenciaCron(req, res);
      default:
        return res.status(400).json({
          error: `Task desconhecida: ${task}`,
          opcoes: ['tarefas', 'trial-emails', 'email-sequencia', 'instagram', 'broadcast', 'wa-leads', 'wa-sequencia']
        });
    }
  } catch (error) {
    console.error(`Erro no cron task=${task}:`, error);
    return res.status(500).json({
      error: 'Erro ao executar tarefa cron',
      task,
      detalhes: error.message
    });
  }
}
