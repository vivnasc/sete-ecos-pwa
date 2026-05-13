'use client'

// Padrões temporais · análise complementar ao TendenciaCard
// 1. Aderência à meta · % de dias dentro de ±10% nos últimos 30d
// 2. Padrão por dia da semana · média kcal/carbo por dow
// 3. Dias problema · álcool, carbos acima do tecto (keto)

import { useEffect, useState } from 'react'
import { Target, Calendar, AlertTriangle } from 'lucide-react'
import { getRefeicoes, getAlcoolRegistos } from '@/lib/storage'
import { getProfile } from '@/lib/profile'

type DiaResumo = {
  date: string
  dow: number // 0-6 (dom-sáb)
  kcal: number
  carbo: number
  proteina: number
  gordura: number
  temAlcool: boolean
}

function isoDateDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function agregarDias(n: number): DiaResumo[] {
  const refs = getRefeicoes()
  const alc = getAlcoolRegistos().filter(a => a.decidiuBeber)
  const hoje = new Date()
  const dias: DiaResumo[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    const date = isoDateDate(d)
    const refsDia = refs.filter(r => r.timestamp.slice(0, 10) === date)
    dias.push({
      date,
      dow: d.getDay(),
      kcal: refsDia.reduce((s, r) => s + (r.calorias ?? 0), 0),
      carbo: refsDia.reduce((s, r) => s + (r.carboG ?? 0), 0),
      proteina: refsDia.reduce((s, r) => s + (r.proteinaG ?? 0), 0),
      gordura: refsDia.reduce((s, r) => s + (r.gorduraG ?? 0), 0),
      temAlcool: alc.some(a => a.timestamp.slice(0, 10) === date)
    })
  }
  return dias.filter(d => d.kcal > 0 || d.proteina > 0)
}

const DOW_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export default function PadroesTemporais() {
  const [dias, setDias] = useState<DiaResumo[]>([])
  const [perfil, setPerfil] = useState(() => getProfile())

  useEffect(() => {
    const refresh = () => {
      setDias(agregarDias(30))
      setPerfil(getProfile())
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    window.addEventListener('fenixfit:profile', refresh)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      window.removeEventListener('fenixfit:profile', refresh)
    }
  }, [])

  if (dias.length === 0) return null

  const metas = perfil.metas
  const alvoKcal = metas.calorias
  const alvoCarbo = metas.carboG

  // 1. Aderência kcal (±10% da meta)
  const aderenciaKcal = alvoKcal ? Math.round(
    (dias.filter(d => d.kcal >= alvoKcal * 0.9 && d.kcal <= alvoKcal * 1.1).length / dias.length) * 100
  ) : null
  const aderenciaCarbo = alvoCarbo ? Math.round(
    (dias.filter(d => d.carbo <= alvoCarbo).length / dias.length) * 100
  ) : null

  // 2. Médias por dia da semana
  const porDow: Record<number, { kcal: number[]; carbo: number[]; n: number }> = {}
  for (let i = 0; i < 7; i++) porDow[i] = { kcal: [], carbo: [], n: 0 }
  for (const d of dias) {
    porDow[d.dow].kcal.push(d.kcal)
    porDow[d.dow].carbo.push(d.carbo)
    porDow[d.dow].n++
  }
  const dowStats = Object.entries(porDow).map(([dow, stats]) => ({
    dow: Number(dow),
    label: DOW_LABELS[Number(dow)],
    kcalMed: stats.kcal.length > 0 ? Math.round(stats.kcal.reduce((s, k) => s + k, 0) / stats.kcal.length) : 0,
    carboMed: stats.carbo.length > 0 ? Math.round(stats.carbo.reduce((s, c) => s + c, 0) / stats.carbo.length) : 0,
    n: stats.n
  })).filter(s => s.n > 0)

  const piorKcal = alvoKcal ? [...dowStats].sort((a, b) => Math.abs(b.kcalMed - alvoKcal) - Math.abs(a.kcalMed - alvoKcal))[0] : null
  const piorCarbo = alvoCarbo ? [...dowStats].sort((a, b) => b.carboMed - a.carboMed)[0] : null

  // 3. Dias problema · carbos > meta (keto)
  const diasAcimaCarbo = alvoCarbo ? dias.filter(d => d.carbo > alvoCarbo) : []
  const diasComAlcool = dias.filter(d => d.temAlcool)

  // Média semanal kcal (últimos 7 dias completos)
  const ult7 = dias.slice(-7)
  const mediaSem = ult7.length > 0 ? Math.round(ult7.reduce((s, d) => s + d.kcal, 0) / ult7.length) : 0

  return (
    <section className="card-feature space-y-4">
      <div className="flex items-center gap-2">
        <Target size={13} strokeWidth={1.5} className="text-ouro" />
        <span className="label-cap">padrões temporais · {dias.length}d</span>
      </div>

      {/* Aderência */}
      {(aderenciaKcal !== null || aderenciaCarbo !== null) ? (
        <div className="grid grid-cols-3 gap-2">
          {aderenciaKcal !== null ? (
            <CardMini label="kcal · meta" valor={`${aderenciaKcal}%`} sub={`${alvoKcal} ±10%`} cor={aderenciaKcal >= 70 ? '#7B9A4F' : aderenciaKcal >= 40 ? '#D4A14E' : '#C9614E'} />
          ) : null}
          {aderenciaCarbo !== null ? (
            <CardMini label="carbo · tecto" valor={`${aderenciaCarbo}%`} sub={`≤${alvoCarbo}g`} cor={aderenciaCarbo >= 80 ? '#7B9A4F' : aderenciaCarbo >= 50 ? '#D4A14E' : '#C9614E'} />
          ) : null}
          <CardMini label="média 7d" valor={`${mediaSem}`} sub="kcal/dia" cor="#A89878" />
        </div>
      ) : null}

      {/* Padrão por dia da semana */}
      {dowStats.length >= 3 ? (
        <div className="space-y-2 pt-2 border-t border-[var(--hair)]">
          <div className="flex items-center gap-2">
            <Calendar size={11} strokeWidth={1.5} className="text-faint" />
            <span className="label-cap text-[10px]">média por dia da semana</span>
          </div>
          <BarrasDow dowStats={dowStats} alvoKcal={alvoKcal} />
          {piorKcal && alvoKcal && Math.abs(piorKcal.kcalMed - alvoKcal) > alvoKcal * 0.15 ? (
            <p className="text-faint text-[11px] leading-relaxed">
              <strong className="text-soft">{piorKcal.label}</strong> · {piorKcal.kcalMed} kcal médias · {piorKcal.kcalMed > alvoKcal ? `+${piorKcal.kcalMed - alvoKcal}` : `${piorKcal.kcalMed - alvoKcal}`} vs meta
            </p>
          ) : null}
          {piorCarbo && alvoCarbo && piorCarbo.carboMed > alvoCarbo ? (
            <p className="text-faint text-[11px] leading-relaxed">
              <strong className="text-soft">{piorCarbo.label}</strong> · {piorCarbo.carboMed}g carbo médios · acima do tecto de {alvoCarbo}g
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Alertas · dias problema */}
      {(diasAcimaCarbo.length > 0 || diasComAlcool.length > 0) ? (
        <div className="space-y-1.5 pt-2 border-t border-[var(--hair)]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={11} strokeWidth={1.5} className="text-terracota" />
            <span className="label-cap text-[10px]">dias fora do alinhamento</span>
          </div>
          {diasAcimaCarbo.length > 0 ? (
            <p className="text-soft text-[11.5px] leading-relaxed">
              <span className="tnum">{diasAcimaCarbo.length}</span>/{dias.length} dias com carbo acima de {alvoCarbo}g · {diasAcimaCarbo.slice(-3).map(d => d.date.slice(5).replace('-', '/')).join(' · ')}
            </p>
          ) : null}
          {diasComAlcool.length > 0 ? (
            <p className="text-soft text-[11.5px] leading-relaxed">
              <span className="tnum">{diasComAlcool.length}</span>/{dias.length} dias com álcool · {diasComAlcool.slice(-3).map(d => d.date.slice(5).replace('-', '/')).join(' · ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function CardMini({ label, valor, sub, cor }: { label: string; valor: string; sub: string; cor: string }) {
  return (
    <div className="card-solid !p-2 text-center">
      <p className="text-faint text-[9.5px] uppercase tracking-cap">{label}</p>
      <p className="font-serif text-[20px] tnum mt-1 leading-none" style={{ color: cor }}>{valor}</p>
      <p className="text-faint text-[9.5px] tnum mt-0.5">{sub}</p>
    </div>
  )
}

function BarrasDow({ dowStats, alvoKcal }: { dowStats: { dow: number; label: string; kcalMed: number; n: number }[]; alvoKcal: number | null }) {
  const w = 280
  const h = 70
  const pad = { t: 6, r: 4, b: 16, l: 4 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b
  const max = Math.max(...dowStats.map(d => d.kcalMed), alvoKcal ?? 0, 100)
  const barW = cw / 7
  // alinhar dom→sáb
  return (
    <div className="-mx-1">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        {alvoKcal ? (
          <line x1={pad.l} y1={pad.t + ch - (alvoKcal / max) * ch} x2={w - pad.r} y2={pad.t + ch - (alvoKcal / max) * ch} stroke="#D4A14E" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        ) : null}
        {Array.from({ length: 7 }, (_, i) => i).map(dow => {
          const s = dowStats.find(d => d.dow === dow)
          const x = pad.l + dow * barW + barW * 0.12
          if (!s) {
            return (
              <g key={dow}>
                <text x={x + barW * 0.38} y={h - 4} fontSize="8" fill="rgba(150,140,120,0.5)" textAnchor="middle">{DOW_LABELS[dow]}</text>
              </g>
            )
          }
          const altura = (s.kcalMed / max) * ch
          const cor = alvoKcal && s.kcalMed > alvoKcal * 1.1 ? '#C9614E' : alvoKcal && s.kcalMed >= alvoKcal * 0.9 ? '#7B9A4F' : '#D4A14E'
          return (
            <g key={dow}>
              <rect x={x} y={pad.t + ch - altura} width={barW * 0.76} height={altura} rx="2" fill={cor}>
                <title>{s.label}: {s.kcalMed} kcal · n={s.n}</title>
              </rect>
              <text x={x + barW * 0.38} y={h - 4} fontSize="8" fill="rgba(150,140,120,0.7)" textAnchor="middle">{s.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
