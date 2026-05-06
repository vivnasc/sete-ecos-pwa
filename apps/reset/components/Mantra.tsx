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
    <p className="animate-fade-in text-center font-serif text-lg leading-relaxed text-terracota sm:text-xl">
      &ldquo;{texto}&rdquo;
    </p>
  )
}
