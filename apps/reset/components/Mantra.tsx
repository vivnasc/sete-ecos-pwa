'use client'

import { useEffect, useState } from 'react'
import { MANTRAS } from '@/lib/data'
import { diaDoPlano } from '@/lib/dates'

export default function Mantra({ index }: { index?: number }) {
  const [texto, setTexto] = useState<string | null>(null)

  useEffect(() => {
    const dia = index ?? Math.max(1, diaDoPlano())
    setTexto(MANTRAS[(dia - 1) % MANTRAS.length])
  }, [index])

  if (!texto) return <div className="h-12" aria-hidden />

  return (
    <p className="mantra-text text-soft animate-fade-in text-center">
      <span className="font-serif text-ouro">&ldquo;</span>
      {texto}
      <span className="font-serif text-ouro">&rdquo;</span>
    </p>
  )
}
