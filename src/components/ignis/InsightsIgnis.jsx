import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS IGNIS — Relatório semanal de vontade e direcção
 * Métricas: escolhas, foco, dispersão, conquistas
 */

const IGNIS_INSIGHTS_CONFIG = {
  period: 'weekly',
  title: 'Insights da Semana',
  metrics: [
    {
      id: 'escolhas',
      label: 'Escolhas conscientes',
      icon: '🎯',
      table: 'ignis_escolhas',
      selectColumns: 'id, escolha, concluida, valor_alinhado, created_at',
      analysis: (data) => {
        const count = data.length
        const concluidas = data.filter(d => d.concluida).length
        const alinhadas = data.filter(d => d.valor_alinhado).length
        const taxaAlinhamento = count > 0 ? Math.round((alinhadas / count) * 100) : 0

        let insight = ''
        if (count >= 21) insight = 'Consistência excepcional!'
        else if (count >= 14) insight = 'Bom ritmo de escolhas'
        else if (count >= 7) insight = 'Uma escolha por dia — bom começo'
        else if (count > 0) insight = 'Tenta registar mais escolhas'

        return {
          value: count,
          trend: count >= 14 ? 'up' : count >= 7 ? 'stable' : 'down',
          insight,
          extra: { concluidas, taxaAlinhamento }
        }
      }
    },
    {
      id: 'foco',
      label: 'Sessões de foco',
      icon: '🧠',
      table: 'ignis_foco_sessions',
      selectColumns: 'id, duracao_minutos, nivel_foco, created_at',
      analysis: (data) => {
        const count = data.length
        const totalMinutos = data.reduce((sum, d) => sum + (d.duracao_minutos || 0), 0)
        const avgFoco = count > 0
          ? Math.round(data.reduce((sum, d) => sum + (d.nivel_foco || 5), 0) / count)
          : 0

        let insight = ''
        if (totalMinutos >= 120) insight = 'Foco profundo!'
        else if (totalMinutos >= 60) insight = 'Bom tempo de foco'
        else if (count > 0) insight = 'Tenta aumentar a duração'

        return {
          value: count,
          trend: count >= 5 ? 'up' : count >= 2 ? 'stable' : 'down',
          insight,
          extra: { totalMinutos, avgFoco }
        }
      }
    },
    {
      id: 'dispersao',
      label: 'Dispersões registadas',
      icon: '🌪️',
      table: 'ignis_dispersao_log',
      selectColumns: 'id, disse_sim_queria_nao, created_at',
      analysis: (data) => {
        const count = data.length
        const simQueriaNao = data.filter(d => d.disse_sim_queria_nao).length
        const percentagemSimQueriaNao = count > 0 ? Math.round((simQueriaNao / count) * 100) : 0

        let insight = ''
        if (count > 0 && percentagemSimQueriaNao < 30) insight = 'Menos "sim queria não" — bom sinal!'
        else if (count > 0 && percentagemSimQueriaNao >= 50) insight = 'Muitos "sim" quando querias "não"'
        else if (count > 0) insight = 'Registar dispersões traz consciência'

        return {
          value: count,
          trend: count > 0 && percentagemSimQueriaNao < 30 ? 'up' : count > 0 ? 'stable' : 'down',
          insight,
          extra: { simQueriaNao, percentagemSimQueriaNao }
        }
      }
    },
    {
      id: 'conquistas',
      label: 'Conquistas registadas',
      icon: '🏆',
      table: 'ignis_conquistas_log',
      selectColumns: 'id, created_at',
      analysis: (data) => ({
        value: data.length,
        trend: data.length >= 5 ? 'up' : data.length >= 2 ? 'stable' : 'down',
        insight: data.length >= 7 ? 'Uma conquista por dia!' : data.length > 0 ? 'Celebra as tuas vitórias' : ''
      })
    }
  ],
  generateInsight: (metricsData) => {
    const escolhas = metricsData.escolhas || {}
    const foco = metricsData.foco || {}
    const dispersao = metricsData.dispersao || {}
    const conquistas = metricsData.conquistas || {}

    if (escolhas.value >= 14 && foco.value >= 3) {
      return `Semana de fogo! ${escolhas.value} escolhas conscientes e ${foco.value} sessões de foco (${foco.extra?.totalMinutos || 0} min total). ${escolhas.extra?.taxaAlinhamento > 50 ? `${escolhas.extra.taxaAlinhamento}% das escolhas alinhadas com valores — excelente!` : ''} ${g('Estás alinhado', 'Estás alinhada')} com o teu fogo interior.`
    }
    if (escolhas.value >= 7) {
      return `Bom ritmo de escolhas conscientes. ${dispersao.value > 0 ? `Registaste ${dispersao.value} dispersões — ${dispersao.extra?.percentagemSimQueriaNao || 0}% foram "sim queria não". Cada registo é consciência.` : 'Tenta registar também as dispersões — saber o que te desvia é tão importante quanto saber o que escolhes.'}`
    }
    if (escolhas.value > 0) {
      return `Começaste a semana com ${escolhas.value} escolhas conscientes. O fogo acende-se devagar — mas acende-se. Tenta definir 3 escolhas todas as manhãs. A consistência alimenta a chama.`
    }
    return 'Esta semana ainda não registaste escolhas conscientes. O fogo precisa de lenha — vai ao Dashboard e define as tuas escolhas de hoje. Uma só já é um começo.'
  }
}

export default function InsightsIgnis() {
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
    <div className="min-h-screen" style={{ background: '#2e1a14' }}>
      <ModuleHeader eco="ignis" title="Insights Semanais" compact />
      <div className="max-w-lg mx-auto px-5 py-6">
        {userId ? (
          <InsightEngine eco="ignis" userId={userId} config={IGNIS_INSIGHTS_CONFIG} />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C1634A] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
