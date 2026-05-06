'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sun, Check, Sunrise, Coffee, Dumbbell, Droplet, Scale } from 'lucide-react'
import {
  getDia,
  getPesoHoje,
  toggleAncora,
  savePeso,
  saveJejum,
  getJejumHoje,
  jejumActualHoras,
  type DiaLog
} from '@/lib/storage'
import { isoDate } from '@/lib/dates'
import { TREINO_SEMANAL } from '@/lib/data'
import { diaSemana } from '@/lib/dates'
import { cn } from '@/lib/utils'

export default function MorningPanel() {
  const [log, setLog] = useState<DiaLog | null>(null)
  const [pesoInput, setPesoInput] = useState('')
  const [cinturaInput, setCinturaInput] = useState('')
  const [pesoHojeReg, setPesoHojeReg] = useState<{ peso: number; cintura: number | null } | null>(null)
  const [jejumCurso, setJejumCurso] = useState<{ horas: number } | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const refresh = () => {
      setLog(getDia())
      const p = getPesoHoje()
      setPesoHojeReg(p ? { peso: p.peso, cintura: p.cintura } : null)
      setJejumCurso(jejumActualHoras())
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    const i = setInterval(() => setTick(t => t + 1), 60000)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      clearInterval(i)
    }
  }, [])

  useEffect(() => {
    setJejumCurso(jejumActualHoras())
  }, [tick])

  if (!log) return null

  const dow = diaSemana(new Date())
  const treino = TREINO_SEMANAL[dow]
  const hora = new Date().getHours()
  const eManha = hora >= 5 && hora < 12
  const eSexta = dow === 'Sexta'

  const todasFeitas =
    !!log.ancoras['eletrolitos'] &&
    pesoHojeReg !== null &&
    (treino.descanso || !!log.ancoras['treino_feito'])

  if (!eManha && todasFeitas) return null // nada por fazer de manhã

  const submitPeso = () => {
    if (!pesoInput) return
    const n = Number(pesoInput)
    if (isNaN(n) || n < 30 || n > 250) return
    const c = cinturaInput ? Number(cinturaInput) : null
    if (c !== null && (isNaN(c) || c < 30 || c > 200)) return
    const horaStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    savePeso({ date: isoDate(), peso: n, cintura: c, hora: horaStr, notas: '' })
    setPesoInput('')
    setCinturaInput('')
  }

  const romperJejum = () => {
    saveJejum({
      date: isoDate(),
      ultimaRefeicao: jejumCurso ? getJejumHoje()?.ultimaRefeicao ?? null : null,
      primeiraRefeicao: new Date().toISOString(),
      duracaoHoras: null,
      meta: 14,
      completou: false
    })
  }

  return (
    <section className="card-feature space-y-5">
      <div className="flex items-center gap-2">
        <Sunrise size={14} strokeWidth={1.4} className="text-ouro" />
        <span className="label-cap">manhã · ferramentas perto</span>
      </div>

      {/* PESO + CINTURA inline */}
      {pesoHojeReg ? (
        <Link href="/peso" className="block rounded-md p-3 bg-oliva/5 transition-elegant hover:bg-oliva/10">
          <div className="flex items-baseline gap-3">
            <Check size={14} strokeWidth={2} className="text-oliva" />
            <span className="font-serif text-[20px] tnum">{pesoHojeReg.peso}<span className="text-faint text-[11px] ml-0.5">kg</span></span>
            {pesoHojeReg.cintura !== null ? (
              <span className="font-serif text-[16px] tnum text-faint">{pesoHojeReg.cintura}<span className="text-[10px] ml-0.5">cm</span></span>
            ) : null}
            <span className="ml-auto text-faint text-[10px] uppercase tracking-cap">registado</span>
          </div>
        </Link>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale size={12} strokeWidth={1.4} className="text-ouro" />
            <span className="label-cap text-[10px]">
              pesa-te {eSexta ? '· cintura (sexta)' : ''}
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="30"
              max="250"
              value={pesoInput}
              onChange={e => setPesoInput(e.target.value)}
              placeholder="peso"
              className="editorial-num w-20 border-0 bg-transparent text-[32px] tnum focus:outline-none"
              style={{ caretColor: 'var(--ouro)' }}
            />
            <span className="text-faint text-[12px]">kg</span>
            {eSexta ? (
              <>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="30"
                  max="200"
                  value={cinturaInput}
                  onChange={e => setCinturaInput(e.target.value)}
                  placeholder="cintura"
                  className="editorial-num w-20 border-0 bg-transparent text-[24px] tnum focus:outline-none ml-2"
                  style={{ caretColor: 'var(--ouro)' }}
                />
                <span className="text-faint text-[12px]">cm</span>
              </>
            ) : null}
            <button
              onClick={submitPeso}
              disabled={!pesoInput}
              className="ml-auto btn-primary px-3 py-1.5 text-[11px]"
            >
              registar
            </button>
          </div>
        </div>
      )}

      <div className="h-px bg-[var(--hair)]" />

      {/* QUICK ÂNCORAS MATINAIS */}
      <div className="space-y-2">
        <QuickAncora
          id="eletrolitos"
          label="eletrólitos"
          sub="água com sal · agora"
          icon={Droplet}
          feita={!!log.ancoras['eletrolitos']}
          onToggle={() => setLog(toggleAncora(isoDate(), 'eletrolitos'))}
        />

        {!treino.descanso ? (
          <QuickAncora
            id="treino_feito"
            label={`treino · ${treino.tipo.toLowerCase()}`}
            sub={treino.descricao}
            icon={Dumbbell}
            feita={!!log.ancoras['treino_feito']}
            onToggle={() => setLog(toggleAncora(isoDate(), 'treino_feito'))}
          />
        ) : (
          <div className="rounded-md p-3 text-center text-[12px] text-faint shadow-hair">
            descanso hoje · sem treino
          </div>
        )}
      </div>

      {/* ROMPER JEJUM */}
      {jejumCurso && jejumCurso.horas >= 12 ? (
        <>
          <div className="h-px bg-[var(--hair)]" />
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="label-cap">jejum em curso</span>
              <span className="tnum text-ouro text-[14px]">{Math.floor(jejumCurso.horas)}h{String(Math.round((jejumCurso.horas % 1) * 60)).padStart(2, '0')}</span>
            </div>
            <p className="text-faint text-[11.5px] leading-relaxed">
              {jejumCurso.horas >= 14 ? 'meta cumprida. romper agora se quiseres.' : `faltam ${(14 - jejumCurso.horas).toFixed(1)}h para 14h. aguenta se conseguires.`}
            </p>
            <button onClick={romperJejum} className="btn-outline w-full text-[12px]">
              <Coffee size={12} strokeWidth={1.5} /> romper jejum agora
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}

function QuickAncora({
  id,
  label,
  sub,
  icon: Icon,
  feita,
  onToggle
}: {
  id: string
  label: string
  sub: string
  icon: typeof Sun
  feita: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={feita}
      className={cn(
        'flex w-full items-center gap-3 rounded-md p-3 text-left transition-elegant active:scale-[0.99]',
        feita ? 'bg-oliva/5' : 'shadow-hair hover:shadow-hair-strong'
      )}
    >
      <span className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-elegant',
        feita ? 'bg-oliva text-creme' : 'border border-[var(--hair-strong)]'
      )}>
        {feita ? <Check size={12} strokeWidth={3} /> : <Icon size={13} strokeWidth={1.4} className="text-faint" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[13px]', feita && 'text-soft')}>{label}</p>
        <p className="text-faint text-[10.5px]">{sub}</p>
      </div>
    </button>
  )
}
