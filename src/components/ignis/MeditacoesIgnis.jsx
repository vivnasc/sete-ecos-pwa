import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import AudioPlayerBar from '../shared/AudioPlayerBar'
import { MEDITACOES_IGNIS } from '../../lib/ignis/meditacoes'

// ============================================================
// IGNIS — Meditações e Afirmações
// Chakra: Manipura (Plexo Solar) — 320Hz
// Tema: Fogo, Vontade, Foco, Coragem
// Player: auto-advance por linha com drone de fundo
// ============================================================

const ACCENT = '#E85D04'
const ACCENT_DARK = '#1a0a00'
const ACCENT_SUBTLE = 'rgba(232,93,4,0.12)'
const AUTO_ADVANCE_SECONDS = 14

// ---- Card de meditação ----
const MeditacaoCard = ({ med, onSelect }) => (
  <button
    onClick={() => onSelect(med)}
    className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,93,4,0.2)' }}
    aria-label={`${med.nome} — ${med.duracao_min} minutos`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: med.categoria === 'meditacao' ? `${ACCENT}22` : 'rgba(255,200,0,0.15)',
              color: med.categoria === 'meditacao' ? ACCENT : '#FFC107',
              border: `1px solid ${med.categoria === 'meditacao' ? ACCENT : '#FFC107'}44`
            }}
          >
            {med.categoria === 'meditacao' ? 'Meditação' : 'Afirmações'}
          </span>
        </div>
        <h3 className="font-semibold text-base mb-1 text-white">{med.nome}</h3>
        <p className="text-sm mb-2" style={{ color: '#9a8070' }}>{med.descricao}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: '#b87050' }}>
            {med.duracao_min} min
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#6a5a4a' }}>
            {med.script.length} passos
          </span>
        </div>
      </div>
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: `${ACCENT}18` }}
        aria-hidden="true"
      >
        {med.icone}
      </div>
    </div>
  </button>
)

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function MeditacoesIgnis() {
  const navigate = useNavigate()

  // Fase: 'selecao' | 'player' | 'conclusao'
  const [fase, setFase] = useState('selecao')
  const [escolhida, setEscolhida] = useState(null)

  // Player
  const [linhaActual, setLinhaActual] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(AUTO_ADVANCE_SECONDS)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Filtro
  const [filtro, setFiltro] = useState('todos') // 'todos' | 'meditacao' | 'afirmacoes'

  const meditacoesFiltradas = filtro === 'todos'
    ? MEDITACOES_IGNIS
    : MEDITACOES_IGNIS.filter(m => m.categoria === filtro)

  // ===== Seleccionar ====
  const handleSelect = useCallback((med) => {
    setEscolhida(med)
    setLinhaActual(0)
    setPaused(false)
    setTempoRestante(AUTO_ADVANCE_SECONDS)
    setFase('player')
    startTimeRef.current = Date.now()
  }, [])

  // ===== Timer auto-advance =====
  useEffect(() => {
    if (fase !== 'player' || paused || !escolhida) return

    intervalRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          setLinhaActual(prevLinha => {
            const next = prevLinha + 1
            if (next >= escolhida.script.length) {
              clearInterval(intervalRef.current)
              setFase('conclusao')
              return prevLinha
            }
            return next
          })
          return AUTO_ADVANCE_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fase, paused, escolhida])

  // ===== Avançar manualmente =====
  const handleProximo = useCallback(() => {
    if (!escolhida) return
    const next = linhaActual + 1
    if (next >= escolhida.script.length) {
      setFase('conclusao')
    } else {
      setLinhaActual(next)
      setTempoRestante(AUTO_ADVANCE_SECONDS)
    }
  }, [escolhida, linhaActual])

  // ===== Cancelar =====
  const handleCancelar = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setFase('selecao')
    setEscolhida(null)
  }, [])

  // ===== Nova =====
  const handleNova = useCallback(() => {
    setFase('selecao')
    setEscolhida(null)
    setLinhaActual(0)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const progress = escolhida ? ((linhaActual + 1) / escolhida.script.length) * 100 : 0

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #100800 30%, #0d0800 100%)` }}>

      {fase !== 'player' && (
        <ModuleHeader
          eco="ignis"
          title="Meditações & Afirmações"
          subtitle="Acende a tua chama interior"
        />
      )}

      <div className={fase === 'player' ? '' : 'max-w-lg mx-auto px-4 pb-24'}>

        {/* ======= SELECAO ======= */}
        {fase === 'selecao' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Nota drone */}
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}20` }}
            >
              <span className="text-xl flex-shrink-0">🔥</span>
              <p className="text-xs" style={{ color: '#9a7060' }}>
                Para melhor experiência, reproduz o ficheiro <strong style={{ color: ACCENT }}>ignis-drone.mp3</strong> em segundo plano enquanto ouves a narração.
              </p>
            </div>

            {/* Filtro */}
            <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'meditacao', label: 'Meditações' },
                { key: 'afirmacoes', label: 'Afirmações' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className="flex-1 py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    color: filtro === f.key ? '#fff' : '#6a5a4a',
                    background: filtro === f.key ? `${ACCENT}33` : 'transparent',
                  }}
                  aria-pressed={filtro === f.key}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Lista */}
            <div className="space-y-3">
              {meditacoesFiltradas.map(med => (
                <MeditacaoCard key={med.id} med={med} onSelect={handleSelect} />
              ))}
            </div>
          </div>
        )}

        {/* ======= PLAYER ======= */}
        {fase === 'player' && escolhida && (
          <div
            className="fixed inset-0 flex flex-col z-50"
            style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #0d0800 100%)` }}
          >
            {/* Cancelar */}
            <button
              onClick={handleCancelar}
              className="absolute top-6 left-6 z-10 p-2 rounded-lg"
              style={{ color: '#6a5a4a' }}
              aria-label="Cancelar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Drone lembrete */}
            <div className="absolute top-6 right-6 z-10">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}33` }}
              >
                🎵 ignis-drone.mp3
              </span>
            </div>

            {/* Áudio narrado (se disponível no Storage) */}
            {escolhida.slug && (
              <div className="absolute top-16 left-6 right-6 z-10">
                <AudioPlayerBar eco="ignis" slug={escolhida.slug} accentColor={ACCENT} />
              </div>
            )}

            {/* Título */}
            <div className="text-center pt-16 pb-4 px-6">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6a5a4a' }}>
                {escolhida.icone} {escolhida.nome}
              </p>
              <p className="text-xs" style={{ color: '#4d3020' }}>
                Passo {linhaActual + 1} de {escolhida.script.length}
              </p>
            </div>

            {/* Barra progresso */}
            <div className="px-8 mb-8">
              <div className="h-1 rounded-full" style={{ background: `${ACCENT}22` }}>
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #FF8C42)` }}
                />
              </div>
            </div>

            {/* Linhas do script */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
              {/* Linhas anteriores (desbotadas) */}
              {linhaActual >= 2 && (
                <p className="text-sm text-center mb-3 opacity-20 transition-opacity duration-500" style={{ color: '#c0a080' }}>
                  {escolhida.script[linhaActual - 2]}
                </p>
              )}
              {linhaActual >= 1 && (
                <p className="text-base text-center mb-4 opacity-40 transition-opacity duration-500" style={{ color: '#c0a080' }}>
                  {escolhida.script[linhaActual - 1]}
                </p>
              )}

              {/* Linha actual */}
              <p
                className="text-xl sm:text-2xl text-center font-medium leading-relaxed transition-all duration-500"
                style={{ color: '#fff', fontFamily: 'var(--font-titulos)', textShadow: `0 0 30px ${ACCENT}66` }}
              >
                {escolhida.script[linhaActual]}
              </p>

              {/* Timer */}
              <div className="mt-8 flex items-center gap-2">
                <div
                  className="w-8 h-1 rounded-full overflow-hidden"
                  style={{ background: `${ACCENT}22` }}
                >
                  <div
                    className="h-1 rounded-full transition-none"
                    style={{
                      width: `${((AUTO_ADVANCE_SECONDS - tempoRestante) / AUTO_ADVANCE_SECONDS) * 100}%`,
                      background: ACCENT
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: '#6a5a4a' }}>{tempoRestante}s</span>
              </div>
            </div>

            {/* Controlos */}
            <div className="pb-12 px-8 flex items-center justify-center gap-6">
              {/* Pausar/Retomar */}
              <button
                onClick={() => setPaused(p => !p)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{ background: `${ACCENT}22`, border: `2px solid ${ACCENT}44` }}
                aria-label={paused ? 'Retomar' : 'Pausar'}
              >
                {paused ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" style={{ color: ACCENT }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" style={{ color: ACCENT }}>
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                )}
              </button>

              {/* Próximo */}
              <button
                onClick={handleProximo}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #FF8C42)` }}
                aria-label="Próximo passo"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ======= CONCLUSAO ======= */}
        {fase === 'conclusao' && escolhida && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fadeIn">
            <div className="text-6xl">{escolhida.icone}</div>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {escolhida.categoria === 'meditacao' ? 'Meditação completa' : 'Afirmações completas'}
            </h2>
            <p className="text-sm max-w-xs" style={{ color: '#9a7060' }}>
              {escolhida.categoria === 'meditacao'
                ? `${g('Completaste', 'Completaste')} a meditação "${escolhida.nome}". O teu fogo interior está mais aceso.`
                : `${g('Repetiste', 'Repetiste')} as afirmações "${escolhida.nome}". Estas palavras ficam contigo.`
              }
            </p>
            <p className="text-xs italic" style={{ color: '#6a5a4a' }}>
              — Vivianne
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
              <button
                onClick={handleNova}
                className="w-full py-3 rounded-xl font-medium text-sm text-white transition-all duration-200 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #FF8C42)` }}
              >
                Escolher outra
              </button>
              <button
                onClick={() => navigate('/ignis/dashboard')}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#9a7060' }}
              >
                Voltar ao painel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
