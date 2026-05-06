'use client'

import { useEffect, useState } from 'react'
import { TREINO_SEMANAL, REGRAS_TREINO } from '@/lib/data'
import { diaSemana } from '@/lib/dates'
import { cn } from '@/lib/utils'

const ORDEM = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const

export default function TreinoPage() {
  const [hoje, setHoje] = useState<string>('')
  useEffect(() => { setHoje(diaSemana(new Date())) }, [])

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">treino</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">corpo já sabe</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">4× semana · 30min · halteres + peso corporal</p>
      </header>

      <section className="card-solid divide-y divide-[var(--hair)] !p-0">
        {ORDEM.map(dia => {
          const t = TREINO_SEMANAL[dia]
          const isHoje = dia === hoje
          return (
            <div
              key={dia}
              className={cn(
                'flex items-baseline gap-4 px-5 py-4 transition-elegant',
                isHoje && 'bg-ouro/5'
              )}
            >
              <span className={cn('w-16 shrink-0 text-[11px] uppercase tracking-cap', t.descanso ? 'text-faint' : 'text-ouro')}>
                {dia.slice(0, 3).toLowerCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('font-serif text-[16px] tracking-editorial', t.descanso ? 'text-soft' : '')}>{t.tipo}</p>
                <p className="text-faint mt-0.5 text-[12px]">{t.descricao}</p>
              </div>
              {isHoje ? <span className="text-[10px] uppercase tracking-cap text-ouro">hoje</span> : null}
            </div>
          )
        })}
      </section>

      <section className="card">
        <span className="label-cap mb-3 block">Regras</span>
        <ul className="space-y-2 text-[13.5px] leading-relaxed">
          {REGRAS_TREINO.map((r, i) => (
            <li key={i} className="flex gap-2 text-soft">
              <span className="mt-1 h-px w-3 shrink-0 bg-ouro" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-solid">
        <span className="label-cap text-terracota mb-2 block">Cuidado</span>
        <p className="text-soft text-[13.5px] leading-relaxed">
          se acordares antes da Cris e ela ficar a chorar enquanto treinas, pára. dia mau de treino é dia bom de mãe presente. amanhã retomas.
        </p>
      </section>
    </div>
  )
}
