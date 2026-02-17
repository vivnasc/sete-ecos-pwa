import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS AURORA — Relatorio da integracao final
 * Metricas: graduacao, manutencao mensal, mentoria, rituais, renovacao
 * Dados de: aurora_clients, aurora_checkins, aurora_mentoria,
 *           aurora_rituais_log, aurora_renovacao
 */

const AURORA_INSIGHTS_CONFIG = {
  period: 'weekly',
  title: 'Insights da Aurora',
  metrics: [
    {
      id: 'checkins',
      label: 'Check-ins Mensais',
      icon: '🛡️',
      table: 'aurora_checkins',
      selectColumns: 'id, created_at',
      analysis: (data) => {
        const count = data.length
        let insight = ''
        if (count >= 3) insight = 'Manutencao exemplar!'
        else if (count >= 1) insight = 'A consistencia protege as mudancas'
        return {
          value: count,
          trend: count >= 2 ? 'up' : count > 0 ? 'stable' : 'down',
          insight
        }
      }
    },
    {
      id: 'mentoria',
      label: 'Frases de Sabedoria',
      icon: '🌟',
      table: 'aurora_mentoria',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 3 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 5 ? 'Mentora activa!' : data.length > 0 ? 'A tua sabedoria inspira' : ''
      })
    },
    {
      id: 'rituais',
      label: 'Rituais Matinais',
      icon: '☀️',
      table: 'aurora_rituais_log',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 5 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 7 ? 'Ritual constante!' : data.length > 0 ? 'Cada manha e uma nova aurora' : ''
      })
    },
    {
      id: 'renovacao',
      label: 'Renovacoes',
      icon: '🔄',
      table: 'aurora_renovacao',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 1 ? 'up' : 'down',
        insight: data.length >= 1 ? 'Intencoes renovadas!' : ''
      })
    }
  ],
  generateInsight: (metricsData) => {
    const checkins = metricsData.checkins || {}
    const mentoria = metricsData.mentoria || {}
    const rituais = metricsData.rituais || {}
    const renovacao = metricsData.renovacao || {}

    if (rituais.value >= 5 && checkins.value >= 1) {
      return `Semana de integracao plena! ${rituais.value} rituais matinais e check-in de manutencao ${g('feito', 'feita')}. ${mentoria.value > 0 ? `Ainda partilhaste ${mentoria.value} frase(s) de sabedoria como mentora.` : 'Considera partilhar a tua sabedoria na seccao de mentoria.'} ${g('Estas a viver o que aprendeste', 'Estas a viver o que aprendeste')}.`
    }
    if (rituais.value >= 3) {
      return `${rituais.value} rituais matinais esta semana — cada manha e uma nova aurora. ${checkins.value > 0 ? 'O teu check-in mensal esta em dia.' : 'Lembra-te do check-in mensal para manter as mudancas.'} A consistencia e a tua maior aliada.`
    }
    if (checkins.value > 0 || mentoria.value > 0) {
      return `Esta semana registaste actividade na Aurora. ${checkins.value > 0 ? 'Check-in de manutencao feito! ' : ''}${mentoria.value > 0 ? `${mentoria.value} frase(s) de sabedoria partilhada(s). ` : ''}Tenta adicionar o ritual matinal para uma integracao mais completa.`
    }
    return `Esta semana ainda nao registaste actividade na Aurora. A integracao e uma pratica diaria — comeca com o ritual matinal e ve como o teu dia muda. Tu ja tens as ferramentas. Usa-as.`
  }
}

export default function InsightsAurora() {
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
    <div className="min-h-screen" style={{ background: '#2e1a1a' }}>
      <ModuleHeader eco="aurora" title="Insights" subtitle="A tua aurora interior" compact />
      <div className="max-w-lg mx-auto px-5 py-6">
        {userId ? (
          <InsightEngine eco="aurora" userId={userId} config={AURORA_INSIGHTS_CONFIG} />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#D4A5A5] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
