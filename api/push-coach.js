/**
 * SETE ECOS — Coach Push Notifications API
 * Manages push subscriptions + sends push notifications to coach
 *
 * Actions:
 *   subscribe   — Store push subscription for coach
 *   unsubscribe — Remove push subscription
 *   notify      — Send push to all coach subscriptions
 */

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BNTM9kj9OsZ_KBBsO-zVG3pX6WHFwyqPtBMQyW6_Woy89rjXFJe9yE3UJw2E8c-TQx8dkQ-6cSLOFkleuQi_qPs'
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || 'd89K6ckTanOlUwJ-6xEaNna5pL1e6yKPQhqu6Hq0L6A'
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:viv.saraiva@gmail.com'

const COACH_EMAILS = (process.env.VITE_COACH_EMAILS || 'viv.saraiva@gmail.com,vivnasc@gmail.com,vivianne.saraiva@outlook.com')
  .split(',').map(e => e.trim().toLowerCase())

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

async function verifyUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, ...params } = req.body || {}

  try {
    switch (action) {
      case 'subscribe': return await subscribe(req, params, res)
      case 'unsubscribe': return await unsubscribe(req, params, res)
      case 'notify': return await notify(params, res)
      case 'vapid-public': return res.status(200).json({ key: VAPID_PUBLIC })
      default: return res.status(400).json({ error: 'Accao desconhecida' })
    }
  } catch (err) {
    console.error('[Push API] Erro:', err)
    return res.status(500).json({ error: err.message || 'Erro interno' })
  }
}

// ─── Subscribe: store push subscription for coach ───
async function subscribe(req, params, res) {
  const user = await verifyUser(req)
  if (!user) return res.status(401).json({ error: 'Nao autenticado' })
  if (!COACH_EMAILS.includes(user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Apenas coaches podem subscrever push' })
  }

  const { subscription } = params
  if (!subscription?.endpoint || !subscription?.keys) {
    return res.status(400).json({ error: 'Subscription invalida' })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_email: user.email.toLowerCase(),
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

  if (error) {
    console.error('[Push] Erro ao guardar subscription:', error)
    return res.status(500).json({ error: 'Erro ao guardar. Tabela push_subscriptions existe?' })
  }

  return res.status(200).json({ ok: true })
}

// ─── Unsubscribe ───
async function unsubscribe(req, params, res) {
  const user = await verifyUser(req)
  if (!user) return res.status(401).json({ error: 'Nao autenticado' })

  if (params.endpoint) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', params.endpoint)
  }
  return res.status(200).json({ ok: true })
}

// ─── Notify: send push to all coach subscriptions ───
async function notify(params, res) {
  const { title, body, url, tag, requireInteraction } = params

  if (!title) return res.status(400).json({ error: 'Title obrigatorio' })

  // Fetch all coach subscriptions
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth')
    .in('user_email', COACH_EMAILS)

  if (error || !subs || subs.length === 0) {
    return res.status(200).json({ sent: 0, error: error?.message || 'Sem subscriptions' })
  }

  const payload = JSON.stringify({
    title,
    body: body || '',
    url: url || '/coach',
    tag: tag || 'coach-alert',
    requireInteraction: requireInteraction || false,
    vibrate: [200, 100, 200],
  })

  let sent = 0
  let failed = 0

  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
      }, payload)
      sent++
    } catch (err) {
      console.error('[Push] Falha ao enviar:', err.statusCode, sub.endpoint.slice(0, 50))
      // Remove expired/invalid subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
      failed++
    }
  }

  return res.status(200).json({ sent, failed })
}
