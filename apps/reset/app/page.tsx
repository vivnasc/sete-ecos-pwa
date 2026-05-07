'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Scale, Clock, Sparkles } from 'lucide-react'
import SmartNow from '@/components/SmartNow'
import AnchorChecklist from '@/components/AnchorChecklist'
import JanelaTimer from '@/components/JanelaTimer'
import MorningPanel from '@/components/MorningPanel'
import CoachGreetingCard from '@/components/CoachGreetingCard'
import { MANTRAS } from '@/lib/data'
import {
  RESET_DAYS,
  diaDoPlano,
  diasAteInicio,
  statusDoDia,
  formatarData
} from '@/lib/dates'
import {
  streakAncoras,
  diasSemAlcool,
  variacaoCintura,
  sonoMedio,
  pesoUltimo,
  variacaoPeso,
  jejumActualHoras,
  diaActualCiclo,
  faseActualCiclo,
  nomeFase,
  savePeso,
  getPesoHoje
} from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const [pronto, setPronto] = useState(false)
  const [nome, setNome] = useState('')
  const [sexo, setSexo] = useState<'F' | 'M' | 'O'>('F')
  const [pesoInput, setPesoInput] = useState('')
  const [pesoHojeReg, setPesoHojeReg] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const [metrics, setMetrics] = useState({
    streak: 0,
    semAlcool: 0,
    cintura: null as number | null,
    sono: null as number | null,
    pesoActual: null as number | null,
    pesoVar: null as number | null,
    diaCiclo: null as number | null,
    fase: null as ReturnType<typeof faseActualCiclo>,
    jejum: null as ReturnType<typeof jejumActualHoras>
  })

  useEffect(() => {
    const refresh = () => {
      const p = getProfile()
      setNome(p.nome)
      setSexo(p.sexo)
      const ph = getPesoHoje()
      setPesoHojeReg(ph?.peso ?? null)
      const v = variacaoPeso()
      setMetrics({
        streak: streakAncoras(),
        semAlcool: diasSemAlcool(),
        cintura: variacaoCintura(),
        sono: sonoMedio(),
        pesoActual: pesoUltimo(),
        pesoVar: v.semana,
        diaCiclo: diaActualCiclo(),
        fase: faseActualCiclo(),
        jejum: jejumActualHoras()
      })
    }
    refresh()
    setPronto(true)
    window.addEventListener('fenixfit:storage', refresh)
    window.addEventListener('fenixfit:profile', refresh)
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      window.removeEventListener('fenixfit:profile', refresh)
      clearInterval(interval)
    }
  }, [])

  // Tick atualiza jejum em curso
  useEffect(() => {
    setMetrics(m => ({ ...m, jejum: jejumActualHoras() }))
  }, [tick])

  const status = statusDoDia()
  const hoje = new Date()
  const dia = diaDoPlano()
  const mantra = MANTRAS[(Math.max(1, dia) - 1) % MANTRAS.length]
  const hora = hoje.getHours()
  const saudacao = hora < 6 ? 'boa madrugada' : hora < 12 ? 'bom dia' : hora < 19 ? 'boa tarde' : 'boa noite'

  const submitPeso = () => {
    const n = Number(pesoInput)
    if (isNaN(n) || n < 30 || n > 250) return
    const horaStr = `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`
    savePeso({ date: hoje.toISOString().slice(0, 10), peso: n, cintura: null, hora: horaStr, notas: '' })
    setPesoInput('')
  }

  return (
    <div className="space-y-9 animate-fade-in">
      {/* MARCA + SAUDAÇÃO */}
      <header className="space-y-1 pt-4">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-[12px] tracking-cap uppercase text-ouro">FénixFit</p>
          <p className="label-soft">{formatarData(hoje).toLowerCase()}</p>
        </div>
        <h1 className="font-serif text-[34px] font-light leading-[1.1] tracking-editorial sm:text-[40px] pt-2">
          {saudacao}, <span className="italic">{nome.toLowerCase() || 'tu'}</span>.
        </h1>
        <div className="h-px w-12 bg-ouro mt-2" aria-hidden />
      </header>

      {/* RESUMO EDITORIAL */}
      {pronto && status === 'durante' ? (
        <ResumoEditorial
          dia={dia}
          metrics={metrics}
        />
      ) : null}

      {status === 'antes' ? (
        <section className="card-feature text-center">
          <span className="label-cap">contagem</span>
          <p className="editorial-num mt-3 text-[64px] leading-none">{diasAteInicio()}</p>
          <p className="label-soft mt-2">{diasAteInicio() === 1 ? 'dia até começar' : 'dias até começar'}</p>
          <div className="mx-auto mt-5 h-px w-8 bg-ouro" aria-hidden />
          <p className="text-soft mt-5 text-[13px] leading-relaxed">
            descansa. compras sábado. prep no domingo. começas 11 maio.
          </p>
        </section>
      ) : null}

      {/* COACH · saudação do dia */}
      {pronto && status === 'durante' ? <CoachGreetingCard /> : null}

      {/* PAINEL MATINAL · ferramentas perto */}
      {status === 'durante' ? <MorningPanel /> : null}

      {/* SmartNow contextual */}
      {status === 'durante' ? <SmartNow /> : null}

      {/* MANTRA */}
      <section className="text-center px-2">
        <p className="mantra-text text-soft">
          <span className="font-serif text-ouro">&ldquo;</span>
          {mantra}
          <span className="font-serif text-ouro">&rdquo;</span>
        </p>
      </section>

      {/* JANELA · adaptativa com timer */}
      {pronto && status === 'durante' ? <JanelaTimer /> : null}

      {/* PESO QUICK ADD */}
      {status === 'durante' ? (
        <section className="card-solid">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <Scale size={14} strokeWidth={1.4} className="text-ouro" />
              <span className="label-cap">peso · hoje</span>
            </div>
            {metrics.pesoVar !== null ? (
              <span className={cn(
                'text-[11px] tnum',
                metrics.pesoVar > 0 ? 'text-terracota' : metrics.pesoVar < 0 ? 'text-oliva' : 'text-faint'
              )}>
                {metrics.pesoVar > 0 ? '+' : ''}{metrics.pesoVar} kg / 7d
              </span>
            ) : null}
          </div>

          {pesoHojeReg !== null ? (
            <div className="mt-3 flex items-baseline justify-between">
              <p className="editorial-num text-[40px] leading-none">{pesoHojeReg}<span className="text-faint text-[14px] ml-1">kg</span></p>
              <Link href="/peso" className="btn-ghost text-[11px]">ver tendência →</Link>
            </div>
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="30"
                max="250"
                value={pesoInput}
                onChange={e => setPesoInput(e.target.value)}
                placeholder="—"
                className="editorial-num w-24 border-0 bg-transparent text-[40px] tnum focus:outline-none"
                style={{ caretColor: 'var(--ouro)' }}
              />
              <span className="text-faint text-[14px] pb-2">kg</span>
              <button
                onClick={submitPeso}
                disabled={!pesoInput}
                className="ml-auto btn-primary px-4 py-2 text-[12px]"
              >
                registar
              </button>
            </div>
          )}
        </section>
      ) : null}

      {/* CICLO chip */}
      {pronto && sexo !== 'M' && metrics.diaCiclo !== null && metrics.fase !== null ? (
        <Link href="/ciclo" className="card flex items-center justify-between gap-3 transition-elegant hover:bg-[var(--surface)]">
          <div>
            <span className="label-cap">ciclo · dia {metrics.diaCiclo}</span>
            <p className="font-serif text-[18px] mt-1 italic text-ouro tracking-editorial">{nomeFase(metrics.fase)}</p>
          </div>
          <ArrowUpRight size={16} strokeWidth={1.3} className="text-faint" />
        </Link>
      ) : null}

      {/* ÂNCORAS */}
      {status === 'durante' ? <AnchorChecklist /> : null}

      {/* MÉTRICAS */}
      {pronto && status === 'durante' ? (
        <section className="grid grid-cols-2 gap-3">
          <Big
            label="constância"
            value={metrics.streak}
            unit={metrics.streak === 1 ? 'dia' : 'dias'}
            hint="≥ 5 âncoras"
          />
          <Big
            label="sem álcool"
            value={metrics.semAlcool}
            unit={metrics.semAlcool === 1 ? 'dia' : 'dias'}
          />
          <Big
            label="cintura"
            value={metrics.cintura === null ? '—' : `${metrics.cintura > 0 ? '+' : ''}${metrics.cintura}`}
            unit={metrics.cintura === null ? '' : 'cm'}
            hint="desde início"
          />
          <Big
            label="sono"
            value={metrics.sono === null ? '—' : metrics.sono}
            unit={metrics.sono === null ? '' : 'h'}
            hint="média 7d"
          />
        </section>
      ) : null}

      {status === 'durante' ? (
        <Link
          href="/metricas"
          className="card flex items-center justify-between gap-4 transition-elegant hover:bg-[var(--surface)]"
        >
          <div>
            <span className="label-cap">aprofundar</span>
            <p className="mt-1 font-serif text-[18px]">ver todos os sinais</p>
            <p className="text-faint text-[12px]">heatmap · padrões · gráficos</p>
          </div>
          <ArrowUpRight size={18} strokeWidth={1.4} className="text-faint" />
        </Link>
      ) : null}
    </div>
  )
}

function ResumoEditorial({
  dia,
  metrics
}: {
  dia: number
  metrics: { pesoActual: number | null; pesoVar: number | null; streak: number; semAlcool: number; jejum: { horas: number } | null; fase: ReturnType<typeof faseActualCiclo> }
}) {
  // Linha narrativa editorial
  const partes: string[] = []
  partes.push(`dia ${String(dia).padStart(2, '0')} de ${RESET_DAYS}`)
  if (metrics.streak > 0) partes.push(`${metrics.streak} ${metrics.streak === 1 ? 'dia' : 'dias'} de constância`)
  if (metrics.semAlcool > 0) partes.push(`${metrics.semAlcool} sem copo`)
  if (metrics.jejum && metrics.jejum.horas >= 14) partes.push(`em jejum há ${Math.floor(metrics.jejum.horas)}h`)
  if (metrics.fase) partes.push(`fase ${nomeFase(metrics.fase)}`)

  return (
    <section className="border-l border-ouro/40 pl-4">
      <p className="text-soft text-[14.5px] leading-[1.7] italic">
        {partes.join(' · ')}.
      </p>
    </section>
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
      {hint ? <p className="text-faint mt-2 text-[10px] tracking-cap uppercase">{hint}</p> : null}
    </div>
  )
}
