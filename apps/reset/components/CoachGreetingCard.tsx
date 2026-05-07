'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, ArrowUpRight, RefreshCw, Sparkles } from 'lucide-react'
import { isoDate } from '@/lib/dates'
import { construirContexto } from '@/lib/coachContext'
import { getCoachMensagens } from '@/lib/storage'

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

async function gerarAbertura(): Promise<string | null> {
  try {
    const historico = getCoachMensagens(20).map(m => ({ role: m.role, content: m.content }))
    const r = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        abertura: true,
        contexto: construirContexto(true),
        historico
      })
    })
    if (!r.ok) return null
    const json = await r.json()
    if (!json.texto) return null
    localStorage.setItem(ABERTURA_KEY, JSON.stringify({
      date: isoDate(),
      texto: json.texto,
      geradoEm: new Date().toISOString(),
      fingerprint: fingerprintDadosHoje()
    }))
    window.dispatchEvent(new CustomEvent('fenixfit:abertura', {}))
    return json.texto
  } catch {
    return null
  }
}

export default function CoachGreetingCard() {
  const [abertura, setAbertura] = useState<Abertura | null>(null)
  const [obsoleta, setObsoleta] = useState(false)
  const [aGerar, setAGerar] = useState(false)
  const tentadoRef = useRef(false)

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

  // Auto-gera se não houver abertura hoje · uma vez por sessão
  useEffect(() => {
    if (abertura || tentadoRef.current || aGerar) return
    tentadoRef.current = true
    setAGerar(true)
    gerarAbertura().finally(() => setAGerar(false))
  }, [abertura, aGerar])

  const refrescar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof window === 'undefined') return
    localStorage.removeItem(ABERTURA_KEY)
    setAbertura(null)
    setAGerar(true)
    await gerarAbertura()
    setAGerar(false)
  }

  if (!abertura) {
    return (
      <div className="card-feature">
        <div className="flex items-center gap-2">
          <MessageCircle size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">a coach</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {aGerar ? (
            <>
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" />
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.3s' }} />
              <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.6s' }} />
              <span className="ml-2 text-faint text-[12px]">a olhar para os teus dados</span>
            </>
          ) : (
            <button
              onClick={refrescar}
              className="inline-flex items-center gap-2 text-soft text-[13px] hover:text-ouro active:scale-95"
            >
              <Sparkles size={13} strokeWidth={1.4} />
              gerar leitura de hoje
            </button>
          )}
        </div>
      </div>
    )
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
          <button
            onClick={refrescar}
            disabled={aGerar}
            aria-label="actualizar com dados recentes"
            className={`rounded-full p-1 hover:bg-ouro/10 active:scale-90 ${obsoleta ? 'text-ouro' : 'text-faint'}`}
          >
            <RefreshCw size={13} strokeWidth={1.5} className={aGerar ? 'animate-spin' : ''} />
          </button>
          <ArrowUpRight size={14} strokeWidth={1.3} className="text-faint" />
        </div>
      </div>
      <p className={`font-serif text-[16px] leading-[1.5] tracking-editorial mt-3 italic ${obsoleta ? 'opacity-60' : ''}`}>
        {preview}
        {corte < texto.length ? <span className="text-faint"> ...</span> : null}
      </p>
      {obsoleta ? (
        <p className="text-faint text-[10.5px] mt-2 leading-relaxed">
          tens dados novos · toca refrescar para a coach reler.
        </p>
      ) : null}
    </a>
  )
}
