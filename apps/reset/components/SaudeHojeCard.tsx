'use client'

// Mostra passos / sono / RHR do dia · usa dados importados de Apple Health
// ou registados manualmente.

import { useEffect, useState } from 'react'
import { Activity, Heart, Footprints, Moon } from 'lucide-react'
import { getDia, getTodosDias, type DiaLog } from '@/lib/storage'

export default function SaudeHojeCard() {
  const [hoje, setHoje] = useState<DiaLog | null>(null)
  const [trend, setTrend] = useState<{ passos7: number | null; rhr7: number | null; sono7: number | null }>({ passos7: null, rhr7: null, sono7: null })

  const refresh = () => {
    setHoje(getDia())
    const dias = getTodosDias().slice(-7)
    const med = (key: 'steps' | 'rhr' | 'sonoHoras') => {
      const vals = dias.map(d => d[key]).filter((v): v is number => v !== null && v !== undefined)
      if (vals.length === 0) return null
      return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
    }
    setTrend({ passos7: med('steps'), rhr7: med('rhr'), sono7: med('sonoHoras') })
  }

  useEffect(() => {
    refresh()
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
  }, [])

  if (!hoje) return null

  const passos = hoje.steps
  const rhr = hoje.rhr
  const sono = hoje.sonoHoras

  // Só mostra se há pelo menos 1 valor
  if (passos === null && rhr === null && sono === null && trend.passos7 === null && trend.rhr7 === null && trend.sono7 === null) {
    return null
  }

  return (
    <section className="card-solid space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <Activity size={13} strokeWidth={1.5} className="text-ouro" />
          <span className="label-cap">saúde · hoje</span>
        </div>
        <a href="/importar-saude" className="text-faint text-[10.5px] hover:text-ouro">importar →</a>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metrica
          icone={<Footprints size={12} strokeWidth={1.4} />}
          valor={passos !== null ? passos.toLocaleString('pt-PT') : '—'}
          unidade="passos"
          media7d={trend.passos7 !== null ? trend.passos7.toLocaleString('pt-PT', { maximumFractionDigits: 0 }) : null}
        />
        <Metrica
          icone={<Moon size={12} strokeWidth={1.4} />}
          valor={sono !== null ? `${sono}` : '—'}
          unidade="h sono"
          media7d={trend.sono7 !== null ? `${trend.sono7}` : null}
        />
        <Metrica
          icone={<Heart size={12} strokeWidth={1.4} />}
          valor={rhr !== null ? `${rhr}` : '—'}
          unidade="bpm rep."
          media7d={trend.rhr7 !== null ? `${Math.round(trend.rhr7)}` : null}
        />
      </div>
    </section>
  )
}

function Metrica({ icone, valor, unidade, media7d }: { icone: React.ReactNode; valor: string; unidade: string; media7d: string | null }) {
  return (
    <div className="text-center space-y-1">
      <span className="text-ouro inline-flex">{icone}</span>
      <p className="font-serif text-[20px] tnum leading-none">{valor}</p>
      <p className="text-faint text-[9.5px] uppercase tracking-cap">{unidade}</p>
      {media7d ? <p className="text-faint text-[9.5px] tnum">7d: {media7d}</p> : null}
    </div>
  )
}
