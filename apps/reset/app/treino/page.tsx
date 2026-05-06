'use client'

import { Dumbbell } from 'lucide-react'
import { TREINO_SEMANAL, REGRAS_TREINO } from '@/lib/data'
import { diaSemana } from '@/lib/dates'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const ORDEM = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const

export default function TreinoPage() {
  const [hoje, setHoje] = useState<string>('')
  useEffect(() => {
    setHoje(diaSemana(new Date()))
  }, [])

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Treino</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">corpo já sabe</h1>
        <p className="text-sm text-cinza">4x semana · 30min · halteres + peso corporal</p>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      <section className="space-y-2">
        {ORDEM.map(dia => {
          const t = TREINO_SEMANAL[dia]
          const isHoje = dia === hoje
          return (
            <div
              key={dia}
              className={cn(
                'card-solid flex items-start gap-3 transition',
                isHoje && 'ring-2 ring-ouro'
              )}
            >
              <div className="shrink-0">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    t.descanso ? 'bg-creme-escuro/60 text-cinza' : 'bg-ouro/15 text-ouro'
                  )}
                >
                  <Dumbbell size={20} strokeWidth={1.5} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-serif text-lg text-castanho">{dia}</p>
                  {isHoje ? <span className="text-[10px] uppercase tracking-wider text-ouro">hoje</span> : null}
                </div>
                <p className="text-sm font-medium text-castanho/80">{t.tipo}</p>
                <p className="mt-0.5 text-xs text-cinza">{t.descricao}</p>
              </div>
            </div>
          )
        })}
      </section>

      <section className="card space-y-3">
        <span className="label-cap">Regras</span>
        <ul className="space-y-1.5 text-sm">
          {REGRAS_TREINO.map((r, i) => (
            <li key={i} className="flex gap-2 text-castanho/80">
              <span className="text-ouro">·</span>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-solid space-y-2">
        <span className="label-cap text-terracota">Cuidado</span>
        <p className="text-sm text-castanho/80">se acordares antes da Cris e ela ficar a chorar enquanto treinas, pára. dia mau de treino é dia bom de mãe presente. amanhã retomas.</p>
      </section>
    </div>
  )
}
