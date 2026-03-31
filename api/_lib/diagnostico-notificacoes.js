/**
 * Diagnóstico público de notificações da coach
 *
 * GET /api/diagnostico-notificacoes?secret=vivnasc2026
 *
 * Testa todos os canais (Telegram, Push, WhatsApp, Email)
 * e mostra exactamente o que funciona e o que não funciona.
 *
 * Protegido pelo mesmo secret do gerar-plano-manual.
 */

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const COACH_EMAILS = [
  'viv.saraiva@gmail.com',
  'vivnasc@gmail.com',
  'vivianne.saraiva@outlook.com',
]

export default async function handler(req, res) {
  // Proteger com secret (mesmo do gerar-plano-manual)
  const secret = req.query?.secret
  if (secret !== 'vivnasc2026') {
    return res.status(403).json({ error: 'Acrescenta ?secret=vivnasc2026 ao URL' })
  }

  const enviar = req.query?.enviar === '1'
  const agora = new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' })

  const resultado = {
    hora: agora,
    telegram: {},
    push: {},
    whatsapp: {},
    email: {},
    cron: {},
  }

  // ═══ 1. TELEGRAM ═══
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID
  resultado.telegram.token_presente = !!BOT_TOKEN
  resultado.telegram.token_preview = BOT_TOKEN ? `${BOT_TOKEN.slice(0, 8)}...${BOT_TOKEN.slice(-4)}` : null
  resultado.telegram.chat_id = CHAT_ID || null

  if (BOT_TOKEN) {
    // 1a. Verificar token (getMe)
    try {
      const meResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
      const meData = await meResp.json()
      if (meData.ok) {
        resultado.telegram.bot_valido = true
        resultado.telegram.bot_username = `@${meData.result.username}`
        resultado.telegram.bot_nome = meData.result.first_name
      } else {
        resultado.telegram.bot_valido = false
        resultado.telegram.erro_token = meData.description
      }
    } catch (err) {
      resultado.telegram.bot_valido = false
      resultado.telegram.erro_token = err.message
    }

    // 1b. Buscar chats recentes (getUpdates)
    if (resultado.telegram.bot_valido) {
      try {
        const updResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=10`)
        const updData = await updResp.json()
        if (updData.ok) {
          const chats = updData.result
            .filter(u => u.message?.chat)
            .map(u => ({
              chat_id: u.message.chat.id,
              tipo: u.message.chat.type,
              nome: u.message.chat.first_name || u.message.chat.title || '?',
              ultima_msg: u.message.text?.slice(0, 50) || '[media]',
              data: new Date(u.message.date * 1000).toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' }),
            }))
          // Deduplicar por chat_id
          const unique = [...new Map(chats.map(c => [c.chat_id, c])).values()]
          resultado.telegram.chats_encontrados = unique

          if (CHAT_ID && !unique.some(c => String(c.chat_id) === String(CHAT_ID))) {
            resultado.telegram.PROBLEMA = `CHAT_ID configurado (${CHAT_ID}) NÃO corresponde a nenhum chat encontrado!`
            if (unique.length > 0) {
              resultado.telegram.SOLUCAO = `Muda TELEGRAM_CHAT_ID no Vercel para: ${unique[0].chat_id}`
            }
          } else if (CHAT_ID && unique.some(c => String(c.chat_id) === String(CHAT_ID))) {
            resultado.telegram.chat_id_correcto = true
          }

          if (unique.length === 0) {
            resultado.telegram.PROBLEMA = 'Nenhum chat encontrado. Envia /start ao bot no Telegram primeiro!'
          }
        }
      } catch (err) {
        resultado.telegram.erro_updates = err.message
      }

      // 1c. Tentar enviar mensagem de teste (só se ?enviar=1)
      if (enviar && CHAT_ID) {
        try {
          const msg = `🧪 DIAGNÓSTICO SETE ECOS\n\n✅ Telegram funciona!\n🕐 ${agora} CAT\n\nEste é um teste automático do sistema de notificações.`
          const sendResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg }),
          })
          const sendData = await sendResp.json()
          resultado.telegram.mensagem_enviada = sendData.ok
          if (!sendData.ok) {
            resultado.telegram.erro_envio = sendData.description
          }
        } catch (err) {
          resultado.telegram.erro_envio = err.message
        }
      } else if (!enviar) {
        resultado.telegram.nota = 'Adiciona &enviar=1 ao URL para enviar mensagem de teste'
      }
    }
  }

  // ═══ 2. PUSH ═══
  const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
  resultado.push.vapid_configurado = !!(VAPID_PUBLIC && VAPID_PRIVATE)

  if (VAPID_PUBLIC && VAPID_PRIVATE) {
    try {
      webpush.setVapidDetails(
        process.env.VAPID_EMAIL || 'mailto:viv.saraiva@gmail.com',
        VAPID_PUBLIC,
        VAPID_PRIVATE
      )
      resultado.push.vapid_valido = true
    } catch (err) {
      resultado.push.vapid_valido = false
      resultado.push.erro_vapid = err.message
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: subs, error } = await supabase
        .from('push_subscriptions')
        .select('user_email, role, endpoint, updated_at')
        .in('user_email', COACH_EMAILS.map(e => e.toLowerCase()))

      resultado.push.subscricoes_coach = subs?.length || 0
      resultado.push.erro_query = error?.message || null
      if (subs && subs.length > 0) {
        resultado.push.devices = subs.map(s => ({
          email: s.user_email,
          role: s.role,
          endpoint_preview: s.endpoint?.slice(0, 60) + '...',
          actualizado: s.updated_at,
        }))
      }
      if (!subs || subs.length === 0) {
        resultado.push.PROBLEMA = 'Nenhum device registado para coach. Vai ao /coach e clica "Activar Notificações".'
      }

      // Enviar push de teste (só se ?enviar=1)
      if (enviar && subs && subs.length > 0) {
        const { data: fullSubs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, keys_p256dh, keys_auth')
          .in('user_email', COACH_EMAILS.map(e => e.toLowerCase()))

        const payload = JSON.stringify({
          title: '🧪 Diagnóstico Push',
          body: `Push funciona! ${agora} CAT`,
          url: '/coach',
          tag: 'diagnostico-push',
        })
        let sent = 0
        let erros = []
        for (const sub of (fullSubs || [])) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
              payload
            )
            sent++
          } catch (err) {
            erros.push(`${err.statusCode || err.message}`)
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
            }
          }
        }
        resultado.push.mensagens_enviadas = sent
        if (erros.length > 0) resultado.push.erros_envio = erros
      }
    }
  }

  // ═══ 3. WHATSAPP ═══
  const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
  const WA_PHONE = process.env.WHATSAPP_PHONE_NUMBER_ID
  const VIV_NUM = (process.env.VIVIANNE_PERSONAL_NUMBER || '').replace(/[^0-9]/g, '')
  resultado.whatsapp.token_presente = !!WA_TOKEN
  resultado.whatsapp.phone_id_presente = !!WA_PHONE
  resultado.whatsapp.numero_pessoal = VIV_NUM ? `${VIV_NUM.slice(0, 3)}***${VIV_NUM.slice(-3)}` : 'NÃO CONFIGURADO'
  resultado.whatsapp.nota = 'WhatsApp requer janela de 24h para texto livre. Funciona melhor para clientes que enviam msg primeiro.'

  // ═══ 4. EMAIL ═══
  resultado.email.resend_configurado = !!process.env.RESEND_API_KEY
  resultado.email.coach_email = process.env.COACH_EMAIL || 'viv.saraiva@gmail.com (default)'

  // ═══ 5. CRON ═══
  resultado.cron.cron_secret_presente = !!process.env.CRON_SECRET
  resultado.cron.nota = 'O cron "tarefas" corre às 19h UTC (21h CAT). Agora as notificações coach correm PRIMEIRO.'

  // ═══ RESUMO ═══
  const problemas = []
  if (!resultado.telegram.bot_valido) problemas.push('Telegram: token inválido')
  if (resultado.telegram.PROBLEMA) problemas.push(`Telegram: ${resultado.telegram.PROBLEMA}`)
  if (resultado.push.PROBLEMA) problemas.push(`Push: ${resultado.push.PROBLEMA}`)
  if (!resultado.email.resend_configurado) problemas.push('Email: RESEND_API_KEY em falta')
  if (!resultado.cron.cron_secret_presente) problemas.push('Cron: CRON_SECRET em falta')

  resultado.resumo = {
    problemas_encontrados: problemas.length,
    problemas,
    tudo_ok: problemas.length === 0,
  }

  return res.status(200).json(resultado)
}
