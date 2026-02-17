import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'

/**
 * CHECK-IN SYSTEM — Sistema generico de check-ins para qualquer eco
 *
 * Suporta diferentes frequencias:
 * - daily: 1x por dia
 * - 3x-day: manha, tarde, noite
 * - weekly: 1x por semana
 *
 * Uso:
 * <CheckInSystem
 *   eco="serena"
 *   userId={userId}
 *   config={{
 *     frequency: 'daily',
 *     title: 'Check-in Emocional',
 *     questions: [
 *       {
 *         id: 'emocao',
 *         label: 'Como te sentes agora?',
 *         type: 'emotion-wheel' | 'scale' | 'select' | 'text' | 'body-map',
 *         options: [...],
 *         required: true
 *       }
 *     ],
 *     table: 'serena_emocoes_log',
 *     onComplete: (data) => { ... }
 *   }}
 * />
 */

// ===== Tipos de input =====

function ScaleInput({ question, value, onChange, theme }) {
  const min = question.min || 1
  const max = question.max || 10
  const labels = question.labels || {}

  return (
    <div>
      <label className="text-white text-sm font-medium block mb-3">{question.label}</label>
      <div className="flex items-center gap-1">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              value === n
                ? 'text-white scale-110 shadow-lg'
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
            style={value === n ? { background: theme.color } : {}}
          >
            {n}
          </button>
        ))}
      </div>
      {(labels.min || labels.max) && (
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>{labels.min}</span>
          <span>{labels.max}</span>
        </div>
      )}
    </div>
  )
}

function SelectInput({ question, value, onChange, theme }) {
  return (
    <div>
      <label className="text-white text-sm font-medium block mb-3">{question.label}</label>
      <div className="grid grid-cols-2 gap-2">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-xl text-sm text-left transition-all ${
              value === option.value
                ? 'text-white border-2 shadow-lg'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
            style={value === option.value ? { background: `${theme.color}30`, borderColor: theme.color } : {}}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextInput({ question, value, onChange }) {
  return (
    <div>
      <label className="text-white text-sm font-medium block mb-3">{question.label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || 'Escreve aqui...'}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-white/20 transition-colors"
        rows={question.rows || 3}
      />
    </div>
  )
}

function EmotionWheel({ question, value, onChange, theme }) {
  const emotions = question.options || [
    { value: 'alegria', label: 'Alegria', icon: '😊' },
    { value: 'tristeza', label: 'Tristeza', icon: '😢' },
    { value: 'raiva', label: 'Raiva', icon: '😠' },
    { value: 'medo', label: 'Medo', icon: '😨' },
    { value: 'ansiedade', label: 'Ansiedade', icon: '😰' },
    { value: 'calma', label: 'Calma', icon: '😌' },
    { value: 'cansaco', label: g('Cansado', 'Cansada'), icon: '😴' },
    { value: 'motivacao', label: g('Motivado', 'Motivada'), icon: '💪' },
    { value: 'vazio', label: 'Vazio', icon: '😶' },
    { value: 'gratidao', label: 'Gratidao', icon: '🙏' },
    { value: 'confusao', label: 'Confusao', icon: '😵‍💫' },
    { value: 'esperanca', label: 'Esperanca', icon: '🌟' }
  ]

  return (
    <div>
      <label className="text-white text-sm font-medium block mb-3">{question.label}</label>
      <div className="grid grid-cols-4 gap-2">
        {emotions.map((emotion) => (
          <button
            key={emotion.value}
            onClick={() => onChange(emotion.value)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              value === emotion.value
                ? 'scale-105 shadow-lg'
                : 'bg-white/5 hover:bg-white/10'
            }`}
            style={value === emotion.value ? { background: `${theme.color}30`, border: `2px solid ${theme.color}` } : {}}
          >
            <span className="text-2xl mb-1">{emotion.icon}</span>
            <span className="text-[10px] text-white/60">{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===== Componente principal =====

export default function CheckInSystem({ eco, userId, config, onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const theme = getEcoTheme(eco)

  const questions = config.questions || []
  const currentQuestion = questions[step]
  const isLastStep = step === questions.length - 1
  const totalSteps = questions.length

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleNext = () => {
    if (currentQuestion.required && !answers[currentQuestion.id]) return
    if (isLastStep) {
      handleSubmit()
    } else {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (config.table && userId) {
        const record = {
          user_id: userId,
          ...answers,
          created_at: new Date().toISOString()
        }

        // Adicionar periodo se 3x-day
        if (config.frequency === '3x-day') {
          const hour = new Date().getHours()
          record.periodo = hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite'
        }

        await supabase.from(config.table).insert(record)
      }

      setSubmitted(true)
      if (onComplete) onComplete(answers)
    } catch (error) {
      console.error(`CheckIn(${eco}):`, error)
    } finally {
      setSubmitting(false)
    }
  }

  // Tela de sucesso
  if (submitted) {
    return (
      <div className="text-center py-12">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `${theme.color}20` }}
        >
          <span className="text-4xl">&#10003;</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
          Check-in {g('registado', 'registada')}
        </h3>
        <p className="text-white/50 text-sm">
          {config.successMessage || `${g('Obrigado', 'Obrigada')} por partilhares.`}
        </p>
      </div>
    )
  }

  // Renderizar input baseado no tipo
  const renderInput = () => {
    if (!currentQuestion) return null

    const commonProps = {
      question: currentQuestion,
      value: answers[currentQuestion.id],
      onChange: handleAnswer,
      theme
    }

    switch (currentQuestion.type) {
      case 'scale': return <ScaleInput {...commonProps} />
      case 'select': return <SelectInput {...commonProps} />
      case 'text': return <TextInput {...commonProps} />
      case 'emotion-wheel': return <EmotionWheel {...commonProps} />
      default: return <TextInput {...commonProps} />
    }
  }

  return (
    <div className="py-4">
      {/* Titulo */}
      {config.title && step === 0 && (
        <h2 className="text-white text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-titulos)' }}>
          {config.title}
        </h2>
      )}

      {/* Progresso */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background: i <= step ? theme.color : 'rgba(255,255,255,0.1)'
            }}
          />
        ))}
      </div>

      {/* Passo/Total */}
      <p className="text-white/30 text-xs mb-4">{step + 1} de {totalSteps}</p>

      {/* Questao actual */}
      {renderInput()}

      {/* Botoes */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
          >
            Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={currentQuestion?.required && !answers[currentQuestion?.id]}
          className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-30"
          style={{ background: theme.color }}
        >
          {submitting ? 'A guardar...' : isLastStep ? 'Concluir' : 'Seguinte'}
        </button>
      </div>
    </div>
  )
}
