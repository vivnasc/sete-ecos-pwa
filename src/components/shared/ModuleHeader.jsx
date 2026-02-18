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
      <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all duration-300"
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
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all duration-300"
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
      className={`hero-gradient-animated relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}dd 50%, ${theme.colorDark} 100%)` }}
    >
      {/* Decorative gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.color}, white, ${theme.color}, transparent)` }} />
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle, white 0%, transparent 70%)`, filter: 'blur(40px)' }} />
      <div className="relative max-w-4xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm transition-all duration-300 backdrop-blur-sm shadow-lg"
          >
            <ArrowLeftIcon />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all duration-300 backdrop-blur-sm shadow-lg"
                aria-label="Dashboard"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>
        <div className="text-white">
          <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1">{theme.name}</p>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/70 text-sm mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  )
}
