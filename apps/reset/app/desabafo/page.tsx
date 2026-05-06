'use client'

import { useEffect, useState } from 'react'
import { addDesabafo, getDesabafos, type DesabafoEntry } from '@/lib/storage'
import { cn } from '@/lib/utils'

const EMOCOES = ['leve', 'cansada', 'irritada', 'triste', 'ansiosa', 'orgulhosa', 'em paz', 'confusa'] as const

export default function DesabafoPage() {
  const [entries, setEntries] = useState<DesabafoEntry[]>([])
  const [texto, setTexto] = useState('')
  const [emocao, setEmocao] = useState<string>('')

  useEffect(() => {
    setEntries(getDesabafos())
    const refresh = () => setEntries(getDesabafos())
    window.addEventListener('reset:storage', refresh)
    return () => window.removeEventListener('reset:storage', refresh)
  }, [])

  const submit = () => {
    if (!texto.trim()) return
    addDesabafo({ texto: texto.trim(), emocao })
    setTexto('')
    setEmocao('')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Desabafo</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">só para ti</h1>
        <p className="mx-auto max-w-xs text-xs text-cinza">não há respostas. é um diário, não um chat.</p>
        <div className="mx-auto divisor-ouro" aria-hidden />
      </header>

      <section className="card-solid space-y-3">
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={6}
          placeholder="o que está aí, agora..."
          className="input-base resize-none text-base leading-relaxed"
        />
        <div>
          <span className="label-cap mb-1.5 block">tag de emoção · opcional</span>
          <div className="flex flex-wrap gap-2">
            {EMOCOES.map(e => (
              <button
                key={e}
                onClick={() => setEmocao(emocao === e ? '' : e)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs transition active:scale-95',
                  emocao === e ? 'bg-castanho text-creme' : 'bg-creme-escuro/60 text-castanho/70'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={!texto.trim()} className="btn-primary w-full">
          guardar
        </button>
      </section>

      <section className="space-y-3">
        <span className="label-cap px-1">Histórico · {entries.length}</span>
        {entries.length === 0 ? (
          <div className="card text-center text-sm text-cinza">
            quando escreveres a primeira, fica aqui.
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map(e => {
              const data = new Date(e.timestamp)
              const dia = data.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
              const hora = data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
              return (
                <li key={e.id} className="card">
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs text-cinza">
                    <span>
                      {dia} · {hora}
                    </span>
                    {e.emocao ? <span className="text-terracota">{e.emocao}</span> : null}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-castanho/90">{e.texto}</p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
