import React from 'react'
import { Link } from 'react-router-dom'

/**
 * EMPTY STATE EDUCATIVO — Componente reutilizável para quando uma secção está vazia
 *
 * Em vez de mostrar "Sem dados" ou lista vazia, mostra uma explicação + CTA.
 *
 * Uso:
 * <EmptyStateEducativo
 *   icone="📝"
 *   titulo="Ainda sem registos"
 *   descricao="O diário emocional ajuda-te a perceber padrões ao longo do tempo."
 *   dica="Começa por registar como te sentes agora — demora 30 segundos."
 *   ctaLabel="Fazer primeiro registo"
 *   ctaTo="/serena/diario"
 *   color="#6B8E9B"
 * />
 */
export default function EmptyStateEducativo({
  icone = '📋',
  titulo = 'Ainda sem dados',
  descricao,
  dica,
  ctaLabel,
  ctaTo,
  ctaOnClick,
  color = '#7C8B6F'
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Ícone grande */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: `${color}15`, border: `2px dashed ${color}40` }}
      >
        <span className="text-3xl">{icone}</span>
      </div>

      {/* Título */}
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
        {titulo}
      </h3>

      {/* Descrição */}
      {descricao && (
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed mb-4">
          {descricao}
        </p>
      )}

      {/* Dica */}
      {dica && (
        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl max-w-xs mb-6">
          <span className="text-sm">💡</span>
          <p className="text-gray-600 dark:text-gray-300 text-xs text-left leading-relaxed">
            {dica}
          </p>
        </div>
      )}

      {/* CTA */}
      {(ctaLabel && (ctaTo || ctaOnClick)) && (
        ctaTo ? (
          <Link
            to={ctaTo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            onClick={ctaOnClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            {ctaLabel}
          </button>
        )
      )}
    </div>
  )
}
