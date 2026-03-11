import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import AudioPlayerBar from '../shared/AudioPlayerBar'
import { MEDITACOES_ECOA } from '../../lib/ecoa/meditacoes'

// ============================================================
// ECOA — Meditações e Afirmações
// Chakra: Vishuddha (Garganta) — 741Hz
// Tema: Voz, Expressão, Silêncio, Verdade
// Player: auto-advance por linha com drone de fundo
// ============================================================

const ACCENT = '#4A90A4'
const ACCENT_DARK = '#0f1e24'
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)'
const AUTO_ADVANCE_SECONDS = 14

// ---- Card de meditação ----
const MeditacaoCard = ({ med, onSelect }) => (
  <button
    onClick={() => onSelect(med)}
    className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,144,164,0.2)' }}
    aria-label={`${med.nome} — ${med.duracao_min} minutos`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: med.categoria === 'meditacao' ? `${ACCENT}22` : 'rgba(100,200,180,0.15)',
              color: med.categoria === 'meditacao' ? ACCENT : '#64C8B4',
              border: `1px solid ${med.categoria === 'meditacao' ? ACCENT : '#64C8B4'}44`
            }}
          >
            {med.categoria === 'meditacao' ? 'Meditação' : 'Afirmações'}
          </span>
        </div>
        <h3 className="font-semibold text-base mb-1 text-white">{med.nome}</h3>
        <p className="text-sm mb-2" style={{ color: '#7a9aaa' }}>{med.descricao}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: '#5a8090' }}>
            {med.duracao_min} min
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#4a6070' }}>
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
export default function MeditacoesEcoa() {
  const navigate = useNavigate()

  // Fase: 'selecao' | 'player' | 'conclusao'
  const [fase, setFase] = useState('selecao')
  const [escolhida, setEscolhida] = useState(null)

  // Player
  const [linhaActual, setLinhaActual] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(AUTO_ADVANCE_SECONDS)
  const intervalRef = useRef(null)

  // Filtro
  const [filtro, setFiltro] = useState('todos')

  const meditacoesFiltradas = filtro === 'todos'
    ? MEDITACOES_ECOA
    : MEDITACOES_ECOA.filter(m => m.categoria === filtro)

  // ===== Seleccionar =====
  const handleSelect = useCallback((med) => {
    setEscolhida(med)
    setLinhaActual(0)
    setPaused(false)
    setTempoRestante(AUTO_ADVANCE_SECONDS)
    setFase('player')
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
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #0a1520 30%, #080f15 100%)` }}>

      {fase !== 'player' && (
        <ModuleHeader
          eco="ecoa"
          title="Meditações & Afirmações"
          subtitle="Recupera a tua voz interior"
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
              <span className="text-xl flex-shrink-0">🔊</span>
              <p className="text-xs" style={{ color: '#5a8090' }}>
                Para melhor experiência, reproduz o ficheiro <strong style={{ color: ACCENT }}>ecoa-drone.mp3</strong> em segundo plano enquanto ouves a narração.
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
                    color: filtro === f.key ? '#fff' : '#4a6070',
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
            style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #080f15 100%)` }}
          >
            {/* Cancelar */}
            <button
              onClick={handleCancelar}
              className="absolute top-6 left-6 z-10 p-2 rounded-lg"
              style={{ color: '#4a6070' }}
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
                🎵 ecoa-drone.mp3
              </span>
            </div>

            {/* Áudio narrado (se disponível no Storage) */}
            {escolhida.slug && (
              <div className="absolute top-16 left-6 right-6 z-10">
                <AudioPlayerBar eco="ecoa" slug={escolhida.slug} accentColor={ACCENT} />
              </div>
            )}

            {/* Título */}
            <div className="text-center pt-16 pb-4 px-6">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#4a6070' }}>
                {escolhida.icone} {escolhida.nome}
              </p>
              <p className="text-xs" style={{ color: '#2a4050' }}>
                Passo {linhaActual + 1} de {escolhida.script.length}
              </p>
            </div>

            {/* Barra progresso */}
            <div className="px-8 mb-8">
              <div className="h-1 rounded-full" style={{ background: `${ACCENT}22` }}>
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #64C8B4)` }}
                />
              </div>
            </div>

            {/* Linhas do script */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
              {linhaActual >= 2 && (
                <p className="text-sm text-center mb-3 opacity-20 transition-opacity duration-500" style={{ color: '#a0c0c8' }}>
                  {escolhida.script[linhaActual - 2]}
                </p>
              )}
              {linhaActual >= 1 && (
                <p className="text-base text-center mb-4 opacity-40 transition-opacity duration-500" style={{ color: '#a0c0c8' }}>
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
                <div className="w-8 h-1 rounded-full overflow-hidden" style={{ background: `${ACCENT}22` }}>
                  <div
                    className="h-1 rounded-full transition-none"
                    style={{
                      width: `${((AUTO_ADVANCE_SECONDS - tempoRestante) / AUTO_ADVANCE_SECONDS) * 100}%`,
                      background: ACCENT
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: '#4a6070' }}>{tempoRestante}s</span>
              </div>
            </div>

            {/* Controlos */}
            <div className="pb-12 px-8 flex items-center justify-center gap-6">
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

              <button
                onClick={handleProximo}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #64C8B4)` }}
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
            <p className="text-sm max-w-xs" style={{ color: '#7a9aaa' }}>
              {escolhida.categoria === 'meditacao'
                ? `${g('Completaste', 'Completaste')} a meditação "${escolhida.nome}". A tua voz interior foi ouvida.`
                : `${g('Repetiste', 'Repetiste')} as afirmações "${escolhida.nome}". Estas palavras ficam contigo.`
              }
            </p>
            <p className="text-xs italic" style={{ color: '#4a6070' }}>
              — Vivianne
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
              <button
                onClick={handleNova}
                className="w-full py-3 rounded-xl font-medium text-sm text-white transition-all duration-200 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #64C8B4)` }}
              >
                Escolher outra
              </button>
              <button
                onClick={() => navigate('/ecoa/dashboard')}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#7a9aaa' }}
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
