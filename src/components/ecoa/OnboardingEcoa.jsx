import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { g } from '../../utils/genero'

/**
 * ECOA — Onboarding com mapeamento de silenciamento + nível de voz
 * 5 ecrãs: Boas-vindas → Filosofia → "Que frase engoles?" → Nível de voz → Pronto
 */

const SILENCIAMENTOS = [
  { id: 'familia', emoji: '👨‍👩‍👧', label: 'Família', desc: 'Calo-me para manter a paz' },
  { id: 'trabalho', emoji: '💼', label: 'Trabalho', desc: 'Não digo o que penso ao chefe' },
  { id: 'relacao', emoji: '❤️', label: 'Relação', desc: 'Engulo para evitar conflito' },
  { id: 'amigos', emoji: '👥', label: 'Amigos', desc: 'Finjo concordar' },
  { id: 'social', emoji: '🌍', label: 'Sociedade', desc: 'Escondo quem sou' },
  { id: 'propria', emoji: '🪞', label: 'Comigo', desc: 'Ignoro as minhas necessidades' }
]

export default function OnboardingEcoa() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [frase, setFrase] = useState('')
  const [silenciamentos, setSilenciamentos] = useState([])
  const [nivelVoz, setNivelVoz] = useState(4)

  const toggleSilenciamento = (id) => {
    setSilenciamentos(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleComplete = () => {
    localStorage.setItem('ecoa-onboarding-complete', 'true')
    if (frase) localStorage.setItem('ecoa-frase-silenciada', frase)
    if (silenciamentos.length) localStorage.setItem('ecoa-silenciamentos', JSON.stringify(silenciamentos))
    navigate('/ecoa/dashboard')
  }

  const nivelLabel = nivelVoz <= 2 ? 'Quase muda' : nivelVoz <= 4 ? 'Sussurro' : nivelVoz <= 6 ? 'Voz média' : nivelVoz <= 8 ? 'Voz clara' : 'Ressonância'

  const screens = [
    // 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="text-4xl">🔊</span>
          </div>
          <h1 className="text-3xl font-bold text-sky-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            {g('Bem-vindo ao Ecoa', 'Bem-vinda ao Ecoa')}
          </h1>
          <p className="text-sky-200/80 text-lg leading-relaxed">
            A tua voz existe. Mesmo que a tenhas <span className="text-sky-300 font-medium">silenciado</span>.
            <br /><br />
            Está na hora de a recuperar.
          </p>
        </div>
      )
    },

    // 1 - Philosophy
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-400/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center">
            <span className="text-3xl">🗣️</span>
          </div>
          <h2 className="text-2xl font-bold text-sky-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            Voz & Desbloqueio
          </h2>
          <p className="text-sky-200/80 leading-relaxed">
            Quantas frases engoles por dia?
            <br /><br />
            O Ecoa ajuda-te a <span className="text-sky-300">mapear silêncios</span>, praticar a tua voz progressivamente e escrever as cartas que nunca enviaste.
            <br /><br />
            8 semanas de Micro-Voz. Ao teu ritmo.
          </p>
        </div>
      )
    },

    // 2 - A frase que engoles
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-sky-400/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center">
              <span className="text-3xl">🤐</span>
            </div>
            <h2 className="text-2xl font-bold text-sky-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Qual é a frase que mais engoles?
            </h2>
            <p className="text-sky-200/70 text-sm">
              Aquela coisa que pensas mas nunca dizes. Escreve aqui — é seguro.
            </p>
          </div>

          <textarea
            value={frase}
            onChange={(e) => setFrase(e.target.value.slice(0, 300))}
            placeholder='Ex: "Não estou bem e preciso de ajuda."'
            className="w-full p-4 bg-white/5 border border-sky-500/20 rounded-xl text-sky-100 placeholder-sky-200/30 text-sm resize-none focus:outline-none focus:border-sky-400/50"
            rows={4}
          />
          <p className="text-sky-200/40 text-xs text-right mt-1">{frase.length}/300</p>

          <div className="mt-3 p-3 bg-white/5 rounded-xl border border-sky-500/10">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <p className="text-sky-200/60 text-xs">
                Escrever o que calas é o primeiro acto de coragem vocal. Ninguém vai ler isto senão tu.
              </p>
            </div>
          </div>
        </div>
      ),
      canProceed: frase.length > 3
    },

    // 3 - Silenciamentos + nível
    {
      content: (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-sky-100 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              Onde te calas mais?
            </h2>
            <p className="text-sky-200/70 text-sm">
              Selecciona as áreas onde te silencias (podes escolher várias).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {SILENCIAMENTOS.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSilenciamento(s.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  silenciamentos.includes(s.id)
                    ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/20'
                    : 'bg-white/5 border-white/10 hover:border-sky-400/30'
                }`}
              >
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className={`text-xs font-medium ${silenciamentos.includes(s.id) ? 'text-sky-300' : 'text-sky-100'}`}>
                  {s.label}
                </div>
                <div className="text-sky-200/40 text-[10px]">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-sky-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sky-200/70 text-sm">Nível da tua voz</span>
              <span className="text-sky-300 font-bold">{nivelVoz}/10 — {nivelLabel}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={nivelVoz}
              onChange={(e) => setNivelVoz(parseInt(e.target.value))}
              className="w-full h-2 bg-sky-900/50 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      ),
      canProceed: silenciamentos.length > 0
    },

    // 4 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="text-4xl">🎤</span>
          </div>
          <h2 className="text-2xl font-bold text-sky-100 mb-4" style={{ fontFamily: 'var(--font-titulos)' }}>
            A tua voz está a nascer
          </h2>
          <p className="text-sky-200/80 leading-relaxed mb-6">
            Começas como <span className="text-sky-300 font-medium">Sussurro</span>.
            <br /><br />
            Cada palavra dita, cada carta escrita, cada exercício de voz traz-te mais <span className="text-sky-300">Ecos</span>.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-sky-500/20">
            <div className="text-sky-200/70 text-sm mb-2">O teu ponto de partida:</div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className="text-xl font-bold text-sky-300">{silenciamentos.length}</div>
                <div className="text-sky-200/50 text-xs">silenciamentos</div>
              </div>
              <div>
                <div className="text-xl font-bold text-sky-300">{nivelVoz}/10</div>
                <div className="text-sky-200/50 text-xs">nível de voz</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a2a34 0%, #0f1a22 50%, #1a2a34 100%)' }}>
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-sky-400 w-6'
              : i < step ? 'bg-sky-500' : 'bg-sky-500/30'
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
          <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-sky-300 hover:text-sky-200 transition-colors">
            ← Anterior
          </button>
        ) : <div />}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={screens[step].canProceed === false}
            className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/30 disabled:opacity-30"
          >
            Continuar →
          </button>
        ) : (
          <button onClick={handleComplete} className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/30">
            Começar! 🔊
          </button>
        )}
      </div>
    </div>
  )
}

export function useEcoaOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const done = localStorage.getItem('ecoa-onboarding-complete')
    if (!done) setShow(true)
  }, [])
  return {
    showOnboarding: show,
    complete: () => { localStorage.setItem('ecoa-onboarding-complete', 'true'); setShow(false) },
    reset: () => { localStorage.removeItem('ecoa-onboarding-complete'); setShow(true) }
  }
}
