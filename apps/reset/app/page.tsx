'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Wine, Ruler, Salad, Dumbbell } from 'lucide-react'
import Mantra from '@/components/Mantra'
import AnchorChecklist from '@/components/AnchorChecklist'
import MetricCard from '@/components/MetricCard'
import {
  RESET_DAYS,
  diaDoPlano,
  diasAteInicio,
  statusDoDia,
  diaSemana,
  formatarData,
  RESET_START
} from '@/lib/dates'
import { TREINO_SEMANAL } from '@/lib/data'
import {
  streakAncoras,
  diasSemAlcool,
  variacaoCintura,
  sonoMedio,
  complianceAncora
} from '@/lib/storage'

export default function HomePage() {
  const [pronto, setPronto] = useState(false)
  const [metrics, setMetrics] = useState({
    streak: 0,
    semAlcool: 0,
    cintura: null as number | null,
    sono: null as number | null,
    ecra21: { feitos: 0, total: 0 },
    pa9: { feitos: 0, total: 0 }
  })

  useEffect(() => {
    const refresh = () => {
      setMetrics({
        streak: streakAncoras(),
        semAlcool: diasSemAlcool(),
        cintura: variacaoCintura(),
        sono: sonoMedio(),
        ecra21: complianceAncora('ecra_21h'),
        pa9: complianceAncora('pa_proteina')
      })
    }
    refresh()
    setPronto(true)
    window.addEventListener('reset:storage', refresh)
    return () => window.removeEventListener('reset:storage', refresh)
  }, [])

  const status = statusDoDia()
  const hoje = new Date()
  const dow = diaSemana(hoje)
  const treinoHoje = TREINO_SEMANAL[dow]

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-2 text-center">
        <p className="label-cap">{formatarData(hoje, true)}</p>
        <h1 className="titulo-serif text-4xl sm:text-5xl">
          {status === 'antes' && 'antes do início'}
          {status === 'durante' && (
            <>
              Dia <span className="text-ouro">{diaDoPlano()}</span>
              <span className="text-cinza"> / {RESET_DAYS}</span>
            </>
          )}
          {status === 'depois' && 'jornada concluída'}
        </h1>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      <Mantra />

      {status === 'antes' ? (
        <div className="card text-center">
          <p className="font-serif text-2xl text-castanho">{diasAteInicio()} dias</p>
          <p className="mt-2 text-sm text-cinza">
            até <span className="text-castanho">{formatarData(RESET_START, true)}</span>
          </p>
          <p className="mt-4 text-xs text-cinza">descansa. faz compras sábado. prepara domingo. começa segunda.</p>
        </div>
      ) : null}

      {status === 'durante' ? <AnchorChecklist /> : null}

      {pronto && status !== 'antes' ? (
        <section className="space-y-3">
          <span className="label-cap px-1">Sinais</span>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Streak"
              value={metrics.streak}
              unit={metrics.streak === 1 ? 'dia' : 'dias'}
              hint="≥5 âncoras seguidas"
              tone="ouro"
            />
            <MetricCard
              label="Sem álcool"
              value={metrics.semAlcool}
              unit={metrics.semAlcool === 1 ? 'dia' : 'dias'}
              tone="oliva"
            />
            <MetricCard
              label="Cintura"
              value={metrics.cintura === null ? '—' : metrics.cintura > 0 ? `+${metrics.cintura}` : metrics.cintura}
              unit={metrics.cintura === null ? '' : 'cm'}
              hint={metrics.cintura === null ? 'mede na semana 2' : 'desde o início'}
              tone="terracota"
            />
            <MetricCard
              label="Sono"
              value={metrics.sono === null ? '—' : metrics.sono}
              unit={metrics.sono === null ? '' : 'h/noite'}
              hint="média 7 dias"
              tone="castanho"
            />
          </div>
        </section>
      ) : null}

      {status === 'durante' ? (
        <section className="card-solid">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="label-cap">Treino · {dow.toLowerCase()}</span>
              <p className="mt-1 font-serif text-xl text-castanho">{treinoHoje.tipo}</p>
              <p className="mt-1 text-sm text-cinza">{treinoHoje.descricao}</p>
            </div>
            <Link
              href="/treino"
              className="shrink-0 rounded-full bg-creme-escuro/60 p-2 text-castanho/70 transition hover:bg-creme-escuro"
              aria-label="Ver plano de treino"
            >
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <Link href="/alcool" className="card flex flex-col gap-2 transition hover:bg-white/80">
          <Wine size={20} className="text-terracota" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-base text-castanho">Caderno antes do copo</p>
            <p className="text-xs text-cinza">hora · emoção · gatilho</p>
          </div>
        </Link>
        <Link href="/medidas" className="card flex flex-col gap-2 transition hover:bg-white/80">
          <Ruler size={20} className="text-ouro" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-base text-castanho">Medidas</p>
            <p className="text-xs text-cinza">cintura · ancas · foto</p>
          </div>
        </Link>
        <Link href="/receitas" className="card flex flex-col gap-2 transition hover:bg-white/80">
          <Salad size={20} className="text-oliva" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-base text-castanho">Comer</p>
            <p className="text-xs text-cinza">keto · janela 9–19h</p>
          </div>
        </Link>
        <Link href="/treino" className="card flex flex-col gap-2 transition hover:bg-white/80">
          <Dumbbell size={20} className="text-castanho" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-base text-castanho">Treino</p>
            <p className="text-xs text-cinza">4x semana · 30min</p>
          </div>
        </Link>
      </section>

      {status === 'durante' ? (
        <section className="space-y-2">
          <span className="label-cap px-1">Conformidade · 14 dias</span>
          <div className="card flex items-center justify-between gap-4 text-sm">
            <span>Ecrã off às 21h</span>
            <span className="font-serif text-ouro">
              {metrics.ecra21.feitos}/{metrics.ecra21.total}
            </span>
          </div>
          <div className="card flex items-center justify-between gap-4 text-sm">
            <span>PA com proteína na 1ª hora</span>
            <span className="font-serif text-ouro">
              {metrics.pa9.feitos}/{metrics.pa9.total}
            </span>
          </div>
          <Link href="/insights" className="card-solid flex items-center justify-between gap-3 transition hover:bg-creme-escuro/30">
            <div>
              <p className="font-serif text-base text-castanho">Insights da semana</p>
              <p className="text-xs text-cinza">padrões nos teus dados</p>
            </div>
            <ArrowRight size={18} className="text-cinza" />
          </Link>
        </section>
      ) : null}
    </div>
  )
}
