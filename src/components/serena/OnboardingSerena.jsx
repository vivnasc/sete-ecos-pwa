import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'

/**
 * SERENA — Onboarding com micro-respiração guiada + setup emocional
 * 5 ecrãs: Boas-vindas → Filosofia → Respiração 4-7-8 → Emoção dominante → Pronto
 */

const EMOCOES = [
  { id: 'ansiedade', emoji: '😰', label: 'Ansiedade' },
  { id: 'tristeza', emoji: '😢', label: 'Tristeza' },
  { id: 'raiva', emoji: '😤', label: 'Raiva' },
  { id: 'medo', emoji: '😨', label: 'Medo' },
  { id: 'culpa', emoji: '😔', label: 'Culpa' },
  { id: 'alegria', emoji: '😊', label: 'Alegria' },
  { id: 'calma', emoji: '😌', label: 'Calma' },
  { id: 'confusao', emoji: '😵‍💫', label: 'Confusão' },
  { id: 'vazio', emoji: '🫥', label: 'Vazio' },
  { id: 'esperanca', emoji: '🌱', label: 'Esperança' },
  { id: 'cansaco', emoji: '😮‍💨', label: 'Cansaço' },
  { id: 'gratidao', emoji: '🙏', label: 'Gratidão' }
]

// Mini componente de respiração 4-7-8
function MiniRespiracao({ onComplete }) {
  const [fase, setFase] = useState('pausa') // pausa, inspirar, segurar, expirar
  const [ciclo, setCiclo] = useState(0)
  const [timer, setTimer] = useState(0)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef(null)

  const FASES = [
    { id: 'inspirar', duracao: 4, label: 'Inspira...', cor: 'bg-cyan-400' },
    { id: 'segurar', duracao: 7, label: 'Segura...', cor: 'bg-blue-400' },
    { id: 'expirar', duracao: 8, label: 'Expira...', cor: 'bg-indigo-400' }
  ]

  const TOTAL_CICLOS = 2

  useEffect(() => {
    if (!started) return

    const faseIndex = fase === 'inspirar' ? 0 : fase === 'segurar' ? 1 : fase === 'expirar' ? 2 : -1
    if (faseIndex === -1) {
      // Iniciar primeiro ciclo
      setFase('inspirar')
      setTimer(4)
      return
    }

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Próxima fase
          const nextIndex = faseIndex + 1
          if (nextIndex >= FASES.length) {
            // Fim do ciclo
            const newCiclo = ciclo + 1
            if (newCiclo >= TOTAL_CICLOS) {
              clearInterval(intervalRef.current)
              setFase('completo')
              if (onComplete) onComplete()
              return 0
            }
            setCiclo(newCiclo)
            setFase('inspirar')
            return 4
          }
          setFase(FASES[nextIndex].id)
          return FASES[nextIndex].duracao
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [fase, started, ciclo])

  if (!started) {
    return (
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border-2 border-cyan-400/30 flex items-center justify-center">
          <span className="text-5xl">🌊</span>
        </div>
        <p className="text-cyan-200/80 text-sm mb-6">
          Vamos fazer 2 ciclos de respiração 4-7-8 juntos. Demora menos de 1 minuto.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30"
        >
          Começar a respirar
        </button>
      </div>
    )
  }

  if (fase === 'completo') {
    return (
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <span className="text-5xl">✨</span>
        </div>
        <p className="text-cyan-100 text-lg font-medium mb-2">Sentiste a diferença?</p>
        <p className="text-cyan-200/70 text-sm">
          Isto é só uma das 6 técnicas de respiração do Serena.
        </p>
      </div>
    )
  }

  const faseAtual = FASES.find(f => f.id === fase)
  const escala = fase === 'inspirar' ? 'scale-110' : fase === 'expirar' ? 'scale-90' : 'scale-100'

  return (
    <div className="text-center">
      <div className={`w-40 h-40 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-1000 ${escala}`}
        style={{ background: `radial-gradient(circle, rgba(103,194,207,0.3), rgba(103,194,207,0.05))`, border: '2px solid rgba(103,194,207,0.4)' }}
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-300 mb-1">{timer}</div>
          <div className="text-cyan-200/70 text-xs">{faseAtual?.label}</div>
        </div>
      </div>
      <p className="text-cyan-200/50 text-xs">Ciclo {ciclo + 1} de {TOTAL_CICLOS}</p>
    </div>
  )
}

export default function OnboardingSerena() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [emocao, setEmocao] = useState('')
  const [respiracaoFeita, setRespiracaoFeita] = useState(false)

  const handleComplete = () => {
    localStorage.setItem('serena-onboarding-complete', 'true')
    if (emocao) {
      localStorage.setItem('serena-emocao-inicial', emocao)
    }
    navigate('/serena/dashboard')
  }

  const screens = [
    // 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-4xl">💧</span>
          </div>
          <h1 className="text-3xl font-bold text-cyan-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Bem-vindo ao Serena', 'Bem-vinda ao Serena')}
          </h1>
          <p className="text-cyan-200/80 text-lg leading-relaxed">
            Um espaço seguro para sentires.
            <br /><br />
            Sem julgamento. Sem pressa.
            <br />
            Só tu e as tuas <span className="text-cyan-300 font-medium">emoções</span>.
          </p>
        </div>
      )
    },

    // 1 - Philosophy
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
            <span className="text-3xl">🌊</span>
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Emoção & Fluidez
          </h2>
          <p className="text-cyan-200/80 leading-relaxed">
            As emoções não são inimigas — são <span className="text-cyan-300">mensageiras</span>.
            <br /><br />
            Vais aprender a <span className="text-cyan-300 font-medium">ouvir</span>, não a reprimir.
            <br /><br />
            Respiração guiada, diário emocional, rituais de libertação e muito mais.
          </p>
        </div>
      )
    },

    // 2 - Respiração guiada (interactiva)
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Experimenta agora
            </h2>
            <p className="text-cyan-200/70 text-sm">
              A respiração 4-7-8 acalma o sistema nervoso em segundos.
            </p>
          </div>
          <MiniRespiracao onComplete={() => setRespiracaoFeita(true)} />
        </div>
      ),
      canProceed: respiracaoFeita
    },

    // 3 - Emoção dominante
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
              <span className="text-3xl">🎭</span>
            </div>
            <h2 className="text-2xl font-bold text-cyan-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Como te sentes agora?
            </h2>
            <p className="text-cyan-200/70 text-sm">
              Escolhe a emoção que melhor descreve o teu estado actual.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {EMOCOES.map(e => (
              <button
                key={e.id}
                onClick={() => setEmocao(e.id)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  emocao === e.id
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/30'
                }`}
              >
                <div className="text-2xl mb-1">{e.emoji}</div>
                <div className={`text-xs ${emocao === e.id ? 'text-cyan-300' : 'text-cyan-200/60'}`}>
                  {e.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      ),
      canProceed: !!emocao
    },

    // 4 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-4xl">🌸</span>
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Estás pronto', 'Estás pronta')}
          </h2>
          <p className="text-cyan-200/80 leading-relaxed mb-6">
            Começas como <span className="text-cyan-300 font-medium">Nascente</span> — uma fonte que começa a brotar.
            <br /><br />
            Cada emoção sentida, cada respiração feita, traz-te mais <span className="text-cyan-300">Gotas</span>.
          </p>
          {emocao && (
            <div className="p-4 bg-white/5 rounded-xl border border-cyan-500/20">
              <div className="text-cyan-200/70 text-sm mb-1">A tua emoção inicial:</div>
              <div className="text-xl">
                {EMOCOES.find(e => e.id === emocao)?.emoji} {EMOCOES.find(e => e.id === emocao)?.label}
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a2e3a 0%, #0f1f2a 50%, #1a2e3a 100%)' }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-cyan-400 w-6'
              : i < step
                ? 'bg-cyan-500'
                : 'bg-cyan-500/30'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {screens[step].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 flex justify-between items-center">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            ← Anterior
          </button>
        ) : <div />}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={screens[step].canProceed === false}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-30"
          >
            Continuar →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
          >
            Começar! 💧
          </button>
        )}
      </div>
    </div>
  )
}

export function useSerenaOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const done = localStorage.getItem('serena-onboarding-complete')
    if (!done) setShow(true)
  }, [])
  return {
    showOnboarding: show,
    complete: () => { localStorage.setItem('serena-onboarding-complete', 'true'); setShow(false) },
    reset: () => { localStorage.removeItem('serena-onboarding-complete'); setShow(true) }
  }
}
