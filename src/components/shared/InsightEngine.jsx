import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'

/**
 * INSIGHT ENGINE — Sistema generico de insights/relatorios para qualquer eco
 *
 * Gera insights semanais ou mensais baseados nos dados do utilizador.
 * Cada eco define as suas proprias metricas e analises.
 *
 * Uso:
 * <InsightEngine
 *   eco="serena"
 *   userId={userId}
 *   config={{
 *     period: 'weekly',
 *     title: 'Insights da Semana',
 *     metrics: [
 *       {
 *         id: 'emocoes',
 *         label: 'Emocoes Registadas',
 *         table: 'serena_emocoes_log',
 *         countColumn: 'id',
 *         icon: '📊',
 *         analysis: (data) => ({ value: data.length, trend: 'up', insight: '...' })
 *       }
 *     ],
 *     generateInsight: (metricsData) => '...'
 *   }}
 * />
 */

function getDateRange(period) {
  const now = new Date()
  const start = new Date()

  if (period === 'weekly') {
    start.setDate(now.getDate() - 7)
  } else if (period === 'monthly') {
    start.setMonth(now.getMonth() - 1)
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
    label: period === 'weekly' ? 'esta semana' : 'este mes'
  }
}

function TrendArrow({ trend }) {
  if (trend === 'up') return <span className="text-green-400 text-sm">&#9650;</span>
  if (trend === 'down') return <span className="text-red-400 text-sm">&#9660;</span>
  return <span className="text-white/30 text-sm">&#9644;</span>
}

export default function InsightEngine({ eco, userId, config }) {
  const [metricsData, setMetricsData] = useState({})
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState('')
  const theme = getEcoTheme(eco)
  const range = getDateRange(config.period)

  useEffect(() => {
    if (!userId) return
    fetchMetrics()
  }, [userId])

  const fetchMetrics = async () => {
    try {
      const results = {}

      for (const metric of config.metrics) {
        const { data, error } = await supabase
          .from(metric.table)
          .select(metric.selectColumns || '*')
          .eq('user_id', userId)
          .gte('created_at', range.start)
          .lte('created_at', range.end)
          .order('created_at', { ascending: true })

        if (!error) {
          const analysis = metric.analysis ? metric.analysis(data || []) : {
            value: data?.length || 0,
            trend: 'stable',
            insight: ''
          }
          results[metric.id] = { ...analysis, rawData: data, config: metric }
        }
      }

      setMetricsData(results)

      // Gerar insight geral
      if (config.generateInsight) {
        setInsight(config.generateInsight(results))
      }
    } catch (error) {
      console.error(`InsightEngine(${eco}):`, error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  const metrics = config.metrics || []
  const hasData = Object.values(metricsData).some(m => m.value > 0)

  return (
    <div className="space-y-6">
      {/* Titulo */}
      <div>
        <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {config.title || `Insights ${range.label}`}
        </h2>
        <p className="text-white/40 text-sm mt-1">{range.label}</p>
      </div>

      {!hasData ? (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-white/60 text-sm">
            Ainda sem dados suficientes {range.label}.
          </p>
          <p className="text-white/30 text-xs mt-2">
            Continua a usar o {theme.name} e os insights vao aparecer aqui.
          </p>
        </div>
      ) : (
        <>
          {/* Metricas grid */}
          <div className={`grid gap-3 ${metrics.length <= 2 ? 'grid-cols-2' : metrics.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {metrics.map((metric) => {
              const data = metricsData[metric.id] || { value: 0, trend: 'stable' }
              return (
                <div
                  key={metric.id}
                  className="bg-white/5 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{metric.icon}</span>
                    <TrendArrow trend={data.trend} />
                  </div>
                  <p className="text-white text-2xl font-bold">{data.value}</p>
                  <p className="text-white/40 text-xs">{metric.label}</p>
                  {data.insight && (
                    <p className="text-white/50 text-xs mt-1 italic">{data.insight}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Insight geral */}
          {insight && (
            <div
              className="rounded-2xl p-5"
              style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}25` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-white/80 text-sm leading-relaxed">{insight}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
