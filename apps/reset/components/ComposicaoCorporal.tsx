'use client'

// Estimativa de % de gordura corporal · usa a melhor fórmula disponível
// dadas as medidas existentes (cintura > peso/altura) + tendência semanal.

import { useEffect, useState } from 'react'
import { Percent } from 'lucide-react'
import { getMedidas, getPesos, type MedidaRegisto, type PesoLog } from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import { estimarMelhor, categoriaBF, type ResultadoBF, type SexoBF } from '@/lib/composicao'

type Ponto = { date: string; bf: number; gorduraKg: number; magraKg: number; metodo: string }

function calcularHistorico(): Ponto[] {
  const profile = getProfile()
  const sexo = (profile.sexo ?? 'F') as SexoBF
  const altura = profile.alturaCm
  const idade = profile.idade
  if (!altura) return []

  const medidas = getMedidas()
  const pesos = getPesos()

  // Mapa de cintura por data (das medidas E dos peso logs)
  const cinturaPorData = new Map<string, number>()
  for (const m of medidas) {
    if (m.cintura !== null) cinturaPorData.set(m.date, m.cintura)
  }
  for (const p of pesos) {
    if (p.cintura !== null && !cinturaPorData.has(p.date)) cinturaPorData.set(p.date, p.cintura)
  }
  // Anca (das medidas)
  const ancaPorData = new Map<string, number>()
  for (const m of medidas) {
    if (m.ancas !== null) ancaPorData.set(m.date, m.ancas)
  }

  // Datas únicas com peso
  const pesoPorData = new Map<string, number>()
  for (const p of pesos) {
    if (!pesoPorData.has(p.date)) pesoPorData.set(p.date, p.peso)
  }
  const medidasPesoMap = new Map<string, number>()
  for (const m of medidas) {
    if (m.peso !== null) medidasPesoMap.set(m.date, m.peso)
  }

  const datasComPeso = new Set([...pesoPorData.keys(), ...medidasPesoMap.keys()])
  const pontos: Ponto[] = []
  for (const date of Array.from(datasComPeso).sort()) {
    const pesoKg = pesoPorData.get(date) ?? medidasPesoMap.get(date) ?? null
    if (!pesoKg) continue
    const cinturaCm = cinturaPorData.get(date) ?? null
    const ancaCm = ancaPorData.get(date) ?? null
    const r = estimarMelhor({ pesoKg, alturaCm: altura, idade, sexo, cinturaCm, ancaCm })
    if (r) pontos.push({ date, bf: r.bf, gorduraKg: r.gorduraKg, magraKg: r.magraKg, metodo: r.metodoLabel })
  }
  return pontos
}

export default function ComposicaoCorporal() {
  const [actual, setActual] = useState<ResultadoBF | null>(null)
  const [historico, setHistorico] = useState<Ponto[]>([])
  const [perfil, setPerfil] = useState(() => getProfile())

  const refresh = () => {
    const p = getProfile()
    setPerfil(p)
    const medidas = getMedidas()
    const pesos = getPesos()
    const pesoMaisRecente = pesos[pesos.length - 1]
    const ultMedida = medidas[medidas.length - 1] as MedidaRegisto | undefined
    const ultPeso = pesoMaisRecente as PesoLog | undefined
    // Combinar dados · cintura pode estar em peso ou em medida
    const cintura = (ultMedida && ultMedida.cintura !== null ? ultMedida.cintura : null)
      ?? (ultPeso && ultPeso.cintura !== null ? ultPeso.cintura : null)
    const anca = ultMedida?.ancas ?? null
    const pesoKg = ultPeso?.peso ?? ultMedida?.peso ?? null
    const r = estimarMelhor({
      pesoKg,
      alturaCm: p.alturaCm,
      idade: p.idade,
      sexo: (p.sexo ?? 'F') as SexoBF,
      cinturaCm: cintura,
      ancaCm: anca
    })
    setActual(r)
    setHistorico(calcularHistorico())
  }

  useEffect(() => {
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    window.addEventListener('fenixfit:profile', refresh)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      window.removeEventListener('fenixfit:profile', refresh)
    }
  }, [])

  if (!perfil.alturaCm) {
    return (
      <section className="card-solid space-y-2">
        <div className="flex items-center gap-2">
          <Percent size={13} strokeWidth={1.5} className="text-ouro" />
          <span className="label-cap">composição corporal</span>
        </div>
        <p className="text-soft text-[12.5px] leading-relaxed">
          define a tua altura em <a href="/definicoes" className="text-ouro underline">definições</a> para calcular.
        </p>
      </section>
    )
  }
  if (!actual) {
    return (
      <section className="card-solid space-y-2">
        <div className="flex items-center gap-2">
          <Percent size={13} strokeWidth={1.5} className="text-ouro" />
          <span className="label-cap">composição corporal</span>
        </div>
        <p className="text-soft text-[12.5px] leading-relaxed">
          regista peso para começar. <strong>cintura</strong> melhora a precisão (recomendado às sextas).
        </p>
      </section>
    )
  }

  const cat = categoriaBF(actual.bf, (perfil.sexo ?? 'F') as SexoBF)
  const ultimo = historico[historico.length - 1]
  const anterior = historico.length >= 2 ? historico[historico.length - 2] : null
  const delta = anterior ? Math.round((actual.bf - anterior.bf) * 10) / 10 : null

  return (
    <section className="card-feature space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <Percent size={13} strokeWidth={1.5} className="text-ouro" />
          <span className="label-cap">% gordura</span>
        </div>
        <span className="text-faint text-[10.5px] tracking-cap uppercase">{actual.metodoLabel}</span>
      </div>

      <div className="text-center">
        <p className="editorial-num text-[68px] leading-none tnum" style={{ color: cat.cor }}>
          {actual.bf}<span className="text-faint text-[22px]">%</span>
        </p>
        <p className="text-soft text-[12px] mt-2" style={{ color: cat.cor }}>{cat.label}</p>
        {delta !== null ? (
          <p className="text-faint text-[11px] mt-1 tnum">
            {delta > 0 ? '+' : ''}{delta}% desde {anterior!.date.slice(5).replace('-', '/')}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[var(--hair)]">
        <div className="text-center">
          <p className="text-faint text-[10px] tracking-cap uppercase">gordura</p>
          <p className="font-serif text-[22px] tnum mt-1">{actual.gorduraKg}<span className="text-faint text-[11px] ml-0.5">kg</span></p>
        </div>
        <div className="text-center">
          <p className="text-faint text-[10px] tracking-cap uppercase">massa magra</p>
          <p className="font-serif text-[22px] tnum mt-1">{actual.magraKg}<span className="text-faint text-[11px] ml-0.5">kg</span></p>
        </div>
      </div>

      {historico.length >= 2 ? <BarrasBF historico={historico} /> : (
        <p className="text-faint text-[10.5px] text-center leading-relaxed">
          mais pontos para ver tendência · mede cintura semanalmente.
        </p>
      )}

      <p className="text-faint text-[10px] leading-relaxed">
        precisão {actual.precisao} · {actual.metodo === 'rfm' ? 'RFM (Woolcott 2018) usa altura + cintura' : actual.metodo === 'navy' ? 'US Navy circumference method' : 'Deurenberg BMI · menos preciso · adiciona cintura'}.
        estimativa · não substitui DEXA.
      </p>
    </section>
  )
}

function BarrasBF({ historico }: { historico: Ponto[] }) {
  const ult = historico.slice(-12)
  const w = 320
  const h = 110
  const pad = { t: 8, r: 8, b: 22, l: 28 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b
  const max = Math.max(...ult.map(p => p.bf), 30)
  const min = Math.min(...ult.map(p => p.bf), 15)
  const range = max - min || 1
  const yScale = (v: number) => pad.t + ch - ((v - min) / range) * ch
  const xScale = (i: number) => pad.l + (i / Math.max(1, ult.length - 1)) * cw
  const path = ult.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(p.bf).toFixed(1)}`).join(' ')

  return (
    <div className="-mx-2 pt-2 border-t border-[var(--hair)]">
      <p className="label-cap mb-2 px-2">tendência · {ult.length} pontos</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        <line x1={pad.l} y1={pad.t + ch} x2={w - pad.r} y2={pad.t + ch} stroke="rgba(150,140,120,0.3)" />
        <text x={pad.l - 4} y={pad.t + 3} fontSize="9" fill="rgba(150,140,120,0.7)" textAnchor="end">{max.toFixed(0)}%</text>
        <text x={pad.l - 4} y={pad.t + ch} fontSize="9" fill="rgba(150,140,120,0.7)" textAnchor="end">{min.toFixed(0)}%</text>
        <path d={path} fill="none" stroke="#D4A14E" strokeWidth="2" />
        {ult.map((p, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(p.bf)} r="2.5" fill="#D4A14E">
            <title>{p.date}: {p.bf}% ({p.metodo})</title>
          </circle>
        ))}
        <text x={pad.l} y={h - 6} fontSize="8" fill="rgba(150,140,120,0.7)" textAnchor="start">{ult[0].date.slice(5).replace('-', '/')}</text>
        <text x={w - pad.r} y={h - 6} fontSize="8" fill="rgba(150,140,120,0.7)" textAnchor="end">{ult[ult.length - 1].date.slice(5).replace('-', '/')}</text>
      </svg>
    </div>
  )
}
