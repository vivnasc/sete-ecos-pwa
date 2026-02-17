import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import { DIMENSOES_IDENTIDADE } from '../../lib/imago/gamificacao'

// ============================================================
// IMAGO — Integração dos Ecos
// Painel de correlação entre diferentes ecos/dimensões
// Chakra: Sahasrara (Coroa) — Consciência integradora
// ============================================================

const ACCENT = '#8B7BA5'
const ACCENT_DARK = '#1a1a2e'
const ACCENT_SUBTLE = 'rgba(139,123,165,0.12)'

// Prompts de correlação entre ecos
const CORRELATION_PROMPTS = {
  'vitalis-serena': 'Quando cuidas do teu corpo (Vitalis), as tuas emoções (Serena) tendem a...',
  'vitalis-ignis': 'Quando o teu corpo está bem (Vitalis), a tua vontade (Ignis) tende a...',
  'vitalis-ventis': 'Quando a tua alimentação está equilibrada (Vitalis), a tua energia (Ventis) tende a...',
  'vitalis-ecoa': 'Quando cuidas do teu corpo (Vitalis), a tua expressão (Ecoa) tende a...',
  'vitalis-imago': 'Quando o teu corpo está saudável (Vitalis), o teu sentido de identidade (Imago) tende a...',
  'vitalis-aurea': 'Quando cuidas do teu corpo (Vitalis), o teu sentido de valor (Aurea) tende a...',
  'serena-ignis': 'Quando as tuas emoções estão equilibradas (Serena), a tua vontade (Ignis) tende a...',
  'serena-ventis': 'Quando as tuas emoções fluem (Serena), a tua energia (Ventis) tende a...',
  'serena-ecoa': 'Quando te sentes emocionalmente estável (Serena), a tua voz (Ecoa) tende a...',
  'serena-imago': 'Quando as tuas emoções estão claras (Serena), a tua identidade (Imago) tende a...',
  'serena-aurea': 'Quando as tuas emoções fluem (Serena), o teu sentido de valor (Aurea) tende a...',
  'ignis-ventis': 'Quando a tua vontade está forte (Ignis), a tua energia (Ventis) tende a...',
  'ignis-ecoa': 'Quando escolhes conscientemente (Ignis), a tua expressão (Ecoa) tende a...',
  'ignis-imago': 'Quando a tua vontade está clara (Ignis), a tua identidade (Imago) tende a...',
  'ignis-aurea': 'Quando a tua determinação é forte (Ignis), o teu sentido de valor (Aurea) tende a...',
  'ventis-ecoa': 'Quando a tua energia está alta (Ventis), a tua expressão (Ecoa) tende a...',
  'ventis-imago': 'Quando o teu ritmo está alinhado (Ventis), a tua identidade (Imago) tende a...',
  'ventis-aurea': 'Quando a tua energia flui (Ventis), o teu sentido de valor (Aurea) tende a...',
  'ecoa-imago': 'Quando dizes a tua verdade (Ecoa), a tua identidade (Imago) tende a...',
  'ecoa-aurea': 'Quando te expressas com autenticidade (Ecoa), o teu sentido de valor (Aurea) tende a...',
  'imago-aurea': 'Quando sabes quem és (Imago), o teu sentido de valor (Aurea) tende a...'
}

function getCorrelationPrompt(eco1, eco2) {
  const key1 = `${eco1}-${eco2}`
  const key2 = `${eco2}-${eco1}`
  return CORRELATION_PROMPTS[key1] || CORRELATION_PROMPTS[key2] || `Que conexão percebes entre ${eco1} e ${eco2}?`
}

// ---- Eco Selector Card ----
const EcoCard = ({ dim, selected, onSelect }) => (
  <button
    onClick={() => onSelect(dim.eco)}
    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 w-full text-left ${selected ? 'ring-2 scale-[1.02] shadow-lg' : 'hover:bg-white/5 active:scale-[0.98]'}`}
    style={{
      background: selected ? `${dim.cor}22` : 'rgba(255,255,255,0.04)',
      ringColor: selected ? dim.cor : undefined,
      boxShadow: selected ? `0 0 12px ${dim.cor}22` : undefined
    }}
    aria-pressed={selected}
    aria-label={dim.nome}
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
      style={{ background: `${dim.cor}25` }}
      aria-hidden="true"
    >
      {dim.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>
        {dim.nome}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {dim.eco.charAt(0).toUpperCase() + dim.eco.slice(1)}
      </p>
    </div>
  </button>
)

// ---- Insight Entry ----
const InsightEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false)
  const dim1 = DIMENSOES_IDENTIDADE.find(d => d.eco === entry.eco_1)
  const dim2 = DIMENSOES_IDENTIDADE.find(d => d.eco === entry.eco_2)

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-base" aria-hidden="true">{dim1?.icon || '?'}</span>
            <span className="text-gray-500 text-xs">+</span>
            <span className="text-base" aria-hidden="true">{dim2?.icon || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {dim1?.nome || entry.eco_1} + {dim2?.nome || entry.eco_2}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(entry.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
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
        <div className="px-4 pb-4 space-y-2 animate-fadeIn">
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-1">Insight:</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {entry.insight}
            </p>
          </div>
          {entry.reflexao && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">Reflexão:</p>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap italic">
                {entry.reflexao}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function IntegracaoEcos() {
  const navigate = useNavigate()
  const { userRecord } = useAuth()
  const userId = userRecord?.id || null

  // Seleccao de ecos
  const [eco1, setEco1] = useState('')
  const [eco2, setEco2] = useState('')

  // Form
  const [insight, setInsight] = useState('')
  const [reflexao, setReflexao] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Previous insights
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  // View
  const [view, setView] = useState('registar') // 'registar' | 'historico'

  // ===== Carregar historico =====
  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('imago_integracoes_log')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error('IntegracaoEcos: Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

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

  // ===== Guardar insight =====
  const handleSave = useCallback(async () => {
    if (!userId || !eco1 || !eco2 || !insight.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('imago_integracoes_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          eco_1: eco1,
          eco_2: eco2,
          insight: insight.trim(),
          reflexao: reflexao.trim() || null
        })

      if (error) throw error

      // Award 12 estrelas
      await awardEstrelas(12)

      setSaveSuccess(true)
      setInsight('')
      setReflexao('')
      setEco1('')
      setEco2('')
      fetchEntries()

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Erro ao guardar integracao:', err)
      alert('Não foi possível guardar. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }, [userId, eco1, eco2, insight, reflexao, awardEstrelas, fetchEntries])

  // ===== Ecos disponiveis (excluir o outro seleccionado) =====
  const ecos1 = DIMENSOES_IDENTIDADE
  const ecos2 = DIMENSOES_IDENTIDADE.filter(d => d.eco !== eco1)

  // ===== Prompt de correlacao =====
  const correlationPrompt = eco1 && eco2 ? getCorrelationPrompt(eco1, eco2) : null

  // ===== RENDER =====
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="imago"
        title="Integração dos Ecos"
        subtitle="Descobre as conexões entre as tuas dimensões"
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6 mt-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setView('registar')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'registar' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'registar' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'registar'}
          >
            Nova Conexão
          </button>
          <button
            onClick={() => setView('historico')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${view === 'historico' ? 'text-white' : 'text-gray-500'}`}
            style={view === 'historico' ? { background: `${ACCENT}33` } : undefined}
            aria-pressed={view === 'historico'}
          >
            Histórico ({entries.length})
          </button>
        </div>

        {/* Success toast */}
        {saveSuccess && (
          <div
            className="mb-4 p-3 rounded-xl text-center animate-fadeIn"
            style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}
          >
            <p className="text-sm text-white">
              Conexão registada! +12 Estrelas
            </p>
          </div>
        )}

        {/* ======= REGISTAR VIEW ======= */}
        {view === 'registar' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="text-center">
              <h2
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Conexões entre os teus ecos
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Escolhe dois ecos e explora como se influenciam mutuamente
              </p>
            </div>

            {/* Eco 1 selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Primeiro eco:</label>
              <div className="grid grid-cols-2 gap-2">
                {ecos1.map(dim => (
                  <EcoCard
                    key={dim.eco}
                    dim={dim}
                    selected={eco1 === dim.eco}
                    onSelect={(eco) => {
                      setEco1(eco)
                      if (eco === eco2) setEco2('')
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Eco 2 selector (only shown after eco1 selected) */}
            {eco1 && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-sm font-medium text-gray-300">Segundo eco:</label>
                <div className="grid grid-cols-2 gap-2">
                  {ecos2.map(dim => (
                    <EcoCard
                      key={dim.eco}
                      dim={dim}
                      selected={eco2 === dim.eco}
                      onSelect={setEco2}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Correlation prompt */}
            {correlationPrompt && (
              <div
                className="p-4 rounded-xl animate-fadeIn"
                style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT}22` }}
              >
                <p
                  className="text-sm italic text-gray-300 leading-relaxed"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {correlationPrompt}
                </p>
              </div>
            )}

            {/* Insight textarea */}
            {eco1 && eco2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">O teu insight:</label>
                  <div className="relative">
                    <textarea
                      value={insight}
                      onChange={(e) => setInsight(e.target.value)}
                      placeholder="Descreve a conexão que percebes entre estes dois ecos..."
                      rows={4}
                      maxLength={2000}
                      className="w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.06)', focusRingColor: ACCENT }}
                      aria-label="Insight de integração"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-gray-600">
                      {insight.length}/2000
                    </span>
                  </div>
                </div>

                {/* Optional reflexao */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Reflexão adicional <span className="text-gray-500">(opcional)</span>:
                  </label>
                  <textarea
                    value={reflexao}
                    onChange={(e) => setReflexao(e.target.value)}
                    placeholder="Algo mais que queiras anotar sobre esta conexão..."
                    rows={2}
                    maxLength={1000}
                    className="w-full p-3 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{ background: 'rgba(255,255,255,0.04)', focusRingColor: ACCENT }}
                    aria-label="Reflexão adicional"
                  />
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving || !insight.trim()}
                  className="w-full py-4 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  {saving ? 'A guardar...' : `Guardar conexão (+12 Estrelas)`}
                </button>
              </div>
            )}
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
                <div className="text-4xl">🌀</div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Nenhuma conexão registada
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Começa por explorar como os teus diferentes ecos se influenciam mutuamente.
                </p>
                <button
                  onClick={() => setView('registar')}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  Registar primeira conexão
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {entries.length}
                    </p>
                    <p className="text-xs text-gray-400">{entries.length === 1 ? 'conexão' : 'conexões'}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background: ACCENT_SUBTLE }}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {new Set(entries.flatMap(e => [e.eco_1, e.eco_2])).size}
                    </p>
                    <p className="text-xs text-gray-400">ecos {g('explorados', 'exploradas')}</p>
                  </div>
                </div>

                {/* Entries list */}
                <div className="space-y-2 pb-8">
                  {entries.map((entry) => (
                    <InsightEntry key={entry.id} entry={entry} />
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
