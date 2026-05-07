'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, ArrowUpRight } from 'lucide-react'
import { isoDate } from '@/lib/dates'

const ABERTURA_KEY = 'fenixfit:coach-abertura'

function getAberturaHoje(): { date: string; texto: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ABERTURA_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.date === isoDate() ? data : null
  } catch {
    return null
  }
}

export default function CoachGreetingCard() {
  const [texto, setTexto] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => {
      const a = getAberturaHoje()
      setTexto(a?.texto ?? null)
    }
    refresh()
    // refresh quando ela visita /coach
    const i = setInterval(refresh, 5000)
    return () => clearInterval(i)
  }, [])

  if (!texto) return null

  // Mostrar apenas as primeiras 1-2 frases (corte na primeira interrogação ou ponto final após ~120 chars)
  const corteInterrog = texto.indexOf('?')
  const cortePonto = texto.indexOf('.', 80)
  const corte =
    corteInterrog > 0 && corteInterrog < 200
      ? corteInterrog + 1
      : cortePonto > 0 && cortePonto < 200
        ? cortePonto + 1
        : Math.min(texto.length, 200)
  const preview = texto.slice(0, corte).trim()

  return (
    <Link href="/coach" className="card-feature block transition-elegant hover:shadow-ink">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">a coach diz · hoje</span>
        </div>
        <ArrowUpRight size={14} strokeWidth={1.3} className="text-faint" />
      </div>
      <p className="font-serif text-[16px] leading-[1.5] tracking-editorial mt-3 italic">
        {preview}
        {corte < texto.length ? <span className="text-faint"> ...</span> : null}
      </p>
    </Link>
  )
}
