import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'

/**
 * IGNIS — Onboarding com escolha consciente imediata + setup de foco
 * 5 ecrãs: Boas-vindas → Filosofia → Escolha consciente → Foco actual → Pronto
 */

const FOCOS = [
  { id: 'carreira', emoji: '💼', label: 'Carreira' },
  { id: 'saude', emoji: '🏃', label: 'Saúde' },
  { id: 'relacoes', emoji: '❤️', label: 'Relações' },
  { id: 'financas', emoji: '💰', label: 'Finanças' },
  { id: 'criatividade', emoji: '🎨', label: 'Criatividade' },
  { id: 'estudos', emoji: '📚', label: 'Estudos' },
  { id: 'espiritualidade', emoji: '🙏', label: 'Espiritualidade' },
  { id: 'outro', emoji: '🔥', label: 'Outro' }
]

export default function OnboardingIgnis() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [adiamento, setAdiamento] = useState('')
  const [foco, setFoco] = useState('')
  const [disciplina, setDisciplina] = useState(5)

  const handleComplete = () => {
    localStorage.setItem('ignis-onboarding-complete', 'true')
    if (adiamento) localStorage.setItem('ignis-primeira-escolha', adiamento)
    if (foco) localStorage.setItem('ignis-foco-actual', foco)
    navigate('/ignis/dashboard')
  }

  const screens = [
    // 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-4xl">🔥</span>
          </div>
          <h1 className="text-3xl font-bold text-orange-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Bem-vindo ao Ignis', 'Bem-vinda ao Ignis')}
          </h1>
          <p className="text-orange-200/80 text-lg leading-relaxed">
            Onde a tua vontade ganha <span className="text-orange-300 font-medium">direcção</span>.
            <br /><br />
            Sem dispersão. Sem adiamentos.
            <br />
            Fogo com <span className="text-orange-300">propósito</span>.
          </p>
        </div>
      )
    },

    // 1 - Philosophy
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-400/30 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
          <h2 className="text-2xl font-bold text-orange-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Vontade & Direcção
          </h2>
          <p className="text-orange-200/80 leading-relaxed">
            O Ignis não é sobre fazer mais — é sobre <span className="text-orange-300">escolher melhor</span>.
            <br /><br />
            Cada escolha consciente fortalece o teu fogo interior.
            <br /><br />
            Sessões de foco, detector de dispersão, desafios de coragem e plano de acção.
          </p>
        </div>
      )
    },

    // 2 - Primeira escolha consciente
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-400/30 flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-orange-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              A tua primeira escolha
            </h2>
            <p className="text-orange-200/70 text-sm">
              O que andas a adiar? Escreve aqui — já é um acto de coragem.
            </p>
          </div>

          <div className="space-y-4">
            <textarea
              value={adiamento}
              onChange={(e) => setAdiamento(e.target.value.slice(0, 200))}
              placeholder="Ex: Ter a conversa difícil com o meu chefe..."
              className="w-full p-4 bg-white/5 border border-orange-500/20 rounded-xl text-orange-100 placeholder-orange-200/30 text-sm resize-none focus:outline-none focus:border-orange-400/50"
              rows={3}
            />
            <p className="text-orange-200/40 text-xs text-right">{adiamento.length}/200</p>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-orange-500/10">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <p className="text-orange-200/60 text-xs">
                Reconhecer o que adias é o primeiro passo. Não precisas resolver agora — só nomear.
              </p>
            </div>
          </div>
        </div>
      ),
      canProceed: adiamento.length > 3
    },

    // 3 - Foco actual
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-orange-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Qual é o teu foco agora?
            </h2>
            <p className="text-orange-200/70 text-sm">
              Em que área da vida queres direccionar a tua energia?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {FOCOS.map(f => (
              <button
                key={f.id}
                onClick={() => setFoco(f.id)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  foco === f.id
                    ? 'bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 border-white/10 hover:border-orange-400/30'
                }`}
              >
                <div className="text-2xl mb-1">{f.emoji}</div>
                <div className={`text-xs ${foco === f.id ? 'text-orange-300' : 'text-orange-200/60'}`}>
                  {f.label}
                </div>
              </button>
            ))}
          </div>

          {foco && (
            <div className="p-4 bg-white/5 rounded-xl border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-orange-200/70 text-sm">Nível de disciplina actual</span>
                <span className="text-orange-300 font-bold">{disciplina}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={disciplina}
                onChange={(e) => setDisciplina(parseInt(e.target.value))}
                className="w-full h-2 bg-orange-900/50 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-orange-200/40 text-xs mt-1">
                <span>Disperso</span>
                <span>Focado</span>
              </div>
            </div>
          )}
        </div>
      ),
      canProceed: !!foco
    },

    // 4 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-4xl">⚔️</span>
          </div>
          <h2 className="text-2xl font-bold text-orange-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Fogo aceso
          </h2>
          <p className="text-orange-200/80 leading-relaxed mb-6">
            Começas como <span className="text-orange-300 font-medium">Faísca</span>.
            <br /><br />
            Cada escolha consciente, cada sessão de foco, transforma-te em <span className="text-orange-300">Chama</span>.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-orange-500/20">
            <div className="text-orange-200/70 text-sm mb-2">O teu ponto de partida:</div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className="text-xl font-bold text-orange-300">
                  {FOCOS.find(f => f.id === foco)?.emoji}
                </div>
                <div className="text-orange-200/50 text-xs">{FOCOS.find(f => f.id === foco)?.label}</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-300">{disciplina}/10</div>
                <div className="text-orange-200/50 text-xs">disciplina</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #1a0f0a 50%, #2e1a14 100%)' }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-orange-400 w-6'
              : i < step
                ? 'bg-orange-500'
                : 'bg-orange-500/30'
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
            className="px-6 py-3 text-orange-300 hover:text-orange-200 transition-colors"
          >
            ← Anterior
          </button>
        ) : <div />}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={screens[step].canProceed === false}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-30"
          >
            Continuar →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30"
          >
            Começar! 🔥
          </button>
        )}
      </div>
    </div>
  )
}

export function useIgnisOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const done = localStorage.getItem('ignis-onboarding-complete')
    if (!done) setShow(true)
  }, [])
  return {
    showOnboarding: show,
    complete: () => { localStorage.setItem('ignis-onboarding-complete', 'true'); setShow(false) },
    reset: () => { localStorage.removeItem('ignis-onboarding-complete'); setShow(true) }
  }
}
