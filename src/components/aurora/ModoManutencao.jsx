import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { PADROES_ALERTA } from '../../lib/aurora/gamificacao'

// ============================================================
// AURORA — Modo Manutencao
// Check-ins mensais em vez de diarios.
// Alerta quando padroes negativos reaparecem.
// Chakra: Integracao Total — Cuidado continuo
// ============================================================

const ACCENT = '#D4A5A5'
const ACCENT_DARK = '#2e1a1a'
const ACCENT_SUBTLE = 'rgba(212,165,165,0.12)'

const ESTADOS_GERAIS = [
  { value: 'excelente', label: 'Excelente', icon: '🌟', cor: '#4ade80' },
  { value: 'bom', label: 'Bom', icon: '😊', cor: '#60a5fa' },
  { value: 'razoavel', label: 'Razoavel', icon: '😐', cor: '#fbbf24' },
  { value: 'dificil', label: 'Dificil', icon: '😔', cor: '#f87171' }
]

const ECO_ROUTES = {
  serena: '/serena/dashboard',
  ventis: '/ventis/dashboard',
  ecoa: '/ecoa/dashboard',
  ignis: '/ignis/dashboard',
  aurea: '/aurea/dashboard',
  imago: '/imago/dashboard'
}

// ---- Estado Card ----
const EstadoCard = ({ estado, selected, onSelect }) => (
  <button
    onClick={() => onSelect(estado.value)}
    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    style={{
      background: selected ? `${estado.cor}22` : 'rgba(255,255,255,0.04)',
      border: `2px solid ${selected ? estado.cor : 'transparent'}`,
      minWidth: '4.5rem'
    }}
    aria-pressed={selected}
    aria-label={estado.label}
  >
    <span className="text-2xl" aria-hidden="true">{estado.icon}</span>
    <span className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>
      {estado.label}
    </span>
  </button>
)

// ---- Padrao Alerta Card ----
const PadraoAlertaCard = ({ padrao, checked, onToggle }) => (
  <label
    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5"
    style={{
      background: checked ? `${ACCENT}11` : 'transparent',
      border: `1px solid ${checked ? `${ACCENT}44` : 'rgba(255,255,255,0.06)'}`
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onToggle(padrao.id)}
      className="mt-1 w-4 h-4 rounded accent-rose-300 flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white font-medium">{padrao.sinal}</p>
      <p className="text-xs text-gray-500 mt-0.5">Eco: {padrao.eco}</p>
    </div>
  </label>
)

// ---- Historico Entry ----
const HistoricoEntry = ({ entry, onExpand, expanded }) => {
  const estado = ESTADOS_GERAIS.find(e => e.value === entry.estado_geral)
  const padroesDetectados = entry.padroes_regressao || []

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{ background: expanded ? `${ACCENT}11` : 'rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => onExpand(entry.id)}
        className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all duration-200"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: estado ? `${estado.cor}22` : `${ACCENT}22` }}
            aria-hidden="true"
          >
            {estado?.icon || '📋'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">
              {entry.mes_referencia}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">
                {new Date(entry.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {padroesDetectados.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f8717122', color: '#f87171' }}>
                  {padroesDetectados.length} {padroesDetectados.length === 1 ? 'alerta' : 'alertas'}
                </span>
              )}
            </div>
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
          <div className="pt-2 border-t border-white/5 space-y-3">
            {padroesDetectados.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Padroes detectados:</p>
                <div className="space-y-1">
                  {padroesDetectados.map((pid, idx) => {
                    const p = PADROES_ALERTA.find(pa => pa.id === pid)
                    return p ? (
                      <p key={idx} className="text-xs text-rose-300">• {p.sinal}</p>
                    ) : null
                  })}
                </div>
              </div>
            )}
            {entry.conquistas_mes && entry.conquistas_mes.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Conquistas:</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {entry.conquistas_mes.join(', ')}
                </p>
              </div>
            )}
            {entry.reflexao && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Reflexao:</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                  {entry.reflexao}
                </p>
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
export default function ModoManutencao() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const { t } = useI18n()
  const userId = userRecord?.id || null

  // Form state
  const [estadoGeral, setEstadoGeral] = useState('')
  const [padroesSeleccionados, setPadroesSeleccionados] = useState([])
  const [conquistasMes, setConquistasMes] = useState('')
  const [reflexao, setReflexao] = useState('')
  const [saving, setSaving] = useState(false)

  // History
  const [historico, setHistorico] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  // View
  const [view, setView] = useState('checkin') // 'checkin' | 'historico'

  // Success
  const [showSuccess, setShowSuccess] = useState(false)

  // Current month reference
  const mesReferencia = new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })

  // ===== Carregar historico =====
  const fetchHistorico = useCallback(async () => {
    if (!userId) return
    setLoadingHistorico(true)
    try {
      const { data, error } = await supabase
        .from('aurora_manutencao_log')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (error) throw error
      setHistorico(data || [])
    } catch (err) {
      console.error('ModoManutencao: Erro ao carregar historico:', err)
    } finally {
      setLoadingHistorico(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHistorico()
  }, [fetchHistorico])

  // ===== Toggle padrao =====
  const handleTogglePadrao = useCallback((padraoId) => {
    setPadroesSeleccionados(prev =>
      prev.includes(padraoId)
        ? prev.filter(id => id !== padraoId)
        : [...prev, padraoId]
    )
  }, [])

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

  // ===== Guardar check-in =====
  const handleSave = useCallback(async () => {
    if (!userId || !estadoGeral) return
    setSaving(true)

    const conquistasArray = conquistasMes.trim()
      ? conquistasMes.split('\n').map(c => c.trim()).filter(Boolean)
      : []

    try {
      const { error } = await supabase
        .from('aurora_manutencao_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          mes_referencia: mesReferencia,
          estado_geral: estadoGeral,
          padroes_regressao: padroesSeleccionados,
          conquistas_mes: conquistasArray,
          reflexao: reflexao.trim() || null
        })

      if (error) throw error

      // Award 10 Raios
      await awardRaios(10)

      // Reset form
      setEstadoGeral('')
      setPadroesSeleccionados([])
      setConquistasMes('')
      setReflexao('')
      setShowSuccess(true)
      fetchHistorico()

      // Hide success after 4s
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (err) {
      console.error('Erro ao guardar check-in:', err)
      alert(t('aurora.manutencao.save_error'))
    } finally {
      setSaving(false)
    }
  }, [userId, estadoGeral, padroesSeleccionados, conquistasMes, reflexao, mesReferencia, awardRaios, fetchHistorico])

  // ===== Expand historico entry =====
  const handleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="aurora"
        title={t('aurora.manutencao.title')}
        subtitle={t('aurora.manutencao.subtitle')}
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setView('checkin')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'checkin' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'checkin' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'checkin'}
          >
            {t('aurora.manutencao.tab_checkin')}
          </button>
          <button
            onClick={() => setView('historico')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'historico'}
          >
            {t('aurora.manutencao.tab_history', { count: historico.length })}
          </button>
        </div>

        {/* ======= CHECK-IN ======= */}
        {view === 'checkin' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Success message */}
            {showSuccess && (
              <div
                className="p-4 rounded-xl text-center animate-fadeIn"
                style={{ background: '#4ade8022', border: '1px solid #4ade8044' }}
              >
                <p className="text-sm font-medium text-emerald-300">
                  {t('aurora.manutencao.saved_success')}
                </p>
              </div>
            )}

            {/* Intro */}
            <div className="text-center space-y-2">
              <div className="text-3xl" aria-hidden="true">🌅</div>
              <h2
                className="text-lg font-semibold text-white"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                {t('aurora.manutencao.how_was_month')}
              </h2>
              <p className="text-sm text-gray-400">
                {mesReferencia} — {t('aurora.manutencao.do_checkin')}
              </p>
            </div>

            {/* Estado geral */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.manutencao.general_state')}
              </label>
              <div className="flex gap-3 justify-center">
                {ESTADOS_GERAIS.map(estado => (
                  <EstadoCard
                    key={estado.value}
                    estado={estado}
                    selected={estadoGeral === estado.value}
                    onSelect={setEstadoGeral}
                  />
                ))}
              </div>
            </div>

            {/* Padroes de regressao */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.manutencao.patterns_label')}
              </label>
              <p className="text-xs text-gray-500">
                {t('aurora.manutencao.patterns_desc')}
              </p>
              <div className="space-y-2">
                {PADROES_ALERTA.map(padrao => (
                  <PadraoAlertaCard
                    key={padrao.id}
                    padrao={padrao}
                    checked={padroesSeleccionados.includes(padrao.id)}
                    onToggle={handleTogglePadrao}
                  />
                ))}
              </div>
            </div>

            {/* Accoes recomendadas (if patterns selected) */}
            {padroesSeleccionados.length > 0 && (
              <div
                className="p-4 rounded-xl space-y-3 animate-fadeIn"
                style={{ background: `${ACCENT}11`, border: `1px solid ${ACCENT}33` }}
              >
                <h3 className="text-sm font-semibold text-rose-200">
                  {t('aurora.manutencao.recommended_actions')}
                </h3>
                <div className="space-y-2">
                  {padroesSeleccionados.map(pid => {
                    const padrao = PADROES_ALERTA.find(p => p.id === pid)
                    if (!padrao) return null
                    return (
                      <button
                        key={pid}
                        onClick={() => navigate(ECO_ROUTES[padrao.eco] || '/aurora/dashboard')}
                        className="w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:bg-white/5"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{padrao.accao}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Eco: {padrao.eco}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Conquistas do mes */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.manutencao.achievements_label')}
              </label>
              <textarea
                value={conquistasMes}
                onChange={(e) => setConquistasMes(e.target.value)}
                placeholder={t('aurora.manutencao.achievements_placeholder')}
                rows={3}
                maxLength={1000}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', '--tw-ring-color': ACCENT }}
                aria-label="Conquistas do mes"
              />
            </div>

            {/* Reflexao */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.manutencao.reflection_label')}
              </label>
              <textarea
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder={t('aurora.manutencao.reflection_placeholder')}
                rows={4}
                maxLength={2000}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', '--tw-ring-color': ACCENT }}
                aria-label="Reflexao mensal"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSave}
              disabled={saving || !estadoGeral}
              className="w-full py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              {saving ? t('aurora.antes_depois.saving') : t('aurora.manutencao.save_checkin')}
            </button>
          </div>
        )}

        {/* ======= HISTORICO ======= */}
        {view === 'historico' && (
          <div className="space-y-4 animate-fadeIn">
            {loadingHistorico ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
                />
              </div>
            ) : historico.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl" aria-hidden="true">🌅</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {t('aurora.manutencao.no_checkins')}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {t('aurora.manutencao.checkins_help')}
                </p>
                <button
                  onClick={() => setView('checkin')}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  {t('aurora.manutencao.first_checkin')}
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {historico.length}
                    </p>
                    <p className="text-xs text-gray-400">{historico.length === 1 ? 'check-in' : 'check-ins'}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {historico.filter(h => (h.padroes_regressao || []).length === 0).length}
                    </p>
                    <p className="text-xs text-gray-400">{t('aurora.manutencao.clean_months')}</p>
                  </div>
                </div>

                {/* Entries */}
                <div className="space-y-2 pb-8">
                  {historico.map(entry => (
                    <HistoricoEntry
                      key={entry.id}
                      entry={entry}
                      expanded={expandedId === entry.id}
                      onExpand={handleExpand}
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
