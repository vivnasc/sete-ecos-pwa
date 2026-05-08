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
  const r = (tamanho - 8) / 2
  const c = tamanho / 2
  const circ = 2 * Math.PI * r
  const pct = alvo && alvo > 0 ? Math.min(100, (valor / alvo) * 100) : 0
  const dash = (pct / 100) * circ

  // Cor:
  // - sem alvo · neutro
  // - reverso (carbo em keto, álcool) · acima do alvo é mau (terracota)
  // - default · ouro sempre · oliva quando atinge o alvo (95-110%) · terracota se excede 120%
  const pctReal = alvo && alvo > 0 ? (valor / alvo) * 100 : 0
  const cor = alvo === null
    ? 'var(--ink-faint)'
    : reverso
      ? pctReal > 110 ? 'var(--terracota)' : 'var(--ouro)'
      : pctReal >= 95 && pctReal <= 110 ? 'var(--oliva)'
        : pctReal > 120 ? 'var(--terracota)'
          : 'var(--ouro)'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: tamanho, height: tamanho }}>
        <svg width={tamanho} height={tamanho} className="-rotate-90">
          {/* track */}
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--hair)"
            strokeWidth="4"
          />
          {/* progress */}
          {alvo !== null && alvo > 0 ? (
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={cor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          ) : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="editorial-num tnum leading-none" style={{ fontSize: tamanho * 0.28, color: cor }}>
            {Math.round(valor)}
          </p>
          {alvo !== null && alvo > 0 ? (
            <p className="text-faint tnum leading-none mt-0.5" style={{ fontSize: tamanho * 0.13 }}>
              /{alvo}
            </p>
          ) : null}
        </div>
      </div>
      <div className="text-center">
        <p className="text-faint text-[9.5px] uppercase tracking-cap">{label}</p>
        {alvo !== null && alvo > 0 ? (
          <p className="text-faint text-[9px] tnum">{Math.round(pct)}%</p>
        ) : (
          <p className="text-faint text-[9px]">—</p>
        )}
      </div>
    </div>
  )
}
