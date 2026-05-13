/**
 * MacrosDisplay — Macros + calorias do dia
 * Linguagem editorial FénixFit: card-feature, DonutMacro idênticos,
 * lucide icons, números em serif light tabular.
 */

import { UtensilsCrossed, Flame } from 'lucide-react'

function DonutMacro({ valor, alvo, label, tamanho = 64, reverso = false }) {
  const r = (tamanho - 12) / 2
  const c = tamanho / 2
  const circ = 2 * Math.PI * r
  const valorSeguro = typeof valor === 'number' && !Number.isNaN(valor) ? valor : 0
  const pctReal = alvo && alvo > 0 ? (valorSeguro / alvo) * 100 : 0
  const pctVisual = Math.min(100, pctReal)
  const dash = (pctVisual / 100) * circ
  const strokeWidth = Math.max(5, tamanho * 0.09)

  // Cor fixa por estado, igual à FénixFit
  const cor = alvo === null || alvo === undefined
    ? '#A89878'
    : reverso
      ? pctReal > 110 ? '#C9614E' : '#D4A14E'
      : pctReal >= 95 && pctReal <= 110 ? '#7B9A4F'
        : pctReal > 120 ? '#C9614E'
          : '#D4A14E'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: tamanho, height: tamanho }}>
        <svg width={tamanho} height={tamanho} className="-rotate-90">
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(150,140,120,0.25)"
            strokeWidth={strokeWidth}
          />
          {alvo && alvo > 0 && valorSeguro > 0 ? (
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
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="fnx-editorial-num fnx-tnum"
            style={{ fontSize: tamanho * 0.3, color: cor, fontWeight: 500, lineHeight: 1 }}
          >
            {Number.isInteger(valorSeguro) ? valorSeguro : valorSeguro.toFixed(1)}
          </p>
          {alvo && alvo > 0 ? (
            <p className="fnx-text-faint fnx-tnum" style={{ fontSize: tamanho * 0.14, lineHeight: 1, marginTop: 2 }}>
              /{alvo}
            </p>
          ) : null}
        </div>
      </div>
      <div className="text-center">
        <p className="fnx-text-faint" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          {label}
        </p>
        {alvo && alvo > 0 ? (
          <p className="fnx-tnum" style={{ fontSize: '9.5px', color: pctReal > 120 ? '#C9614E' : 'var(--fnx-ink-faint)' }}>
            {Math.round(pctReal)}%
          </p>
        ) : (
          <p className="fnx-text-faint" style={{ fontSize: '9.5px' }}>sem alvo</p>
        )}
      </div>
    </div>
  )
}

function DistribuicaoBar({ p, c, g }) {
  const kcalP = p * 20 * 4
  const kcalC = c * 30 * 4
  const kcalG = g * 7 * 9
  const total = kcalP + kcalC + kcalG
  if (total === 0) return null
  const pctP = (kcalP / total) * 100
  const pctC = (kcalC / total) * 100
  const pctG = (kcalG / total) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
        <div style={{ background: 'var(--fnx-ouro)', width: `${pctP}%`, transition: 'width 0.4s ease' }} />
        <div style={{ background: 'var(--fnx-ink)', width: `${pctC}%`, transition: 'width 0.4s ease' }} />
        <div style={{ background: 'var(--fnx-oliva)', width: `${pctG}%`, transition: 'width 0.4s ease' }} />
      </div>
      <div className="flex justify-between fnx-tnum" style={{ fontSize: '10px', color: 'var(--fnx-ink-faint)' }}>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--fnx-ouro)' }} />
          proteína {Math.round(pctP)}%
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--fnx-ink)' }} />
          hidratos {Math.round(pctC)}%
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--fnx-oliva)' }} />
          gordura {Math.round(pctG)}%
        </span>
      </div>
    </div>
  )
}

export default function MacrosDisplay({ mealsHoje, macrosAlvo, caloriasAlvo }) {
  const macrosConsumidos = mealsHoje.reduce((acc, meal) => ({
    proteina: acc.proteina + (parseFloat(meal.porcoes_proteina) || 0),
    hidratos: acc.hidratos + (parseFloat(meal.porcoes_hidratos) || 0),
    gordura: acc.gordura + (parseFloat(meal.porcoes_gordura) || 0)
  }), { proteina: 0, hidratos: 0, gordura: 0 })

  const caloriasConsumidas = Math.round(
    (macrosConsumidos.proteina * 20 * 4) +
    (macrosConsumidos.hidratos * 30 * 4) +
    (macrosConsumidos.gordura * 7 * 9)
  )
  const progressoCalorias = (caloriasConsumidas / caloriasAlvo) * 100
  const numRefeicoes = mealsHoje.length

  return (
    <section className="fnx-card-feature" aria-label="Macronutrientes de hoje">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={14} strokeWidth={1.4} className="fnx-text-ouro" />
          <span className="fnx-label-cap">refeições · hoje</span>
        </div>
        <span className="fnx-text-faint fnx-tnum" style={{ fontSize: '11px' }}>
          {numRefeicoes}× hoje
        </span>
      </div>

      {/* Donuts: kcal + 3 macros */}
      <div className="grid grid-cols-4 gap-1 place-items-center mb-4">
        <DonutMacro label="kcal" valor={caloriasConsumidas} alvo={caloriasAlvo} tamanho={64} />
        <DonutMacro label="proteína" valor={macrosConsumidos.proteina} alvo={macrosAlvo.proteina} tamanho={64} />
        <DonutMacro label="hidratos" valor={macrosConsumidos.hidratos} alvo={macrosAlvo.hidratos} tamanho={64} />
        <DonutMacro label="gordura" valor={macrosConsumidos.gordura} alvo={macrosAlvo.gordura} tamanho={64} />
      </div>

      {/* Distribuição de calorias por macro */}
      {caloriasConsumidas > 0 ? (
        <DistribuicaoBar
          p={macrosConsumidos.proteina}
          c={macrosConsumidos.hidratos}
          g={macrosConsumidos.gordura}
        />
      ) : (
        <p
          className="fnx-text-soft mt-1"
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            fontFamily: 'var(--font-editorial)',
            fontWeight: 300
          }}
        >
          ainda sem refeições hoje. <span style={{ color: 'var(--fnx-ouro)', fontStyle: 'italic' }}>regista o que comeste</span>.
        </p>
      )}

      {/* Rodapé com restantes kcal */}
      {caloriasConsumidas > 0 ? (
        <>
          <hr className="fnx-hairline mt-4 mb-3" />
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <Flame size={12} strokeWidth={1.4} className="fnx-text-ouro" />
              <span className="fnx-label-soft">restam hoje</span>
            </div>
            <span className="fnx-editorial-num fnx-tnum" style={{ fontSize: '20px' }}>
              {Math.max(caloriasAlvo - caloriasConsumidas, 0)}
              <span className="fnx-text-faint" style={{ fontSize: '11px', marginLeft: '4px', fontFamily: 'var(--font-corpo)' }}>
                kcal
              </span>
            </span>
          </div>
        </>
      ) : null}

      {/* a11y progressbar */}
      <div
        className="sr-only"
        role="progressbar"
        aria-valuenow={Math.round(progressoCalorias)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de calorias do dia"
      />
    </section>
  )
}
