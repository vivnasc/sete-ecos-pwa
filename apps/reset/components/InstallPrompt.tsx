'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus } from 'lucide-react'

export default function InstallPrompt() {
  const [mostrar, setMostrar] = useState(false)
  const [ehIos, setEhIos] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dispensado = localStorage.getItem('reset:install-dispensado')
    if (dispensado) return

    const ua = navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua)
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    if (standalone) return

    if (isIosDevice) {
      setEhIos(true)
      const t = setTimeout(() => setMostrar(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const dispensar = () => {
    setMostrar(false)
    localStorage.setItem('reset:install-dispensado', new Date().toISOString())
  }

  if (!mostrar || !ehIos) return null

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-4 animate-slide-up">
      <div className="container-app">
        <div className="card-feature flex items-start gap-3 p-4">
          <div className="flex-1">
            <p className="label-cap mb-1.5">instalar no telemóvel</p>
            <p className="text-[13px] leading-relaxed">
              toca em <Share size={12} strokeWidth={1.6} className="mx-1 inline-block" aria-label="botão partilhar" /> e depois em <span className="font-medium">"Adicionar ao Ecrã Principal"</span> <Plus size={12} strokeWidth={1.6} className="ml-1 inline-block" aria-hidden />
            </p>
          </div>
          <button onClick={dispensar} aria-label="Dispensar" className="shrink-0 rounded-full p-1 text-faint hover:opacity-80">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
