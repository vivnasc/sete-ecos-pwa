'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock, Sun, Moon, Check, Pencil, X, Trash2, RotateCcw } from 'lucide-react'
import {
  getJejuns,
  getJejumHoje,
  saveJejum,
  removeJejum,
  anularPrimeiraRefeicao,
  streakJejum,
  jejumActualHoras,
  type JejumLog
} from '@/lib/storage'
import { isoDate, fromIso } from '@/lib/dates'
import BackButton from '@/components/BackButton'
import { cn } from '@/lib/utils'

export default function JejumPage() {
  const [jejuns, setJejuns] = useState<JejumLog[]>([])
  const [hoje, setHoje] = useState<JejumLog | null>(null)
  const [emCurso, setEmCurso] = useState<{ horas: number; ultimaRef: string } | null>(null)
  const [meta, setMeta] = useState<14 | 16>(14)
  const [tick, setTick] = useState(0)
  const [editarUltima, setEditarUltima] = useState(false)
  const [editarPrimeira, setEditarPrimeira] = useState(false)
  const [horaUltima, setHoraUltima] = useState('')
  const [diaUltima, setDiaUltima] = useState<'hoje' | 'ontem' | 'anteontem'>('ontem')
  const [horaPrimeira, setHoraPrimeira] = useState('')
  const [editar, setEditar] = useState<JejumLog | null>(null)

  const refresh = () => {
    setJejuns(getJejuns())
    const h = getJejumHoje()
    setHoje(h)
    if (h) setMeta((h.meta as 14 | 16) ?? 14)
    setEmCurso(jejumActualHoras())
  }

  useEffect(() => {
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    setEmCurso(jejumActualHoras())
  }, [tick])

  const streak = useMemo(() => streakJejum(), [jejuns])
  const ultimos14 = useMemo(() => jejuns.slice(-14).filter(j => j.completou).length, [jejuns])
  const mediaSemana = useMemo(() => {
    const ult = jejuns.slice(-7).filter(j => j.duracaoHoras !== null)
    if (ult.length === 0) return null
    return Math.round((ult.reduce((a, j) => a + (j.duracaoHoras ?? 0), 0) / ult.length) * 10) / 10
  }, [jejuns])

  const marcarUltimaRefeicao = () => {
    const date = isoDate()
    const existing = hoje ?? { date, ultimaRefeicao: null, primeiraRefeicao: null, duracaoHoras: null, meta, completou: false, id: '' }
    saveJejum({
      date,
      ultimaRefeicao: new Date().toISOString(),
      primeiraRefeicao: existing.primeiraRefeicao,
      duracaoHoras: null,
      meta,
      completou: false
    })
  }

  const marcarUltimaRefeicaoComHora = (hhmm: string, dia: 'hoje' | 'ontem' | 'anteontem' = 'hoje') => {
    if (!/^\d{1,2}:\d{2}$/.test(hhmm)) return
    const [h, m] = hhmm.split(':').map(Number)
    const d = new Date()
    if (dia === 'ontem') d.setDate(d.getDate() - 1)
    if (dia === 'anteontem') d.setDate(d.getDate() - 2)
    d.setHours(h, m, 0, 0)
    // segurança · se ainda assim ficar no futuro, puxa para trás 1 dia
    if (d.getTime() > Date.now()) d.setDate(d.getDate() - 1)
    const date = isoDate()
    const existing = hoje ?? { date, ultimaRefeicao: null, primeiraRefeicao: null, duracaoHoras: null, meta, completou: false, id: '' }
    saveJejum({
      date,
      ultimaRefeicao: d.toISOString(),
      primeiraRefeicao: existing.primeiraRefeicao,
      duracaoHoras: null,
      meta,
      completou: false
    })
  }

  const marcarPrimeiraRefeicaoComHora = (hhmm: string) => {
    if (!emCurso) return
    if (!/^\d{1,2}:\d{2}$/.test(hhmm)) return
    const [h, m] = hhmm.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    if (d.getTime() > Date.now()) d.setDate(d.getDate() - 1)
    const date = isoDate()
    saveJejum({
      date,
      ultimaRefeicao: emCurso.ultimaRef,
      primeiraRefeicao: d.toISOString(),
      duracaoHoras: null,
      meta,
      completou: false
    })
  }

  const marcarPrimeiraRefeicao = () => {
    if (!emCurso) return
    const date = isoDate()
    saveJejum({
      date,
      ultimaRefeicao: emCurso.ultimaRef,
      primeiraRefeicao: new Date().toISOString(),
      duracaoHoras: null,
      meta,
      completou: false
    })
  }

  const cancelarJejumActual = () => {
    if (!window.confirm('apagar este jejum em curso? a última refeição volta a poder ser registada.')) return
    // descobrir qual o registo · pode estar em hoje ou ontem
    const hojeIso = isoDate()
    const ontemIso = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return isoDate(d)
    })()
    const reg = getJejuns().find(j => (j.date === hojeIso || j.date === ontemIso) && j.ultimaRefeicao && !j.primeiraRefeicao)
    if (reg) removeJejum(reg.id)
    refresh()
  }

  const anularComeu = () => {
    if (!hoje) return
    if (!window.confirm('anular a primeira refeição de hoje? o jejum recomeça do ponto onde estava.')) return
    anularPrimeiraRefeicao(hoje.date)
    refresh()
  }

  const corStatus = (h: number): string => {
    if (h >= meta) return 'text-oliva'
    if (h >= meta - 2) return 'text-ouro'
    return 'text-soft'
  }

  // estado: hoje já tem jejum completo (com primeira refeição) → mostra resumo + opções de undo
  const jejumHojeFechado = hoje && hoje.ultimaRefeicao && hoje.primeiraRefeicao

  return (
    <div className="space-y-7 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">jejum</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          janela 9h–19h
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">
          última refeição da véspera → primeira de hoje · meta 14h então 16h
        </p>
      </header>

      {/* Meta selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMeta(14)}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-[12px] uppercase tracking-cap transition-elegant',
            meta === 14 ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta' : 'shadow-hair text-faint'
          )}
        >
          meta 14h
        </button>
        <button
          onClick={() => setMeta(16)}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-[12px] uppercase tracking-cap transition-elegant',
            meta === 16 ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta' : 'shadow-hair text-faint'
          )}
        >
          meta 16h
        </button>
      </div>

      {/* Estado actual */}
      {jejumHojeFechado ? (
        <section className="card-feature text-center space-y-4">
          <div>
            <div className="flex items-center justify-center gap-2">
              <Check size={14} strokeWidth={1.6} className={hoje!.completou ? 'text-oliva' : 'text-ouro'} />
              <span className="label-cap">jejum fechado · hoje</span>
            </div>
            <p className={cn('editorial-num mt-4 text-[80px] leading-none', hoje!.completou ? 'text-oliva' : 'text-soft')}>
              {hoje!.duracaoHoras !== null ? Math.floor(hoje!.duracaoHoras) : '—'}
              <span className="text-faint text-[24px]">h{hoje!.duracaoHoras !== null ? Math.round((hoje!.duracaoHoras % 1) * 60).toString().padStart(2, '0') : ''}</span>
            </p>
            <p className="text-faint mt-3 text-[12px]">
              {hoje!.ultimaRefeicao ? new Date(hoje!.ultimaRefeicao).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
              {' → '}
              {hoje!.primeiraRefeicao ? new Date(hoje!.primeiraRefeicao).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={anularComeu} className="btn-outline">
              <RotateCcw size={13} strokeWidth={1.5} />
              <span className="text-[11px] ml-1">anular &ldquo;comi&rdquo;</span>
            </button>
            <button onClick={() => setEditar(hoje!)} className="btn-outline">
              <Pencil size={13} strokeWidth={1.5} />
              <span className="text-[11px] ml-1">editar horas</span>
            </button>
          </div>
          <p className="text-faint text-[10.5px] leading-relaxed">
            clicaste em &ldquo;comi&rdquo; sem querer? &ldquo;anular&rdquo; volta a abrir o jejum em curso.
          </p>
        </section>
      ) : emCurso ? (
        <section className="card-feature text-center space-y-4">
          <div>
            <div className="flex items-center justify-center gap-2">
              <Clock size={14} strokeWidth={1.4} className="text-ouro" />
              <span className="label-cap">jejum em curso</span>
            </div>
            <p className={cn('editorial-num mt-4 text-[80px] leading-none', corStatus(emCurso.horas))}>
              {Math.floor(emCurso.horas)}<span className="text-faint text-[24px]">h{Math.round((emCurso.horas % 1) * 60).toString().padStart(2, '0')}</span>
            </p>
            <p className="text-faint mt-3 text-[12px]">
              desde {new Date(emCurso.ultimaRef).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="mx-auto mt-4 h-px w-8 bg-ouro" aria-hidden />
            <p className="text-soft mt-4 text-[13px]">
              {emCurso.horas >= meta
                ? `meta de ${meta}h cumprida.`
                : `faltam ${(meta - emCurso.horas).toFixed(1)}h para a meta.`}
            </p>
          </div>
          {editarPrimeira ? (
            <div className="card-solid !p-3 space-y-2">
              <p className="text-faint text-[10.5px] text-left">a que horas comeste?</p>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={horaPrimeira}
                  onChange={e => setHoraPrimeira(e.target.value)}
                  className="flex-1 rounded-md border border-[var(--hair)] bg-transparent p-2 text-[14px] tnum focus:border-ouro focus:outline-none"
                />
                <button
                  onClick={() => { marcarPrimeiraRefeicaoComHora(horaPrimeira); setEditarPrimeira(false); setHoraPrimeira('') }}
                  disabled={!horaPrimeira}
                  className="btn-primary px-4 disabled:opacity-40"
                >guardar</button>
                <button onClick={() => setEditarPrimeira(false)} className="btn-ghost px-3">
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button onClick={marcarPrimeiraRefeicao} className="btn-primary flex-1">
                  <Sun size={14} strokeWidth={1.4} /> comi agora
                </button>
                <button
                  onClick={() => {
                    const d = new Date()
                    setHoraPrimeira(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
                    setEditarPrimeira(true)
                  }}
                  className="btn-outline px-4"
                  aria-label="ajustar hora"
                >
                  <Pencil size={13} strokeWidth={1.4} />
                  <span className="text-[11px] ml-1">outra hora</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const reg = getJejuns().find(j => j.ultimaRefeicao === emCurso.ultimaRef)
                    if (reg) setEditar(reg)
                  }}
                  className="btn-outline"
                >
                  <Pencil size={13} strokeWidth={1.4} />
                  <span className="text-[11px] ml-1">editar última</span>
                </button>
                <button onClick={cancelarJejumActual} className="btn-outline text-terracota">
                  <Trash2 size={13} strokeWidth={1.4} />
                  <span className="text-[11px] ml-1">cancelar</span>
                </button>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="card-feature text-center space-y-4">
          <div>
            <div className="flex items-center justify-center gap-2">
              <Sun size={14} strokeWidth={1.4} className="text-ouro" />
              <span className="label-cap">não há jejum em curso</span>
            </div>
            <p className="text-soft mt-4 text-[13px] leading-relaxed">
              quando acabares de comer, marca a tua última refeição. esquecer é normal · podes ajustar a hora.
            </p>
          </div>
          {editarUltima ? (
            <div className="card-solid !p-3 space-y-3">
              <p className="text-faint text-[10.5px] text-left">a que dia foi?</p>
              <div className="flex gap-1.5">
                {([
                  { id: 'hoje' as const, label: 'hoje' },
                  { id: 'ontem' as const, label: 'ontem' },
                  { id: 'anteontem' as const, label: 'anteontem' }
                ]).map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDiaUltima(d.id)}
                    className={cn(
                      'flex-1 rounded-md py-1.5 text-[11px] transition-elegant active:scale-95',
                      diaUltima === d.id ? 'bg-tinta text-creme dark:bg-ouro dark:text-tinta' : 'bg-[var(--surface-soft)] text-soft'
                    )}
                  >{d.label}</button>
                ))}
              </div>
              <p className="text-faint text-[10.5px] text-left">a que horas?</p>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={horaUltima}
                  onChange={e => setHoraUltima(e.target.value)}
                  className="flex-1 rounded-md border border-[var(--hair)] bg-transparent p-2 text-[14px] tnum focus:border-ouro focus:outline-none"
                />
                <button
                  onClick={() => { marcarUltimaRefeicaoComHora(horaUltima, diaUltima); setEditarUltima(false); setHoraUltima(''); setDiaUltima('ontem') }}
                  disabled={!horaUltima}
                  className="btn-primary px-4 disabled:opacity-40"
                >guardar</button>
                <button onClick={() => setEditarUltima(false)} className="btn-ghost px-3">
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={marcarUltimaRefeicao} className="btn-primary flex-1">
                <Moon size={14} strokeWidth={1.4} /> agora
              </button>
              <button
                onClick={() => {
                  const d = new Date()
                  setHoraUltima(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
                  setDiaUltima('ontem')
                  setEditarUltima(true)
                }}
                className="btn-outline px-4"
                aria-label="ajustar hora"
              >
                <Pencil size={13} strokeWidth={1.4} />
                <span className="text-[11px] ml-1">outra hora</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Stat label="streak" valor={streak} unit={streak === 1 ? 'dia' : 'dias'} />
        <Stat label="14d limpos" valor={ultimos14} unit={`/ ${Math.min(14, jejuns.length)}`} />
        <Stat label="média 7d" valor={mediaSemana} unit="h" decimal />
      </section>

      {/* Histórico · cada item tappable para editar/apagar */}
      <section className="space-y-2">
        <span className="label-cap px-1">histórico</span>
        {jejuns.length === 0 ? (
          <div className="card text-center text-soft text-[13px]">
            primeiro jejum começa quando registares a primeira última refeição.
          </div>
        ) : (
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {[...jejuns].reverse().slice(0, 14).map(j => (
              <li key={j.id}>
                <button
                  onClick={() => setEditar(j)}
                  className="w-full flex items-baseline justify-between px-5 py-3 text-left active:bg-[var(--surface-soft)] transition-elegant"
                >
                  <div>
                    <p className="font-serif text-[15px] tracking-editorial">
                      {fromIso(j.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', weekday: 'short' })}
                    </p>
                    <p className="text-faint mt-0.5 text-[11px]">
                      {j.ultimaRefeicao ? new Date(j.ultimaRefeicao).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      {' → '}
                      {j.primeiraRefeicao ? new Date(j.primeiraRefeicao).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5 text-right">
                    <span className={cn('font-serif text-[18px] tnum', j.completou ? 'text-oliva' : j.duracaoHoras !== null ? 'text-soft' : 'text-faint')}>
                      {j.duracaoHoras !== null ? j.duracaoHoras : '—'}
                    </span>
                    <span className="text-faint text-[10px]">h</span>
                    {j.completou ? <Check size={12} strokeWidth={2} className="ml-1 text-oliva" /> : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-faint text-[10.5px] px-1 leading-relaxed">toca num jejum para editar horas ou apagar.</p>
      </section>

      <p className="text-faint text-center text-[11px] leading-relaxed">
        chá, café, água com sal não quebram. açúcar, leite, fruta quebram.
      </p>

      {editar ? (
        <EditarJejumSheet
          jejum={editar}
          onClose={() => setEditar(null)}
          onSaved={() => { setEditar(null); refresh() }}
        />
      ) : null}
    </div>
  )
}

function Stat({ label, valor, unit, decimal }: { label: string; valor: number | null; unit: string; decimal?: boolean }) {
  return (
    <div className="card-solid text-center">
      <span className="label-cap">{label}</span>
      <p className="editorial-num mt-2 text-[26px]">
        {valor === null ? '—' : decimal ? valor : valor}
      </p>
      <p className="text-faint mt-1 text-[10px] tracking-cap uppercase">{unit}</p>
    </div>
  )
}

// Sheet para editar/apagar um jejum existente · separa data e hora
function EditarJejumSheet({ jejum, onClose, onSaved }: { jejum: JejumLog; onClose: () => void; onSaved: () => void }) {
  const fmtDateTime = (iso: string | null) => {
    if (!iso) return { data: '', hora: '' }
    const d = new Date(iso)
    const data = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    return { data, hora }
  }
  const ult = fmtDateTime(jejum.ultimaRefeicao)
  const pri = fmtDateTime(jejum.primeiraRefeicao)
  const [ultData, setUltData] = useState(ult.data)
  const [ultHora, setUltHora] = useState(ult.hora)
  const [priData, setPriData] = useState(pri.data)
  const [priHora, setPriHora] = useState(pri.hora)

  const combinar = (data: string, hora: string): string | null => {
    if (!data || !hora) return null
    const [h, m] = hora.split(':').map(Number)
    const [y, mo, d] = data.split('-').map(Number)
    const dt = new Date(y, mo - 1, d, h, m, 0, 0)
    return dt.toISOString()
  }

  const guardar = () => {
    const u = combinar(ultData, ultHora)
    const p = combinar(priData, priHora)
    saveJejum({
      date: jejum.date,
      ultimaRefeicao: u,
      primeiraRefeicao: p,
      duracaoHoras: null,
      meta: jejum.meta,
      completou: false
    })
    onSaved()
  }

  const apagarTudo = () => {
    if (!window.confirm('apagar este jejum completamente?')) return
    removeJejum(jejum.id)
    onSaved()
  }

  const limparUltima = () => {
    setUltData('')
    setUltHora('')
  }

  const limparPrimeira = () => {
    setPriData('')
    setPriHora('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="card-feature w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <span className="label-cap">editar jejum</span>
          <button onClick={onClose} className="text-faint active:scale-90"><X size={16} strokeWidth={1.5} /></button>
        </div>
        <p className="font-serif text-[15px]">
          {fromIso(jejum.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', weekday: 'long' })}
        </p>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="label-cap">última refeição</span>
            {ultData || ultHora ? (
              <button onClick={limparUltima} className="text-[10.5px] text-faint hover:text-terracota">limpar</button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={ultData}
              onChange={e => setUltData(e.target.value)}
              className="rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
            />
            <input
              type="time"
              value={ultHora}
              onChange={e => setUltHora(e.target.value)}
              className="rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="label-cap">primeira refeição (quebra)</span>
            {priData || priHora ? (
              <button onClick={limparPrimeira} className="text-[10.5px] text-faint hover:text-terracota">limpar</button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={priData}
              onChange={e => setPriData(e.target.value)}
              className="rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
            />
            <input
              type="time"
              value={priHora}
              onChange={e => setPriHora(e.target.value)}
              className="rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
            />
          </div>
          <p className="text-faint text-[10.5px] leading-relaxed">limpa a primeira refeição se foi marcada por engano · jejum volta a estar em curso.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button onClick={guardar} className="btn-primary">guardar</button>
          <button onClick={apagarTudo} className="btn-outline text-terracota">
            <Trash2 size={13} strokeWidth={1.5} />
            <span className="text-[11px] ml-1">apagar tudo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
