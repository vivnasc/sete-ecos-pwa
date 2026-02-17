import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { LISTA_VALORES } from '../../lib/imago/gamificacao'

// ============================================================
// IMAGO — Valores Essenciais
// Exercicio de descoberta: 50 valores -> 10 -> 5 -> top 3
// Chakra: Sahasrara (Coroa)
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#2a2435'
const ACCENT_LIGHT = '#A99BBF'

// Limites por step
const STEP_LIMITS = { 1: 10, 2: 5, 3: 3 }
const STEP_TITLES = {
  1: 'Escolhe 10 valores que ressoam contigo',
  2: 'Desses 10, escolhe os 5 mais importantes',
  3: 'Desses 5, escolhe os teus 3 valores essenciais',
  4: 'Reflecte sobre cada valor',
  5: 'Os teus 3 valores essenciais'
}
const STEP_SUBTITLES = {
  1: 'Nao penses demasiado — sente.',
  2: 'Quais nao podes viver sem?',
  3: 'Se so pudesses levar 3, quais seriam?',
  4: 'Como vives cada valor no dia a dia?',
  5: null
}

export default function ValoresEssenciais() {
  const { userRecord } = useAuth()
  const navigate = useNavigate()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Wizard state
  const [step, setStep] = useState(1)

  // Step 1: 50 -> 10
  const [selectedTen, setSelectedTen] = useState([])
  // Step 2: 10 -> 5
  const [selectedFive, setSelectedFive] = useState([])
  // Step 3: 5 -> 3
  const [selectedThree, setSelectedThree] = useState([])
  // Step 4: reflexoes para os top 3
  const [reflexoes, setReflexoes] = useState({})

  // Dados existentes (se ja completou anteriormente)
  const [existingData, setExistingData] = useState(null)
  const [mode, setMode] = useState('wizard') // 'wizard' | 'view'

  // ===== Carregar dados existentes =====
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('imago_valores')
        .select('valores_top, reflexoes, revisao_data')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      if (data && data.valores_top) {
        const valores = typeof data.valores_top === 'string'
          ? JSON.parse(data.valores_top)
          : data.valores_top
        const refs = typeof data.reflexoes === 'string'
          ? JSON.parse(data.reflexoes)
          : (data.reflexoes || {})

        setExistingData({
          valores: valores,
          reflexoes: refs,
          revisao_data: data.revisao_data
        })
        setMode('view')
      }
    } catch (err) {
      console.error('ValoresEssenciais: Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ===== Toggle valor selection =====
  const toggleValor = useCallback((valor, currentList, setList, limit) => {
    setList(prev => {
      if (prev.includes(valor)) {
        return prev.filter(v => v !== valor)
      }
      if (prev.length >= limit) return prev
      return [...prev, valor]
    })
  }, [])

  // ===== Avancar para o proximo step =====
  const nextStep = useCallback(() => {
    if (step === 1 && selectedTen.length === 10) {
      setStep(2)
    } else if (step === 2 && selectedFive.length === 5) {
      setStep(3)
    } else if (step === 3 && selectedThree.length === 3) {
      // Inicializar reflexoes vazias para os 3 valores
      const initialReflexoes = {}
      selectedThree.forEach(v => { initialReflexoes[v] = reflexoes[v] || '' })
      setReflexoes(initialReflexoes)
      setStep(4)
    }
  }, [step, selectedTen, selectedFive, selectedThree, reflexoes])

  const prevStep = useCallback(() => {
    if (step > 1) setStep(step - 1)
  }, [step])

  // ===== Guardar resultado final (upsert) =====
  const handleSave = useCallback(async () => {
    if (!userId || selectedThree.length !== 3) return

    // Verificar que todas as reflexoes estao preenchidas
    const allFilled = selectedThree.every(v => reflexoes[v]?.trim())
    if (!allFilled) {
      alert('Por favor, escreve uma reflexao para cada valor.')
      return
    }

    setSaving(true)
    try {
      // Calcular proxima data de revisao (3 meses)
      const revisaoDate = new Date()
      revisaoDate.setMonth(revisaoDate.getMonth() + 3)

      const { error } = await supabase
        .from('imago_valores')
        .upsert({
          user_id: userId,
          valores_top: selectedThree,
          reflexoes: reflexoes,
          revisao_data: revisaoDate.toISOString().split('T')[0]
        }, { onConflict: 'user_id' })

      if (error) throw error

      // Award estrelas
      try {
        const { data: clientData } = await supabase
          .from('imago_clients')
          .select('estrelas_total')
          .eq('user_id', userId)
          .maybeSingle()

        if (clientData) {
          const current = clientData.estrelas_total || 0
          await supabase
            .from('imago_clients')
            .update({
              estrelas_total: current + 7,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      } catch (ecoErr) {
        console.error('ValoresEssenciais: Erro ao atribuir estrelas:', ecoErr)
      }

      // Actualizar estado local
      setExistingData({
        valores: selectedThree,
        reflexoes: reflexoes,
        revisao_data: revisaoDate.toISOString().split('T')[0]
      })
      setStep(5)
    } catch (err) {
      console.error('ValoresEssenciais: Erro ao guardar:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, selectedThree, reflexoes])

  // ===== Refazer exercicio =====
  const startOver = useCallback(() => {
    setSelectedTen([])
    setSelectedFive([])
    setSelectedThree([])
    setReflexoes({})
    setStep(1)
    setMode('wizard')
  }, [])

  // ===== Verificar revisao trimestral =====
  const isReviewDue = existingData?.revisao_data
    ? new Date(existingData.revisao_data) <= new Date()
    : false

  // ===== Loading =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">&#128142;</div>
          <p className="text-white/60 text-sm">A preparar os valores...</p>
        </div>
      </div>
    )
  }

  // ===== VIEW MODE — Valores ja definidos =====
  if (mode === 'view' && existingData) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}
      >
        <ModuleHeader
          eco="imago"
          title="Valores Essenciais"
          subtitle="Descobre os teus 3 valores fundamentais"
        />

        <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">

          {/* Alerta de revisao trimestral */}
          {isReviewDue && (
            <div
              className="rounded-2xl border p-4"
              style={{ background: `${ACCENT}15`, borderColor: `${ACCENT}40` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">&#128197;</span>
                <div>
                  <p className="text-white font-medium text-sm">
                    Revisao trimestral {g('sugerido', 'sugerida')}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Ja passaram 3 meses desde a tua ultima reflexao. Os teus valores podem ter mudado. Queres refazer o exercicio?
                  </p>
                  <button
                    onClick={startOver}
                    className="mt-3 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    Refazer exercicio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Os 3 valores */}
          <div className="text-center mb-2">
            <h2
              className="text-white text-xl font-bold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Os teus 3 valores essenciais
            </h2>
          </div>

          <div className="space-y-4">
            {existingData.valores.map((valor, index) => (
              <div
                key={valor}
                className="rounded-2xl border p-5 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT_DARK}33)`,
                  borderColor: `${ACCENT}30`
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: `${ACCENT}25`, color: ACCENT_LIGHT }}
                  >
                    {index + 1}
                  </div>
                  <h3
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {valor}
                  </h3>
                </div>
                {existingData.reflexoes[valor] && (
                  <p className="text-white/70 text-sm italic leading-relaxed pl-[52px]">
                    &ldquo;{existingData.reflexoes[valor]}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Proxima revisao */}
          {existingData.revisao_data && !isReviewDue && (
            <div className="text-center">
              <p className="text-white/30 text-xs">
                Proxima revisao sugerida: {new Date(existingData.revisao_data).toLocaleDateString('pt-PT', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Botao para refazer */}
          <div className="text-center pt-4 pb-8">
            <button
              onClick={startOver}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
              <span>&#x270F;&#xFE0F;</span>
              <span>Refazer exercicio</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== WIZARD MODE =====
  const currentTitle = STEP_TITLES[step]
  const currentSubtitle = STEP_SUBTITLES[step]

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}
    >
      <ModuleHeader
        eco="imago"
        title="Valores Essenciais"
        subtitle={step <= 4 ? `Passo ${step} de 4` : 'Descobre os teus 3 valores fundamentais'}
      />

      <div className="max-w-lg mx-auto px-4 mt-4">

        {/* Progress dots */}
        {step <= 4 && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  background: s <= step ? ACCENT : 'rgba(255,255,255,0.15)',
                  transform: s === step ? 'scale(1.3)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        )}

        {/* Step title */}
        {step <= 4 && (
          <div className="text-center mb-6">
            <h2
              className="text-white text-lg font-bold mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {currentTitle}
            </h2>
            {currentSubtitle && (
              <p className="text-white/50 text-sm">{currentSubtitle}</p>
            )}
          </div>
        )}

        {/* ===== STEP 1: 50 valores -> 10 ===== */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Counter */}
            <div className="text-center">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: selectedTen.length === 10 ? `${ACCENT}25` : 'rgba(255,255,255,0.06)',
                  color: selectedTen.length === 10 ? ACCENT_LIGHT : 'rgba(255,255,255,0.5)'
                }}
              >
                {selectedTen.length} / 10 {g('seleccionados', 'seleccionados')}
              </span>
            </div>

            {/* Grid de valores */}
            <div className="flex flex-wrap gap-2 justify-center">
              {LISTA_VALORES.map(valor => {
                const isSelected = selectedTen.includes(valor)
                const isDisabled = !isSelected && selectedTen.length >= 10
                return (
                  <button
                    key={valor}
                    onClick={() => toggleValor(valor, selectedTen, setSelectedTen, 10)}
                    disabled={isDisabled}
                    className="px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      background: isSelected ? `${ACCENT}30` : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: `1.5px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.08)'}`,
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                    aria-pressed={isSelected}
                  >
                    {valor}
                  </button>
                )
              })}
            </div>

            {/* Navegacao */}
            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                disabled={selectedTen.length !== 10}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-30"
                style={{ background: selectedTen.length === 10 ? ACCENT : 'rgba(255,255,255,0.1)' }}
              >
                Proximo &#8594;
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: 10 -> 5 ===== */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Counter */}
            <div className="text-center">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: selectedFive.length === 5 ? `${ACCENT}25` : 'rgba(255,255,255,0.06)',
                  color: selectedFive.length === 5 ? ACCENT_LIGHT : 'rgba(255,255,255,0.5)'
                }}
              >
                {selectedFive.length} / 5 {g('seleccionados', 'seleccionados')}
              </span>
            </div>

            {/* Os 10 valores seleccionados */}
            <div className="flex flex-wrap gap-3 justify-center">
              {selectedTen.map(valor => {
                const isSelected = selectedFive.includes(valor)
                const isDisabled = !isSelected && selectedFive.length >= 5
                return (
                  <button
                    key={valor}
                    onClick={() => toggleValor(valor, selectedFive, setSelectedFive, 5)}
                    disabled={isDisabled}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      background: isSelected ? `${ACCENT}30` : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: `2px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                    aria-pressed={isSelected}
                  >
                    {valor}
                  </button>
                )
              })}
            </div>

            {/* Navegacao */}
            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white/60 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                &#8592; Voltar
              </button>
              <button
                onClick={nextStep}
                disabled={selectedFive.length !== 5}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-30"
                style={{ background: selectedFive.length === 5 ? ACCENT : 'rgba(255,255,255,0.1)' }}
              >
                Proximo &#8594;
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: 5 -> 3 ===== */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Counter */}
            <div className="text-center">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: selectedThree.length === 3 ? `${ACCENT}25` : 'rgba(255,255,255,0.06)',
                  color: selectedThree.length === 3 ? ACCENT_LIGHT : 'rgba(255,255,255,0.5)'
                }}
              >
                {selectedThree.length} / 3 {g('seleccionados', 'seleccionados')}
              </span>
            </div>

            {/* Os 5 valores */}
            <div className="space-y-3">
              {selectedFive.map(valor => {
                const isSelected = selectedThree.includes(valor)
                const isDisabled = !isSelected && selectedThree.length >= 3
                return (
                  <button
                    key={valor}
                    onClick={() => toggleValor(valor, selectedThree, setSelectedThree, 3)}
                    disabled={isDisabled}
                    className="w-full p-4 rounded-xl text-left transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${ACCENT}25, ${ACCENT_DARK}44)`
                        : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.08)'}`,
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{
                          background: isSelected ? `${ACCENT}33` : 'rgba(255,255,255,0.08)',
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)'
                        }}
                      >
                        {isSelected ? '&#10003;' : ''}
                      </div>
                      <span
                        className={`text-base font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {valor}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Navegacao */}
            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white/60 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                &#8592; Voltar
              </button>
              <button
                onClick={nextStep}
                disabled={selectedThree.length !== 3}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-30"
                style={{ background: selectedThree.length === 3 ? ACCENT : 'rgba(255,255,255,0.1)' }}
              >
                Proximo &#8594;
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Reflexoes para os 3 valores ===== */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {selectedThree.map((valor, index) => (
              <div
                key={valor}
                className="rounded-2xl border p-5 space-y-3"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}08, ${ACCENT_DARK}33)`,
                  borderColor: `${ACCENT}20`
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: `${ACCENT}25`, color: ACCENT_LIGHT }}
                  >
                    {index + 1}
                  </div>
                  <h3
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {valor}
                  </h3>
                </div>
                <label className="text-sm text-white/60 block">
                  Como vives este valor no dia a dia?
                </label>
                <textarea
                  value={reflexoes[valor] || ''}
                  onChange={(e) => setReflexoes(prev => ({ ...prev, [valor]: e.target.value }))}
                  placeholder="Escreve livremente..."
                  rows={4}
                  maxLength={1000}
                  className="w-full p-3 rounded-xl text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', '--tw-ring-color': ACCENT }}
                  aria-label={`Reflexao sobre ${valor}`}
                />
                <div className="text-right">
                  <span className="text-xs text-gray-600">
                    {(reflexoes[valor] || '').length}/1000
                  </span>
                </div>
              </div>
            ))}

            {/* Nota de encorajamento */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(139,123,165,0.06)' }}>
              <p className="text-xs text-gray-500 italic leading-relaxed text-center">
                Os teus valores sao a tua bussola interna. Quando os conheces, as decisoes ficam mais claras.
              </p>
            </div>

            {/* Navegacao */}
            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white/60 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                &#8592; Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !selectedThree.every(v => reflexoes[v]?.trim())}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: !saving && selectedThree.every(v => reflexoes[v]?.trim())
                    ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`
                    : 'rgba(255,255,255,0.1)'
                }}
              >
                {saving ? 'A guardar...' : 'Completar (+7 Estrelas &#11088;)'}
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 5: Resultado final ===== */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Celebracao */}
            <div className="text-center py-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4"
                style={{ background: `${ACCENT}22`, boxShadow: `0 0 50px ${ACCENT}22` }}
              >
                &#128142;
              </div>
              <h2
                className="text-white text-2xl font-bold mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Os teus 3 valores essenciais
              </h2>
              <p className="text-white/50 text-sm max-w-xs mx-auto">
                Estes sao os pilares da tua identidade. {g('Guarda-os', 'Guarda-os')} perto.
              </p>
            </div>

            {/* Os 3 valores com reflexoes */}
            <div className="space-y-4">
              {selectedThree.map((valor, index) => (
                <div
                  key={valor}
                  className="rounded-2xl border p-5 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT_DARK}44)`,
                    borderColor: `${ACCENT}35`
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: `${ACCENT}30`, color: ACCENT_LIGHT }}
                    >
                      {index + 1}
                    </div>
                    <h3
                      className="text-white text-lg font-semibold"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {valor}
                    </h3>
                  </div>
                  {reflexoes[valor] && (
                    <p className="text-white/70 text-sm italic leading-relaxed pl-[52px]">
                      &ldquo;{reflexoes[valor]}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Revisao trimestral */}
            <div
              className="p-4 rounded-xl text-center"
              style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}
            >
              <p className="text-white/50 text-xs">
                &#128197; Revisao trimestral sugerida para{' '}
                <strong className="text-white/70">
                  {(() => {
                    const d = new Date()
                    d.setMonth(d.getMonth() + 3)
                    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
                  })()}
                </strong>
              </p>
              <p className="text-white/30 text-xs mt-1">
                Os valores podem evoluir. Voltaremos a perguntar.
              </p>
            </div>

            {/* Botao de voltar */}
            <div className="text-center pt-4 pb-8">
              <button
                onClick={() => navigate('/imago/dashboard')}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Voltar ao dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
