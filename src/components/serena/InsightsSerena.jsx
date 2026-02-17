import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS SERENA — Relatório semanal emocional
 */

const SERENA_INSIGHTS_CONFIG = {
  period: 'weekly',
  title: 'Insights da Semana',
  metrics: [
    {
      id: 'emocoes',
      label: 'Emoções registadas',
      icon: '📝',
      table: 'serena_emocoes_log',
      selectColumns: 'id, emocao, intensidade, created_at',
      analysis: (data) => {
        const count = data.length
        const avgIntensidade = count > 0
          ? Math.round(data.reduce((sum, d) => sum + (d.intensidade || 5), 0) / count)
          : 0
        // Emoção mais frequente
        const freq = {}
        data.forEach(d => { freq[d.emocao] = (freq[d.emocao] || 0) + 1 })
        const topEmocao = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]

        let insight = ''
        if (count >= 7) insight = 'Excelente consistência!'
        else if (count >= 3) insight = 'Bom ritmo de registo'
        else if (count > 0) insight = 'Tenta registar mais vezes'

        return {
          value: count,
          trend: count >= 5 ? 'up' : count >= 2 ? 'stable' : 'down',
          insight,
          extra: { avgIntensidade, topEmocao: topEmocao?.[0] }
        }
      }
    },
    {
      id: 'respiracao',
      label: 'Sessões respiração',
      icon: '🫁',
      table: 'serena_respiracao_log',
      selectColumns: 'id, tecnica, duracao_minutos, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 3 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 5 ? 'Respiração regular!' : data.length > 0 ? 'Continua a praticar' : ''
      })
    },
    {
      id: 'praticas',
      label: 'Práticas feitas',
      icon: '💧',
      table: 'serena_praticas_log',
      selectColumns: 'id, pratica_id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 3 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 5 ? 'Fluidez em crescimento!' : ''
      })
    },
    {
      id: 'rituais',
      label: 'Rituais completados',
      icon: '🔓',
      table: 'serena_rituais_log',
      selectColumns: 'id, tipo_ritual, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 2 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length > 0 ? 'Libertação em acção' : ''
      })
    }
  ],
  generateInsight: (metricsData) => {
    const emocoes = metricsData.emocoes || {}
    const respiracao = metricsData.respiracao || {}

    if (emocoes.value >= 7 && respiracao.value >= 3) {
      return `Semana muito ${g('activo', 'activa')} emocionalmente! Registaste ${emocoes.value} emoções e fizeste ${respiracao.value} sessões de respiração. ${emocoes.extra?.topEmocao ? `A emoção mais presente foi "${emocoes.extra.topEmocao}".` : ''} Continua a fluir!`
    }
    if (emocoes.value >= 3) {
      return `Bom ritmo de registo emocional. ${emocoes.extra?.topEmocao ? `"${emocoes.extra.topEmocao}" apareceu mais vezes.` : ''} Tenta adicionar respiração à rotina — ajuda a processar o que sentes.`
    }
    if (emocoes.value > 0) {
      return `Começaste a registar emoções esta semana — isso já é um passo importante. Tenta fazer check-in emocional pelo menos 1 vez por dia. A consistência traz padrões e padrões trazem compreensão.`
    }
    return 'Esta semana ainda não registaste emoções. Que tal começar hoje? Basta ir ao Diário e registar como te sentes agora.'
  }
}

export default function InsightsSerena() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchUserId = async () => {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()
      if (data) setUserId(data.id)
    }
    fetchUserId()
  }, [user])

  return (
    <div className="min-h-screen" style={{ background: '#1a2e3a' }}>
      <ModuleHeader eco="serena" title="Insights Semanais" compact />
      <div className="max-w-lg mx-auto px-5 py-6">
        {userId ? (
          <InsightEngine eco="serena" userId={userId} config={SERENA_INSIGHTS_CONFIG} />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#6B8E9B] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
