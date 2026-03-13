import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'

/**
 * VENTIS — Onboarding com scan de energia + setup de rotina
 * 5 ecrãs: Boas-vindas → Filosofia → Scan energia → Ritmo preferido → Pronto
 */

const RITMOS = [
  { id: 'manha', emoji: '🌅', label: 'Pessoa de manhã', desc: 'Mais energia ao acordar' },
  { id: 'tarde', emoji: '☀️', label: 'Pessoa de tarde', desc: 'Pico de energia ao meio-dia' },
  { id: 'noite', emoji: '🌙', label: 'Pessoa de noite', desc: 'Mais activo ao anoitecer' },
  { id: 'variavel', emoji: '🌊', label: 'Variável', desc: 'Depende do dia' }
]

export default function OnboardingVentis() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [energia, setEnergia] = useState(5)
  const [ritmo, setRitmo] = useState('')
  const [burnout, setBurnout] = useState(3)

  const handleComplete = () => {
    localStorage.setItem('ventis-onboarding-complete', 'true')
    if (ritmo) localStorage.setItem('ventis-ritmo-preferido', ritmo)
    navigate('/ventis/dashboard')
  }

  const energiaLabel = energia <= 3 ? 'Baixa' : energia <= 6 ? 'Média' : energia <= 8 ? 'Boa' : 'Excelente'
  const energiaCor = energia <= 3 ? 'text-red-400' : energia <= 6 ? 'text-yellow-400' : 'text-green-400'

  const screens = [
    // 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-4xl">🍃</span>
          </div>
          <h1 className="text-3xl font-bold text-emerald-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Bem-vindo ao Ventis', 'Bem-vinda ao Ventis')}
          </h1>
          <p className="text-emerald-200/80 text-lg leading-relaxed">
            O ritmo certo não é correr mais — é <span className="text-emerald-300 font-medium">fluir melhor</span>.
            <br /><br />
            Energia, pausas, movimento, natureza.
          </p>
        </div>
      )
    },

    // 1 - Philosophy
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
          <h2 className="text-2xl font-bold text-emerald-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Energia & Ritmo
          </h2>
          <p className="text-emerald-200/80 leading-relaxed">
            A energia não é infinita — é <span className="text-emerald-300">renovável</span>.
            <br /><br />
            Vais mapear os teus picos e vales, construir rotinas sustentáveis e detectar sinais de burnout antes que cheguem.
            <br /><br />
            Movimento, natureza e pausas conscientes são o teu combustível.
          </p>
        </div>
      )
    },

    // 2 - Energy scan
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
            <h2 className="text-2xl font-bold text-emerald-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Scan de Energia
            </h2>
            <p className="text-emerald-200/70 text-sm">
              Neste momento, como está a tua energia?
            </p>
          </div>

          <div className="space-y-6">
            {/* Energia */}
            <div className="p-4 bg-white/5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-200/70 text-sm">Nível de energia</span>
                <span className={`font-bold ${energiaCor}`}>{energia}/10 — {energiaLabel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energia}
                onChange={(e) => setEnergia(parseInt(e.target.value))}
                className="w-full h-2 bg-emerald-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-emerald-200/40 text-xs mt-1">
                <span>Sem energia</span>
                <span>A transbordar</span>
              </div>
            </div>

            {/* Burnout */}
            <div className="p-4 bg-white/5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-200/70 text-sm">Risco de burnout</span>
                <span className="text-emerald-300 font-bold">{burnout}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={burnout}
                onChange={(e) => setBurnout(parseInt(e.target.value))}
                className="w-full h-2 bg-emerald-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-emerald-200/40 text-xs mt-1">
                <span>Tranquilo</span>
                <span>A rebentar</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 3 - Preferred rhythm
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Qual é o teu ritmo?
            </h2>
            <p className="text-emerald-200/70 text-sm">
              Quando tens mais energia natural?
            </p>
          </div>

          <div className="space-y-3">
            {RITMOS.map(r => (
              <button
                key={r.id}
                onClick={() => setRitmo(r.id)}
                className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                  ritmo === r.id
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:border-emerald-400/30'
                }`}
              >
                <span className="text-3xl">{r.emoji}</span>
                <div>
                  <div className={`font-medium ${ritmo === r.id ? 'text-emerald-300' : 'text-emerald-100'}`}>
                    {r.label}
                  </div>
                  <div className="text-emerald-200/50 text-xs">{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ),
      canProceed: !!ritmo
    },

    // 4 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-4xl">🌳</span>
          </div>
          <h2 className="text-2xl font-bold text-emerald-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Vento a favor
          </h2>
          <p className="text-emerald-200/80 leading-relaxed mb-6">
            Começas como <span className="text-emerald-300 font-medium">Semente</span>.
            <br /><br />
            Cada pausa consciente, cada movimento, cada conexão com a natureza traz-te mais <span className="text-emerald-300">Folhas</span>.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-emerald-500/20">
            <div className="text-emerald-200/70 text-sm mb-2">O teu ponto de partida:</div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className={`text-xl font-bold ${energiaCor}`}>{energia}/10</div>
                <div className="text-emerald-200/50 text-xs">energia</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-300">
                  {RITMOS.find(r => r.id === ritmo)?.emoji}
                </div>
                <div className="text-emerald-200/50 text-xs">{RITMOS.find(r => r.id === ritmo)?.label}</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-300">{burnout}/10</div>
                <div className="text-emerald-200/50 text-xs">burnout</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a2e24 0%, #0f1f18 50%, #1a2e24 100%)' }}>
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-emerald-400 w-6'
              : i < step ? 'bg-emerald-500' : 'bg-emerald-500/30'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {screens[step].content}
        </div>
      </div>

      <div className="p-6 flex justify-between items-center">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-emerald-300 hover:text-emerald-200 transition-colors">
            ← Anterior
          </button>
        ) : <div />}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={screens[step].canProceed === false}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-30"
          >
            Continuar →
          </button>
        ) : (
          <button onClick={handleComplete} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30">
            Começar! 🍃
          </button>
        )}
      </div>
    </div>
  )
}

export function useVentisOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const done = localStorage.getItem('ventis-onboarding-complete')
    if (!done) setShow(true)
  }, [])
  return {
    showOnboarding: show,
    complete: () => { localStorage.setItem('ventis-onboarding-complete', 'true'); setShow(false) },
    reset: () => { localStorage.removeItem('ventis-onboarding-complete'); setShow(true) }
  }
}
