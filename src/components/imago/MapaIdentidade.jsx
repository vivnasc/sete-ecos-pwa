import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { DIMENSOES_IDENTIDADE } from '../../lib/imago/gamificacao'

// ============================================================
// IMAGO — Mapa de Identidade
// 7 dimensoes do ser (uma por eco). Representacao visual do eu.
// Chakra: Sahasrara (Coroa)
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#2a2435'
const ACCENT_LIGHT = '#A99BBF'

export default function MapaIdentidade() {
  const { userRecord } = useAuth()
  const navigate = useNavigate()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Dimensao activa (aberta para escrita)
  const [activeDimensao, setActiveDimensao] = useState(null)
  const [reflexaoText, setReflexaoText] = useState('')

  // Dados guardados: { [dimensaoId]: { conteudo, reflexao } }
  const [savedData, setSavedData] = useState({})

  // ===== Carregar dados existentes =====
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('imago_identidade')
        .select('dimensao, conteudo, reflexao')
        .eq('user_id', userId)

      if (error) throw error

      const mapped = {}
      ;(data || []).forEach(row => {
        mapped[row.dimensao] = {
          conteudo: row.conteudo || '',
          reflexao: row.reflexao || ''
        }
      })
      setSavedData(mapped)
    } catch (err) {
      console.error('MapaIdentidade: Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ===== Abrir dimensao para reflexao =====
  const openDimensao = useCallback((dim) => {
    setActiveDimensao(dim.id)
    setReflexaoText(savedData[dim.id]?.reflexao || '')
    setShowSuccess(false)
  }, [savedData])

  const closeDimensao = useCallback(() => {
    setActiveDimensao(null)
    setReflexaoText('')
    setShowSuccess(false)
  }, [])

  // ===== Guardar reflexao (upsert) =====
  const handleSave = useCallback(async () => {
    if (!userId || !activeDimensao || !reflexaoText.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('imago_identidade')
        .upsert({
          user_id: userId,
          dimensao: activeDimensao,
          conteudo: activeDimensao,
          reflexao: reflexaoText.trim()
        }, { onConflict: 'user_id,dimensao' })

      if (error) throw error

      // Actualizar estado local
      setSavedData(prev => ({
        ...prev,
        [activeDimensao]: {
          conteudo: activeDimensao,
          reflexao: reflexaoText.trim()
        }
      }))

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
              estrelas_total: current + 8,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      } catch (ecoErr) {
        console.error('MapaIdentidade: Erro ao atribuir estrelas:', ecoErr)
      }

      setShowSuccess(true)
    } catch (err) {
      console.error('MapaIdentidade: Erro ao guardar:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, activeDimensao, reflexaoText])

  // ===== Contagem de dimensoes preenchidas =====
  const filledCount = Object.keys(savedData).length
  const totalCount = DIMENSOES_IDENTIDADE.length

  // ===== Loading =====
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">&#11088;</div>
          <p className="text-white/60 text-sm">A preparar o mapa...</p>
        </div>
      </div>
    )
  }

  // ===== Dimensao activa aberta =====
  const activeDim = activeDimensao
    ? DIMENSOES_IDENTIDADE.find(d => d.id === activeDimensao)
    : null

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}
    >
      <ModuleHeader
        eco="imago"
        title="Mapa de Identidade"
        subtitle="7 dimensoes do teu ser"
      />

      <div className="max-w-lg mx-auto px-4 mt-4">

        {/* Progresso */}
        <div
          className="rounded-2xl border p-4 mb-6"
          style={{ background: `${ACCENT}10`, borderColor: `${ACCENT}25` }}
        >
          <p className="text-white/80 text-sm text-center">
            <span style={{ color: ACCENT }} className="font-bold">{filledCount}</span>
            {' '}de {totalCount} dimensoes {g('explorados', 'exploradas')}
          </p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${totalCount > 0 ? (filledCount / totalCount) * 100 : 0}%`,
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`
              }}
            />
          </div>
        </div>

        {/* Grid das 7 dimensoes */}
        {!activeDimensao && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-2">
              <h2
                className="text-white text-lg font-semibold"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                As tuas 7 dimensoes
              </h2>
              <p className="text-white/50 text-sm mt-1">
                Toca numa dimensao para reflectir
              </p>
            </div>

            {/* Central circle layout — grid adaptivo */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DIMENSOES_IDENTIDADE.map((dim) => {
                const isFilled = !!savedData[dim.id]
                return (
                  <button
                    key={dim.id}
                    onClick={() => openDimensao(dim)}
                    className="relative p-4 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      background: isFilled
                        ? `linear-gradient(135deg, ${dim.cor}25, ${dim.cor}10)`
                        : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isFilled ? dim.cor + '55' : 'rgba(255,255,255,0.08)'}`,
                    }}
                    aria-label={`${dim.nome} — ${dim.pergunta}`}
                  >
                    {/* Filled indicator */}
                    {isFilled && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                        style={{ background: `${dim.cor}33` }}
                        aria-hidden="true"
                      >
                        &#10003;
                      </div>
                    )}

                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                      style={{
                        background: `${dim.cor}20`,
                        boxShadow: isFilled ? `0 0 20px ${dim.cor}22` : 'none'
                      }}
                      aria-hidden="true"
                    >
                      {dim.icon}
                    </div>
                    <p className="text-white font-medium text-sm">{dim.nome}</p>
                    <p className="text-white/40 text-xs mt-1 capitalize">{dim.eco}</p>
                  </button>
                )
              })}
            </div>

            {/* Mensagem motivacional */}
            {filledCount > 0 && filledCount < totalCount && (
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(139,123,165,0.06)' }}>
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  Cada dimensao que exploras revela mais de quem es. Continua a {g('descobrir-te', 'descobrir-te')}.
                </p>
              </div>
            )}

            {filledCount === totalCount && (
              <div
                className="p-5 rounded-2xl text-center"
                style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT_DARK}44)`, border: `1px solid ${ACCENT}30` }}
              >
                <div className="text-3xl mb-2" aria-hidden="true">&#11088;</div>
                <h3
                  className="text-white font-semibold mb-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Mapa {g('completo', 'completa')}!
                </h3>
                <p className="text-white/60 text-sm">
                  Exploraste todas as 7 dimensoes do teu ser. Podes sempre voltar a reflectir.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== REFLEXAO VIEW — Dimensao aberta ===== */}
        {activeDimensao && activeDim && !showSuccess && (
          <div className="space-y-6 animate-fadeIn">
            {/* Dimensao header */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
                style={{
                  background: `${activeDim.cor}20`,
                  boxShadow: `0 0 40px ${activeDim.cor}15`
                }}
                aria-hidden="true"
              >
                {activeDim.icon}
              </div>
              <h2
                className="text-white text-xl font-bold mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {activeDim.nome}
              </h2>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Eco {activeDim.eco}
              </p>
            </div>

            {/* Pergunta central */}
            <div
              className="p-5 rounded-xl text-center"
              style={{
                background: `linear-gradient(135deg, ${activeDim.cor}15, ${ACCENT_DARK}44)`,
                border: `1px solid ${activeDim.cor}25`
              }}
            >
              <p
                className="text-lg text-white italic leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                &ldquo;{activeDim.pergunta}&rdquo;
              </p>
            </div>

            {/* Area de reflexao */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                A tua reflexao
              </label>
              <div className="relative">
                <textarea
                  value={reflexaoText}
                  onChange={(e) => setReflexaoText(e.target.value)}
                  placeholder="Escreve livremente... Este espaco e so teu."
                  rows={8}
                  maxLength={2000}
                  className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    '--tw-ring-color': activeDim.cor
                  }}
                  aria-label={`Reflexao sobre ${activeDim.nome}`}
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-600">
                  {reflexaoText.length}/2000
                </span>
              </div>
            </div>

            {/* Reflexao anterior (se existir) */}
            {savedData[activeDimensao]?.reflexao && savedData[activeDimensao].reflexao !== reflexaoText && (
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs text-gray-500 mb-1">Reflexao anterior:</p>
                <p className="text-sm text-gray-400 italic leading-relaxed">
                  &ldquo;{savedData[activeDimensao].reflexao}&rdquo;
                </p>
              </div>
            )}

            {/* Nota de encorajamento */}
            <div className="p-3 rounded-xl" style={{ background: `rgba(139,123,165,0.06)` }}>
              <p className="text-xs text-gray-500 italic leading-relaxed text-center">
                Nao ha respostas certas. Escreve o que sentires no momento. Podes sempre voltar e reescrever.
              </p>
            </div>

            {/* Botoes */}
            <div className="flex gap-3">
              <button
                onClick={closeDimensao}
                className="flex-1 py-3.5 rounded-xl font-medium text-sm text-white/60 transition-all hover:text-white hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !reflexaoText.trim()}
                className="flex-1 py-3.5 rounded-xl font-medium text-sm text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${activeDim.cor}, ${ACCENT_DARK})` }}
              >
                {saving ? 'A guardar...' : 'Guardar reflexao'}
              </button>
            </div>
          </div>
        )}

        {/* ===== SUCCESS VIEW ===== */}
        {activeDimensao && activeDim && showSuccess && (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `${activeDim.cor}22`, boxShadow: `0 0 40px ${activeDim.cor}22` }}
            >
              {activeDim.icon}
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Reflexao {g('guardado', 'guardada')}
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                A dimensao <strong className="text-white/80">{activeDim.nome}</strong> foi {g('explorado', 'explorada')}. +8 Estrelas &#11088;
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={closeDimensao}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Ver todas as dimensoes
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
