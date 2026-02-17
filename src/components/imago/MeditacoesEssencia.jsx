import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { MEDITACOES_ESSENCIA } from '../../lib/imago/gamificacao'

// ============================================================
// IMAGO — Meditacoes de Essencia
// Meditacoes guiadas com scripts em portugues sobre identidade
// Chakra: Sahasrara (Coroa) — Consciencia e essencia
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#1a1a2e'
const ACCENT_SUBTLE = 'rgba(139,123,165,0.12)'

const AUTO_ADVANCE_SECONDS = 15

// ---- Meditation Card ----
const MeditacaoCard = ({ med, onSelect }) => (
  <button
    onClick={() => onSelect(med)}
    className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
    style={{
      background: ACCENT_DARK,
      border: `1px solid ${ACCENT}33`
    }}
    aria-label={`${med.nome} — ${med.duracao_min} minutos`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base mb-1 text-white">
          {med.nome}
        </h3>
        <p className="text-sm mb-2" style={{ color: '#9a8fb8' }}>
          {med.descricao}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }}
          >
            {med.duracao_min} min
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${ACCENT}12`, color: '#9a8fb8' }}
          >
            {med.script.length} passos
          </span>
        </div>
      </div>
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: `${ACCENT}22` }}
        aria-hidden="true"
      >
        🧘
      </div>
    </div>
  </button>
)

// ---- Log Entry ----
const LogEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false)
  const med = MEDITACOES_ESSENCIA.find(m => m.id === entry.meditacao_id)

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
            🧘
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {med?.nome || entry.meditacao_id}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">
                {new Date(entry.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
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

      {expanded && entry.reflexao && (
        <div className="px-4 pb-4 animate-fadeIn">
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-1">Reflexao:</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
              {entry.reflexao}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function MeditacoesEssencia() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  // Fase: 'selecao' | 'player' | 'reflexao' | 'conclusao'
  const [fase, setFase] = useState('selecao')
  const [meditacaoEscolhida, setMeditacaoEscolhida] = useState(null)

  // Player state
  const [linhaActual, setLinhaActual] = useState(0)
  const [paused, setPaused] = useState(false)
  const [autoMode, setAutoMode] = useState(true)
  const [tempoRestante, setTempoRestante] = useState(AUTO_ADVANCE_SECONDS)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Reflexao
  const [reflexao, setReflexao] = useState('')
  const [saving, setSaving] = useState(false)

  // Log
  const [logEntries, setLogEntries] = useState([])
  const [loadingLog, setLoadingLog] = useState(false)

  // View
  const [view, setView] = useState('meditar') // 'meditar' | 'historico'

  // ===== Carregar historico =====
  const fetchLog = useCallback(async () => {
    if (!userId) return
    setLoadingLog(true)
    try {
      const { data, error } = await supabase
        .from('imago_meditacoes_log')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (error) throw error
      setLogEntries(data || [])
    } catch (err) {
      console.error('MeditacoesEssencia: Erro ao carregar log:', err)
    } finally {
      setLoadingLog(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  // ===== Award estrelas =====
  const awardEstrelas = useCallback(async (amount) => {
    if (!userId) return
    try {
      const { data: clientData } = await supabase
        .from('imago_clients')
        .select('estrelas_total')
        .eq('user_id', userId)
        .maybeSingle()

      const current = clientData?.estrelas_total || 0

      await supabase
        .from('imago_clients')
        .update({
          estrelas_total: current + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Erro ao atribuir estrelas:', err)
    }
  }, [userId])

  // ===== Seleccionar meditacao =====
  const handleSelectMeditacao = useCallback((med) => {
    setMeditacaoEscolhida(med)
    setLinhaActual(0)
    setPaused(false)
    setAutoMode(true)
    setTempoRestante(AUTO_ADVANCE_SECONDS)
    setFase('player')
    startTimeRef.current = Date.now()
  }, [])

  // ===== Timer para auto-advance =====
  useEffect(() => {
    if (fase !== 'player' || paused || !autoMode || !meditacaoEscolhida) return

    intervalRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          // Avancar para proxima linha
          setLinhaActual(prevLinha => {
            const nextLinha = prevLinha + 1
            if (nextLinha >= meditacaoEscolhida.script.length) {
              // Meditacao completa
              clearInterval(intervalRef.current)
              setFase('reflexao')
              return prevLinha
            }
            return nextLinha
          })
          return AUTO_ADVANCE_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fase, paused, autoMode, meditacaoEscolhida])

  // ===== Avancar manualmente =====
  const handleProximo = useCallback(() => {
    if (!meditacaoEscolhida) return

    const nextLinha = linhaActual + 1
    if (nextLinha >= meditacaoEscolhida.script.length) {
      setFase('reflexao')
    } else {
      setLinhaActual(nextLinha)
      setTempoRestante(AUTO_ADVANCE_SECONDS)
    }
  }, [meditacaoEscolhida, linhaActual])

  // ===== Pausar/Retomar =====
  const handleTogglePause = useCallback(() => {
    setPaused(prev => !prev)
  }, [])

  // ===== Cancelar meditacao =====
  const handleCancelar = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setFase('selecao')
    setMeditacaoEscolhida(null)
    setReflexao('')
  }, [])

  // ===== Guardar reflexao =====
  const handleSaveReflexao = useCallback(async () => {
    if (!userId || !meditacaoEscolhida) return
    setSaving(true)

    const duracaoMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    const duracaoMin = Math.max(1, Math.round(duracaoMs / 60000))

    try {
      const { error } = await supabase
        .from('imago_meditacoes_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          meditacao_id: meditacaoEscolhida.id,
          duracao_minutos: duracaoMin,
          reflexao: reflexao.trim() || null
        })

      if (error) throw error

      // Award 8 estrelas
      await awardEstrelas(8)

      setFase('conclusao')
      fetchLog()
    } catch (err) {
      console.error('Erro ao guardar meditacao:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, meditacaoEscolhida, reflexao, awardEstrelas, fetchLog])

  // ===== Skip reflexao =====
  const handleSkipReflexao = useCallback(async () => {
    setReflexao('')
    await handleSaveReflexao()
  }, [handleSaveReflexao])

  // ===== Nova meditacao =====
  const handleNovaMeditacao = useCallback(() => {
    setFase('selecao')
    setMeditacaoEscolhida(null)
    setReflexao('')
    setLinhaActual(0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // ===== Progress =====
  const progress = meditacaoEscolhida
    ? ((linhaActual + 1) / meditacaoEscolhida.script.length) * 100
    : 0

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      {fase !== 'player' && (
        <ModuleHeader
          eco="imago"
          title="Meditacoes de Essencia"
          subtitle="Quem sou sem rotulos?"
        />
      )}

      <div className={fase === 'player' ? '' : 'max-w-lg mx-auto px-4 pb-24'}>
        {/* ======= SELECAO ======= */}
        {fase === 'selecao' && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <button
                onClick={() => setView('meditar')}
                className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'meditar' ? 'text-white' : 'text-gray-500'}`}
                style={view === 'meditar' ? { background: `${ACCENT}33` } : undefined}
                aria-pressed={view === 'meditar'}
              >
                Meditar
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

            {view === 'meditar' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-sm text-gray-400 mb-4">
                  Escolhe uma meditacao guiada. Cada uma explora uma faceta diferente da tua identidade e essencia.
                </p>
                {MEDITACOES_ESSENCIA.map(med => (
                  <MeditacaoCard
                    key={med.id}
                    med={med}
                    onSelect={handleSelectMeditacao}
                  />
                ))}
              </div>
            )}

            {view === 'historico' && (
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
                    <div className="text-4xl">🧘</div>
                    <h3
                      className="text-lg font-semibold text-white"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Nenhuma meditacao registada
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">
                      As meditacoes de essencia ajudam-te a conectar com quem realmente es.
                    </p>
                    <button
                      onClick={() => setView('meditar')}
                      className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                    >
                      Comecar a meditar
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
                        <p className="text-xs text-gray-400">{logEntries.length === 1 ? 'meditacao' : 'meditacoes'}</p>
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
                      {logEntries.map((entry) => (
                        <LogEntry key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======= PLAYER ======= */}
        {fase === 'player' && meditacaoEscolhida && (
          <div
            className="fixed inset-0 flex flex-col z-50"
            style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #0d0f13 100%)` }}
          >
            {/* Cancel button */}
            <button
              onClick={handleCancelar}
              className="absolute top-6 left-6 z-10 p-2 rounded-lg"
              style={{ color: '#6a7490' }}
              aria-label="Cancelar meditacao"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <div className="text-center pt-16 pb-4 px-6">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6a7490' }}>
                {meditacaoEscolhida.nome}
              </p>
              <p className="text-xs" style={{ color: '#4d5a6a' }}>
                Passo {linhaActual + 1} de {meditacaoEscolhida.script.length}
              </p>
            </div>

            {/* Progress bar */}
            <div className="px-8 mb-8">
              <div className="h-1 rounded-full" style={{ background: `${ACCENT}22` }}>
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: ACCENT }}
                />
              </div>
            </div>

            {/* Script lines — center of screen */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
              <div className="w-full max-w-md space-y-4">
                {/* Previous lines (faded) */}
                {linhaActual > 0 && (
                  <div className="space-y-2 mb-6">
                    {meditacaoEscolhida.script.slice(Math.max(0, linhaActual - 2), linhaActual).map((line, idx) => (
                      <p
                        key={idx}
                        className="text-center leading-relaxed transition-all duration-500"
                        style={{
                          color: '#4d5a6a',
                          fontSize: '0.875rem',
                          fontFamily: "'Cormorant Garamond', serif",
                          opacity: 0.4 + (idx * 0.2)
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {/* Current line (highlighted) */}
                <div className="animate-fadeIn" key={linhaActual}>
                  <p
                    className="text-center leading-relaxed"
                    style={{
                      color: '#e8edf0',
                      fontSize: '1.25rem',
                      fontFamily: "'Cormorant Garamond', serif",
                      textShadow: `0 0 40px ${ACCENT}44`
                    }}
                  >
                    {meditacaoEscolhida.script[linhaActual]}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer indicator (auto-advance) */}
            {autoMode && !paused && (
              <div className="text-center mb-2">
                <p className="text-xs" style={{ color: '#4d5a6a' }}>
                  {tempoRestante}s
                </p>
              </div>
            )}

            {/* Duration display */}
            <div className="text-center mb-4">
              <p className="text-xs" style={{ color: '#4d5a6a' }}>
                ~{meditacaoEscolhida.duracao_min} min
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pb-12 px-8">
              {/* Pause/Resume */}
              <button
                onClick={handleTogglePause}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: paused ? ACCENT : `${ACCENT}22`,
                  color: paused ? '#fff' : ACCENT,
                  border: `1px solid ${ACCENT}44`
                }}
              >
                {paused ? 'Retomar' : 'Pausa'}
              </button>

              {/* Proximo */}
              <button
                onClick={handleProximo}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                {linhaActual === meditacaoEscolhida.script.length - 1 ? 'Concluir' : 'Proximo'}
              </button>
            </div>

            {/* Paused overlay */}
            {paused && (
              <div className="absolute bottom-28 left-0 right-0 text-center">
                <p className="text-sm animate-pulse" style={{ color: '#6a7490' }}>
                  Em pausa...
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======= REFLEXAO ======= */}
        {fase === 'reflexao' && meditacaoEscolhida && (
          <div className="flex flex-col items-center text-center px-4 py-8 space-y-6 animate-fadeIn">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
              aria-hidden="true"
            >
              🧘
            </div>

            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Meditacao completa
              </h2>
              <p className="text-sm text-gray-400">
                {meditacaoEscolhida.nome} — {g('Obrigado', 'Obrigada')} por este momento contigo.
              </p>
            </div>

            <div className="w-full max-w-md space-y-3">
              <label className="text-sm font-medium text-gray-300 text-left block">
                Como foi para ti? <span className="text-gray-500">(opcional)</span>
              </label>
              <textarea
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder="O que descobriste? O que sentiste? O que ficou..."
                rows={4}
                maxLength={2000}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                aria-label="Reflexao apos meditacao"
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
                onClick={handleSaveReflexao}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                {saving && reflexao.trim() ? 'A guardar...' : 'Guardar (+8 Estrelas)'}
              </button>
            </div>
          </div>
        )}

        {/* ======= CONCLUSAO ======= */}
        {fase === 'conclusao' && meditacaoEscolhida && (
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
                {g('Conectado', 'Conectada')} com a essencia
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                A tua pratica de "{meditacaoEscolhida.nome}" foi registada. +8 Estrelas
              </p>
            </div>

            {/* Summary */}
            <div
              className="w-full max-w-sm rounded-xl p-5 text-left"
              style={{ background: ACCENT_DARK, border: `1px solid ${ACCENT}22` }}
            >
              <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: `1px solid ${ACCENT}15` }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: '#6a7490' }}>Meditacao</span>
                <span className="text-sm font-medium text-white">{meditacaoEscolhida.nome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider" style={{ color: '#6a7490' }}>Duracao</span>
                <span className="text-sm font-medium text-white">~{meditacaoEscolhida.duracao_min} min</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm pt-2">
              <button
                onClick={handleNovaMeditacao}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ background: ACCENT }}
              >
                Outra meditacao
              </button>
              <button
                onClick={() => navigate('/imago/dashboard')}
                className="w-full py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
                style={{ color: '#9a8fb8', background: `${ACCENT}11` }}
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
