import React, { useState } from 'react'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'

/**
 * ONBOARDING SHELL — Wizard de onboarding generico para qualquer eco
 *
 * Uso:
 * <OnboardingShell
 *   eco="serena"
 *   steps={[
 *     {
 *       title: 'Bem-vinda ao Serena',
 *       content: <IntroScreen />,
 *       canProceed: true
 *     },
 *     {
 *       title: 'Como te sentes?',
 *       content: <EmotionPicker value={v} onChange={setV} />,
 *       canProceed: !!v
 *     }
 *   ]}
 *   onComplete={(data) => { ... }}
 * />
 */
export default function OnboardingShell({ eco, steps, onComplete, logo }) {
  const [currentStep, setCurrentStep] = useState(0)
  const theme = getEcoTheme(eco)

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (isLast) {
      if (onComplete) onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(180deg, ${theme.colorDark} 0%, #0a0a0a 100%)` }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: theme.color }}
        />
      </div>

      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          {!isFirst ? (
            <button
              onClick={handleBack}
              className="text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}
          <span className="text-white/30 text-xs">
            {currentStep + 1} de {steps.length}
          </span>
        </div>
      </div>

      {/* Logo (primeiro step) */}
      {isFirst && logo && (
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt={`${theme.name} logo`}
            className="w-20 h-20 object-contain"
          />
        </div>
      )}

      {/* Titulo */}
      {step.title && (
        <div className="px-5 mb-6">
          <h1
            className="text-2xl font-bold text-white text-center"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            {step.title}
          </h1>
          {step.subtitle && (
            <p className="text-white/50 text-sm text-center mt-2">{step.subtitle}</p>
          )}
        </div>
      )}

      {/* Conteudo do step */}
      <div className="flex-1 px-5 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {step.content}
        </div>
      </div>

      {/* Footer com botao */}
      <div className="p-5">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={step.canProceed === false}
            className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-30"
            style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.colorDark})` }}
          >
            {isLast ? (step.finishLabel || 'Comecar') : (step.nextLabel || 'Continuar')}
          </button>
          {step.skipLabel && (
            <button
              onClick={handleNext}
              className="w-full mt-2 py-2 text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              {step.skipLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
