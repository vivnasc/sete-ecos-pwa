/**
 * Heatmap60 — visualização dos últimos 60 dias da jornada da cliente,
 * estilo GitHub contributions. SVG nativo, sem libs.
 *
 * Cada quadrado = 1 dia. Cor mais forte = mais aderência (mais
 * registos: refeições + check-in + água + treino + sono).
 *
 * Espera receber:
 *   dataInicio: string ISO (data_inicio do cliente)
 *   registos: array { data: 'YYYY-MM-DD', intensidade: 0..4 }
 */

import { useMemo } from 'react'

const COLS = 10  // 10 colunas × 6 linhas = 60 dias
const ROWS = 6
const CELL = 14
const GAP = 4

function intensityColor(level) {
  // 0 = sem registo, 1 = mínimo, 4 = pleno
  switch (level) {
    case 0: return 'var(--fnx-hair)'
    case 1: return 'color-mix(in srgb, var(--fnx-ouro) 25%, var(--fnx-bg))'
    case 2: return 'color-mix(in srgb, var(--fnx-ouro) 50%, var(--fnx-bg))'
    case 3: return 'color-mix(in srgb, var(--fnx-ouro) 75%, var(--fnx-bg))'
    case 4: return 'var(--fnx-ouro)'
    default: return 'var(--fnx-hair)'
  }
}

export default function Heatmap60({ dataInicio, registos = [], titulo = 'jornada · 60 dias' }) {
  const grid = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 60 * 86400000)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Mapa data → intensidade
    const mapa = new Map()
    registos.forEach(r => {
      if (r?.data) mapa.set(r.data, Math.min(4, Math.max(0, r.intensidade ?? 0)))
    })

    const dias = []
    for (let i = 0; i < 60; i++) {
      const d = new Date(inicio)
      d.setDate(d.getDate() + i)
      d.setHours(0, 0, 0, 0)
      const futuro = d > hoje
      const iso = d.toISOString().split('T')[0]
      const intens = futuro ? -1 : (mapa.get(iso) ?? 0)
      dias.push({
        iso,
        dia: i + 1,
        intensidade: intens,
        futuro,
        data: d
      })
    }
    return dias
  }, [dataInicio, registos])

  const totalCumpridos = grid.filter(d => !d.futuro && d.intensidade > 0).length
  const totalPossiveis = grid.filter(d => !d.futuro).length
  const percentagem = totalPossiveis > 0 ? Math.round((totalCumpridos / totalPossiveis) * 100) : 0

  const width = COLS * (CELL + GAP) - GAP
  const height = ROWS * (CELL + GAP) - GAP

  return (
    <section className="fnx-card-solid" aria-label={titulo}>
      <div className="flex items-baseline justify-between mb-3">
        <span className="fnx-label-cap">{titulo}</span>
        <span className="fnx-label-soft fnx-tnum">
          <span className="fnx-text-ink">{totalCumpridos}</span> / {totalPossiveis} dias
        </span>
      </div>

      <div className="flex justify-center mb-3">
        <svg width={width} height={height} role="img" aria-label="Mapa de calor dos últimos 60 dias">
          {grid.map((d, idx) => {
            const col = Math.floor(idx / ROWS)
            const row = idx % ROWS
            const x = col * (CELL + GAP)
            const y = row * (CELL + GAP)
            if (d.futuro) {
              return (
                <rect
                  key={d.iso}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill="transparent"
                  stroke="var(--fnx-hair)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )
            }
            return (
              <rect
                key={d.iso}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={2}
                fill={intensityColor(d.intensidade)}
              >
                <title>{`dia ${d.dia} · ${d.iso} · intensidade ${d.intensidade}`}</title>
              </rect>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between" style={{ fontSize: '10.5px' }}>
        <p className="fnx-text-faint italic" style={{ fontFamily: 'var(--font-editorial)', fontWeight: 300 }}>
          {percentagem >= 80 ? 'constância exemplar.'
            : percentagem >= 60 ? 'estás no caminho.'
            : percentagem >= 30 ? 'vai um dia de cada vez.'
            : 'cada dia conta. continua.'}
        </p>
        <div className="flex items-center gap-1">
          <span className="fnx-text-faint" style={{ fontSize: '9.5px' }}>menos</span>
          {[0, 1, 2, 3, 4].map(l => (
            <span
              key={l}
              aria-hidden
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: intensityColor(l),
                display: 'inline-block',
                boxShadow: l === 0 ? 'inset 0 0 0 1px var(--fnx-hair-strong)' : 'none'
              }}
            />
          ))}
          <span className="fnx-text-faint" style={{ fontSize: '9.5px' }}>mais</span>
        </div>
      </div>
    </section>
  )
}
