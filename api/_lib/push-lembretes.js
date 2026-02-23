/**
 * Push Lembretes Cron — Envia push notifications reais aos clientes
 *
 * Chamado a cada hora pelo cron dispatcher.
 * Verifica as preferências de cada user e envia push nas horas certas.
 *
 * Fluxo:
 * 1. Buscar todos os users com push_preferences activas
 * 2. Para cada user, verificar que lembretes estão agendados para a hora actual
 * 3. Enviar push notification via web-push
 */

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BNTM9kj9OsZ_KBBsO-zVG3pX6WHFwyqPtBMQyW6_Woy89rjXFJe9yE3UJw2E8c-TQx8dkQ-6cSLOFkleuQi_qPs'
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || 'd89K6ckTanOlUwJ-6xEaNna5pL1e6yKPQhqu6Hq0L6A'
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:viv.saraiva@gmail.com'

try { webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE) } catch (e) { /* ok */ }

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
    corpo: 'Daqui a 30 min é hora de almoçar. Prepara agora para não sair do plano!',
    url: '/vitalis/dashboard',
  },
  almoco: {
    titulo: 'Hora do almoço',
    corpo: 'Pausa para nutrir o corpo. Lembra-te das porções!',
    url: '/vitalis/dashboard',
  },
  prepJantar: {
    titulo: 'Começa a preparar o jantar',
    corpo: 'Daqui a 30 min é hora de jantar. Prepara agora!',
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
}

/**
 * Envia push para um user_id específico
 */
async function enviarPush(supabase, userId, tipo) {
  const msg = MENSAGENS[tipo]
  if (!msg) return 0

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return 0

  const payload = JSON.stringify({
    title: msg.titulo,
    body: msg.corpo,
    url: msg.url || '/',
    tag: `lembrete-${tipo}`,
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
 * Handler principal — chamado pelo cron dispatcher
 */
export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuração Supabase em falta' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Hora actual no timezone de Moçambique (CAT = UTC+2)
  const agora = new Date()
  const catOffset = 2 * 60 // UTC+2
  const catTime = new Date(agora.getTime() + catOffset * 60000)
  const horaActual = catTime.getUTCHours().toString().padStart(2, '0')
  const minActual = catTime.getUTCMinutes()

  // Janela de tolerância: enviar se minuto está entre 0-29 (primeira meia hora)
  // Isto permite que o cron corra 1x por hora e cubra lembretes nessa hora
  // Ex: cron às 09:00 UTC+2, envia tudo agendado para 09:00-09:29
  const janelaMin = 0
  const janelaMax = 59

  console.log(`[Push Lembretes] Hora CAT: ${horaActual}:${minActual.toString().padStart(2, '0')}`)

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
    return res.status(200).json({ message: 'Sem preferências activas', enviados: 0 })
  }

  let totalEnviados = 0
  let totalUsers = 0

  for (const pref of prefs) {
    if (!pref.lembretes || !Array.isArray(pref.lembretes)) continue

    const lembretesActivos = pref.lembretes.filter(l => l.activo)
    if (lembretesActivos.length === 0) continue

    for (const lembrete of lembretesActivos) {
      if (!lembrete.hora) continue

      const [h] = lembrete.hora.split(':').map(Number)

      // Enviar se a hora do lembrete coincide com a hora actual
      if (h === parseInt(horaActual)) {
        const enviados = await enviarPush(supabase, pref.user_id, lembrete.tipo)
        totalEnviados += enviados
        if (enviados > 0) totalUsers++
      }
    }
  }

  console.log(`[Push Lembretes] ${totalEnviados} notificações enviadas a ${totalUsers} users`)

  return res.status(200).json({
    hora: `${horaActual}:${minActual.toString().padStart(2, '0')} CAT`,
    prefsActivas: prefs.length,
    notificacoesEnviadas: totalEnviados,
    usersNotificados: totalUsers,
  })
}
