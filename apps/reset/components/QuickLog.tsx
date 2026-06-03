'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Mic } from 'lucide-react'
import VoiceModeOverlay from './VoiceModeOverlay'

const ESCONDIDA = ['/login', '/onboarding', '/limpar', '/logos']

export default function QuickLog() {
  const path = usePathname() || '/'
  const [aberto, setAberto] = useState(false)
  if (ESCONDIDA.some(p => path.startsWith(p))) return null

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label="Falar com a coach"
        title="fala com a coach"
        className="fab"
      >
        <Mic size={20} strokeWidth={1.6} />
      </button>
      <VoiceModeOverlay aberto={aberto} onFechar={() => setAberto(false)} />
    </>
  )
}
