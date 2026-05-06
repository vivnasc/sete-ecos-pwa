'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { ANCORAS } from '@/lib/data'
import { isoDate } from '@/lib/dates'
import { getDia, toggleAncora, type DiaLog } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function AnchorChecklist({ date = isoDate() }: { date?: string }) {
  const [log, setLog] = useState<DiaLog | null>(null)

  useEffect(() => {
    setLog(getDia(date))
    const onUpdate = () => setLog(getDia(date))
    window.addEventListener('reset:storage', onUpdate)
    return () => window.removeEventListener('reset:storage', onUpdate)
  }, [date])

  if (!log) return <div className="h-72 animate-pulse rounded-2xl bg-creme-escuro/40" aria-hidden />

  const cumpridas = ANCORAS.filter(a => log.ancoras[a.id]).length

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <span className="label-cap">Âncoras de hoje</span>
        <span className="font-serif text-sm text-cinza">
          <span className="text-ouro">{cumpridas}</span> / {ANCORAS.length}
        </span>
      </div>
      <ul className="space-y-2">
        {ANCORAS.map((a, idx) => {
          const feita = !!log.ancoras[a.id]
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  setLog(toggleAncora(date, a.id))
                }}
                aria-pressed={feita}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl bg-white/60 p-3 text-left ring-1 transition active:scale-[0.99]',
                  feita ? 'ring-oliva/40 bg-oliva/5' : 'ring-ouro/15 hover:bg-white/90'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition',
                    feita ? 'bg-oliva text-creme' : 'border border-castanho/30 bg-creme'
                  )}
                  aria-hidden
                >
                  {feita ? <Check size={14} strokeWidth={3} /> : <span className="text-xs text-cinza">{idx + 1}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block font-medium', feita && 'text-castanho')}>{a.titulo}</span>
                  <span className="block text-xs text-cinza">{a.detalhe}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
