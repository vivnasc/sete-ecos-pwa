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

  if (!log) return <div className="card h-72 animate-breathe" aria-hidden />

  const cumpridas = ANCORAS.filter(a => log.ancoras[a.id]).length

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="label-cap">Âncoras</span>
        <span className="label-soft tnum">
          <span className="text-tinta dark:text-creme">{cumpridas}</span> / {ANCORAS.length}
        </span>
      </div>
      <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
        {ANCORAS.map((a, idx) => {
          const feita = !!log.ancoras[a.id]
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setLog(toggleAncora(date, a.id))}
                aria-pressed={feita}
                className={cn(
                  'group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-elegant active:scale-[0.99]',
                  feita ? 'opacity-90' : 'hover:bg-[var(--surface-soft)]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-elegant',
                    feita ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta' : 'border border-[var(--hair-strong)]'
                  )}
                  aria-hidden
                >
                  {feita ? <Check size={11} strokeWidth={3} /> : <span className="text-[9px] text-faint">{String(idx + 1).padStart(2, '0')}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-[14.5px]', feita ? 'text-soft line-through decoration-[var(--hair-strong)]' : 'text-tinta dark:text-creme-escuro')}>
                    {a.titulo}
                  </span>
                  <span className="text-faint mt-0.5 block text-[12px]">{a.detalhe}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
