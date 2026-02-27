/**
 * Push Lembretes Cron — Envia push notifications reais aos clientes
 *
 * Chamado a cada hora pelo cron (0 * * * *).
 * Envia apenas os lembretes cuja hora configurada corresponde à hora
 * actual em Africa/Maputo (CAT, UTC+2).
 *
 * Ex: às 14:00 CAT envia só lembretes configurados para 14:xx.
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

// Obter hora actual em Africa/Maputo (CAT = UTC+2)
function horaActualCAT() {
  const now = new Date()
  // Intl garante conversão correcta mesmo com DST
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Maputo',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const hourPart = parts.find(p => p.type === 'hour')
  return parseInt(hourPart.value, 10)
}

// Manter compatibilidade com chamadas antigas por bloco
const BLOCOS = {
  manha: { min: 5, max: 10 },
  tarde: { min: 11, max: 16 },
  noite: { min: 17, max: 23 },
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

/**
 * Envia push para um user_id específico
 */
async function enviarPush(supabase, userId, tipo) {
  const msg = MENSAGENS[tipo]
  if (!msg) {
    // Fallback genérico para tipos não mapeados
    return enviarPushRaw(supabase, userId, {
      title: 'Lembrete Sete Ecos',
      body: 'Tens algo agendado agora. Abre a app!',
      url: '/',
      tag: `lembrete-${tipo}`,
    })
  }

  return enviarPushRaw(supabase, userId, {
    title: msg.titulo,
    body: msg.corpo,
    url: msg.url || '/',
    tag: `lembrete-${tipo}`,
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
 * Handler principal — chamado pelo cron dispatcher 3x/dia
 */
export default async function handler(req, res) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(500).json({ error: 'VAPID keys em falta. Adiciona VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas env vars.' })
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuração Supabase em falta' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Determinar hora actual em CAT
  const horaCAT = horaActualCAT()

  // Suportar bloco legacy (mas agora filtra só pela hora actual)
  const url = new URL(req.url, `http://${req.headers.host}`)
  const bloco = url.searchParams.get('bloco') || req.query?.bloco || null

  // Se chamado com bloco antigo, verificar se a hora actual cai nesse bloco
  // para evitar enviar fora de horas durante migração
  if (bloco && BLOCOS[bloco]) {
    const janela = BLOCOS[bloco]
    if (horaCAT < janela.min || horaCAT > janela.max) {
      return res.status(200).json({
        bloco,
        horaCAT,
        message: `Hora actual (${horaCAT}h) fora do bloco ${bloco} — nada a enviar`,
        enviados: 0,
      })
    }
  }

  console.log(`[Push Lembretes] Hora CAT: ${horaCAT}h — enviando lembretes para esta hora`)

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
    return res.status(200).json({ horaCAT, message: 'Sem preferências activas', enviados: 0 })
  }

  let totalEnviados = 0
  let totalUsers = 0

  for (const pref of prefs) {
    if (!pref.lembretes || !Array.isArray(pref.lembretes)) continue

    const lembretesActivos = pref.lembretes.filter(l => l.activo)
    if (lembretesActivos.length === 0) continue

    let userEnviou = false

    for (const lembrete of lembretesActivos) {
      if (!lembrete.hora) continue

      const [h] = lembrete.hora.split(':').map(Number)

      // Enviar APENAS se a hora do lembrete corresponde à hora actual CAT
      if (h === horaCAT) {
        const enviados = await enviarPush(supabase, pref.user_id, lembrete.tipo)
        totalEnviados += enviados
        if (enviados > 0) userEnviou = true
      }
    }

    if (userEnviou) totalUsers++
  }

  console.log(`[Push Lembretes] ${horaCAT}h CAT: ${totalEnviados} notificações a ${totalUsers} users`)

  return res.status(200).json({
    horaCAT,
    prefsActivas: prefs.length,
    notificacoesEnviadas: totalEnviados,
    usersNotificados: totalUsers,
  })
}
