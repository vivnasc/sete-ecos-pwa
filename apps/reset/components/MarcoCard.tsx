'use client'

import { useEffect, useState } from 'react'
import { diaDoPlano } from '@/lib/dates'

const MARCOS_KEY = 'fenixfit:marcos-vistos'
const MARCOS = [7, 14, 21, 30, 45, 60]

const TITULOS: Record<number, string> = {
  7: 'primeira semana',
  14: 'duas semanas',
  21: 'três semanas',
  30: 'metade do caminho',
  45: 'recta final',
  60: 'sessenta dias'
}

const SUBTITULOS: Record<number, string> = {
  7: 'o corpo começa a sentir.',
  14: 'já não é começo, é continuidade.',
  21: 'um hábito ganhou raiz.',
  30: 'metade. olha para trás · tu mudaste.',
  45: 'a fénix está perto.',
  60: 'o ciclo fecha-se. o que abre agora é teu.'
}

function getVistos(): number[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(MARCOS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function setVistos(arr: number[]): void {
  localStorage.setItem(MARCOS_KEY, JSON.stringify(arr))
}

// Mostra o marco se foi atingido nos últimos 2 dias e não foi descartado
export default function MarcoCard() {
  const [marco, setMarco] = useState<number | null>(null)
  const [a, setA] = useState(false)

  useEffect(() => {
    const dia = diaDoPlano()
    if (dia <= 0) return
    const vistos = getVistos()
    // Encontrar marco atingido nos últimos 2 dias e não visto
    const candidato = MARCOS.find(m => dia >= m && dia < m + 3 && !vistos.includes(m))
    if (candidato !== undefined) {
      setMarco(candidato)
      // animar entrada
      setTimeout(() => setA(true), 50)
    }
  }, [])

  if (marco === null) return null

  const fechar = () => {
    setA(false)
    setTimeout(() => {
      const vistos = getVistos()
      vistos.push(marco)
      setVistos(vistos)
      setMarco(null)
    }, 300)
  }

  const titulo = TITULOS[marco] ?? `dia ${marco}`
  const subtitulo = SUBTITULOS[marco] ?? ''

  return (
    <section
      className={`card-feature relative overflow-hidden transition-all duration-500 ${
        a ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-elev) 100%)',
        boxShadow: '0 8px 32px rgba(184, 146, 74, 0.18), 0 1px 4px rgba(31, 24, 20, 0.08)'
      }}
    >
      {/* Selo logo-03 */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <img
            src="/logos/logo-03-seal.svg"
            alt=""
            aria-hidden
            className="h-16 w-16"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(184, 146, 74, 0.3))' }}
          />
          {/* anel pulsante */}
          <span className="absolute inset-0 rounded-full border border-ouro/40 animate-ping" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="label-cap">marco</p>
          <p className="font-serif text-[26px] leading-tight tracking-editorial italic mt-1">
            {titulo}
          </p>
          <p className="text-soft text-[13px] mt-1.5 leading-relaxed">
            {subtitulo}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-serif text-[44px] tnum text-ouro leading-none editorial-num">
          {marco}
          <span className="text-faint text-[14px] ml-1.5 italic">/ 60</span>
        </span>
        <button
          onClick={fechar}
          className="btn-ghost text-[11px]"
        >
          arquivar
        </button>
      </div>
    </section>
  )
}
