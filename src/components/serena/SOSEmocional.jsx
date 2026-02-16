import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ===== CONSTANTES =====

const SERENA_COLOR = '#6B8E9B'
const SERENA_DARK = '#1a2e3a'

const TECNICAS = [
  { id: 'respiracao', nome: 'Respiracao Box', icone: 'breath', duracao: '~4 min' },
  { id: 'grounding', nome: '5-4-3-2-1 Grounding', icone: 'ground', duracao: '~3 min' },
  { id: 'bodyscan', nome: 'Body Scan Rapido', icone: 'body', duracao: '~3 min' }
]

const GROUNDING_PASSOS = [
  { numero: 5, sentido: 'ves', instrucao: 'Olha a tua volta. Identifica 5 coisas que consegues ver.' },
  { numero: 4, sentido: 'tocas', instrucao: 'Toca em 4 coisas perto de ti. Sente a textura.' },
  { numero: 3, sentido: 'ouves', instrucao: 'Fica em silencio. Identifica 3 sons a tua volta.' },
  { numero: 2, sentido: 'cheiras', instrucao: 'Respira fundo. Identifica 2 cheiros.' },
  { numero: 1, sentido: 'saboreias', instrucao: 'Nota 1 sabor na tua boca, mesmo que subtil.' }
]

const BODY_ZONAS = [
  {
    nome: 'Cabeca',
    instrucao: 'Fecha os olhos. Repara nas sensacoes no topo da tua cabeca, testa, rosto. Relaxa a mandibula. Solta a tensao entre as sobrancelhas.'
  },
  {
    nome: 'Ombros',
    instrucao: 'Desce a atencao para os ombros. Nota se estao tensos ou levantados. Inspira e ao expirar, deixa-os cair suavemente.'
  },
  {
    nome: 'Peito',
    instrucao: 'Sente o teu peito. Observa o movimento da respiracao. Nota se ha aperto ou abertura. Nao mudes nada, apenas observa.'
  },
  {
    nome: 'Barriga',
    instrucao: 'Traz a atencao para a barriga. Sente-a a expandir e contrair com cada respiracao. Permite que ela se solte.'
  },
  {
    nome: 'Pernas',
    instrucao: 'Nota as tuas pernas. Sente o contacto com a cadeira ou o chao. Relaxa as coxas, joelhos, pantorrilhas.'
  },
  {
    nome: 'Pes',
    instrucao: 'Termina nos pes. Sente o peso do teu corpo nos pes. Imagina raizes a crescer para baixo, ancorando-te a terra.'
  }
]

const BODY_TEMPO_POR_ZONA = 30 // segundos

// ===== ICONES SVG =====

function BreathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function GroundIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M12 22V8M5 12l7-4 7 4" />
      <circle cx="12" cy="5" r="3" />
    </svg>
  )
}

function BodyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <circle cx="12" cy="4" r="2.5" />
      <path d="M12 7v6M12 13l-4 7M12 13l4 7M8 10h8" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

const TECNICA_ICONES = {
  breath: BreathIcon,
  ground: GroundIcon,
  body: BodyIcon
}

// ===== COMPONENTE: Menu de Tecnicas =====

function MenuTecnicas({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
          style={{ backgroundColor: `${SERENA_COLOR}30` }}
        >
          <span className="text-3xl font-bold" style={{ color: SERENA_COLOR }}>SOS</span>
        </div>
        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {g('Estas seguro', 'Estas segura')}. Respira.
        </h2>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Escolhe uma tecnica rapida para te acalmar. Nao precisas de conta, nada e guardado.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {TECNICAS.map((tecnica) => {
          const Icone = TECNICA_ICONES[tecnica.icone]
          return (
            <button
              key={tecnica.id}
              onClick={() => onSelect(tecnica.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: `${SERENA_COLOR}18`,
                border: `1px solid ${SERENA_COLOR}40`
              }}
              aria-label={`Iniciar ${tecnica.nome}`}
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${SERENA_COLOR}30`, color: SERENA_COLOR }}
              >
                <Icone />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base">{tecnica.nome}</h3>
                <p className="text-white/50 text-xs mt-0.5">{tecnica.duracao}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke={SERENA_COLOR} strokeWidth="2" className="w-5 h-5 flex-shrink-0 opacity-60">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===== COMPONENTE: Respiracao Box =====

const FASES_RESPIRACAO = [
  { label: 'Inspira', duracao: 4 },
  { label: 'Segura', duracao: 4 },
  { label: 'Expira', duracao: 4 },
  { label: 'Segura', duracao: 4 }
]

function RespiracaoBox({ onVoltar, onConcluir }) {
  const [activa, setActiva] = useState(false)
  const [faseIndex, setFaseIndex] = useState(0)
  const [contador, setContador] = useState(4)
  const [ciclos, setCiclos] = useState(0)
  const totalCiclos = 4
  const intervalRef = useRef(null)
  const animRef = useRef(null)

  const fase = FASES_RESPIRACAO[faseIndex]

  // Escala do circulo por fase: inspira=crescer, segurar=manter, expirar=encolher
  const getEscala = () => {
    if (faseIndex === 0) {
      // Inspira: cresce de 0.6 a 1.0
      return 0.6 + (0.4 * (1 - contador / 4))
    }
    if (faseIndex === 1) return 1.0  // Segura grande
    if (faseIndex === 2) {
      // Expira: encolhe de 1.0 a 0.6
      return 1.0 - (0.4 * (1 - contador / 4))
    }
    return 0.6 // Segura pequeno
  }

  const tentarVibrar = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch {
      // Haptic not available
    }
  }, [])

  const iniciar = useCallback(() => {
    setActiva(true)
    setFaseIndex(0)
    setContador(4)
    setCiclos(0)
    tentarVibrar()
  }, [tentarVibrar])

  useEffect(() => {
    if (!activa) return

    intervalRef.current = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          // Avancar para proxima fase
          setFaseIndex(prevFase => {
            const next = prevFase + 1
            if (next >= FASES_RESPIRACAO.length) {
              // Completou um ciclo
              setCiclos(prevCiclos => {
                const novoCiclo = prevCiclos + 1
                if (novoCiclo >= totalCiclos) {
                  // Terminou
                  setActiva(false)
                  clearInterval(intervalRef.current)
                  tentarVibrar()
                  setTimeout(() => onConcluir(), 500)
                  return novoCiclo
                }
                return novoCiclo
              })
              return 0
            }
            tentarVibrar()
            return next
          })
          return FASES_RESPIRACAO[0].duracao // reset 4
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activa, tentarVibrar, onConcluir])

  if (!activa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Respiracao Box
        </h2>
        <p className="text-white/60 text-sm mb-8 max-w-xs">
          Uma tecnica de respiracao em quadrado: inspira, segura, expira, segura — 4 segundos cada.
          Vamos fazer {totalCiclos} ciclos.
        </p>

        <button
          onClick={iniciar}
          className="px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: SERENA_COLOR }}
        >
          Comecar
        </button>

        <button
          onClick={onVoltar}
          className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Voltar ao menu
        </button>
      </div>
    )
  }

  const escala = getEscala()
  const progresso = ((ciclos * 4 + faseIndex) / (totalCiclos * 4)) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Progresso */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between text-white/40 text-xs mb-2">
          <span>Ciclo {ciclos + 1} de {totalCiclos}</span>
          <span>{Math.round(progresso)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progresso}%`, backgroundColor: SERENA_COLOR }}
          />
        </div>
      </div>

      {/* Circulo animado */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center"
          style={{
            transform: `scale(${escala})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: `${SERENA_COLOR}25`,
            border: `2px solid ${SERENA_COLOR}60`,
            boxShadow: `0 0 40px ${SERENA_COLOR}20, inset 0 0 40px ${SERENA_COLOR}10`
          }}
        >
          <div className="text-center">
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: SERENA_COLOR }}
            >
              {contador}
            </p>
            <p className="text-white/80 text-sm font-medium">{fase.label}</p>
          </div>
        </div>
      </div>

      {/* Indicador de fase */}
      <div className="flex gap-2 mb-8">
        {FASES_RESPIRACAO.map((f, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === faseIndex ? SERENA_COLOR : `${SERENA_COLOR}30`,
              transform: i === faseIndex ? 'scale(1.3)' : 'scale(1)'
            }}
          />
        ))}
      </div>

      <button
        onClick={() => {
          setActiva(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
          onVoltar()
        }}
        className="text-white/30 text-xs hover:text-white/50 transition-colors"
      >
        Parar e voltar
      </button>
    </div>
  )
}

// ===== COMPONENTE: 5-4-3-2-1 Grounding =====

function GroundingExercicio({ onVoltar, onConcluir }) {
  const [passoActual, setPassoActual] = useState(-1) // -1 = intro
  const [concluido, setConcluido] = useState(false)

  const passo = GROUNDING_PASSOS[passoActual]
  const totalPassos = GROUNDING_PASSOS.length

  const avancar = () => {
    try {
      if (navigator.vibrate) navigator.vibrate(30)
    } catch { /* ignore */ }

    if (passoActual + 1 >= totalPassos) {
      setConcluido(true)
      setTimeout(() => onConcluir(), 500)
    } else {
      setPassoActual(prev => prev + 1)
    }
  }

  if (passoActual === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          5-4-3-2-1 Grounding
        </h2>
        <p className="text-white/60 text-sm mb-3 max-w-xs">
          Esta tecnica usa os teus 5 sentidos para te trazer de volta ao momento presente.
        </p>
        <p className="text-white/40 text-xs mb-8 max-w-xs">
          Vais percorrer cada sentido, um de cada vez. Sem pressa.
        </p>

        <button
          onClick={() => setPassoActual(0)}
          className="px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: SERENA_COLOR }}
        >
          Comecar
        </button>

        <button
          onClick={onVoltar}
          className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Voltar ao menu
        </button>
      </div>
    )
  }

  if (concluido) {
    return null // onConcluir handles transition
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Progresso */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between text-white/40 text-xs mb-2">
          <span>Passo {passoActual + 1} de {totalPassos}</span>
          <span>Sentido: {passo.sentido}</span>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((passoActual + 1) / totalPassos) * 100}%`, backgroundColor: SERENA_COLOR }}
          />
        </div>
      </div>

      {/* Numero grande */}
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-all duration-700"
        style={{
          backgroundColor: `${SERENA_COLOR}20`,
          border: `2px solid ${SERENA_COLOR}50`,
          boxShadow: `0 0 30px ${SERENA_COLOR}15`
        }}
      >
        <span className="text-5xl font-bold" style={{ color: SERENA_COLOR }}>
          {passo.numero}
        </span>
      </div>

      {/* Instrucao do sentido */}
      <div className="text-center mb-8 max-w-xs">
        <h3 className="text-white font-semibold text-lg mb-2">
          {passo.numero} {passo.numero === 1 ? 'coisa' : 'coisas'} que {passo.sentido}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          {passo.instrucao}
        </p>
      </div>

      {/* Indicadores de passo */}
      <div className="flex gap-2 mb-8">
        {GROUNDING_PASSOS.map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center"
            style={{
              backgroundColor: i < passoActual
                ? SERENA_COLOR
                : i === passoActual
                  ? `${SERENA_COLOR}80`
                  : `${SERENA_COLOR}20`,
              transform: i === passoActual ? 'scale(1.4)' : 'scale(1)'
            }}
          >
            {i < passoActual && (
              <svg viewBox="0 0 24 24" fill="white" className="w-1.5 h-1.5">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="4" fill="none" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Botao avancar */}
      <button
        onClick={avancar}
        className="px-8 py-3.5 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ backgroundColor: SERENA_COLOR }}
      >
        {passoActual + 1 >= totalPassos ? 'Concluir' : 'Proximo sentido'}
      </button>

      <button
        onClick={onVoltar}
        className="mt-5 text-white/30 text-xs hover:text-white/50 transition-colors"
      >
        Parar e voltar
      </button>
    </div>
  )
}

// ===== COMPONENTE: Body Scan Rapido =====

function BodyScanRapido({ onVoltar, onConcluir }) {
  const [zonaActual, setZonaActual] = useState(-1) // -1 = intro
  const [segundos, setSegundos] = useState(BODY_TEMPO_POR_ZONA)
  const [pausado, setPausado] = useState(false)
  const intervalRef = useRef(null)
  const totalZonas = BODY_ZONAS.length

  const zona = BODY_ZONAS[zonaActual]

  // Timer por zona
  useEffect(() => {
    if (zonaActual < 0 || zonaActual >= totalZonas || pausado) return

    setSegundos(BODY_TEMPO_POR_ZONA)

    intervalRef.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) {
          // Auto-avancar
          clearInterval(intervalRef.current)
          try {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50])
          } catch { /* ignore */ }

          setZonaActual(prevZona => {
            const next = prevZona + 1
            if (next >= totalZonas) {
              setTimeout(() => onConcluir(), 500)
              return prevZona
            }
            return next
          })
          return BODY_TEMPO_POR_ZONA
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [zonaActual, pausado, totalZonas, onConcluir])

  const ficarMais = () => {
    // Reset timer para esta zona
    if (intervalRef.current) clearInterval(intervalRef.current)
    setSegundos(BODY_TEMPO_POR_ZONA)
    // Re-trigger the effect by toggling pausado
    setPausado(true)
    setTimeout(() => setPausado(false), 50)
  }

  const avancarManual = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    try {
      if (navigator.vibrate) navigator.vibrate(30)
    } catch { /* ignore */ }

    if (zonaActual + 1 >= totalZonas) {
      onConcluir()
    } else {
      setZonaActual(prev => prev + 1)
    }
  }

  if (zonaActual === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Body Scan Rapido
        </h2>
        <p className="text-white/60 text-sm mb-3 max-w-xs">
          Vamos percorrer o teu corpo da cabeca aos pes. Cada zona fica 30 segundos, mas podes ficar mais tempo ou avancar.
        </p>
        <p className="text-white/40 text-xs mb-8 max-w-xs">
          {g('Senta-te confortavelmente ou fica de pe. Fecha os olhos se quiseres.',
             'Senta-te confortavelmente ou fica de pe. Fecha os olhos se quiseres.')}
        </p>

        <button
          onClick={() => setZonaActual(0)}
          className="px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: SERENA_COLOR }}
        >
          Comecar
        </button>

        <button
          onClick={onVoltar}
          className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Voltar ao menu
        </button>
      </div>
    )
  }

  if (zonaActual >= totalZonas) return null

  const progressoZona = ((BODY_TEMPO_POR_ZONA - segundos) / BODY_TEMPO_POR_ZONA) * 100
  const progressoTotal = ((zonaActual) / totalZonas) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Progresso total */}
      <div className="w-full max-w-xs mb-6">
        <div className="flex justify-between text-white/40 text-xs mb-2">
          <span>Zona {zonaActual + 1} de {totalZonas}</span>
          <span>{segundos}s</span>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressoTotal + (progressoZona / totalZonas)}%`, backgroundColor: SERENA_COLOR }}
          />
        </div>
      </div>

      {/* Mapa do corpo simplificado */}
      <div className="flex gap-1 mb-6">
        {BODY_ZONAS.map((z, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500"
              style={{
                backgroundColor: i < zonaActual
                  ? SERENA_COLOR
                  : i === zonaActual
                    ? `${SERENA_COLOR}80`
                    : `${SERENA_COLOR}15`,
                color: i <= zonaActual ? 'white' : `${SERENA_COLOR}60`,
                transform: i === zonaActual ? 'scale(1.2)' : 'scale(1)',
                border: i === zonaActual ? `2px solid ${SERENA_COLOR}` : 'none'
              }}
            >
              {i < zonaActual ? (
                <CheckIcon />
              ) : (
                z.nome.charAt(0)
              )}
            </div>
            <span
              className="text-[9px] transition-colors duration-300"
              style={{ color: i === zonaActual ? SERENA_COLOR : 'rgba(255,255,255,0.3)' }}
            >
              {z.nome}
            </span>
          </div>
        ))}
      </div>

      {/* Zona actual */}
      <div className="text-center mb-6 max-w-xs">
        <h3
          className="text-2xl font-bold mb-4"
          style={{ color: SERENA_COLOR, fontFamily: "'Cormorant Garamond', serif" }}
        >
          {zona.nome}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          {zona.instrucao}
        </p>
      </div>

      {/* Timer circular simplificado */}
      <div className="relative w-16 h-16 mb-6">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            stroke={`${SERENA_COLOR}20`}
            strokeWidth="2"
          />
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            stroke={SERENA_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="100.53"
            strokeDashoffset={100.53 * (1 - (segundos / BODY_TEMPO_POR_ZONA))}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/80 text-sm font-medium">{segundos}</span>
        </div>
      </div>

      {/* Botoes */}
      <div className="flex gap-3">
        <button
          onClick={ficarMais}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: `${SERENA_COLOR}15`,
            color: SERENA_COLOR,
            border: `1px solid ${SERENA_COLOR}40`
          }}
        >
          +30s nesta zona
        </button>
        <button
          onClick={avancarManual}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: SERENA_COLOR }}
        >
          {zonaActual + 1 >= totalZonas ? 'Concluir' : 'Avancar'}
        </button>
      </div>

      <button
        onClick={() => {
          if (intervalRef.current) clearInterval(intervalRef.current)
          onVoltar()
        }}
        className="mt-5 text-white/30 text-xs hover:text-white/50 transition-colors"
      >
        Parar e voltar
      </button>
    </div>
  )
}

// ===== COMPONENTE: Ecra de Conclusao =====

function EcraConclusao({ tecnica, onVoltar, onMenu }) {
  const nomes = {
    respiracao: 'Respiracao Box',
    grounding: '5-4-3-2-1 Grounding',
    bodyscan: 'Body Scan Rapido'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse"
        style={{ backgroundColor: `${SERENA_COLOR}25`, color: SERENA_COLOR }}
      >
        <HeartIcon />
      </div>

      <h2
        className="text-2xl font-bold text-white mb-3"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {g('Muito bem, querido', 'Muito bem, querida')}.
      </h2>
      <p className="text-white/60 text-sm mb-2 max-w-xs">
        Completaste a tecnica <strong className="text-white/80">{nomes[tecnica]}</strong>.
      </p>
      <p className="text-white/40 text-xs mb-10 max-w-xs">
        Lembra-te: cada momento de pausa e um acto de coragem. {g('Estas a cuidar de ti.', 'Estas a cuidar de ti.')}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onMenu}
          className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: SERENA_COLOR }}
        >
          Tentar outra tecnica
        </button>
        <button
          onClick={onVoltar}
          className="w-full py-3.5 rounded-2xl text-white/60 font-medium transition-all duration-300 hover:text-white/80"
          style={{ backgroundColor: `${SERENA_COLOR}15`, border: `1px solid ${SERENA_COLOR}30` }}
        >
          Voltar ao dashboard
        </button>
      </div>
    </div>
  )
}

// ===== COMPONENTE PRINCIPAL =====

export default function SOSEmocional() {
  const navigate = useNavigate()
  const [tecnicaActiva, setTecnicaActiva] = useState(null) // null = menu, 'respiracao' | 'grounding' | 'bodyscan'
  const [concluida, setConcluida] = useState(null) // nome da tecnica concluida

  const handleSelect = (tecnicaId) => {
    setConcluida(null)
    setTecnicaActiva(tecnicaId)
  }

  const handleVoltar = () => {
    setTecnicaActiva(null)
    setConcluida(null)
  }

  const handleConcluir = () => {
    setConcluida(tecnicaActiva)
    setTecnicaActiva(null)
  }

  const handleVoltarDashboard = () => {
    navigate('/serena/dashboard')
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: SERENA_DARK }}
    >
      {/* Header */}
      <ModuleHeader
        eco="serena"
        title="SOS Emocional"
        subtitle={g('Um espaco seguro para ti', 'Um espaco seguro para ti')}
        backTo="/serena/dashboard"
        showHomeButton={true}
        compact={false}
      />

      {/* Conteudo principal */}
      <main className="flex-1 relative" id="sos-content">
        {/* Menu de tecnicas */}
        {!tecnicaActiva && !concluida && (
          <MenuTecnicas onSelect={handleSelect} />
        )}

        {/* Respiracao Box */}
        {tecnicaActiva === 'respiracao' && (
          <RespiracaoBox
            onVoltar={handleVoltar}
            onConcluir={handleConcluir}
          />
        )}

        {/* 5-4-3-2-1 Grounding */}
        {tecnicaActiva === 'grounding' && (
          <GroundingExercicio
            onVoltar={handleVoltar}
            onConcluir={handleConcluir}
          />
        )}

        {/* Body Scan Rapido */}
        {tecnicaActiva === 'bodyscan' && (
          <BodyScanRapido
            onVoltar={handleVoltar}
            onConcluir={handleConcluir}
          />
        )}

        {/* Ecra de conclusao */}
        {concluida && (
          <EcraConclusao
            tecnica={concluida}
            onVoltar={handleVoltarDashboard}
            onMenu={handleVoltar}
          />
        )}
      </main>

      {/* Rodape discreto */}
      <footer className="text-center py-4 px-6">
        <p className="text-white/20 text-[10px]">
          Se estiveres em crise, contacta a linha de apoio emocional do teu pais.
        </p>
      </footer>
    </div>
  )
}
