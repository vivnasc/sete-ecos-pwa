'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { todosOsDias, isoDate, fromIso, mesCurto } from '@/lib/dates'
import { getTodosDias } from '@/lib/storage'
import { ANCORAS } from '@/lib/data'

export default function Heatmap() {
  const [tudo, setTudo] = useState<Record<string, number>>({})

  useEffect(() => {
    const refresh = () => {
      const dias = getTodosDias()
      const map: Record<string, number> = {}
      dias.forEach(d => {
        map[d.date] = Object.values(d.ancoras).filter(Boolean).length
      })
      setTudo(map)
    }
    refresh()
    window.addEventListener('reset:storage', refresh)
    return () => window.removeEventListener('reset:storage', refresh)
  }, [])

  const dias = todosOsDias()
  const hoje = isoDate()

  const corPara = (cumpridas: number, isFuturo: boolean): string => {
    if (isFuturo) return 'bg-[var(--hair)]'
    if (cumpridas === 0) return 'bg-[var(--hair-strong)]'
    if (cumpridas <= 2) return 'bg-terracota/30'
    if (cumpridas <= 4) return 'bg-ouro/40'
    if (cumpridas <= 6) return 'bg-ouro/70'
    return 'bg-oliva'
  }

  // Group em colunas de 7 (semanas)
  const semanas: Date[][] = []
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7))
  }

  const total = ANCORAS.length

  return (
    <div className="card-solid">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">Constância · 60 dias</span>
        <span className="label-soft">{Object.keys(tudo).length} reg.</span>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
        {semanas.map((semana, si) => (
          <div key={si} className="flex flex-col gap-1">
            {semana.map(d => {
              const iso = isoDate(d)
              const cumpridas = tudo[iso] ?? 0
              const isFuturo = iso > hoje
              return (
                <Link
                  key={iso}
                  href={`/diario?d=${iso}`}
                  aria-label={`${d.getDate()} ${mesCurto(d)}: ${cumpridas} de ${total} âncoras`}
                  className={`h-4 w-4 rounded-sm transition-elegant hover:scale-125 ${corPara(cumpridas, isFuturo)} ${iso === hoje ? 'ring-1 ring-tinta dark:ring-creme' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-faint">
        <span>{mesCurto(dias[0])}</span>
        <div className="flex items-center gap-1">
          <span>menos</span>
          <span className="h-2 w-2 rounded-sm bg-[var(--hair-strong)]" />
          <span className="h-2 w-2 rounded-sm bg-terracota/30" />
          <span className="h-2 w-2 rounded-sm bg-ouro/40" />
          <span className="h-2 w-2 rounded-sm bg-ouro/70" />
          <span className="h-2 w-2 rounded-sm bg-oliva" />
          <span>mais</span>
        </div>
        <span>{mesCurto(dias[dias.length - 1])}</span>
      </div>
    </div>
  )
}
