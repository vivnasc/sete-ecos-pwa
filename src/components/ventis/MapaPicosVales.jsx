import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ============================================================
// VENTIS — Mapa de Picos e Vales
// Eco da Energia & Ritmo (Anahata)
// Identifica quando tens mais e menos energia
// ============================================================

const VENTIS = '#5D9B84'
const VENTIS_DARK = '#1a2e24'
const VENTIS_LIGHT = '#7DB8A2'
const VENTIS_GLOW = 'rgba(93,155,132,0.15)'

const HEADING_FONT = "'Cormorant Garamond', serif"

// Period mapping to approximate hours
const PERIODO_HOURS = {
  manha: { start: 6, end: 12, label: '6h-12h', midLabel: '9h' },
  tarde: { start: 12, end: 18, label: '12h-18h', midLabel: '15h' },
  noite: { start: 18, end: 22, label: '18h-22h', midLabel: '20h' }
}

const PERIOD_ORDER = ['manha', 'tarde', 'noite']

// ---- Icons (inline SVGs) ----
const WindIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
)

const TrendUpIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
)

const TrendDownIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
)

const LightbulbIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <path d="M9 18h6m-5 4h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
  </svg>
)

const CalendarIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

// ---- Date utilities ----
const getWeekDates = (offsetWeeks = 0) => {
  const now = new Date()
  now.setDate(now.getDate() - (offsetWeeks * 7))
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

// ---- Energy color by percentage ----
const getEnergyColor = (pct) => {
  if (pct > 70) return '#22c55e'
  if (pct >= 40) return '#eab308'
  return '#ef4444'
}

// ==========================
// SECTION: Data Insufficient Message
// ==========================
const DataInsufficient = ({ daysCount }) => (
  <div className="text-center py-12 px-6 space-y-5">
    <div
      className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
      style={{ background: VENTIS_GLOW }}
    >
      <CalendarIcon className="w-8 h-8" style={{ color: VENTIS_LIGHT }} />
    </div>

    <div className="space-y-3">
      <h2
        className="text-xl font-semibold text-white"
        style={{ fontFamily: HEADING_FONT }}
      >
        A mapear o teu ritmo...
      </h2>
      <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
        Preciso de 2 semanas de dados para mapear os teus picos e vales.
        Continua a registar energia 3x/dia!
      </p>
    </div>

    {/* Progress toward 14 days */}
    <div className="max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Progresso</span>
        <span className="text-xs font-medium" style={{ color: VENTIS }}>
          {daysCount} de 14 dias
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min((daysCount / 14) * 100, 100)}%`,
            background: `linear-gradient(90deg, ${VENTIS}88, ${VENTIS})`
          }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-2 italic">
        Faltam {Math.max(14 - daysCount, 0)} dias
      </p>
    </div>
  </div>
)

// ==========================
// SECTION: Energy Timeline
// ==========================
const EnergyTimeline = ({ periodAverages, peakPeriod, valleyPeriod }) => {
  // Timeline from 6h to 22h
  const timelinePoints = [
    { hour: 6, label: '6h' },
    { hour: 9, label: '9h' },
    { hour: 12, label: '12h' },
    { hour: 15, label: '15h' },
    { hour: 18, label: '18h' },
    { hour: 21, label: '21h' },
    { hour: 22, label: '22h' }
  ]

  // Map periods to interpolated energy values along the timeline
  const energyPoints = useMemo(() => {
    const manhaAvg = periodAverages.manha || 0
    const tardeAvg = periodAverages.tarde || 0
    const noiteAvg = periodAverages.noite || 0

    // Create energy curve with interpolation between periods
    return [
      { hour: 6, energy: manhaAvg * 0.7 },    // waking up
      { hour: 8, energy: manhaAvg * 0.9 },
      { hour: 10, energy: manhaAvg },           // manha peak
      { hour: 12, energy: (manhaAvg + tardeAvg) / 2 }, // transition
      { hour: 14, energy: tardeAvg * 0.95 },
      { hour: 15, energy: tardeAvg },           // tarde center
      { hour: 17, energy: (tardeAvg + noiteAvg) / 2 }, // transition
      { hour: 19, energy: noiteAvg },           // noite center
      { hour: 21, energy: noiteAvg * 0.8 },
      { hour: 22, energy: noiteAvg * 0.6 }     // winding down
    ]
  }, [periodAverages])

  const maxEnergy = Math.max(...energyPoints.map(p => p.energy), 1)
  const chartHeight = 120
  const chartWidth = 280 // viewBox width

  // Generate SVG path points
  const svgPoints = useMemo(() => {
    return energyPoints.map(point => {
      const x = ((point.hour - 6) / 16) * chartWidth
      const y = chartHeight - (point.energy / maxEnergy) * (chartHeight - 10)
      return { x, y, hour: point.hour, energy: point.energy }
    })
  }, [energyPoints, maxEnergy])

  // Create smooth path using cubic bezier
  const pathD = useMemo(() => {
    if (svgPoints.length < 2) return ''
    let d = `M ${svgPoints[0].x} ${svgPoints[0].y}`
    for (let i = 1; i < svgPoints.length; i++) {
      const prev = svgPoints[i - 1]
      const curr = svgPoints[i]
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4
      const cpx2 = curr.x - (curr.x - prev.x) * 0.4
      d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }, [svgPoints])

  // Area fill path
  const areaD = useMemo(() => {
    if (!pathD) return ''
    return `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${chartHeight} L ${svgPoints[0].x} ${chartHeight} Z`
  }, [pathD, svgPoints])

  // Peak and valley markers
  const peakX = peakPeriod ? ((PERIODO_HOURS[peakPeriod].start + PERIODO_HOURS[peakPeriod].end) / 2 - 6) / 16 * chartWidth : 0
  const peakY = peakPeriod ? chartHeight - (periodAverages[peakPeriod] / maxEnergy) * (chartHeight - 10) : 0
  const valleyX = valleyPeriod ? ((PERIODO_HOURS[valleyPeriod].start + PERIODO_HOURS[valleyPeriod].end) / 2 - 6) / 16 * chartWidth : 0
  const valleyY = valleyPeriod ? chartHeight - (periodAverages[valleyPeriod] / maxEnergy) * (chartHeight - 10) : 0

  return (
    <div className="space-y-4">
      <h3
        className="text-base font-semibold text-white"
        style={{ fontFamily: HEADING_FONT }}
      >
        Mapa de Energia
      </h3>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 25}`}
          className="w-full"
          aria-label="Curva de energia ao longo do dia"
          role="img"
        >
          {/* Grid lines */}
          {[25, 50, 75].map(pct => {
            const y = chartHeight - (pct / 100) * (chartHeight - 10)
            return (
              <line
                key={pct}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Area fill */}
          <path
            d={areaD}
            fill={`url(#ventis-gradient)`}
            opacity="0.3"
          />

          {/* Curve line */}
          <path
            d={pathD}
            fill="none"
            stroke={VENTIS}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="ventis-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VENTIS} stopOpacity="0.4" />
              <stop offset="100%" stopColor={VENTIS} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Peak marker */}
          {peakPeriod && (
            <>
              <circle cx={peakX} cy={peakY} r="6" fill={VENTIS} stroke="white" strokeWidth="2" />
              <text
                x={peakX}
                y={peakY - 14}
                textAnchor="middle"
                className="text-xs"
                fill="white"
                fontSize="10"
              >
                {'\uD83D\uDD06'}
              </text>
            </>
          )}

          {/* Valley marker */}
          {valleyPeriod && (
            <>
              <circle cx={valleyX} cy={valleyY} r="6" fill="#f59e0b" stroke="white" strokeWidth="2" />
              <text
                x={valleyX}
                y={valleyY - 14}
                textAnchor="middle"
                className="text-xs"
                fill="white"
                fontSize="10"
              >
                {'\uD83C\uDF19'}
              </text>
            </>
          )}

          {/* Time labels */}
          {[
            { hour: 6, label: '6h' },
            { hour: 9, label: '9h' },
            { hour: 12, label: '12h' },
            { hour: 15, label: '15h' },
            { hour: 18, label: '18h' },
            { hour: 22, label: '22h' }
          ].map(t => (
            <text
              key={t.hour}
              x={((t.hour - 6) / 16) * chartWidth}
              y={chartHeight + 16}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
            >
              {t.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Period averages */}
      <div className="grid grid-cols-3 gap-2">
        {PERIOD_ORDER.map(periodo => {
          const avg = periodAverages[periodo] || 0
          const isPeak = periodo === peakPeriod
          const isValley = periodo === valleyPeriod
          const label = { manha: 'Manha', tarde: 'Tarde', noite: 'Noite' }[periodo]

          return (
            <div
              key={periodo}
              className="p-3 rounded-xl text-center relative"
              style={{
                background: isPeak
                  ? `${VENTIS}15`
                  : isValley
                    ? 'rgba(245,158,11,0.1)'
                    : 'rgba(255,255,255,0.04)',
                border: isPeak
                  ? `1px solid ${VENTIS}33`
                  : isValley
                    ? '1px solid rgba(245,158,11,0.2)'
                    : '1px solid transparent'
              }}
            >
              {isPeak && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm" aria-label="Pico">
                  {'\uD83D\uDD06'}
                </span>
              )}
              {isValley && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm" aria-label="Vale">
                  {'\uD83C\uDF19'}
                </span>
              )}
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p
                className="text-xl font-bold"
                style={{ color: getEnergyColor(avg), fontFamily: HEADING_FONT }}
              >
                {Math.round(avg)}%
              </p>
              <p className="text-xs text-gray-500">
                {PERIODO_HOURS[periodo].label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==========================
// SECTION: Peak & Valley Cards
// ==========================
const PeakValleyCards = ({ peakPeriod, valleyPeriod, periodAverages }) => {
  const peakHours = peakPeriod ? PERIODO_HOURS[peakPeriod] : null
  const valleyHours = valleyPeriod ? PERIODO_HOURS[valleyPeriod] : null

  return (
    <div className="space-y-3">
      {/* Peak card */}
      {peakHours && (
        <div className="p-5 rounded-2xl" style={{ background: `${VENTIS}10`, border: `1px solid ${VENTIS}22` }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">{'\uD83D\uDD06'}</span>
            <h3
              className="text-base font-semibold text-white"
              style={{ fontFamily: HEADING_FONT }}
            >
              O teu pico
            </h3>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: VENTIS, fontFamily: HEADING_FONT }}>
            {peakHours.label}
          </p>
          <p className="text-sm text-gray-400">
            A tua energia e mais alta entre as {peakHours.start}h e as {peakHours.end}h.
            Energia media: {Math.round(periodAverages[peakPeriod])}%.
          </p>
        </div>
      )}

      {/* Valley card */}
      {valleyHours && (
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">{'\uD83C\uDF19'}</span>
            <h3
              className="text-base font-semibold text-white"
              style={{ fontFamily: HEADING_FONT }}
            >
              O teu vale
            </h3>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#f59e0b', fontFamily: HEADING_FONT }}>
            {valleyHours.label}
          </p>
          <p className="text-sm text-gray-400">
            A tua energia e mais baixa entre as {valleyHours.start}h e as {valleyHours.end}h.
            Energia media: {Math.round(periodAverages[valleyPeriod])}%.
          </p>
        </div>
      )}
    </div>
  )
}

// ==========================
// SECTION: Suggestions
// ==========================
const Suggestions = ({ peakPeriod, valleyPeriod }) => {
  const peakHours = peakPeriod ? PERIODO_HOURS[peakPeriod] : null
  const valleyHours = valleyPeriod ? PERIODO_HOURS[valleyPeriod] : null

  if (!peakHours || !valleyHours) return null

  const suggestions = [
    {
      icon: '\uD83C\uDFAF',
      text: `Agenda tarefas dificeis para o teu pico (${peakHours.label})`
    },
    {
      icon: '\uD83C\uDF3F',
      text: `No vale (${valleyHours.label}), faz pausas, tarefas leves, ou movimento suave`
    },
    {
      icon: '\u26A0\uFE0F',
      text: `Evita decisoes importantes no vale`
    },
    {
      icon: '\uD83D\uDCA1',
      text: peakPeriod === 'manha'
        ? 'Aproveita as manhas para trabalho criativo e estrategico'
        : peakPeriod === 'tarde'
          ? 'A tarde e o teu momento — usa para as tarefas que exigem mais foco'
          : 'A noite e o teu pico — ideal para reflexao profunda e criatividade'
    }
  ]

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-4">
        <LightbulbIcon className="w-4 h-4" style={{ color: VENTIS_LIGHT }} />
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: HEADING_FONT }}
        >
          Sugestoes para o teu ritmo
        </h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="text-base shrink-0 mt-0.5" aria-hidden="true">{s.icon}</span>
            <p className="text-sm text-gray-300 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================
// SECTION: Weekly Comparison
// ==========================
const WeeklyComparison = ({ currentPeriodAvgs, previousPeriodAvgs, peakPeriod, valleyPeriod }) => {
  if (!previousPeriodAvgs || !peakPeriod || !valleyPeriod) return null

  const peakCurrent = currentPeriodAvgs[peakPeriod] || 0
  const peakPrevious = previousPeriodAvgs[peakPeriod] || 0
  const valleyCurrent = currentPeriodAvgs[valleyPeriod] || 0
  const valleyPrevious = previousPeriodAvgs[valleyPeriod] || 0

  const peakDiff = Math.round(peakCurrent - peakPrevious)
  const valleyDiff = Math.round(valleyCurrent - valleyPrevious)

  const hasPreviousData = peakPrevious > 0 || valleyPrevious > 0
  if (!hasPreviousData) return null

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-4 h-4" style={{ color: VENTIS_LIGHT }} />
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: HEADING_FONT }}
        >
          Esta semana vs anterior
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Peak comparison */}
        <div className="p-3 rounded-xl" style={{ background: `${VENTIS}08` }}>
          <p className="text-xs text-gray-500 mb-1">
            Pico ({PERIODO_HOURS[peakPeriod].label})
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: VENTIS, fontFamily: HEADING_FONT }}
            >
              {Math.round(peakCurrent)}%
            </span>
            {peakDiff !== 0 && (
              <div className={`flex items-center gap-0.5 text-xs ${peakDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {peakDiff > 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                {peakDiff > 0 ? '+' : ''}{peakDiff}%
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {peakDiff > 0
              ? 'Pico mais forte!'
              : peakDiff < 0
                ? 'Pico mais fraco'
                : 'Pico estavel'
            }
          </p>
        </div>

        {/* Valley comparison */}
        <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)' }}>
          <p className="text-xs text-gray-500 mb-1">
            Vale ({PERIODO_HOURS[valleyPeriod].label})
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: '#f59e0b', fontFamily: HEADING_FONT }}
            >
              {Math.round(valleyCurrent)}%
            </span>
            {valleyDiff !== 0 && (
              <div className={`flex items-center gap-0.5 text-xs ${valleyDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {valleyDiff > 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                {valleyDiff > 0 ? '+' : ''}{valleyDiff}%
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {valleyDiff > 0
              ? 'Vale menos profundo'
              : valleyDiff < 0
                ? 'Vale mais profundo'
                : 'Vale estavel'
            }
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs text-gray-400 italic leading-relaxed">
          {peakDiff > 0 && valleyDiff > 0
            ? `${g('Estas mais energetico', 'Estas mais energetica')} em geral esta semana — tanto o pico como o vale subiram. Bom sinal!`
            : peakDiff > 0 && valleyDiff <= 0
              ? 'O teu pico esta mais forte, mas o vale aprofundou. Tenta equilibrar com pausas estrategicas.'
              : peakDiff <= 0 && valleyDiff > 0
                ? 'O vale esta menos profundo — mais estabilidade. O pico pode precisar de mais estimulo.'
                : peakDiff < 0 && valleyDiff < 0
                  ? 'A energia geral desceu esta semana. Verifica sono, hidratacao e movimento.'
                  : 'Ritmo estavel em relacao a semana anterior. Consistencia e poder.'
          }
        </p>
      </div>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function MapaPicosVales() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [energiaLogs, setEnergiaLogs] = useState([])

  // Fetch last 30 days of energy data
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const startDate = thirtyDaysAgo.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('ventis_energia_log')
        .select('id, data, periodo, energia, created_at')
        .eq('user_id', userId)
        .gte('data', startDate)
        .order('data', { ascending: true })

      if (error) throw error
      setEnergiaLogs(data || [])
    } catch (err) {
      console.error('Erro ao carregar dados de energia Ventis:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Count unique days with data
  const uniqueDays = useMemo(() => {
    return new Set(energiaLogs.map(l => l.data)).size
  }, [energiaLogs])

  const hasEnoughData = uniqueDays >= 14

  // Calculate period averages (all data)
  const periodAverages = useMemo(() => {
    const avgs = {}
    PERIOD_ORDER.forEach(periodo => {
      const logs = energiaLogs.filter(l => l.periodo === periodo)
      avgs[periodo] = logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.energia || 0), 0) / logs.length
        : 0
    })
    return avgs
  }, [energiaLogs])

  // Identify peak and valley
  const { peakPeriod, valleyPeriod } = useMemo(() => {
    if (!hasEnoughData) return { peakPeriod: null, valleyPeriod: null }

    const entries = Object.entries(periodAverages).filter(([, avg]) => avg > 0)
    if (entries.length < 2) return { peakPeriod: null, valleyPeriod: null }

    const sorted = entries.sort((a, b) => b[1] - a[1])
    return {
      peakPeriod: sorted[0][0],
      valleyPeriod: sorted[sorted.length - 1][0]
    }
  }, [periodAverages, hasEnoughData])

  // Current week period averages
  const currentWeekDates = useMemo(() => getWeekDates(0), [])
  const currentPeriodAvgs = useMemo(() => {
    const avgs = {}
    PERIOD_ORDER.forEach(periodo => {
      const logs = energiaLogs.filter(l => currentWeekDates.includes(l.data) && l.periodo === periodo)
      avgs[periodo] = logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.energia || 0), 0) / logs.length
        : 0
    })
    return avgs
  }, [energiaLogs, currentWeekDates])

  // Previous week period averages
  const previousWeekDates = useMemo(() => getWeekDates(1), [])
  const previousPeriodAvgs = useMemo(() => {
    const avgs = {}
    let hasData = false
    PERIOD_ORDER.forEach(periodo => {
      const logs = energiaLogs.filter(l => previousWeekDates.includes(l.data) && l.periodo === periodo)
      avgs[periodo] = logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.energia || 0), 0) / logs.length
        : 0
      if (logs.length > 0) hasData = true
    })
    return hasData ? avgs : null
  }, [energiaLogs, previousWeekDates])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${VENTIS_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="ventis" title="Picos e Vales" />
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${VENTIS}33`, borderTopColor: VENTIS }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${VENTIS_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ventis"
        title="Picos e Vales"
        subtitle={`Quando tens mais e menos energia`}
      />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Mapa de Picos e Vales Ventis">
        {/* Concept quote */}
        <div className="text-center py-3">
          <p className="text-xs text-gray-500 italic leading-relaxed max-w-xs mx-auto">
            &ldquo;Nao lutes contra o teu ritmo — danca com ele.&rdquo;
          </p>
        </div>

        {!hasEnoughData ? (
          <DataInsufficient daysCount={uniqueDays} />
        ) : (
          <div className="space-y-6">
            {/* Energy Timeline */}
            <section aria-label="Mapa de energia" className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <EnergyTimeline
                periodAverages={periodAverages}
                peakPeriod={peakPeriod}
                valleyPeriod={valleyPeriod}
              />
            </section>

            {/* Peak & Valley Cards */}
            <section aria-label="Pico e vale identificados">
              <PeakValleyCards
                peakPeriod={peakPeriod}
                valleyPeriod={valleyPeriod}
                periodAverages={periodAverages}
              />
            </section>

            {/* Suggestions */}
            <section aria-label="Sugestoes baseadas no ritmo">
              <Suggestions
                peakPeriod={peakPeriod}
                valleyPeriod={valleyPeriod}
              />
            </section>

            {/* Weekly Comparison */}
            <section aria-label="Comparacao semanal">
              <WeeklyComparison
                currentPeriodAvgs={currentPeriodAvgs}
                previousPeriodAvgs={previousPeriodAvgs}
                peakPeriod={peakPeriod}
                valleyPeriod={valleyPeriod}
              />
            </section>
          </div>
        )}
      </div>

      {/* CSS */}
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
