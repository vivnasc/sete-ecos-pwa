import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { ANTES_DEPOIS_PERGUNTAS } from '../../lib/aurora/gamificacao'

// ============================================================
// AURORA — Antes & Depois (Narrativa de Transformacao)
// Nao sao metricas — e uma historia de transformacao
// ============================================================

const AURORA_COLOR = '#D4A5A5'
const AURORA_DARK = '#2e1a1a'

const STEPS = Object.keys(ANTES_DEPOIS_PERGUNTAS)

const StepIndicator = ({ currentStep, steps, answers }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {steps.map((key, idx) => {
      const isActive = idx === currentStep
      const isFilled = answers[key]?.trim()
      const isPast = idx < currentStep

      return (
        <React.Fragment key={key}>
          {idx > 0 && (
            <div
              className="w-6 h-0.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: isPast || isActive ? AURORA_COLOR : '#e5e7eb'
              }}
            />
          )}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              isActive
                ? 'text-white shadow-lg scale-110'
                : isFilled
                  ? 'text-white'
                  : 'text-gray-400 border-2 border-gray-200'
            }`}
            style={
              isActive
                ? { backgroundColor: AURORA_COLOR, boxShadow: `0 0 16px ${AURORA_COLOR}55` }
                : isFilled
                  ? { backgroundColor: `${AURORA_COLOR}aa` }
                  : undefined
            }
          >
            {isFilled && !isActive ? '\u2713' : idx + 1}
          </div>
        </React.Fragment>
      )
    })}
  </div>
)

export default function AntesDepois() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [saveMsg, setSaveMsg] = useState('')

  // Step navigation (0-3 for the 4 narrative questions, 4 = cartas, 5 = final comparison)
  const [currentStep, setCurrentStep] = useState(0)

  // Narrative answers
  const [answers, setAnswers] = useState({
    quem_eras: '',
    que_feridas: '',
    o_que_soltaste: '',
    quem_es_agora: ''
  })

  // Optional letters
  const [cartaAntes, setCartaAntes] = useState('')
  const [cartaAgora, setCartaAgora] = useState('')

  // View mode: 'steps' | 'cartas' | 'comparacao'
  const [view, setView] = useState('steps')

  // Load existing data
  useEffect(() => {
    if (!session?.user) return

    const loadData = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', session.user.id)
          .maybeSingle()

        if (!userData) {
          setLoading(false)
          return
        }

        setUserId(userData.id)

        const { data: existingData } = await supabase
          .from('aurora_antes_depois')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle()

        if (existingData) {
          setAnswers({
            quem_eras: existingData.quem_eras || '',
            que_feridas: existingData.que_feridas || '',
            o_que_soltaste: existingData.o_que_soltaste || '',
            quem_es_agora: existingData.quem_es_agora || ''
          })
          setCartaAntes(existingData.carta_antes || '')
          setCartaAgora(existingData.carta_agora || '')

          // If all narrative questions are filled, show comparison
          const allFilled = existingData.quem_eras?.trim() &&
            existingData.que_feridas?.trim() &&
            existingData.o_que_soltaste?.trim() &&
            existingData.quem_es_agora?.trim()
          if (allFilled) {
            setView('comparacao')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar Antes & Depois:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session])

  // Update answer for current step
  const updateAnswer = useCallback((key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  // Navigate steps
  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Finished narrative questions, go to cartas
      setView('cartas')
    }
  }, [currentStep])

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Save data
  const guardar = useCallback(async () => {
    if (!userId) return

    setSaving(true)
    setSaveMsg('')

    try {
      const { error } = await supabase
        .from('aurora_antes_depois')
        .upsert({
          user_id: userId,
          quem_eras: answers.quem_eras,
          que_feridas: answers.que_feridas,
          o_que_soltaste: answers.o_que_soltaste,
          quem_es_agora: answers.quem_es_agora,
          carta_antes: cartaAntes || null,
          carta_agora: cartaAgora || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      setSaveMsg(g('Guardado com sucesso!', 'Guardado com sucesso!'))
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (error) {
      console.error('Erro ao guardar Antes & Depois:', error)
      setSaveMsg('Erro ao guardar. Tenta novamente.')
      setTimeout(() => setSaveMsg(''), 4000)
    } finally {
      setSaving(false)
    }
  }, [userId, answers, cartaAntes, cartaAgora])

  // Check if all narrative questions are answered
  const allNarrativeFilled = STEPS.every(key => answers[key]?.trim())

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${AURORA_COLOR}40`, borderTopColor: AURORA_COLOR }}
          />
          <p className="text-gray-500">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <ModuleHeader
        eco="aurora"
        title="Antes & Depois"
        subtitle="A tua historia de transformacao"
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* View switcher tabs */}
        <div
          className="flex rounded-xl overflow-hidden border mb-6"
          style={{ borderColor: `${AURORA_COLOR}30` }}
        >
          <button
            onClick={() => { setView('steps'); setCurrentStep(0) }}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              view === 'steps' ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
            style={view === 'steps' ? { backgroundColor: AURORA_COLOR } : undefined}
          >
            Narrativa
          </button>
          <button
            onClick={() => setView('cartas')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              view === 'cartas' ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
            style={view === 'cartas' ? { backgroundColor: AURORA_COLOR } : undefined}
          >
            Cartas
          </button>
          <button
            onClick={() => setView('comparacao')}
            disabled={!allNarrativeFilled}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              view === 'comparacao' ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            style={view === 'comparacao' ? { backgroundColor: AURORA_COLOR } : undefined}
          >
            Comparacao
          </button>
        </div>

        {/* ======= STEPS VIEW — Narrative Questions ======= */}
        {view === 'steps' && (
          <div className="animate-fadeInAurora">
            <StepIndicator
              currentStep={currentStep}
              steps={STEPS}
              answers={answers}
            />

            {(() => {
              const stepKey = STEPS[currentStep]
              const pergunta = ANTES_DEPOIS_PERGUNTAS[stepKey]
              const value = answers[stepKey]

              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  {/* Step title */}
                  <div className="text-center mb-6">
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-2"
                      style={{ color: AURORA_COLOR }}
                    >
                      Passo {currentStep + 1} de {STEPS.length}
                    </p>
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-3"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {pergunta.titulo}
                    </h2>
                    <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                      {pergunta.prompt}
                    </p>
                  </div>

                  {/* Text area */}
                  <textarea
                    value={value}
                    onChange={(e) => updateAnswer(stepKey, e.target.value)}
                    placeholder={g(
                      'Escreve aqui, no teu ritmo...',
                      'Escreve aqui, no teu ritmo...'
                    )}
                    rows={8}
                    className="w-full p-4 border rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none resize-none transition-all leading-relaxed"
                    style={{ borderColor: `${AURORA_COLOR}30` }}
                    onFocus={(e) => {
                      e.target.style.borderColor = AURORA_COLOR
                      e.target.style.boxShadow = `0 0 0 2px ${AURORA_COLOR}30`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${AURORA_COLOR}30`
                      e.target.style.boxShadow = 'none'
                    }}
                    aria-label={pergunta.titulo}
                  />

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-400">
                      {value.length > 0
                        ? `${value.length} caracteres`
                        : g('Toma o teu tempo.', 'Toma o teu tempo.')}
                    </p>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex gap-3 mt-6">
                    {currentStep > 0 && (
                      <button
                        onClick={goPrev}
                        className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                        style={{ borderColor: `${AURORA_COLOR}40`, color: AURORA_COLOR }}
                      >
                        &larr; Anterior
                      </button>
                    )}
                    <button
                      onClick={goNext}
                      disabled={!value.trim()}
                      className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      style={{ backgroundColor: AURORA_COLOR }}
                    >
                      {currentStep < STEPS.length - 1
                        ? 'Proximo \u2192'
                        : 'Ver Cartas \u2192'}
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Quick save */}
            <button
              onClick={guardar}
              disabled={saving || !STEPS.some(k => answers[k]?.trim())}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: AURORA_COLOR, backgroundColor: `${AURORA_COLOR}15` }}
            >
              {saving ? 'A guardar...' : 'Guardar rascunho'}
            </button>
          </div>
        )}

        {/* ======= CARTAS VIEW — Letters to Self ======= */}
        {view === 'cartas' && (
          <div className="space-y-6 animate-fadeInAurora">
            <div className="text-center mb-2">
              <h2
                className="text-xl font-bold text-gray-800"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Carta para ti {g('mesmo', 'mesma')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Opcional — mas profundamente {g('transformador', 'transformadora')}
              </p>
            </div>

            {/* Letter from past self */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${AURORA_COLOR}20` }}
                  aria-hidden="true"
                >
                  {'\u2709'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Carta do teu eu do passado
                  </h3>
                  <p className="text-xs text-gray-500">
                    O que {g('dirias', 'dirias')} a ti {g('mesmo', 'mesma')} quando comecaste esta jornada?
                  </p>
                </div>
              </div>

              <textarea
                value={cartaAntes}
                onChange={(e) => setCartaAntes(e.target.value)}
                placeholder={g(
                  'Querido eu do passado, quando comecei esta jornada...',
                  'Querida eu do passado, quando comecei esta jornada...'
                )}
                rows={6}
                className="w-full p-4 border rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none resize-none transition-all leading-relaxed text-sm"
                style={{ borderColor: `${AURORA_COLOR}30` }}
                onFocus={(e) => {
                  e.target.style.borderColor = AURORA_COLOR
                  e.target.style.boxShadow = `0 0 0 2px ${AURORA_COLOR}30`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${AURORA_COLOR}30`
                  e.target.style.boxShadow = 'none'
                }}
                aria-label="Carta do passado"
              />
            </div>

            {/* Letter from present self */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${AURORA_COLOR}20` }}
                  aria-hidden="true"
                >
                  {'\u2728'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Carta do teu eu de agora
                  </h3>
                  <p className="text-xs text-gray-500">
                    O que {g('dirias', 'dirias')} a ti {g('mesmo', 'mesma')} hoje, com tudo o que aprendeste?
                  </p>
                </div>
              </div>

              <textarea
                value={cartaAgora}
                onChange={(e) => setCartaAgora(e.target.value)}
                placeholder={g(
                  'Querido eu de agora, olhando para o caminho que percorri...',
                  'Querida eu de agora, olhando para o caminho que percorri...'
                )}
                rows={6}
                className="w-full p-4 border rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none resize-none transition-all leading-relaxed text-sm"
                style={{ borderColor: `${AURORA_COLOR}30` }}
                onFocus={(e) => {
                  e.target.style.borderColor = AURORA_COLOR
                  e.target.style.boxShadow = `0 0 0 2px ${AURORA_COLOR}30`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${AURORA_COLOR}30`
                  e.target.style.boxShadow = 'none'
                }}
                aria-label="Carta do presente"
              />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => { setView('steps'); setCurrentStep(STEPS.length - 1) }}
                className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                style={{ borderColor: `${AURORA_COLOR}40`, color: AURORA_COLOR }}
              >
                &larr; Voltar
              </button>
              {allNarrativeFilled && (
                <button
                  onClick={() => setView('comparacao')}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-all shadow-md"
                  style={{ backgroundColor: AURORA_COLOR }}
                >
                  Ver Comparacao &rarr;
                </button>
              )}
            </div>

            {/* Save */}
            <button
              onClick={guardar}
              disabled={saving}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              style={{ backgroundColor: AURORA_COLOR }}
            >
              {saving ? 'A guardar...' : 'Guardar Tudo'}
            </button>
          </div>
        )}

        {/* ======= COMPARACAO VIEW — Side by Side ======= */}
        {view === 'comparacao' && (
          <div className="animate-fadeInAurora">
            <div className="text-center mb-6">
              <h2
                className="text-2xl font-bold text-gray-800"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                A Tua Transformacao
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {g('Olha para o caminho que percorreste.', 'Olha para o caminho que percorreste.')}
              </p>
            </div>

            {/* Before vs After — Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* ANTES column */}
              <div className="space-y-4">
                <div
                  className="text-center py-3 rounded-xl font-bold text-white"
                  style={{ backgroundColor: `${AURORA_DARK}` }}
                >
                  Antes
                </div>

                {/* Quem eras */}
                <div
                  className="bg-white rounded-2xl shadow-sm border p-5"
                  style={{ borderColor: `${AURORA_COLOR}20` }}
                >
                  <h4
                    className="text-sm font-bold mb-2"
                    style={{ color: AURORA_COLOR }}
                  >
                    {ANTES_DEPOIS_PERGUNTAS.quem_eras.titulo}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answers.quem_eras || <span className="text-gray-400 italic">Ainda nao respondeste.</span>}
                  </p>
                </div>

                {/* Que feridas */}
                <div
                  className="bg-white rounded-2xl shadow-sm border p-5"
                  style={{ borderColor: `${AURORA_COLOR}20` }}
                >
                  <h4
                    className="text-sm font-bold mb-2"
                    style={{ color: AURORA_COLOR }}
                  >
                    {ANTES_DEPOIS_PERGUNTAS.que_feridas.titulo}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answers.que_feridas || <span className="text-gray-400 italic">Ainda nao respondeste.</span>}
                  </p>
                </div>

                {/* Carta do passado */}
                {cartaAntes.trim() && (
                  <div
                    className="rounded-2xl p-5 border border-dashed"
                    style={{ borderColor: `${AURORA_COLOR}40`, backgroundColor: `${AURORA_COLOR}08` }}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Carta do teu eu do passado
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                      {cartaAntes}
                    </p>
                  </div>
                )}
              </div>

              {/* AGORA column */}
              <div className="space-y-4">
                <div
                  className="text-center py-3 rounded-xl font-bold text-white"
                  style={{ backgroundColor: AURORA_COLOR }}
                >
                  Agora
                </div>

                {/* O que soltaste */}
                <div
                  className="bg-white rounded-2xl shadow-sm border p-5"
                  style={{ borderColor: `${AURORA_COLOR}20` }}
                >
                  <h4
                    className="text-sm font-bold mb-2"
                    style={{ color: AURORA_COLOR }}
                  >
                    {ANTES_DEPOIS_PERGUNTAS.o_que_soltaste.titulo}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answers.o_que_soltaste || <span className="text-gray-400 italic">Ainda nao respondeste.</span>}
                  </p>
                </div>

                {/* Quem es agora */}
                <div
                  className="bg-white rounded-2xl shadow-sm border p-5"
                  style={{ borderColor: `${AURORA_COLOR}20` }}
                >
                  <h4
                    className="text-sm font-bold mb-2"
                    style={{ color: AURORA_COLOR }}
                  >
                    {ANTES_DEPOIS_PERGUNTAS.quem_es_agora.titulo}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {answers.quem_es_agora || <span className="text-gray-400 italic">Ainda nao respondeste.</span>}
                  </p>
                </div>

                {/* Carta do presente */}
                {cartaAgora.trim() && (
                  <div
                    className="rounded-2xl p-5 border border-dashed"
                    style={{ borderColor: `${AURORA_COLOR}40`, backgroundColor: `${AURORA_COLOR}08` }}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Carta do teu eu de agora
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                      {cartaAgora}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Edit / Save actions */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => { setView('steps'); setCurrentStep(0) }}
                className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                style={{ borderColor: `${AURORA_COLOR}40`, color: AURORA_COLOR }}
              >
                Editar Narrativa
              </button>
              <button
                onClick={() => setView('cartas')}
                className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                style={{ borderColor: `${AURORA_COLOR}40`, color: AURORA_COLOR }}
              >
                Editar Cartas
              </button>
            </div>

            <button
              onClick={guardar}
              disabled={saving}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              style={{ backgroundColor: AURORA_COLOR }}
            >
              {saving ? 'A guardar...' : 'Guardar Tudo'}
            </button>
          </div>
        )}

        {/* Save message */}
        {saveMsg && (
          <div className={`mt-3 text-center text-sm font-medium ${
            saveMsg.includes('Erro') ? 'text-red-500' : 'text-green-600'
          }`}>
            {saveMsg}
          </div>
        )}

        {/* Motivational footer */}
        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          {g(
            'A tua historia e unica. Cada passo que deste trouxe-te ate aqui.',
            'A tua historia e unica. Cada passo que deste trouxe-te ate aqui.'
          )}
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeInAurora {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInAurora {
          animation: fadeInAurora 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
