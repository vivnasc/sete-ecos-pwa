import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS VENTIS — Relatorio semanal de energia e ritmo
 * Metricas: energia, rotinas, pausas, movimento
 */

const VENTIS_INSIGHTS_CONFIG = {
  period: 'weekly',
  title: 'Insights da Semana',
  metrics: [
    {
      id: 'energia',
      label: 'Check-ins de energia',
      icon: '⚡',
      table: 'ventis_energia_log',
      selectColumns: 'id, nivel, periodo, created_at',
      analysis: (data) => {
        const count = data.length
        const avgNivel = count > 0
          ? Math.round(data.reduce((sum, d) => sum + (d.nivel || 5), 0) / count)
          : 0

        // Melhor e pior periodo
        const periodos = {}
        data.forEach(d => {
          if (!d.periodo) return
          if (!periodos[d.periodo]) periodos[d.periodo] = { total: 0, count: 0 }
          periodos[d.periodo].total += (d.nivel || 5)
          periodos[d.periodo].count++
        })
        const periodoEntries = Object.entries(periodos).map(([p, v]) => ({ periodo: p, avg: v.total / v.count }))
        const melhorPeriodo = periodoEntries.sort((a, b) => b.avg - a.avg)[0]
        const piorPeriodo = periodoEntries.sort((a, b) => a.avg - b.avg)[0]

        let insight = ''
        if (count >= 21) insight = 'Monitorizacao completa!'
        else if (count >= 14) insight = 'Bom ritmo de registo'
        else if (count >= 7) insight = 'Uma por dia — bom começo'
        else if (count > 0) insight = 'Tenta registar mais vezes'

        return {
          value: count,
          trend: count >= 14 ? 'up' : count >= 7 ? 'stable' : 'down',
          insight,
          extra: { avgNivel, melhorPeriodo: melhorPeriodo?.periodo, piorPeriodo: piorPeriodo?.periodo }
        }
      }
    },
    {
      id: 'rotinas',
      label: 'Rotinas completadas',
      icon: '🔄',
      table: 'ventis_rotinas_log',
      selectColumns: 'id, created_at',
      analysis: (data) => {
        const count = data.length

        let insight = ''
        if (count >= 14) insight = 'Consistencia excepcional!'
        else if (count >= 7) insight = 'Rotinas a criar raizes'
        else if (count > 0) insight = 'Continua a regar as rotinas'

        return {
          value: count,
          trend: count >= 7 ? 'up' : count >= 3 ? 'stable' : 'down',
          insight
        }
      }
    },
    {
      id: 'pausas',
      label: 'Pausas conscientes',
      icon: '🍃',
      table: 'ventis_pausas_log',
      selectColumns: 'id, duracao_minutos, created_at',
      analysis: (data) => {
        const count = data.length
        const totalMinutos = data.reduce((sum, d) => sum + (d.duracao_minutos || 2), 0)

        let insight = ''
        if (count >= 14) insight = 'Mestre das pausas!'
        else if (count >= 7) insight = 'Bom ritmo de pausas'
        else if (count > 0) insight = 'Cada pausa conta'

        return {
          value: count,
          trend: count >= 7 ? 'up' : count >= 3 ? 'stable' : 'down',
          insight,
          extra: { totalMinutos }
        }
      }
    },
    {
      id: 'movimento',
      label: 'Sessoes de movimento',
      icon: '🧘',
      table: 'ventis_movimento_log',
      selectColumns: 'id, duracao_minutos, created_at',
      analysis: (data) => {
        const count = data.length
        const totalMinutos = data.reduce((sum, d) => sum + (d.duracao_minutos || 0), 0)

        let insight = ''
        if (totalMinutos >= 120) insight = 'Corpo em movimento!'
        else if (totalMinutos >= 60) insight = 'Bom tempo de movimento'
        else if (count > 0) insight = 'Cada movimento conta'

        return {
          value: count,
          trend: count >= 5 ? 'up' : count >= 2 ? 'stable' : 'down',
          insight,
          extra: { totalMinutos }
        }
      }
    }
  ],
  generateInsight: (metricsData) => {
    const energia = metricsData.energia || {}
    const rotinas = metricsData.rotinas || {}
    const pausas = metricsData.pausas || {}
    const movimento = metricsData.movimento || {}

    if (energia.value >= 14 && rotinas.value >= 7) {
      return `Semana com ritmo! ${energia.value} check-ins de energia e ${rotinas.value} rotinas completadas. ${energia.extra?.melhorPeriodo ? `O teu melhor periodo e "${energia.extra.melhorPeriodo}".` : ''} ${g('Estas conectado', 'Estas conectada')} com o teu ritmo natural — como o vento que sabe quando soprar.`
    }
    if (energia.value >= 7) {
      return `Bom ritmo de monitorizacao energetica. ${energia.extra?.avgNivel ? `Nivel medio de energia: ${energia.extra.avgNivel}/10.` : ''} ${pausas.value > 0 ? `Fizeste ${pausas.value} pausas conscientes — cada pausa e ar fresco para o corpo.` : 'Tenta adicionar pausas conscientes — sao o oxigenio do dia.'}`
    }
    if (energia.value > 0) {
      return `Comecaste a monitorizar a tua energia — isso ja e um passo importante. Como o vento que comeca suave antes de ganhar forca, a consistencia vai trazer padrones. Tenta registar energia 3 vezes por dia: manha, tarde e noite.`
    }
    return 'Esta semana ainda nao registaste a tua energia. O vento so pode guiar-te se souberes de onde sopra. Vai ao Dashboard e faz o teu primeiro check-in de energia.'
  }
}

export default function InsightsVentis() {
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
    <div className="min-h-screen" style={{ background: '#1a2e24' }}>
      <ModuleHeader eco="ventis" title="Insights Semanais" compact />
      <div className="max-w-lg mx-auto px-5 py-6">
        {userId ? (
          <InsightEngine eco="ventis" userId={userId} config={VENTIS_INSIGHTS_CONFIG} />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#5D9B84] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
