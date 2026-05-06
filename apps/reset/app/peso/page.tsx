'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import {
  getPesos,
  getPesoHoje,
  savePeso,
  pesoMediaMovel,
  variacaoPeso,
  type PesoLog
} from '@/lib/storage'
import { isoDate, fromIso, mesCurto, diaSemana } from '@/lib/dates'
import TrendChart from '@/components/TrendChart'
import BackButton from '@/components/BackButton'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default function PesoPage() {
  const [pesos, setPesos] = useState<PesoLog[]>([])
  const [pesoHoje, setPesoHoje] = useState<PesoLog | null>(null)
  const [valor, setValor] = useState<string>('')
  const [cintura, setCintura] = useState<string>('')
  const [hora, setHora] = useState<string>(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })
  const [notas, setNotas] = useState<string>('')
  const eSexta = diaSemana(new Date()) === 'Sexta'
  const [mostrarCintura, setMostrarCintura] = useState(eSexta)

  useEffect(() => {
    const refresh = () => {
      const ps = getPesos()
      setPesos(ps)
      const hoje = getPesoHoje()
      setPesoHoje(hoje)
      if (hoje) {
        setValor(String(hoje.peso))
        setCintura(hoje.cintura !== null ? String(hoje.cintura) : '')
        if (hoje.cintura !== null) setMostrarCintura(true)
        setHora(hoje.hora)
        setNotas(hoje.notas)
      }
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const variacoes = useMemo(() => variacaoPeso(), [pesos])
  const ma7 = useMemo(() => pesoMediaMovel(7), [pesos])

  // Variação cintura
  const cinturaVariacoes = useMemo(() => {
    const comC = pesos.filter(p => p.cintura !== null)
    if (comC.length < 2) return null
    const ult = comC[comC.length - 1].cintura as number
    const ha7 = comC.length > 7 ? comC[comC.length - 8].cintura as number : null
    const ini = comC[0].cintura as number
    return {
      semana: ha7 !== null ? Math.round((ult - ha7) * 10) / 10 : null,
      total: Math.round((ult - ini) * 10) / 10,
      actual: ult
    }
  }, [pesos])

  const submit = () => {
    if (!valor) return
    const n = Number(valor)
    if (isNaN(n) || n < 30 || n > 250) return
    const c = cintura ? Number(cintura) : null
    if (c !== null && (isNaN(c) || c < 30 || c > 200)) return
    savePeso({
      date: isoDate(),
      peso: n,
      cintura: c,
      hora,
      notas: notas.trim()
    })
  }

  const pontos30Peso = pesos.slice(-30).map(p => ({
    x: `${fromIso(p.date).getDate()}${mesCurto(fromIso(p.date)).charAt(0)}`,
    y: p.peso
  }))

  const pontos30Cintura = pesos.slice(-30).filter(p => p.cintura !== null).map(p => ({
    x: `${fromIso(p.date).getDate()}${mesCurto(fromIso(p.date)).charAt(0)}`,
    y: p.cintura as number
  }))

  return (
    <div className="space-y-7 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-2">
        <p className="label-soft">peso · cintura</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          todos os dias
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">
          mesma hora · descalça · em jejum · linha do dia, não do peso
        </p>
      </header>

      {/* Quick add hoje */}
      <section className="card-feature space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="label-cap">{pesoHoje ? 'hoje · registado' : 'hoje · pesa-te'}</span>
          {pesoHoje ? <span className="label-soft tnum">{pesoHoje.hora}</span> : null}
        </div>

        {/* Peso */}
        <div>
          <span className="label-cap text-[10px] block mb-1">peso</span>
          <div className="flex items-baseline gap-3">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="30"
              max="250"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="—"
              className="editorial-num w-full border-0 bg-transparent text-[56px] tnum focus:outline-none"
              style={{ caretColor: 'var(--ouro)' }}
              autoFocus
            />
            <span className="text-faint pb-2 text-[14px]">kg</span>
          </div>
        </div>

        {/* Cintura · sextas */}
        {mostrarCintura ? (
          <div className="border-t border-[var(--hair)] pt-4">
            <span className="label-cap text-[10px] block mb-1">
              cintura {eSexta ? '· sexta' : ''}
            </span>
            <div className="flex items-baseline gap-3">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="30"
                max="200"
                value={cintura}
                onChange={e => setCintura(e.target.value)}
                placeholder="—"
                className="editorial-num w-full border-0 bg-transparent text-[40px] tnum focus:outline-none"
                style={{ caretColor: 'var(--ouro)' }}
              />
              <span className="text-faint pb-1 text-[12px]">cm</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarCintura(true)}
            className="flex items-center gap-1.5 text-[11px] text-faint border-t border-[var(--hair)] pt-3 hover:text-soft tracking-cap uppercase"
          >
            <Plus size={11} strokeWidth={1.5} /> cintura · medir hoje
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-[var(--hair)] pt-4">
          <label>
            <span className="label-cap mb-1.5 block">hora</span>
            <input
              type="time"
              value={hora}
              onChange={e => setHora(e.target.value)}
              className="input-base text-[14px]"
            />
          </label>
          <label>
            <span className="label-cap mb-1.5 block">nota · opcional</span>
            <input
              type="text"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="período · viagem · refeed"
              className="input-base text-[14px]"
              maxLength={60}
            />
          </label>
        </div>

        <button onClick={submit} disabled={!valor} className="btn-primary w-full">
          {pesoHoje ? 'actualizar' : 'registar'}
        </button>
      </section>

      {/* Variações peso */}
      {pesos.length >= 2 ? (
        <section>
          <span className="label-cap px-1 mb-2 block">peso</span>
          <div className="grid grid-cols-2 gap-3">
            <Card label="vs ontem" valor={variacoes.ultima} unit="kg" />
            <Card label="vs semana" valor={variacoes.semana} unit="kg" />
            <Card label="vs mês" valor={variacoes.mes} unit="kg" />
            <Card label="desde início" valor={variacoes.total} unit="kg" highlight />
          </div>
        </section>
      ) : null}

      {/* Variações cintura */}
      {cinturaVariacoes ? (
        <section>
          <span className="label-cap px-1 mb-2 block">cintura</span>
          <div className="grid grid-cols-3 gap-3">
            <Card label="actual" valor={cinturaVariacoes.actual} unit="cm" raw />
            <Card label="vs semana" valor={cinturaVariacoes.semana} unit="cm" />
            <Card label="desde início" valor={cinturaVariacoes.total} unit="cm" highlight />
          </div>
        </section>
      ) : null}

      {/* Médias */}
      {pesos.length >= 3 ? (
        <section className="card-solid space-y-2">
          <span className="label-cap">média móvel · 7 dias</span>
          <div className="flex items-baseline gap-2">
            <p className="editorial-num text-[36px]">{ma7 ?? '—'}</p>
            <span className="text-faint text-[14px]">kg</span>
          </div>
          <p className="text-faint text-[11.5px] leading-relaxed">
            o valor que importa. ignora oscilações diárias de água, sódio, refeed.
          </p>
        </section>
      ) : null}

      {/* Tendência peso */}
      {pontos30Peso.length >= 2 ? (
        <section className="space-y-2">
          <span className="label-cap px-1">peso · 30 dias</span>
          <TrendChart pontos={pontos30Peso} unidade="kg" cor="var(--ouro)" altura={140} />
        </section>
      ) : null}

      {/* Tendência cintura */}
      {pontos30Cintura.length >= 2 ? (
        <section className="space-y-2">
          <span className="label-cap px-1">cintura · 30 dias</span>
          <TrendChart pontos={pontos30Cintura} unidade="cm" cor="#9B5D3E" altura={120} />
        </section>
      ) : null}

      {/* Histórico recente */}
      {pesos.length > 0 ? (
        <section className="space-y-2">
          <span className="label-cap px-1">Histórico</span>
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {[...pesos].reverse().slice(0, 14).map((p, i) => {
              const idxNoArr = pesos.length - 1 - i
              const anterior = idxNoArr > 0 ? pesos[idxNoArr - 1].peso : null
              const diff = anterior !== null ? Math.round((p.peso - anterior) * 10) / 10 : null
              return (
                <li key={p.id} className="flex items-baseline justify-between px-5 py-3">
                  <div>
                    <p className="font-serif text-[15px] tracking-editorial">
                      {fromIso(p.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', weekday: 'short' })}
                    </p>
                    {p.notas ? <p className="text-faint mt-0.5 text-[11px]">{p.notas}</p> : null}
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-[18px] tnum">{p.peso}<span className="text-faint ml-1 text-[10px]">kg</span></span>
                    {p.cintura !== null ? <span className="text-faint ml-2 text-[12px] tnum">{p.cintura}cm</span> : null}
                    {diff !== null ? (
                      <span className={cn(
                        'ml-2 inline-flex items-baseline gap-0.5 text-[11px] tnum',
                        diff > 0 ? 'text-terracota' : diff < 0 ? 'text-oliva' : 'text-faint'
                      )}>
                        {diff > 0 ? <ArrowUp size={10} strokeWidth={2} /> : diff < 0 ? <ArrowDown size={10} strokeWidth={2} /> : <Minus size={10} strokeWidth={2} />}
                        {Math.abs(diff)}
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <div className="card text-center text-soft text-[13px]">
          a primeira pesagem é o ponto zero. mesma hora a partir de amanhã.
        </div>
      )}

      {pesos.length >= 7 ? (
        <p className="text-faint text-center text-[11px] leading-relaxed">
          a balança regista água + músculo + glicogénio + comida.<br/>
          a média de 7 dias regista a tua composição corporal real.
        </p>
      ) : null}
    </div>
  )
}

function Card({ label, valor, unit, highlight, raw }: { label: string; valor: number | null; unit: string; highlight?: boolean; raw?: boolean }) {
  if (valor === null) {
    return (
      <div className="card-solid">
        <span className="label-cap">{label}</span>
        <p className="font-serif text-[24px] text-faint">—</p>
      </div>
    )
  }
  if (raw) {
    return (
      <div className={cn('card-solid', highlight && 'shadow-hair-strong')}>
        <span className="label-cap">{label}</span>
        <p className="editorial-num text-[28px]">
          {valor}<span className="ml-1 text-[10px] text-faint">{unit}</span>
        </p>
      </div>
    )
  }
  const positivo = valor > 0
  const zero = valor === 0
  return (
    <div className={cn('card-solid', highlight && 'shadow-hair-strong')}>
      <span className="label-cap">{label}</span>
      <p className={cn(
        'editorial-num text-[28px]',
        zero ? 'text-faint' : positivo ? 'text-terracota' : 'text-oliva'
      )}>
        {positivo ? '+' : ''}{valor}
        <span className="ml-1 text-[10px] text-faint">{unit}</span>
      </p>
    </div>
  )
}
