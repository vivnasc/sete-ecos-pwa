/**
 * Push Subscription — regista o browser para receber push notifications reais
 *
 * Funciona para qualquer user autenticado (clientes + coach).
 * O service worker (push-sw.js) trata de mostrar as notificações.
 */

import { supabase } from './supabase'

// Cache para evitar registos duplicados na mesma sessão
let subscribed = false

/**
 * Registar push subscription para o user autenticado.
 * Chama automaticamente quando o user faz login e dá permissão.
 */
export async function registarPushSubscription() {
  if (subscribed) return { ok: true, cached: true }

  // Verificar suporte
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Não suportado neste browser')
    return { ok: false, reason: 'unsupported' }
  }

  // Verificar permissão
  if (Notification.permission !== 'granted') {
    console.log('[Push] Sem permissão de notificações')
    return { ok: false, reason: 'no-permission' }
  }

  try {
    const reg = await navigator.serviceWorker.ready

    // Verificar se já tem subscription
    let subscription = await reg.pushManager.getSubscription()

    if (!subscription) {
      // Buscar VAPID public key do servidor
      const vapidRes = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push-vapid-public' })
      })
      const vapidData = await vapidRes.json()
      const key = vapidData?.key
      if (!key) {
        console.warn('[Push] VAPID key não configurada no servidor. Configura VAPID_PUBLIC_KEY nas env vars do Vercel.')
        return { ok: false, reason: 'no-vapid-key' }
      }

      // Converter VAPID key para Uint8Array
      const padding = '='.repeat((4 - key.length % 4) % 4)
      const base64 = (key + padding).replace(/-/g, '+').replace(/_/g, '/')
      const rawData = atob(base64)
      const applicationServerKey = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; i++) applicationServerKey[i] = rawData.charCodeAt(i)

      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
    }

    // Enviar subscription para o servidor
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return { ok: false, reason: 'no-session' }

    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'push-subscribe',
        subscription: subscription.toJSON(),
      }),
    })

    const result = await res.json()
    if (result.ok) {
      subscribed = true
      console.log('[Push] Subscription registada com sucesso, role:', result.role)
    } else {
      console.warn('[Push] Falha ao registar subscription:', result.error || result)
    }
    return result
  } catch (err) {
    console.error('[Push] Erro ao registar subscription:', err)
    return { ok: false, reason: err.message }
  }
}

/**
 * Pedir permissão de notificações e registar push subscription.
 * Retorna true se a permissão foi concedida.
 */
export async function pedirPermissaoERegistar() {
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') {
    await registarPushSubscription()
    return true
  }

  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  if (result === 'granted') {
    await registarPushSubscription()
    return true
  }
  return false
}

/**
 * Guardar preferências de lembretes no servidor.
 */
export async function guardarPreferencias(lembretes, timezone = 'Africa/Maputo') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false }

  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'push-save-prefs',
      lembretes,
      timezone,
    }),
  })
  return await res.json()
}

/**
 * Buscar preferências de lembretes do servidor.
 */
export async function buscarPreferencias() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return null

  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action: 'push-get-prefs' }),
  })
  const data = await res.json()
  return data.prefs
}
