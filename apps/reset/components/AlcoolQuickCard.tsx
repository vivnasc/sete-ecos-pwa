'use client'

import { useEffect, useState } from 'react'
import { Wine, Check, ArrowUpRight } from 'lucide-react'
import { addAlcoolRegisto, getAlcoolRegistos, diasSemAlcool } from '@/lib/storage'
import { isoDate } from '@/lib/dates'

export default function AlcoolQuickCard() {
  const [streak, setStreak] = useState(0)
  const [hojeJaLimpo, setHojeJaLimpo] = useState(false)
  const [hojeBebeu, setHojeBebeu] = useState(false)
  const [ontemRegistado, setOntemRegistado] = useState(false)

  const refresh = () => {
    setStreak(diasSemAlcool())
    const hoje = isoDate()
    const ontem = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
    const todos = getAlcoolRegistos()
    const hojeRegs = todos.filter(r => r.timestamp.slice(0, 10) === hoje)
    setHojeJaLimpo(hojeRegs.length > 0 && !hojeRegs.some(r => r.decidiuBeber))
    setHojeBebeu(hojeRegs.some(r => r.decidiuBeber))
    setOntemRegistado(todos.some(r => r.timestamp.slice(0, 10) === ontem))
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('fenixfit:storage', handler)
    return () => window.removeEventListener('fenixfit:storage', handler)
  }, [])

  const marcarLimpo = (offsetDias = 0) => {
    const d = new Date()
    d.setDate(d.getDate() - offsetDias)
    d.setHours(20, 0, 0, 0)
    addAlcoolRegisto({
      emocao: 'neutro',
      gatilho: '',
      unidades: 0,
      decidiuBeber: false,
      timestamp: d.toISOString()
    })
    refresh()
  }

  return (
    <a href="/alcool" className="card-solid block transition-elegant hover:bg-[var(--surface)]">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <Wine size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">copo · {streak} {streak === 1 ? 'dia limpo' : 'dias limpos'}</span>
        </div>
        <ArrowUpRight size={14} strokeWidth={1.3} className="text-faint" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={`editorial-num text-[36px] tnum leading-none ${streak > 0 ? 'text-oliva' : 'text-soft'}`}>
          {streak}
        </p>
        {hojeBebeu ? (
          <span className="text-[11px] text-terracota italic">hoje · registado bebeu</span>
        ) : hojeJaLimpo ? (
          <span className="text-[11px] text-oliva italic flex items-center gap-1">
            <Check size={11} strokeWidth={1.6} /> hoje limpo
          </span>
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); marcarLimpo(0) }}
            className="rounded-md bg-oliva/15 px-3 py-1.5 text-[11px] text-oliva transition-elegant active:scale-95 hover:bg-oliva/25 inline-flex items-center gap-1.5"
          >
            <Check size={11} strokeWidth={1.6} />
            marcar hoje limpo
          </button>
        )}
      </div>
      {/* Backdate · só mostra se ontem ainda não está registado */}
      {!ontemRegistado ? (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); marcarLimpo(1) }}
          className="mt-2 w-full text-[10.5px] text-faint hover:text-oliva text-left active:scale-[0.99]"
        >
          ↶ esqueci-me · ontem também sem álcool
        </button>
      ) : null}
    </a>
  )
}
