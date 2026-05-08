'use client'

import { useEffect, useState } from 'react'
import { Wine, Check, ArrowUpRight } from 'lucide-react'
import { addAlcoolRegisto, getAlcoolRegistos, diasSemAlcool } from '@/lib/storage'
import { isoDate } from '@/lib/dates'

export default function AlcoolQuickCard() {
  const [streak, setStreak] = useState(0)
  const [hojeJaLimpo, setHojeJaLimpo] = useState(false)
  const [hojeBebeu, setHojeBebeu] = useState(false)

  const refresh = () => {
    setStreak(diasSemAlcool())
    const hoje = isoDate()
    const hojeRegs = getAlcoolRegistos().filter(r => r.timestamp.slice(0, 10) === hoje)
    setHojeJaLimpo(hojeRegs.length > 0 && !hojeRegs.some(r => r.decidiuBeber))
    setHojeBebeu(hojeRegs.some(r => r.decidiuBeber))
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('fenixfit:storage', handler)
    return () => window.removeEventListener('fenixfit:storage', handler)
  }, [])

  const marcarLimpo = () => {
    addAlcoolRegisto({
      emocao: 'neutro',
      gatilho: '',
      unidades: 0,
      decidiuBeber: false
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
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); marcarLimpo() }}
            className="rounded-md bg-oliva/15 px-3 py-1.5 text-[11px] text-oliva transition-elegant active:scale-95 hover:bg-oliva/25 inline-flex items-center gap-1.5"
          >
            <Check size={11} strokeWidth={1.6} />
            marcar hoje limpo
          </button>
        )}
      </div>
    </a>
  )
}
