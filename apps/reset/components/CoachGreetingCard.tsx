'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, ArrowUpRight, RefreshCw } from 'lucide-react'
import { isoDate } from '@/lib/dates'

const ABERTURA_KEY = 'fenixfit:coach-abertura'

type Abertura = { date: string; texto: string; geradoEm?: string; fingerprint?: number }

function getAberturaHoje(): Abertura | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ABERTURA_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Abertura
    return data.date === isoDate() ? data : null
  } catch {
    return null
  }
}

// Conta dados registados hoje · espelho de coach/page.tsx
function fingerprintDadosHoje(): number {
  if (typeof window === 'undefined') return 0
  const hoje = isoDate()
  let n = 0
  try {
    const refeicoes = JSON.parse(localStorage.getItem('fenixfit:refeicoes') ?? '[]')
    n += refeicoes.filter((r: { timestamp?: string }) => (r.timestamp ?? '').slice(0, 10) === hoje).length
    const peso = JSON.parse(localStorage.getItem('fenixfit:peso') ?? '[]')
    n += peso.filter((p: { date?: string }) => p.date === hoje).length
    const dias = JSON.parse(localStorage.getItem('fenixfit:dias') ?? '{}')
    if (dias[hoje]) {
      const d = dias[hoje]
      n += Object.values(d.ancoras ?? {}).filter(Boolean).length
      n += d.aguaCopos ?? 0
      n += (d.suplementos ?? []).length
      if (d.sonoHoras !== null && d.sonoHoras !== undefined) n++
    }
    const alcool = JSON.parse(localStorage.getItem('fenixfit:alcool') ?? '[]')
    n += alcool.filter((a: { timestamp?: string }) => (a.timestamp ?? '').slice(0, 10) === hoje).length
  } catch {}
  return n
}

export default function CoachGreetingCard() {
  const [abertura, setAbertura] = useState<Abertura | null>(null)
  const [obsoleta, setObsoleta] = useState(false)

  useEffect(() => {
    const refresh = () => {
      const a = getAberturaHoje()
      setAbertura(a)
      if (a) {
        const fpAgora = fingerprintDadosHoje()
        const fpAbertura = a.fingerprint ?? 0
        const idadeMs = a.geradoEm ? Date.now() - new Date(a.geradoEm).getTime() : Infinity
        const muitoVelha = idadeMs > 3 * 60 * 60 * 1000
        const dadosNovos = fpAgora - fpAbertura >= 3
        setObsoleta(muitoVelha || dadosNovos)
      } else {
        setObsoleta(false)
      }
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    window.addEventListener('fenixfit:abertura', refresh)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      window.removeEventListener('fenixfit:abertura', refresh)
    }
  }, [])

  if (!abertura) return null

  const refrescar = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof window === 'undefined') return
    localStorage.removeItem(ABERTURA_KEY)
    window.dispatchEvent(new CustomEvent('fenixfit:abertura', {}))
    window.location.href = '/coach'
  }

  const texto = abertura.texto
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
    <a href="/coach" className="card-feature block transition-elegant hover:shadow-ink relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">a coach diz · hoje</span>
          {obsoleta ? <span className="text-faint text-[9.5px] tracking-cap uppercase">desactualizado</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {obsoleta ? (
            <button
              onClick={refrescar}
              aria-label="actualizar com dados recentes"
              className="rounded-full p-1 text-ouro hover:bg-ouro/10 active:scale-90"
            >
              <RefreshCw size={13} strokeWidth={1.5} />
            </button>
          ) : null}
          <ArrowUpRight size={14} strokeWidth={1.3} className="text-faint" />
        </div>
      </div>
      <p className={`font-serif text-[16px] leading-[1.5] tracking-editorial mt-3 italic ${obsoleta ? 'opacity-60' : ''}`}>
        {preview}
        {corte < texto.length ? <span className="text-faint"> ...</span> : null}
      </p>
      {obsoleta ? (
        <p className="text-faint text-[10.5px] mt-2 leading-relaxed">
          tens dados novos desde esta leitura · toca em refrescar para a coach reler.
        </p>
      ) : null}
    </a>
  )
}
