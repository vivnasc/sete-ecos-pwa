'use client'

// Gráfico de tendência semanal · macros + kcal por dia (últimos 14 dias).
// SVG puro · cores consistentes com DistribuicaoBar.

import { useEffect, useState } from 'react'
import { getRefeicoes, getTodosDias, getPesos } from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import { isoDate } from '@/lib/dates'

type DiaDados = {
  date: string
  kcal: number
  proteina: number
  carbo: number
  gordura: number
  peso: number | null
}

function dadosUltimosNDias(n: number): DiaDados[] {
  const hoje = new Date()
  const refeicoes = getRefeicoes()
  const pesos = getPesos()
  const dias_storage = getTodosDias()

  // Determinar primeira data com qualquer registo · não mostra dias antes do início
  const primeirosTimestamps: string[] = [
    ...refeicoes.map(r => r.timestamp.slice(0, 10)),
    ...pesos.map(p => p.date),
    ...dias_storage.map(d => d.date)
  ].filter(Boolean).sort()
  const primeiraData = primeirosTimestamps[0] ?? isoDate()

  const dias: DiaDados[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    const date = isoDate(d)
    if (date < primeiraData) continue // dia antes do início · ignora
    const refsDoDia = refeicoes.filter(r => r.timestamp.slice(0, 10) === date)
    const peso = pesos.find(p => p.date === date)?.peso ?? null
    dias.push({
      date,
      kcal: refsDoDia.reduce((s, r) => s + (r.calorias ?? 0), 0),
      proteina: refsDoDia.reduce((s, r) => s + (r.proteinaG ?? 0), 0),
      carbo: refsDoDia.reduce((s, r) => s + (r.carboG ?? 0), 0),
      gordura: refsDoDia.reduce((s, r) => s + (r.gorduraG ?? 0), 0),
      peso
    })
  }
  return dias
}

export default function TendenciaCard() {
  const [dias, setDias] = useState<DiaDados[]>([])
  const [janela, setJanela] = useState<7 | 14 | 30>(14)
  const [serie, setSerie] = useState<'kcal' | 'macros' | 'peso'>('kcal')
  const profile = getProfile()
  const metas = profile.metas

  useEffect(() => {
    const refresh = () => setDias(dadosUltimosNDias(janela))
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [janela])

  if (dias.length === 0) return null

  return (
    <section className="card-feature space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">tendência · {janela} dias</span>
        <div className="flex gap-1">
          {([7, 14, 30] as const).map(n => (
            <button
              key={n}
              onClick={() => setJanela(n)}
              className={`rounded-full px-2.5 py-1 text-[10px] tnum transition-elegant active:scale-95 ${
                janela === n ? 'bg-ouro text-creme dark:text-tinta' : 'bg-[var(--surface-soft)] text-faint'
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {([
          { id: 'kcal' as const, label: 'kcal' },
          { id: 'macros' as const, label: 'macros' },
          { id: 'peso' as const, label: 'peso' }
        ]).map(s => (
          <button
            key={s.id}
            onClick={() => setSerie(s.id)}
            className={`flex-1 rounded-md py-1.5 text-[11px] transition-elegant active:scale-95 ${
              serie === s.id ? 'bg-tinta text-creme dark:bg-ouro dark:text-tinta' : 'bg-[var(--surface-soft)] text-soft'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {serie === 'kcal' ? <GraficoKcal dias={dias} alvo={metas.calorias} /> : null}
      {serie === 'macros' ? <GraficoMacros dias={dias} /> : null}
      {serie === 'peso' ? <GraficoPeso dias={dias} /> : null}
    </section>
  )
}

// Cores fixas para charts · independentes da paleta · sempre legíveis
const COR = {
  proteina: '#D4A14E',  // ouro
  carbo: '#C97A4E',     // âmbar/terracota
  gordura: '#7B9A4F',   // oliva
  alvo: '#D4A14E',      // ouro
  oliva: '#7B9A4F',
  terracota: '#C9614E', // vermelho-tijolo
  vazio: 'rgba(150,140,120,0.15)' // traço subtil
}

function fmtDateShort(date: string): string {
  // YYYY-MM-DD → DD/MM ou só dia
  const [, m, d] = date.split('-')
  return `${d}/${m}`
}

function GraficoKcal({ dias, alvo }: { dias: DiaDados[]; alvo: number | null }) {
  const w = 320
  const h = 150
  const pad = { t: 14, r: 10, b: 32, l: 32 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b

  const maxKcal = Math.max(...dias.map(d => d.kcal), alvo ?? 0, 100)
  const yScale = (v: number) => pad.t + ch - (v / maxKcal) * ch
  const barW = cw / Math.max(dias.length, 1)
  const x = (i: number) => pad.l + i * barW + barW * 0.15

  // Decidir frequência das labels: todos se ≤7, cada 2 se ≤14, cada 5 caso contrário
  const stepLabel = dias.length <= 7 ? 1 : dias.length <= 14 ? 2 : 5

  return (
    <div className="-mx-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        {alvo ? (
          <>
            <line x1={pad.l} y1={yScale(alvo)} x2={w - pad.r} y2={yScale(alvo)} stroke={COR.alvo} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <text x={pad.l - 4} y={yScale(alvo) + 3} fontSize="9" fill={COR.alvo} textAnchor="end">{alvo}</text>
          </>
        ) : null}
        <line x1={pad.l} y1={pad.t + ch} x2={w - pad.r} y2={pad.t + ch} stroke="rgba(150,140,120,0.3)" />
        {dias.map((d, i) => {
          if (d.kcal === 0) {
            return (
              <g key={d.date}>
                <rect x={x(i)} y={pad.t + ch - 2} width={barW * 0.7} height={2} fill={COR.vazio}>
                  <title>{d.date}: sem registo</title>
                </rect>
              </g>
            )
          }
          const altura = Math.max(2, (d.kcal / maxKcal) * ch)
          const cor = alvo && d.kcal > alvo * 1.1 ? COR.terracota : alvo && d.kcal >= alvo * 0.9 && d.kcal <= alvo * 1.1 ? COR.oliva : COR.alvo
          return (
            <rect
              key={d.date}
              x={x(i)}
              y={pad.t + ch - altura}
              width={barW * 0.7}
              height={altura}
              rx="2"
              fill={cor}
            >
              <title>{d.date}: {d.kcal} kcal</title>
            </rect>
          )
        })}
        {/* labels de data por baixo de cada N barras */}
        {dias.map((d, i) => {
          if (i % stepLabel !== 0 && i !== dias.length - 1) return null
          return (
            <text
              key={`l-${d.date}`}
              x={x(i) + barW * 0.35}
              y={h - 6}
              fontSize="8"
              fill="rgba(150,140,120,0.7)"
              textAnchor="middle"
            >
              {fmtDateShort(d.date)}
            </text>
          )
        })}
      </svg>
      <p className="text-faint text-[10px] text-center mt-1">verde = no alvo · vermelho = passou 10% · dourado = caso contrário</p>
    </div>
  )
}

function GraficoMacros({ dias }: { dias: DiaDados[] }) {
  const w = 320
  const h = 150
  const pad = { t: 14, r: 10, b: 32, l: 32 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b

  const maxKcal = Math.max(...dias.map(d => d.proteina * 4 + d.carbo * 4 + d.gordura * 9), 100)
  const barW = cw / Math.max(dias.length, 1)
  const x = (i: number) => pad.l + i * barW + barW * 0.15
  const bw = barW * 0.7

  const stepLabel = dias.length <= 7 ? 1 : dias.length <= 14 ? 2 : 5

  return (
    <div className="-mx-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        <line x1={pad.l} y1={pad.t + ch} x2={w - pad.r} y2={pad.t + ch} stroke="rgba(150,140,120,0.3)" />
        {dias.map((d, i) => {
          const kP = d.proteina * 4
          const kC = d.carbo * 4
          const kG = d.gordura * 9
          const total = kP + kC + kG
          const xi = x(i)
          if (total === 0) {
            return (
              <rect key={d.date} x={xi} y={pad.t + ch - 2} width={bw} height={2} fill={COR.vazio}>
                <title>{d.date}: sem registo</title>
              </rect>
            )
          }
          const hP = (kP / maxKcal) * ch
          const hC = (kC / maxKcal) * ch
          const hG = (kG / maxKcal) * ch
          const yi = pad.t + ch
          return (
            <g key={d.date}>
              <rect x={xi} y={yi - hG} width={bw} height={hG} rx="2" fill={COR.gordura}><title>{d.date}: G {d.gordura}g</title></rect>
              <rect x={xi} y={yi - hG - hC} width={bw} height={hC} fill={COR.carbo}><title>{d.date}: C {d.carbo}g</title></rect>
              <rect x={xi} y={yi - hG - hC - hP} width={bw} height={hP} rx="2" fill={COR.proteina}><title>{d.date}: P {d.proteina}g</title></rect>
            </g>
          )
        })}
        {dias.map((d, i) => {
          if (i % stepLabel !== 0 && i !== dias.length - 1) return null
          return (
            <text
              key={`l-${d.date}`}
              x={x(i) + barW * 0.35}
              y={h - 6}
              fontSize="8"
              fill="rgba(150,140,120,0.7)"
              textAnchor="middle"
            >
              {fmtDateShort(d.date)}
            </text>
          )
        })}
      </svg>
      <div className="flex justify-center gap-3 text-[10px] mt-1">
        <span className="inline-flex items-center gap-1 text-faint"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: COR.proteina }} />proteína</span>
        <span className="inline-flex items-center gap-1 text-faint"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: COR.carbo }} />carbo</span>
        <span className="inline-flex items-center gap-1 text-faint"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: COR.gordura }} />gordura</span>
      </div>
    </div>
  )
}

function GraficoPeso({ dias }: { dias: DiaDados[] }) {
  const w = 320
  const h = 150
  const pad = { t: 14, r: 10, b: 32, l: 36 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b

  const pesos = dias.map(d => d.peso).filter((p): p is number => p !== null)
  if (pesos.length < 2) {
    return (
      <div className="text-center py-8 text-faint text-[12px] leading-relaxed">
        precisa de pelo menos 2 pesagens em {dias.length} dias para mostrar tendência.
      </div>
    )
  }
  const min = Math.min(...pesos)
  const max = Math.max(...pesos)
  const range = max - min || 1
  const yPad = range * 0.2
  const yMin = min - yPad
  const yMax = max + yPad
  const yRange = yMax - yMin

  const yScale = (v: number) => pad.t + ch - ((v - yMin) / yRange) * ch
  const xScale = (i: number) => pad.l + (i / Math.max(1, dias.length - 1)) * cw

  const pontos = dias.map((d, i) => d.peso !== null ? { x: xScale(i), y: yScale(d.peso), date: d.date, peso: d.peso } : null).filter((p): p is { x: number; y: number; date: string; peso: number } => p !== null)
  const path = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const stepLabel = dias.length <= 7 ? 1 : dias.length <= 14 ? 2 : 5

  return (
    <div className="-mx-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        <line x1={pad.l} y1={pad.t + ch} x2={w - pad.r} y2={pad.t + ch} stroke="rgba(150,140,120,0.3)" />
        <text x={pad.l - 4} y={pad.t + 3} fontSize="9" fill="rgba(150,140,120,0.7)" textAnchor="end">{yMax.toFixed(1)}</text>
        <text x={pad.l - 4} y={pad.t + ch} fontSize="9" fill="rgba(150,140,120,0.7)" textAnchor="end">{yMin.toFixed(1)}</text>
        <path d={path} fill="none" stroke={COR.alvo} strokeWidth="2" />
        {pontos.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={COR.alvo}>
              <title>{p.date}: {p.peso}kg</title>
            </circle>
          </g>
        ))}
        {dias.map((d, i) => {
          if (i % stepLabel !== 0 && i !== dias.length - 1) return null
          return (
            <text
              key={`l-${d.date}`}
              x={xScale(i)}
              y={h - 6}
              fontSize="8"
              fill="rgba(150,140,120,0.7)"
              textAnchor="middle"
            >
              {fmtDateShort(d.date)}
            </text>
          )
        })}
      </svg>
      <p className="text-faint text-[10px] text-center mt-1">
        {pesos[pesos.length - 1] > pesos[0]
          ? `+${(pesos[pesos.length - 1] - pesos[0]).toFixed(1)} kg em ${dias.length}d`
          : `${(pesos[pesos.length - 1] - pesos[0]).toFixed(1)} kg em ${dias.length}d`}
      </p>
    </div>
  )
}
