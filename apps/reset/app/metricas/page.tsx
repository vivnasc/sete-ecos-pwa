'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Moon, Wine, TrendingUp, Heart } from 'lucide-react'
import Heatmap from '@/components/Heatmap'
import TrendChart from '@/components/TrendChart'
import { detectarPadroes, diasComDados, type Padrao } from '@/lib/patterns'
import { getMedidas, getTodosDias, sonoMedio } from '@/lib/storage'
import { fromIso, mesCurto } from '@/lib/dates'

export default function MetricasPage() {
  const [padroes, setPadroes] = useState<Padrao[]>([])
  const [medidas, setMedidas] = useState<{ x: string; y: number }[]>([])
  const [sono, setSono] = useState<{ x: string; y: number }[]>([])
  const [pesoSeq, setPesoSeq] = useState<{ x: string; y: number }[]>([])
  const [stats, setStats] = useState({ total: 0, comAncoras: 0, comSono: 0 })

  useEffect(() => {
    const refresh = () => {
      setPadroes(detectarPadroes())
      setStats(diasComDados())

      const m = getMedidas().filter(x => x.cintura !== null)
      setMedidas(
        m.map(x => ({
          x: `${fromIso(x.date).getDate()}${mesCurto(fromIso(x.date)).charAt(0)}`,
          y: x.cintura as number
        }))
      )

      const p = getMedidas().filter(x => x.peso !== null)
      setPesoSeq(
        p.map(x => ({
          x: `${fromIso(x.date).getDate()}${mesCurto(fromIso(x.date)).charAt(0)}`,
          y: x.peso as number
        }))
      )

      const dias = getTodosDias().filter(d => d.sonoHoras !== null).slice(-21)
      setSono(
        dias.map(d => ({
          x: `${fromIso(d.date).getDate()}`,
          y: d.sonoHoras as number
        }))
      )
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">sinais</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">os teus dados</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-soft mt-3 text-[13px]">{stats.comAncoras} dias com âncoras · {stats.comSono} com sono</p>
      </header>

      <Heatmap />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="label-cap">Cintura · cm</span>
          <Link href="/medidas" className="label-soft hover:opacity-70">
            <ArrowUpRight size={14} strokeWidth={1.5} aria-label="Ir para medidas" />
          </Link>
        </div>
        <TrendChart pontos={medidas} unidade="cm" cor="var(--ouro)" vazio="primeira medição cria o ponto de partida" />
      </section>

      {pesoSeq.length >= 2 ? (
        <section className="space-y-3">
          <span className="label-cap">Peso · kg</span>
          <TrendChart pontos={pesoSeq} unidade="kg" cor="var(--ink)" />
        </section>
      ) : null}

      {sono.length >= 3 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="label-cap">Sono · 21 dias</span>
            {sonoMedio() ? <span className="label-soft tnum">média {sonoMedio()}h</span> : null}
          </div>
          <TrendChart pontos={sono} unidade="h" cor="#6B7445" altura={100} />
        </section>
      ) : null}

      {/* PADRÕES */}
      <section className="space-y-3">
        <span className="label-cap">Padrões</span>
        {padroes.length === 0 ? (
          <div className="card text-center">
            <p className="text-soft text-[13px]">os padrões aparecem com mais dados.</p>
            <p className="text-faint mt-1 text-[12px]">~7 dias de registos é o mínimo.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {padroes.map(p => (
              <PadraoCard key={p.id} padrao={p} />
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/insights"
        className="card-feature flex items-center justify-between gap-4 transition-elegant hover:shadow-ink"
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.4} className="text-ouro" />
            <span className="label-cap">leitura semanal</span>
          </div>
          <p className="mt-2 font-serif text-[20px] font-light tracking-editorial">o que vejo nos teus dados</p>
          <p className="text-faint mt-1 text-[12px]">gerado por Claude · uma vez por semana</p>
        </div>
        <ArrowUpRight size={20} strokeWidth={1.3} className="text-faint" />
      </Link>
    </div>
  )
}

function PadraoCard({ padrao }: { padrao: Padrao }) {
  const icones = {
    sleep: Moon,
    alcohol: Wine,
    energy: TrendingUp,
    streak: Sparkles,
    mood: Heart
  }
  const Icone = icones[padrao.icone]
  const fortIndicador = padrao.forca === 'forte' ? 'bg-ouro' : padrao.forca === 'moderado' ? 'bg-ouro/50' : 'bg-[var(--hair-strong)]'

  return (
    <li className="card-solid">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex flex-col items-center gap-1">
          <Icone size={16} strokeWidth={1.4} className="text-ouro" />
          <div className={`h-1 w-1 rounded-full ${fortIndicador}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] leading-tight tracking-editorial">{padrao.titulo}</p>
          <p className="text-soft mt-1.5 text-[13px] leading-relaxed">{padrao.descricao}</p>
        </div>
      </div>
    </li>
  )
}
