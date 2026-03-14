import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'

/**
 * COMUNIDADE — Onboarding tour visual
 * 6 ecrãs: Boas-vindas → Rio → Fogueira & Círculos → Sussurros → Ressonância → Pronto
 */

export default function OnboardingComunidade() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const handleComplete = () => {
    localStorage.setItem('comunidade-onboarding-complete', 'true')
    navigate('/comunidade')
  }

  const screens = [
    // 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-4xl">🌍</span>
          </div>
          <h1 className="text-3xl font-bold text-violet-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Bem-vindo à Comunidade', 'Bem-vinda à Comunidade')}
          </h1>
          <p className="text-violet-200/80 text-lg leading-relaxed">
            Isto não é uma rede social.
            <br /><br />
            É um espaço de <span className="text-violet-300 font-medium">autoconhecimento partilhado</span>.
            <br />
            Sem likes. Sem comparação. Só verdade.
          </p>
        </div>
      )
    },

    // 1 - Rio
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center">
            <span className="text-3xl">🌊</span>
          </div>
          <h2 className="text-2xl font-bold text-violet-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            O Rio
          </h2>
          <p className="text-violet-200/80 leading-relaxed mb-6">
            O feed de reflexões. Partilha pensamentos, leituras do dia, aprendizagens.
          </p>
          <div className="space-y-3 text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-violet-500/10">
              <div className="flex items-center gap-2 mb-1">
                <span>📝</span>
                <span className="text-violet-200/70 text-xs font-medium">11 temas de reflexão</span>
              </div>
              <p className="text-violet-200/50 text-xs">Desde gratidão até coragem, cada reflexão tem o seu tema.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-violet-500/10">
              <div className="flex items-center gap-2 mb-1">
                <span>🌙</span>
                <span className="text-violet-200/70 text-xs font-medium">Reflexões anónimas</span>
              </div>
              <p className="text-violet-200/50 text-xs">Podes partilhar sem revelar quem és. Segurança primeiro.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-violet-500/10">
              <div className="flex items-center gap-2 mb-1">
                <span>🫁</span>
                <span className="text-violet-200/70 text-xs font-medium">Pausas de respiração</span>
              </div>
              <p className="text-violet-200/50 text-xs">A cada 6 posts, o Rio convida-te a parar e respirar.</p>
            </div>
          </div>
        </div>
      )
    },

    // 2 - Fogueira & Círculos
    {
      content: (
        <div className="text-center">
          <div className="flex justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-400/30 flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center">
              <span className="text-2xl">⭕</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-violet-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Fogueira & Círculos
          </h2>
          <div className="space-y-4 text-left">
            <div className="p-4 bg-white/5 rounded-xl border border-orange-500/20">
              <h3 className="text-orange-300 font-medium text-sm mb-1">🔥 Fogueira</h3>
              <p className="text-violet-200/70 text-xs leading-relaxed">
                Chat efémero — 24 horas e desaparece. Um tema novo todos os dias. O fogo cresce com as contribuições.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-emerald-500/20">
              <h3 className="text-emerald-300 font-medium text-sm mb-1">⭕ Círculos</h3>
              <p className="text-violet-200/70 text-xs leading-relaxed">
                Grupos pequenos (3-15 pessoas) por eco. Cada um tem uma guardiã e uma intenção. Espaço seguro para profundidade.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // 3 - Sussurros
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-500/20 border border-pink-400/30 flex items-center justify-center">
            <span className="text-3xl">💌</span>
          </div>
          <h2 className="text-2xl font-bold text-violet-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Sussurros
          </h2>
          <p className="text-violet-200/80 leading-relaxed mb-6">
            Mensagens privadas para apoio 1-a-1. Quando precisas de falar com alguém que entende.
          </p>
          <div className="p-4 bg-white/5 rounded-xl border border-pink-500/20 text-left">
            <p className="text-violet-200/60 text-xs mb-2">Templates de início de conversa:</p>
            <div className="space-y-2">
              <div className="p-2 bg-white/5 rounded-lg text-violet-200/50 text-xs italic">
                "Vi a tua reflexão e queria dizer que também passei por isso..."
              </div>
              <div className="p-2 bg-white/5 rounded-lg text-violet-200/50 text-xs italic">
                "Precisas de falar? Estou aqui."
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 4 - Ressonância (não likes)
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 border border-violet-400/30 flex items-center justify-center">
            <span className="text-3xl">🫶</span>
          </div>
          <h2 className="text-2xl font-bold text-violet-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Ressonância, não likes
          </h2>
          <p className="text-violet-200/80 leading-relaxed mb-6">
            Aqui não "gostas" — <span className="text-violet-300">ressoas</span>. São 5 reacções com significado:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { emoji: '🔔', label: 'Ressoo' },
              { emoji: '💡', label: 'Luz' },
              { emoji: '💪', label: 'Força' },
              { emoji: '🪞', label: 'Espelhar' },
              { emoji: '🌳', label: 'Enraizar' }
            ].map(r => (
              <div key={r.label} className="text-center">
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className="text-violet-200/50 text-[10px]">{r.label}</div>
              </div>
            ))}
          </div>
          <p className="text-violet-200/60 text-xs mt-4">
            E os comentários chamam-se <span className="text-violet-300">Espelhos</span> — com guias para começar a resposta.
          </p>
        </div>
      )
    },

    // 5 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-violet-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            A comunidade espera por ti
          </h2>
          <p className="text-violet-200/80 leading-relaxed mb-6">
            O teu perfil brilha com <span className="text-violet-300 font-medium">bioluminescência</span> — quanto mais participas, mais luz emites.
            <br /><br />
            Sem pressão. Sem perfeição.
            <br />
            Só autenticidade.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-violet-500/20">
            <div className="text-violet-200/70 text-sm mb-2">O que te espera:</div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg">🌊</div>
                <div className="text-violet-200/50 text-[10px]">Rio</div>
              </div>
              <div>
                <div className="text-lg">🔥</div>
                <div className="text-violet-200/50 text-[10px]">Fogueira</div>
              </div>
              <div>
                <div className="text-lg">⭕</div>
                <div className="text-violet-200/50 text-[10px]">Círculos</div>
              </div>
              <div>
                <div className="text-lg">💌</div>
                <div className="text-violet-200/50 text-[10px]">Sussurros</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a1030 0%, #0f0a1a 50%, #1a1030 100%)' }}>
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-violet-400 w-6'
              : i < step ? 'bg-violet-500' : 'bg-violet-500/30'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-md w-full">
          {screens[step].content}
        </div>
      </div>

      <div className="p-6 flex justify-between items-center">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-violet-300 hover:text-violet-200 transition-colors">
            ← Anterior
          </button>
        ) : <div />}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30"
          >
            Continuar →
          </button>
        ) : (
          <button onClick={handleComplete} className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30">
            Entrar! 🌍
          </button>
        )}
      </div>
    </div>
  )
}

export function useComunidadeOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const done = localStorage.getItem('comunidade-onboarding-complete')
    if (!done) setShow(true)
  }, [])
  return {
    showOnboarding: show,
    complete: () => { localStorage.setItem('comunidade-onboarding-complete', 'true'); setShow(false) },
    reset: () => { localStorage.removeItem('comunidade-onboarding-complete'); setShow(true) }
  }
}
