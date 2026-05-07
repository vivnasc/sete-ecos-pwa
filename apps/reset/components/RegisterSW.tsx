'use client'

import { useEffect } from 'react'

// Service worker DESLIGADO temporariamente.
// Estava a causar problemas de chunks 500 (cache antigo a servir
// referências de chunks que já não existem em deploys novos).
// Em vez de registar, este componente DESREGISTA qualquer SW antigo
// que ainda esteja instalado de versões anteriores.
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Desregistar SWs antigos
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister())
    }).catch(() => {})

    // Limpar caches antigos
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(k => caches.delete(k))
      }).catch(() => {})
    }
  }, [])
  return null
}
