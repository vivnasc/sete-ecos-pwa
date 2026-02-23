import { useState, useEffect } from 'react'

/**
 * Banner de actualização — aparece UMA VEZ quando o service worker detecta nova versão.
 * Guarda em localStorage qual versão já foi dispensada para não irritar.
 */

// Chave única por build — muda a cada deploy
const BUILD_ID = import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || Date.now().toString(36)
const DISMISSED_KEY = 'update_banner_dismissed'

export default function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Se já dispensou este build, não mostrar
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed === BUILD_ID) return

    const checkForUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.ready

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true)
            }
          })
        })

        // Verificar imediatamente se há SW em espera
        if (registration.waiting && navigator.serviceWorker.controller) {
          setShowUpdate(true)
        }
      } catch (e) {
        // Silencioso
      }
    }

    checkForUpdate()
  }, [])

  const handleUpdate = () => {
    localStorage.setItem(DISMISSED_KEY, BUILD_ID)
    navigator.serviceWorker.ready.then(registration => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    })
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, BUILD_ID)
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 shadow-lg safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">✨</span>
          <p className="text-sm font-medium truncate">Nova versão disponível!</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="px-2 py-1.5 text-white/70 text-sm hover:text-white"
            aria-label="Dispensar"
          >
            Depois
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-1.5 bg-white text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-50 active:scale-95 transition-all"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}
