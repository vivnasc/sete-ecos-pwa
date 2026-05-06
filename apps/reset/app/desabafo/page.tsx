'use client'

import { useEffect, useState } from 'react'
import { addDesabafo, getDesabafos, type DesabafoEntry } from '@/lib/storage'
import BackButton from '@/components/BackButton'
import { cn } from '@/lib/utils'

const EMOCOES = ['leve', 'cansada', 'irritada', 'triste', 'ansiosa', 'orgulhosa', 'em paz', 'confusa'] as const

export default function DesabafoPage() {
  const [entries, setEntries] = useState<DesabafoEntry[]>([])
  const [texto, setTexto] = useState('')
  const [emocao, setEmocao] = useState<string>('')

  useEffect(() => {
    setEntries(getDesabafos())
    const refresh = () => setEntries(getDesabafos())
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  const submit = () => {
    if (!texto.trim()) return
    addDesabafo({ texto: texto.trim(), emocao })
    setTexto('')
    setEmocao('')
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">desabafo</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">só para ti</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">não há respostas. é diário, não chat.</p>
      </header>

      <section className="card-feature space-y-4">
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={7}
          placeholder="o que está aí, agora..."
          className="input-base resize-none border-0 bg-transparent !p-0 text-[16px] leading-relaxed shadow-none focus:shadow-none"
        />
        <div>
          <span className="label-cap mb-2 block">tag · opcional</span>
          <div className="flex flex-wrap gap-1.5">
            {EMOCOES.map(e => (
              <button
                key={e}
                onClick={() => setEmocao(emocao === e ? '' : e)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] transition-elegant active:scale-95',
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
        <button onClick={submit} disabled={!texto.trim()} className="btn-primary w-full">
          guardar
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <span className="label-cap">Histórico</span>
          <span className="label-soft tnum">{entries.length}</span>
        </div>
        {entries.length === 0 ? (
          <div className="card text-center text-soft text-[13px]">
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
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className="text-faint text-[11px] tnum">{dia} · {hora}</span>
                    {e.emocao ? <span className="text-terracota text-[11px] uppercase tracking-cap">{e.emocao}</span> : null}
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.55] text-soft">{e.texto}</p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
