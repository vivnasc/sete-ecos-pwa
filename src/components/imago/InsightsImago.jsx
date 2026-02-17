import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS IMAGO — Relatório semanal de identidade & espelho
 * Métricas: espelho triplo, arqueologia, meditações, valores, nomeação, integrações
 * Dados de: imago_clients, imago_espelho_triplo, imago_arqueologia,
 *           imago_meditacoes_log, imago_valores, imago_nomeacao, imago_integracoes_log
 */

const IMAGO_INSIGHTS_CONFIG = {
  period: 'weekly',
  title: 'Insights da Semana',
  metrics: [
    {
      id: 'espelho',
      label: 'Sessões Espelho Triplo',
      icon: '🪞',
      table: 'imago_espelho_triplo',
      selectColumns: 'id, essencia, mascara, aspiracao, created_at',
      analysis: (data) => {
        const count = data.length
        const preenchidos = data.filter(d => d.essencia && d.mascara && d.aspiracao).length

        let insight = ''
        if (preenchidos >= 3) insight = 'Reflexão profunda e consistente!'
        else if (count >= 2) insight = 'Bom ritmo de auto-observação'
        else if (count > 0) insight = 'Cada reflexão revela mais de ti'

        return {
          value: count,
          trend: count >= 3 ? 'up' : count > 0 ? 'stable' : 'down',
          insight,
          extra: { preenchidos }
        }
      }
    },
    {
      id: 'arqueologia',
      label: 'Escavações de identidade',
      icon: '⛏️',
      table: 'imago_arqueologia',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 3 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 5 ? 'Arqueologia profunda!' : data.length > 0 ? 'Continua a escavar' : ''
      })
    },
    {
      id: 'meditacoes',
      label: 'Meditações de essência',
      icon: '🧘',
      table: 'imago_meditacoes_log',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 3 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 5 ? 'Prática regular de essência!' : data.length > 0 ? 'Cada meditação conecta-te mais' : ''
      })
    },
    {
      id: 'integracoes',
      label: 'Insights de integração',
      icon: '🌀',
      table: 'imago_integracoes_log',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 2 ? 'up' : data.length > 0 ? 'stable' : 'down',
        insight: data.length >= 3 ? 'Integração em movimento!' : data.length > 0 ? 'Conectar ecos traz clareza' : ''
      })
    }
  ],
  generateInsight: (metricsData) => {
    const espelho = metricsData.espelho || {}
    const arqueologia = metricsData.arqueologia || {}
    const meditacoes = metricsData.meditacoes || {}
    const integracoes = metricsData.integracoes || {}

    if (espelho.value >= 3 && meditacoes.value >= 2) {
      return `Semana de profundidade! ${espelho.value} sessões de Espelho Triplo e ${meditacoes.value} meditações de essência. ${espelho.extra?.preenchidos >= 2 ? 'As três dimensões do espelho estão a revelar-se.' : ''} ${g('Estás mais conectado', 'Estás mais conectada')} contigo ${g('mesmo', 'mesma')}.`
    }
    if (espelho.value >= 1 && arqueologia.value >= 1) {
      return `Combinaste reflexão e arqueologia esta semana — uma combinação poderosa. Olhar para quem és agora e escavar quem foste cria pontes de compreensão. ${integracoes.value > 0 ? `E ainda registaste ${integracoes.value} insight(s) de integração!` : 'Tenta registar insights de integração entre os ecos.'}`
    }
    if (espelho.value > 0) {
      return `Começaste a semana com ${espelho.value} reflexão(ões) no Espelho Triplo. Cada vez que te olhas honestamente, a identidade clareia. Tenta adicionar a Arqueologia de Si — escavar o passado ilumina o presente.`
    }
    return `Esta semana ainda não registaste reflexões de identidade. A jornada do autoconhecimento começa com uma pergunta simples: "Quem sou eu hoje?" Vai ao Espelho Triplo e começa por aí.`
  }
}

export default function InsightsImago() {
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
    <div className="min-h-screen" style={{ background: '#1a1a2e' }}>
      <ModuleHeader eco="imago" title="Insights" subtitle="O teu mapa interior" compact />
      <div className="max-w-lg mx-auto px-5 py-6">
        {userId ? (
          <InsightEngine eco="imago" userId={userId} config={IMAGO_INSIGHTS_CONFIG} />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#8B7BA5] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
