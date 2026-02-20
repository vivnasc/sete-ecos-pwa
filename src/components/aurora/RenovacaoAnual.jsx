import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'

// ============================================================
// AURORA — Renovação Anual
// Renovação anual — refazer jornada condensada em 1 mês,
// ver o que mudou.
// Chakra: Integração Total — Ciclo de renovação
// ============================================================

const ACCENT = '#D4A5A5'
const ACCENT_DARK = '#2e1a1a'
const ACCENT_SUBTLE = 'rgba(212,165,165,0.12)'

// ---- Intencao Item (editable) ----
const IntencaoItem = ({ intencao, index, onUpdate, onRemove }) => (
  <div
    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
  >
    <span className="text-sm font-bold flex-shrink-0" style={{ color: ACCENT }}>
      {index + 1}.
    </span>
    <input
      type="text"
      value={intencao}
      onChange={(e) => onUpdate(index, e.target.value)}
      placeholder="Escreve uma intenção..."
      maxLength={200}
      className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
      aria-label={`Intenção ${index + 1}`}
    />
    <button
      onClick={() => onRemove(index)}
      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
      aria-label={`Remover intenção ${index + 1}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
)

// ---- Renovação Histórico Card ----
const RenovacaoCard = ({ renovacao, isLatest }) => {
  const [expanded, setExpanded] = useState(false)
  const intencoes = renovacao.intencoes_novas || []

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        background: expanded ? `${ACCENT}11` : 'rgba(255,255,255,0.03)',
        border: isLatest ? `1px solid ${ACCENT}44` : '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all duration-200"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${ACCENT}22` }}
            aria-hidden="true"
          >
            🔄
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-white font-medium">
                Renovação {renovacao.ano}
              </p>
              {isLatest && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: `${ACCENT}22`, color: ACCENT }}
                >
                  Mais recente
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {renovacao.cerimonia_data
                ? new Date(renovacao.cerimonia_data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Data não registada'}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fadeIn">
          <div className="pt-2 border-t border-white/5 space-y-4">
            {renovacao.o_que_mudou && (
              <div>
                <p className="text-xs text-gray-500 mb-1">O que mudou:</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                  {renovacao.o_que_mudou}
                </p>
              </div>
            )}
            {intencoes.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Intenções para o ano:</p>
                <div className="space-y-1.5">
                  {intencoes.map((int, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: ACCENT }}>
                        {idx + 1}.
                      </span>
                      <p className="text-sm text-gray-300">{int}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function RenovacaoAnual() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const { t } = useI18n()
  const userId = userRecord?.id || null

  // Form
  const [oQueMudou, setOQueMudou] = useState('')
  const [intencoes, setIntencoes] = useState([''])
  const [saving, setSaving] = useState(false)

  // History
  const [renovacoes, setRenovacoes] = useState([])
  const [loadingRenovacoes, setLoadingRenovacoes] = useState(false)

  // View
  const [view, setView] = useState('nova') // 'nova' | 'historico'
  const [showSuccess, setShowSuccess] = useState(false)

  // Current year
  const anoActual = new Date().getFullYear()

  // Previous renewal for comparison
  const renovacaoAnterior = renovacoes.length > 0 ? renovacoes[0] : null

  // ===== Carregar renovações =====
  const fetchRenovacoes = useCallback(async () => {
    if (!userId) return
    setLoadingRenovacoes(true)
    try {
      const { data, error } = await supabase
        .from('aurora_renovacao')
        .select('*')
        .eq('user_id', userId)
        .order('ano', { ascending: false })

      if (error) throw error
      setRenovacoes(data || [])
    } catch (err) {
      console.error('RenovacaoAnual: Erro ao carregar renovacoes:', err)
    } finally {
      setLoadingRenovacoes(false)
    }
  }, [userId])

  useEffect(() => {
    fetchRenovacoes()
  }, [fetchRenovacoes])

  // ===== Manage intenções =====
  const handleUpdateIntencao = useCallback((index, value) => {
    setIntencoes(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }, [])

  const handleRemoveIntencao = useCallback((index) => {
    setIntencoes(prev => {
      if (prev.length <= 1) return ['']
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleAddIntencao = useCallback(() => {
    if (intencoes.length >= 10) return
    setIntencoes(prev => [...prev, ''])
  }, [intencoes.length])

  // ===== Award Raios =====
  const awardRaios = useCallback(async (amount) => {
    if (!userId) return
    try {
      const { data: clientData } = await supabase
        .from('aurora_clients')
        .select('raios_total')
        .eq('user_id', userId)
        .maybeSingle()

      const current = clientData?.raios_total || 0

      await supabase
        .from('aurora_clients')
        .update({
          raios_total: current + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Erro ao atribuir raios:', err)
    }
  }, [userId])

  // ===== Guardar renovação =====
  const handleSave = useCallback(async () => {
    if (!userId) return
    setSaving(true)

    const intencoesLimpas = intencoes
      .map(i => i.trim())
      .filter(Boolean)

    try {
      // Save renovacao
      const { error } = await supabase
        .from('aurora_renovacao')
        .insert({
          user_id: userId,
          ano: anoActual,
          intencoes_novas: intencoesLimpas,
          o_que_mudou: oQueMudou.trim() || null,
          cerimonia_data: new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      // Update aurora_clients.renovacao_data
      await supabase
        .from('aurora_clients')
        .update({
          renovacao_data: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      // Award 40 Raios
      await awardRaios(40)

      // Reset form
      setOQueMudou('')
      setIntencoes([''])
      setShowSuccess(true)
      fetchRenovacoes()

      // Hide success after 5s
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (err) {
      console.error('Erro ao guardar renovacao:', err)
      alert('Não foi possível guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, anoActual, intencoes, oQueMudou, awardRaios, fetchRenovacoes])

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="aurora"
        title={t('aurora.renovacao.title')}
        subtitle={t('aurora.renovacao.subtitle')}
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setView('nova')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'nova' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'nova' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'nova'}
          >
            {t('aurora.renovacao.tab_new')}
          </button>
          <button
            onClick={() => setView('historico')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'historico'}
          >
            {t('aurora.renovacao.tab_history', { count: renovacoes.length })}
          </button>
        </div>

        {/* ======= NOVA RENOVACAO ======= */}
        {view === 'nova' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Success message */}
            {showSuccess && (
              <div
                className="p-4 rounded-xl text-center animate-fadeIn"
                style={{ background: '#4ade8022', border: '1px solid #4ade8044' }}
              >
                <p className="text-sm font-medium text-emerald-300">
                  {t('aurora.renovacao.saved_success')}
                </p>
              </div>
            )}

            {/* Intro */}
            <div className="text-center space-y-3">
              <div className="text-4xl" aria-hidden="true">🔄</div>
              <h2
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                {t('aurora.renovacao.one_year_later')}
              </h2>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                {t('aurora.renovacao.look_back')}
              </p>
            </div>

            {/* Comparison with last year (if exists) */}
            {renovacaoAnterior && (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: `${ACCENT}11`, border: `1px solid ${ACCENT}22` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">📋</span>
                  <h3 className="text-sm font-semibold text-rose-200">
                    As tuas intenções de {renovacaoAnterior.ano}
                  </h3>
                </div>
                {(renovacaoAnterior.intencoes_novas || []).length > 0 ? (
                  <div className="space-y-1.5">
                    {renovacaoAnterior.intencoes_novas.map((int, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: ACCENT }}>
                          {idx + 1}.
                        </span>
                        <p className="text-sm text-gray-300">{int}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sem intenções registadas.</p>
                )}
                {renovacaoAnterior.o_que_mudou && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-gray-500 mb-1">O que escreveste:</p>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      {renovacaoAnterior.o_que_mudou}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* O que mudou */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.renovacao.what_changed')}
              </label>
              <textarea
                value={oQueMudou}
                onChange={(e) => setOQueMudou(e.target.value)}
                placeholder={t('aurora.renovacao.changes_placeholder')}
                rows={5}
                maxLength={3000}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', '--tw-ring-color': ACCENT }}
                aria-label="O que mudou"
              />
            </div>

            {/* Novas intencoes */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.renovacao.new_intentions', { year: anoActual })}
              </label>
              <p className="text-xs text-gray-500">
                {t('aurora.renovacao.intentions_desc')}
              </p>
              <div className="space-y-2">
                {intencoes.map((int, idx) => (
                  <IntencaoItem
                    key={idx}
                    intencao={int}
                    index={idx}
                    onUpdate={handleUpdateIntencao}
                    onRemove={handleRemoveIntencao}
                  />
                ))}
              </div>
              {intencoes.length < 10 && (
                <button
                  onClick={handleAddIntencao}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
                  style={{ color: ACCENT, border: `1px dashed ${ACCENT}44` }}
                >
                  {t('aurora.renovacao.add_intention')}
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              {saving ? t('aurora.antes_depois.saving') : t('aurora.renovacao.start_renewal')}
            </button>
          </div>
        )}

        {/* ======= HISTORICO ======= */}
        {view === 'historico' && (
          <div className="space-y-4 animate-fadeIn">
            {loadingRenovacoes ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
                />
              </div>
            ) : renovacoes.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl" aria-hidden="true">🔄</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {t('aurora.renovacao.no_renewals')}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {t('aurora.renovacao.renewals_desc')}
                </p>
                <button
                  onClick={() => setView('nova')}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  {t('aurora.renovacao.first_renewal')}
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {renovacoes.length}
                    </p>
                    <p className="text-xs text-gray-400">{renovacoes.length === 1 ? 'renovação' : 'renovações'}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {renovacoes.reduce((sum, r) => sum + (r.intencoes_novas || []).length, 0)}
                    </p>
                    <p className="text-xs text-gray-400">{t('aurora.renovacao.total_intentions')}</p>
                  </div>
                </div>

                {/* Renovacao entries */}
                <div className="space-y-3 pb-8">
                  {renovacoes.map((renovacao, idx) => (
                    <RenovacaoCard
                      key={renovacao.id}
                      renovacao={renovacao}
                      isLatest={idx === 0}
                    />
                  ))}
                </div>
              </>
            )}
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
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
