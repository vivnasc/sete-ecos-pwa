// Push Lembretes Cron — Envia push notifications reais aos clientes
//
// Chamado A CADA 5 MINUTOS pelo cron no vercel.json:
//   "star/5 * * * *" (Vercel Pro permite crons por minuto)
//
// Cada execução verifica a hora em Africa/Maputo (CAT) e envia
// lembretes cuja hora configurada está dentro dos últimos 6 minutos.
// Só activo entre CAT 06:00-22:59 (fora disso faz early return).
//
// Resultado: notificações chegam no máximo 5 minutos após a hora
// configurada — timing praticamente igual a apps nativas.
//
// Tags alinhadas com o cliente evitam duplicados via Service Worker.

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

// Obter hora e minuto actuais em Africa/Maputo (CAT = UTC+2)
function horaMinutoCAT() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Maputo',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
  const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10)
  return { hora: h, minuto: m, totalMinutos: h * 60 + m }
}

// Verificar se um lembrete está dentro da janela de envio (últimos 6min)
function lembreteNaJanela(lembreteHora, agoraMinutos) {
  const [h, m] = lembreteHora.split(':').map(Number)
  const lembreteMinutos = h * 60 + (m || 0)
  // Janela: desde 6min atrás até agora (inclusive)
  // 5min = intervalo entre crons + 1min margem para jitter
  const diff = agoraMinutos - lembreteMinutos
  return diff >= 0 && diff < 6
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
// para que a mesma tag evite notificações duplicadas via Service Worker
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

/**
 * Envia push para um user_id específico
 */
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
  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .eq('user_id', userId)

  if (subsError) {
    console.error(`[Push] Erro ao buscar subscriptions para user ${userId}:`, subsError.message)
    return 0
  }

  if (!subs || subs.length === 0) {
    console.log(`[Push] User ${userId} não tem push subscriptions registadas`)
    return 0
  }

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
      console.error(`[Push] Falha ao enviar para user ${userId}:`, err.statusCode, err.body || err.message)
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        console.log(`[Push] Subscription expirada removida para user ${userId}`)
      }
    }
  }
  return sent
}

/**
 * Handler principal — chamado pelo cron dispatcher a cada 5 minutos
 */
export default async function handler(req, res) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(500).json({ error: 'VAPID keys em falta. Adiciona VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas env vars.' })
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuração Supabase em falta' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Determinar hora e minuto actuais em CAT
  const { hora: horaCAT, minuto: minutoCAT, totalMinutos } = horaMinutoCAT()

  // Só enviar entre CAT 06:00 e 22:59 (não acordar ninguém de madrugada)
  if (horaCAT < 6 || horaCAT > 22) {
    return res.status(200).json({ horaCAT, message: 'Fora do horário (CAT 06-22)', enviados: 0 })
  }

  console.log(`[Push Lembretes] ${horaCAT}:${String(minutoCAT).padStart(2, '0')} CAT — janela de 6min`)

  // Buscar todas as preferências activas
  const { data: prefs, error } = await supabase
    .from('push_preferences')
    .select('user_id, lembretes, timezone')
    .eq('activo', true)

  if (error) {
    console.error('[Push Lembretes] Erro ao buscar preferências:', error.message)
    return res.status(500).json({ error: error.message })
  }

  if (!prefs || prefs.length === 0) {
    console.log('[Push Lembretes] Nenhuma preferência activa encontrada na tabela push_preferences')
    return res.status(200).json({ horaCAT, message: 'Sem preferências activas', enviados: 0 })
  }

  console.log(`[Push Lembretes] ${prefs.length} users com preferências activas`)

  let totalEnviados = 0
  let totalUsers = 0

  for (const pref of prefs) {

    if (!pref.lembretes || !Array.isArray(pref.lembretes)) continue

    const lembretesActivos = pref.lembretes.filter(l => l.activo)
    if (lembretesActivos.length === 0) continue

    let userEnviou = false

    for (const lembrete of lembretesActivos) {
      if (!lembrete.hora) continue

      // Enviar se o lembrete está dentro da janela de 6min
      if (lembreteNaJanela(lembrete.hora, totalMinutos)) {
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
