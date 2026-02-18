import React from 'react'
import { Link } from 'react-router-dom'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'

/**
 * MODULE DASHBOARD SHELL — Estrutura base para dashboards de qualquer eco
 *
 * Uso:
 * <ModuleDashboardShell
 *   eco="serena"
 *   userName="Maria"
 *   greeting="Como estas hoje?"
 *   stats={[{ label: 'Gotas', value: 42, icon: '💧' }]}
 *   quickActions={[{ label: 'Diario', to: '/serena/diario', icon: '📖' }]}
 * >
 *   {conteudo especifico do eco}
 * </ModuleDashboardShell>
 */
export default function ModuleDashboardShell({
  eco,
  userName,
  greeting,
  stats = [],
  quickActions = [],
  gamification = null,
  children,
  className = ''
}) {
  const theme = getEcoTheme(eco)

  return (
    <div
      className={`min-h-screen pb-24 ${className}`}
      style={{ background: `linear-gradient(180deg, ${theme.colorDark} 0%, #0f0f0f 100%)` }}
    >
      {/* Header com saudacao */}
      <div
        className="px-5 pt-6 pb-8"
        style={{ background: `linear-gradient(135deg, ${theme.colorDark} 0%, ${theme.color}33 100%)` }}
      >
        <div className="max-w-lg mx-auto">
          <p className="text-white/60 text-sm mb-1">{theme.name}</p>
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            {g('Bem-vindo', 'Bem-vinda')}{userName ? `, ${userName}` : ''}
          </h1>
          {greeting && (
            <p className="text-white/70 text-sm">{greeting}</p>
          )}

          {/* Gamificacao resumida */}
          {gamification && (
            <div
              className="mt-4 flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ background: `${theme.color}20`, border: `1px solid ${theme.color}30` }}
            >
              <span className="text-2xl">{gamification.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">
                  {gamification.total} {gamification.currency}
                </p>
                <p className="text-white/50 text-xs">
                  Nivel: {gamification.level}
                </p>
              </div>
              {gamification.streak > 0 && (
                <div className="ml-auto text-right">
                  <p className="text-white font-semibold text-sm">{gamification.streak} dias</p>
                  <p className="text-white/50 text-xs">streak</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {stats.length > 0 && (
        <div className="px-5 -mt-4">
          <div className="max-w-lg mx-auto">
            <div className={`grid gap-3 ${stats.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center"
                >
                  <span className="text-xl block mb-1">{stat.icon}</span>
                  <p className="text-white font-bold text-lg">{stat.value}</p>
                  <p className="text-white/50 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div className="px-5 mt-6">
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{action.label}</p>
                    {action.subtitle && (
                      <p className="text-white/40 text-xs">{action.subtitle}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteudo especifico do eco */}
      <div className="px-5 mt-6">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
