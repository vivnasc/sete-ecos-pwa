'use client'

import { useEffect, useState } from 'react'
import { todosOsDias, isoDate, mesCurto } from '@/lib/dates'
import { getTodosDias } from '@/lib/storage'
import { ANCORAS } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function HabitChains() {
  const [estado, setEstado] = useState<Record<string, Record<string, boolean>>>({})

  useEffect(() => {
    const refresh = () => {
      const dias = getTodosDias()
      const map: Record<string, Record<string, boolean>> = {}
      dias.forEach(d => {
        map[d.date] = d.ancoras
      })
      setEstado(map)
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const dias = todosOsDias()
  const hoje = isoDate()

  // Calcular streak por âncora
  const streakPorAncora = (id: string): number => {
    const datasOrdenadas = dias.map(d => isoDate(d)).filter(d => d <= hoje)
    let streak = 0
    for (let i = datasOrdenadas.length - 1; i >= 0; i--) {
      if (estado[datasOrdenadas[i]]?.[id]) streak++
      else break
    }
    return streak
  }

  // Compliance % por âncora
  const taxaPorAncora = (id: string): number => {
    const datasComDados = Object.keys(estado).filter(d => Object.values(estado[d]).some(Boolean))
    if (datasComDados.length === 0) return 0
    const cumpridos = datasComDados.filter(d => estado[d][id]).length
    return Math.round((cumpridos / datasComDados.length) * 100)
  }

  return (
    <div className="card-solid">
      <div className="flex items-baseline justify-between mb-4">
        <span className="label-cap">cadeias de hábito</span>
        <span className="label-soft">7 âncoras · 60 dias</span>
      </div>

      <div className="space-y-3 -mx-2 overflow-x-auto px-2">
        {ANCORAS.map(a => {
          const streak = streakPorAncora(a.id)
          const taxa = taxaPorAncora(a.id)
          return (
            <div key={a.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-soft truncate flex-1 mr-2">{a.titulo}</span>
                <span className="tnum text-faint shrink-0">
                  {streak > 0 && <span className="text-ouro mr-2">{streak}d</span>}
                  {taxa}%
                </span>
              </div>
              <div className="flex gap-[2px]">
                {dias.map((d, i) => {
                  const iso = isoDate(d)
                  const feito = !!estado[iso]?.[a.id]
                  const isFuturo = iso > hoje
                  const isHoje = iso === hoje
                  const temDados = !!estado[iso]
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 h-3 min-w-[3px] rounded-[1px] transition-elegant',
                        isFuturo
                          ? 'bg-[var(--hair)]'
                          : feito
                            ? 'bg-oliva'
                            : temDados
                              ? 'bg-terracota/30'
                              : 'bg-[var(--hair-strong)]/40',
                        isHoje && 'ring-1 ring-tinta dark:ring-creme'
                      )}
                      title={`${d.getDate()} ${mesCurto(d)} · ${feito ? '✓' : '—'}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-faint">
        <span>{mesCurto(dias[0])}</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-oliva" />
          <span>cumprida</span>
          <span className="h-2 w-2 rounded-sm bg-terracota/30 ml-2" />
          <span>falhou</span>
          <span className="h-2 w-2 rounded-sm bg-[var(--hair)] ml-2" />
          <span>—</span>
        </div>
        <span>{mesCurto(dias[dias.length - 1])}</span>
      </div>
    </div>
  )
}
