'use client'

import { useEffect, useState } from 'react'
import { Moon, Clock } from 'lucide-react'
import { getDia, saveDia } from '@/lib/storage'
import { isoDate } from '@/lib/dates'

// Sono em detalhe · hora deitar (ontem), horas dormidas, qualidade, acordou
export default function SonoDetailCard() {
  const [horaDeitar, setHoraDeitar] = useState<string>('')
  const [horas, setHoras] = useState<string>('')
  const [qualidade, setQualidade] = useState<number | null>(null)
  const [acordou, setAcordou] = useState<string>('')
  const [aberto, setAberto] = useState(false)

  const carregar = () => {
    const d = getDia(isoDate())
    setHoraDeitar(d.horaDeitar ?? '')
    setHoras(d.sonoHoras !== null ? String(d.sonoHoras) : '')
    setQualidade(d.qualidadeSono)
    setAcordou(d.acordouVezes !== null ? String(d.acordouVezes) : '')
  }

  useEffect(() => {
    carregar()
    const handler = () => carregar()
    window.addEventListener('fenixfit:storage', handler)
    return () => window.removeEventListener('fenixfit:storage', handler)
  }, [])

  const guardar = (campo: 'horas' | 'deitar' | 'qualidade' | 'acordou', valor: number | string | null) => {
    const dia = getDia(isoDate())
    if (campo === 'horas') dia.sonoHoras = typeof valor === 'string' ? (valor ? Number(valor) : null) : valor as number | null
    if (campo === 'deitar') dia.horaDeitar = (valor as string) || null
    if (campo === 'qualidade') dia.qualidadeSono = valor as number | null
    if (campo === 'acordou') dia.acordouVezes = typeof valor === 'string' ? (valor ? Math.max(0, Math.round(Number(valor))) : null) : valor as number | null
    saveDia(dia)
    carregar()
  }

  const resumo = () => {
    const partes: string[] = []
    if (horas) partes.push(`${horas}h`)
    if (qualidade) partes.push(`qualidade ${qualidade}/5`)
    if (acordou && Number(acordou) > 0) partes.push(`acordou ${acordou}×`)
    return partes.length > 0 ? partes.join(' · ') : 'sem registo'
  }

  return (
    <section className="card-solid space-y-3">
      <button
        onClick={() => setAberto(a => !a)}
        className="flex w-full items-baseline justify-between transition-elegant active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <Moon size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="label-cap">sono · noite passada</span>
        </div>
        <span className="text-faint text-[11px] tnum text-right">{resumo()}</span>
      </button>

      {aberto ? (
        <div className="space-y-3 pt-1">
          {/* Hora deitar + horas dormidas */}
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-faint text-[10px] tracking-cap uppercase">deitar</span>
              <input
                type="time"
                value={horaDeitar}
                onChange={e => setHoraDeitar(e.target.value)}
                onBlur={() => guardar('deitar', horaDeitar)}
                className="mt-1 w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-faint text-[10px] tracking-cap uppercase">horas</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                max="14"
                value={horas}
                onChange={e => setHoras(e.target.value)}
                onBlur={() => guardar('horas', horas)}
                placeholder="6.5"
                className="mt-1 w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
              />
            </label>
          </div>

          {/* Qualidade · 1-5 */}
          <div>
            <p className="text-faint text-[10px] tracking-cap uppercase mb-1.5">qualidade</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => guardar('qualidade', qualidade === n ? null : n)}
                  className={`flex-1 rounded-md py-2 text-[12px] tnum transition-elegant active:scale-95 ${
                    qualidade === n
                      ? 'bg-ouro text-creme dark:text-tinta'
                      : 'bg-[var(--surface-soft)] text-soft'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Acordou × */}
          <label className="block">
            <span className="text-faint text-[10px] tracking-cap uppercase">acordou × vezes (cris, sede, etc.)</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              value={acordou}
              onChange={e => setAcordou(e.target.value)}
              onBlur={() => guardar('acordou', acordou)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-[var(--hair)] bg-transparent p-2 text-[13px] tnum focus:border-ouro focus:outline-none"
            />
          </label>
        </div>
      ) : null}
    </section>
  )
}
