'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import {
  RESET_DAYS,
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
  const params = useSearchParams()
  const queryDate = params.get('d')
  const [selecionada, setSelecionada] = useState<string>(queryDate ?? isoDate())
  const [log, setLog] = useState<DiaLog | null>(null)

  useEffect(() => {
    setLog(getDia(selecionada))
    const onUpdate = () => setLog(getDia(selecionada))
    window.addEventListener('fenixfit:storage', onUpdate)
    return () => window.removeEventListener('fenixfit:storage', onUpdate)
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
  const isHoje = selecionada === isoDate()

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">diário</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">60 dias</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      <DiasStrip dias={dias} selecionada={selecionada} onSelect={setSelecionada} />

      <nav className="flex items-center justify-between gap-3" aria-label="Navegar dias">
        <button
          onClick={() => navegar(-1)}
          className="btn-ghost"
          aria-label="Dia anterior"
          disabled={dias.indexOf(selecionada) === 0}
        >
          <ChevronLeft size={14} strokeWidth={1.4} />
        </button>
        <div className="text-center">
          <p className="font-serif text-[22px] font-light tracking-editorial">
            <span className="tnum">Dia {String(numDia).padStart(2, '0')}</span>
            <span className="text-faint"> / {RESET_DAYS}</span>
          </p>
          <p className="label-soft mt-1">
            {dow.toLowerCase()} · {formatarData(data)}
            {isHoje ? <span className="ml-2 text-ouro">· hoje</span> : null}
          </p>
        </div>
        <button
          onClick={() => navegar(1)}
          className="btn-ghost"
          aria-label="Dia seguinte"
          disabled={dias.indexOf(selecionada) === dias.length - 1}
        >
          <ChevronRight size={14} strokeWidth={1.4} />
        </button>
      </nav>

      {log ? (
        <DiaForm
          log={log}
          treino={treino}
          dow={dow}
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
    <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:-mx-7 sm:px-7">
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
                  'flex w-11 flex-col items-center rounded-md py-2 transition-elegant active:scale-95',
                  isActive
                    ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta'
                    : isHoje
                      ? 'shadow-hair-strong'
                      : proximo
                        ? 'opacity-30 hover:opacity-60'
                        : 'hover:bg-[var(--surface-soft)]'
                )}
              >
                <span className="text-[9px] uppercase tracking-cap opacity-70">{diaSemanaCurto(data)}</span>
                <span className="font-serif text-[15px] tnum">{data.getDate()}</span>
                <span className="text-[9px] opacity-60">{mesCurto(data)}</span>
                <span
                  className={cn(
                    'mt-1 h-px w-3 transition-elegant',
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
  dow,
  onChange,
  onToggle
}: {
  log: DiaLog
  treino: { tipo: string; descricao: string; descanso: boolean }
  dow: string
  onChange: (l: DiaLog) => void
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="card-solid">
        <span className="label-cap">treino · {dow.toLowerCase()}</span>
        <p className="mt-2 font-serif text-[18px] tracking-editorial">{treino.tipo}</p>
        <p className="text-faint mt-1 text-[12.5px]">{treino.descricao}</p>
      </div>

      <section>
        <span className="label-cap mb-3 block">Âncoras</span>
        <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
          {ANCORAS.map((a, idx) => {
            const feita = !!log.ancoras[a.id]
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onToggle(a.id)}
                  aria-pressed={feita}
                  className={cn(
                    'flex w-full items-start gap-3 px-5 py-3.5 text-left transition-elegant active:scale-[0.99]',
                    feita ? 'opacity-90' : 'hover:bg-[var(--surface-soft)]'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-elegant',
                      feita ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta' : 'border border-[var(--hair-strong)]'
                    )}
                    aria-hidden
                  >
                    {feita ? <Check size={11} strokeWidth={3} /> : <span className="text-[9px] text-faint">{String(idx + 1).padStart(2, '0')}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[14px]', feita && 'text-soft line-through decoration-[var(--hair-strong)]')}>
                      {a.titulo}
                    </span>
                    <span className="text-faint mt-0.5 block text-[11.5px]">{a.detalhe}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <NumberField label="Sono" unit="h" step={0.5} value={log.sonoHoras} onChange={v => onChange({ ...log, sonoHoras: v })} />
        <NumberField label="Caminhada" unit="min" step={5} value={log.caminhadaMin} onChange={v => onChange({ ...log, caminhadaMin: v })} />
        <ScaleField label="Energia" value={log.energia} onChange={v => onChange({ ...log, energia: v })} />
        <ScaleField label="Humor" value={log.humor} onChange={v => onChange({ ...log, humor: v })} />
      </section>

      <section className="space-y-2">
        <span className="label-cap px-1">Notas</span>
        <textarea
          value={log.notas}
          onChange={e => onChange({ ...log, notas: e.target.value })}
          placeholder="o que precisas registar..."
          rows={3}
          className="input-base resize-none text-[14px]"
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
          className="editorial-num w-full bg-transparent text-[24px] placeholder:text-faint focus:outline-none"
        />
        <span className="text-faint text-[11px]">{unit}</span>
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
              'flex-1 rounded-md py-1.5 font-serif text-[13px] tnum transition-elegant active:scale-95',
              value === n
                ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta'
                : 'shadow-hair text-faint hover:text-soft'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
