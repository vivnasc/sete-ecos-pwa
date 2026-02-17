import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { MICRO_VOZ_PROGRAMA } from '../../lib/ecoa/gamificacao'

// ============================================================
// ECOA — Micro-Voz: Exercícios Progressivos de Recuperação de Voz
// Eco da Expressão & Voz (Vishuddha)
// 8 semanas de desafios de expressão cada vez mais profundos
// ============================================================

const ACCENT = '#4A90A4'
const ACCENT_DARK = '#1a2a34'
const ACCENT_LIGHT = '#6DB0C4'
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)'

const ECOS_PER_EXERCISE = 8

// Motivational messages per week range
const MOTIVACAO = {
  early: 'Estamos a começar devagar. Cada voz pequena conta.',
  growing: 'A tua voz está a ficar mais forte.',
  strong: 'Já não sussurras \u2014 falas.',
  full: 'A tua voz é tua. Ninguém ta tira.'
}

function getMotivacao(semana) {
  if (semana <= 2) return MOTIVACAO.early
  if (semana <= 4) return MOTIVACAO.growing
  if (semana <= 6) return MOTIVACAO.strong
  return MOTIVACAO.full
}

// ---- Sound wave SVG decoration ----
const SoundWave = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 40" className="w-full h-8 opacity-20" fill="none" stroke={ACCENT} strokeWidth="1.5">
      <path d="M0,20 Q25,5 50,20 Q75,35 100,20 Q125,5 150,20 Q175,35 200,20" />
      <path d="M0,20 Q25,10 50,20 Q75,30 100,20 Q125,10 150,20 Q175,30 200,20" opacity="0.5" />
    </svg>
  </div>
)

// ---- Check icon ----
const CheckIcon = ({ checked }) => (
  <div
    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
    style={{
      background: checked ? ACCENT : 'rgba(255,255,255,0.08)',
      border: checked ? 'none' : '2px solid rgba(255,255,255,0.2)',
      boxShadow: checked ? `0 2px 8px ${ACCENT}55` : 'none'
    }}
  >
    {checked && (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </div>
)

// ---- Progress bar for weeks 1-8 ----
const WeekProgressBar = ({ currentWeek, totalWeeks = 8 }) => (
  <div className="flex items-center gap-1.5 w-full" role="progressbar" aria-valuenow={currentWeek} aria-valuemin={1} aria-valuemax={totalWeeks}>
    {Array.from({ length: totalWeeks }, (_, i) => {
      const weekNum = i + 1
      const isComplete = weekNum < currentWeek
      const isCurrent = weekNum === currentWeek
      return (
        <div key={weekNum} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full h-2.5 rounded-full transition-all duration-500"
            style={{
              background: isComplete
                ? ACCENT
                : isCurrent
                  ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT}55)`
                  : 'rgba(255,255,255,0.08)',
              boxShadow: isCurrent ? `0 0 8px ${ACCENT}44` : 'none'
            }}
          />
          <span
            className="text-[10px] transition-colors duration-300"
            style={{
              color: isComplete || isCurrent ? ACCENT_LIGHT : 'rgba(255,255,255,0.25)',
              fontWeight: isCurrent ? '700' : '400'
            }}
          >
            {weekNum}
          </span>
        </div>
      )
    })}
  </div>
)

// ---- Exercise card ----
const ExerciseCard = ({
  exercicio,
  index,
  isCompleted,
  reflexao,
  saving,
  onToggle,
  onReflexaoChange,
  onSave
}) => {
  const [showReflexao, setShowReflexao] = useState(isCompleted)

  return (
    <div
      className="rounded-xl border transition-all duration-300"
      style={{
        background: isCompleted ? `${ACCENT}11` : 'rgba(255,255,255,0.03)',
        borderColor: isCompleted ? `${ACCENT}33` : 'rgba(255,255,255,0.06)'
      }}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => {
          if (!isCompleted) {
            onToggle(index)
            setShowReflexao(true)
          } else {
            setShowReflexao(!showReflexao)
          }
        }}
        aria-label={`Exercício ${index + 1}: ${exercicio}`}
        aria-pressed={isCompleted}
      >
        <div className="pt-0.5">
          <CheckIcon checked={isCompleted} />
        </div>
        <p className={`text-sm leading-relaxed flex-1 ${isCompleted ? 'text-white/70' : 'text-white/90'}`}>
          {exercicio}
        </p>
        {isCompleted && (
          <span className="text-xs shrink-0 px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}22`, color: ACCENT_LIGHT }}>
            +{ECOS_PER_EXERCISE} Ecos
          </span>
        )}
      </button>

      {/* Reflection area (shows after completion) */}
      {showReflexao && isCompleted && (
        <div className="px-4 pb-4 space-y-2 animate-fadeIn">
          <label className="text-xs text-white/40 block">Como correu?</label>
          <textarea
            value={reflexao}
            onChange={(e) => onReflexaoChange(index, e.target.value)}
            placeholder="Partilha como foi esta experiência..."
            rows={2}
            maxLength={500}
            className="w-full p-3 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.05)',
              focusRingColor: ACCENT
            }}
            aria-label="Reflexão sobre o exercício"
          />
          {reflexao && (
            <button
              onClick={() => onSave(index)}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg text-white transition-all duration-200 hover:opacity-80 disabled:opacity-40"
              style={{ background: ACCENT }}
            >
              {saving ? 'A guardar...' : 'Guardar reflexão'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---- History item for past weeks ----
const HistoryWeek = ({ semana, completedExercises }) => {
  const [expanded, setExpanded] = useState(false)
  const weekData = MICRO_VOZ_PROGRAMA.find(w => w.semana === semana)
  if (!weekData) return null

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: `${ACCENT}22`, color: ACCENT_LIGHT }}
          >
            {semana}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{weekData.titulo}</p>
            <p className="text-xs text-white/30">{completedExercises.length}/5 exercícios</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2 animate-fadeIn">
          {weekData.exercicios.map((ex, i) => {
            const log = completedExercises.find(l => l.exercicio === i)
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckIcon checked={!!log} />
                <div className="flex-1">
                  <p className={log ? 'text-white/60' : 'text-white/30'}>{ex}</p>
                  {log?.reflexao && (
                    <p className="text-xs text-white/30 mt-1 italic">"{log.reflexao}"</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function MicroVoz() {
  const { user, userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [completedExercises, setCompletedExercises] = useState({}) // { exercicioIndex: true }
  const [reflexoes, setReflexoes] = useState({}) // { exercicioIndex: 'text' }
  const [allLogs, setAllLogs] = useState([]) // all logs for history
  const [view, setView] = useState('actual') // 'actual' | 'historico'
  const [advanceReady, setAdvanceReady] = useState(false)

  // Load data
  useEffect(() => {
    if (!userId) return
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get current week from ecoa_clients
        const { data: clientData } = await supabase
          .from('ecoa_clients')
          .select('semana_micro_voz')
          .eq('user_id', userId)
          .maybeSingle()

        const week = clientData?.semana_micro_voz || 1
        setCurrentWeek(week)

        // Get all exercise logs
        const { data: logs } = await supabase
          .from('ecoa_micro_voz_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        setAllLogs(logs || [])

        // Build completed map for current week
        const currentWeekLogs = (logs || []).filter(l => l.nivel_semana === week && l.completou)
        const completed = {}
        const refs = {}
        currentWeekLogs.forEach(log => {
          completed[log.exercicio] = true
          if (log.reflexao) refs[log.exercicio] = log.reflexao
        })
        setCompletedExercises(completed)
        setReflexoes(refs)

        // Check if can advance
        const completedCount = Object.keys(completed).length
        setAdvanceReady(completedCount >= 3 && week < 8)
      } catch (err) {
        console.error('Erro ao carregar Micro-Voz:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  const weekData = MICRO_VOZ_PROGRAMA.find(w => w.semana === currentWeek)

  // Toggle exercise completion
  const handleToggle = useCallback(async (exercicioIndex) => {
    if (!userId || completedExercises[exercicioIndex]) return
    setSaving(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('ecoa_micro_voz_log')
        .insert({
          user_id: userId,
          data: today,
          nivel_semana: currentWeek,
          exercicio: exercicioIndex,
          completou: true,
          reflexao: null
        })

      if (error) throw error

      const newCompleted = { ...completedExercises, [exercicioIndex]: true }
      setCompletedExercises(newCompleted)

      // Check if can advance (3+ exercises done)
      const completedCount = Object.keys(newCompleted).length
      if (completedCount >= 3 && currentWeek < 8) {
        setAdvanceReady(true)
      }

      // Refresh logs
      const { data: logs } = await supabase
        .from('ecoa_micro_voz_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setAllLogs(logs || [])
    } catch (err) {
      console.error('Erro ao marcar exercício:', err)
    } finally {
      setSaving(false)
    }
  }, [userId, currentWeek, completedExercises])

  // Save reflection
  const handleSaveReflexao = useCallback(async (exercicioIndex) => {
    if (!userId) return
    const text = reflexoes[exercicioIndex]
    if (!text?.trim()) return
    setSaving(true)

    try {
      // Update the existing log with the reflection
      const { error } = await supabase
        .from('ecoa_micro_voz_log')
        .update({ reflexao: text.trim() })
        .eq('user_id', userId)
        .eq('nivel_semana', currentWeek)
        .eq('exercicio', exercicioIndex)

      if (error) throw error
    } catch (err) {
      console.error('Erro ao guardar reflexão:', err)
    } finally {
      setSaving(false)
    }
  }, [userId, currentWeek, reflexoes])

  // Handle reflection text change
  const handleReflexaoChange = useCallback((index, value) => {
    setReflexoes(prev => ({ ...prev, [index]: value }))
  }, [])

  // Advance to next week
  const handleAdvance = useCallback(async () => {
    if (!userId || currentWeek >= 8) return
    setSaving(true)

    try {
      const nextWeek = currentWeek + 1
      const { error } = await supabase
        .from('ecoa_clients')
        .update({ semana_micro_voz: nextWeek })
        .eq('user_id', userId)

      if (error) throw error

      setCurrentWeek(nextWeek)
      setCompletedExercises({})
      setReflexoes({})
      setAdvanceReady(false)

      // Rebuild completed for new week
      const newWeekLogs = allLogs.filter(l => l.nivel_semana === nextWeek && l.completou)
      const completed = {}
      const refs = {}
      newWeekLogs.forEach(log => {
        completed[log.exercicio] = true
        if (log.reflexao) refs[log.exercicio] = log.reflexao
      })
      setCompletedExercises(completed)
      setReflexoes(refs)
    } catch (err) {
      console.error('Erro ao avançar semana:', err)
    } finally {
      setSaving(false)
    }
  }, [userId, currentWeek, allLogs])

  // Get completed exercises per past week (for history)
  const getHistoryWeeks = useCallback(() => {
    const weeks = []
    for (let w = 1; w < currentWeek; w++) {
      const weekLogs = allLogs.filter(l => l.nivel_semana === w && l.completou)
      if (weekLogs.length > 0) {
        weeks.push({ semana: w, logs: weekLogs })
      }
    }
    return weeks.reverse()
  }, [currentWeek, allLogs])

  const completedCount = Object.keys(completedExercises).length

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="ecoa" title="Micro-Voz" subtitle="Exercícios progressivos de expressão" />
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Micro-Voz"
        subtitle="Exercícios progressivos de expressão"
      />

      <SoundWave className="-mt-1" />

      <div className="max-w-lg mx-auto px-4 pb-24" role="main" aria-label="Micro-Voz exercícios">

        {/* Week progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/40">Progresso semanal</p>
            <p className="text-xs" style={{ color: ACCENT_LIGHT }}>
              Semana {currentWeek} de 8
            </p>
          </div>
          <WeekProgressBar currentWeek={currentWeek} />
        </div>

        {/* Motivational message */}
        <div
          className="rounded-xl p-4 mb-6 text-center"
          style={{ background: ACCENT_SUBTLE }}
        >
          <p className="text-sm italic" style={{ color: ACCENT_LIGHT }}>
            {getMotivacao(currentWeek)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setView('actual')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'actual' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'actual' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'actual'}
          >
            Semana Actual
          </button>
          <button
            onClick={() => setView('historico')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'historico'}
          >
            Histórico
          </button>
        </div>

        {view === 'actual' ? (
          <>
            {/* Current week header */}
            {weekData && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Semana {currentWeek}: {weekData.titulo}
                </h2>
                <p className="text-sm text-white/50">{weekData.descricao}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-white/30">{completedCount}/5 exercícios</span>
                  <span className="text-xs" style={{ color: ACCENT_LIGHT }}>
                    (+{completedCount * ECOS_PER_EXERCISE} Ecos {'\uD83D\uDD0A'})
                  </span>
                </div>
              </div>
            )}

            {/* Exercises list */}
            <div className="space-y-3">
              {weekData?.exercicios.map((exercicio, i) => (
                <ExerciseCard
                  key={i}
                  exercicio={exercicio}
                  index={i}
                  isCompleted={!!completedExercises[i]}
                  reflexao={reflexoes[i] || ''}
                  saving={saving}
                  onToggle={handleToggle}
                  onReflexaoChange={handleReflexaoChange}
                  onSave={handleSaveReflexao}
                />
              ))}
            </div>

            {/* Advance button */}
            {advanceReady && (
              <div className="mt-8 text-center animate-fadeIn">
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}
                >
                  <p className="text-sm font-medium text-white">
                    {g('Parabéns', 'Parabéns')}! Podes avançar para a Semana {currentWeek + 1}
                  </p>
                  <p className="text-xs text-white/40">
                    Completaste {completedCount} exercícios esta semana.
                  </p>
                  <button
                    onClick={handleAdvance}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, boxShadow: `0 4px 16px ${ACCENT}44` }}
                  >
                    {saving ? 'A avançar...' : `Avançar para Semana ${currentWeek + 1}`}
                  </button>
                </div>
              </div>
            )}

            {/* Final week completed message */}
            {currentWeek === 8 && completedCount >= 3 && (
              <div className="mt-8 text-center animate-fadeIn">
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}
                >
                  <p className="text-2xl">{'\uD83C\uDF1F'}</p>
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Programa completo!
                  </h3>
                  <p className="text-sm text-white/60">
                    {g('Chegaste', 'Chegaste')} ao fim do programa Micro-Voz.
                    A tua voz agora é mais forte, mais clara, mais tua.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* History view */
          <div className="space-y-3">
            {getHistoryWeeks().length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-3xl">{'\uD83D\uDD0A'}</p>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Sem histórico ainda
                </h3>
                <p className="text-sm text-white/40 max-w-xs mx-auto">
                  Quando completares a primeira semana e avançares, o histórico aparecerá aqui.
                </p>
              </div>
            ) : (
              getHistoryWeeks().map(({ semana, logs }) => (
                <HistoryWeek
                  key={semana}
                  semana={semana}
                  completedExercises={logs}
                />
              ))
            )}
          </div>
        )}

        <SoundWave className="mt-12 rotate-180" />
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
