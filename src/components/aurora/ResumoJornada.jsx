import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'

// ============================================================
// AURORA — Resumo da Jornada
// Relatório completo com dados de TODOS os ecos activos
// ============================================================

const AURORA_COLOR = '#D4A5A5'

// Definição dos ecos e suas cores/ícones
const ECO_DEFINITIONS = [
  {
    key: 'vitalis',
    name: 'Vitalis',
    icon: '\uD83C\uDF31',
    color: '#7C8B6F',
    table: 'vitalis_clients',
    currencyName: 'Sementes',
    fields: ['fase_actual', 'peso_actual', 'peso_meta'],
    renderStats: (data) => {
      const stats = []
      if (data.fase_actual) stats.push({ label: 'Fase actual', value: data.fase_actual })
      if (data.peso_actual) stats.push({ label: 'Peso actual', value: `${data.peso_actual} kg` })
      if (data.peso_meta) stats.push({ label: 'Peso meta', value: `${data.peso_meta} kg` })
      if (data.peso_actual && data.peso_meta) {
        const diff = Math.abs(data.peso_actual - data.peso_meta).toFixed(1)
        const reached = data.peso_actual <= data.peso_meta
        stats.push({
          label: reached ? 'Meta alcancada!' : 'Falta',
          value: reached ? 'Sim' : `${diff} kg`
        })
      }
      return stats
    }
  },
  {
    key: 'aurea',
    name: 'Aurea',
    icon: '\u2728',
    color: '#C4A265',
    table: 'aurea_clients',
    currencyName: 'Diamantes',
    fields: ['nivel', 'diamantes_total'],
    renderStats: (data) => {
      const stats = []
      if (data.nivel) stats.push({ label: 'Nivel', value: data.nivel })
      if (data.diamantes_total != null) stats.push({ label: 'Diamantes', value: data.diamantes_total })
      return stats
    }
  },
  {
    key: 'serena',
    name: 'Serena',
    icon: '\uD83C\uDF0A',
    color: '#6B8E9B',
    table: 'serena_clients',
    currencyName: 'Gotas',
    fields: ['nivel', 'gotas_total'],
    renderStats: (data) => {
      const stats = []
      if (data.nivel) stats.push({ label: 'Nivel', value: data.nivel })
      if (data.gotas_total != null) stats.push({ label: 'Gotas', value: data.gotas_total })
      return stats
    }
  },
  {
    key: 'ignis',
    name: 'Ignis',
    icon: '\uD83D\uDD25',
    color: '#C1634A',
    table: 'ignis_clients',
    currencyName: 'Chamas',
    fields: ['nivel', 'chamas_total'],
    renderStats: (data) => {
      const stats = []
      if (data.nivel) stats.push({ label: 'Nivel', value: data.nivel })
      if (data.chamas_total != null) stats.push({ label: 'Chamas', value: data.chamas_total })
      return stats
    }
  },
  {
    key: 'ventis',
    name: 'Ventis',
    icon: '\uD83C\uDF43',
    color: '#5D9B84',
    table: 'ventis_clients',
    currencyName: 'Folhas',
    fields: ['nivel', 'folhas_total'],
    renderStats: (data) => {
      const stats = []
      if (data.nivel) stats.push({ label: 'Nivel', value: data.nivel })
      if (data.folhas_total != null) stats.push({ label: 'Folhas', value: data.folhas_total })
      return stats
    }
  },
  {
    key: 'ecoa',
    name: 'Ecoa',
    icon: '\uD83D\uDD0A',
    color: '#4A90A4',
    table: 'ecoa_clients',
    currencyName: 'Ecos',
    fields: ['nivel', 'ecos_total'],
    renderStats: (data) => {
      const stats = []
      if (data.nivel) stats.push({ label: 'Nivel', value: data.nivel })
      if (data.ecos_total != null) stats.push({ label: 'Ecos', value: data.ecos_total })
      return stats
    }
  },
  {
    key: 'imago',
    name: 'Imago',
    icon: '\u2B50',
    color: '#8B7BA5',
    table: 'imago_clients',
    currencyName: 'Estrelas',
    fields: ['nivel', 'estrelas_total'],
    renderStats: (data) => {
      const stats = []
      if (data.nivel) stats.push({ label: 'Nivel', value: data.nivel })
      if (data.estrelas_total != null) stats.push({ label: 'Estrelas', value: data.estrelas_total })
      return stats
    }
  }
]

export default function ResumoJornada() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [ecoData, setEcoData] = useState({})
  const [userCreatedAt, setUserCreatedAt] = useState(null)
  const [showPdfMsg, setShowPdfMsg] = useState(false)

  // Load all eco data
  useEffect(() => {
    if (!session?.user) return

    const loadAllData = async () => {
      try {
        // Get user record
        const { data: userData } = await supabase
          .from('users')
          .select('id, created_at')
          .eq('auth_id', session.user.id)
          .maybeSingle()

        if (!userData) {
          setLoading(false)
          return
        }

        setUserId(userData.id)
        setUserCreatedAt(userData.created_at)

        // Query all eco tables in parallel, each wrapped in try/catch
        const results = {}

        await Promise.all(
          ECO_DEFINITIONS.map(async (eco) => {
            try {
              const selectFields = ['subscription_status', 'created_at', ...eco.fields].join(', ')
              const { data, error } = await supabase
                .from(eco.table)
                .select(selectFields)
                .eq('user_id', userData.id)
                .maybeSingle()

              if (!error && data) {
                results[eco.key] = data
              }
            } catch (err) {
              console.error(`ResumoJornada: Erro ao carregar ${eco.key}:`, err)
            }
          })
        )

        setEcoData(results)
      } catch (error) {
        console.error('ResumoJornada: Erro geral:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [session])

  // Calculate journey stats
  const activeEcos = ECO_DEFINITIONS.filter(eco => ecoData[eco.key])
  const totalEcos = activeEcos.length

  const journeyDays = userCreatedAt
    ? Math.max(1, Math.ceil((new Date() - new Date(userCreatedAt)) / (24 * 60 * 60 * 1000)))
    : 0

  const handleExportPdf = useCallback(() => {
    setShowPdfMsg(true)
    setTimeout(() => setShowPdfMsg(false), 4000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${AURORA_COLOR}40`, borderTopColor: AURORA_COLOR }}
          />
          <p className="text-gray-500">A carregar a tua jornada...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <ModuleHeader
        eco="aurora"
        title="Resumo da Jornada"
        subtitle="Relatório completo da tua transformação"
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ======= Header Stats ======= */}
        <div
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${AURORA_COLOR} 0%, ${AURORA_COLOR}dd 50%, #2e1a1a 100%)` }}
        >
          <h2
            className="text-xl font-bold mb-4 text-center"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            A Tua Jornada
          </h2>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{journeyDays}</p>
              <p className="text-white/70 text-xs mt-1">
                {journeyDays === 1 ? 'dia' : 'dias'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totalEcos}</p>
              <p className="text-white/70 text-xs mt-1">
                {totalEcos === 1 ? 'eco' : 'ecos'} {g('activos', 'activos')}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">7</p>
              <p className="text-white/70 text-xs mt-1">
                ecos {g('disponiveis', 'disponiveis')}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-white/70">Progresso geral</span>
              <span className="text-xs text-white/70">{totalEcos}/7 ecos</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.round((totalEcos / 7) * 100)}%`,
                  backgroundColor: 'white'
                }}
              />
            </div>
          </div>
        </div>

        {/* ======= Per-Eco Section Cards ======= */}
        {totalEcos === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
            <p className="text-4xl mb-4" aria-hidden="true">{'\uD83C\uDF05'}</p>
            <h3
              className="text-lg font-bold text-gray-800 mb-2"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              A tua jornada está a começar
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Ainda não tens ecos activos. Quando {g('começares', 'começares')} a explorar os diferentes ecos,
              o teu resumo aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <h3
              className="text-lg font-bold text-gray-800"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Os Teus Ecos
            </h3>

            {ECO_DEFINITIONS.map(eco => {
              const data = ecoData[eco.key]
              if (!data) return null

              const stats = eco.renderStats(data)
              const memberSince = data.created_at
                ? new Date(data.created_at).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : null

              const isActive = ['active', 'trial', 'tester'].includes(data.subscription_status)

              return (
                <div
                  key={eco.key}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Eco header bar */}
                  <div
                    className="flex items-center gap-3 px-5 py-4"
                    style={{ borderBottom: `3px solid ${eco.color}` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${eco.color}20` }}
                      aria-hidden="true"
                    >
                      {eco.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800">{eco.name}</h4>
                      {memberSince && (
                        <p className="text-xs text-gray-400">
                          Membro desde {memberSince}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 bg-gray-100'
                      }`}
                      style={isActive ? { backgroundColor: eco.color } : undefined}
                    >
                      {isActive ? g('Activo', 'Activa') : data.subscription_status || 'N/A'}
                    </span>
                  </div>

                  {/* Stats grid */}
                  {stats.length > 0 && (
                    <div className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${eco.color}08` }}
                          >
                            <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                            <p
                              className="text-lg font-bold"
                              style={{ color: eco.color }}
                            >
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Currency info */}
                  {stats.length === 0 && (
                    <div className="px-5 py-4">
                      <p className="text-sm text-gray-400 italic">
                        {g('Começa', 'Começa')} a explorar {eco.name} para ver as tuas estatísticas.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Inactive ecos summary */}
            {(() => {
              const inactiveEcos = ECO_DEFINITIONS.filter(eco => !ecoData[eco.key])
              if (inactiveEcos.length === 0) return null

              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">
                    Ecos por explorar ({inactiveEcos.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {inactiveEcos.map(eco => (
                      <span
                        key={eco.key}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${eco.color}12`, color: eco.color }}
                      >
                        <span aria-hidden="true">{eco.icon}</span>
                        {eco.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ======= Evolução Global ======= */}
        {totalEcos > 0 && (
          <div
            className="rounded-2xl p-6 mb-6 border"
            style={{ borderColor: `${AURORA_COLOR}30`, backgroundColor: `${AURORA_COLOR}08` }}
          >
            <h3
              className="text-lg font-bold text-gray-800 mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Evolução Global
            </h3>

            <div className="space-y-4">
              {/* Journey timeline visual */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {ECO_DEFINITIONS.map(eco => {
                  const isActive = !!ecoData[eco.key]
                  return (
                    <div
                      key={eco.key}
                      className={`flex flex-col items-center gap-1.5 min-w-[60px] ${
                        isActive ? '' : 'opacity-30'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all"
                        style={{
                          backgroundColor: isActive ? `${eco.color}25` : '#f3f4f6',
                          border: isActive ? `2px solid ${eco.color}` : '2px solid #e5e7eb'
                        }}
                        aria-hidden="true"
                      >
                        {eco.icon}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{eco.name}</span>
                    </div>
                  )
                })}
              </div>

              {/* Summary text */}
              <div className="pt-3 border-t" style={{ borderColor: `${AURORA_COLOR}20` }}>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {totalEcos === 7
                    ? g(
                        'Parabéns! Completaste todos os 7 ecos. A tua transformação é total.',
                        'Parabéns! Completaste todos os 7 ecos. A tua transformação é total.'
                      )
                    : totalEcos >= 4
                      ? g(
                          `Já estás em ${totalEcos} ecos. A tua jornada de transformação está a avançar com força.`,
                          `Já estás em ${totalEcos} ecos. A tua jornada de transformação está a avançar com força.`
                        )
                      : g(
                          `Começaste ${totalEcos} ${totalEcos === 1 ? 'eco' : 'ecos'}. Cada passo conta na tua transformação.`,
                          `Começaste ${totalEcos} ${totalEcos === 1 ? 'eco' : 'ecos'}. Cada passo conta na tua transformação.`
                        )}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {journeyDays} {journeyDays === 1 ? 'dia' : 'dias'} de jornada
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======= Export PDF Button (placeholder) ======= */}
        <button
          onClick={handleExportPdf}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all shadow-lg"
          style={{ backgroundColor: AURORA_COLOR }}
        >
          Exportar como PDF
        </button>

        {showPdfMsg && (
          <div
            className="mt-3 p-4 rounded-xl text-center"
            style={{ backgroundColor: `${AURORA_COLOR}15`, border: `1px solid ${AURORA_COLOR}30` }}
          >
            <p className="text-sm font-medium" style={{ color: AURORA_COLOR }}>
              A exportação em PDF está a ser desenvolvida e estará {g('disponível', 'disponível')} em breve.
            </p>
          </div>
        )}

        {/* Motivational footer */}
        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          {g(
            'Cada eco que percorres é um passo na tua transformação.',
            'Cada eco que percorres é um passo na tua transformação.'
          )}
        </p>
      </div>
    </div>
  )
}
