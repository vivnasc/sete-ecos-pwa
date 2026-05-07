'use client'

type Ponto = { x: string; y: number }

type Props = {
  pontos: Ponto[]
  unidade?: string
  cor?: string
  altura?: number
  vazio?: string
}

export default function TrendChart({ pontos, unidade = '', cor = 'var(--ouro)', altura = 120, vazio = 'sem dados ainda' }: Props) {
  if (pontos.length < 2) {
    return (
      <div className="card-solid flex h-[140px] items-center justify-center">
        <p className="text-soft text-[12px]">{vazio}</p>
      </div>
    )
  }

  const padding = { top: 12, right: 12, bottom: 22, left: 32 }
  const w = 320
  const h = altura
  const innerW = w - padding.left - padding.right
  const innerH = h - padding.top - padding.bottom

  const ys = pontos.map(p => p.y)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const rangeY = maxY - minY || 1

  const xCoord = (i: number) => padding.left + (i / (pontos.length - 1)) * innerW
  const yCoord = (v: number) => padding.top + (1 - (v - minY) / rangeY) * innerH

  const path = pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xCoord(i).toFixed(1)} ${yCoord(p.y).toFixed(1)}`)
    .join(' ')

  const areaPath = `${path} L ${xCoord(pontos.length - 1).toFixed(1)} ${(padding.top + innerH).toFixed(1)} L ${xCoord(0).toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`

  const ultimoY = ys[ys.length - 1]
  const primeiroY = ys[0]
  const variacao = Math.round((ultimoY - primeiroY) * 10) / 10

  return (
    <div className="card-solid">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">Tendência</span>
        <span className="label-soft">
          <span className={variacao > 0 ? 'text-terracota' : variacao < 0 ? 'text-oliva' : ''}>
            {variacao > 0 ? '+' : ''}{variacao}{unidade}
          </span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-3 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Gráfico de tendência. Variação ${variacao}${unidade}.`}
      >
        <defs>
          <linearGradient id="grad-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={cor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Eixo Y: min e max */}
        <text x={padding.left - 6} y={padding.top + 4} className="fill-current text-[9px]" textAnchor="end" fill="var(--ink-faint)">
          {Math.round(maxY * 10) / 10}
        </text>
        <text x={padding.left - 6} y={padding.top + innerH + 2} className="fill-current text-[9px]" textAnchor="end" fill="var(--ink-faint)">
          {Math.round(minY * 10) / 10}
        </text>

        {/* Linhas guia */}
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="var(--hair)" strokeWidth="1" />

        <path d={areaPath} fill="url(#grad-fill)" />
        <path d={path} fill="none" stroke={cor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {pontos.map((p, i) => (
          <circle key={i} cx={xCoord(i)} cy={yCoord(p.y)} r="2.5" fill={cor} />
        ))}

        {/* Labels primeiro e último */}
        <text x={xCoord(0)} y={h - 6} className="text-[9px]" textAnchor="start" fill="var(--ink-faint)">
          {pontos[0].x}
        </text>
        <text x={xCoord(pontos.length - 1)} y={h - 6} className="text-[9px]" textAnchor="end" fill="var(--ink-faint)">
          {pontos[pontos.length - 1].x}
        </text>
      </svg>
    </div>
  )
}
