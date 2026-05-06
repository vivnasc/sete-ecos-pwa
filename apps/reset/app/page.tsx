'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import SmartNow from '@/components/SmartNow'
import AnchorChecklist from '@/components/AnchorChecklist'
import { MANTRAS } from '@/lib/data'
import {
  RESET_DAYS,
  diaDoPlano,
  diasAteInicio,
  statusDoDia,
  formatarData,
  RESET_START,
  mes
} from '@/lib/dates'
import {
  streakAncoras,
  diasSemAlcool,
  variacaoCintura,
  sonoMedio
} from '@/lib/storage'
import { getProfile } from '@/lib/profile'

export default function HomePage() {
  const [pronto, setPronto] = useState(false)
  const [nome, setNome] = useState('')
  const [metrics, setMetrics] = useState({
    streak: 0,
    semAlcool: 0,
    cintura: null as number | null,
    sono: null as number | null
  })

  useEffect(() => {
    const refresh = () => {
      setMetrics({
        streak: streakAncoras(),
        semAlcool: diasSemAlcool(),
        cintura: variacaoCintura(),
        sono: sonoMedio()
      })
      setNome(getProfile().nome)
    }
    refresh()
    setPronto(true)
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const status = statusDoDia()
  const hoje = new Date()
  const dia = diaDoPlano()
  const mantra = MANTRAS[(Math.max(1, dia) - 1) % MANTRAS.length]

  return (
    <div className="space-y-10 animate-fade-in">
      {/* HEADER editorial */}
      <header className="space-y-2 pt-4">
        <p className="label-soft">{formatarData(hoje, true).toLowerCase()}</p>
        <h1 className="font-serif text-[44px] font-light leading-[1.05] tracking-editorial sm:text-[52px]">
          {status === 'antes' && 'antes do início'}
          {status === 'durante' && (
            <>
              <span className="tnum text-tinta dark:text-creme">{String(dia).padStart(2, '0')}</span>
              <span className="text-faint"> / {RESET_DAYS}</span>
            </>
          )}
          {status === 'depois' && 'concluído'}
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      <SmartNow />

      {/* MANTRA editorial */}
      <section className="text-center px-2">
        <p className="mantra-text text-soft">
          <span className="font-serif text-ouro">“</span>
          {mantra}
          <span className="font-serif text-ouro">”</span>
        </p>
      </section>

      {/* ESTADO antes do início */}
      {status === 'antes' ? (
        <section className="card-feature text-center">
          <p className="label-cap">contagem</p>
          <p className="editorial-num mt-3 text-[60px] leading-none">{diasAteInicio()}</p>
          <p className="label-soft mt-2">{diasAteInicio() === 1 ? 'dia' : 'dias'} até começar</p>
          <div className="mx-auto mt-5 h-px w-8 bg-ouro" aria-hidden />
          <p className="text-soft mt-5 text-[14px] leading-relaxed">
            descansa. compras sábado. prep no domingo. começas {formatarData(RESET_START)}.
          </p>
        </section>
      ) : null}

      {/* CHECKLIST âncoras */}
      {status === 'durante' ? <AnchorChecklist /> : null}

      {/* MÉTRICAS editorial — duas grandes em coluna */}
      {pronto && status !== 'antes' ? (
        <section className="grid grid-cols-2 gap-4">
          <Big
            label="Constância"
            value={metrics.streak}
            unit={metrics.streak === 1 ? 'dia' : 'dias'}
            hint="≥ 5 âncoras"
          />
          <Big
            label="Sem álcool"
            value={metrics.semAlcool}
            unit={metrics.semAlcool === 1 ? 'dia' : 'dias'}
          />
          <Big
            label="Cintura"
            value={metrics.cintura === null ? '—' : `${metrics.cintura > 0 ? '+' : ''}${metrics.cintura}`}
            unit={metrics.cintura === null ? '' : 'cm'}
            hint="desde o início"
          />
          <Big
            label="Sono"
            value={metrics.sono === null ? '—' : metrics.sono}
            unit={metrics.sono === null ? '' : 'h'}
            hint="média 7 dias"
          />
        </section>
      ) : null}

      {/* LINK PARA SINAIS */}
      {status !== 'antes' ? (
        <Link
          href="/metricas"
          className="card flex items-center justify-between gap-4 transition-elegant hover:bg-[var(--surface)]"
        >
          <div>
            <p className="label-cap">aprofundar</p>
            <p className="mt-1 font-serif text-[18px]">ver todos os sinais</p>
            <p className="text-faint text-[12px]">heatmap · padrões · gráficos</p>
          </div>
          <ArrowUpRight size={18} strokeWidth={1.4} className="text-faint" />
        </Link>
      ) : null}
    </div>
  )
}

function Big({ label, value, unit, hint }: { label: string; value: number | string; unit?: string; hint?: string }) {
  return (
    <div className="card-solid">
      <span className="label-cap">{label}</span>
      <p className="editorial-num mt-3 text-[40px] leading-none">
        {value}
        {unit ? <span className="ml-1 text-[14px] text-faint">{unit}</span> : null}
      </p>
      {hint ? <p className="label-soft mt-2 text-[10px] normal-case tracking-normal">{hint}</p> : null}
    </div>
  )
}
