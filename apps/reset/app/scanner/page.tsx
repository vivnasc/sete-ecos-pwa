'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, AlertCircle, TrendingUp, TrendingDown, Activity, Award, Target } from 'lucide-react'
import {
  pontuarDia,
  pontuacaoMedia7d,
  correlacoesProfundas,
  detectarAnomalias,
  melhoresDias,
  projeccao14d,
  type PontuacaoDia,
  type Correlacao,
  type Anomalia,
  type Projeccao
} from '@/lib/scanner'
import { getTodosDias } from '@/lib/storage'
import { isoDate, fromIso, formatarData, mesCurto } from '@/lib/dates'
import BackButton from '@/components/BackButton'
import HabitChains from '@/components/HabitChains'
import TrendChart from '@/components/TrendChart'
import { cn } from '@/lib/utils'

export default function ScannerPage() {
  const [hoje, setHoje] = useState<PontuacaoDia | null>(null)
  const [media7, setMedia7] = useState<number | null>(null)
  const [correlacoes, setCorrelacoes] = useState<Correlacao[]>([])
  const [anomalias, setAnomalias] = useState<Anomalia[]>([])
  const [melhores, setMelhores] = useState<PontuacaoDia[]>([])
  const [projeccao, setProjeccao] = useState<Projeccao | null>(null)
  const [pontuacaoSerie, setPontuacaoSerie] = useState<{ x: string; y: number }[]>([])

  useEffect(() => {
    const refresh = () => {
      setHoje(pontuarDia(isoDate()))
      setMedia7(pontuacaoMedia7d())
      setCorrelacoes(correlacoesProfundas())
      setAnomalias(detectarAnomalias())
      setMelhores(melhoresDias(5))
      setProjeccao(projeccao14d())

      // Série temporal de pontuação
      const dias = getTodosDias().slice(-30)
      const pontos = dias
        .map(d => {
          const p = pontuarDia(d.date)
          if (!p) return null
          const data = fromIso(d.date)
          return { x: `${data.getDate()}${mesCurto(data).charAt(0)}`, y: p.total }
        })
        .filter((p): p is { x: string; y: number } => p !== null)
      setPontuacaoSerie(pontos)
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">scanner</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          o teu corpo <em className="italic">em dados</em>
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          análise multi-variável · padrões cruzados · sem julgamento, só leitura.
        </p>
      </header>

      {/* PONTUAÇÃO HOJE */}
      {hoje ? (
        <section className="card-feature">
          <div className="flex items-baseline justify-between">
            <span className="label-cap">hoje</span>
            <span className="label-soft">{hoje.qualitativo}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className={cn(
              'editorial-num text-[80px] leading-none tnum',
              hoje.total >= 85 ? 'text-oliva' : hoje.total >= 65 ? 'text-ouro' : hoje.total >= 45 ? 'text-tinta dark:text-creme-escuro' : 'text-terracota'
            )}>
              {hoje.total}
            </p>
            <span className="text-faint text-[18px]">/ 100</span>
          </div>

          <div className="mt-5 space-y-2">
            {hoje.componentes.map(c => (
              <div key={c.label}>
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="label-soft">{c.label}</span>
                  <span className="tnum text-faint">{Math.round(c.score)} / {c.max}</span>
                </div>
                <div className="mt-1 h-px w-full bg-[var(--hair)] overflow-hidden">
                  <div
                    className="h-px bg-ouro transition-all duration-500"
                    style={{ width: `${(c.score / c.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="card text-center text-soft text-[13px]">
          regista pelo menos um dia para ver a pontuação.
        </div>
      )}

      {/* TIMELINE PONTUAÇÃO */}
      {pontuacaoSerie.length >= 3 ? (
        <section className="space-y-2">
          <span className="label-cap px-1">pontuação · 30 dias</span>
          <TrendChart pontos={pontuacaoSerie} unidade="" cor="var(--ouro)" altura={140} vazio="ainda sem série" />
        </section>
      ) : null}

      {/* HABIT CHAINS */}
      <section className="space-y-2">
        <HabitChains />
      </section>

      {/* MÉDIA 7 DIAS */}
      {media7 !== null ? (
        <section className="card-solid flex items-baseline justify-between sm:max-w-md">
          <div>
            <span className="label-cap">média 7 dias</span>
            <p className="text-faint text-[11px] mt-1">a tua linha de base</p>
          </div>
          <p className={cn(
            'editorial-num text-[40px] tnum',
            media7 >= 75 ? 'text-oliva' : media7 >= 55 ? 'text-ouro' : 'text-soft'
          )}>
            {media7}
          </p>
        </section>
      ) : null}

      {/* PADRÕES PROFUNDOS */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <span className="label-cap">padrões cruzados</span>
          <span className="label-soft">{correlacoes.length}</span>
        </div>
        {correlacoes.length === 0 ? (
          <div className="card text-center">
            <p className="text-soft text-[13px]">os padrões aparecem com mais dados.</p>
            <p className="text-faint mt-1 text-[12px]">~7 dias de registos contínuos.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {correlacoes.map(c => (
              <CorrelacaoCard key={c.id} c={c} />
            ))}
          </ul>
        )}
      </section>

      {/* ANOMALIAS */}
      {anomalias.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <span className="label-cap">anomalias · estranhezas</span>
            <span className="label-soft">{anomalias.length}</span>
          </div>
          <ul className="space-y-2">
            {anomalias.map((a, i) => (
              <li key={i} className="card-solid">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} strokeWidth={1.4} className="mt-1 shrink-0 text-terracota" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[15px] tracking-editorial">
                      {formatarData(fromIso(a.date), true)} · {a.campo}
                    </p>
                    <p className="text-soft mt-1 text-[13px] leading-relaxed">{a.pergunta}</p>
                    <p className="text-faint mt-1 text-[11px]">esperado: {a.esperado}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* MELHORES DIAS */}
      {melhores.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <span className="label-cap">os teus melhores dias</span>
            <span className="label-soft">top {melhores.length}</span>
          </div>
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {melhores.map((d, i) => (
              <li key={d.date} className="flex items-baseline justify-between px-5 py-3">
                <div className="flex items-baseline gap-3">
                  <span className="label-soft tnum">{String(i + 1).padStart(2, '0')}</span>
                  <p className="font-serif text-[15px] tracking-editorial">
                    {formatarData(fromIso(d.date), true)}
                  </p>
                </div>
                <span className={cn(
                  'editorial-num text-[20px] tnum',
                  d.total >= 85 ? 'text-oliva' : d.total >= 65 ? 'text-ouro' : ''
                )}>
                  {d.total}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-faint text-[11px] text-center leading-relaxed">
            estuda o que estes dias têm em comum. <br/>esse é o teu padrão de força.
          </p>
        </section>
      ) : null}

      {/* PROJECÇÃO 14 DIAS */}
      {projeccao && projeccao.pesoMudanca !== null ? (
        <section className="card-feature">
          <div className="flex items-center gap-2">
            <Target size={14} strokeWidth={1.4} className="text-ouro" />
            <span className="label-cap">projecção · próximos 14 dias</span>
          </div>
          <p className="font-serif text-[18px] mt-3 leading-[1.5] tracking-editorial">
            se mantiveres este ritmo (média {projeccao.pontuacaoMedia}/100):
          </p>
          <div className="mt-4 space-y-3">
            {projeccao.pesoMudanca !== null && projeccao.pesoEstimado !== null ? (
              <div className="flex items-baseline justify-between border-b border-[var(--hair)] pb-2">
                <span className="text-soft text-[13px]">peso estimado</span>
                <div className="text-right">
                  <span className="font-serif text-[18px] tnum">{projeccao.pesoEstimado}<span className="text-faint text-[10px] ml-0.5">kg</span></span>
                  <span className={cn(
                    'ml-2 text-[11px] tnum',
                    projeccao.pesoMudanca > 0 ? 'text-terracota' : 'text-oliva'
                  )}>
                    {projeccao.pesoMudanca > 0 ? '+' : ''}{projeccao.pesoMudanca}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <p className="text-faint mt-4 text-[11px] leading-relaxed">
            {projeccao.ritmoMantido
              ? 'estás em ritmo bom. mantém.'
              : 'o ritmo precisa subir para chegares onde queres. uma âncora extra por dia muda a curva.'}
          </p>
        </section>
      ) : null}

      <Link href="/insights" className="card flex items-center justify-between gap-4 transition-elegant hover:bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <Sparkles size={16} strokeWidth={1.4} className="text-ouro" />
          <div>
            <p className="font-serif text-[16px]">leitura semanal por IA</p>
            <p className="text-faint text-[11px]">contexto + nuance · Claude</p>
          </div>
        </div>
      </Link>
    </div>
  )
}

function CorrelacaoCard({ c }: { c: Correlacao }) {
  const Icon = c.tipo === 'positivo' ? TrendingUp : c.tipo === 'negativo' ? TrendingDown : Activity
  const cor = c.tipo === 'positivo' ? 'text-oliva' : c.tipo === 'negativo' ? 'text-terracota' : 'text-ouro'
  const fortIndicador = c.forca === 'forte' ? 'bg-ouro' : c.forca === 'moderado' ? 'bg-ouro/50' : 'bg-[var(--hair-strong)]'

  return (
    <li className="card-solid">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex flex-col items-center gap-1">
          <Icon size={14} strokeWidth={1.4} className={cor} />
          <div className={`h-1 w-1 rounded-full ${fortIndicador}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[15.5px] leading-tight tracking-editorial">{c.titulo}</p>
          <p className="text-soft mt-1.5 text-[12.5px] leading-relaxed">{c.descricao}</p>
        </div>
      </div>
    </li>
  )
}
