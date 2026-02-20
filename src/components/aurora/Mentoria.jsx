import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'

// ============================================================
// AURORA — Mentoria
// Sistema anonimo de mentoria. Utilizadores graduados partilham
// frases de sabedoria semanalmente.
// Chakra: Integracao Total — Sabedoria partilhada
// ============================================================

const ACCENT = '#D4A5A5'
const ACCENT_DARK = '#2e1a1a'
const ACCENT_SUBTLE = 'rgba(212,165,165,0.12)'

const ECOS_REFERENCIA = [
  { id: 'vitalis', nome: 'Vitalis', icon: '🌿' },
  { id: 'serena', nome: 'Serena', icon: '💧' },
  { id: 'ignis', nome: 'Ignis', icon: '🔥' },
  { id: 'ventis', nome: 'Ventis', icon: '🍃' },
  { id: 'ecoa', nome: 'Ecoa', icon: '🔊' },
  { id: 'aurea', nome: 'Aurea', icon: '✨' },
  { id: 'imago', nome: 'Imago', icon: '⭐' },
  { id: 'aurora', nome: 'Aurora', icon: '🌅' }
]

// ---- Frase Card (Feed) ----
const FraseCard = ({ frase, isOwn, onLike }) => {
  const eco = ECOS_REFERENCIA.find(e => e.id === frase.eco_referencia)

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: isOwn ? `${ACCENT}11` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOwn ? `${ACCENT}33` : 'rgba(255,255,255,0.06)'}`
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
          style={{ background: `${ACCENT}22` }}
          aria-hidden="true"
        >
          {eco?.icon || '🌅'}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-white leading-relaxed italic"
            style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.05rem' }}
          >
            "{frase.frase_sabedoria}"
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {eco && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }}
                >
                  {eco.nome}
                </span>
              )}
              <span className="text-xs text-gray-500">
                Semana {frase.semana}
              </span>
              {isOwn && (
                <span className="text-xs text-gray-500">(tua)</span>
              )}
            </div>
            <button
              onClick={() => onLike(frase.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95"
              style={{ color: ACCENT }}
              aria-label={`${g('Gostar', 'Gostar')} desta frase (${frase.likes || 0} ${(frase.likes || 0) === 1 ? 'like' : 'likes'})`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="text-xs font-medium">{frase.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function Mentoria() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const { t } = useI18n()
  const userId = userRecord?.id || null

  // Form
  const [novaFrase, setNovaFrase] = useState('')
  const [ecoReferencia, setEcoReferencia] = useState('')
  const [saving, setSaving] = useState(false)

  // Feed
  const [frases, setFrases] = useState([])
  const [loadingFrases, setLoadingFrases] = useState(false)

  // Own phrases
  const [minhasFrases, setMinhasFrases] = useState([])

  // Stats
  const [totalPartilhadas, setTotalPartilhadas] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)

  // View
  const [view, setView] = useState('feed') // 'feed' | 'partilhar' | 'minhas'

  // Current week number
  const semanaActual = (() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now - start
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  })()

  // ===== Carregar frases (feed) =====
  const fetchFrases = useCallback(async () => {
    setLoadingFrases(true)
    try {
      const { data, error } = await supabase
        .from('aurora_mentoria')
        .select('id, frase_sabedoria, eco_referencia, semana, likes, mentora_user_id')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setFrases(data || [])

      // Separate own phrases
      if (userId) {
        const own = (data || []).filter(f => f.mentora_user_id === userId)
        setMinhasFrases(own)
        setTotalPartilhadas(own.length)
        setTotalLikes(own.reduce((sum, f) => sum + (f.likes || 0), 0))
      }
    } catch (err) {
      console.error('Mentoria: Erro ao carregar frases:', err)
    } finally {
      setLoadingFrases(false)
    }
  }, [userId])

  useEffect(() => {
    fetchFrases()
  }, [fetchFrases])

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

  // ===== Partilhar frase =====
  const handlePartilhar = useCallback(async () => {
    if (!userId || !novaFrase.trim() || !ecoReferencia) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('aurora_mentoria')
        .insert({
          mentora_user_id: userId,
          frase_sabedoria: novaFrase.trim(),
          eco_referencia: ecoReferencia,
          semana: semanaActual,
          likes: 0
        })

      if (error) throw error

      // Award 8 Raios
      await awardRaios(8)

      // Reset form
      setNovaFrase('')
      setEcoReferencia('')
      setView('feed')
      fetchFrases()
    } catch (err) {
      console.error('Erro ao partilhar frase:', err)
      alert(t('aurora.mentoria.share_error'))
    } finally {
      setSaving(false)
    }
  }, [userId, novaFrase, ecoReferencia, semanaActual, awardRaios, fetchFrases])

  // ===== Like frase =====
  const handleLike = useCallback(async (fraseId) => {
    try {
      // Increment likes
      const frase = frases.find(f => f.id === fraseId)
      if (!frase) return

      const newLikes = (frase.likes || 0) + 1

      const { error } = await supabase
        .from('aurora_mentoria')
        .update({ likes: newLikes })
        .eq('id', fraseId)

      if (error) throw error

      // Update local state
      setFrases(prev => prev.map(f =>
        f.id === fraseId ? { ...f, likes: newLikes } : f
      ))
    } catch (err) {
      console.error('Erro ao dar like:', err)
    }
  }, [frases])

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="aurora"
        title={t('aurora.mentoria.title')}
        subtitle={t('aurora.mentoria.subtitle')}
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setView('feed')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'feed' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'feed' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'feed'}
          >
            Feed
          </button>
          <button
            onClick={() => setView('partilhar')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'partilhar' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'partilhar' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'partilhar'}
          >
            {t('aurora.mentoria.tab_share')}
          </button>
          <button
            onClick={() => setView('minhas')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'minhas' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'minhas' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'minhas'}
          >
            {t('aurora.mentoria.tab_mine', { count: minhasFrases.length })}
          </button>
        </div>

        {/* ======= FEED ======= */}
        {view === 'feed' && (
          <div className="space-y-4 animate-fadeIn">
            {loadingFrases ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
                />
              </div>
            ) : frases.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl" aria-hidden="true">🌅</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {t('aurora.mentoria.no_wisdom_yet')}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {t('aurora.mentoria.be_first')}
                </p>
                <button
                  onClick={() => setView('partilhar')}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  {t('aurora.mentoria.share_wisdom')}
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400">
                  {t('aurora.mentoria.community_wisdom')}
                </p>
                <div className="space-y-3">
                  {frases.map(frase => (
                    <FraseCard
                      key={frase.id}
                      frase={frase}
                      isOwn={frase.mentora_user_id === userId}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======= PARTILHAR ======= */}
        {view === 'partilhar' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-3xl" aria-hidden="true">🌟</div>
              <h2
                className="text-lg font-semibold text-white"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                {t('aurora.mentoria.share_wisdom')}
              </h2>
              <p className="text-sm text-gray-400">
                {t('aurora.mentoria.share_desc')}
              </p>
            </div>

            {/* Frase input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.mentoria.your_phrase')}
              </label>
              <textarea
                value={novaFrase}
                onChange={(e) => setNovaFrase(e.target.value)}
                placeholder={t('aurora.mentoria.phrase_placeholder')}
                rows={4}
                maxLength={500}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', '--tw-ring-color': ACCENT }}
                aria-label="Frase de sabedoria"
              />
              <p className="text-xs text-gray-500 text-right">{novaFrase.length}/500</p>
            </div>

            {/* Eco reference selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 block">
                {t('aurora.mentoria.which_eco')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ECOS_REFERENCIA.map(eco => (
                  <button
                    key={eco.id}
                    onClick={() => setEcoReferencia(eco.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: ecoReferencia === eco.id ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${ecoReferencia === eco.id ? ACCENT : 'transparent'}`
                    }}
                    aria-pressed={ecoReferencia === eco.id}
                  >
                    <span className="text-lg" aria-hidden="true">{eco.icon}</span>
                    <span className={`text-xs ${ecoReferencia === eco.id ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {eco.nome}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {novaFrase.trim() && ecoReferencia && (
              <div
                className="p-4 rounded-xl animate-fadeIn"
                style={{ background: `${ACCENT}11`, border: `1px solid ${ACCENT}22` }}
              >
                <p className="text-xs text-gray-500 mb-2">{t('aurora.mentoria.preview')}</p>
                <p
                  className="text-white leading-relaxed italic"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  "{novaFrase.trim()}"
                </p>
                <p className="text-xs mt-2" style={{ color: ACCENT }}>
                  {ECOS_REFERENCIA.find(e => e.id === ecoReferencia)?.icon}{' '}
                  {ECOS_REFERENCIA.find(e => e.id === ecoReferencia)?.nome} — Semana {semanaActual}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePartilhar}
              disabled={saving || !novaFrase.trim() || !ecoReferencia}
              className="w-full py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              {saving ? t('aurora.mentoria.sharing') : t('aurora.mentoria.share_button')}
            </button>
          </div>
        )}

        {/* ======= MINHAS FRASES ======= */}
        {view === 'minhas' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                  {totalPartilhadas}
                </p>
                <p className="text-xs text-gray-400">{totalPartilhadas === 1 ? 'frase partilhada' : 'frases partilhadas'}</p>
              </div>
              <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                  {totalLikes}
                </p>
                <p className="text-xs text-gray-400">{totalLikes === 1 ? 'like recebido' : 'likes recebidos'}</p>
              </div>
            </div>

            {minhasFrases.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-4xl" aria-hidden="true">🌟</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  {t('aurora.mentoria.no_wisdom_shared')}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {t('aurora.mentoria.experience_helps')}
                </p>
                <button
                  onClick={() => setView('partilhar')}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  {t('aurora.mentoria.share_wisdom')}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pb-8">
                {minhasFrases.map(frase => (
                  <FraseCard
                    key={frase.id}
                    frase={frase}
                    isOwn={true}
                    onLike={handleLike}
                  />
                ))}
              </div>
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
