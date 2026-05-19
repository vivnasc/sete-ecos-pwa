'use client'

// Tracker de treino livre · sem planos hardcoded.
// A Vivianne disse: 'sou muito fluida, n consigo seguir planos, acordo
// e faço a actividade que me parece nesse dia'. Logo:
// - Registo livre (tipo + duração + intensidade + notas)
// - Importação automática de Apple Health (Auto Export · workouts)
// - Visualização: lista recente, contagem semanal, tipo mais frequente, tendência

import { useEffect, useMemo, useState } from 'react'
import { Activity, Plus, X, Trash2, Footprints, Dumbbell, Bike, Heart } from 'lucide-react'
import BackButton from '@/components/BackButton'
import { isoDate, fromIso } from '@/lib/dates'
import {
  getTreinos,
  addTreino,
  removeTreino,
  treinosPorSemana,
  sincronizarTreinosDosDias,
  type TreinoLog
} from '@/lib/storage'
import { cn } from '@/lib/utils'

const TIPOS_RAPIDOS = ['caminhada', 'pilates', 'força', 'yoga', 'corrida', 'bicicleta', 'natação', 'outro']

const ICONE_POR_TIPO: Record<string, typeof Activity> = {
  caminhada: Footprints,
  corrida: Footprints,
  força: Dumbbell,
  bicicleta: Bike,
  yoga: Heart,
  pilates: Heart
}

export default function TreinoPage() {
  const [treinos, setTreinos] = useState<TreinoLog[]>([])
  const [adicionar, setAdicionar] = useState(false)

  const refresh = () => setTreinos(getTreinos())

  useEffect(() => {
    // Importa workouts da Apple Health (das notas dos dias) para fenixfit_treinos
    const n = sincronizarTreinosDosDias()
    if (n > 0) {
      // eslint-disable-next-line no-console
      console.info(`[treino] ${n} treinos importados de Apple Health`)
    }
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const semanal = useMemo(() => treinosPorSemana(8), [treinos])
  const ult7d = treinos.filter(t => {
    const diff = (Date.now() - fromIso(t.date).getTime()) / 86400000
    return diff <= 7
  })
  const ult30d = treinos.filter(t => {
    const diff = (Date.now() - fromIso(t.date).getTime()) / 86400000
    return diff <= 30
  })
  const minutos7d = ult7d.reduce((s, t) => s + (t.duracaoMin ?? 0), 0)
  const minutos30d = ult30d.reduce((s, t) => s + (t.duracaoMin ?? 0), 0)

  // Tipo mais frequente nos últimos 30d
  const tiposCont: Record<string, number> = {}
  ult30d.forEach(t => {
    const k = t.tipo.toLowerCase().trim()
    tiposCont[k] = (tiposCont[k] ?? 0) + 1
  })
  const topTipos = Object.entries(tiposCont).sort(([, a], [, b]) => b - a).slice(0, 4)

  return (
    <div className="space-y-7 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">treino</p>
        <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-editorial sm:text-[42px]">
          Corpo já sabe
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          tu decides no dia · tracking flexível · sem plano fixo
        </p>
      </header>

      {/* Resumo · 7d e 30d */}
      <section className="grid grid-cols-2 gap-3">
        <CardResumo label="esta semana" valor={String(ult7d.length)} sub={`${minutos7d}min · ${ult7d.length === 1 ? 'treino' : 'treinos'}`} />
        <CardResumo label="últimos 30d" valor={String(ult30d.length)} sub={`${Math.round(minutos30d / 60 * 10) / 10}h totais`} />
      </section>

      {/* Tipos mais frequentes */}
      {topTipos.length > 0 ? (
        <section className="card-solid space-y-2">
          <span className="label-cap">o que tens feito · 30d</span>
          <div className="flex flex-wrap gap-1.5">
            {topTipos.map(([tipo, n]) => (
              <span key={tipo} className="rounded-md bg-[var(--surface-soft)] px-2.5 py-1 text-[11.5px] text-soft">
                {tipo} · <span className="tnum text-tinta dark:text-creme">{n}×</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Tendência semanal · barras */}
      {semanal.some(s => s.n > 0) ? (
        <BarrasSemanais semanal={semanal} />
      ) : null}

      {/* Botão adicionar */}
      <button
        onClick={() => setAdicionar(true)}
        className="btn-primary w-full inline-flex items-center justify-center gap-2"
      >
        <Plus size={14} strokeWidth={1.5} />
        registar treino
      </button>

      {/* Histórico recente */}
      <section className="space-y-2">
        <span className="label-cap px-1">histórico · {Math.min(treinos.length, 30)} mais recentes</span>
        {treinos.length === 0 ? (
          <div className="card-solid text-center py-8 text-soft text-[13px]">
            ainda sem treinos registados.<br />
            <span className="text-faint text-[11.5px]">os de Apple Health aparecem automático · podes adicionar pilates/yoga manualmente</span>
          </div>
        ) : (
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {treinos.slice(0, 30).map(t => {
              const Ic = ICONE_POR_TIPO[t.tipo.toLowerCase()] ?? Activity
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <Ic size={14} strokeWidth={1.4} className="text-ouro shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[14.5px] capitalize">{t.tipo}</span>
                      {t.duracaoMin ? <span className="text-faint text-[11.5px] tnum">· {t.duracaoMin}min</span> : null}
                      {t.intensidade ? <span className="text-faint text-[11.5px] tnum">· int {t.intensidade}/5</span> : null}
                    </div>
                    <p className="text-faint text-[10.5px] tnum">
                      {fromIso(t.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', weekday: 'short' })}
                      {t.fonte === 'apple_health' ? ' · Apple Health' : ''}
                    </p>
                    {t.notas ? <p className="text-soft text-[11.5px] italic mt-0.5">{t.notas}</p> : null}
                  </div>
                  <button
                    onClick={() => { if (window.confirm('apagar?')) { removeTreino(t.id); refresh() } }}
                    aria-label="apagar"
                    className="text-faint hover:text-terracota active:scale-90"
                  >
                    <Trash2 size={13} strokeWidth={1.4} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {adicionar ? <NovoTreinoSheet onClose={() => setAdicionar(false)} onSave={() => { setAdicionar(false); refresh() }} /> : null}
    </div>
  )
}

function CardResumo({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="card-solid text-center">
      <span className="label-cap">{label}</span>
      <p className="editorial-num text-[36px] tnum mt-2 leading-none">{valor}</p>
      <p className="text-faint text-[10.5px] mt-1 tracking-cap uppercase">{sub}</p>
    </div>
  )
}

function BarrasSemanais({ semanal }: { semanal: Array<{ semana: string; n: number; minutos: number }> }) {
  const w = 320
  const h = 110
  const pad = { t: 10, r: 4, b: 22, l: 22 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b
  const maxN = Math.max(...semanal.map(s => s.n), 4)
  const barW = cw / semanal.length
  return (
    <section className="card-solid space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">treinos por semana · 8 semanas</span>
        <span className="text-faint text-[10.5px]">{semanal[semanal.length - 1]?.n ?? 0} esta sem.</span>
      </div>
      <div className="-mx-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
          <line x1={pad.l} y1={pad.t + ch} x2={w - pad.r} y2={pad.t + ch} stroke="rgba(150,140,120,0.3)" />
          {semanal.map((s, i) => {
            const x = pad.l + i * barW + barW * 0.15
            const altura = (s.n / maxN) * ch
            const cor = s.n === 0 ? '#A8987840' : s.n >= 4 ? '#7B9A4F' : s.n >= 2 ? '#D4A14E' : '#A89878'
            return (
              <g key={i}>
                <rect x={x} y={pad.t + ch - altura} width={barW * 0.7} height={altura} rx="2" fill={cor}>
                  <title>{s.semana}: {s.n} treinos · {s.minutos}min</title>
                </rect>
                <text x={x + barW * 0.35} y={h - 6} fontSize="8" fill="rgba(150,140,120,0.7)" textAnchor="middle">
                  {s.semana}
                </text>
                {s.n > 0 ? (
                  <text x={x + barW * 0.35} y={pad.t + ch - altura - 2} fontSize="8" fill={cor} textAnchor="middle">
                    {s.n}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}

function NovoTreinoSheet({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [data, setData] = useState(isoDate())
  const [tipo, setTipo] = useState('caminhada')
  const [tipoCustom, setTipoCustom] = useState('')
  const [duracao, setDuracao] = useState('')
  const [intensidade, setIntensidade] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [notas, setNotas] = useState('')

  const guardar = () => {
    const tipoFinal = tipo === 'outro' && tipoCustom.trim() ? tipoCustom.trim() : tipo
    addTreino({
      date: data,
      tipo: tipoFinal,
      duracaoMin: duracao ? Number(duracao) : null,
      intensidade,
      notas: notas.trim(),
      fonte: 'manual'
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="card-feature w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <span className="label-cap">novo treino</span>
          <button onClick={onClose} aria-label="fechar" className="text-faint active:scale-90">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-2">
          <span className="label-cap text-[10px]">tipo</span>
          <div className="flex flex-wrap gap-1.5">
            {TIPOS_RAPIDOS.map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-[12px] transition-elegant active:scale-95',
                  tipo === t ? 'bg-tinta text-creme dark:bg-ouro dark:text-tinta' : 'bg-[var(--surface-soft)] text-soft'
                )}
              >{t}</button>
            ))}
          </div>
          {tipo === 'outro' ? (
            <input
              type="text"
              value={tipoCustom}
              onChange={e => setTipoCustom(e.target.value)}
              placeholder="ex: dança, calistenia, escalada..."
              className="w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[14px] focus:border-ouro focus:outline-none"
            />
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="label-cap text-[10px]">data</span>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="label-cap text-[10px]">duração · min</span>
            <input
              type="number"
              inputMode="numeric"
              value={duracao}
              onChange={e => setDuracao(e.target.value)}
              placeholder="ex: 30"
              className="w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[14px] tnum focus:border-ouro focus:outline-none"
            />
          </label>
        </div>

        <div className="space-y-2">
          <span className="label-cap text-[10px]">como sentiste · 1 muito leve · 5 máximo</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setIntensidade(intensidade === n ? null : n as 1 | 2 | 3 | 4 | 5)}
                className={cn(
                  'flex-1 rounded-md py-2 text-[13px] tnum transition-elegant active:scale-95',
                  intensidade === n ? 'bg-ouro text-tinta' : 'bg-[var(--surface-soft)] text-soft'
                )}
              >{n}</button>
            ))}
          </div>
        </div>

        <label className="space-y-1 block">
          <span className="label-cap text-[10px]">notas · opcional</span>
          <textarea
            rows={2}
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="ex: praia · sozinha · ouvi música"
            className="w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] resize-none focus:border-ouro focus:outline-none"
          />
        </label>

        <button onClick={guardar} className="btn-primary w-full">guardar</button>
      </div>
    </div>
  )
}
