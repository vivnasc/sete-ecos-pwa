'use client'

import { useEffect, useState } from 'react'
import { Droplets, Pill, Check } from 'lucide-react'
import { getDia, saveDia, pesoUltimo } from '@/lib/storage'
import { isoDate } from '@/lib/dates'

// Meta de água ajustada ao peso · 35ml/kg, copo de 250ml
function calcularMetaAgua(): number {
  const peso = pesoUltimo()
  if (!peso) return 8
  const ml = peso * 35
  return Math.max(6, Math.round(ml / 250))
}

const SUPLEMENTOS_DEFAULT = [
  { id: 'magnesio', label: 'magnésio' },
  { id: 'vit_d', label: 'vit D' },
  { id: 'omega3', label: 'ómega-3' },
  { id: 'electrolitos', label: 'eletrólitos' }
]

export default function WellnessQuickPanel() {
  const [agua, setAgua] = useState(0)
  const [suplementos, setSuplementos] = useState<string[]>([])
  const [transito, setTransito] = useState<'sim' | 'nao' | null>(null)
  const [metaAgua, setMetaAgua] = useState(8)

  const carregar = () => {
    const d = getDia(isoDate())
    setAgua(d.aguaCopos)
    setSuplementos(d.suplementos)
    setTransito(d.transitoIntestinal)
    setMetaAgua(calcularMetaAgua())
  }

  useEffect(() => {
    carregar()
    const handler = () => carregar()
    window.addEventListener('fenixfit:storage', handler)
    return () => window.removeEventListener('fenixfit:storage', handler)
  }, [])

  const ajustarAgua = (delta: number) => {
    const novo = Math.max(0, Math.min(20, agua + delta))
    setAgua(novo)
    const dia = getDia(isoDate())
    dia.aguaCopos = novo
    saveDia(dia)
  }

  const toggleSuplemento = (id: string) => {
    const dia = getDia(isoDate())
    const tem = dia.suplementos.includes(id)
    dia.suplementos = tem ? dia.suplementos.filter(s => s !== id) : [...dia.suplementos, id]
    saveDia(dia)
    setSuplementos(dia.suplementos)
  }

  const setTransitoVal = (v: 'sim' | 'nao' | null) => {
    setTransito(v)
    const dia = getDia(isoDate())
    dia.transitoIntestinal = v
    saveDia(dia)
  }

  return (
    <section className="card-solid space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">corpo · hoje</span>
        <span className="text-faint text-[11px] tnum">{agua}/{metaAgua} copos</span>
      </div>

      {/* Água · contador */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Droplets size={14} strokeWidth={1.4} className="text-ouro" />
            <span className="font-serif text-[14px] text-soft">água</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => ajustarAgua(-1)}
              disabled={agua <= 0}
              aria-label="menos um copo"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-soft transition-elegant active:scale-95 disabled:opacity-30"
            >
              −
            </button>
            <span className="editorial-num text-[20px] tnum w-10 text-center">{agua}</span>
            <button
              onClick={() => ajustarAgua(1)}
              aria-label="mais um copo"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ouro text-creme transition-elegant active:scale-95 dark:text-tinta"
            >
              +
            </button>
          </div>
        </div>
        {/* Barra visual */}
        <div className="flex gap-0.5">
          {Array.from({ length: metaAgua }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-elegant ${
                i < agua ? 'bg-ouro' : 'bg-[var(--hair)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Suplementos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Pill size={14} strokeWidth={1.4} className="text-ouro" />
          <span className="font-serif text-[14px] text-soft">suplementos</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUPLEMENTOS_DEFAULT.map(s => {
            const activo = suplementos.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleSuplemento(s.id)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] transition-elegant active:scale-95 ${
                  activo
                    ? 'bg-ouro text-creme dark:text-tinta'
                    : 'bg-[var(--surface-soft)] text-soft'
                }`}
              >
                {activo ? <Check size={11} strokeWidth={1.8} /> : null}
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Trânsito intestinal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-serif text-[14px] text-soft">trânsito intestinal</span>
          <span className="text-faint text-[10px] tracking-cap uppercase">importante em keto</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setTransitoVal(transito === 'sim' ? null : 'sim')}
            className={`flex-1 rounded-md py-2 text-[12px] transition-elegant active:scale-95 ${
              transito === 'sim'
                ? 'bg-oliva/20 text-oliva'
                : 'bg-[var(--surface-soft)] text-soft'
            }`}
          >
            sim
          </button>
          <button
            onClick={() => setTransitoVal(transito === 'nao' ? null : 'nao')}
            className={`flex-1 rounded-md py-2 text-[12px] transition-elegant active:scale-95 ${
              transito === 'nao'
                ? 'bg-terracota/15 text-terracota'
                : 'bg-[var(--surface-soft)] text-soft'
            }`}
          >
            não
          </button>
        </div>
      </div>
    </section>
  )
}
