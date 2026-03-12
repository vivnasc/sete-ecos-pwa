import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import AudioPlayerBar from '../shared/AudioPlayerBar'
import { g } from '../../utils/genero'

// ============================================================
// ECOA — Diario de Voz
// Escrita com prompts de voz (texto por agora)
// Chakra: Vishuddha (Garganta)
// ============================================================

const ACCENT = '#4A90A4'
const ACCENT_DARK = '#1a2a34'
const ACCENT_LIGHT = '#6BAFC5'
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)'

const PROMPTS = [
  'Diz em voz alta o que precisas.',
  'O que a tua garganta quer dizer hoje?',
  'Se pudesses dizer uma coisa sem consequencias, o que seria?',
  'Que silencio carregas hoje?',
  'O que dirias se ninguem te julgasse?',
  'Que som faz a tua verdade?'
]

// Meditações guiadas de journaling (áudio no Supabase Storage)
const JOURNALING_AUDIOS = [
  { slug: 'ecoa-01-silencio-momento', titulo: 'O Silêncio Daquele Momento', desc: 'Quando decidiste calar-te pela primeira vez' },
  { slug: 'ecoa-02-voz-perdida', titulo: 'A Voz Perdida', desc: 'O que dirias se não tivesses medo' },
  { slug: 'ecoa-03-carta-nunca-enviada', titulo: 'Carta Nunca Enviada', desc: 'Escreve o que ficou por dizer' },
  { slug: 'ecoa-04-permissao-falar', titulo: 'Permissão Para Falar', desc: 'Dá-te permissão para ocupar espaço' },
  { slug: 'ecoa-05-voz-futura', titulo: 'A Tua Voz Futura', desc: 'Como soa a voz que estás a construir' },
]

// Get a daily prompt based on the date (deterministic per day)
function getDailyPrompt() {
  const today = new Date()
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % PROMPTS.length
  return PROMPTS[dayIndex]
}

// ---- Individual entry card ----
const DiarioEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
      style={{ background: expanded ? `${ACCENT}11` : 'rgba(255,255,255,0.03)' }}
      aria-expanded={expanded}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
          style={{ background: `${ACCENT}22` }}
          aria-hidden="true"
        >
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(entry.created_at).toLocaleDateString('pt-PT', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          {entry.prompt && (
            <p className="text-xs text-gray-500 italic mt-1 truncate">
              Prompt: &ldquo;{entry.prompt}&rdquo;
            </p>
          )}
          <p className="text-sm text-gray-300 mt-1 truncate">
            {entry.conteudo}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
          {entry.prompt && (
            <div className="p-3 rounded-lg" style={{ background: ACCENT_SUBTLE }}>
              <p className="text-xs text-gray-400 italic">
                &ldquo;{entry.prompt}&rdquo;
              </p>
            </div>
          )}
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {entry.conteudo}
          </p>
        </div>
      )}
    </button>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function DiarioVoz() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [view, setView] = useState('escrever') // 'escrever' | 'historico'
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [conteudo, setConteudo] = useState('')
  const [dailyPrompt] = useState(getDailyPrompt)

  // History state
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  // Load history
  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ecoa_diario_voz')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error('Erro ao carregar diario de voz:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (view === 'historico') fetchEntries()
  }, [view, fetchEntries])

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

  // Save entry
  const handleSave = useCallback(async () => {
    if (!userId || !conteudo.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ecoa_diario_voz')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          tipo: 'texto',
          conteudo: conteudo.trim(),
          prompt: dailyPrompt
        })

      if (error) throw error

      // Award 5 ecos
      await awardEcos(5)

      setShowSuccess(true)
    } catch (err) {
      console.error('Erro ao guardar entrada do diario:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, conteudo, dailyPrompt, awardEcos])

  const resetForm = useCallback(() => {
    setConteudo('')
    setShowSuccess(false)
  }, [])

  // Shuffle prompt (local only, no persistence)
  const [currentPrompt, setCurrentPrompt] = useState(dailyPrompt)
  const shufflePrompt = () => {
    const others = PROMPTS.filter(p => p !== currentPrompt)
    setCurrentPrompt(others[Math.floor(Math.random() * others.length)])
  }

  // ---- RENDER ----
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Diario de Voz"
        subtitle="Escreve o que a tua voz quer dizer"
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6 mt-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => { setView('escrever'); resetForm() }}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'escrever' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'escrever' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'escrever'}
          >
            Escrever
          </button>
          <button
            onClick={() => setView('historico')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'historico'}
          >
            Historico
          </button>
        </div>

        {/* ======= ESCREVER VIEW ======= */}
        {view === 'escrever' && !showSuccess && (
          <div className="space-y-6 animate-fadeIn">
            {/* Daily prompt */}
            <div className="relative">
              <div
                className="p-5 rounded-xl text-center"
                style={{ background: `linear-gradient(135deg, ${ACCENT}18, ${ACCENT_DARK}44)`, border: `1px solid ${ACCENT}22` }}
              >
                <div className="text-2xl mb-3" aria-hidden="true">🎤</div>
                <p
                  className="text-lg text-white italic leading-relaxed"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  &ldquo;{currentPrompt}&rdquo;
                </p>
                <button
                  onClick={shufflePrompt}
                  className="mt-3 text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/10"
                  style={{ color: ACCENT_LIGHT, background: 'rgba(255,255,255,0.05)' }}
                  aria-label="Mudar prompt"
                >
                  Outro prompt
                </button>
              </div>
            </div>

            {/* Prompts section */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                Prompts de Voz
              </h3>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPrompt(p)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${currentPrompt === p ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    style={currentPrompt === p
                      ? { background: `${ACCENT}33`, border: `1px solid ${ACCENT}44` }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid transparent' }
                    }
                    aria-pressed={currentPrompt === p}
                  >
                    {p.substring(0, 30)}{p.length > 30 ? '...' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Guided audio journaling */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                Meditação Guiada — Ouve Antes de Escrever
              </h3>
              <div className="space-y-2">
                {JOURNALING_AUDIOS.map(a => (
                  <div key={a.slug} className="rounded-xl p-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}>
                    <p className="text-sm font-medium text-white mb-0.5">{a.titulo}</p>
                    <p className="text-xs mb-2" style={{ color: '#5a8090' }}>{a.desc}</p>
                    <AudioPlayerBar eco="journaling" slug={a.slug} accentColor={ACCENT} titulo={a.titulo} />
                  </div>
                ))}
              </div>
            </div>

            {/* Writing area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">A tua voz, em palavras</label>
              <div className="relative">
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreve livremente... Ninguem vai julgar. Este espaco e teu."
                  rows={8}
                  maxLength={2000}
                  className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                  aria-label="Conteudo do diario de voz"
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-600">{conteudo.length}/2000</span>
              </div>
            </div>

            {/* Encouragement */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(74,144,164,0.06)' }}>
              <p className="text-xs text-gray-500 italic leading-relaxed text-center">
                Nao ha certo nem errado. Escreve como se ninguem fosse ler. A tua voz merece sair, mesmo que seja em silencio.
              </p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || !conteudo.trim()}
              className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              {saving ? 'A guardar...' : 'Guardar entrada (+5 Ecos 🔊)'}
            </button>
          </div>
        )}

        {/* ======= SUCCESS VIEW ======= */}
        {view === 'escrever' && showSuccess && (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
            >
              🎵
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Voz {g('registado', 'registada')} no diario
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                Cada palavra escrita e um som que sai de dentro. A tua voz esta a crescer. +5 Ecos 🔊
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-medium text-sm bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200"
              >
                Escrever mais
              </button>
              <button
                onClick={() => { setView('historico'); resetForm() }}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Ver historico
              </button>
            </div>
          </div>
        )}

        {/* ======= HISTORICO VIEW ======= */}
        {view === 'historico' && (
          <div className="space-y-4 animate-fadeIn">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
                />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl">🎤</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  O teu diario esta vazio
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Quando escreveres a tua primeira entrada, ela aparecera aqui. A tua voz merece ser guardada.
                </p>
                <button
                  onClick={() => { setView('escrever'); resetForm() }}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Escrever agora
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-gray-400">
                    {entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}
                  </p>
                </div>
                <div className="space-y-2 pb-8">
                  {entries.map((entry) => (
                    <DiarioEntry key={entry.id} entry={entry} />
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
      `}</style>
    </div>
  )
}
