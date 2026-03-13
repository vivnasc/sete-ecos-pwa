import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'

/**
 * IMAGO — Onboarding com espelho triplo simplificado
 * 5 ecrãs: Boas-vindas → Filosofia → Espelho triplo (3 palavras) → Valores → Pronto
 */

const VALORES_SUGERIDOS = [
  'Autenticidade', 'Coragem', 'Liberdade', 'Compaixão', 'Justiça',
  'Criatividade', 'Família', 'Sabedoria', 'Amor', 'Resiliência',
  'Integridade', 'Gratidão', 'Humildade', 'Determinação', 'Paz'
]

export default function OnboardingImago() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [essencia, setEssencia] = useState('')
  const [mascara, setMascara] = useState('')
  const [aspiracao, setAspiracao] = useState('')
  const [valores, setValores] = useState([])

  const toggleValor = (v) => {
    setValores(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 3 ? [...prev, v] : prev
    )
  }

  const handleComplete = () => {
    localStorage.setItem('imago-onboarding-complete', 'true')
    if (essencia) localStorage.setItem('imago-espelho-essencia', essencia)
    if (mascara) localStorage.setItem('imago-espelho-mascara', mascara)
    if (aspiracao) localStorage.setItem('imago-espelho-aspiracao', aspiracao)
    if (valores.length) localStorage.setItem('imago-valores-iniciais', JSON.stringify(valores))
    navigate('/imago/dashboard')
  }

  const screens = [
    // 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-4xl">⭐</span>
          </div>
          <h1 className="text-3xl font-bold text-purple-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Bem-vindo ao Imago', 'Bem-vinda ao Imago')}
          </h1>
          <p className="text-purple-200/80 text-lg leading-relaxed">
            Quem és tu — <span className="text-purple-300 font-medium">de verdade</span>?
            <br /><br />
            Não quem te disseram para ser.
            <br />
            Não a máscara que usas.
          </p>
        </div>
      )
    },

    // 1 - Philosophy
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-500/20 border border-purple-400/30 flex items-center justify-center">
            <span className="text-3xl">🪞</span>
          </div>
          <h2 className="text-2xl font-bold text-purple-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Identidade & Essência
          </h2>
          <p className="text-purple-200/80 leading-relaxed">
            O Imago é uma <span className="text-purple-300">escavação arqueológica de ti</span>.
            <br /><br />
            Espelho triplo, mapa de identidade, 50 valores para selecionar, meditações de essência e um quadro de visão futura.
            <br /><br />
            Camada por camada, até chegares ao centro.
          </p>
        </div>
      )
    },

    // 2 - Espelho triplo simplificado
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-500/20 border border-purple-400/30 flex items-center justify-center">
              <span className="text-3xl">🔮</span>
            </div>
            <h2 className="text-2xl font-bold text-purple-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Espelho Triplo
            </h2>
            <p className="text-purple-200/70 text-sm">
              Uma palavra para cada dimensão de ti.
            </p>
          </div>

          <div className="space-y-4">
            {/* Essência */}
            <div className="p-4 bg-white/5 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💎</span>
                <span className="text-purple-200/70 text-sm font-medium">Essência</span>
              </div>
              <input
                type="text"
                value={essencia}
                onChange={(e) => setEssencia(e.target.value.slice(0, 30))}
                placeholder="Quem és no fundo? (ex: sensível, forte)"
                className="w-full p-3 bg-white/5 border border-purple-500/20 rounded-lg text-purple-100 placeholder-purple-200/30 text-sm focus:outline-none focus:border-purple-400/50"
              />
            </div>

            {/* Máscara */}
            <div className="p-4 bg-white/5 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎭</span>
                <span className="text-purple-200/70 text-sm font-medium">Máscara</span>
              </div>
              <input
                type="text"
                value={mascara}
                onChange={(e) => setMascara(e.target.value.slice(0, 30))}
                placeholder="O que mostras ao mundo? (ex: confiante, duro)"
                className="w-full p-3 bg-white/5 border border-purple-500/20 rounded-lg text-purple-100 placeholder-purple-200/30 text-sm focus:outline-none focus:border-purple-400/50"
              />
            </div>

            {/* Aspiração */}
            <div className="p-4 bg-white/5 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✨</span>
                <span className="text-purple-200/70 text-sm font-medium">Aspiração</span>
              </div>
              <input
                type="text"
                value={aspiracao}
                onChange={(e) => setAspiracao(e.target.value.slice(0, 30))}
                placeholder="Quem queres ser? (ex: livre, autêntico)"
                className="w-full p-3 bg-white/5 border border-purple-500/20 rounded-lg text-purple-100 placeholder-purple-200/30 text-sm focus:outline-none focus:border-purple-400/50"
              />
            </div>
          </div>
        </div>
      ),
      canProceed: essencia.length > 1 && mascara.length > 1 && aspiracao.length > 1
    },

    // 3 - Valores (escolher 3)
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              3 valores essenciais
            </h2>
            <p className="text-purple-200/70 text-sm">
              Se só pudesses escolher 3 valores para te guiar, quais seriam?
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {VALORES_SUGERIDOS.map(v => (
              <button
                key={v}
                onClick={() => toggleValor(v)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  valores.includes(v)
                    ? 'bg-purple-500/30 border border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border border-white/10 text-purple-200/60 hover:border-purple-400/30'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <p className="text-center text-purple-200/40 text-xs mt-4">
            {valores.length}/3 seleccionados
          </p>
        </div>
      ),
      canProceed: valores.length === 3
    },

    // 4 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-4xl">🌟</span>
          </div>
          <h2 className="text-2xl font-bold text-purple-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            O espelho está pronto
          </h2>
          <p className="text-purple-200/80 leading-relaxed mb-6">
            Começas como <span className="text-purple-300 font-medium">Reflexo</span>.
            <br /><br />
            Cada escavação, cada meditação, cada verdade descoberta traz-te mais <span className="text-purple-300">Estrelas</span>.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-purple-500/20 mb-4">
            <div className="text-purple-200/70 text-sm mb-3">O teu Espelho Triplo:</div>
            <div className="flex justify-center gap-4 text-center">
              <div>
                <div className="text-lg">💎</div>
                <div className="text-purple-300 font-medium text-sm">{essencia}</div>
                <div className="text-purple-200/40 text-[10px]">essência</div>
              </div>
              <div>
                <div className="text-lg">🎭</div>
                <div className="text-purple-300 font-medium text-sm">{mascara}</div>
                <div className="text-purple-200/40 text-[10px]">máscara</div>
              </div>
              <div>
                <div className="text-lg">✨</div>
                <div className="text-purple-300 font-medium text-sm">{aspiracao}</div>
                <div className="text-purple-200/40 text-[10px]">aspiração</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {valores.map(v => (
              <span key={v} className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs">
                {v}
              </span>
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 50%, #1a1a2e 100%)' }}>
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-purple-400 w-6'
              : i < step ? 'bg-purple-500' : 'bg-purple-500/30'
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
          <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-purple-300 hover:text-purple-200 transition-colors">
            ← Anterior
          </button>
        ) : <div />}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={screens[step].canProceed === false}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 disabled:opacity-30"
          >
            Continuar →
          </button>
        ) : (
          <button onClick={handleComplete} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30">
            Começar! ⭐
          </button>
        )}
      </div>
    </div>
  )
}

export function useImagoOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const done = localStorage.getItem('imago-onboarding-complete')
    if (!done) setShow(true)
  }, [])
  return {
    showOnboarding: show,
    complete: () => { localStorage.setItem('imago-onboarding-complete', 'true'); setShow(false) },
    reset: () => { localStorage.removeItem('imago-onboarding-complete'); setShow(true) }
  }
}
