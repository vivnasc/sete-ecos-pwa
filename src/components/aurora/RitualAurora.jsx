import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { RITUAL_COMPONENTES } from '../../lib/aurora/gamificacao'

// ============================================================
// AURORA — Ritual Aurora
// Ritual matinal integrado combinando elementos de todos os
// ecos completados pelo utilizador.
// Chakra: Integracao Total — Ritual integrado
// ============================================================

const ACCENT = '#D4A5A5'
const ACCENT_DARK = '#2e1a1a'
const ACCENT_SUBTLE = 'rgba(212,165,165,0.12)'

// ---- Step Card ----
const StepCard = ({ componente, isActive, isCompleted, onFeito }) => (
  <div
    className={`rounded-xl p-4 transition-all duration-300 ${isActive ? 'scale-[1.02] shadow-lg' : ''}`}
    style={{
      background: isCompleted
        ? `${componente.cor}15`
        : isActive
          ? `${componente.cor}22`
          : 'rgba(255,255,255,0.03)',
      border: `2px solid ${isActive ? componente.cor : isCompleted ? `${componente.cor}44` : 'transparent'}`,
      opacity: !isActive && !isCompleted ? 0.5 : 1
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: isCompleted ? `${componente.cor}33` : `${componente.cor}22` }}
        aria-hidden="true"
      >
        {isCompleted ? '✓' : componente.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
            {componente.nome}
          </h3>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: `${componente.cor}22`, color: componente.cor }}
          >
            {componente.eco}
          </span>
        </div>
        {isActive && (
          <p className="text-sm text-gray-300 mt-1.5 leading-relaxed animate-fadeIn">
            {componente.instrucao}
          </p>
        )}
        {!isActive && !isCompleted && (
          <p className="text-xs text-gray-500 mt-0.5">{componente.duracao_min} min</p>
        )}
      </div>
    </div>

    {isActive && (
      <div className="mt-4 flex items-center justify-between animate-fadeIn">
        <span className="text-xs text-gray-500">~{componente.duracao_min} min</span>
        <button
          onClick={onFeito}
          className="px-5 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ background: componente.cor }}
        >
          Feito
        </button>
      </div>
    )}
  </div>
)

// ---- Log Entry ----
const LogEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false)
  const componentesFeitos = entry.componentes_feitos || []

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{ background: expanded ? `${ACCENT}11` : 'rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all duration-200"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: `${ACCENT}22` }}
            aria-hidden="true"
          >
            🌅
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">
              {new Date(entry.data).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">
                {componentesFeitos.length} componentes
              </span>
              <span className="text-xs" style={{ color: ACCENT }}>
                {entry.duracao_minutos} min
              </span>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fadeIn">
          <div className="pt-2 border-t border-white/5 space-y-2">
            <p className="text-xs text-gray-500 mb-1">Componentes feitos:</p>
            <div className="flex flex-wrap gap-1.5">
              {componentesFeitos.map((cid, idx) => {
                const comp = RITUAL_COMPONENTES.find(c => c.id === cid)
                return comp ? (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: `${comp.cor}22`, color: comp.cor }}
                  >
                    {comp.icon} {comp.nome}
                  </span>
                ) : null
              })}
            </div>
            {entry.reflexao && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Reflexao:</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                  {entry.reflexao}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function RitualAurora() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  // Ritual state
  const [fase, setFase] = useState('inicio') // 'inicio' | 'ritual' | 'reflexao' | 'conclusao'
  const [stepActual, setStepActual] = useState(0)
  const [completados, setCompletados] = useState([])
  const startTimeRef = useRef(null)

  // Reflexao
  const [reflexao, setReflexao] = useState('')
  const [saving, setSaving] = useState(false)

  // Timer display
  const [tempoDecorrido, setTempoDecorrido] = useState(0)
  const timerRef = useRef(null)

  // Log
  const [logEntries, setLogEntries] = useState([])
  const [loadingLog, setLoadingLog] = useState(false)

  // View
  const [view, setView] = useState('ritual') // 'ritual' | 'historico'

  // ===== Carregar historico =====
  const fetchLog = useCallback(async () => {
    if (!userId) return
    setLoadingLog(true)
    try {
      const { data, error } = await supabase
        .from('aurora_ritual_log')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(30)

      if (error) throw error
      setLogEntries(data || [])
    } catch (err) {
      console.error('RitualAurora: Erro ao carregar log:', err)
    } finally {
      setLoadingLog(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  // ===== Timer =====
  useEffect(() => {
    if (fase === 'ritual') {
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setTempoDecorrido(elapsed)
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fase])

  // ===== Iniciar ritual =====
  const handleIniciar = useCallback(() => {
    setFase('ritual')
    setStepActual(0)
    setCompletados([])
    setReflexao('')
    startTimeRef.current = Date.now()
    setTempoDecorrido(0)
  }, [])

  // ===== Marcar step como feito =====
  const handleFeito = useCallback(() => {
    const currentComponent = RITUAL_COMPONENTES[stepActual]
    const newCompletados = [...completados, currentComponent.id]
    setCompletados(newCompletados)

    if (stepActual + 1 >= RITUAL_COMPONENTES.length) {
      // All done — go to reflexao
      setFase('reflexao')
    } else {
      setStepActual(stepActual + 1)
    }
  }, [stepActual, completados])

  // ===== Award Raios =====
  const awardRaios = useCallback(async (amount) => {
    if (!userId) return
    try {
      const { data: clientData } = await supabase
        .from('aurora_clients')
        .select('raios_total')
        .eq('user_id', userId)
        .maybeSingle()

      const current = clientData?.raios_total || 0

      await supabase
        .from('aurora_clients')
        .update({
          raios_total: current + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Erro ao atribuir raios:', err)
    }
  }, [userId])

  // ===== Guardar ritual =====
  const handleSave = useCallback(async () => {
    if (!userId) return
    setSaving(true)

    const duracaoMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    const duracaoMin = Math.max(1, Math.round(duracaoMs / 60000))

    try {
      const { error } = await supabase
        .from('aurora_ritual_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          componentes_feitos: completados,
          duracao_minutos: duracaoMin,
          reflexao: reflexao.trim() || null
        })

      if (error) throw error

      // Award 5 Raios
      await awardRaios(5)

      setFase('conclusao')
      fetchLog()
    } catch (err) {
      console.error('Erro ao guardar ritual:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, completados, reflexao, awardRaios, fetchLog])

  // ===== Skip reflexao =====
  const handleSkipReflexao = useCallback(async () => {
    setReflexao('')
    setSaving(true)

    const duracaoMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    const duracaoMin = Math.max(1, Math.round(duracaoMs / 60000))

    try {
      const { error } = await supabase
        .from('aurora_ritual_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          componentes_feitos: completados,
          duracao_minutos: duracaoMin,
          reflexao: null
        })

      if (error) throw error

      await awardRaios(5)
      setFase('conclusao')
      fetchLog()
    } catch (err) {
      console.error('Erro ao guardar ritual:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, completados, awardRaios, fetchLog])

  // ===== Nova sessao =====
  const handleNovoRitual = useCallback(() => {
    setFase('inicio')
    setStepActual(0)
    setCompletados([])
    setReflexao('')
    setTempoDecorrido(0)
  }, [])

  // ===== Format time =====
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ===== Total suggested duration =====
  const totalDuracao = RITUAL_COMPONENTES.reduce((sum, c) => sum + c.duracao_min, 0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      {fase !== 'ritual' && (
        <ModuleHeader
          eco="aurora"
          title="Ritual Aurora"
          subtitle="O teu ritual matinal integrado"
        />
      )}

      <div className={fase === 'ritual' ? 'max-w-lg mx-auto px-4 pt-6 pb-24' : 'max-w-lg mx-auto px-4 pb-24'}>
        {/* Tabs (only show in inicio) */}
        {fase === 'inicio' && (
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setView('ritual')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'ritual' ? 'text-white' : 'text-gray-500'}`}
              style={view === 'ritual' ? { background: `${ACCENT}33` } : undefined}
              aria-pressed={view === 'ritual'}
            >
              Ritual
            </button>
            <button
              onClick={() => setView('historico')}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
              style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
              aria-pressed={view === 'historico'}
            >
              Historico ({logEntries.length})
            </button>
          </div>
        )}

        {/* ======= INICIO ======= */}
        {fase === 'inicio' && view === 'ritual' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="text-4xl" aria-hidden="true">🌅</div>
              <h2
                className="text-xl font-semibold text-white"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Bom dia, {g('querido', 'querida')}
              </h2>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                O teu ritual matinal Aurora integra elementos dos 7 ecos. ~{totalDuracao} minutos de presenca.
              </p>
            </div>

            {/* Preview of components */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Hoje vais praticar:</p>
              {RITUAL_COMPONENTES.map(comp => (
                <div
                  key={comp.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${comp.cor}22` }}
                    aria-hidden="true"
                  >
                    {comp.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{comp.nome}</p>
                    <p className="text-xs text-gray-500">{comp.eco} — {comp.duracao_min} min</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleIniciar}
              className="w-full py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              Iniciar Ritual
            </button>
          </div>
        )}

        {/* ======= HISTORICO ======= */}
        {fase === 'inicio' && view === 'historico' && (
          <div className="space-y-4 animate-fadeIn">
            {loadingLog ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
                />
              </div>
            ) : logEntries.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl" aria-hidden="true">🌅</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Nenhum ritual registado
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  O ritual matinal Aurora integra todos os ecos numa pratica diaria.
                </p>
                <button
                  onClick={() => setView('ritual')}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Fazer o primeiro ritual
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {logEntries.length}
                    </p>
                    <p className="text-xs text-gray-400">{logEntries.length === 1 ? 'ritual' : 'rituais'}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {logEntries.reduce((sum, e) => sum + (e.duracao_minutos || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-400">min totais</p>
                  </div>
                </div>

                {/* Log entries */}
                <div className="space-y-2 pb-8">
                  {logEntries.map(entry => (
                    <LogEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======= RITUAL (Step-through) ======= */}
        {fase === 'ritual' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header with timer */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setFase('inicio')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Sair
              </button>
              <div className="text-right">
                <p className="text-lg font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatTime(tempoDecorrido)}
                </p>
                <p className="text-xs text-gray-500">
                  {completados.length}/{RITUAL_COMPONENTES.length} feitos
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full" style={{ background: `${ACCENT}22` }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${(completados.length / RITUAL_COMPONENTES.length) * 100}%`,
                  background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`
                }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {RITUAL_COMPONENTES.map((comp, idx) => (
                <StepCard
                  key={comp.id}
                  componente={comp}
                  isActive={idx === stepActual}
                  isCompleted={completados.includes(comp.id)}
                  onFeito={handleFeito}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======= REFLEXAO ======= */}
        {fase === 'reflexao' && (
          <div className="flex flex-col items-center text-center px-4 py-8 space-y-6 animate-fadeIn">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
              aria-hidden="true"
            >
              🌅
            </div>

            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Ritual completo!
              </h2>
              <p className="text-sm text-gray-400">
                {completados.length} componentes em {formatTime(tempoDecorrido)}. {g('Obrigado', 'Obrigada')} por este momento.
              </p>
            </div>

            <div className="w-full max-w-md space-y-3">
              <label className="text-sm font-medium text-gray-300 text-left block">
                Como te sentes agora? <span className="text-gray-500">(opcional)</span>
              </label>
              <textarea
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder="O que ficou deste ritual? Como te sentes?"
                rows={4}
                maxLength={2000}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', '--tw-ring-color': ACCENT }}
                aria-label="Reflexao apos ritual"
              />
            </div>

            <div className="flex gap-3 w-full max-w-md">
              <button
                onClick={handleSkipReflexao}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-medium text-sm bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200 disabled:opacity-40"
              >
                {saving && !reflexao.trim() ? 'A guardar...' : 'Saltar'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                {saving && reflexao.trim() ? 'A guardar...' : 'Guardar (+5 Raios)'}
              </button>
            </div>
          </div>
        )}

        {/* ======= CONCLUSAO ======= */}
        {fase === 'conclusao' && (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
              aria-hidden="true"
            >
              ✨
            </div>

            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {g('Renovado', 'Renovada')} pela Aurora
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                O teu ritual matinal foi registado. +5 Raios de Aurora
              </p>
            </div>

            {/* Summary */}
            <div
              className="w-full max-w-sm rounded-xl p-5 text-left"
              style={{ background: ACCENT_DARK, border: `1px solid ${ACCENT}22` }}
            >
              <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: `1px solid ${ACCENT}15` }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: '#6a7490' }}>Componentes</span>
                <span className="text-sm font-medium text-white">{completados.length}/{RITUAL_COMPONENTES.length}</span>
              </div>
              <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: `1px solid ${ACCENT}15` }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: '#6a7490' }}>Tempo total</span>
                <span className="text-sm font-medium text-white">{formatTime(tempoDecorrido)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {completados.map(cid => {
                  const comp = RITUAL_COMPONENTES.find(c => c.id === cid)
                  return comp ? (
                    <span
                      key={cid}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: `${comp.cor}22`, color: comp.cor }}
                    >
                      {comp.icon} {comp.nome}
                    </span>
                  ) : null
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm pt-2">
              <button
                onClick={handleNovoRitual}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ background: ACCENT }}
              >
                Novo ritual
              </button>
              <button
                onClick={() => navigate('/aurora/dashboard')}
                className="w-full py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
                style={{ color: '#c8a0a0', background: `${ACCENT}11` }}
              >
                Voltar ao dashboard
              </button>
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
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
