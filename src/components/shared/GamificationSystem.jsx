import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'

/**
 * GAMIFICATION SYSTEM — Sistema generico de gamificacao para qualquer eco
 *
 * Cada eco tem:
 * - Currency (moeda): gotas, chamas, folhas, ecos, estrelas, joias
 * - Levels: array de niveis com nome e threshold
 * - Badges: conquistas desbloqueadas
 * - Streak: dias consecutivos de uso
 *
 * Uso:
 * <GamificationSystem
 *   eco="serena"
 *   userId={userId}
 *   config={SERENA_GAMIFICATION}
 * />
 *
 * Config example:
 * {
 *   currency: { name: 'Gotas', icon: '💧', plural: 'Gotas' },
 *   levels: [
 *     { name: 'Nascente', threshold: 0 },
 *     { name: 'Riacho', threshold: 50 },
 *     { name: 'Rio', threshold: 200 },
 *     { name: 'Oceano', threshold: 500 }
 *   ],
 *   badges: [
 *     { id: 'first_tear', name: 'Primeira Lagrima', description: 'Chorar sem culpa', icon: '😢', condition: (data) => data.emocoes_logged >= 1 },
 *     ...
 *   ],
 *   actions: {
 *     log_emotion: 5,
 *     breathing: 10,
 *     ritual: 15,
 *     practice: 8
 *   }
 * }
 */

// ===== Funcoes de calculo =====

export function calculateLevel(total, levels) {
  let currentLevel = levels[0]
  for (const level of levels) {
    if (total >= level.threshold) {
      currentLevel = level
    } else {
      break
    }
  }
  const nextLevel = levels[levels.indexOf(currentLevel) + 1]
  const progress = nextLevel
    ? ((total - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
    : 100
  return {
    current: currentLevel,
    next: nextLevel,
    progress: Math.min(Math.max(progress, 0), 100)
  }
}

export function checkBadges(badges, userData) {
  return badges.map(badge => ({
    ...badge,
    unlocked: badge.condition(userData)
  }))
}

// ===== Componente de display compacto (para dashboard) =====

export function GamificationBadge({ eco, config, total, streak }) {
  const theme = getEcoTheme(eco)
  const levelInfo = calculateLevel(total, config.levels)

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{ background: `${theme.color}20`, border: `1px solid ${theme.color}30` }}
    >
      <span className="text-2xl">{config.currency.icon}</span>
      <div>
        <p className="text-white font-semibold text-sm">
          {total} {config.currency.plural}
        </p>
        <p className="text-white/50 text-xs">
          Nivel: {levelInfo.current.name}
        </p>
      </div>
      {streak > 0 && (
        <div className="ml-auto text-right">
          <p className="text-white font-semibold text-sm">{streak}</p>
          <p className="text-white/50 text-xs">dias</p>
        </div>
      )}
    </div>
  )
}

// ===== Componente de display completo (pagina de gamificacao) =====

export function GamificationPanel({ eco, config, total, streak, userData }) {
  const theme = getEcoTheme(eco)
  const levelInfo = calculateLevel(total, config.levels)
  const badgesStatus = userData ? checkBadges(config.badges, userData) : []
  const unlockedCount = badgesStatus.filter(b => b.unlocked).length

  return (
    <div className="space-y-6">
      {/* Level progress */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider">Nivel Actual</p>
            <p className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>
              {levelInfo.current.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl">{config.currency.icon}</p>
            <p className="text-white font-bold">{total}</p>
          </div>
        </div>

        {/* Progress bar */}
        {levelInfo.next && (
          <div>
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>{levelInfo.current.name}</span>
              <span>{levelInfo.next.name}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${levelInfo.progress}%`,
                  background: `linear-gradient(90deg, ${theme.color}, ${theme.color}cc)`
                }}
              />
            </div>
            <p className="text-white/30 text-xs mt-1 text-right">
              {levelInfo.next.threshold - total} {config.currency.plural} para {levelInfo.next.name}
            </p>
          </div>
        )}

        {/* Streak */}
        {streak > 0 && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <span className="text-lg">🔥</span>
            <span className="text-white text-sm font-medium">{streak} dias consecutivos</span>
          </div>
        )}
      </div>

      {/* Badges grid */}
      {badgesStatus.length > 0 && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Conquistas</h3>
            <span className="text-white/40 text-sm">
              {unlockedCount}/{badgesStatus.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {badgesStatus.map((badge) => (
              <div
                key={badge.id}
                className={`text-center p-3 rounded-xl ${
                  badge.unlocked
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/3 border border-white/5 opacity-40'
                }`}
              >
                <span className="text-2xl block mb-1">
                  {badge.unlocked ? badge.icon : '🔒'}
                </span>
                <p className="text-white text-xs font-medium">{badge.name}</p>
                {badge.unlocked && (
                  <p className="text-white/40 text-[10px] mt-0.5">{badge.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Hook para gestao de gamificacao =====

export function useGamification(eco, userId, config) {
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const ecoTable = `${eco}_clients`

  const fetchStats = useCallback(async () => {
    if (!userId) return

    try {
      const currencyColumn = `${config.currency.name.toLowerCase()}_total`
      const { data, error } = await supabase
        .from(ecoTable)
        .select(`${currencyColumn}, streak_dias`)
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data) {
        setTotal(data[currencyColumn] || 0)
        setStreak(data.streak_dias || 0)
      }
    } catch (err) {
      console.error(`useGamification(${eco}):`, err)
    } finally {
      setLoading(false)
    }
  }, [userId, eco, ecoTable, config.currency.name])

  const addPoints = useCallback(async (action, customPoints) => {
    if (!userId) return 0
    const points = customPoints || config.actions[action] || 0
    if (points === 0) return 0

    const currencyColumn = `${config.currency.name.toLowerCase()}_total`
    const newTotal = total + points

    try {
      await supabase
        .from(ecoTable)
        .update({ [currencyColumn]: newTotal })
        .eq('user_id', userId)

      setTotal(newTotal)
      return points
    } catch (err) {
      console.error(`addPoints(${eco}, ${action}):`, err)
      return 0
    }
  }, [userId, eco, ecoTable, total, config])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    total,
    streak,
    loading,
    addPoints,
    refresh: fetchStats,
    levelInfo: calculateLevel(total, config.levels)
  }
}

export default GamificationPanel
