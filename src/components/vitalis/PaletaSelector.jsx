/**
 * PaletaSelector — selector visual das 5 paletas FénixFit.
 * Editorial: swatches circulares com hairline, nome + descrição.
 */

import { useTheme } from '../../contexts/ThemeContext'
import { Check } from 'lucide-react'

export default function PaletaSelector({ compact = false }) {
  const { paleta, setPaleta, paletas, paletaIds, isDark } = useTheme()

  return (
    <section className="fnx-card-solid">
      <div className="flex items-baseline justify-between mb-3">
        <span className="fnx-label-cap">paleta</span>
        <span className="fnx-label-soft">{paletas[paleta]?.nome.toLowerCase()}</span>
      </div>

      <p className="fnx-text-soft italic mb-4" style={{
        fontFamily: 'var(--font-editorial)',
        fontWeight: 300,
        fontSize: '13.5px',
        lineHeight: 1.55
      }}>
        a app é tua. escolhe a cor com que respiras melhor.
      </p>

      <div className={`grid ${compact ? 'grid-cols-5' : 'grid-cols-5 sm:grid-cols-5'} gap-2`}>
        {paletaIds.map(id => {
          const p = paletas[id]
          const tokens = isDark ? p.dark : p.light
          const activo = paleta === id
          return (
            <button
              key={id}
              onClick={() => setPaleta(id)}
              className="group flex flex-col items-center gap-2 fnx-transition active:scale-95"
              aria-label={`paleta ${p.nome}`}
              aria-pressed={activo}
            >
              <span
                className="relative flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: tokens.bg,
                  boxShadow: activo
                    ? `inset 0 0 0 1.5px ${tokens.ouro}, 0 0 0 3px ${tokens.bg}, 0 0 0 4px ${tokens.ouro}`
                    : `inset 0 0 0 1px ${tokens.hairStrong}`
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: tokens.ouro
                  }}
                />
                {activo && (
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ color: tokens.bg }}
                  >
                    <Check size={14} strokeWidth={2} />
                  </span>
                )}
              </span>
              <span
                className="text-center"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '11px',
                  fontWeight: activo ? 500 : 400,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  color: activo ? 'var(--fnx-ink)' : 'var(--fnx-ink-faint)'
                }}
              >
                {p.nome.split(' ')[0].toLowerCase()}
              </span>
            </button>
          )
        })}
      </div>

      {!compact && (
        <p
          className="fnx-text-faint mt-4 text-center"
          style={{ fontSize: '11px', letterSpacing: '0.01em' }}
        >
          {paletas[paleta]?.descricao}
        </p>
      )}
    </section>
  )
}
