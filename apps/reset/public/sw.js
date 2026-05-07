// FénixFit · service worker minimal
// Estratégia: network-first para tudo (zero cache aggressive)
// Evita problema de chunks antigos quando deploy novo acontece

const VERSION = 'fenixfit-v3'

self.addEventListener('install', e => {
  // Activar imediatamente, sem esperar
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) return

  // Network-only para JS/CSS/HTML · evita servir versões antigas
  if (
    url.pathname.includes('/_next/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    return // deixa browser fazer fetch normal
  }

  // Para imagens e fonts: cache opportunístico
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone()
          caches.open(VERSION).then(c => c.put(request, copy))
        }
        return res
      }).catch(() => cached || new Response('', { status: 503 }))
    })
  )
})
