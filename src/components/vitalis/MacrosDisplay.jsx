/**
 * MacrosDisplay — Gráficos circulares de macros + calorias
 * Estilo editorial (FénixFit): hairline ouro, números em serif light tabular,
 * ícones SVG inline com strokeWidth 1.4 em vez de emojis.
 */

const IconProteina = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M15.5 3a3.5 3.5 0 0 0-3.5 3.5V8h-1V6.5a3.5 3.5 0 1 0-7 0V8H3v3h1v6h2v4h2v-4h2v4h2v-4h2v-6h1V6.5A3.5 3.5 0 0 0 15.5 3z"/>
    <path d="M21 9c0-2-1.5-3-3-3"/>
  </svg>
);

const IconHidratos = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 5.56 5.56 0 0 0 3.8 1.5c1.63-.225 2.65-1.213 3.9-2.2a5.56 5.56 0 0 1 3.8-1.5"/>
    <path d="M2 16c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 5.56 5.56 0 0 0 3.8 1.5c1.63-.225 2.65-1.213 3.9-2.2a5.56 5.56 0 0 1 3.8-1.5"/>
    <path d="M2 10c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 5.56 5.56 0 0 0 3.8 1.5c1.63-.225 2.65-1.213 3.9-2.2a5.56 5.56 0 0 1 3.8-1.5"/>
  </svg>
);

const IconGordura = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 2c-3 4-6 7-6 11a6 6 0 1 0 12 0c0-4-3-7-6-11z"/>
    <circle cx="12" cy="14" r="2.5"/>
  </svg>
);

const IconChama = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

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

  const macros = [
    { key: 'proteina', label: 'Proteína', Icon: IconProteina, consumed: macrosConsumidos.proteina, target: macrosAlvo.proteina },
    { key: 'hidratos', label: 'Hidratos', Icon: IconHidratos, consumed: macrosConsumidos.hidratos, target: macrosAlvo.hidratos },
    { key: 'gordura', label: 'Gordura', Icon: IconGordura, consumed: macrosConsumidos.gordura, target: macrosAlvo.gordura },
  ]

  return (
    <section className="vitalis-card-feature" aria-label="Macronutrientes de hoje">
      <div className="flex items-center justify-between mb-5">
        <h3 className="vitalis-label-cap">Macros de Hoje</h3>
        <p style={{ fontSize: '0.6875rem', color: 'var(--vitalis-ink-faint)', letterSpacing: '0.04em' }}>
          Refeições registadas
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {macros.map(({ key, label, Icon, consumed, target }) => {
          const progress = Math.min(consumed / target, 1)
          const dashoffset = 94 - (94 * progress)
          return (
            <div key={key} className="text-center">
              <div
                className="relative w-16 h-16 mx-auto mb-2.5"
                role="img"
                aria-label={`${label}: ${consumed.toFixed(1)} de ${target} porções`}
              >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--vitalis-hair)" strokeWidth="2"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--vitalis-ouro)" strokeWidth="2"
                          strokeDasharray="94" strokeDashoffset={dashoffset} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-5 h-5" style={{ color: 'var(--vitalis-ink-soft)' }} />
                </div>
              </div>
              <p className="vitalis-editorial-num" style={{ fontSize: '1.125rem', lineHeight: 1 }}>
                {consumed.toFixed(1)}<span style={{ color: 'var(--vitalis-ink-faint)', fontWeight: 300 }}> / {target}</span>
              </p>
              <p
                className="mt-1"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--vitalis-ink-faint)'
                }}
              >
                {label}
              </p>
            </div>
          )
        })}
      </div>

      <hr className="vitalis-hairline mb-5" />

      {/* Calorias — bloco editorial */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconChama className="w-4 h-4" style={{ color: 'var(--vitalis-ouro)' }} />
            <span className="vitalis-label-cap">Calorias</span>
          </div>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--vitalis-ink-faint)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.04em'
            }}
          >
            meta {caloriasAlvo} kcal
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="vitalis-editorial-num" style={{ fontSize: '2.75rem', lineHeight: 1 }}>
            {caloriasConsumidas}
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              color: 'var(--vitalis-ink-faint)',
              fontFamily: 'var(--font-corpo)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            / {caloriasAlvo} kcal
          </span>
        </div>

        <div
          className="h-[3px] rounded-full overflow-hidden"
          style={{ background: 'var(--vitalis-hair)' }}
          role="progressbar"
          aria-valuenow={Math.round(progressoCalorias)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso de calorias"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressoCalorias, 100)}%`,
              background: 'var(--vitalis-ouro)'
            }}
          />
        </div>
        <p
          className="mt-2.5"
          style={{
            fontSize: '0.75rem',
            color: 'var(--vitalis-ink-faint)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-editorial)',
            fontWeight: 300
          }}
        >
          Restam <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--vitalis-ink-soft)' }}>{Math.max(caloriasAlvo - caloriasConsumidas, 0)}</span> kcal hoje
        </p>
      </div>
    </section>
  )
}
