import { useState, useEffect } from 'react'

/**
 * Banner de actualização — aparece quando o service worker detecta nova versão.
 * O user clica para recarregar a app com a versão mais recente.
 */
export default function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const checkForUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.ready

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // Novo SW instalado e à espera — mostrar banner
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
    navigator.serviceWorker.ready.then(registration => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    })
    // Recarregar após o SW activar
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
    // Fallback: recarregar após 1s se controllerchange não disparar
    setTimeout(() => window.location.reload(), 1000)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 shadow-lg safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">✨</span>
          <p className="text-sm font-medium truncate">Nova versão disponível!</p>
        </div>
        <button
          onClick={handleUpdate}
          className="shrink-0 px-4 py-1.5 bg-white text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-50 active:scale-95 transition-all"
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
