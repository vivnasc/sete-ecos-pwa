'use client'

// Donut chart compacto + barra de distribuição para macros.
// Sem libs · SVG puro + CSS.

export function DistribuicaoBar({ p, c, g, mostrarLegenda = true }: { p: number; c: number; g: number; mostrarLegenda?: boolean }) {
  const kcalP = p * 4
  const kcalC = c * 4
  const kcalG = g * 9
  const total = kcalP + kcalC + kcalG
  if (total === 0) return null
  const pctP = (kcalP / total) * 100
  const pctC = (kcalC / total) * 100
  const pctG = (kcalG / total) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className="bg-ouro transition-all" style={{ width: `${pctP}%` }} title={`Proteína ${Math.round(pctP)}%`} />
        <div className="bg-tinta dark:bg-creme/70 transition-all" style={{ width: `${pctC}%` }} title={`Carbo ${Math.round(pctC)}%`} />
        <div className="bg-oliva transition-all" style={{ width: `${pctG}%` }} title={`Gordura ${Math.round(pctG)}%`} />
      </div>
      {mostrarLegenda ? (
        <div className="flex justify-between text-[10px] text-faint tnum">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-ouro" />P {Math.round(pctP)}%</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-tinta dark:bg-creme/70" />C {Math.round(pctC)}%</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-oliva" />G {Math.round(pctG)}%</span>
        </div>
      ) : null}
    </div>
  )
}

export function DonutMacro({
  valor,
  alvo,
  label,
  unidade = 'g',
  tamanho = 72,
  reverso = false  // true para macros onde menos é melhor (ex: carbo em keto)
}: {
  valor: number
  alvo: number | null
  label: string
  unidade?: string
  tamanho?: number
  reverso?: boolean
}) {
  const r = (tamanho - 12) / 2
  const c = tamanho / 2
  const circ = 2 * Math.PI * r
  const pctReal = alvo && alvo > 0 ? (valor / alvo) * 100 : 0
  const pctVisual = Math.min(100, pctReal)
  const dash = (pctVisual / 100) * circ
  const strokeWidth = Math.max(5, tamanho * 0.09)

  // Cor fixa · não depende da paleta da app
  const cor = alvo === null
    ? '#A89878' // neutro · sem alvo
    : reverso
      ? pctReal > 110 ? '#C9614E' : '#D4A14E'
      : pctReal >= 95 && pctReal <= 110 ? '#7B9A4F'
        : pctReal > 120 ? '#C9614E'
          : '#D4A14E'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: tamanho, height: tamanho }}>
        <svg width={tamanho} height={tamanho} className="-rotate-90">
          {/* track · cinza claro visível em ambos modos */}
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(150,140,120,0.25)"
            strokeWidth={strokeWidth}
          />
          {/* progress */}
          {alvo !== null && alvo > 0 && valor > 0 ? (
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={cor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          ) : null}
          {/* sem alvo · arco solid completo subtil */}
          {alvo === null && valor > 0 ? (
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={cor}
              strokeWidth={strokeWidth}
              opacity={0.4}
            />
          ) : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="editorial-num tnum leading-none" style={{ fontSize: tamanho * 0.3, color: cor, fontWeight: 500 }}>
            {Math.round(valor)}
          </p>
          {alvo !== null && alvo > 0 ? (
            <p className="text-faint tnum leading-none mt-0.5" style={{ fontSize: tamanho * 0.14 }}>
              /{alvo}
            </p>
          ) : null}
        </div>
      </div>
      <div className="text-center">
        <p className="text-faint text-[10px] uppercase tracking-cap">{label}</p>
        {alvo !== null && alvo > 0 ? (
          <p className="text-[9.5px] tnum" style={{ color: pctReal > 120 ? '#C9614E' : 'var(--ink-faint)' }}>
            {Math.round(pctReal)}%{pctReal > 100 ? ` · +${Math.round(pctReal - 100)}` : ''}
          </p>
        ) : (
          <p className="text-faint text-[9.5px]">sem alvo</p>
        )}
      </div>
    </div>
  )
}
