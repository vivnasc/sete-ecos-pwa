'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import {
  RESET_DAYS,
  RESET_START,
  diaSemana,
  diaSemanaCurto,
  formatarData,
  isoDate,
  todosOsDias,
  fromIso,
  diaDoPlano,
  mesCurto
} from '@/lib/dates'
import { ANCORAS, TREINO_SEMANAL } from '@/lib/data'
import { getDia, saveDia, toggleAncora, type DiaLog } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function DiarioPage() {
  const [selecionada, setSelecionada] = useState<string>(isoDate())
  const [log, setLog] = useState<DiaLog | null>(null)

  useEffect(() => {
    setLog(getDia(selecionada))
  }, [selecionada])

  const dias = useMemo(() => todosOsDias().map(d => isoDate(d)), [])

  const navegar = (passo: number) => {
    const idx = dias.indexOf(selecionada)
    const novoIdx = idx + passo
    if (novoIdx >= 0 && novoIdx < dias.length) setSelecionada(dias[novoIdx])
  }

  const data = fromIso(selecionada)
  const dow = diaSemana(data)
  const treino = TREINO_SEMANAL[dow]
  const numDia = dias.indexOf(selecionada) + 1

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Diário</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">60 dias</h1>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      <DiasStrip dias={dias} selecionada={selecionada} onSelect={setSelecionada} />

      <nav className="flex items-center justify-between gap-3" aria-label="Navegar dias">
        <button onClick={() => navegar(-1)} className="btn-ghost gap-1" aria-label="Dia anterior" disabled={dias.indexOf(selecionada) === 0}>
          <ChevronLeft size={18} />
          anterior
        </button>
        <div className="text-center">
          <p className="font-serif text-xl text-castanho">
            Dia <span className="text-ouro">{numDia}</span>
            <span className="text-cinza"> / {RESET_DAYS}</span>
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-oliva">
            {dow} · {formatarData(data)}
          </p>
        </div>
        <button onClick={() => navegar(1)} className="btn-ghost gap-1" aria-label="Dia seguinte" disabled={dias.indexOf(selecionada) === dias.length - 1}>
          seguinte
          <ChevronRight size={18} />
        </button>
      </nav>

      {log ? (
        <DiaForm
          log={log}
          treino={treino}
          onChange={novo => {
            setLog(novo)
            saveDia(novo)
          }}
          onToggle={id => setLog(toggleAncora(selecionada, id))}
        />
      ) : null}
    </div>
  )
}

function DiasStrip({
  dias,
  selecionada,
  onSelect
}: {
  dias: string[]
  selecionada: string
  onSelect: (d: string) => void
}) {
  const hoje = isoDate()
  const diaActual = diaDoPlano()

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      <ol className="flex gap-1.5">
        {dias.map((d, i) => {
          const data = fromIso(d)
          const isActive = d === selecionada
          const isHoje = d === hoje
          const log = getDia(d)
          const cumpridas = Object.values(log.ancoras).filter(Boolean).length
          const proximo = i + 1 > diaActual

          return (
            <li key={d}>
              <button
                onClick={() => onSelect(d)}
                aria-current={isActive ? 'date' : undefined}
                className={cn(
                  'flex w-12 flex-col items-center rounded-xl py-2 transition active:scale-95',
                  isActive
                    ? 'bg-castanho text-creme'
                    : isHoje
                      ? 'bg-ouro/15 text-castanho ring-1 ring-ouro/40'
                      : proximo
                        ? 'text-castanho/40 hover:text-castanho/70'
                        : 'text-castanho/70 hover:bg-white/60'
                )}
              >
                <span className="text-[9px] uppercase tracking-wide">{diaSemanaCurto(data)}</span>
                <span className="font-serif text-base">{data.getDate()}</span>
                <span className="text-[9px] text-current/50">{mesCurto(data)}</span>
                <span
                  className={cn(
                    'mt-1 h-1 w-4 rounded-full transition',
                    cumpridas === 0 ? 'bg-transparent' : cumpridas < 5 ? 'bg-terracota' : 'bg-oliva'
                  )}
                  aria-hidden
                />
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function DiaForm({
  log,
  treino,
  onChange,
  onToggle
}: {
  log: DiaLog
  treino: { tipo: string; descricao: string; descanso: boolean }
  onChange: (l: DiaLog) => void
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="card-solid">
        <span className="label-cap">Treino do dia</span>
        <p className="mt-1 font-serif text-lg text-castanho">{treino.tipo}</p>
        <p className="text-sm text-cinza">{treino.descricao}</p>
      </div>

      <section className="space-y-3">
        <span className="label-cap px-1">Âncoras</span>
        <ul className="space-y-2">
          {ANCORAS.map(a => {
            const feita = !!log.ancoras[a.id]
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onToggle(a.id)}
                  aria-pressed={feita}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl bg-white/60 p-3 text-left ring-1 transition active:scale-[0.99]',
                    feita ? 'ring-oliva/40 bg-oliva/5' : 'ring-ouro/15'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      feita ? 'bg-oliva text-creme' : 'border border-castanho/30 bg-creme'
                    )}
                    aria-hidden
                  >
                    {feita ? <Check size={14} strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{a.titulo}</span>
                    <span className="block text-xs text-cinza">{a.detalhe}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <NumberField
          label="Sono"
          unit="h"
          step={0.5}
          value={log.sonoHoras}
          onChange={v => onChange({ ...log, sonoHoras: v })}
        />
        <NumberField
          label="Caminhada"
          unit="min"
          step={5}
          value={log.caminhadaMin}
          onChange={v => onChange({ ...log, caminhadaMin: v })}
        />
        <ScaleField
          label="Energia"
          value={log.energia}
          onChange={v => onChange({ ...log, energia: v })}
        />
        <ScaleField
          label="Humor"
          value={log.humor}
          onChange={v => onChange({ ...log, humor: v })}
        />
      </section>

      <section className="space-y-2">
        <span className="label-cap px-1">Notas</span>
        <textarea
          value={log.notas}
          onChange={e => onChange({ ...log, notas: e.target.value })}
          placeholder="o que precisas de registar..."
          rows={3}
          className="input-base resize-none"
        />
      </section>
    </div>
  )
}

function NumberField({
  label,
  unit,
  step,
  value,
  onChange
}: {
  label: string
  unit: string
  step: number
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <label className="card flex flex-col gap-1.5">
      <span className="label-cap">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="—"
          className="w-full bg-transparent font-serif text-2xl text-castanho placeholder:text-cinza/50 focus:outline-none"
        />
        <span className="text-xs text-cinza">{unit}</span>
      </div>
    </label>
  )
}

function ScaleField({
  label,
  value,
  onChange
}: {
  label: string
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="card flex flex-col gap-2">
      <span className="label-cap">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}`}
            className={cn(
              'flex-1 rounded-lg py-1.5 font-serif text-sm transition active:scale-95',
              value === n
                ? 'bg-castanho text-creme'
                : 'bg-creme-escuro/40 text-castanho/60 hover:bg-creme-escuro'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
