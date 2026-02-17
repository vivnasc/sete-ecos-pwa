import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ============================================================
// ECOA — Registo de Voz Recuperada
// "Hoje disse algo que normalmente calaria."
// Chakra: Vishuddha (Garganta)
// ============================================================

const ACCENT = '#4A90A4'
const ACCENT_DARK = '#1a2a34'
const ACCENT_LIGHT = '#6BAFC5'
const ACCENT_SUBTLE = 'rgba(74,144,164,0.12)'

const SOBRE_OPTIONS = [
  'Desacordo',
  'Desejo',
  'Limite',
  'Dor',
  'Opiniao',
  'Necessidade',
  'Outro'
]

const COMO_CORREU_OPTIONS = [
  { value: 'melhor', label: 'Melhor do que esperava' },
  { value: 'como_esperava', label: 'Como esperava' },
  { value: 'dificil_valeu', label: 'Dificil mas valeu' },
  { value: 'mal_mas_disse', label: 'Correu mal mas disse' }
]

// ---- Sound wave pulse celebration ----
const SoundWavePulse = ({ show }) => {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <div className="relative">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${80 + i * 60}px`,
              height: `${80 + i * 60}px`,
              top: `${-(40 + i * 30)}px`,
              left: `${-(40 + i * 30)}px`,
              border: `2px solid ${ACCENT}`,
              opacity: 0,
              animation: `soundPulse 1.5s ease-out ${i * 0.2}s forwards`
            }}
          />
        ))}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
            boxShadow: `0 0 40px ${ACCENT}66`,
            animation: 'pulseCore 1.5s ease-out'
          }}
        >
          🔊
        </div>
      </div>
    </div>
  )
}

// ---- Grouped month header ----
const MonthHeader = ({ label, count }) => (
  <div className="flex items-center justify-between px-1 mb-3">
    <h3
      className="text-sm font-semibold text-gray-300 uppercase tracking-wider"
      style={{ fontFamily: 'var(--font-titulos)' }}
    >
      {label}
    </h3>
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ACCENT_SUBTLE, color: ACCENT_LIGHT }}>
      {count} {count === 1 ? 'voz' : 'vozes'}
    </span>
  </div>
)

// ---- Single entry card ----
const VozEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false)
  const resultado = COMO_CORREU_OPTIONS.find(o => o.value === entry.como_correu)

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
          🗣️
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white italic truncate">
            &ldquo;{entry.o_que_disse}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{entry.com_quem}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: ACCENT_SUBTLE, color: ACCENT_LIGHT }}>
              {entry.sobre_o_que}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-fadeIn">
          <p className="text-sm text-gray-300">
            &ldquo;{entry.o_que_disse}&rdquo;
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Com: <strong className="text-gray-300">{entry.com_quem}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Sobre: <strong className="text-gray-300">{entry.sobre_o_que}</strong></span>
          </div>
          {resultado && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Resultado: <strong className="text-gray-300">{resultado.label}</strong></span>
            </div>
          )}
          <div className="text-xs text-gray-600 mt-1">
            {new Date(entry.created_at).toLocaleDateString('pt-PT', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>
      )}
    </button>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function RegistoVozRecuperada() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [view, setView] = useState('registar') // 'registar' | 'biblioteca'
  const [saving, setSaving] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [oQueDisse, setOQueDisse] = useState('')
  const [comQuem, setComQuem] = useState('')
  const [comQuemCustom, setComQuemCustom] = useState('')
  const [sobreOQue, setSobreOQue] = useState('')
  const [comoCorreu, setComoCorreu] = useState('')

  // Library state
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [silenciamentoPessoas, setSilenciamentoPessoas] = useState([])
  const [filterPerson, setFilterPerson] = useState('')
  const [filterTopic, setFilterTopic] = useState('')

  // Insight data
  const [insight, setInsight] = useState(null)

  // Load silenciamento pessoas for the dropdown
  useEffect(() => {
    if (!userId) return
    const fetchPessoas = async () => {
      try {
        const { data } = await supabase
          .from('ecoa_silenciamento')
          .select('pessoas')
          .eq('user_id', userId)
          .maybeSingle()

        if (data?.pessoas && Array.isArray(data.pessoas)) {
          setSilenciamentoPessoas(data.pessoas)
        }
      } catch {
        // silenciamento might not exist yet
      }
    }
    fetchPessoas()
  }, [userId])

  // Load entries when viewing library
  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ecoa_voz_recuperada')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])

      // Calculate insight
      if (data && data.length > 0) {
        const personCount = {}
        const topicCount = {}
        data.forEach((e) => {
          if (e.com_quem) personCount[e.com_quem] = (personCount[e.com_quem] || 0) + 1
          if (e.sobre_o_que) topicCount[e.sobre_o_que] = (topicCount[e.sobre_o_que] || 0) + 1
        })
        const topPerson = Object.entries(personCount).sort((a, b) => b[1] - a[1])[0]
        const topTopic = Object.entries(topicCount).sort((a, b) => b[1] - a[1])[0]
        if (topPerson && topTopic) {
          setInsight({ person: topPerson[0], topic: topTopic[0] })
        }
      }
    } catch (err) {
      console.error('Erro ao carregar voz recuperada:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (view === 'biblioteca') fetchEntries()
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
    if (!userId || !oQueDisse.trim()) return
    setSaving(true)

    const finalComQuem = comQuem === '__custom__' ? comQuemCustom.trim() : comQuem

    try {
      const { error } = await supabase
        .from('ecoa_voz_recuperada')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          o_que_disse: oQueDisse.trim(),
          com_quem: finalComQuem || null,
          sobre_o_que: sobreOQue || null,
          como_correu: comoCorreu || null
        })

      if (error) throw error

      // Award 10 ecos
      await awardEcos(10)

      // Show celebration
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
        setShowSuccess(true)
      }, 1800)
    } catch (err) {
      console.error('Erro ao guardar voz recuperada:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, oQueDisse, comQuem, comQuemCustom, sobreOQue, comoCorreu, awardEcos])

  const resetForm = useCallback(() => {
    setOQueDisse('')
    setComQuem('')
    setComQuemCustom('')
    setSobreOQue('')
    setComoCorreu('')
    setShowSuccess(false)
  }, [])

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (filterPerson && e.com_quem !== filterPerson) return false
    if (filterTopic && e.sobre_o_que !== filterTopic) return false
    return true
  })

  // Group by month
  const grouped = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = { label, entries: [] }
    acc[key].entries.push(entry)
    return acc
  }, {})

  // Get unique persons and topics for filters
  const uniquePersons = [...new Set(entries.map(e => e.com_quem).filter(Boolean))]
  const uniqueTopics = [...new Set(entries.map(e => e.sobre_o_que).filter(Boolean))]

  // Build "com quem" options: silenciamento pessoas + free text option
  const comQuemOptions = [
    ...silenciamentoPessoas.map((p) => (typeof p === 'string' ? p : p.nome || p.name || '')).filter(Boolean),
    '__custom__'
  ]

  // ---- RENDER ----
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Voz Recuperada"
        subtitle="Hoje disse algo que normalmente calaria"
      />

      <SoundWavePulse show={showCelebration} />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6 mt-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => { setView('registar'); resetForm() }}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'registar' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'registar' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'registar'}
          >
            Registar Voz
          </button>
          <button
            onClick={() => setView('biblioteca')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'biblioteca' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'biblioteca' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'biblioteca'}
          >
            Biblioteca de Vitorias
          </button>
        </div>

        {/* ======= REGISTAR VIEW ======= */}
        {view === 'registar' && !showSuccess && (
          <div className="space-y-6 animate-fadeIn">
            {/* Inspiration */}
            <div className="p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
              <p className="text-sm italic text-gray-300" style={{ fontFamily: 'var(--font-titulos)' }}>
                &ldquo;Hoje disse algo que normalmente calaria.&rdquo;
              </p>
            </div>

            {/* O que disseste? */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">O que disseste?</label>
              <textarea
                value={oQueDisse}
                onChange={(e) => setOQueDisse(e.target.value)}
                placeholder="Escreve o que disseste..."
                rows={3}
                maxLength={500}
                className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                aria-label="O que disseste"
              />
              <span className="text-xs text-gray-600 block text-right">{oQueDisse.length}/500</span>
            </div>

            {/* Com quem? */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Com quem?</label>
              {comQuemOptions.length > 1 ? (
                <select
                  value={comQuem}
                  onChange={(e) => setComQuem(e.target.value)}
                  className="w-full p-3 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Com quem"
                >
                  <option value="" className="bg-gray-800">Selecciona...</option>
                  {comQuemOptions.filter(o => o !== '__custom__').map((p) => (
                    <option key={p} value={p} className="bg-gray-800">{p}</option>
                  ))}
                  <option value="__custom__" className="bg-gray-800">Outra pessoa...</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={comQuemCustom}
                  onChange={(e) => { setComQuemCustom(e.target.value); setComQuem('__custom__') }}
                  placeholder="Nome ou relacao (mae, chefe, parceiro...)"
                  className="w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Com quem"
                />
              )}
              {comQuem === '__custom__' && comQuemOptions.length > 1 && (
                <input
                  type="text"
                  value={comQuemCustom}
                  onChange={(e) => setComQuemCustom(e.target.value)}
                  placeholder="Nome ou relacao..."
                  className="w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 mt-2"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Escreve o nome da pessoa"
                />
              )}
            </div>

            {/* Sobre o que? */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Sobre o que?</label>
              <div className="flex flex-wrap gap-2">
                {SOBRE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSobreOQue(opt)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${sobreOQue === opt ? 'text-white scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    style={sobreOQue === opt
                      ? { background: `${ACCENT}33`, boxShadow: `0 0 12px ${ACCENT}22` }
                      : { background: 'rgba(255,255,255,0.04)' }
                    }
                    aria-pressed={sobreOQue === opt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Como correu? */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Como correu?</label>
              <div className="space-y-2">
                {COMO_CORREU_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setComoCorreu(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${comoCorreu === opt.value ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    style={comoCorreu === opt.value
                      ? { background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }
                    }
                    aria-pressed={comoCorreu === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || !oQueDisse.trim()}
              className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
            >
              {saving ? 'A guardar...' : `Registar Voz (+10 Ecos 🔊)`}
            </button>
          </div>
        )}

        {/* ======= SUCCESS VIEW ======= */}
        {view === 'registar' && showSuccess && (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-fadeIn">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `${ACCENT}22`, boxShadow: `0 0 40px ${ACCENT}22` }}
            >
              🗣️
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                A tua voz foi {g('ouvido', 'ouvida')}!
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                Cada vez que falas, a tua garganta recorda que tem poder. +10 Ecos 🔊
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-medium text-sm bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10 transition-all duration-200"
              >
                Novo registo
              </button>
              <button
                onClick={() => { setView('biblioteca'); resetForm() }}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
              >
                Ver vitorias
              </button>
            </div>
          </div>
        )}

        {/* ======= BIBLIOTECA VIEW ======= */}
        {view === 'biblioteca' && (
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
                <div className="text-4xl">🤫</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-titulos)' }}
                >
                  Ainda sem vitorias de voz
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Quando disseres algo que normalmente calarias, regista aqui. Cada palavra conta.
                </p>
                <button
                  onClick={() => { setView('registar'); resetForm() }}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Registar primeira voz
                </button>
              </div>
            ) : (
              <>
                {/* Total counter */}
                <div className="p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
                    {entries.length}
                  </p>
                  <p className="text-sm text-gray-400">
                    {entries.length === 1 ? 'vez que a tua voz foi ouvida' : 'vezes que a tua voz foi ouvida'}
                  </p>
                </div>

                {/* Insight */}
                {insight && (
                  <div className="p-4 rounded-xl" style={{ background: `${ACCENT}11`, border: `1px solid ${ACCENT}22` }}>
                    <p className="text-sm text-gray-300 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
                      As tuas maiores coragens de voz foram com <strong className="text-white">{insight.person}</strong> sobre <strong className="text-white">{insight.topic}</strong>
                    </p>
                  </div>
                )}

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filterPerson}
                    onChange={(e) => setFilterPerson(e.target.value)}
                    className="flex-1 p-2 rounded-lg text-sm text-white appearance-none focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    aria-label="Filtrar por pessoa"
                  >
                    <option value="" className="bg-gray-800">Todas as pessoas</option>
                    {uniquePersons.map((p) => (
                      <option key={p} value={p} className="bg-gray-800">{p}</option>
                    ))}
                  </select>
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="flex-1 p-2 rounded-lg text-sm text-white appearance-none focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    aria-label="Filtrar por tema"
                  >
                    <option value="" className="bg-gray-800">Todos os temas</option>
                    {uniqueTopics.map((t) => (
                      <option key={t} value={t} className="bg-gray-800">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Entries grouped by month */}
                <div className="space-y-6 pb-8">
                  {Object.entries(grouped)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([key, group]) => (
                      <div key={key}>
                        <MonthHeader label={group.label} count={group.entries.length} />
                        <div className="space-y-2">
                          {group.entries.map((entry) => (
                            <VozEntry key={entry.id} entry={entry} />
                          ))}
                        </div>
                      </div>
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
        @keyframes soundPulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulseCore {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(1); }
          80% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
