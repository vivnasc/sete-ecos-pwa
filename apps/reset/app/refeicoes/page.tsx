'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowLeft, ArrowRight, MessageCircle, Loader2 } from 'lucide-react'
import BackButton from '@/components/BackButton'
import {
  getRefeicoes,
  getRefeicoesDoDia,
  addRefeicao,
  removeRefeicao,
  macrosDoDia,
  type Refeicao,
  type RefeicaoTipo
} from '@/lib/storage'
import { isoDate } from '@/lib/dates'

const TIPOS: { id: RefeicaoTipo; label: string }[] = [
  { id: 'pa', label: 'pequeno-almoço' },
  { id: 'almoco', label: 'almoço' },
  { id: 'snack', label: 'snack' },
  { id: 'jantar', label: 'jantar' }
]

const TARGET = { calorias: 1500, proteina: 100, carbo: 25, gordura: 110 }

function deltaDate(date: string, dias: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + dias)
  return isoDate(d)
}

function dataLegivel(date: string): string {
  if (date === isoDate()) return 'hoje'
  const ontem = deltaDate(isoDate(), -1)
  if (date === ontem) return 'ontem'
  const d = new Date(date)
  return d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'short' })
}

export default function RefeicoesPage() {
  const [date, setDate] = useState(isoDate())
  const [lista, setLista] = useState<Refeicao[]>([])
  const [macros, setMacros] = useState({ proteina: 0, carbo: 0, gordura: 0, calorias: 0, refeicoes: 0 })
  const [adicionando, setAdicionando] = useState(false)
  const [novoTipo, setNovoTipo] = useState<RefeicaoTipo>('pa')
  const [descricao, setDescricao] = useState('')
  const [estimando, setEstimando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const refresh = () => {
    setLista(getRefeicoesDoDia(date))
    setMacros(macrosDoDia(date))
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('fenixfit:storage', handler)
    return () => window.removeEventListener('fenixfit:storage', handler)
  }, [date])

  const submit = async () => {
    const desc = descricao.trim()
    if (!desc) return
    setEstimando(true)
    setErro(null)
    let macros: { proteinaG: number | null; carboG: number | null; gorduraG: number | null; calorias: number | null } = {
      proteinaG: null, carboG: null, gorduraG: null, calorias: null
    }
    try {
      const r = await fetch('/api/estimar-macros', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ descricao: desc, tipo: novoTipo })
      })
      if (r.ok) {
        macros = await r.json()
      } else {
        setErro('macros não estimados · guardado sem.')
      }
    } catch {
      setErro('sem rede · guardado sem macros.')
    }
    const ts = date === isoDate()
      ? new Date().toISOString()
      : new Date(date + 'T12:00:00').toISOString()
    addRefeicao({
      tipo: novoTipo,
      descricao: desc,
      timestamp: ts,
      proteinaG: macros.proteinaG,
      carboG: macros.carboG,
      gorduraG: macros.gorduraG,
      calorias: macros.calorias,
      contexto: '',
      sentir: ''
    })
    setDescricao('')
    setEstimando(false)
    setAdicionando(false)
    refresh()
  }

  const apagar = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar esta refeição?')) return
    removeRefeicao(id)
    refresh()
  }

  const todas = getRefeicoes()
  const datasComRefeicoes = Array.from(new Set(todas.map(r => r.timestamp.slice(0, 10)))).sort().reverse()

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">refeições</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          o que comeste
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          podes dizer à coach · ela escreve por ti.
        </p>
      </header>

      {/* navegador de datas */}
      <section className="flex items-center justify-between">
        <button
          onClick={() => setDate(deltaDate(date, -1))}
          className="rounded-full p-2 transition-elegant hover:bg-[var(--surface-soft)] active:scale-95"
          aria-label="dia anterior"
        >
          <ArrowLeft size={16} strokeWidth={1.4} />
        </button>
        <div className="text-center">
          <p className="font-serif text-[20px] tracking-editorial">{dataLegivel(date)}</p>
          <p className="text-faint text-[11px] tnum">{date}</p>
        </div>
        <button
          onClick={() => setDate(deltaDate(date, 1))}
          disabled={date >= isoDate()}
          className="rounded-full p-2 transition-elegant hover:bg-[var(--surface-soft)] active:scale-95 disabled:opacity-30"
          aria-label="dia seguinte"
        >
          <ArrowRight size={16} strokeWidth={1.4} />
        </button>
      </section>

      {/* macros do dia */}
      <section className="card-feature space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="label-cap">macros · {dataLegivel(date)}</span>
          <span className="text-faint text-[11px] tnum">{macros.refeicoes}× refeições</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Macro label="kcal" valor={macros.calorias} alvo={TARGET.calorias} />
          <Macro label="P · g" valor={macros.proteina} alvo={TARGET.proteina} />
          <Macro label="C · g" valor={macros.carbo} alvo={TARGET.carbo} reverso />
          <Macro label="G · g" valor={macros.gordura} alvo={TARGET.gordura} />
        </div>
        <p className="text-faint text-[10.5px] leading-relaxed">
          alvo keto · 1500 kcal · 100g P · ≤25g C · 110g G. ajusta em definições.
        </p>
      </section>

      {/* lista refeições */}
      {lista.length > 0 ? (
        <section className="space-y-2">
          {lista.map(r => (
            <article key={r.id} className="card-solid space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2 min-w-0 flex-1">
                  <span className="label-cap shrink-0">{TIPOS.find(t => t.id === r.tipo)?.label ?? r.tipo}</span>
                  <span className="text-faint text-[11px] tnum">{r.timestamp.slice(11, 16)}</span>
                </div>
                <button
                  onClick={() => apagar(r.id)}
                  className="text-faint hover:text-terracota transition-elegant active:scale-95 shrink-0"
                  aria-label="apagar"
                >
                  <Trash2 size={14} strokeWidth={1.4} />
                </button>
              </div>
              <p className="font-serif text-[15px] leading-[1.45]">{r.descricao}</p>
              {r.proteinaG !== null || r.carboG !== null || r.gorduraG !== null || r.calorias !== null ? (
                <p className="text-faint text-[11px] tnum">
                  {r.proteinaG !== null ? `${Math.round(r.proteinaG)}g P · ` : ''}
                  {r.carboG !== null ? `${Math.round(r.carboG)}g C · ` : ''}
                  {r.gorduraG !== null ? `${Math.round(r.gorduraG)}g G` : ''}
                  {r.calorias !== null ? ` · ${r.calorias} kcal` : ''}
                </p>
              ) : null}
              {r.contexto ? <p className="text-soft text-[12px]">{r.contexto}</p> : null}
              {r.sentir ? <p className="text-soft text-[12px] italic">sentir: {r.sentir}</p> : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="card-solid text-center space-y-2 py-8">
          <p className="text-soft text-[13px]">sem refeições registadas {dataLegivel(date)}</p>
          <a href="/coach" className="inline-flex items-center gap-1.5 text-[12px] text-ouro hover:underline">
            <MessageCircle size={13} strokeWidth={1.4} />
            diz à coach
          </a>
        </section>
      )}

      {/* adicionar manual */}
      {adicionando ? (
        <section className="card-feature space-y-3">
          <div className="flex items-center justify-between">
            <span className="label-cap">nova refeição</span>
            <button
              onClick={() => setAdicionando(false)}
              className="text-faint text-[11px] hover:text-soft"
            >
              cancelar
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TIPOS.map(t => (
              <button
                key={t.id}
                onClick={() => setNovoTipo(t.id)}
                className={`rounded-md py-2 text-[11px] transition-elegant active:scale-95 ${
                  novoTipo === t.id
                    ? 'bg-ouro text-creme dark:text-tinta'
                    : 'bg-[var(--surface-soft)] text-soft'
                }`}
              >
                {t.label.split('-')[0]}
              </button>
            ))}
          </div>

          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="o que comeste · ex: 3 ovos mexidos com abacate"
            rows={2}
            className="w-full resize-none rounded-md border border-[var(--hair)] bg-transparent p-3 text-[13.5px] focus:border-ouro focus:outline-none"
          />

          <p className="text-faint text-[10.5px] leading-relaxed">
            os macros são estimados automaticamente. podes afinar pela coach.
          </p>

          {erro ? <p className="text-terracota text-[11px]">{erro}</p> : null}

          <button
            onClick={submit}
            disabled={!descricao.trim() || estimando}
            className="btn-primary w-full py-2.5 text-[12.5px] disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {estimando ? <><Loader2 size={13} className="animate-spin" /> a estimar…</> : 'registar'}
          </button>
        </section>
      ) : (
        <button
          onClick={() => setAdicionando(true)}
          className="card-solid flex w-full items-center justify-center gap-2 py-3 text-[12.5px] text-soft transition-elegant hover:bg-[var(--surface-soft)] active:scale-95"
        >
          <Plus size={14} strokeWidth={1.4} />
          adicionar manualmente
        </button>
      )}

      {/* histórico de dias com refeições */}
      {datasComRefeicoes.length > 1 ? (
        <section className="space-y-2 pt-2">
          <span className="label-cap px-1">histórico</span>
          <div className="flex flex-wrap gap-1.5">
            {datasComRefeicoes.slice(0, 14).map(d => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`rounded-full px-3 py-1 text-[10.5px] tnum transition-elegant active:scale-95 ${
                  d === date ? 'bg-ouro text-creme dark:text-tinta' : 'bg-[var(--surface-soft)] text-soft'
                }`}
              >
                {dataLegivel(d)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Macro({ label, valor, alvo, reverso }: { label: string; valor: number; alvo: number; reverso?: boolean }) {
  const pct = Math.round((valor / alvo) * 100)
  const acima = valor > alvo
  const cor = reverso
    ? acima ? 'text-terracota' : 'text-soft'
    : acima ? 'text-ouro' : valor >= alvo * 0.7 ? 'text-soft' : 'text-faint'
  return (
    <div className="text-center">
      <p className={`editorial-num text-[22px] tnum leading-none ${cor}`}>{Math.round(valor)}</p>
      <p className="text-faint text-[9.5px] uppercase tracking-cap mt-1">{label}</p>
      <p className="text-faint text-[9px] tnum">{pct}% / {alvo}</p>
    </div>
  )
}

