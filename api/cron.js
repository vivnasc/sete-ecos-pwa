// Cron Dispatcher — Endpoint único para todas as tarefas agendadas
//
// Usa imports DINÂMICOS para que um erro de syntax num módulo
// NÃO bloqueie todos os outros crons.
//
// Uso via vercel.json crons:
//   /api/cron?task=tarefas         → Lembretes + curiosidade + expiração + resumo coach
//   /api/cron?task=trial-emails    → Emails de trial expirando
//   /api/cron?task=email-sequencia → Sequência de nurturing (waitlist) c/ VEMVITALIS20
//   /api/cron?task=instagram       → Publicações agendadas Instagram
//   /api/cron?task=broadcast       → Broadcast para interessados (catálogo, promo, whatsapp)
//   /api/cron?task=wa-leads        → WhatsApp follow-up semanal a leads não convertidos
//   /api/cron?task=wa-sequencia    → Sequência WA automática (dia 0,3,7,10,14,21,30)
//   /api/cron?task=push-lembretes&bloco=manha|tarde|noite  → Push notifications 3x/dia

const TASKS = ['tarefas', 'trial-emails', 'email-sequencia', 'instagram', 'broadcast', 'wa-leads', 'wa-sequencia', 'push-lembretes', 'sync-expired'];

export default async function handler(req, res) {
  // Verificar autorização (cron jobs do Vercel)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET não definida — cron jobs bloqueados por segurança');
    return res.status(500).json({ error: 'CRON_SECRET não configurada no Vercel' });
  }

  if (authHeader !== `Bearer ${cronSecret}` && !req.headers['x-vercel-cron']) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const task = req.query?.task;

  if (!task) {
    return res.status(400).json({
      error: 'Parâmetro task obrigatório',
      opcoes: TASKS,
      health: 'OK',
      timestamp: new Date().toISOString(),
      cronSecret: cronSecret ? 'configurada' : 'FALTA',
      vercelCron: !!req.headers['x-vercel-cron'],
    });
  }

  try {
    // Imports dinâmicos — se um módulo tiver erro de syntax,
    // só esse cron falha. Os outros continuam a funcionar.
    switch (task) {
      case 'tarefas': {
        const { default: fn } = await import('./_lib/tarefas-agendadas.js');
        return await fn(req, res);
      }
      case 'trial-emails': {
        const { default: fn } = await import('./_lib/trial-expiring-emails.js');
        return await fn(req, res);
      }
      case 'email-sequencia': {
        const { default: fn } = await import('./_lib/email-sequencia.js');
        return await fn(req, res);
      }
      case 'instagram': {
        const { default: fn } = await import('./_lib/instagram-schedule.js');
        return await fn(req, res);
      }
      case 'broadcast': {
        const { default: fn } = await import('./_lib/broadcast-interessados.js');
        return await fn(req, res);
      }
      case 'wa-leads': {
        const { waLeadsFollowUp } = await import('./_lib/wa-leads-cron.js');
        return await waLeadsFollowUp(req, res);
      }
      case 'wa-sequencia': {
        const { waSequenciaCron } = await import('./_lib/wa-sequencia-cron.js');
        return await waSequenciaCron(req, res);
      }
      case 'push-lembretes': {
        const { default: fn } = await import('./_lib/push-lembretes.js');
        return await fn(req, res);
      }
      case 'sync-expired': {
        const { default: fn } = await import('./_lib/sync-expired.js');
        return await fn(req, res);
      }
      default:
        return res.status(400).json({
          error: `Task desconhecida: ${task}`,
          opcoes: TASKS
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
