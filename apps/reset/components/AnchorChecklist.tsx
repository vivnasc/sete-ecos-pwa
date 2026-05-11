'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { isoDate } from '@/lib/dates'
import { getDia, toggleAncora, ancorasResolvidas, type DiaLog } from '@/lib/storage'
import { getAncorasActivas } from '@/lib/profile'
import type { Ancora } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function AnchorChecklist({ date = isoDate() }: { date?: string }) {
  const [log, setLog] = useState<DiaLog | null>(null)
  const [ancoras, setAncoras] = useState<Ancora[]>([])

  useEffect(() => {
    setLog(getDia(date))
    setAncoras(getAncorasActivas())
    const onStorage = () => setLog(getDia(date))
    const onProfile = () => setAncoras(getAncorasActivas())
    window.addEventListener('fenixfit:storage', onStorage)
    window.addEventListener('fenixfit:profile', onProfile)
    return () => {
      window.removeEventListener('fenixfit:storage', onStorage)
      window.removeEventListener('fenixfit:profile', onProfile)
    }
  }, [date])

  if (!log) return <div className="card h-72 animate-breathe" aria-hidden />
  if (ancoras.length === 0) {
    return (
      <section className="card-solid text-center space-y-2">
        <span className="label-cap">Âncoras</span>
        <p className="text-soft text-[13px]">sem âncoras activas. escolhe em <a href="/definicoes" className="text-ouro underline">definições</a>.</p>
      </section>
    )
  }

  const efectivas = ancorasResolvidas(date, log.ancoras)
  const cumpridas = ancoras.filter(a => efectivas[a.id]).length

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="label-cap">Âncoras</span>
        <span className="label-soft tnum">
          <span className="text-tinta dark:text-creme">{cumpridas}</span> / {ancoras.length}
        </span>
      </div>
      <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
        {ancoras.map((a, idx) => {
          const manual = !!log.ancoras[a.id]
          const feita = !!efectivas[a.id]
          const auto = feita && !manual // resolvida automaticamente
          // detalhe especial para caderno_copo
          const detalheExtra = a.id === 'caderno_copo' && auto ? ' · automático · sem álcool registado' : ''
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
                  <span className="text-faint mt-0.5 block text-[12px]">{a.detalhe}{detalheExtra}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
