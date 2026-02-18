import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { CATEGORIAS_CARTAS } from '../../lib/ecoa/gamificacao'

// ============================================================
// ECOA — Cartas Nao Enviadas
// Espaco seguro para escrever cartas que nao serao enviadas
// Chakra: Vishuddha (Garganta)
// ============================================================

const ACCENT = '#4A90A4'
const ACCENT_DARK = '#1a2a34'
const ACCENT_LIGHT = '#6BAFC5'
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)'

// ---- Release animation ----
const ReleaseAnimation = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete(), 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none" aria-hidden="true">
      <div className="relative flex flex-col items-center gap-4" style={{ animation: 'letterRelease 2.5s ease-out forwards' }}>
        <div className="text-6xl" style={{ animation: 'floatUp 2.5s ease-out forwards' }}>
          📨
        </div>
        <p
          className="text-white text-lg"
          style={{
            fontFamily: 'var(--font-titulos)',
            animation: 'fadeInText 1s ease-out 0.5s both'
          }}
        >
          Carta libertada ao universo
        </p>
        <div className="flex gap-2" style={{ animation: 'fadeInText 1s ease-out 1s both' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="text-2xl" style={{ animation: `sparkle 1.5s ease-out ${0.8 + i * 0.2}s both` }}>
              ✨
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Category card ----
const CategoryCard = ({ cat, selected, onSelect }) => (
  <button
    onClick={() => onSelect(cat.id)}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${selected ? 'ring-2 scale-105 shadow-lg' : 'hover:bg-white/5 active:scale-95'}`}
    style={{
      background: selected ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
      ringColor: selected ? ACCENT : undefined,
      boxShadow: selected ? `0 0 16px ${ACCENT}22` : undefined
    }}
    aria-pressed={selected}
    aria-label={cat.nome}
  >
    <span className="text-2xl" role="img" aria-hidden="true">{cat.icon}</span>
    <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>
      {cat.nome}
    </span>
    <span className="text-xs text-gray-500 text-center leading-tight">
      {cat.descricao}
    </span>
  </button>
)

// ---- Letter card in library ----
const CartaEntry = ({ carta, onLibertar }) => {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORIAS_CARTAS.find(c => c.id === carta.categoria)

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{ background: expanded ? `${ACCENT}11` : 'rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-all duration-200"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
            style={{ background: `${ACCENT}22` }}
            aria-hidden="true"
          >
            {cat?.icon || '📝'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                Para: {carta.destinatario}
              </span>
              {carta.libertada && (
                <span className="text-xs" title="Carta libertada" aria-label="Carta libertada">🕊️</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: ACCENT_SUBTLE, color: ACCENT_LIGHT }}>
                {cat?.nome || carta.categoria}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(carta.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {carta.conteudo}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fadeIn">
          <div className="pt-2 border-t border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {carta.conteudo}
            </p>
          </div>

          {!carta.libertada && (
            <button
              onClick={(e) => { e.stopPropagation(); onLibertar(carta) }}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/10"
              style={{ background: `${ACCENT}18`, color: ACCENT_LIGHT, border: `1px solid ${ACCENT}33` }}
            >
              Enviar ao universo 🕊️
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function CartasNaoEnviadas() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [view, setView] = useState('escrever') // 'escrever' | 'minhas'
  const [step, setStep] = useState('categoria') // 'categoria' | 'escrever' | 'sucesso'
  const [saving, setSaving] = useState(false)

  // Form state
  const [categoria, setCategoria] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [conteudo, setConteudo] = useState('')

  // Library state
  const [cartas, setCartas] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterCategoria, setFilterCategoria] = useState('')

  // Release state
  const [showRelease, setShowRelease] = useState(false)
  const [confirmLibertar, setConfirmLibertar] = useState(null) // carta to confirm
  const [releaseSuccess, setReleaseSuccess] = useState(false)

  // Load cartas
  const fetchCartas = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ecoa_cartas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCartas(data || [])
    } catch (err) {
      console.error('Erro ao carregar cartas:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (view === 'minhas') fetchCartas()
  }, [view, fetchCartas])

  // Award ecos
  const awardEcos = useCallback(async (amount) => {
    if (!userId) return
    try {
      const { data: clientData } = await supabase
        .from('ecoa_clients')
        .select('ecos_total')
        .eq('user_id', userId)
        .maybeSingle()

      const current = clientData?.ecos_total || 0

      await supabase
        .from('ecoa_clients')
        .update({
          ecos_total: current + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Erro ao atribuir ecos:', err)
    }
  }, [userId])

  // Save carta
  const handleSave = useCallback(async () => {
    if (!userId || !conteudo.trim() || !destinatario.trim() || !categoria) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ecoa_cartas')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          destinatario: destinatario.trim(),
          categoria,
          conteudo: conteudo.trim(),
          libertada: false
        })

      if (error) throw error

      // Award 7 ecos
      await awardEcos(7)

      setStep('sucesso')
    } catch (err) {
      console.error('Erro ao guardar carta:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, conteudo, destinatario, categoria, awardEcos])

  // Libertar carta
  const handleLibertar = useCallback(async (carta) => {
    if (!userId || !carta) return

    try {
      const { error } = await supabase
        .from('ecoa_cartas')
        .update({ libertada: true })
        .eq('id', carta.id)
        .eq('user_id', userId)

      if (error) throw error

      // Award 12 ecos extra
      await awardEcos(12)

      setConfirmLibertar(null)
      setShowRelease(true)
    } catch (err) {
      console.error('Erro ao libertar carta:', err)
      alert('Nao foi possivel libertar a carta. Tenta novamente.')
    }
  }, [userId, awardEcos])

  const handleReleaseComplete = useCallback(() => {
    setShowRelease(false)
    setReleaseSuccess(true)
    fetchCartas()
    setTimeout(() => setReleaseSuccess(false), 3000)
  }, [fetchCartas])

  const resetForm = useCallback(() => {
    setCategoria('')
    setDestinatario('')
    setConteudo('')
    setStep('categoria')
  }, [])

  // Select category
  const handleSelectCategory = useCallback((catId) => {
    setCategoria(catId)
    setStep('escrever')
  }, [])

  const selectedCat = CATEGORIAS_CARTAS.find(c => c.id === categoria)

  // Filter cartas
  const filteredCartas = filterCategoria
    ? cartas.filter(c => c.categoria === filterCategoria)
    : cartas

  const totalLibertadas = cartas.filter(c => c.libertada).length

  // ---- RENDER ----
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Cartas Nao Enviadas"
        subtitle="Escreve o que nunca disseste"
      />

      <ReleaseAnimation show={showRelease} onComplete={handleReleaseComplete} />

      {/* Confirm libertar modal */}
      {confirmLibertar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="max-w-sm w-full rounded-2xl p-6 space-y-4" style={{ background: '#1a1d24', border: `1px solid ${ACCENT}33` }}>
            <div className="text-center">
              <div className="text-3xl mb-3">🕊️</div>
              <h3
                className="text-lg font-semibold text-white mb-2"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Libertar esta carta?
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ao libertar, soltas esta carta. Ela nao desaparece — fica na tua biblioteca. Mas o peso solta.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLibertar(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleLibertar(confirmLibertar)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Libertar (+12 Ecos 🔊)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6 mt-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => { setView('escrever'); resetForm() }}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'escrever' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'escrever' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'escrever'}
          >
            Escrever Carta
          </button>
          <button
            onClick={() => setView('minhas')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'minhas' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'minhas' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'minhas'}
          >
            As Minhas Cartas
          </button>
        </div>

        {/* ======= ESCREVER VIEW - STEP CATEGORIA ======= */}
        {view === 'escrever' && step === 'categoria' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
              <h2
                className="text-lg font-semibold text-white"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Que tipo de carta queres escrever?
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Escolhe a categoria que ressoa contigo hoje
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIAS_CARTAS.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  selected={false}
                  onSelect={handleSelectCategory}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======= ESCREVER VIEW - STEP ESCREVER ======= */}
        {view === 'escrever' && step === 'escrever' && selectedCat && (
          <div className="space-y-6 animate-fadeIn">
            {/* Selected category header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('categoria')}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-all duration-200"
                aria-label="Voltar a categorias"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{selectedCat.icon}</span>
                <span className="text-sm font-medium text-white">{selectedCat.nome}</span>
              </div>
            </div>

            {/* Category prompt as inspiration */}
            <div className="p-4 rounded-xl" style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT}22` }}>
              <p
                className="text-sm italic text-gray-300 leading-relaxed"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                {selectedCat.prompt}
              </p>
            </div>

            {/* Para quem? */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Para quem?</label>
              <input
                type="text"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder={`Para quem escreves esta carta de ${selectedCat.nome.toLowerCase()}?`}
                maxLength={100}
                className="w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                aria-label="Destinatario da carta"
              />
            </div>

            {/* Letter content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">A tua carta</label>
              <div className="relative">
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreve sem filtro. Ninguem vai ler isto. Este espaco e so teu..."
                  rows={10}
                  maxLength={5000}
                  className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                  aria-label="Conteudo da carta"
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-600">{conteudo.length}/5000</span>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || !conteudo.trim() || !destinatario.trim()}
              className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              {saving ? 'A guardar...' : 'Guardar carta (+7 Ecos 🔊)'}
            </button>
          </div>
        )}

        {/* ======= ESCREVER VIEW - SUCCESS ======= */}
        {view === 'escrever' && step === 'sucesso' && (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
            >
              {selectedCat?.icon || '📝'}
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Carta guardada
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                A tua carta esta segura. Quando {g('estiveres pronto', 'estiveres pronta')}, podes liberta-la ao universo. +7 Ecos 🔊
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-medium text-sm bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200"
              >
                Escrever outra
              </button>
              <button
                onClick={() => { setView('minhas'); resetForm() }}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Ver cartas
              </button>
            </div>
          </div>
        )}

        {/* ======= MINHAS CARTAS VIEW ======= */}
        {view === 'minhas' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Release success toast */}
            {releaseSuccess && (
              <div
                className="p-3 rounded-xl text-center animate-fadeIn"
                style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}
              >
                <p className="text-sm text-white">
                  🕊️ Carta libertada! +12 Ecos 🔊
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
                />
              </div>
            ) : cartas.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl">📝</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  Nenhuma carta ainda
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  As cartas que nao envias tambem contam. As vezes, so escrever ja liberta.
                </p>
                <button
                  onClick={() => { setView('escrever'); resetForm() }}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Escrever primeira carta
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {cartas.length}
                    </p>
                    <p className="text-xs text-gray-400">{cartas.length === 1 ? 'carta' : 'cartas'}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                      {totalLibertadas}
                    </p>
                    <p className="text-xs text-gray-400">{totalLibertadas === 1 ? 'libertada' : 'libertadas'} 🕊️</p>
                  </div>
                </div>

                {/* Filter by category */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterCategoria('')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${!filterCategoria ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    style={!filterCategoria
                      ? { background: `${ACCENT}33`, border: `1px solid ${ACCENT}44` }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid transparent' }
                    }
                    aria-pressed={!filterCategoria}
                  >
                    Todas
                  </button>
                  {CATEGORIAS_CARTAS.map((cat) => {
                    const count = cartas.filter(c => c.categoria === cat.id).length
                    if (count === 0) return null
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategoria(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${filterCategoria === cat.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        style={filterCategoria === cat.id
                          ? { background: `${ACCENT}33`, border: `1px solid ${ACCENT}44` }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid transparent' }
                        }
                        aria-pressed={filterCategoria === cat.id}
                      >
                        {cat.icon} {cat.nome} ({count})
                      </button>
                    )
                  })}
                </div>

                {/* Letters list */}
                <div className="space-y-2 pb-8">
                  {filteredCartas.map((carta) => (
                    <CartaEntry
                      key={carta.id}
                      carta={carta}
                      onLibertar={(c) => setConfirmLibertar(c)}
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
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          60% { transform: translateY(-80px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        @keyframes fadeInText {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.6; }
        }
        @keyframes letterRelease {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
