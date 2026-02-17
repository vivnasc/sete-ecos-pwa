import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

/**
 * MODULE HEADER — Header generico reutilizavel para qualquer eco
 *
 * Uso: <ModuleHeader eco="serena" title="Diario Emocional" />
 *
 * Props:
 * - eco: nome do eco (serena, ignis, ventis, ecoa, imago)
 * - title: titulo da pagina
 * - subtitle: subtitulo opcional
 * - backTo: rota de volta (default: /{eco}/dashboard)
 * - showHomeButton: mostrar botao de dashboard (default: true)
 * - rightAction: componente JSX para accao direita
 * - compact: modo compacto (header branco fino)
 */
export default function ModuleHeader({
  eco,
  title,
  subtitle,
  backTo,
  showHomeButton = true,
  rightAction = null,
  compact = false,
  className = ''
}) {
  const navigate = useNavigate()
  const theme = getEcoTheme(eco)
  const dashboardPath = `/${eco}/dashboard`
  const backPath = backTo || dashboardPath

  const handleBack = () => {
    if (backTo === 'history') {
      if (window.history.length > 2) {
        navigate(-1)
      } else {
        navigate(dashboardPath)
      }
    } else {
      navigate(backPath)
    }
  }

  if (compact) {
    return (
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="font-semibold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Dashboard"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={className}
      style={{ background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}dd 50%, ${theme.colorDark} 100%)` }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
          >
            <ArrowLeftIcon />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Dashboard"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>
        <div className="text-white">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  )
}
