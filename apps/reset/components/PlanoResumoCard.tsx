'use client'

import { useEffect, useState } from 'react'
import { Target, ArrowUpRight, Plus } from 'lucide-react'
import { getObjectivos, type Objectivo } from '@/lib/profile'
import { calcularProgresso } from '@/lib/objectivos'

export default function PlanoResumoCard() {
  const [objectivos, setObjectivos] = useState<Objectivo[]>([])

  useEffect(() => {
    const refresh = () => setObjectivos(getObjectivos())
    refresh()
    window.addEventListener('fenixfit:profile', refresh)
    window.addEventListener('fenixfit:storage', refresh)
    return () => {
      window.removeEventListener('fenixfit:profile', refresh)
      window.removeEventListener('fenixfit:storage', refresh)
    }
  }, [])

  if (objectivos.length === 0) {
    return (
      <a href="/plano" className="card-solid block transition-elegant hover:bg-[var(--surface)]">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} strokeWidth={1.4} className="text-ouro" />
            <span className="label-cap">plano</span>
          </div>
          <Plus size={14} strokeWidth={1.4} className="text-faint" />
        </div>
        <p className="text-soft mt-3 text-[12.5px] leading-relaxed">
          ainda não tens objectivos. <span className="italic text-ouro">diz à coach o que queres</span> ou abre /plano.
        </p>
      </a>
    )
  }

  return (
    <a href="/plano" className="card-feature block transition-elegant hover:shadow-ink">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">plano · {objectivos.length} {objectivos.length === 1 ? 'objectivo' : 'objectivos'}</span>
        </div>
        <ArrowUpRight size={14} strokeWidth={1.3} className="text-faint" />
      </div>
      <div className="space-y-2.5">
        {objectivos.slice(0, 3).map(o => {
          const p = calcularProgresso(o)
          const corStatus =
            p?.status === 'no_caminho' ? 'text-oliva' :
            p?.status === 'a_frente' ? 'text-ouro' :
            p?.status === 'atrasada' ? 'text-terracota' : 'text-faint'
          return (
            <div key={o.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-serif text-[13.5px] tracking-editorial leading-tight truncate flex-1 italic">{o.texto}</p>
                {p && p.valorActual !== null ? (
                  <span className={`text-[11.5px] tnum shrink-0 ${corStatus}`}>
                    {p.valorActual.toFixed(1)}{p.unidade}
                  </span>
                ) : null}
              </div>
              {p && p.valorAlvoHoje !== null ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[var(--hair)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ouro transition-elegant"
                      style={{ width: `${Math.min(100, Math.max(0, p.pctTempo))}%` }}
                    />
                  </div>
                  <span className="text-faint text-[10px] tnum shrink-0">
                    dia {p.diasDecorridos}/{p.diasTotais}
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
        {objectivos.length > 3 ? (
          <p className="text-faint text-[10px] text-center pt-1">+{objectivos.length - 3} mais</p>
        ) : null}
      </div>
    </a>
  )
}
