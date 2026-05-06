'use client'

import { useEffect, useMemo, useState } from 'react'
import { Wine } from 'lucide-react'
import { addAlcoolRegisto, getAlcoolRegistos, type AlcoolRegisto } from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import { cn } from '@/lib/utils'

const EMOCOES_BASE = ['cansaço', 'stress', 'aborrecimento', 'tristeza', 'celebração', 'social', 'raiva', 'ansiedade'] as const

export default function AlcoolPage() {
  const [registos, setRegistos] = useState<AlcoolRegisto[]>([])
  const [emocao, setEmocao] = useState<string>('')
  const [gatilho, setGatilho] = useState('')
  const [unidades, setUnidades] = useState<number>(0)
  const [decidiu, setDecidiu] = useState<boolean | null>(null)
  const [opcoes, setOpcoes] = useState<string[]>(EMOCOES_BASE.slice())

  useEffect(() => {
    setRegistos(getAlcoolRegistos())
    const p = getProfile()
    const merged = Array.from(new Set([...EMOCOES_BASE, ...p.gatilhosAlcool]))
    setOpcoes(merged)
    const refresh = () => setRegistos(getAlcoolRegistos())
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const padroes = useMemo(() => {
    if (registos.length < 5) return null
    const recentes = registos.slice(0, 30)
    const cont: Record<string, number> = {}
    recentes.forEach(r => {
      if (r.emocao) cont[r.emocao] = (cont[r.emocao] ?? 0) + 1
    })
    return Object.entries(cont).sort(([, a], [, b]) => b - a).slice(0, 3)
  }, [registos])

  const submit = (decisao: boolean) => {
    if (!emocao) return
    addAlcoolRegisto({
      emocao,
      gatilho: gatilho.trim(),
      unidades: decisao ? unidades : 0,
      decidiuBeber: decisao
    })
    setEmocao('')
    setGatilho('')
    setUnidades(0)
    setDecidiu(null)
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">caderno antes do copo</p>
        <h1 className="font-serif text-[36px] font-light leading-[1.1] tracking-editorial sm:text-[44px]">
          primeiro escreves.<br />
          <span className="text-faint">depois decides.</span>
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      <section className="card-feature space-y-5">
        <div>
          <span className="label-cap mb-3 block">o que estás a sentir</span>
          <div className="flex flex-wrap gap-1.5">
            {opcoes.map(e => (
              <button
                key={e}
                onClick={() => setEmocao(e)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-[13px] transition-elegant active:scale-95',
                  emocao === e
                    ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta'
                    : 'shadow-hair hover:shadow-hair-strong'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label-cap mb-2 block">gatilho · uma frase</span>
          <input
            value={gatilho}
            onChange={e => setGatilho(e.target.value)}
            placeholder="o que aconteceu antes deste impulso"
            className="input-base text-[14px]"
            maxLength={140}
          />
        </div>

        {emocao || gatilho ? (
          <div className="space-y-3 border-t border-[var(--hair)] pt-4 animate-slide-up">
            <p className="text-soft text-center text-[13px] italic">respira três vezes.</p>
            <div className="flex gap-2">
              <button onClick={() => submit(false)} className="btn-primary flex-1">
                não bebi
              </button>
              <button
                onClick={() => setDecidiu(true)}
                className={cn('btn-outline flex-1', decidiu && 'shadow-[inset_0_0_0_1px_var(--ouro)]')}
              >
                bebi
              </button>
            </div>
            {decidiu ? (
              <div className="space-y-2 rounded-lg bg-terracota/5 p-3">
                <span className="label-cap">unidades</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setUnidades(n)}
                      className={cn(
                        'flex-1 rounded-md py-2 font-serif text-[15px] tnum transition-elegant',
                        unidades === n ? 'bg-terracota text-creme' : 'shadow-hair text-faint hover:text-soft'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button onClick={() => submit(true)} disabled={unidades === 0} className="btn-primary mt-2 w-full">
                  registar
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {padroes ? (
        <section className="card">
          <span className="label-cap">Padrões · últimos 30</span>
          <ul className="mt-3 space-y-1.5">
            {padroes.map(([emo, n]) => (
              <li key={emo} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] capitalize">{emo}</span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="hairline flex-1" />
                  <span className="font-serif text-[15px] tnum text-ouro">{n}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <span className="label-cap px-1">Histórico</span>
        {registos.length === 0 ? (
          <div className="card text-center text-soft text-[13px]">sem registos.</div>
        ) : (
          <ul className="space-y-2">
            {registos.slice(0, 30).map(r => {
              const data = new Date(r.timestamp)
              const dia = data.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
              const hora = data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
              return (
                <li
                  key={r.id}
                  className={cn('card flex items-start gap-3', r.decidiuBeber ? 'shadow-[inset_0_0_0_1px_rgba(155,93,62,0.3)]' : 'shadow-[inset_0_0_0_1px_rgba(107,116,69,0.3)]')}
                >
                  <Wine size={16} strokeWidth={1.4} className={r.decidiuBeber ? 'mt-0.5 text-terracota' : 'mt-0.5 text-oliva'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13.5px] capitalize">{r.emocao || '—'}</span>
                      <span className="text-faint text-[11px] tnum">{dia} · {hora}</span>
                    </div>
                    {r.gatilho ? <p className="text-soft mt-1 text-[12px]">{r.gatilho}</p> : null}
                    <p className="mt-1.5 text-[12px]">
                      {r.decidiuBeber
                        ? <span className="text-terracota tnum">{r.unidades}u</span>
                        : <span className="text-oliva">não bebi ✓</span>
                      }
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
