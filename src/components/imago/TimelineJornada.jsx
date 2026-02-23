import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ============================================================
// IMAGO — Timeline da Jornada
// Timeline visual da jornada completa do utilizador
// atraves de todos os ecos
// Chakra: Sahasrara (Coroa)
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#1a1a2e'
const ACCENT_LIGHT = '#A898C0'
const ACCENT_SUBTLE = 'rgba(139,123,165,0.12)'

// Eco configurations with their visual identity
const ECOS_CONFIG = [
  { key: 'vitalis', name: 'Vitalis', table: 'vitalis_clients', color: '#7C8B6F', icon: '🌿' },
  { key: 'aurea', name: 'Aurea', table: 'aurea_clients', color: '#C4A265', icon: '✨' },
  { key: 'serena', name: 'Serena', table: 'serena_clients', color: '#6B8E9B', icon: '💧' },
  { key: 'ignis', name: 'Ignis', table: 'ignis_clients', color: '#C1634A', icon: '🔥' },
  { key: 'ventis', name: 'Ventis', table: 'ventis_clients', color: '#5D9B84', icon: '🍃' },
  { key: 'ecoa', name: 'Ecoa', table: 'ecoa_clients', color: '#4A90A4', icon: '🔊' },
  { key: 'imago', name: 'Imago', table: 'imago_clients', color: '#8B7BA5', icon: '🪞' }
]

// Time filter options
const TIME_FILTERS = [
  { key: '1m', label: '1 mes', days: 30 },
  { key: '3m', label: '3 meses', days: 90 },
  { key: '6m', label: '6 meses', days: 180 },
  { key: '12m', label: '12 meses', days: 365 }
]

// ---- Timeline event component ----
const TimelineEvent = ({ event, isLast }) => (
  <div className="flex gap-4">
    {/* Timeline line + dot */}
    <div className="flex flex-col items-center">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-lg"
        style={{ background: `${event.color}22`, border: `2px solid ${event.color}66` }}
        aria-hidden="true"
      >
        {event.icon}
      </div>
      {!isLast && (
        <div
          className="w-0.5 flex-1 min-h-[40px]"
          style={{ background: `linear-gradient(180deg, ${event.color}44 0%, rgba(255,255,255,0.05) 100%)` }}
        />
      )}
    </div>

    {/* Event content */}
    <div className="flex-1 pb-6">
      <div className="flex items-start justify-between">
        <div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${event.color}22`, color: event.color }}
          >
            {event.ecoName}
          </span>
          <p className="text-sm font-medium text-white mt-1.5">
            {event.description}
          </p>
        </div>
        <span className="text-xs text-gray-500 shrink-0 ml-3 mt-1">
          {new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      {event.detail && (
        <p className="text-xs text-gray-400 mt-1">{event.detail}</p>
      )}
    </div>
  </div>
)

// ---- Summary stat card ----
const StatCard = ({ value, label, icon }) => (
  <div
    className="flex-1 p-4 rounded-xl text-center"
    style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT}15` }}
  >
    <div className="text-lg mb-1" aria-hidden="true">{icon}</div>
    <p
      className="text-2xl font-bold text-white"
      style={{ fontFamily: 'var(--font-titulos)' }}
    >
      {value}
    </p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
  </div>
)

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function TimelineJornada() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('12m')
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({
    totalDays: 0,
    ecosActivos: 0,
    conquistas: 0
  })

  // Build timeline events from eco data
  const buildTimeline = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const allEvents = []
    let ecosWithData = 0
    let totalMilestones = 0
    let earliestDate = null

    // Query each eco's client table
    for (const eco of ECOS_CONFIG) {
      try {
        const { data, error } = await supabase
          .from(eco.table)
          .select('created_at, subscription_status, nivel_actual, fase_actual')
          .eq('user_id', userId)
          .maybeSingle()

        if (error || !data) continue

        ecosWithData++

        // Eco start event
        if (data.created_at) {
          const startDate = new Date(data.created_at)
          if (!earliestDate || startDate < earliestDate) {
            earliestDate = startDate
          }

          allEvents.push({
            date: data.created_at,
            ecoName: eco.name,
            color: eco.color,
            icon: eco.icon,
            description: `Inicio no ${eco.name}`,
            detail: data.subscription_status
              ? `Estado: ${data.subscription_status}`
              : null,
            sortKey: startDate.getTime()
          })
          totalMilestones++
        }

        // Level progression event
        if (data.nivel_actual && data.nivel_actual > 1) {
          allEvents.push({
            date: data.created_at, // approximate — we only have created_at
            ecoName: eco.name,
            color: eco.color,
            icon: eco.icon,
            description: `Nivel ${data.nivel_actual} no ${eco.name}`,
            detail: `${g('Progrediu', 'Progrediu')} ate ao nivel ${data.nivel_actual}`,
            sortKey: new Date(data.created_at).getTime() + 1
          })
          totalMilestones++
        }

        // Phase progression event (Vitalis-specific)
        if (data.fase_actual && data.fase_actual > 1) {
          allEvents.push({
            date: data.created_at,
            ecoName: eco.name,
            color: eco.color,
            icon: eco.icon,
            description: `Fase ${data.fase_actual} no ${eco.name}`,
            detail: `Avancou para a fase ${data.fase_actual}`,
            sortKey: new Date(data.created_at).getTime() + 2
          })
          totalMilestones++
        }

        // Active subscription milestone
        if (data.subscription_status === 'active') {
          allEvents.push({
            date: data.created_at,
            ecoName: eco.name,
            color: eco.color,
            icon: eco.icon,
            description: `Subscrição ${g('activo', 'activa')} no ${eco.name}`,
            detail: null,
            sortKey: new Date(data.created_at).getTime() + 3
          })
          totalMilestones++
        }
      } catch (err) {
        // Eco table may not exist or user has no data — that's fine
        console.debug(`Timeline: sem dados para ${eco.key}`, err.message)
      }
    }

    // Calculate stats
    const totalDays = earliestDate
      ? Math.max(1, Math.ceil((new Date() - earliestDate) / (1000 * 60 * 60 * 24)))
      : 0

    setStats({
      totalDays,
      ecosActivos: ecosWithData,
      conquistas: totalMilestones
    })

    // Sort by date (most recent first)
    allEvents.sort((a, b) => b.sortKey - a.sortKey)

    // Apply time filter
    const filterConfig = TIME_FILTERS.find(f => f.key === timeFilter)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (filterConfig?.days || 365))

    const filtered = allEvents.filter(e => new Date(e.date) >= cutoff)
    setEvents(filtered)
    setLoading(false)
  }, [userId, timeFilter])

  useEffect(() => {
    buildTimeline()
  }, [buildTimeline])

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="imago"
        title="Timeline da Jornada"
        subtitle="A tua historia de transformacao"
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* ===== SUMMARY STATS ===== */}
        <div className="flex gap-3 mt-4 mb-6">
          <StatCard
            value={stats.totalDays}
            label={stats.totalDays === 1 ? 'dia' : 'dias'}
            icon="📅"
          />
          <StatCard
            value={stats.ecosActivos}
            label={stats.ecosActivos === 1 ? 'eco activo' : 'ecos activos'}
            icon="🌀"
          />
          <StatCard
            value={stats.conquistas}
            label={stats.conquistas === 1 ? 'conquista' : 'conquistas'}
            icon="🏆"
          />
        </div>

        {/* ===== TIME FILTER BUTTONS ===== */}
        <div className="flex gap-2 mb-6">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${timeFilter === filter.key ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}
              `}
              style={
                timeFilter === filter.key
                  ? { background: `${ACCENT}33`, border: `1px solid ${ACCENT}55` }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid transparent' }
              }
              aria-pressed={timeFilter === filter.key}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* ===== TIMELINE ===== */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
            />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-0">
            {events.map((event, i) => (
              <TimelineEvent
                key={`${event.ecoName}-${event.sortKey}-${i}`}
                event={event}
                isLast={i === events.length - 1}
              />
            ))}

            {/* Timeline end marker */}
            <div className="flex gap-4 items-center pt-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.15)' }}
                aria-hidden="true"
              >
                ...
              </div>
              <p className="text-sm text-gray-500 italic">
                A tua jornada continua
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 space-y-4 animate-fadeIn">
            <div className="text-4xl" aria-hidden="true">🪞</div>
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              A tua timeline esta vazia
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              {stats.totalDays === 0
                ? 'Ainda nao comecaste nenhum eco. Quando o fizeres, a tua jornada aparecera aqui.'
                : `Nenhum evento encontrado nos ultimos ${TIME_FILTERS.find(f => f.key === timeFilter)?.label || '12 meses'}. Experimenta um periodo mais longo.`
              }
            </p>
            {stats.totalDays > 0 && timeFilter !== '12m' && (
              <button
                onClick={() => setTimeFilter('12m')}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Ver 12 meses
              </button>
            )}
          </div>
        )}

        {/* Active ecos legend */}
        {events.length > 0 && (
          <div className="mt-8 p-4 rounded-2xl" style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT}15` }}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Ecos na tua jornada
            </h4>
            <div className="flex flex-wrap gap-3">
              {ECOS_CONFIG.filter(eco =>
                events.some(e => e.ecoName === eco.name)
              ).map((eco) => (
                <div key={eco.key} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: eco.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-300">{eco.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
