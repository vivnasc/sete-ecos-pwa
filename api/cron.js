/**
 * Cron Dispatcher — Endpoint unico para todas as tarefas agendadas
 *
 * Consolida cron jobs num unico endpoint para respeitar o limite de
 * serverless functions do plano Hobby do Vercel.
 *
 * Uso via vercel.json crons:
 *   /api/cron?task=tarefas         → Lembretes + curiosidade + expiracao + resumo coach
 *   /api/cron?task=trial-emails    → Emails de trial expirando
 *   /api/cron?task=email-sequencia → Sequencia de nurturing (waitlist) c/ VEMVITALIS20
 *   /api/cron?task=instagram       → Publicacoes agendadas Instagram
 *   /api/cron?task=broadcast       → Broadcast para interessados (catalogo, promo, whatsapp)
 */

import tarefasAgendadas from './_lib/tarefas-agendadas.js';
import trialExpiringEmails from './_lib/trial-expiring-emails.js';
import emailSequencia from './_lib/email-sequencia.js';
import instagramSchedule from './_lib/instagram-schedule.js';
import broadcastInteressados from './_lib/broadcast-interessados.js';

export default async function handler(req, res) {
  // Verificar autorizacao (cron jobs do Vercel)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (!req.headers['x-vercel-cron']) {
      return res.status(401).json({ error: 'Nao autorizado' });
    }
  }

  const task = req.query?.task;

  if (!task) {
    return res.status(400).json({
      error: 'Parametro task obrigatorio',
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
      default:
        return res.status(400).json({
          error: `Task desconhecida: ${task}`,
          opcoes: ['tarefas', 'trial-emails', 'email-sequencia', 'instagram', 'broadcast']
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
