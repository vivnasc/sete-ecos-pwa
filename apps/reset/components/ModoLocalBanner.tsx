'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { supabaseConfigurado } from '@/lib/supabase'

export default function ModoLocalBanner() {
  const [mostrar, setMostrar] = useState(false)
  const [dispensado, setDispensado] = useState(false)

  useEffect(() => {
    const config = supabaseConfigurado()
    if (!config) {
      const d = localStorage.getItem('fenixfit:banner-modo-local-dispensado')
      setDispensado(!!d)
      setMostrar(true)
    }
  }, [])

  if (!mostrar || dispensado) return null

  const dispensar = () => {
    setDispensado(true)
    localStorage.setItem('fenixfit:banner-modo-local-dispensado', '1')
  }

  return (
    <div className="container-app pt-3">
      <div className="flex items-start gap-3 rounded-lg p-3 bg-terracota/10 shadow-[inset_0_0_0_1px_rgba(155,93,62,0.3)]">
        <AlertTriangle size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-terracota" />
        <div className="flex-1 text-[12.5px] leading-relaxed">
          <p className="text-terracota font-medium">modo local · sem sincronização</p>
          <p className="text-soft mt-1">
            os teus dados ficam só neste dispositivo. para teres conta segura e sincronizar entre dispositivos, configura as variáveis Supabase no Cloudflare e faz login.
          </p>
        </div>
        <button
          onClick={dispensar}
          className="text-faint text-[10px] uppercase tracking-cap hover:opacity-70"
        >
          dispensar
        </button>
      </div>
    </div>
  )
}
