import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import ModuleHeader from '../shared/ModuleHeader'
import AudioPlayerBar from '../shared/AudioPlayerBar'
import { ESPELHO_TRIPLO_GUIA } from '../../lib/imago/gamificacao'

const TABS = [
  { key: 'essencia', label: 'Essencia', icon: '💎' },
  { key: 'mascara', label: 'Mascara', icon: '🎭' },
  { key: 'aspiracao', label: 'Aspiracao', icon: '🌟' }
]

const IMAGO_COLOR = '#8B7BA5'

// Journaling audio por tab
const TAB_AUDIO = {
  essencia: { slug: 'imago-01-espelho-triplo', titulo: 'Quem És Sem Plateia' },
  mascara: { slug: 'imago-02-mascara', titulo: 'A Máscara Que Usas' },
  aspiracao: { slug: 'imago-05-essencia', titulo: 'A Tua Essência' },
}

export default function EspelhoTriplo() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [activeTab, setActiveTab] = useState('essencia')
  const [saveMsg, setSaveMsg] = useState('')

  // Reflections for each panel
  const [essencia, setEssencia] = useState('')
  const [mascara, setMascara] = useState('')
  const [aspiracao, setAspiracao] = useState('')

  // Gaps reflection
  const [gaps, setGaps] = useState({
    distancia: '',
    impedimentos: ''
  })

  // Identified masks list
  const [mascarasIdentificadas, setMascarasIdentificadas] = useState([])
  const [novaMascara, setNovaMascara] = useState({ onde: '', quando: '', porque: '' })

  // Check if all 3 sections are filled
  const todasPreenchidas = essencia.trim() && mascara.trim() && aspiracao.trim()

  // Load data
  useEffect(() => {
    if (!session?.user) return

    const loadData = async () => {
      try {
        // Get user_id from users table
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', session.user.id)
          .maybeSingle()

        if (!userData) {
          setLoading(false)
          return
        }

        setUserId(userData.id)

        // Load existing espelho triplo data
        const { data: espelhoData } = await supabase
          .from('imago_espelho_triplo')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle()

        if (espelhoData) {
          setEssencia(espelhoData.essencia || '')
          setMascara(espelhoData.mascara || '')
          setAspiracao(espelhoData.aspiracao || '')
          if (espelhoData.gaps) {
            setGaps(typeof espelhoData.gaps === 'string'
              ? JSON.parse(espelhoData.gaps)
              : espelhoData.gaps
            )
          }
          if (espelhoData.mascaras_identificadas) {
            setMascarasIdentificadas(
              typeof espelhoData.mascaras_identificadas === 'string'
                ? JSON.parse(espelhoData.mascaras_identificadas)
                : espelhoData.mascaras_identificadas
            )
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do Espelho Triplo:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session])

  // Add mask
  const adicionarMascara = useCallback(() => {
    if (!novaMascara.onde.trim() && !novaMascara.quando.trim() && !novaMascara.porque.trim()) return

    setMascarasIdentificadas(prev => [...prev, { ...novaMascara, id: Date.now() }])
    setNovaMascara({ onde: '', quando: '', porque: '' })
  }, [novaMascara])

  // Remove mask
  const removerMascara = useCallback((id) => {
    setMascarasIdentificadas(prev => prev.filter(m => m.id !== id))
  }, [])

  // Save data
  const guardar = useCallback(async () => {
    if (!userId) return

    setSaving(true)
    setSaveMsg('')

    try {
      const { error } = await supabase
        .from('imago_espelho_triplo')
        .upsert({
          user_id: userId,
          essencia,
          mascara,
          aspiracao,
          gaps,
          mascaras_identificadas: mascarasIdentificadas,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      // Update espelho_completado if all 3 sections are filled
      if (todasPreenchidas) {
        await supabase
          .from('imago_clients')
          .update({ espelho_completado: true })
          .eq('user_id', userId)
      }

      setSaveMsg(g('Guardado com sucesso!', 'Guardado com sucesso!'))
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (error) {
      console.error('Erro ao guardar Espelho Triplo:', error)
      setSaveMsg('Erro ao guardar. Tenta novamente.')
      setTimeout(() => setSaveMsg(''), 4000)
    } finally {
      setSaving(false)
    }
  }, [userId, essencia, mascara, aspiracao, gaps, mascarasIdentificadas, todasPreenchidas])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${IMAGO_COLOR}40`, borderTopColor: IMAGO_COLOR }}
          />
          <p className="text-gray-500">A carregar...</p>
        </div>
      </div>
    )
  }

  const guiaActual = ESPELHO_TRIPLO_GUIA[activeTab]
  const textoActual = activeTab === 'essencia' ? essencia
    : activeTab === 'mascara' ? mascara
    : aspiracao
  const setTextoActual = activeTab === 'essencia' ? setEssencia
    : activeTab === 'mascara' ? setMascara
    : setAspiracao

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <ModuleHeader
        eco="imago"
        title="Espelho Triplo"
        subtitle="Quem sou vs. quem mostro vs. quem quero ser"
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: `${IMAGO_COLOR}30` }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            const isFilled = tab.key === 'essencia' ? essencia.trim()
              : tab.key === 'mascara' ? mascara.trim()
              : aspiracao.trim()

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-2 text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: IMAGO_COLOR } : undefined}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="block text-lg mb-0.5">{tab.icon}</span>
                <span>{tab.label}</span>
                {isFilled && !isActive && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: IMAGO_COLOR, fontFamily: 'var(--font-titulos)' }}
          >
            {guiaActual.titulo}
          </h2>

          {/* Guided audio */}
          {TAB_AUDIO[activeTab] && (
            <div className="mb-4">
              <AudioPlayerBar
                eco="journaling"
                slug={TAB_AUDIO[activeTab].slug}
                accentColor={IMAGO_COLOR}
                titulo={TAB_AUDIO[activeTab].titulo}
              />
            </div>
          )}

          {/* Guiding Questions */}
          <div className="mb-4 space-y-2">
            <p className="text-sm text-gray-500 font-medium mb-2">
              Perguntas para {g('te guiares', 'te guiares')}:
            </p>
            {guiaActual.perguntas.map((pergunta, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-600 py-1.5 px-3 rounded-lg"
                style={{ backgroundColor: `${IMAGO_COLOR}08` }}
              >
                <span style={{ color: IMAGO_COLOR }} className="mt-0.5 font-bold">?</span>
                <span>{pergunta}</span>
              </div>
            ))}
          </div>

          {/* Reflection Textarea */}
          <textarea
            value={textoActual}
            onChange={(e) => setTextoActual(e.target.value)}
            placeholder={`Escreve aqui a tua reflexao sobre "${guiaActual.titulo.toLowerCase()}"...`}
            rows={8}
            className="w-full p-4 border rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none transition-all"
            style={{
              borderColor: `${IMAGO_COLOR}30`,
              focusRingColor: IMAGO_COLOR
            }}
            onFocus={(e) => {
              e.target.style.borderColor = IMAGO_COLOR
              e.target.style.boxShadow = `0 0 0 2px ${IMAGO_COLOR}30`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = `${IMAGO_COLOR}30`
              e.target.style.boxShadow = 'none'
            }}
          />

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              {textoActual.length > 0
                ? `${textoActual.length} caracteres`
                : g('Toma o teu tempo. Nao ha pressa.', 'Toma o teu tempo. Nao ha pressa.')}
            </p>
            {activeTab !== 'aspiracao' && (
              <button
                onClick={() => setActiveTab(
                  activeTab === 'essencia' ? 'mascara' : 'aspiracao'
                )}
                className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                style={{ color: IMAGO_COLOR, backgroundColor: `${IMAGO_COLOR}10` }}
              >
                Proximo &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Gaps Section — only visible when all 3 are filled */}
        {todasPreenchidas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <h2
                className="text-xl font-bold"
                style={{ color: IMAGO_COLOR, fontFamily: 'var(--font-titulos)' }}
              >
                As Distancias Entre os Espelhos
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Agora que escreveste sobre as tres dimensoes, reflecte sobre o que as separa.
            </p>

            {/* Gap: Distance */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Que distancia existe entre quem es e quem mostras?
              </label>
              <textarea
                value={gaps.distancia}
                onChange={(e) => setGaps(prev => ({ ...prev, distancia: e.target.value }))}
                placeholder="Reflecte sobre a diferenca entre a tua essencia e a tua mascara..."
                rows={4}
                className="w-full p-3 border rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: `${IMAGO_COLOR}30` }}
                onFocus={(e) => {
                  e.target.style.borderColor = IMAGO_COLOR
                  e.target.style.boxShadow = `0 0 0 2px ${IMAGO_COLOR}30`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${IMAGO_COLOR}30`
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Gap: Impediments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                O que te impede de ser quem queres ser?
              </label>
              <textarea
                value={gaps.impedimentos}
                onChange={(e) => setGaps(prev => ({ ...prev, impedimentos: e.target.value }))}
                placeholder="O que te segura? Medo, habito, o olhar dos outros?..."
                rows={4}
                className="w-full p-3 border rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: `${IMAGO_COLOR}30` }}
                onFocus={(e) => {
                  e.target.style.borderColor = IMAGO_COLOR
                  e.target.style.boxShadow = `0 0 0 2px ${IMAGO_COLOR}30`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${IMAGO_COLOR}30`
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Masks Identification Section */}
        {todasPreenchidas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎭</span>
              <h2
                className="text-xl font-bold"
                style={{ color: IMAGO_COLOR, fontFamily: 'var(--font-titulos)' }}
              >
                Identificar Mascaras
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {g(
                'Todos usamos mascaras. Identificar onde, quando e porque as usas e o primeiro passo para escolher se queres continuar a usa-las.',
                'Todas usamos mascaras. Identificar onde, quando e porque as usas e o primeiro passo para escolher se queres continuar a usa-las.'
              )}
            </p>

            {/* Existing masks */}
            {mascarasIdentificadas.length > 0 && (
              <div className="space-y-3 mb-5">
                {mascarasIdentificadas.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border relative"
                    style={{ borderColor: `${IMAGO_COLOR}20`, backgroundColor: `${IMAGO_COLOR}05` }}
                  >
                    <button
                      onClick={() => removerMascara(m.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors text-sm"
                      aria-label="Remover mascara"
                    >
                      &times;
                    </button>
                    <div className="space-y-1 text-sm pr-6">
                      {m.onde && (
                        <p><span className="font-semibold text-gray-700">Onde:</span> <span className="text-gray-600">{m.onde}</span></p>
                      )}
                      {m.quando && (
                        <p><span className="font-semibold text-gray-700">Quando:</span> <span className="text-gray-600">{m.quando}</span></p>
                      )}
                      {m.porque && (
                        <p><span className="font-semibold text-gray-700">Porque:</span> <span className="text-gray-600">{m.porque}</span></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new mask form */}
            <div className="space-y-3 p-4 rounded-xl border border-dashed" style={{ borderColor: `${IMAGO_COLOR}30` }}>
              <p className="text-sm font-medium text-gray-700">Adicionar mascara:</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Onde usas esta mascara?</label>
                <input
                  type="text"
                  value={novaMascara.onde}
                  onChange={(e) => setNovaMascara(prev => ({ ...prev, onde: e.target.value }))}
                  placeholder="Ex: No trabalho, com a familia..."
                  className="w-full p-2.5 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{ borderColor: `${IMAGO_COLOR}30` }}
                  onFocus={(e) => {
                    e.target.style.borderColor = IMAGO_COLOR
                    e.target.style.boxShadow = `0 0 0 2px ${IMAGO_COLOR}30`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${IMAGO_COLOR}30`
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quando a usas?</label>
                <input
                  type="text"
                  value={novaMascara.quando}
                  onChange={(e) => setNovaMascara(prev => ({ ...prev, quando: e.target.value }))}
                  placeholder="Ex: Quando me sinto insegura, em reunioes..."
                  className="w-full p-2.5 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{ borderColor: `${IMAGO_COLOR}30` }}
                  onFocus={(e) => {
                    e.target.style.borderColor = IMAGO_COLOR
                    e.target.style.boxShadow = `0 0 0 2px ${IMAGO_COLOR}30`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${IMAGO_COLOR}30`
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Porque a usas?</label>
                <input
                  type="text"
                  value={novaMascara.porque}
                  onChange={(e) => setNovaMascara(prev => ({ ...prev, porque: e.target.value }))}
                  placeholder="Ex: Para nao ser julgada, para agradar..."
                  className="w-full p-2.5 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{ borderColor: `${IMAGO_COLOR}30` }}
                  onFocus={(e) => {
                    e.target.style.borderColor = IMAGO_COLOR
                    e.target.style.boxShadow = `0 0 0 2px ${IMAGO_COLOR}30`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${IMAGO_COLOR}30`
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <button
                onClick={adicionarMascara}
                disabled={!novaMascara.onde.trim() && !novaMascara.quando.trim() && !novaMascara.porque.trim()}
                className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: IMAGO_COLOR }}
              >
                + Adicionar mascara
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3 font-medium">Progresso:</p>
          <div className="flex items-center gap-3">
            {TABS.map(tab => {
              const isFilled = tab.key === 'essencia' ? essencia.trim()
                : tab.key === 'mascara' ? mascara.trim()
                : aspiracao.trim()

              return (
                <div key={tab.key} className="flex-1 text-center">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm mb-1 ${
                      isFilled ? 'text-white' : 'text-gray-400 border-2 border-gray-200'
                    }`}
                    style={isFilled ? { backgroundColor: IMAGO_COLOR } : undefined}
                  >
                    {isFilled ? '✓' : tab.icon}
                  </div>
                  <span className="text-xs text-gray-500">{tab.label}</span>
                </div>
              )
            })}
            <div className="flex-1 text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm mb-1 ${
                  todasPreenchidas && gaps.distancia.trim() && gaps.impedimentos.trim()
                    ? 'text-white'
                    : 'text-gray-400 border-2 border-gray-200'
                }`}
                style={
                  todasPreenchidas && gaps.distancia.trim() && gaps.impedimentos.trim()
                    ? { backgroundColor: IMAGO_COLOR }
                    : undefined
                }
              >
                {todasPreenchidas && gaps.distancia.trim() && gaps.impedimentos.trim() ? '✓' : '🔍'}
              </div>
              <span className="text-xs text-gray-500">Gaps</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={guardar}
          disabled={saving || (!essencia.trim() && !mascara.trim() && !aspiracao.trim())}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: IMAGO_COLOR }}
        >
          {saving ? 'A guardar...' : 'Guardar Reflexoes'}
        </button>

        {/* Save message */}
        {saveMsg && (
          <div className={`mt-3 text-center text-sm font-medium ${
            saveMsg.includes('Erro') ? 'text-red-500' : 'text-green-600'
          }`}>
            {saveMsg}
          </div>
        )}

        {/* Motivational note */}
        <p className="text-center text-xs text-gray-400 mt-4 px-4">
          {g(
            'O autoconhecimento e o caminho mais corajoso que podes percorrer.',
            'O autoconhecimento e o caminho mais corajoso que podes percorrer.'
          )}
        </p>
      </div>
    </div>
  )
}
