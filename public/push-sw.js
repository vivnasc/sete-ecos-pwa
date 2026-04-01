/**
 * SETE ECOS — Push Notification Handler (Service Worker)
 * Loaded via importScripts by the Workbox-generated SW.
 * Handles push events, notification clicks, auto-update, and local scheduling.
 */

// Lembretes agendados localmente pelo SW (backup para quando a app está em background)
let scheduledTimeouts = []

// Limpar todos os timeouts agendados
function clearScheduledTimeouts() {
  scheduledTimeouts.forEach(id => clearTimeout(id))
  scheduledTimeouts = []
}

// Agendar notificações locais baseado nos horários recebidos da app
function scheduleLocalNotifications(lembretes) {
  clearScheduledTimeouts()

  const agora = Date.now()

  lembretes.forEach(lembrete => {
    if (!lembrete.hora || !lembrete.titulo) return

    const [hora, minutos] = lembrete.hora.split(':').map(Number)
    const alvo = new Date()
    alvo.setHours(hora, minutos, 0, 0)

    const delay = alvo.getTime() - agora
    // Só agendar se falta pelo menos 15 segundos
    if (delay < 15000) return

    const timeoutId = setTimeout(() => {
      self.registration.showNotification(lembrete.titulo, {
        body: lembrete.corpo || '',
        icon: '/logos/sete-ecos-192.png',
        badge: '/logos/sete-ecos-192.png',
        tag: lembrete.tag || 'sete-ecos-lembrete',
        data: { url: '/vitalis' },
        vibrate: [200, 100, 200],
      })
    }, delay)

    scheduledTimeouts.push(timeoutId)
  })
}

// Quando o banner pede SKIP_WAITING, activar o novo SW imediatamente
// Quando a app envia SCHEDULE_NOTIFICATIONS, agendar localmente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleLocalNotifications(event.data.lembretes || [])
  }
})

self.addEventListener('push', (event) => {
  let data = { title: 'Sete Ecos', body: '', tag: 'default' }
  try { data = { ...data, ...event.data.json() } } catch (e) { /* ok */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logos/sete-ecos-192.png',
      badge: '/logos/sete-ecos-192.png',
      tag: data.tag || 'sete-ecos',
      data: { url: data.url || '/' },
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Open new window
      return self.clients.openWindow(url)
    })
  )
})
