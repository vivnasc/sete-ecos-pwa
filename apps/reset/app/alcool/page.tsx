'use client'

import { useEffect, useMemo, useState } from 'react'
import { Wine } from 'lucide-react'
import { addAlcoolRegisto, getAlcoolRegistos, type AlcoolRegisto } from '@/lib/storage'
import { cn } from '@/lib/utils'

const EMOCOES = ['cansaço', 'stress', 'aborrecimento', 'tristeza', 'celebração', 'social', 'raiva', 'ansiedade'] as const

export default function AlcoolPage() {
  const [registos, setRegistos] = useState<AlcoolRegisto[]>([])
  const [emocao, setEmocao] = useState<string>('')
  const [gatilho, setGatilho] = useState('')
  const [unidades, setUnidades] = useState<number>(0)
  const [decidiu, setDecidiu] = useState<boolean | null>(null)

  useEffect(() => {
    setRegistos(getAlcoolRegistos())
    const refresh = () => setRegistos(getAlcoolRegistos())
    window.addEventListener('reset:storage', refresh)
    return () => window.removeEventListener('reset:storage', refresh)
  }, [])

  const padroes = useMemo(() => {
    if (registos.length < 5) return null
    const recentes = registos.slice(0, 30)
    const cont: Record<string, number> = {}
    recentes.forEach(r => {
      if (r.emocao) cont[r.emocao] = (cont[r.emocao] ?? 0) + 1
    })
    const top = Object.entries(cont)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    return top
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
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Caderno antes do copo</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">primeiro escreves. depois decides.</h1>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      <section className="card-solid space-y-4">
        <div>
          <span className="label-cap mb-2 block">o que estás a sentir agora</span>
          <div className="flex flex-wrap gap-2">
            {EMOCOES.map(e => (
              <button
                key={e}
                onClick={() => setEmocao(e)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition active:scale-95',
                  emocao === e ? 'bg-castanho text-creme' : 'bg-creme-escuro/60 text-castanho/70 hover:bg-creme-escuro'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label-cap mb-1.5 block">gatilho · uma frase</span>
          <input
            value={gatilho}
            onChange={e => setGatilho(e.target.value)}
            placeholder="o que aconteceu antes deste impulso"
            className="input-base"
            maxLength={140}
          />
        </div>

        {emocao || gatilho ? (
          <div className="space-y-3 border-t border-creme-escuro pt-4">
            <p className="text-sm text-cinza">agora respiras três vezes. depois decides.</p>
            <div className="flex gap-2">
              <button onClick={() => submit(false)} className="btn-ouro flex-1">
                não bebi
              </button>
              <button
                onClick={() => setDecidiu(true)}
                className={cn('btn-ghost flex-1 ring-1 ring-terracota/40', decidiu && 'bg-terracota/10')}
              >
                bebi
              </button>
            </div>
            {decidiu ? (
              <div className="space-y-2 rounded-xl bg-terracota/5 p-3">
                <span className="label-cap">unidades</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setUnidades(n)}
                      className={cn(
                        'flex-1 rounded-lg py-2 font-serif text-base transition',
                        unidades === n ? 'bg-terracota text-creme' : 'bg-white/60 text-castanho/70'
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
          <span className="label-cap">Padrões nos últimos 30 registos</span>
          <ul className="mt-2 space-y-1 text-sm">
            {padroes.map(([emo, n]) => (
              <li key={emo} className="flex items-center justify-between">
                <span className="text-castanho/80">{emo}</span>
                <span className="font-serif text-cinza">{n}x</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-cinza">os teus dados, sem julgamento. o conhecimento é o caminho.</p>
        </section>
      ) : null}

      <section className="space-y-2">
        <span className="label-cap px-1">Histórico</span>
        {registos.length === 0 ? (
          <div className="card text-center text-sm text-cinza">
            sem registos ainda.
          </div>
        ) : (
          <ul className="space-y-2">
            {registos.slice(0, 30).map(r => {
              const data = new Date(r.timestamp)
              const dia = data.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
              const hora = data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
              return (
                <li
                  key={r.id}
                  className={cn(
                    'card flex items-start gap-3',
                    r.decidiuBeber ? 'ring-terracota/30' : 'ring-oliva/30 bg-oliva/5'
                  )}
                >
                  <Wine
                    size={18}
                    className={r.decidiuBeber ? 'text-terracota' : 'text-oliva'}
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-castanho">{r.emocao || '—'}</span>
                      <span className="text-xs text-cinza">
                        {dia} · {hora}
                      </span>
                    </div>
                    {r.gatilho ? <p className="text-xs text-cinza">{r.gatilho}</p> : null}
                    <p className="mt-1 text-xs">
                      {r.decidiuBeber ? (
                        <span className="text-terracota">{r.unidades} unidade{r.unidades > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-oliva">não bebi</span>
                      )}
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
