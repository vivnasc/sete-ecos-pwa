import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS AURORA — Relatório da integração final
 * Métricas: graduação, manutenção mensal, mentoria, rituais, renovação
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
        if (count >= 3) insight = 'Manutenção exemplar!'
        else if (count >= 1) insight = 'A consistência protege as mudanças'
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
        insight: data.length >= 5 ? `${g('Mentor activo', 'Mentora activa')}!` : data.length > 0 ? 'A tua sabedoria inspira' : ''
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
        insight: data.length >= 7 ? 'Ritual constante!' : data.length > 0 ? 'Cada manhã é uma nova aurora' : ''
      })
    },
    {
      id: 'renovacao',
      label: 'Renovações',
      icon: '🔄',
      table: 'aurora_renovacao',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 1 ? 'up' : 'down',
        insight: data.length >= 1 ? 'Intenções renovadas!' : ''
      })
    }
  ],
  generateInsight: (metricsData) => {
    const checkins = metricsData.checkins || {}
    const mentoria = metricsData.mentoria || {}
    const rituais = metricsData.rituais || {}
    const renovacao = metricsData.renovacao || {}

    if (rituais.value >= 5 && checkins.value >= 1) {
      return `Semana de integração plena! ${rituais.value} rituais matinais e check-in de manutenção ${g('feito', 'feita')}. ${mentoria.value > 0 ? `Ainda partilhaste ${mentoria.value} frase(s) de sabedoria como ${g('mentor', 'mentora')}.` : 'Considera partilhar a tua sabedoria na secção de mentoria.'} ${g('Estás a viver o que aprendeste', 'Estás a viver o que aprendeste')}.`
    }
    if (rituais.value >= 3) {
      return `${rituais.value} rituais matinais esta semana — cada manhã é uma nova aurora. ${checkins.value > 0 ? 'O teu check-in mensal está em dia.' : 'Lembra-te do check-in mensal para manter as mudanças.'} A consistência é a tua maior aliada.`
    }
    if (checkins.value > 0 || mentoria.value > 0) {
      return `Esta semana registaste actividade na Aurora. ${checkins.value > 0 ? 'Check-in de manutenção feito! ' : ''}${mentoria.value > 0 ? `${mentoria.value} frase(s) de sabedoria partilhada(s). ` : ''}Tenta adicionar o ritual matinal para uma integração mais completa.`
    }
    return `Esta semana ainda não registaste actividade na Aurora. A integração é uma prática diária — começa com o ritual matinal e vê como o teu dia muda. Tu já tens as ferramentas. Usa-as.`
  }
}

export default function InsightsAurora() {
  const { user } = useAuth()
  const { t } = useI18n()
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
      <ModuleHeader eco="aurora" title={t('aurora.insights.title')} subtitle={t('aurora.insights.subtitle')} compact />
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
