import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ============================================================
// IMAGO — Roupa como Identidade
// Mais profundo que o EspelhoRoupa (Aurea) — explora roupa
// como expressao de identidade vs funcao
// Chakra: Sahasrara (Coroa)
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#1a1a2e'
const ACCENT_LIGHT = '#A898C0'
const ACCENT_SUBTLE = 'rgba(139,123,165,0.12)'

// ---- Helpers ----
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
}

const getToday = () => new Date().toISOString().split('T')[0]

const getLast7Days = () => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

// ---- Past entry card ----
const EntryCard = ({ entry, isToday }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
      style={{
        background: expanded ? `${ACCENT}11` : 'rgba(255,255,255,0.03)',
        border: isToday ? `1px solid ${ACCENT}44` : '1px solid transparent'
      }}
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ background: `${ACCENT}22` }}
          aria-hidden="true"
        >
          {isToday ? '📌' : '👔'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              {isToday ? 'Hoje' : formatDate(entry.data)}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(entry.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">
            {entry.o_que_visto}
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
        <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
          <div className="text-sm text-gray-400">
            <span className="font-medium text-gray-300">O que vesti:</span>{' '}
            {entry.o_que_visto}
          </div>
          {entry.que_identidade && (
            <div className="text-sm text-gray-400">
              <span className="font-medium text-gray-300">Identidade projectada:</span>{' '}
              {entry.que_identidade}
            </div>
          )}
          {entry.reflexao && (
            <div className="text-sm text-gray-400">
              <span className="font-medium text-gray-300">Reflexao:</span>{' '}
              {entry.reflexao}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

// ---- Patterns insight component ----
const PatternsInsight = ({ entries }) => {
  if (!entries || entries.length < 7) return null

  // Simple pattern detection: group by weekday
  const weekdayMap = {}
  entries.forEach((entry) => {
    const day = new Date(entry.data).getDay()
    const dayName = new Date(entry.data).toLocaleDateString('pt-PT', { weekday: 'long' })
    if (!weekdayMap[day]) weekdayMap[day] = { dayName, entries: [] }
    weekdayMap[day].entries.push(entry)
  })

  // Check if weekday vs weekend entries differ in tone
  const weekdayEntries = entries.filter(e => {
    const d = new Date(e.data).getDay()
    return d >= 1 && d <= 5
  })
  const weekendEntries = entries.filter(e => {
    const d = new Date(e.data).getDay()
    return d === 0 || d === 6
  })

  // Check for "funcao" vs "expressao" keywords
  const funcaoCount = entries.filter(e =>
    (e.reflexao || '').toLowerCase().includes('funcao') ||
    (e.reflexao || '').toLowerCase().includes('funcional') ||
    (e.reflexao || '').toLowerCase().includes('trabalho') ||
    (e.reflexao || '').toLowerCase().includes('pratico')
  ).length

  const expressaoCount = entries.filter(e =>
    (e.reflexao || '').toLowerCase().includes('express') ||
    (e.reflexao || '').toLowerCase().includes('identidade') ||
    (e.reflexao || '').toLowerCase().includes('eu') ||
    (e.reflexao || '').toLowerCase().includes('quem sou')
  ).length

  return (
    <div className="p-4 rounded-2xl space-y-3" style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT}22` }}>
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">🔍</span>
        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>
          Padroes {g('detectados', 'detectadas')}
        </h3>
      </div>

      <div className="space-y-2 text-sm text-gray-300">
        {weekdayEntries.length > 0 && weekendEntries.length > 0 && (
          <p>
            Tens {weekdayEntries.length} {weekdayEntries.length === 1 ? 'registo' : 'registos'} em dias de semana
            e {weekendEntries.length} ao fim de semana. Notas alguma diferenca no que vestes?
          </p>
        )}

        {funcaoCount > 0 && expressaoCount > 0 && (
          <p>
            Nos teus registos, {funcaoCount} {funcaoCount === 1 ? 'menciona' : 'mencionam'} funcao/praticidade
            e {expressaoCount} {expressaoCount === 1 ? 'fala' : 'falam'} de expressao/identidade.
          </p>
        )}

        {funcaoCount > expressaoCount && funcaoCount > 0 && (
          <p className="italic" style={{ color: ACCENT_LIGHT }}>
            Parece que a tua roupa serve mais como funcao do que como expressao.
            Como seria vestires-te como quem realmente es, pelo menos um dia por semana?
          </p>
        )}

        {expressaoCount >= funcaoCount && expressaoCount > 0 && (
          <p className="italic" style={{ color: ACCENT_LIGHT }}>
            {g('Estas atento', 'Estas atenta')} a como a roupa comunica quem es. Isso e consciencia em accao.
          </p>
        )}

        {funcaoCount === 0 && expressaoCount === 0 && (
          <p className="italic" style={{ color: ACCENT_LIGHT }}>
            Ja tens {entries.length} registos. Continua a observar — os padroes revelam-se com o tempo.
            Pergunta-te: nos dias de trabalho vestes X, mas nos dias livres vestes Y?
          </p>
        )}
      </div>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function RoupaComoIdentidade() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [oQueVisto, setOQueVisto] = useState('')
  const [queIdentidade, setQueIdentidade] = useState('')
  const [reflexao, setReflexao] = useState('')

  // History state
  const [entries, setEntries] = useState([])
  const [todayEntry, setTodayEntry] = useState(null)

  // Load entries
  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('imago_roupa_identidade')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(60)

      if (error) throw error

      const all = data || []
      setEntries(all)

      // Check if there is an entry for today
      const today = getToday()
      const todayE = all.find(e => e.data === today)
      setTodayEntry(todayE || null)
    } catch (err) {
      console.error('Erro ao carregar registos:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Save entry
  const handleSave = useCallback(async () => {
    if (!userId || !oQueVisto.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('imago_roupa_identidade')
        .insert({
          user_id: userId,
          data: getToday(),
          o_que_visto: oQueVisto.trim(),
          que_identidade: queIdentidade.trim() || null,
          reflexao: reflexao.trim() || null
        })

      if (error) throw error

      setShowSuccess(true)
      setOQueVisto('')
      setQueIdentidade('')
      setReflexao('')

      // Refresh
      await fetchEntries()

      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error('Erro ao guardar registo:', err)
      alert('Nao foi possivel guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, oQueVisto, queIdentidade, reflexao, fetchEntries])

  // Calendar-like view: last 7 days
  const last7 = getLast7Days()
  const last7Entries = last7.map(day => {
    const dayEntries = entries.filter(e => e.data === day)
    return { date: day, entries: dayEntries, hasEntry: dayEntries.length > 0 }
  })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
        <ModuleHeader eco="imago" title="Roupa como Identidade" subtitle="O que visto comunica quem?" />
        <div className="flex items-center justify-center py-16">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${ACCENT}33`, borderTopColor: ACCENT }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="imago"
        title="Roupa como Identidade"
        subtitle="O que visto comunica quem?"
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Success toast */}
        {showSuccess && (
          <div
            className="p-3 rounded-xl text-center mb-4 animate-fadeIn"
            style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}
          >
            <p className="text-sm text-white">
              Registo guardado com sucesso!
            </p>
          </div>
        )}

        {/* ===== TODAY'S REFLECTION FORM ===== */}
        <div className="space-y-4 mt-4">
          <div className="text-center mb-2">
            <h2
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Reflexao de hoje
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {todayEntry
                ? `Ja tens ${entries.filter(e => e.data === getToday()).length} registo(s) hoje. Podes adicionar mais.`
                : 'Observa o que vestiste e o que isso comunica.'
              }
            </p>
          </div>

          {/* Question 1: O que vestiste hoje? */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              O que vestiste hoje?
            </label>
            <textarea
              value={oQueVisto}
              onChange={(e) => setOQueVisto(e.target.value)}
              placeholder="Descreve o que tens vestido hoje..."
              rows={3}
              maxLength={500}
              className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
              aria-label="O que vestiste hoje"
            />
            <span className="text-xs text-gray-600 float-right">{oQueVisto.length}/500</span>
          </div>

          {/* Question 2: Que identidade estas a projectar? */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Que identidade estas a projectar?
            </label>
            <textarea
              value={queIdentidade}
              onChange={(e) => setQueIdentidade(e.target.value)}
              placeholder="Que imagem transmites ao mundo com esta roupa?"
              rows={3}
              maxLength={500}
              className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
              aria-label="Que identidade estas a projectar"
            />
            <span className="text-xs text-gray-600 float-right">{queIdentidade.length}/500</span>
          </div>

          {/* Question 3: Expressao ou funcao? */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Vestes-te como expressao ou como funcao?
            </label>
            <textarea
              value={reflexao}
              onChange={(e) => setReflexao(e.target.value)}
              placeholder="Hoje vestiste-te para comunicar quem es, ou simplesmente para cumprir uma funcao?"
              rows={3}
              maxLength={1000}
              className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
              aria-label="Reflexao sobre expressao ou funcao"
            />
            <span className="text-xs text-gray-600 float-right">{reflexao.length}/1000</span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !oQueVisto.trim()}
            className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
          >
            {saving ? 'A guardar...' : 'Guardar reflexao'}
          </button>
        </div>

        {/* ===== LAST 7 DAYS CALENDAR ===== */}
        <div className="mt-8 space-y-3">
          <h3
            className="text-base font-semibold text-white"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Ultimos 7 dias
          </h3>

          <div className="flex gap-2 justify-between">
            {last7Entries.map(({ date, hasEntry }) => {
              const d = new Date(date)
              const dayLabel = d.toLocaleDateString('pt-PT', { weekday: 'narrow' })
              const dayNum = d.getDate()
              const isToday = date === getToday()

              return (
                <div
                  key={date}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-gray-500 uppercase">{dayLabel}</span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
                    style={{
                      background: hasEntry ? `${ACCENT}33` : 'rgba(255,255,255,0.04)',
                      border: isToday ? `2px solid ${ACCENT}` : '2px solid transparent',
                      color: hasEntry ? '#fff' : '#666'
                    }}
                    title={hasEntry ? `Registos em ${formatDate(date)}` : `Sem registo em ${formatDate(date)}`}
                  >
                    {dayNum}
                  </div>
                  {hasEntry && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== PATTERNS (7+ entries) ===== */}
        {entries.length >= 7 && (
          <div className="mt-8">
            <PatternsInsight entries={entries} />
          </div>
        )}

        {/* ===== PAST ENTRIES LIST ===== */}
        {entries.length > 0 && (
          <div className="mt-8 space-y-3">
            <h3
              className="text-base font-semibold text-white"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Registos anteriores
            </h3>

            <p className="text-xs text-gray-500">
              {entries.length} {entries.length === 1 ? 'registo' : 'registos'} no total
            </p>

            <div className="space-y-2 pb-8">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id || `${entry.data}-${entry.created_at}`}
                  entry={entry}
                  isToday={entry.data === getToday()}
                />
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 space-y-4 mt-8">
            <div className="text-4xl" aria-hidden="true">👔</div>
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Ainda sem registos
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Comeca a registar o que vestes e descobre o que a tua roupa diz sobre quem es.
              Com 7 registos, mostramos padroes.
            </p>
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
