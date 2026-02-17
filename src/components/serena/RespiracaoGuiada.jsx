import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { TECNICAS_RESPIRACAO } from '../../lib/serena/gamificacao'

// ===== CONSTANTES =====

const SERENA_ACCENT = '#6B8E9B'
const SERENA_DARK = '#1a2a30'
const SERENA_BG = '#0f1c22'

const FEELING_SCALE = [
  { value: 1, label: 'Mal', emoji: '😣' },
  { value: 2, label: 'Em baixo', emoji: '😔' },
  { value: 3, label: 'Neutro', emoji: '😐' },
  { value: 4, label: 'Melhor', emoji: '🙂' },
  { value: 5, label: 'Bem', emoji: '😊' }
]

const ACCAO_LABELS = {
  inspira: 'Inspira...',
  segura: 'Segura...',
  expira: 'Expira...'
}

// Resolve labels for actions that may have extra instructions (e.g. "inspira (narina esquerda)")
function getAccaoLabel(accao) {
  const lower = accao.toLowerCase()
  if (lower.startsWith('inspira')) return accao.charAt(0).toUpperCase() + accao.slice(1) + '...'
  if (lower.startsWith('expira')) return accao.charAt(0).toUpperCase() + accao.slice(1) + '...'
  if (lower.startsWith('segura')) return 'Segura...'
  return accao + '...'
}

// Determine animation scale based on action
function getCircleScale(accao) {
  const lower = accao.toLowerCase()
  if (lower.startsWith('inspira')) return 1.0
  if (lower.startsWith('expira')) return 0.5
  return 0.75 // segura — hold at midpoint or current
}

// ===== COMPONENTE PRINCIPAL =====

export default function RespiracaoGuiada() {
  const navigate = useNavigate()
  const { user, userRecord } = useAuth()

  // Fase: 'selecao' | 'pre_check' | 'sessao' | 'pos_check' | 'conclusao'
  const [fase, setFase] = useState('selecao')
  const [tecnicaEscolhida, setTecnicaEscolhida] = useState(null)

  // Before/after feelings
  const [sentimentoAntes, setSentimentoAntes] = useState(null)
  const [sentimentoDepois, setSentimentoDepois] = useState(null)

  // Session state
  const [cicloActual, setCicloActual] = useState(0)
  const [passoActual, setPassoActual] = useState(0)
  const [tempoRestante, setTempoRestante] = useState(0)
  const [sessaoActiva, setSessaoActiva] = useState(false)
  const [sessaoPausada, setSessaoPausada] = useState(false)

  // Timing refs
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Saving state
  const [saving, setSaving] = useState(false)

  // ===== SELECAO DE TECNICA =====

  const handleSelectTecnica = (tecnica) => {
    setTecnicaEscolhida(tecnica)
    setFase('pre_check')
  }

  // ===== PRE-CHECK =====

  const handlePreCheck = (valor) => {
    setSentimentoAntes(valor)
    iniciarSessao()
  }

  // ===== SESSAO =====

  const iniciarSessao = useCallback(() => {
    setCicloActual(0)
    setPassoActual(0)
    setTempoRestante(tecnicaEscolhida.passos[0].duracao)
    setSessaoActiva(true)
    setSessaoPausada(false)
    setFase('sessao')
    startTimeRef.current = Date.now()
  }, [tecnicaEscolhida])

  // Tick timer
  useEffect(() => {
    if (!sessaoActiva || sessaoPausada || fase !== 'sessao' || !tecnicaEscolhida) return

    intervalRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          // Move to next step or cycle
          avancar()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sessaoActiva, sessaoPausada, fase, cicloActual, passoActual, tecnicaEscolhida])

  const avancar = useCallback(() => {
    if (!tecnicaEscolhida) return

    const totalPassos = tecnicaEscolhida.passos.length
    const totalCiclos = tecnicaEscolhida.ciclos

    setPassoActual(prevPasso => {
      const nextPasso = prevPasso + 1

      if (nextPasso >= totalPassos) {
        // End of cycle, move to next
        setCicloActual(prevCiclo => {
          const nextCiclo = prevCiclo + 1
          if (nextCiclo >= totalCiclos) {
            // Session complete
            finalizarSessao()
            return prevCiclo
          }
          // Start first step of new cycle
          setTempoRestante(tecnicaEscolhida.passos[0].duracao)
          return nextCiclo
        })
        return 0
      }

      // Next step in same cycle
      setTempoRestante(tecnicaEscolhida.passos[nextPasso].duracao)
      return nextPasso
    })
  }, [tecnicaEscolhida])

  const finalizarSessao = useCallback(() => {
    setSessaoActiva(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setFase('pos_check')
  }, [])

  const handlePausar = () => {
    setSessaoPausada(prev => !prev)
  }

  const handleCancelar = () => {
    setSessaoActiva(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setFase('selecao')
    setTecnicaEscolhida(null)
    setSentimentoAntes(null)
  }

  // ===== POS-CHECK =====

  const handlePosCheck = async (valor) => {
    setSentimentoDepois(valor)
    await salvarSessao(valor)
    setFase('conclusao')
  }

  // ===== SALVAR =====

  const salvarSessao = async (sentDepois) => {
    if (!user || !userRecord?.id) return
    setSaving(true)

    const duracao = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0

    try {
      await supabase.from('serena_respiracao_log').insert({
        user_id: userRecord.id,
        tecnica_id: tecnicaEscolhida.id,
        tecnica_nome: tecnicaEscolhida.nome,
        ciclos_completados: tecnicaEscolhida.ciclos,
        duracao_segundos: duracao,
        sentimento_antes: sentimentoAntes,
        sentimento_depois: sentDepois,
        created_at: new Date().toISOString()
      })
    } catch (err) {
      console.error('Erro ao guardar sessao de respiracao:', err)
    } finally {
      setSaving(false)
    }
  }

  // ===== NOVA SESSAO =====

  const handleNovaSessao = () => {
    setFase('selecao')
    setTecnicaEscolhida(null)
    setSentimentoAntes(null)
    setSentimentoDepois(null)
    setCicloActual(0)
    setPassoActual(0)
    setSessaoActiva(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // ===== RENDER =====

  return (
    <div className="min-h-screen" style={{ background: SERENA_BG, color: '#e8edf0' }}>
      {fase !== 'sessao' && (
        <ModuleHeader
          eco="serena"
          title="Respiracao Guiada"
          subtitle="Acalma o corpo, acalma a mente"
        />
      )}

      <div className={fase === 'sessao' ? '' : 'max-w-2xl mx-auto px-4 py-6'}>
        {fase === 'selecao' && (
          <TecnicaSelecao onSelect={handleSelectTecnica} />
        )}

        {fase === 'pre_check' && (
          <FeelingCheck
            titulo="Como te sentes agora?"
            subtitulo="Antes de comecar, avalia como estas neste momento."
            onSelect={handlePreCheck}
          />
        )}

        {fase === 'sessao' && tecnicaEscolhida && (
          <SessaoActiva
            tecnica={tecnicaEscolhida}
            cicloActual={cicloActual}
            passoActual={passoActual}
            tempoRestante={tempoRestante}
            pausada={sessaoPausada}
            onPausar={handlePausar}
            onCancelar={handleCancelar}
          />
        )}

        {fase === 'pos_check' && (
          <FeelingCheck
            titulo="Como te sentes agora?"
            subtitulo="A sessao terminou. Avalia como estas agora."
            onSelect={handlePosCheck}
          />
        )}

        {fase === 'conclusao' && (
          <Conclusao
            tecnica={tecnicaEscolhida}
            sentimentoAntes={sentimentoAntes}
            sentimentoDepois={sentimentoDepois}
            startTime={startTimeRef.current}
            onNovaSessao={handleNovaSessao}
            onVoltar={() => navigate('/serena/dashboard')}
            saving={saving}
          />
        )}
      </div>
    </div>
  )
}

// ===== SUB-COMPONENTES =====

// --- Selecao de Tecnica ---

function TecnicaSelecao({ onSelect }) {
  return (
    <div>
      <p className="text-sm mb-6" style={{ color: '#9ab3bd' }}>
        Escolhe uma tecnica de respiracao. Cada uma trabalha de forma diferente no teu corpo e mente.
      </p>

      <div className="space-y-3">
        {TECNICAS_RESPIRACAO.map(tecnica => (
          <button
            key={tecnica.id}
            onClick={() => onSelect(tecnica)}
            className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: SERENA_DARK,
              border: `1px solid ${SERENA_ACCENT}33`
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1" style={{ color: '#e8edf0' }}>
                  {tecnica.nome}
                </h3>
                <p className="text-sm mb-2" style={{ color: '#8da3ad' }}>
                  {tecnica.descricao}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tecnica.para.split(', ').map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${SERENA_ACCENT}22`,
                        color: SERENA_ACCENT,
                        border: `1px solid ${SERENA_ACCENT}44`
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: `${SERENA_ACCENT}22` }}
              >
                {tecnica.id === '4-7-8' && '🌙'}
                {tecnica.id === 'box' && '⬜'}
                {tecnica.id === 'oceanica' && '🌊'}
                {tecnica.id === 'suspiro' && '💨'}
                {tecnica.id === 'alternada' && '👃'}
                {tecnica.id === 'coerencia' && '💗'}
              </div>
            </div>
            <div className="mt-2 text-xs" style={{ color: '#6a8490' }}>
              {tecnica.ciclos} ciclos &middot; {tecnica.passos.map(p => `${p.duracao}s`).join(' - ')}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Feeling Check (Before/After) ---

function FeelingCheck({ titulo, subtitulo, onSelect }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: '#e8edf0', fontFamily: "'Cormorant Garamond', serif" }}
      >
        {titulo}
      </h2>
      <p className="text-sm mb-8" style={{ color: '#8da3ad' }}>
        {subtitulo}
      </p>

      <div className="flex gap-3 mb-8">
        {FEELING_SCALE.map(item => (
          <button
            key={item.value}
            onClick={() => setSelected(item.value)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200"
            style={{
              background: selected === item.value ? `${SERENA_ACCENT}33` : `${SERENA_DARK}`,
              border: `2px solid ${selected === item.value ? SERENA_ACCENT : 'transparent'}`,
              transform: selected === item.value ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs" style={{ color: selected === item.value ? '#e8edf0' : '#6a8490' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <button
          onClick={() => onSelect(selected)}
          className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ background: SERENA_ACCENT }}
        >
          Continuar
        </button>
      )}
    </div>
  )
}

// --- Sessao Activa (Breathing Session) ---

function SessaoActiva({ tecnica, cicloActual, passoActual, tempoRestante, pausada, onPausar, onCancelar }) {
  const passoInfo = tecnica.passos[passoActual]
  const accao = passoInfo.accao
  const duracao = passoInfo.duracao
  const scale = getCircleScale(accao)
  const label = getAccaoLabel(accao)

  // Calculate progress within current step (0 to 1)
  const progresso = 1 - (tempoRestante / duracao)

  // Determine transition duration — matches step duration for smooth animation
  const transitionDuration = pausada ? '0.3s' : `${duracao}s`

  // Background pulse color based on action
  const bgColor = accao.toLowerCase().startsWith('inspira')
    ? `${SERENA_ACCENT}15`
    : accao.toLowerCase().startsWith('expira')
      ? `${SERENA_ACCENT}08`
      : `${SERENA_ACCENT}10`

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: SERENA_BG }}
    >
      {/* Soft background pulse */}
      <div
        className="absolute inset-0 transition-colors"
        style={{
          background: `radial-gradient(circle at center, ${bgColor} 0%, ${SERENA_BG} 70%)`,
          transitionDuration: '1s'
        }}
      />

      {/* Cancel button top-left */}
      <button
        onClick={onCancelar}
        className="absolute top-6 left-6 z-10 p-2 rounded-lg text-sm"
        style={{ color: '#6a8490' }}
        aria-label="Cancelar sessao"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Technique name */}
      <p className="relative z-10 text-sm mb-2" style={{ color: '#6a8490' }}>
        {tecnica.nome}
      </p>

      {/* Cycle counter */}
      <p className="relative z-10 text-xs mb-8" style={{ color: '#4d6a75' }}>
        Ciclo {cicloActual + 1} de {tecnica.ciclos}
      </p>

      {/* Breathing circle */}
      <div className="relative z-10 flex items-center justify-center mb-8">
        {/* Outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: '220px',
            height: '220px',
            border: `2px solid ${SERENA_ACCENT}33`,
            transition: `transform ${transitionDuration} ease-in-out`,
            transform: `scale(${scale})`
          }}
        />

        {/* Main breathing circle */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: '180px',
            height: '180px',
            background: `radial-gradient(circle at 40% 40%, ${SERENA_ACCENT}66, ${SERENA_ACCENT}22)`,
            boxShadow: `0 0 ${scale > 0.7 ? '60' : '20'}px ${SERENA_ACCENT}${scale > 0.7 ? '44' : '22'}`,
            transition: `transform ${transitionDuration} ease-in-out, box-shadow ${transitionDuration} ease-in-out`,
            transform: `scale(${scale})`
          }}
        >
          {/* Timer number */}
          <span
            className="text-4xl font-light tabular-nums"
            style={{ color: '#e8edf0', fontFamily: "'Cormorant Garamond', serif" }}
          >
            {tempoRestante}
          </span>
        </div>
      </div>

      {/* Action label */}
      <h2
        className="relative z-10 text-2xl font-light mb-2"
        style={{
          color: '#e8edf0',
          fontFamily: "'Cormorant Garamond', serif"
        }}
      >
        {label}
      </h2>

      {/* Step dots */}
      <div className="relative z-10 flex gap-2 mb-10">
        {tecnica.passos.map((_, idx) => (
          <div
            key={idx}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: idx === passoActual ? SERENA_ACCENT : `${SERENA_ACCENT}33`,
              transform: idx === passoActual ? 'scale(1.4)' : 'scale(1)'
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex gap-4">
        <button
          onClick={onPausar}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: pausada ? SERENA_ACCENT : `${SERENA_ACCENT}22`,
            color: pausada ? '#fff' : SERENA_ACCENT,
            border: `1px solid ${SERENA_ACCENT}44`
          }}
        >
          {pausada ? 'Retomar' : 'Pausa'}
        </button>
      </div>

      {/* Paused overlay */}
      {pausada && (
        <p
          className="relative z-10 mt-4 text-sm animate-pulse"
          style={{ color: '#6a8490' }}
        >
          Em pausa...
        </p>
      )}
    </div>
  )
}

// --- Conclusao (Completion Screen) ---

function Conclusao({ tecnica, sentimentoAntes, sentimentoDepois, startTime, onNovaSessao, onVoltar, saving }) {
  const duracao = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
  const minutos = Math.floor(duracao / 60)
  const segundos = duracao % 60

  const melhoria = sentimentoDepois - sentimentoAntes
  const feelingAntes = FEELING_SCALE.find(f => f.value === sentimentoAntes)
  const feelingDepois = FEELING_SCALE.find(f => f.value === sentimentoDepois)

  const mensagemEncorajamento = () => {
    if (melhoria >= 2) return `Que transformacao! ${g('Estas', 'Estas')} a cuidar bem de ti.`
    if (melhoria >= 1) return `Boa. Cada respiracao conta. ${g('Continua', 'Continua')} assim.`
    if (melhoria === 0) return `Mesmo sem mudanca aparente, o teu corpo agradece. A pratica conta.`
    return `As vezes precisamos de mais tempo. ${g('Se gentil contigo', 'Se gentil contigo')}.`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Completion icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: `${SERENA_ACCENT}22` }}
      >
        <span className="text-4xl">🫁</span>
      </div>

      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: '#e8edf0', fontFamily: "'Cormorant Garamond', serif" }}
      >
        Sessao Completa
      </h2>

      <p className="text-sm mb-8" style={{ color: '#8da3ad' }}>
        {mensagemEncorajamento()}
      </p>

      {/* Summary card */}
      <div
        className="w-full max-w-sm rounded-xl p-5 mb-8 text-left"
        style={{ background: SERENA_DARK, border: `1px solid ${SERENA_ACCENT}22` }}
      >
        {/* Technique */}
        <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: `1px solid ${SERENA_ACCENT}15` }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: '#6a8490' }}>Tecnica</span>
          <span className="text-sm font-medium" style={{ color: '#e8edf0' }}>{tecnica.nome}</span>
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: `1px solid ${SERENA_ACCENT}15` }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: '#6a8490' }}>Duracao</span>
          <span className="text-sm font-medium" style={{ color: '#e8edf0' }}>
            {minutos > 0 ? `${minutos}min ${segundos}s` : `${segundos}s`}
          </span>
        </div>

        {/* Before → After */}
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider" style={{ color: '#6a8490' }}>Sentimento</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">{feelingAntes?.emoji}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke={SERENA_ACCENT} strokeWidth="2" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-lg">{feelingDepois?.emoji}</span>
            {melhoria > 0 && (
              <span className="text-xs font-medium ml-1" style={{ color: '#5D9B84' }}>
                +{melhoria}
              </span>
            )}
            {melhoria < 0 && (
              <span className="text-xs font-medium ml-1" style={{ color: '#C1634A' }}>
                {melhoria}
              </span>
            )}
          </div>
        </div>
      </div>

      {saving && (
        <p className="text-xs mb-4" style={{ color: '#6a8490' }}>A guardar...</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onNovaSessao}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ background: SERENA_ACCENT }}
        >
          Mais uma sessao?
        </button>
        <button
          onClick={onVoltar}
          className="w-full py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
          style={{ color: '#8da3ad', background: `${SERENA_ACCENT}11` }}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
