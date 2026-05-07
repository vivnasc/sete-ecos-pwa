'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { getDia, saveDia } from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import { isoDate } from '@/lib/dates'

const SINTOMAS = [
  { id: 'afrontamentos', label: 'afrontamentos' },
  { id: 'suores_nocturnos', label: 'suores nocturnos' },
  { id: 'brain_fog', label: 'brain fog' },
  { id: 'irritabilidade', label: 'irritabilidade' },
  { id: 'ansiedade', label: 'ansiedade' },
  { id: 'fadiga', label: 'fadiga' },
  { id: 'dores_articulares', label: 'dores articulares' },
  { id: 'libido_baixa', label: 'libido baixa' },
  { id: 'palpitacoes', label: 'palpitações' }
]

// Sintomas peri/menopausa · só F · multi-select
export default function PeriSintomasCard() {
  const [sintomas, setSintomas] = useState<string[]>([])
  const [sexo, setSexo] = useState<'F' | 'M' | 'O'>('F')
  const [aberto, setAberto] = useState(false)

  const carregar = () => {
    const d = getDia(isoDate())
    setSintomas(d.sintomasPeri)
  }

  useEffect(() => {
    setSexo(getProfile().sexo)
    carregar()
    const handler = () => carregar()
    const onProfile = () => setSexo(getProfile().sexo)
    window.addEventListener('fenixfit:storage', handler)
    window.addEventListener('fenixfit:profile', onProfile)
    return () => {
      window.removeEventListener('fenixfit:storage', handler)
      window.removeEventListener('fenixfit:profile', onProfile)
    }
  }, [])

  if (sexo === 'M') return null

  const toggle = (id: string) => {
    const dia = getDia(isoDate())
    const tem = dia.sintomasPeri.includes(id)
    dia.sintomasPeri = tem ? dia.sintomasPeri.filter(s => s !== id) : [...dia.sintomasPeri, id]
    saveDia(dia)
    setSintomas(dia.sintomasPeri)
  }

  return (
    <section className="card-solid space-y-3">
      <button
        onClick={() => setAberto(a => !a)}
        className="flex w-full items-baseline justify-between transition-elegant active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <Flame size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">sintomas · hoje</span>
        </div>
        <span className="text-faint text-[11px] tnum">
          {sintomas.length === 0 ? 'nenhum' : sintomas.length === 1 ? '1' : `${sintomas.length}`}
        </span>
      </button>

      {aberto ? (
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {SINTOMAS.map(s => {
              const activo = sintomas.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`rounded-full px-3 py-1.5 text-[11.5px] transition-elegant active:scale-95 ${
                    activo
                      ? 'bg-terracota/15 text-terracota'
                      : 'bg-[var(--surface-soft)] text-soft'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          <p className="text-faint text-[10px] leading-relaxed">
            marca o que sentiste · ajuda a coach a ver padrões com fase do ciclo, sono, álcool.
          </p>
        </div>
      ) : null}
    </section>
  )
}
