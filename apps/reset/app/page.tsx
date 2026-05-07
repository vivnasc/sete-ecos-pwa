'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, UtensilsCrossed } from 'lucide-react'
import SmartNow from '@/components/SmartNow'
import AnchorChecklist from '@/components/AnchorChecklist'
import JanelaTimer from '@/components/JanelaTimer'
import MorningPanel from '@/components/MorningPanel'
import WellnessQuickPanel from '@/components/WellnessQuickPanel'
import SonoDetailCard from '@/components/SonoDetailCard'
import PeriSintomasCard from '@/components/PeriSintomasCard'
import CoachGreetingCard from '@/components/CoachGreetingCard'
import QuickTools from '@/components/QuickTools'
import SafeBlock from '@/components/SafeBlock'
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
  pesoUltimo,
  variacaoPeso,
  jejumActualHoras,
  faseActualCiclo,
  nomeFase,
  macrosDoDia
} from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const [pronto, setPronto] = useState(false)
  const [nome, setNome] = useState('')
  const [tick, setTick] = useState(0)
  const [metrics, setMetrics] = useState({
    streak: 0,
    semAlcool: 0,
    pesoActual: null as number | null,
    pesoVar: null as number | null,
    fase: null as ReturnType<typeof faseActualCiclo>,
    jejum: null as ReturnType<typeof jejumActualHoras>,
    macros: { proteina: 0, carbo: 0, gordura: 0, calorias: 0, refeicoes: 0 },
    metas: { calorias: null as number | null, proteinaG: null as number | null, carboG: null as number | null, gorduraG: null as number | null }
  })

  useEffect(() => {
    const refresh = () => {
      const p = getProfile()
      setNome(p.nome)
      const v = variacaoPeso()
      setMetrics({
        streak: streakAncoras(),
        semAlcool: diasSemAlcool(),
        pesoActual: pesoUltimo(),
        pesoVar: v.semana,
        fase: faseActualCiclo(),
        jejum: jejumActualHoras(),
        macros: macrosDoDia(),
        metas: p.metas
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

  return (
    <div className="space-y-9 animate-fade-in">
      {/* MARCA + SAUDAÇÃO */}
      <header className="space-y-1 pt-4">
        {/* Marca · logo + wordmark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.svg"
              alt=""
              aria-hidden
              className="h-8 w-8 rounded-md"
            />
            <span
              className="font-serif text-[18px] tracking-editorial text-tinta dark:text-creme"
              style={{ fontWeight: 400, letterSpacing: '-0.01em' }}
            >
              FÉNIX<span className="text-ouro">FIT</span>
            </span>
          </div>
          <p className="label-soft">{formatarData(hoje)}</p>
        </div>
        <h1 className="font-serif text-[34px] font-light leading-[1.1] tracking-editorial sm:text-[40px] pt-5">
          {saudacao.charAt(0).toUpperCase() + saudacao.slice(1)}, <span className="italic">{nome || 'tu'}</span>.
        </h1>
        <div className="h-px w-12 bg-ouro mt-2" aria-hidden />
      </header>

      {/* RESUMO EDITORIAL */}
      {pronto ? (
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
      {pronto ? <SafeBlock nome="CoachGreeting"><CoachGreetingCard /></SafeBlock> : null}

      {/* ACESSO RÁPIDO · ferramentas principais */}
      {pronto ? <SafeBlock nome="QuickTools"><QuickTools /></SafeBlock> : null}

      {/* PAINEL MATINAL · ferramentas perto */}
      {pronto ? <SafeBlock nome="MorningPanel"><MorningPanel /></SafeBlock> : null}

      {/* SmartNow contextual */}
      {pronto ? <SafeBlock nome="SmartNow"><SmartNow /></SafeBlock> : null}

      {/* MANTRA */}
      <section className="text-center px-2">
        <p className="mantra-text text-soft">
          <span className="font-serif text-ouro">&ldquo;</span>
          {mantra}
          <span className="font-serif text-ouro">&rdquo;</span>
        </p>
      </section>

      {/* JANELA · adaptativa com timer */}
      {pronto ? <SafeBlock nome="JanelaTimer"><JanelaTimer /></SafeBlock> : null}

      {/* MACROS · refeições do dia */}
      {pronto ? (
        <Link href="/refeicoes" className="card-solid block transition-elegant hover:bg-[var(--surface)]">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={14} strokeWidth={1.4} className="text-ouro" />
              <span className="label-cap">refeições · hoje</span>
            </div>
            <span className="text-faint text-[11px] tnum">{metrics.macros.refeicoes}× hoje</span>
          </div>
          {metrics.macros.refeicoes > 0 ? (
            <>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <MacroMini label="kcal" valor={metrics.macros.calorias} alvo={metrics.metas.calorias} />
                <MacroMini label="P" valor={metrics.macros.proteina} alvo={metrics.metas.proteinaG} />
                <MacroMini label="C" valor={metrics.macros.carbo} alvo={metrics.metas.carboG} />
                <MacroMini label="G" valor={metrics.macros.gordura} alvo={metrics.metas.gorduraG} />
              </div>
              <p className="text-faint mt-2 text-[10.5px] tracking-cap uppercase">ver detalhe →</p>
            </>
          ) : (
            <p className="text-soft mt-3 text-[12.5px] leading-relaxed">
              ainda sem refeições. <span className="italic text-ouro">diz à coach o que comeste</span>.
            </p>
          )}
        </Link>
      ) : null}

      {/* ÂNCORAS */}
      {pronto ? <AnchorChecklist /> : null}

      {/* CORPO · água, suplementos, trânsito */}
      {pronto ? <SafeBlock nome="WellnessQuickPanel"><WellnessQuickPanel /></SafeBlock> : null}

      {/* SONO em detalhe */}
      {pronto ? <SafeBlock nome="SonoDetail"><SonoDetailCard /></SafeBlock> : null}

      {/* SINTOMAS peri (só F/O) */}
      {pronto ? <SafeBlock nome="PeriSintomas"><PeriSintomasCard /></SafeBlock> : null}

      {/* MÉTRICAS */}
      {pronto ? (
        <Link
          href="/metricas"
          className="card flex items-center justify-between gap-4 transition-elegant hover:bg-[var(--surface)]"
        >
          <div>
            <span className="label-cap">aprofundar</span>
            <p className="mt-1 font-serif text-[18px]">ver todos os sinais</p>
            <p className="text-faint text-[12px]">streak · sem copo · cintura · sono · heatmap</p>
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

function MacroMini({ label, valor, alvo }: { label: string; valor: number; alvo: number | null }) {
  if (alvo === null || alvo <= 0) {
    return (
      <div>
        <p className="editorial-num text-[20px] tnum leading-none text-soft">{Math.round(valor)}</p>
        <p className="text-faint text-[9.5px] uppercase tracking-cap mt-1">{label}</p>
        <p className="text-faint text-[8.5px] tnum">—</p>
      </div>
    )
  }
  const pct = Math.round((valor / alvo) * 100)
  const acima = valor > alvo
  const cor = acima ? 'text-ouro' : valor >= alvo * 0.7 ? 'text-soft' : 'text-faint'
  return (
    <div>
      <p className={`editorial-num text-[20px] tnum leading-none ${cor}`}>{Math.round(valor)}</p>
      <p className="text-faint text-[9.5px] uppercase tracking-cap mt-1">{label}</p>
      <p className="text-faint text-[8.5px] tnum">{pct}%</p>
    </div>
  )
}

