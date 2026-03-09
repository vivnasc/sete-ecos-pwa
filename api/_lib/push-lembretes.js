/**
 * Push Lembretes Cron — Envia push notifications reais aos clientes
 *
 * Chamado 3x por dia pelo cron (Vercel Hobby só permite 1x/dia mínimo):
 *   ?bloco=manha  → 0 6 * * *  (08:00 CAT) — lembretes entre 06:00-11:59
 *   ?bloco=tarde  → 0 11 * * * (13:00 CAT) — lembretes entre 12:00-17:59
 *   ?bloco=noite  → 0 17 * * * (19:00 CAT) — lembretes entre 18:00-22:59
 *
 * NOTA: Vercel Hobby pode invocar o cron em qualquer ponto dentro da hora,
 * por isso usamos blocos de 6h em vez de janelas exactas de minutos.
 *
 * Tags alinhadas com o cliente evitam duplicados via Service Worker.
 */

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:viv.saraiva@gmail.com'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try { webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE) } catch (e) { /* ok */ }
}

// Blocos horários (CAT) — cada bloco cobre 6 horas
const BLOCOS = {
  manha: { inicio: 6 * 60, fim: 12 * 60 },   // 06:00 - 11:59
  tarde: { inicio: 12 * 60, fim: 18 * 60 },   // 12:00 - 17:59
  noite: { inicio: 18 * 60, fim: 23 * 60 },   // 18:00 - 22:59
}

// Verificar se um lembrete está dentro do bloco horário
function lembreteNoBloco(lembreteHora, bloco) {
  const range = BLOCOS[bloco]
  if (!range) return false
  const [h, m] = lembreteHora.split(':').map(Number)
  const minutos = h * 60 + (m || 0)
  return minutos >= range.inicio && minutos < range.fim
}

// Mensagens de push por tipo de lembrete
const MENSAGENS = {
  agua: {
    titulo: 'Hora de beber água!',
    corpo: 'Já bebeste água? Mantém-te hidratada(o)!',
    url: '/vitalis/dashboard',
  },
  pequenoAlmoco: {
    titulo: 'Bom dia! Pequeno-almoço',
    corpo: 'Começa o dia com energia. Não te esqueças do pequeno-almoço!',
    url: '/vitalis/dashboard',
  },
  prepAlmoco: {
    titulo: 'Começa a preparar o almoço',
    corpo: 'Daqui a pouco é hora de almoçar. Prepara agora para não sair do plano!',
    url: '/vitalis/dashboard',
  },
  almoco: {
    titulo: 'Hora do almoço',
    corpo: 'Pausa para nutrir o corpo. Lembra-te das porções!',
    url: '/vitalis/dashboard',
  },
  prepJantar: {
    titulo: 'Começa a preparar o jantar',
    corpo: 'Daqui a pouco é hora de jantar. Prepara agora!',
    url: '/vitalis/dashboard',
  },
  jantar: {
    titulo: 'Hora do jantar',
    corpo: 'Última refeição do dia. Mantém leve e nutritivo.',
    url: '/vitalis/dashboard',
  },
  checkin: {
    titulo: 'Check-in diário',
    corpo: 'Como foi o teu dia? Faz o check-in para manter o streak!',
    url: '/vitalis/dashboard',
  },
  treino: {
    titulo: 'Dia de treino!',
    corpo: 'Hoje é dia de mexer o corpo. Vamos lá!',
    url: '/vitalis/dashboard',
  },
  jejumFim: {
    titulo: 'Janela alimentar aberta!',
    corpo: 'O teu período de jejum terminou. Podes comer!',
    url: '/vitalis/dashboard',
  },
  jejumInicio: {
    titulo: 'Início do jejum',
    corpo: 'Janela alimentar fechada. Foco e disciplina!',
    url: '/vitalis/dashboard',
  },
  motivacao: {
    titulo: 'Lembra-te...',
    corpo: 'Cada escolha consciente te aproxima da melhor versão de ti!',
    url: '/vitalis/dashboard',
  },
  streak: {
    titulo: 'Mantém o streak!',
    corpo: 'Não quebre a sequência. Regista algo hoje!',
    url: '/vitalis/dashboard',
  },
  // Áurea lembretes
  quota_manha: {
    titulo: 'Lembrete da Quota',
    corpo: 'Já reservaste o teu tempo hoje? A tua quota de presença espera por ti.',
    url: '/aurea/dashboard',
  },
  pratica_tarde: {
    titulo: 'Micro-Prática',
    corpo: 'Que tal 2 minutos para ti? Uma pequena prática pode mudar o teu dia.',
    url: '/aurea/praticas',
  },
  reflexao_noite: {
    titulo: 'Reflexão da Noite',
    corpo: 'Antes de dormir: celebra um pequeno "sim" a ti mesma. Boa noite.',
    url: '/aurea/dashboard',
  },
  // Genéricos para outros ecos
  checkin_manha: {
    titulo: 'Check-in da manhã',
    corpo: 'Como te sentes hoje? Começa o dia com consciência.',
    url: '/',
  },
  respiracao: {
    titulo: 'Lembrete de Respiração',
    corpo: 'Pausa. 3 respirações profundas. Estás presente.',
    url: '/',
  },
}

// Tags alinhadas com o cliente (src/utils/notifications.js NOTIFICACOES)
const TAGS = {
  agua: 'vitalis-agua',
  pequenoAlmoco: 'vitalis-refeicao-pa',
  almoco: 'vitalis-refeicao-almoco',
  jantar: 'vitalis-refeicao-jantar',
  prepAlmoco: 'vitalis-prep-almoco',
  prepJantar: 'vitalis-prep-jantar',
  checkin: 'vitalis-checkin',
  treino: 'vitalis-treino',
  jejumFim: 'vitalis-jejum',
  jejumInicio: 'vitalis-jejum',
  motivacao: 'vitalis-motivacao',
  streak: 'vitalis-streak',
}

async function enviarPush(supabase, userId, tipo) {
  const msg = MENSAGENS[tipo]
  const tag = TAGS[tipo] || `lembrete-${tipo}`

  if (!msg) {
    return enviarPushRaw(supabase, userId, {
      title: 'Lembrete Sete Ecos',
      body: 'Tens algo agendado agora. Abre a app!',
      url: '/',
      tag,
    })
  }

  return enviarPushRaw(supabase, userId, {
    title: msg.titulo,
    body: msg.corpo,
    url: msg.url || '/',
    tag,
  })
}

async function enviarPushRaw(supabase, userId, { title, body, url, tag }) {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return 0

  const payload = JSON.stringify({
    title,
    body: body || '',
    url: url || '/',
    tag: tag || 'sete-ecos',
    vibrate: [200, 100, 200],
  })

  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
        payload
      )
      sent++
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }
  return sent
}

/**
 * Handler principal — chamado 3x por dia com ?bloco=manha|tarde|noite
 *
 * Para cada user com preferências activas, envia TODOS os lembretes
 * cujo horário configurado cai dentro do bloco actual.
 */
export default async function handler(req, res) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(500).json({ error: 'VAPID keys em falta. Adiciona VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas env vars.' })
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuração Supabase em falta' })
  }

  const bloco = req.query?.bloco || 'manha'
  if (!BLOCOS[bloco]) {
    return res.status(400).json({ error: `Bloco inválido: ${bloco}. Usar: manha, tarde, noite` })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log(`[Push Lembretes] Bloco: ${bloco} (${BLOCOS[bloco].inicio / 60}h-${BLOCOS[bloco].fim / 60}h CAT)`)

  // Buscar user_ids de coaches (não devem receber lembretes de cliente)
  const { data: coachSubs } = await supabase
    .from('push_subscriptions')
    .select('user_id')
    .eq('role', 'coach')
  const coachUserIds = new Set((coachSubs || []).map(s => s.user_id).filter(Boolean))

  // Buscar todas as preferências activas
  const { data: prefs, error } = await supabase
    .from('push_preferences')
    .select('user_id, lembretes, timezone')
    .eq('activo', true)

  if (error) {
    console.error('[Push Lembretes] Erro ao buscar preferências:', error)
    return res.status(500).json({ error: error.message })
  }

  if (!prefs || prefs.length === 0) {
    return res.status(200).json({ bloco, message: 'Sem preferências activas', enviados: 0 })
  }

  let totalEnviados = 0
  let totalUsers = 0

  for (const pref of prefs) {
    // Excluir coaches
    if (coachUserIds.has(pref.user_id)) continue

    if (!pref.lembretes || !Array.isArray(pref.lembretes)) continue

    const lembretesActivos = pref.lembretes.filter(l => l.activo)
    if (lembretesActivos.length === 0) continue

    let userEnviou = false

    for (const lembrete of lembretesActivos) {
      if (!lembrete.hora) continue

      // Enviar se o lembrete cai dentro deste bloco horário
      if (lembreteNoBloco(lembrete.hora, bloco)) {
        const enviados = await enviarPush(supabase, pref.user_id, lembrete.tipo)
        totalEnviados += enviados
        if (enviados > 0) userEnviou = true
      }
    }

    if (userEnviou) totalUsers++
  }

  console.log(`[Push Lembretes] Bloco ${bloco}: ${totalEnviados} notificações a ${totalUsers} users`)

  return res.status(200).json({
    bloco,
    prefsActivas: prefs.length,
    notificacoesEnviadas: totalEnviados,
    usersNotificados: totalUsers,
  })
}
