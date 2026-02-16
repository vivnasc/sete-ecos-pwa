/**
 * SETE ECOS — Push Notification Handler (Service Worker)
 * Loaded via importScripts by the Workbox-generated SW.
 * Handles push events and notification clicks.
 */

self.addEventListener('push', (event) => {
  let data = { title: 'Sete Ecos', body: '', tag: 'default' }
  try { data = { ...data, ...event.data.json() } } catch (e) { /* ok */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logos/VITALIS_LOGO_V3.png',
      badge: '/logos/sete-ecos-192.png',
      tag: data.tag || 'sete-ecos',
      data: { url: data.url || '/coach' },
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/coach'

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
