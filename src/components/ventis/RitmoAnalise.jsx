import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ============================================================
// VENTIS — Ritmo Análise
// Eco da Energia & Ritmo (Anahata)
// Dashboard analítico do ritmo pessoal
// ============================================================

const VENTIS = '#5D9B84'
const VENTIS_DARK = '#1a2e24'
const VENTIS_LIGHT = '#7DB8A2'
const VENTIS_GLOW = 'rgba(93,155,132,0.15)'

const HEADING_FONT = "'Cormorant Garamond', serif"

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

const MoonIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const ActivityIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const PauseIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
)

// ---- Date utilities ----
const todayStr = () => new Date().toISOString().split('T')[0]

const getWeekDates = () => {
  const now = new Date()
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

const DAY_NAMES_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

// ---- Energy color by percentage ----
const getEnergyColor = (pct) => {
  if (pct > 70) return '#22c55e'
  if (pct >= 40) return '#eab308'
  return '#ef4444'
}

const getEnergyLabel = (pct) => {
  if (pct > 70) return 'Alta'
  if (pct >= 40) return 'Média'
  return 'Baixa'
}

// ==========================
// SECTION: Energy Overview
// ==========================
const EnergyOverview = ({ energiaLogs, weekDates }) => {
  // Calculate average energy this week
  const weekLogs = useMemo(() => {
    return energiaLogs.filter(log => weekDates.includes(log.data))
  }, [energiaLogs, weekDates])

  const avgEnergy = useMemo(() => {
    if (weekLogs.length === 0) return 0
    return Math.round(weekLogs.reduce((sum, l) => sum + (l.energia || 0), 0) / weekLogs.length)
  }, [weekLogs])

  // Previous week average for trend
  const prevWeekStart = useMemo(() => {
    const d = new Date(weekDates[0])
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }, [weekDates])

  const prevWeekLogs = useMemo(() => {
    const prevEnd = weekDates[0]
    return energiaLogs.filter(log => log.data >= prevWeekStart && log.data < prevEnd)
  }, [energiaLogs, prevWeekStart, weekDates])

  const prevAvg = useMemo(() => {
    if (prevWeekLogs.length === 0) return null
    return Math.round(prevWeekLogs.reduce((sum, l) => sum + (l.energia || 0), 0) / prevWeekLogs.length)
  }, [prevWeekLogs])

  const trend = prevAvg !== null ? avgEnergy - prevAvg : 0

  // Build 7 days x 3 periods grid
  const gridData = useMemo(() => {
    return weekDates.map(date => {
      const dayLogs = weekLogs.filter(l => l.data === date)
      const manha = dayLogs.find(l => l.periodo === 'manha')
      const tarde = dayLogs.find(l => l.periodo === 'tarde')
      const noite = dayLogs.find(l => l.periodo === 'noite')
      return {
        date,
        manha: manha?.energia || null,
        tarde: tarde?.energia || null,
        noite: noite?.energia || null
      }
    })
  }, [weekDates, weekLogs])

  if (weekLogs.length === 0) {
    return (
      <div className="text-center py-6 space-y-3">
        <WindIcon className="w-10 h-10 mx-auto opacity-30" />
        <p className="text-sm text-gray-500">Sem dados de energia esta semana.</p>
        <p className="text-xs text-gray-600 italic">
          Regista a tua energia 3x/dia para ver o teu ritmo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Big number */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <span
            className="text-5xl font-bold"
            style={{ color: getEnergyColor(avgEnergy), fontFamily: HEADING_FONT }}
          >
            {avgEnergy}%
          </span>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`} style={{ background: trend > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
              {trend > 0 ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Energia média esta semana
        </p>
        <p className="text-xs mt-1" style={{ color: getEnergyColor(avgEnergy) }}>
          {getEnergyLabel(avgEnergy)}
        </p>
      </div>

      {/* 7 days x 3 periods bar chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Energia por período</h3>
        <div className="flex items-end justify-between gap-1.5">
          {gridData.map((day, i) => {
            const isToday = day.date === todayStr()
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 gap-1">
                {/* 3 stacked bars: noite(top), tarde, manha(bottom) */}
                <div className="flex flex-col gap-0.5 w-full items-center" style={{ height: 80 }}>
                  {[
                    { val: day.noite, label: 'N' },
                    { val: day.tarde, label: 'T' },
                    { val: day.manha, label: 'M' }
                  ].map((period, pi) => (
                    <div
                      key={pi}
                      className="w-full max-w-[20px] rounded-sm transition-all duration-300"
                      style={{
                        height: period.val !== null ? `${Math.max((period.val / 100) * 24, 3)}px` : '3px',
                        background: period.val !== null
                          ? getEnergyColor(period.val)
                          : 'rgba(255,255,255,0.06)',
                        opacity: period.val !== null ? 0.9 : 0.3
                      }}
                      title={period.val !== null ? `${period.label}: ${period.val}%` : `${period.label}: sem dados`}
                    />
                  ))}
                </div>
                <span className={`text-xs ${isToday ? 'font-bold text-white' : 'text-gray-600'}`}>
                  {DAY_NAMES_SHORT[i]}
                </span>
              </div>
            )
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {[
            { label: 'Manhã', color: '#94a3b8' },
            { label: 'Tarde', color: '#94a3b8' },
            { label: 'Noite', color: '#94a3b8' }
          ].map(item => (
            <span key={item.label} className="text-xs text-gray-500">{item.label}</span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: '#22c55e' }} />
            <span className="text-xs text-gray-500">&gt;70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: '#eab308' }} />
            <span className="text-xs text-gray-500">40-70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: '#ef4444' }} />
            <span className="text-xs text-gray-500">&lt;40%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================
// SECTION: Routine Adherence
// ==========================
const RoutineAdherence = ({ rotinasLogs, weekDates }) => {
  const weekLogs = useMemo(() => {
    return rotinasLogs.filter(log => weekDates.includes(log.data))
  }, [rotinasLogs, weekDates])

  const daysWithRoutine = useMemo(() => {
    const days = new Set(weekLogs.map(l => l.data))
    return days.size
  }, [weekLogs])

  const matinalLogs = useMemo(() => weekLogs.filter(l => l.tipo === 'matinal'), [weekLogs])
  const nocturnaLogs = useMemo(() => weekLogs.filter(l => l.tipo === 'nocturna'), [weekLogs])

  const matinalRate = Math.round((matinalLogs.length / 7) * 100)
  const nocturnaRate = Math.round((nocturnaLogs.length / 7) * 100)
  const progressPct = Math.round((daysWithRoutine / 7) * 100)

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <h3
        className="text-base font-semibold text-white mb-4"
        style={{ fontFamily: HEADING_FONT }}
      >
        Aderência à Rotina
      </h3>

      {/* X de 7 dias */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-300">
          <span className="text-lg font-bold text-white">{daysWithRoutine}</span> de 7 dias esta semana
        </p>
        <span className="text-sm font-medium" style={{ color: VENTIS }}>{progressPct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${VENTIS}88, ${VENTIS})`
          }}
        />
      </div>

      {/* Matinal vs Nocturna */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-gray-500 mb-1">Matinal</p>
          <p className="text-lg font-bold text-white">{matinalRate}%</p>
          <div className="h-1.5 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${matinalRate}%`, background: '#22c55e' }}
            />
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-gray-500 mb-1">Nocturna</p>
          <p className="text-lg font-bold text-white">{nocturnaRate}%</p>
          <div className="h-1.5 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${nocturnaRate}%`, background: '#8b5cf6' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================
// SECTION: Sleep Quality
// ==========================
const SleepQuality = ({ energiaLogs, weekDates }) => {
  // Sleep quality comes from manha check-ins (sono_qualidade field)
  const manhaLogs = useMemo(() => {
    return energiaLogs.filter(l => weekDates.includes(l.data) && l.periodo === 'manha' && l.sono_qualidade != null)
  }, [energiaLogs, weekDates])

  const avgSleep = useMemo(() => {
    if (manhaLogs.length === 0) return 0
    return manhaLogs.reduce((sum, l) => sum + (l.sono_qualidade || 0), 0) / manhaLogs.length
  }, [manhaLogs])

  const stars = Math.round(avgSleep)
  const maxStars = 5

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        <MoonIcon className="w-4 h-4" style={{ color: VENTIS_LIGHT }} />
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: HEADING_FONT }}
        >
          Qualidade do Sono
        </h3>
      </div>

      {manhaLogs.length === 0 ? (
        <p className="text-sm text-gray-500">
          Sem dados de sono esta semana. Regista a qualidade do sono no check-in da manhã.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Star display */}
          <div className="flex items-center gap-1">
            {Array.from({ length: maxStars }).map((_, i) => (
              <span
                key={i}
                className="text-xl"
                style={{ opacity: i < stars ? 1 : 0.2 }}
                aria-hidden="true"
              >
                {i < stars ? '\u2605' : '\u2606'}
              </span>
            ))}
            <span className="ml-2 text-sm text-gray-400">
              {avgSleep.toFixed(1)} / 5
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Média de {manhaLogs.length} {manhaLogs.length === 1 ? 'registo' : 'registos'} esta semana
          </p>
        </div>
      )}
    </div>
  )
}

// ==========================
// SECTION: Movement Summary
// ==========================
const MovementSummary = ({ movimentoLogs, weekDates }) => {
  const weekLogs = useMemo(() => {
    return movimentoLogs.filter(log => weekDates.includes(log.data))
  }, [movimentoLogs, weekDates])

  const totalMinutes = useMemo(() => {
    return weekLogs.reduce((sum, l) => sum + (l.duracao_minutos || 0), 0)
  }, [weekLogs])

  const typesUsed = useMemo(() => {
    const types = new Set(weekLogs.map(l => l.tipo).filter(Boolean))
    return Array.from(types)
  }, [weekLogs])

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        <ActivityIcon className="w-4 h-4" style={{ color: VENTIS_LIGHT }} />
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: HEADING_FONT }}
        >
          Movimento
        </h3>
      </div>

      {weekLogs.length === 0 ? (
        <p className="text-sm text-gray-500">
          Sem movimento registado esta semana. Qualquer tipo de movimento conta!
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: VENTIS, fontFamily: HEADING_FONT }}
            >
              {totalMinutes}
            </span>
            <span className="text-sm text-gray-400">minutos esta semana</span>
          </div>

          {typesUsed.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {typesUsed.map(type => (
                <span
                  key={type}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${VENTIS}22`, color: VENTIS_LIGHT }}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==========================
// SECTION: Pauses Summary
// ==========================
const PausesSummary = ({ pausasLogs, weekDates }) => {
  const weekLogs = useMemo(() => {
    return pausasLogs.filter(log => weekDates.includes(log.data))
  }, [pausasLogs, weekDates])

  const totalPauses = weekLogs.length

  const daysWithPauses = useMemo(() => {
    return new Set(weekLogs.map(l => l.data)).size
  }, [weekLogs])

  const avgPerDay = daysWithPauses > 0 ? (totalPauses / daysWithPauses).toFixed(1) : 0

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        <PauseIcon className="w-4 h-4" style={{ color: VENTIS_LIGHT }} />
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: HEADING_FONT }}
        >
          Pausas
        </h3>
      </div>

      {weekLogs.length === 0 ? (
        <p className="text-sm text-gray-500">
          Sem pausas registadas esta semana. As pausas são tão importantes como a acção.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: HEADING_FONT }}>
              {totalPauses}
            </p>
            <p className="text-xs text-gray-500">Total esta semana</p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-2xl font-bold" style={{ color: VENTIS, fontFamily: HEADING_FONT }}>
              {avgPerDay}
            </p>
            <p className="text-xs text-gray-500">Média por dia</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================
// SECTION: Overall Insight
// ==========================
const OverallInsight = ({ energiaLogs, movimentoLogs, weekDates }) => {
  const insight = useMemo(() => {
    const weekEnergia = energiaLogs.filter(l => weekDates.includes(l.data))
    const weekMovimento = movimentoLogs.filter(l => weekDates.includes(l.data))

    if (weekEnergia.length === 0) {
      return `Ainda não tens dados de energia esta semana. Começa a registar 3x/dia — manhã, tarde e noite — para descobrir o teu ritmo natural.`
    }

    const avgEnergy = Math.round(weekEnergia.reduce((sum, l) => sum + (l.energia || 0), 0) / weekEnergia.length)

    // Find peak period
    const byPeriod = { manha: [], tarde: [], noite: [] }
    weekEnergia.forEach(l => {
      if (byPeriod[l.periodo]) byPeriod[l.periodo].push(l.energia || 0)
    })

    const periodAvgs = Object.entries(byPeriod).map(([periodo, vals]) => ({
      periodo,
      avg: vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0,
      count: vals.length
    })).filter(p => p.count > 0)

    const peakPeriod = periodAvgs.reduce((max, p) => p.avg > max.avg ? p : max, { avg: 0, periodo: '' })

    const periodLabels = { manha: 'de manha', tarde: 'a tarde', noite: 'a noite' }
    const peakLabel = periodLabels[peakPeriod.periodo] || ''

    // Check if movement days correlate with better sleep
    const movementDates = new Set(weekMovimento.map(m => m.data))
    const sleepWithMovement = weekEnergia.filter(l =>
      l.periodo === 'manha' && l.sono_qualidade != null && movementDates.has(l.data)
    )
    const sleepWithoutMovement = weekEnergia.filter(l =>
      l.periodo === 'manha' && l.sono_qualidade != null && !movementDates.has(l.data)
    )

    const avgSleepMove = sleepWithMovement.length > 0
      ? sleepWithMovement.reduce((s, l) => s + l.sono_qualidade, 0) / sleepWithMovement.length
      : 0
    const avgSleepNoMove = sleepWithoutMovement.length > 0
      ? sleepWithoutMovement.reduce((s, l) => s + l.sono_qualidade, 0) / sleepWithoutMovement.length
      : 0

    const sleepCorrelation = sleepWithMovement.length >= 2 && sleepWithoutMovement.length >= 2 && avgSleepMove > avgSleepNoMove

    let text = `Esta semana a tua energia média foi ${avgEnergy}%.`
    if (peakLabel) text += ` Os teus picos são ${peakLabel}.`
    if (sleepCorrelation) text += ` Dormiste melhor nos dias com actividade física.`
    if (weekMovimento.length === 0 && avgEnergy < 50) text += ` Experimenta adicionar movimento — pode ajudar a subir a energia.`
    if (avgEnergy >= 70) text += ` ${g('Estas num bom ritmo', 'Estas num bom ritmo')} — continua assim!`

    return text
  }, [energiaLogs, movimentoLogs, weekDates])

  return (
    <div className="p-5 rounded-2xl" style={{ background: `${VENTIS}10`, border: `1px solid ${VENTIS}22` }}>
      <div className="flex items-center gap-2 mb-3">
        <WindIcon className="w-5 h-5" style={{ color: VENTIS }} />
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: HEADING_FONT }}
        >
          Insight da Semana
        </h3>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">
        {insight}
      </p>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function RitmoAnalise() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [energiaLogs, setEnergiaLogs] = useState([])
  const [rotinasLogs, setRotinasLogs] = useState([])
  const [movimentoLogs, setMovimentoLogs] = useState([])
  const [pausasLogs, setPausasLogs] = useState([])

  const weekDates = useMemo(() => getWeekDates(), [])

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      // Last 14 days to include previous week for trend comparison
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      const startDate = fourteenDaysAgo.toISOString().split('T')[0]

      // Fetch all data sources in parallel
      const [energiaRes, rotinasRes, movimentoRes, pausasRes] = await Promise.all([
        supabase
          .from('ventis_energia_log')
          .select('id, data, periodo, energia, sono_qualidade, created_at')
          .eq('user_id', userId)
          .gte('data', startDate)
          .order('data', { ascending: true }),
        supabase
          .from('ventis_rotinas_log')
          .select('id, data, tipo, concluida, created_at')
          .eq('user_id', userId)
          .gte('data', startDate)
          .order('data', { ascending: true }),
        supabase
          .from('ventis_movimento_log')
          .select('id, data, tipo, duracao_minutos, created_at')
          .eq('user_id', userId)
          .gte('data', startDate)
          .order('data', { ascending: true }),
        supabase
          .from('ventis_pausas_log')
          .select('id, data, created_at')
          .eq('user_id', userId)
          .gte('data', startDate)
          .order('data', { ascending: true })
      ])

      setEnergiaLogs(energiaRes.data || [])
      setRotinasLogs(rotinasRes.data || [])
      setMovimentoLogs(movimentoRes.data || [])
      setPausasLogs(pausasRes.data || [])
    } catch (err) {
      console.error('Erro ao carregar dados Ventis:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${VENTIS_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="ventis" title="Analise de Ritmo" />
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
        title="Análise de Ritmo"
        subtitle={`O teu ritmo pessoal — ${g('mapeado', 'mapeada')} e ${g('compreendido', 'compreendida')}`}
      />

      <div className="max-w-lg mx-auto px-4 pb-24 space-y-6" role="main" aria-label="Análise de Ritmo Ventis">
        {/* Concept quote */}
        <div className="text-center py-3">
          <p className="text-xs text-gray-500 italic leading-relaxed max-w-xs mx-auto">
            &ldquo;Conhece o teu ritmo e encontraras o teu poder.&rdquo;
          </p>
        </div>

        {/* Energy Overview */}
        <section aria-label="Visão geral de energia">
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <h2
              className="text-base font-semibold text-white mb-4"
              style={{ fontFamily: HEADING_FONT }}
            >
              Energia esta Semana
            </h2>
            <EnergyOverview energiaLogs={energiaLogs} weekDates={weekDates} />
          </div>
        </section>

        {/* Routine Adherence */}
        <section aria-label="Aderência à rotina">
          <RoutineAdherence rotinasLogs={rotinasLogs} weekDates={weekDates} />
        </section>

        {/* Sleep Quality */}
        <section aria-label="Qualidade do sono">
          <SleepQuality energiaLogs={energiaLogs} weekDates={weekDates} />
        </section>

        {/* Movement Summary */}
        <section aria-label="Resumo de movimento">
          <MovementSummary movimentoLogs={movimentoLogs} weekDates={weekDates} />
        </section>

        {/* Pauses Summary */}
        <section aria-label="Resumo de pausas">
          <PausesSummary pausasLogs={pausasLogs} weekDates={weekDates} />
        </section>

        {/* Overall Insight */}
        <section aria-label="Insight semanal">
          <OverallInsight
            energiaLogs={energiaLogs}
            movimentoLogs={movimentoLogs}
            weekDates={weekDates}
          />
        </section>
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
