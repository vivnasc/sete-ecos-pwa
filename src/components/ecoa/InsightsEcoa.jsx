import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import InsightEngine from '../shared/InsightEngine'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * INSIGHTS ECOA — Relatório semanal de voz e expressão
 * Métricas: micro-voz, vozes recuperadas, cartas, exercícios
 */

const ECOA_INSIGHTS_CONFIG = {
  period: 'weekly',
  title: 'Insights da Semana',
  metrics: [
    {
      id: 'micro_voz',
      label: 'Exercícios Micro-Voz',
      icon: '🗣️',
      table: 'ecoa_micro_voz_log',
      selectColumns: 'id, completed, created_at',
      analysis: (data) => {
        const completed = data.filter(d => d.completed !== false).length
        const count = data.length

        let insight = ''
        if (completed >= 7) insight = 'Voz em crescimento!'
        else if (completed >= 4) insight = 'Bom ritmo de prática'
        else if (completed > 0) insight = 'Cada micro-voz conta'

        return {
          value: completed,
          trend: completed >= 5 ? 'up' : completed >= 2 ? 'stable' : 'down',
          insight,
          extra: { total: count }
        }
      }
    },
    {
      id: 'vozes_recuperadas',
      label: 'Vozes recuperadas',
      icon: '💬',
      table: 'ecoa_voz_recuperada',
      selectColumns: 'id, topico, created_at',
      analysis: (data) => {
        const count = data.length
        const topicos = [...new Set(data.map(d => d.topico).filter(Boolean))]

        let insight = ''
        if (count >= 7) insight = 'A tua voz ressoa!'
        else if (count >= 3) insight = 'Cada voz recuperada é vitória'
        else if (count > 0) insight = 'O primeiro som é o mais corajoso'

        return {
          value: count,
          trend: count >= 5 ? 'up' : count >= 2 ? 'stable' : 'down',
          insight,
          extra: { topicos }
        }
      }
    },
    {
      id: 'cartas',
      label: 'Cartas escritas',
      icon: '📨',
      table: 'ecoa_cartas',
      selectColumns: 'id, libertada, created_at',
      analysis: (data) => {
        const count = data.length
        const libertadas = data.filter(d => d.libertada === true).length

        let insight = ''
        if (libertadas >= 3) insight = 'Palavras libertadas!'
        else if (count >= 3) insight = 'A escrita cura o silêncio'
        else if (count > 0) insight = 'Escrever já é falar'

        return {
          value: count,
          trend: count >= 3 ? 'up' : count >= 1 ? 'stable' : 'down',
          insight,
          extra: { libertadas }
        }
      }
    },
    {
      id: 'exercicios',
      label: 'Exercícios de expressão',
      icon: '🎤',
      table: 'ecoa_exercicios_log',
      selectColumns: 'id, created_at',
      analysis: (data, allData) => {
        // Combinar com comunicacao_log se disponível
        const exerciciosCount = data.length
        const comunicacaoCount = allData?.comunicacao?.length || 0
        const count = exerciciosCount + comunicacaoCount

        let insight = ''
        if (count >= 7) insight = 'Expressão fluida!'
        else if (count >= 3) insight = 'A prática fortalece a voz'
        else if (count > 0) insight = 'Cada exercício é um passo'

        return {
          value: count,
          trend: count >= 5 ? 'up' : count >= 2 ? 'stable' : 'down',
          insight,
          extra: { exercicios: exerciciosCount, comunicacao: comunicacaoCount }
        }
      },
      // Tabela extra para combinar (comunicação)
      extraTable: 'ecoa_comunicacao_log',
      extraKey: 'comunicacao',
      extraColumns: 'id, created_at'
    }
  ],
  generateInsight: (metricsData) => {
    const microVoz = metricsData.micro_voz || {}
    const vozes = metricsData.vozes_recuperadas || {}
    const cartas = metricsData.cartas || {}
    const exercicios = metricsData.exercicios || {}

    if (microVoz.value >= 5 && vozes.value >= 3) {
      return `Semana poderosa! ${microVoz.value} exercícios de Micro-Voz e ${vozes.value} vozes recuperadas. ${vozes.extra?.topicos?.length > 0 ? `Falaste sobre: ${vozes.extra.topicos.slice(0, 3).join(', ')}.` : ''} ${g('Estás a reconquistar', 'Estás a reconquistar')} a tua voz — como um eco que ganha força a cada repetição.`
    }
    if (microVoz.value >= 3) {
      return `Bom ritmo de prática vocal. ${microVoz.value} exercícios de Micro-Voz completados. ${cartas.value > 0 ? `Escreveste ${cartas.value} carta${cartas.value > 1 ? 's' : ''} — cada palavra escrita é uma voz libertada.` : 'Tenta escrever uma carta não enviada esta semana — a escrita é uma forma poderosa de voz.'}`
    }
    if (microVoz.value > 0 || vozes.value > 0) {
      return `Começaste a usar a tua voz esta semana — isso já é um acto de coragem. Como um eco que começa suave, a tua voz vai ganhando força com a prática. Tenta completar pelo menos 3 exercícios de Micro-Voz por semana.`
    }
    return 'Esta semana a tua voz ficou em silêncio. O eco precisa de som para existir. Vai ao Dashboard e faz o teu primeiro exercício de Micro-Voz — começa pelo mais simples. A tua voz merece ser ouvida.'
  }
}

export default function InsightsEcoa() {
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
    <div className="min-h-screen" style={{ background: '#1a2a34' }}>
      <ModuleHeader eco="ecoa" title="Insights Semanais" compact />
      <div className="max-w-lg mx-auto px-5 py-6">
        {userId ? (
          <InsightEngine eco="ecoa" userId={userId} config={ECOA_INSIGHTS_CONFIG} />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#4A90A4] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
