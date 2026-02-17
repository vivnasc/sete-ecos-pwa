import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'

// ============================================================
// IMAGO — Visão do Futuro
// Quadro de visão digital pessoal com símbolos, palavras e frases
// Chakra: Sahasrara (Coroa) — Visão e identidade futura
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#1a1a2e'
const ACCENT_SUBTLE = 'rgba(139,123,165,0.12)'

const ITEM_TYPES = [
  { tipo: 'palavra', label: 'Palavra', icon: '🔤', placeholder: 'Uma palavra que te define ou inspira' },
  { tipo: 'simbolo', label: 'Símbolo', icon: '✨', placeholder: 'Um emoji ou símbolo que te representa' },
  { tipo: 'imagem', label: 'Imagem', icon: '🖼️', placeholder: 'URL de uma imagem inspiradora' },
  { tipo: 'frase', label: 'Frase', icon: '💬', placeholder: 'Uma frase que ressoa contigo' }
]

const DEFAULT_COLORS = [
  '#8B7BA5', '#C4A265', '#6B8E9B', '#C1634A', '#5D9B84',
  '#4A90A4', '#D4A0A0', '#7C8B6F', '#B8860B', '#708090'
]

// ---- Item Card ----
const BoardItem = ({ item, index, totalItems, onEdit, onDelete, onMoveUp, onMoveDown, reviewMode, onToggleRessoa }) => {
  const typeInfo = ITEM_TYPES.find(t => t.tipo === item.tipo) || ITEM_TYPES[0]

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200 group relative"
      style={{
        background: `${item.cor || ACCENT}15`,
        border: `1px solid ${item.cor || ACCENT}30`,
        ...(reviewMode && !item.ressoa ? { opacity: 0.5 } : {})
      }}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${item.cor || ACCENT}22`, color: item.cor || ACCENT }}>
          {typeInfo.icon} {typeInfo.label}
        </span>
        {!reviewMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {index > 0 && (
              <button
                onClick={() => onMoveUp(index)}
                className="p-1 rounded hover:bg-white/10 text-gray-500 transition-colors"
                aria-label="Mover para cima"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            )}
            {index < totalItems - 1 && (
              <button
                onClick={() => onMoveDown(index)}
                className="p-1 rounded hover:bg-white/10 text-gray-500 transition-colors"
                aria-label="Mover para baixo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onEdit(index)}
              className="p-1 rounded hover:bg-white/10 text-gray-500 transition-colors"
              aria-label="Editar item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
              aria-label="Eliminar item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[2rem]">
        {item.tipo === 'imagem' ? (
          <div className="rounded-lg overflow-hidden">
            <img
              src={item.conteudo}
              alt="Item do quadro de visão"
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = ''
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<p class="text-sm text-gray-500 italic p-2">Imagem não disponível</p>'
              }}
            />
          </div>
        ) : item.tipo === 'simbolo' ? (
          <p className="text-3xl text-center py-2">{item.conteudo}</p>
        ) : item.tipo === 'frase' ? (
          <p
            className="text-sm italic leading-relaxed text-gray-300"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            "{item.conteudo}"
          </p>
        ) : (
          <p
            className="text-lg font-semibold text-center text-white"
            style={{ color: item.cor || ACCENT }}
          >
            {item.conteudo}
          </p>
        )}
      </div>

      {/* Review mode toggle */}
      {reviewMode && (
        <div className="mt-3 pt-2 border-t border-white/5">
          <button
            onClick={() => onToggleRessoa(index)}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all duration-200 ${item.ressoa ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            style={item.ressoa
              ? { background: `${ACCENT}33`, border: `1px solid ${ACCENT}44` }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {item.ressoa ? 'Ainda ressoa' : 'Já evoluiu'}
          </button>
        </div>
      )}
    </div>
  )
}

// ---- Add/Edit Modal ----
const ItemModal = ({ item, onSave, onClose, editing }) => {
  const [tipo, setTipo] = useState(item?.tipo || 'palavra')
  const [conteudo, setConteudo] = useState(item?.conteudo || '')
  const [cor, setCor] = useState(item?.cor || ACCENT)

  const typeInfo = ITEM_TYPES.find(t => t.tipo === tipo)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div
        className="max-w-md w-full rounded-2xl p-6 space-y-5"
        style={{ background: '#1a1d24', border: `1px solid ${ACCENT}33` }}
      >
        <div className="text-center">
          <h3
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {editing ? 'Editar item' : 'Adicionar ao quadro'}
          </h3>
        </div>

        {/* Type selection */}
        {!editing && (
          <div className="grid grid-cols-4 gap-2">
            {ITEM_TYPES.map(t => (
              <button
                key={t.tipo}
                onClick={() => setTipo(t.tipo)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all duration-200 ${tipo === t.tipo ? 'text-white ring-2' : 'text-gray-500 hover:text-gray-300'}`}
                style={{
                  background: tipo === t.tipo ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
                  ringColor: tipo === t.tipo ? ACCENT : undefined
                }}
                aria-pressed={tipo === t.tipo}
              >
                <span className="text-lg" aria-hidden="true">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Conteúdo:</label>
          {tipo === 'frase' ? (
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder={typeInfo?.placeholder}
              rows={3}
              maxLength={500}
              className="w-full p-3 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              aria-label="Conteúdo do item"
            />
          ) : (
            <input
              type="text"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder={typeInfo?.placeholder}
              maxLength={tipo === 'imagem' ? 1000 : 100}
              className="w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              aria-label="Conteúdo do item"
            />
          )}
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Cor <span className="text-gray-500">(opcional)</span>:</label>
          <div className="flex gap-2 flex-wrap">
            {DEFAULT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setCor(c)}
                className={`w-8 h-8 rounded-full transition-all duration-200 ${cor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
                aria-label={`Cor ${c}`}
                aria-pressed={cor === c}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!conteudo.trim()) return
              onSave({ tipo, conteudo: conteudo.trim(), cor, ressoa: true })
            }}
            disabled={!conteudo.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
          >
            {editing ? 'Guardar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function VisaoFuturo() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  // Board state
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)

  // Review mode
  const [reviewMode, setReviewMode] = useState(false)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(null)

  // ===== Carregar board =====
  const fetchBoard = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('imago_visao_board')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setItems(data.items || [])
        setLastSaved(data.updated_at)
      }
    } catch (err) {
      console.error('VisaoFuturo: Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  // ===== Award estrelas =====
  const awardEstrelas = useCallback(async (amount) => {
    if (!userId) return
    try {
      const { data: clientData } = await supabase
        .from('imago_clients')
        .select('estrelas_total')
        .eq('user_id', userId)
        .maybeSingle()

      const current = clientData?.estrelas_total || 0

      await supabase
        .from('imago_clients')
        .update({
          estrelas_total: current + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Erro ao atribuir estrelas:', err)
    }
  }, [userId])

  // ===== Guardar board (upsert) =====
  const handleSave = useCallback(async () => {
    if (!userId) return
    setSaving(true)

    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('imago_visao_board')
        .upsert({
          user_id: userId,
          items: items,
          revisao_trimestral: reviewMode ? now : null,
          updated_at: now
        }, { onConflict: 'user_id' })

      if (error) throw error

      // Award 10 estrelas
      await awardEstrelas(10)

      setLastSaved(now)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Erro ao guardar board:', err)
      alert('Não foi possível guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, items, reviewMode, awardEstrelas])

  // ===== Item operations =====
  const handleAddItem = useCallback((newItem) => {
    setItems(prev => [...prev, newItem])
    setShowModal(false)
  }, [])

  const handleEditItem = useCallback((updatedItem) => {
    if (editingIndex === null) return
    setItems(prev => {
      const updated = [...prev]
      updated[editingIndex] = { ...updated[editingIndex], ...updatedItem }
      return updated
    })
    setEditingIndex(null)
    setShowModal(false)
  }, [editingIndex])

  const handleDeleteItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }, [])

  const handleMoveUp = useCallback((index) => {
    if (index <= 0) return
    setItems(prev => {
      const updated = [...prev]
      const temp = updated[index - 1]
      updated[index - 1] = updated[index]
      updated[index] = temp
      return updated
    })
  }, [])

  const handleMoveDown = useCallback((index) => {
    setItems(prev => {
      if (index >= prev.length - 1) return prev
      const updated = [...prev]
      const temp = updated[index + 1]
      updated[index + 1] = updated[index]
      updated[index] = temp
      return updated
    })
  }, [])

  const handleToggleRessoa = useCallback((index) => {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ressoa: !updated[index].ressoa }
      return updated
    })
  }, [])

  const openEdit = useCallback((index) => {
    setEditingIndex(index)
    setShowModal(true)
  }, [])

  const openAdd = useCallback(() => {
    setEditingIndex(null)
    setShowModal(true)
  }, [])

  // ===== Stats =====
  const totalRessoa = items.filter(i => i.ressoa !== false).length
  const totalEvoluiu = items.filter(i => i.ressoa === false).length

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="imago"
        title="Visão do Futuro"
        subtitle="O teu quadro de visão pessoal"
        rightAction={
          items.length > 0 && (
            <button
              onClick={() => setReviewMode(!reviewMode)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: reviewMode ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                color: '#fff'
              }}
            >
              {reviewMode ? 'Sair revisão' : 'Revisão trimestral'}
            </button>
          )
        }
      />

      {/* Delete confirmation modal */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div
            className="max-w-sm w-full rounded-2xl p-6 space-y-4"
            style={{ background: '#1a1d24', border: `1px solid ${ACCENT}33` }}
          >
            <div className="text-center">
              <div className="text-3xl mb-3">🗑️</div>
              <h3
                className="text-lg font-semibold text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Eliminar este item?
              </h3>
              <p className="text-sm text-gray-400">
                Esta acção não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteItem(confirmDelete)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 transition-all duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ItemModal
          item={editingIndex !== null ? items[editingIndex] : null}
          editing={editingIndex !== null}
          onSave={editingIndex !== null ? handleEditItem : handleAddItem}
          onClose={() => { setShowModal(false); setEditingIndex(null) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Success toast */}
        {saveSuccess && (
          <div
            className="mb-4 p-3 rounded-xl text-center animate-fadeIn"
            style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}
          >
            <p className="text-sm text-white">
              Quadro guardado! +10 Estrelas
            </p>
          </div>
        )}

        {/* Review mode banner */}
        {reviewMode && (
          <div
            className="mb-4 p-4 rounded-xl animate-fadeIn"
            style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT}22` }}
          >
            <p
              className="text-sm italic text-gray-300 text-center leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              "Isto ainda ressoa contigo?" — Marca cada item como "ainda ressoa" ou "já evoluiu".
            </p>
            {items.length > 0 && (
              <div className="flex justify-center gap-4 mt-3">
                <span className="text-xs" style={{ color: ACCENT }}>{totalRessoa} ressoam</span>
                <span className="text-xs text-gray-500">{totalEvoluiu} {totalEvoluiu === 1 ? 'evoluiu' : 'evoluiram'}</span>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
            />
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl">🔮</div>
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              O teu quadro de visão está vazio
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Adiciona palavras, símbolos, imagens e frases que representam quem queres ser.
            </p>
            <button
              onClick={openAdd}
              className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              Adicionar primeiro item
            </button>
          </div>
        ) : (
          <>
            {/* Board grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {items.map((item, index) => (
                <BoardItem
                  key={`${item.tipo}-${index}`}
                  item={item}
                  index={index}
                  totalItems={items.length}
                  onEdit={openEdit}
                  onDelete={(i) => setConfirmDelete(i)}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  reviewMode={reviewMode}
                  onToggleRessoa={handleToggleRessoa}
                />
              ))}

              {/* Add button card */}
              {!reviewMode && (
                <button
                  onClick={openAdd}
                  className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[8rem] transition-all duration-200 hover:bg-white/5 active:scale-95"
                  style={{ border: `2px dashed ${ACCENT}33` }}
                  aria-label="Adicionar item ao quadro"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" className="w-8 h-8" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span className="text-xs" style={{ color: ACCENT }}>Adicionar</span>
                </button>
              )}
            </div>

            {/* Save button */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                {saving ? 'A guardar...' : `Guardar quadro (+10 Estrelas)`}
              </button>

              {lastSaved && (
                <p className="text-xs text-gray-500 text-center">
                  {g('Último', 'Última')} gravação: {new Date(lastSaved).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Stats summary */}
            <div className="mt-6 flex gap-3">
              <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {items.length}
                </p>
                <p className="text-xs text-gray-400">{items.length === 1 ? 'item' : 'itens'}</p>
              </div>
              <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {new Set(items.map(i => i.tipo)).size}
                </p>
                <p className="text-xs text-gray-400">tipos</p>
              </div>
              <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {totalRessoa}
                </p>
                <p className="text-xs text-gray-400">ressoam</p>
              </div>
            </div>
          </>
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
